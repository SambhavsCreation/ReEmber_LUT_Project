"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = (searchParams.get("email") || "").trim();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const isRegistered = searchParams.get("registered") === "1";
  const isConfirmed = searchParams.get("confirmed") === "1";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (payload?.code === "user_not_confirmed" && email.trim()) {
          setInfo("Account exists but is not confirmed. Continue to verification.");
          router.push(`/confirm-signup?email=${encodeURIComponent(email.trim())}`);
          return;
        }
        setError(payload.error || "Unable to sign in.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError("Network error while contacting auth endpoint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Sign In</h1>
      <p className="muted">
        Sign in using your registered email and password.
      </p>
      {isRegistered ? <p className="notice">Registration complete. Check your email for verification code if required.</p> : null}
      {isConfirmed ? <p className="notice">Account confirmed. You can sign in now.</p> : null}
      <div className="spacer" />
      <input
        type="email"
        name="email"
        value={email || prefilledEmail}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />
      <div className="spacer" />
      <input
        type="password"
        name="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        required
      />
      <div className="spacer" />
      <div className="row between">
        <button disabled={loading || !email.trim() || !password} type="submit">
          {loading ? "Signing In..." : "Sign In"}
        </button>
        <Link href="/register" className="link">
          Create Account
        </Link>
      </div>
      <div className="spacer" />
      {info ? <div className="notice">{info}</div> : null}
      {error ? <div className="error">{error}</div> : null}
    </form>
  );
}
