"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WynergyDebugPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/debug/wynergy", { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("Failed: " + (err?.details || "Unknown error"));
      return;
    }

    const { nextUrl } = await res.json();
    router.push(nextUrl); // goes to /runs/:runId/docs/:docId
  }

  return (
    <div className="mx-auto max-w-xl container-px py-10 space-y-4">
      <h1 className="text-2xl font-semibold">E2E Test — Zynio × AI1Q × Wynergy</h1>
      <p className="text-[--muted-foreground]">
        One-click test that uses your existing OpenAI generator and normal Run → Doc → Editor → PDF flow.
      </p>
      <button className="btn" onClick={handleClick} disabled={loading}>
        {loading ? "Creating & Generating…" : "Create preset run & generate via OpenAI"}
      </button>
    </div>
  );
}

