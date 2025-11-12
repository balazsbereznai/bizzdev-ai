"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDocAction } from "@/app/actions/docActions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function DocsPanel({ runId }: { runId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string>("");
  const router = useRouter();
  const valid = useMemo(() => UUID.test(runId), [runId]);

  useEffect(() => setMsg(""), [runId]);

  return (
    <div className="flex flex-col gap-2">
      <button
        className="toolbar-btn disabled:opacity-60"
        disabled={pending || !valid}
        title={valid ? "Create a new doc" : "Create a run first"}
        onClick={() =>
          start(async () => {
            // Ask user; if canceled or blank, server will auto-name.
            const typed = typeof window !== "undefined"
              ? window.prompt("New doc title (leave blank for automatic naming):", "")
              : "";

            const res = await createDocAction(runId, (typed || undefined));
            if (res?.error) {
              setMsg(res.error);
              return;
            }
            router.refresh();
          })
        }
      >
        {pending ? "Creating…" : "New Doc"}
      </button>
      {msg && <span className="text-xs" style={{ color: "#b45309" }}>{msg}</span>}
      {!valid && <span className="text-xs opacity-70">Tip: create a real run first.</span>}
    </div>
  );
}

