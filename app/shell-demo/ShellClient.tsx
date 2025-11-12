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
        <UtilityBar onRegenerate={onRegenerate} onExportPdf={onExportPdf} />

        <section className="mx-auto max-w-[var(--content-max)] px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-semibold mb-4">Shell Demo</h1>
          <p className="text-[--muted] mb-6">
            Scroll to verify sticky Utility Bar and fixed Topbar don’t overlap.
          </p>

          <div className="space-y-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[--border] bg-[--surface] p-6 elev-1"
              >
                <h2 className="font-medium mb-2">Card {i + 1}</h2>
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

