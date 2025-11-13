// app/shell-demo/ShellClient.tsx
"use client";

import Topbar from "@/components/Topbar";
import UtilityBar from "@/components/UtilityBar";

export default function ShellClient() {
  const onRegenerate = () => {
    console.log("Regenerate clicked");
  };

  const onExportPdf = () => {
    console.log("Export PDF clicked");
  };

  return (
    <>
      <Topbar />
      <main className="pt-[var(--topbar-h)]">
        <UtilityBar
          left={
            <span className="section-chip">
              Demo
            </span>
          }
          right={
            <>
              <button
                type="button"
                onClick={onRegenerate}
                className="toolbar-btn"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={onExportPdf}
                className="toolbar-btn"
              >
                Export PDF
              </button>
            </>
          }
        />

        <section className="mx-auto max-w-[var(--content-max)] px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="mb-4 text-xl font-semibold">Shell Demo</h1>
          <p className="mb-6 text-[--muted]">
            Scroll to verify sticky Utility Bar and fixed Topbar don’t overlap.
          </p>

          <div className="space-y-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="elev-1 rounded-2xl border border-[--border] bg-[--surface] p-6"
              >
                <h2 className="mb-2 font-medium">Card {i + 1}</h2>
                <p className="text-[--muted]">
                  This is a sample block to test long scroll behavior with sticky bars.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

