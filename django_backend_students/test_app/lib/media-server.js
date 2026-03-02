import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";

function getAuthHeader() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function requestBackendJson(url, options = {}) {
  const method = options.method || "GET";
  const headers = {
    ...(options.headers || {}),
    ...getAuthHeader()
  };

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body,
      cache: "no-store"
    });
  } catch (_error) {
    return {
      ok: false,
      status: 502,
      payload: { error: "Could not reach backend media endpoint." }
    };
  }

  const payload = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    payload
  };
}

export function getUploadedFileFromForm(formData, fieldName = "file") {
  const candidate = formData.get(fieldName);
  if (!candidate || typeof candidate === "string") {
    return null;
  }
  if (typeof candidate.arrayBuffer !== "function") {
    return null;
  }
  return candidate;
}
