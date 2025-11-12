// components/ui/EmptyState.tsx
"use client";
import React from "react";

export default function EmptyState({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode; // e.g. <button className="btn btn-primary">Add item</button>
}) {
  return (
    <div className="card">
      <div className="card-body py-10 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <div className="text-lg font-medium">{title}</div>
          {desc ? <div className="text-[--color-ink-3]">{desc}</div> : null}
          {action ? <div className="pt-2">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

