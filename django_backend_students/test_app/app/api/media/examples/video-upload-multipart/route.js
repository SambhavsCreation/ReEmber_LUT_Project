import { NextResponse } from "next/server";
import {
  getMediaVideoFetchUrl,
  getMediaVideoMultipartAbortUrl,
  getMediaVideoMultipartCompleteUrl,
  getMediaVideoMultipartInitUrl,
  getMediaVideoMultipartPartUrl
} from "../../../../../lib/backend";
import {
  getUploadedFileFromForm,
  requestBackendJson
} from "../../../../../lib/media-server";

export const runtime = "nodejs";

const MIN_PART_SIZE_BYTES = 5 * 1024 * 1024;

async function abortUpload(path, uploadId) {
  if (!path || !uploadId) {
    return;
  }
  await requestBackendJson(getMediaVideoMultipartAbortUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path,
      upload_id: uploadId
    })
  });
}

export async function POST(request) {
  let formData;
  try {
    formData = await request.formData();
  } catch (_error) {
    return NextResponse.json(
      { error: "Expected multipart/form-data body." },
      { status: 400 }
    );
  }

  const file = getUploadedFileFromForm(formData);
  const path = String(formData.get("path") || "").trim();
  const requestedContentType = String(formData.get("content_type") || "").trim();
  const rawPartSizeMb = Number(formData.get("part_size_mb") || 8);

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const safePartSizeMb = Number.isFinite(rawPartSizeMb)
    ? Math.max(5, Math.min(128, Math.floor(rawPartSizeMb)))
    : 8;
  const partSizeBytes = Math.max(
    MIN_PART_SIZE_BYTES,
    safePartSizeMb * 1024 * 1024
  );

  const contentType = requestedContentType || file.type || "video/mp4";
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) {
    return NextResponse.json({ error: "file is empty" }, { status: 400 });
  }

  const init = await requestBackendJson(getMediaVideoMultipartInitUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path,
      content_type: contentType,
      file_size_bytes: bytes.length,
      part_size_bytes: partSizeBytes
    })
  });
  if (!init.ok) {
    return NextResponse.json(init.payload, { status: init.status });
  }

  const uploadId = String(init.payload?.upload_id || "").trim();
  const key = String(init.payload?.key || path).trim();
  if (!uploadId || !key) {
    return NextResponse.json(
      { error: "Backend multipart init returned incomplete payload." },
      { status: 502 }
    );
  }

  const completedParts = [];
  const totalParts = Math.ceil(bytes.length / partSizeBytes);
  for (let i = 0; i < totalParts; i += 1) {
    const partNumber = i + 1;
    const partStart = i * partSizeBytes;
    const partEnd = Math.min(partStart + partSizeBytes, bytes.length);
    const chunk = bytes.subarray(partStart, partEnd);

    const partUrlResult = await requestBackendJson(getMediaVideoMultipartPartUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: key,
        upload_id: uploadId,
        part_number: partNumber
      })
    });
    if (!partUrlResult.ok) {
      await abortUpload(key, uploadId);
      return NextResponse.json(
        {
          error: "Failed to create part upload URL.",
          failed_part: partNumber,
          detail: partUrlResult.payload
        },
        { status: partUrlResult.status }
      );
    }

    const uploadUrl = String(partUrlResult.payload?.upload_url || "").trim();
    if (!uploadUrl) {
      await abortUpload(key, uploadId);
      return NextResponse.json(
        {
          error: "Multipart part URL response missing upload_url.",
          failed_part: partNumber
        },
        { status: 502 }
      );
    }

    let putResponse;
    try {
      putResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: chunk
      });
    } catch (_error) {
      await abortUpload(key, uploadId);
      return NextResponse.json(
        {
          error: "Failed to upload multipart chunk.",
          failed_part: partNumber
        },
        { status: 502 }
      );
    }

    if (!putResponse.ok) {
      const detail = await putResponse.text().catch(() => "");
      await abortUpload(key, uploadId);
      return NextResponse.json(
        {
          error: "Multipart chunk upload failed.",
          failed_part: partNumber,
          detail: detail || null
        },
        { status: 502 }
      );
    }

    const etag = putResponse.headers.get("etag");
    if (!etag) {
      await abortUpload(key, uploadId);
      return NextResponse.json(
        {
          error: "Multipart upload missing ETag response header.",
          failed_part: partNumber
        },
        { status: 502 }
      );
    }

    completedParts.push({
      part_number: partNumber,
      etag
    });
  }

  const completed = await requestBackendJson(getMediaVideoMultipartCompleteUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: key,
      upload_id: uploadId,
      parts: completedParts
    })
  });
  if (!completed.ok) {
    return NextResponse.json(completed.payload, { status: completed.status });
  }

  let fetchUrl = completed.payload?.fetch_url || null;
  if (!fetchUrl) {
    const fetchResult = await requestBackendJson(
      `${getMediaVideoFetchUrl()}?path=${encodeURIComponent(key)}`,
      { method: "GET" }
    );
    if (fetchResult.ok) {
      fetchUrl = fetchResult.payload?.fetch_url || null;
    }
  }

  return NextResponse.json(
    {
      ok: true,
      key,
      upload_id: uploadId,
      parts_uploaded: completedParts.length,
      part_size_bytes: partSizeBytes,
      fetch_url: fetchUrl,
      complete: completed.payload
    },
    { status: 200 }
  );
}
