"use client";

import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  right?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, meta, right }: Props) {
  return (
    <section className="elev-0 glass">
      <div className="header-shell px-4 sm:px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs text-[--muted] mb-2">Workspace · Document</div>
            <h1 className="text-[length:var(--fs-1)] font-semibold tracking-tight truncate">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-[--muted]">{subtitle}</p>}
            {meta && <div className="mt-3 flex flex-wrap gap-2">{meta}</div>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      </div>
      <div className="header-underline mx-4 sm:mx-6" />
    </section>
  );
}

