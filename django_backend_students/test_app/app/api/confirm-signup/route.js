import { NextResponse } from "next/server";
import { getAuthConfirmSignUpUrl } from "../../../lib/backend";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch (_error) {
    body = {};
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const code = String(body?.code || "").trim();
  if (!email || !code) {
    return NextResponse.json(
      { error: "Email and confirmation code are required." },
      { status: 400 }
    );
  }

  let backendResponse;
  try {
    backendResponse = await fetch(getAuthConfirmSignUpUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, code }),
      cache: "no-store"
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Could not reach backend confirmation endpoint." },
      { status: 502 }
    );
  }

  const payload = await backendResponse.json().catch(() => ({}));
  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        error: payload?.error || "Confirmation failed.",
        code: payload?.code || null
      },
      { status: backendResponse.status }
    );
  }

  return NextResponse.json(payload, { status: 200 });
}
