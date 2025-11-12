import React from "react";

export type TimelineItem = {
  id: string;
  title: string;
  by?: string;
  at: string;
  status?: "success" | "warning" | "error" | "neutral";
  body?: string;
};

function dotClasses(s?: TimelineItem["status"]) {
  return {
    success: "bg-[--primary]",
    warning: "bg-[--accent-2]",
    error: "bg-[--accent]",
    neutral: "bg-[--muted]",
    undefined: "bg-[--muted]",
  }[s ?? "neutral"];
}

export default function ActivityTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="rounded-2xl border border-[--border] bg-[--surface] p-5 sm:p-6 elev-1 stack-4">
      <ol className="relative ml-4">
        <div className="absolute left-[-1px] top-0 h-full w-px bg-[--border]" aria-hidden />
        {items.map((it) => (
          <li key={it.id} className="mb-6 last:mb-0 relative">
            <span className={`absolute -left-2 top-1.5 h-3 w-3 rounded-full ring-2 ring-[--surface] ${dotClasses(it.status)}`} />
            <div className="pl-4">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium">{it.title}</span>
                {it.by && <span className="text-xs text-[--muted]">by {it.by}</span>}
                <span className="text-xs text-[--muted]">· {it.at}</span>
              </div>
              {it.body && <p className="mt-1 text-sm text-[--muted]">{it.body}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

