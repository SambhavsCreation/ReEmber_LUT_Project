import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "../components/logout-button";
import { getAuthMeUrl, getBackendBaseUrl } from "../../lib/backend";

async function fetchCurrentUser(token) {
  const response = await fetch(getAuthMeUrl(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });
  if (!response.ok) {
    return null;
  }
  const payload = await response.json().catch(() => null);
  if (!payload || !payload.user) {
    return null;
  }
  return payload.user;
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    redirect("/login");
  }

  const user = await fetchCurrentUser(token);
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell">
      <div className="card">
        <div className="row between">
          <h1>Dashboard</h1>
          <LogoutButton />
        </div>
        <p className="muted">
          You are authenticated via backend token verification.
        </p>
        <div className="spacer" />
        <p>
          <strong>Backend:</strong> {getBackendBaseUrl()}
        </p>
        <div className="spacer" />
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </main>
  );
}
