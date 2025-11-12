// components/doc/DocActionsBar.tsx
"use client";
import React from "react";

export default function DocActionsBar({
  onRegenerate,
  onExportPdf,
  right,
}: {
  onRegenerate?: () => void;
  onExportPdf?: () => void;
  right?: React.ReactNode; // e.g. status chip
}) {
  return (
    <div
      className="
        sticky top-[calc(var(--topbar-h)+8px)] z-40 glass
        bg-white/80 border border-[--color-border] rounded-[--radius-lg] elev-0
      "
      role="region"
      aria-label="Document actions"
    >
      <div className="mx-auto max-w-[var(--content-max)] container-px py-2.5">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onRegenerate} className="btn btn-subtle">Regenerate</button>
            <button onClick={onExportPdf} className="btn btn-primary">Export PDF</button>
          </div>
          <div className="flex items-center gap-2">
            {right ?? <span className="chip">Playbook</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

