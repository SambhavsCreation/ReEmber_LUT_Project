"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error || "Registration failed.");
        return;
      }

      const encodedEmail = encodeURIComponent(email.trim());
      if (payload?.next_step === "confirm_sign_up") {
        router.push(`/confirm-signup?email=${encodedEmail}`);
        return;
      }

      router.push(`/login?registered=1&email=${encodedEmail}`);
    } catch (_error) {
      setError("Network error while creating account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Create Account</h1>
      <p className="muted">
        Register with email/password. A verification code may be required depending on your Cognito user pool settings.
      </p>

      <div className="spacer" />
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Full name (optional)"
      />
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
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        required
      />
      <div className="spacer" />
      <input
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Confirm password"
        required
      />
      <div className="spacer" />

      <div className="row between">
        <button type="submit" disabled={loading || !email.trim() || !password || !confirmPassword}>
          {loading ? "Creating..." : "Create Account"}
        </button>
        <Link href="/login" className="link">
          Back to Login
        </Link>
      </div>

      <div className="spacer" />
      {error ? <div className="error">{error}</div> : null}
    </form>
  );
}
