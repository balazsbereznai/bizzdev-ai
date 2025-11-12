import React from "react";

type Props = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
};

export default function EmptyState({ title, description, action, secondary }: Props) {
  return (
    <div className="rounded-2xl border border-[--border] bg-[--surface] p-8 text-center elev-1">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-[--border] bg-[color:var(--surface)/.6]">
        {/* soft tokenized glyph */}
        <span className="text-lg" aria-hidden>🗂️</span>
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[--muted]">{description}</p>
      )}

      <div className="mt-5 flex items-center justify-center gap-2">
        {action && (
          <button
            onClick={action.onClick}
            className="h-9 px-3 rounded-xl bg-[--primary] text-white/95 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
          >
            {action.label}
          </button>
        )}
        {secondary && (
          <button
            onClick={secondary.onClick}
            className="h-9 px-3 rounded-xl border border-[--border] bg-[--surface] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
          >
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}

