import { NextResponse } from "next/server";
import { getAuthRegisterUrl } from "../../../lib/backend";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch (_error) {
    body = {};
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const name = String(body?.name || "").trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  let backendResponse;
  try {
    backendResponse = await fetch(getAuthRegisterUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, name }),
      cache: "no-store"
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Could not reach backend registration endpoint." },
      { status: 502 }
    );
  }

  const payload = await backendResponse.json().catch(() => ({}));
  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        error: payload?.error || "Registration failed.",
        code: payload?.code || null
      },
      { status: backendResponse.status }
    );
  }

  return NextResponse.json(payload, { status: 200 });
}
