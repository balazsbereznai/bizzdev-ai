"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRunAction } from "@/app/actions/runActions";

export default function RunQuickStart() {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      className="toolbar-btn"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await createRunAction("Quickstart run");
          // @ts-ignore
          const id = res?.run?.id as string | undefined;
          if (id) router.push(`/runs/${id}`);
        })
      }
    >
      {pending ? "Creating…" : "Create real run →"}
    </button>
  );
}

