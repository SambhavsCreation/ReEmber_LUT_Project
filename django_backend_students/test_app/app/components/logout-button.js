"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/logout", {
        method: "POST"
      });
    } finally {
      router.push("/login");
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <button className="secondary" onClick={handleLogout} disabled={loading} type="button">
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
