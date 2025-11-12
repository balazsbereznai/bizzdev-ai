// components/ModalDeleteAction.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase-browser";

type Props = {
  table: string;
  id: string;
  label?: string;
  afterHref?: string;
  className?: string;
  confirmText?: string;
};

const baseBtn =
  "inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm " +
  "bg-[#dbc078] border border-white/10 shadow-[--shadow-0] " +
  "hover:-translate-y-[1px] hover:shadow-[--shadow-1] active:translate-y-[0.5px] transition";

export default function ModalDeleteAction({
  table,
  id,
  label = "Delete",
  afterHref = "/dashboard/hub",
  className,
  confirmText = "Are you sure you want to delete this item?",
}: Props) {
  const supabase = createClient();
  const [busy, setBusy] = React.useState(false);

  async function onDelete() {
    if (busy) return;
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      window.location.assign(afterHref);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      aria-disabled={busy}
      className={`${baseBtn} ${className ?? ""}`}
      aria-label={label}
    >
      {busy ? "Deleting…" : label}
    </button>
  );
}

