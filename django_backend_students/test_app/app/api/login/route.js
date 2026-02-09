import { NextResponse } from "next/server";
import {
  getAuthVerifyUrl,
  getAuthLoginUrl
} from "../../../lib/backend";

const COOKIE_NAME = "auth_token";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch (_error) {
    body = {};
  }

  const rawToken = String(body?.token || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  let token = rawToken;

  if (!token) {
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    let loginResponse;
    try {
      loginResponse = await fetch(getAuthLoginUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store"
      });
    } catch (_error) {
      return NextResponse.json(
        { error: "Could not reach backend login endpoint." },
        { status: 502 }
      );
    }

    const loginPayload = await loginResponse.json().catch(() => ({}));
    if (!loginResponse.ok) {
      return NextResponse.json(
        {
          error: loginPayload?.error || "Login failed.",
          code: loginPayload?.code || null
        },
        { status: loginResponse.status }
      );
    }

    token = String(loginPayload?.id_token || loginPayload?.access_token || "").trim();
    if (!token) {
      return NextResponse.json(
        { error: "Backend login succeeded but no token was returned." },
        { status: 502 }
      );
    }
  }

  let verifyResponse;
  try {
    verifyResponse = await fetch(getAuthVerifyUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Could not reach backend auth service." },
      { status: 502 }
    );
  }

  const verifyPayload = await verifyResponse.json().catch(() => ({}));
  if (!verifyResponse.ok || !verifyPayload?.valid) {
    return NextResponse.json(
      { error: verifyPayload?.error || "Invalid token." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    claims: verifyPayload?.claims || null
  });
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24
  });

  return response;
}
