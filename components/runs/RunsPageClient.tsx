// components/runs/RunsPageClient.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type RunWithDocs = {
  id: string;
  meta?: any;
  docs?: any[];
};

export default function RunsPageClient({ runs }: { runs: RunWithDocs[] }) {
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const items = useMemo(() => {
    const all =
      runs
        .flatMap((run: any) =>
          (run.docs ?? []).map((doc: any) => ({ run, doc }))
        )
        .sort((a: any, b: any) =>
          sortDesc
            ? new Date(b.doc.created_at).getTime() -
              new Date(a.doc.created_at).getTime()
            : new Date(a.doc.created_at).getTime() -
              new Date(b.doc.created_at).getTime()
        ) ?? [];

    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(({ doc }: any) => {
      const title = buildPlaybookTitle(doc.meta, doc.title);
      return title.toLowerCase().includes(q);
    });
  }, [runs, query, sortDesc]);

  return (
    <div className="space-y-4">
      {/* --- Search & Sort Bar --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input
          type="text"
          placeholder="Search playbooks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            input w-full sm:max-w-sm
            rounded-2xl
            border-white/20 bg-[color:var(--surface)/.4]
            focus-visible:ring-2 focus-visible:ring-[--color-primary]
            transition-all duration-150
          "
          aria-label="Search playbooks"
        />
        <button
          onClick={() => setSortDesc((p) => !p)}
          className="
            btn-subtle px-4 py-2
            rounded-2xl border border-white/20
            text-sm
            hover:elev-1 hover:-translate-y-[1px]
            focus-visible:ring-2 focus-visible:ring-[--color-primary]
            transition-all duration-150
          "
          aria-label="Toggle sort order"
        >
          Sort: {sortDesc ? "Newest first" : "Oldest first"}
        </button>
      </div>

      {/* --- Main List --- */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-[--border] bg-[--surface] p-4 text-sm text-[--muted-foreground]">
          No playbooks found. Go to the{" "}
          <Link className="link" href="/dashboard/hub">
            Hub
          </Link>{" "}
          to generate a playbook.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(({ run, doc }: any) => {
            const href = `/runs/${run.id}/docs/${doc.id}`;
            const title = buildPlaybookTitle(doc.meta, doc.title);
            const timestamp = new Date(doc.created_at).toLocaleString();

            const ui = run?.meta?.ui ?? {};
            const badges = buildUiBadges(ui);

            return (
              <li key={doc.id}>
                <Link
                  href={href}
                  className="
                    group block transition-all
                    rounded-2xl overflow-hidden
                    border border-[--border]
                    glass
                    bg-[color:var(--color-bg)/.45]
                    px-4 py-3 sm:px-5 sm:py-4
                    hover:-translate-y-[1px] hover:elev-1
                    focus-visible:ring-2 focus-visible:ring-[--color-primary]
                  "
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="truncate font-medium text-[--color-ink] group-hover:text-[--color-primary] transition-colors">
                      {title}
                    </div>
                    <div className="text-xs text-[--muted-foreground]">
                      {timestamp}
                    </div>

                    {badges.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                          <span
                            key={b}
                            className="
                              inline-flex items-center rounded-full
                              border border-white/18
                              bg-[color:var(--surface)/.9]
                              px-2.5 py-0.5
                              text-[11px] font-medium
                              text-[--color-ink-3]
                            "
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* -------------------------- helpers -------------------------- */

function buildPlaybookTitle(meta: any, fallbackTitle?: string) {
  try {
    const company = meta?.company_snapshot?.name;
    const product = meta?.product_snapshot?.name;
    const icp = meta?.icp_snapshot?.name;
    if (company && product && icp) {
      return `${company} ▸ ${product} ▸ ${icp} Sales Playbook`;
    }
    return fallbackTitle || "Sales Playbook";
  } catch {
    return fallbackTitle || "Sales Playbook";
  }
}

// Map internal codes from runs.meta.ui back to human labels
function buildUiBadges(ui: any): string[] {
  if (!ui || typeof ui !== "object") return [];

  const toneLabel = prettyTone(ui.tone);
  const experienceLabel = prettyExperience(ui.experience);
  const motionLabel = prettyMotion(ui.motion);
  const langLabel = prettyLanguage(ui.outputLanguage);

  return [langLabel, toneLabel, experienceLabel, motionLabel].filter(
    Boolean
  ) as string[];
}

function prettyTone(code?: string | null): string | null {
  if (!code || code === "default") return null;
  switch (code) {
    case "formal":
      return "Tone: Professional";
    case "trusted_advisor":
      return "Tone: Consultative";
    case "challenger":
      return "Tone: Challenger";
    case "friendly_expert":
      return "Tone: Storytelling";
    default:
      return null;
  }
}

function prettyExperience(code?: string | null): string | null {
  if (!code || code === "default") return "Experience: Experienced";
  if (code === "unexperienced") return "Experience: Unexperienced";
  return null;
}

function prettyMotion(motion?: string | null): string | null {
  if (!motion) return null;
  // Stored as UI labels already (Inbound, Outbound, etc.)
  return `Motion: ${motion}`;
}

function prettyLanguage(code?: string | null): string | null {
  if (!code || code === "auto") return "Language: Auto";
  switch (code) {
    case "en":
      return "Language: English";
    case "hu":
      return "Language: Hungarian";
    case "de":
      return "Language: German";
    case "fr":
      return "Language: French";
    case "es":
      return "Language: Spanish";
    case "it":
      return "Language: Italian";
    default:
      return `Language: ${code.toUpperCase()}`;
  }
}

