import { NextResponse } from "next/server";
import {
  getMediaVideoFetchUrl,
  getMediaVideoUploadUrl
} from "../../../../../lib/backend";
import {
  getUploadedFileFromForm,
  requestBackendJson
} from "../../../../../lib/media-server";

export const runtime = "nodejs";

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

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const contentType = requestedContentType || file.type || "video/mp4";
  const init = await requestBackendJson(getMediaVideoUploadUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path,
      content_type: contentType
    })
  });
  if (!init.ok) {
    return NextResponse.json(init.payload, { status: init.status });
  }

  const uploadUrl = String(init.payload?.upload_url || "").trim();
  const key = String(init.payload?.key || path).trim();
  if (!uploadUrl) {
    return NextResponse.json(
      { error: "Backend did not return upload_url." },
      { status: 502 }
    );
  }

  let putResponse;
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    putResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType
      },
      body: bytes
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed while uploading bytes to signed URL." },
      { status: 502 }
    );
  }

  if (!putResponse.ok) {
    const detail = await putResponse.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Signed URL upload failed.",
        detail: detail || null
      },
      { status: 502 }
    );
  }

  const fetchResult = await requestBackendJson(
    `${getMediaVideoFetchUrl()}?path=${encodeURIComponent(key)}`,
    { method: "GET" }
  );

  return NextResponse.json(
    {
      ok: true,
      key,
      bucket: init.payload?.bucket || null,
      etag: putResponse.headers.get("etag") || null,
      fetch_url: fetchResult.payload?.fetch_url || null,
      upload: init.payload
    },
    { status: 200 }
  );
}
