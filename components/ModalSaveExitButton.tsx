// components/ModalSaveExitButton.tsx
"use client";

import * as React from "react";

type Props = {
  label?: string;
  onDoneHref?: string; // (prev: `to`) — hard navigate target after save
  className?: string;
  waitMs?: number; // max wait for bd:saved before redirect
};

const brandBtn =
  "inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm " +
  "bg-[#dbc078] text-[#0b1220] border border-white/10 shadow-[--shadow-0] " +
  "hover:-translate-y-[1px] hover:shadow-[--shadow-1] active:translate-y-[0.5px] transition";

export default function ModalSaveExitButton({
  label = "Save & Exit",
  onDoneHref = "/dashboard/hub",
  className,
  waitMs = 1500,
}: Props) {
  const onClick = async () => {
    // Tell the inner editor to save.
    window.dispatchEvent(new CustomEvent("bd:save-exit"));

    // Wait for acks (the editor will dispatch 'bd:saved' when done).
    const result = await new Promise<"saved" | "timeout">((resolve) => {
      const handler = () => {
        window.removeEventListener("bd:saved", handler as any);
        resolve("saved");
      };
      window.addEventListener("bd:saved", handler as any, { once: true });

      setTimeout(() => resolve("timeout"), waitMs);
    });

    // Always hard-nav to ensure modal tears down & Hub refreshes.
    window.location.assign(onDoneHref);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${brandBtn} ${className ?? ""}`}
      aria-label={label}
    >
      {label}
    </button>
  );
}

