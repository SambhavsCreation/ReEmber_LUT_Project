"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ConfirmSignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = (searchParams.get("email") || "").trim();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleConfirm(event) {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const response = await fetch("/api/confirm-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error || "Could not verify code.");
        return;
      }
      router.push(`/login?confirmed=1&email=${encodeURIComponent(email.trim())}`);
    } catch (_error) {
      setError("Network error while confirming account.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError("");
    setInfo("");
    setResending(true);
    try {
      const response = await fetch("/api/resend-signup-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error || "Could not resend code.");
        return;
      }
      setInfo("Verification code resent.");
    } catch (_error) {
      setError("Network error while resending code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form className="card" onSubmit={handleConfirm}>
      <h1>Verify Account</h1>
      <p className="muted">
        Enter the code sent to your email to complete registration.
      </p>
      <div className="spacer" />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />
      <div className="spacer" />
      <input
        type="text"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="Confirmation code"
        required
      />
      <div className="spacer" />
      <div className="row between">
        <button type="submit" disabled={loading || !email.trim() || !code.trim()}>
          {loading ? "Verifying..." : "Verify"}
        </button>
        <button
          className="secondary"
          type="button"
          disabled={resending || !email.trim()}
          onClick={handleResendCode}
        >
          {resending ? "Resending..." : "Resend Code"}
        </button>
      </div>
      <div className="spacer" />
      <div className="row between">
        <Link href="/login" className="link">Back to Login</Link>
        <Link href="/register" className="link">Create New Account</Link>
      </div>
      <div className="spacer" />
      {info ? <div className="notice">{info}</div> : null}
      {error ? <div className="error">{error}</div> : null}
    </form>
  );
}
