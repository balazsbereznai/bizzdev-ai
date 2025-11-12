"use client";
import { useState, useTransition } from "react";
import { createRunAction, getRunByIdAction } from "@/app/actions/runActions";

export default function RunTester({ id }: { id: string }) {
  const [out, setOut] = useState<string>("");
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      <button
        className="toolbar-btn"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await createRunAction("UI test run");
            setOut(JSON.stringify(res, null, 2));
          })
        }
      >
        {pending ? "Creating…" : "Create Run (server action)"}
      </button>

      <button
        className="toolbar-btn"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await getRunByIdAction(id);
            setOut(JSON.stringify(res, null, 2));
          })
        }
      >
        {pending ? "Fetching…" : `Fetch This Run (${id})`}
      </button>

      <pre className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs overflow-auto max-h-72">
{out || "No output yet."}
      </pre>
    </div>
  );
}

