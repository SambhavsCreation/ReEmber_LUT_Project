import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthMeUrl } from "../../../lib/backend";

const COOKIE_NAME = "auth_token";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let response;
  try {
    response = await fetch(getAuthMeUrl(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });
  } catch (_error) {
    return NextResponse.json(
      { authenticated: false, error: "Backend unavailable." },
      { status: 502 }
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const out = NextResponse.json(
      { authenticated: false, error: payload?.error || "Session invalid." },
      { status: 401 }
    );
    out.cookies.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0
    });
    return out;
  }

  return NextResponse.json({
    authenticated: true,
    user: payload?.user || null
  });
}
