import { NextResponse } from "next/server";
import { getAuthResendCodeUrl } from "../../../lib/backend";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch (_error) {
    body = {};
  }

  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 }
    );
  }

  let backendResponse;
  try {
    backendResponse = await fetch(getAuthResendCodeUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email }),
      cache: "no-store"
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Could not reach backend resend-code endpoint." },
      { status: 502 }
    );
  }

  const payload = await backendResponse.json().catch(() => ({}));
  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        error: payload?.error || "Could not resend code.",
        code: payload?.code || null
      },
      { status: backendResponse.status }
    );
  }

  return NextResponse.json(payload, { status: 200 });
}
