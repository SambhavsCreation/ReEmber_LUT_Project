import { NextResponse } from "next/server";
import { getMediaVideoFetchUrl } from "../../../../../lib/backend";
import { requestBackendJson } from "../../../../../lib/media-server";

export const runtime = "nodejs";

export async function GET(request) {
  const path = String(request.nextUrl.searchParams.get("path") || "").trim();
  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const backendUrl = `${getMediaVideoFetchUrl()}?path=${encodeURIComponent(path)}`;
  const result = await requestBackendJson(backendUrl, { method: "GET" });
  return NextResponse.json(result.payload, { status: result.status });
}
