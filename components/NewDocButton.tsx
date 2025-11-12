"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewDocButton({ runId }: { runId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/runs/${runId}/docs`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ title: "New Document" }),
          });
          const data = await res.json();
          if (!res.ok || data?.error) {
            alert(data?.error ?? "Failed to create doc");
            setLoading(false);
            return;
          }
          router.push(`/runs/${runId}/docs/${data.doc.id}`);
        } catch (e: any) {
          alert(e?.message ?? "Failed to create doc");
          setLoading(false);
        }
      }}
      className="toolbar-btn bg-[--primary] text-white/95"
      disabled={loading}
    >
      {loading ? "Creating…" : "New Doc"}
    </button>
  );
}

