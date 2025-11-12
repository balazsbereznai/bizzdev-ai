// components/shell/AppShell.tsx
"use client";

import React from "react";
import ThemeProvider from "@/components/theme/ThemeProvider";

type AppShellProps = {
  header?: React.ReactNode;
  children: React.ReactNode;
  theme?: "deep" | "slate"; // NEW
};

export default function AppShell({ header, children, theme = "deep" }: AppShellProps) {
  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
        {/* Sticky header */}
        <header className="sticky top-0 z-40 border-b border-[var(--border)]/60 bg-[var(--panel)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--panel)]/60">
          <div className="mx-auto max-w-screen-2xl px-4 py-3">
            {header}
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-screen-2xl px-4 py-6">
          {children}
        </main>

        {/* Toast mount point */}
        <div id="toast-root" className="fixed inset-x-0 top-3 z-[60] flex justify-end px-4 pointer-events-none" />
      </div>
    </ThemeProvider>
  );
}

