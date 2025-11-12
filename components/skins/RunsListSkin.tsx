// components/skins/RunsListSkin.tsx
"use client";
import React from "react";

export default function RunsListSkin({
  children,
  headerRight, // API compatibility
}: {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      {/* Header with subtle vertical gradient (brand to deeper tone) */}
      <div
        className="
          elev-1 isolate
          border border-[--border]
          rounded-2xl overflow-hidden
          bg-[linear-gradient(180deg,#283c63_0%,#22324a_100%)]
        "
        role="region"
        aria-label="My recent playbooks"
      >
        <div className="px-4 py-3 sm:px-5 sm:py-4">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
            My Recent Playbooks
          </h1>
        </div>
      </div>

      {/* Transparent body wrapper (no background) */}
      <div className="p-0">{children}</div>
    </section>
  );
}

