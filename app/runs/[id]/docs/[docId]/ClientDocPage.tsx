// app/runs/[id]/docs/[docId]/ClientDocPage.tsx
"use client";

import React from "react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import UtilityBar from "@/components/UtilityBar";
import ActivityTimeline, { TimelineItem } from "@/components/blocks/ActivityTimeline";
import EmptyState from "@/components/blocks/EmptyState";
import PageHeader from "@/components/blocks/PageHeader";
import { exportDocPdf } from "@/lib/client/exportDocPdf";

type Props = {
  runId: string;
  docId: string;
  initial: {
    title?: string | null;
    html?: string | null;
    markdown?: string | null;
  };
};

export default function ClientDocPage({ runId, docId, initial }: Props) {
  const [busy, setBusy] = React.useState<"regen" | "pdf" | null>(null);

  const onRegenerate = async () => {
    try {
      setBusy("regen");
      const t = toast.loading("Regenerating…");
      const res = await fetch(`/api/runs/${runId}/docs/${docId}/regenerate`, { method: "POST" });
      if (!res.ok) throw new Error(`Regenerate failed (${res.status})`);
      toast.success("Regenerated", { id: t });
    } catch (e: any) {
      toast.info("Wire your regenerate handler to enable this.", {
        description: String(e?.message ?? ""),
      });
    } finally {
      setBusy(null);
    }
  };

  const onExportPdf = async () => {
    try {
      setBusy("pdf");
      const t = toast.loading("Preparing PDF…");
      await exportDocPdf(docId);
      toast.success("Downloaded PDF", { id: t });
    } catch (e: any) {
      toast.error("Export failed", { description: String(e?.message ?? "") });
    } finally {
      setBusy(null);
    }
  };

  const items: TimelineItem[] = [
    { id: "1", title: "Exported PDF", by: "You", at: "2m ago", status: "success" },
    {
      id: "2",
      title: "Regenerated Playbook",
      by: "You",
      at: "15m ago",
      status: "warning",
      body: "Tweaked positioning + discovery prompts.",
    },
    { id: "3", title: "Created Document", by: "System", at: "Yesterday", status: "neutral" },
  ];

  const hasContent = Boolean(initial.html || initial.markdown);

  return (
    <AppShell
      utilityBar={
        <UtilityBar
          onRegenerate={busy ? undefined : onRegenerate}
          onExportPdf={busy ? undefined : onExportPdf}
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 stack-6">
          <PageHeader
            title={initial.title ?? "Document"}
            subtitle="Refine with Regenerate, then export as PDF."
            meta={
              <>
                <span className="token-chip">Draft</span>
                <span className="token-chip">AA contrast</span>
              </>
            }
          />

          {busy && (
            <p className="mt-1 text-xs text-[--muted]">…working</p>
          )}

          {hasContent ? (
            initial.html ? (
              <div
                className="mt-4 rounded-2xl border border-[--border] bg-[--surface] p-6 elev-1 stack-4"
                dangerouslySetInnerHTML={{ __html: initial.html }}
              />
            ) : (
              <pre className="mt-4 rounded-2xl border border-[--border] bg-[--surface] p-6 elev-1 whitespace-pre-wrap">
                {initial.markdown}
              </pre>
            )
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No content yet"
                description="Generate your first draft to populate this document. You can refine and export anytime."
                action={{
                  label: busy === "regen" ? "Working…" : "Generate Draft",
                  onClick: onRegenerate,
                }}
                secondary={{
                  label: busy === "pdf" ? "Preparing…" : "Export PDF",
                  onClick: onExportPdf,
                }}
              />
            </div>
          )}
        </div>

        <aside className="lg:col-span-1 stack-6">
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="section-title">Activity</h3>
            </div>
            <ActivityTimeline items={items} />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

