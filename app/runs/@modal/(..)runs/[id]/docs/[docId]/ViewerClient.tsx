'use client';

import * as React from 'react';

type Props = {
  runId: string;
  docId: string;
  pdfHref: string;
};

export default function ViewerClient({ runId, docId, pdfHref }: Props) {
  const [busy, setBusy] = React.useState<'regen' | 'pdf' | null>(null);

  const onRegenerate = async () => {
    try {
      setBusy('regen');
      const res = await fetch(`/api/docs/${docId}/regenerate`, { method: 'POST' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || `Regenerate failed (${res.status})`);
      }
    } finally {
      setBusy(null);
    }
  };

  const onExportPdf = async () => {
    try {
      setBusy('pdf');
      const res = await fetch(pdfHref);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || 'PDF generation failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'playbook.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="text-xs uppercase tracking-wide text-[--muted-foreground]">
        Workspace <span className="opacity-60">· Doc tools</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRegenerate}
          disabled={busy !== null}
          className="toolbar-btn bg-[--primary] text-white/95"
        >
          {busy === 'regen' ? 'Regenerating…' : 'Regenerate'}
        </button>
        <button
          onClick={onExportPdf}
          disabled={busy !== null}
          className="toolbar-btn"
        >
          {busy === 'pdf' ? 'Preparing…' : 'Export PDF'}
        </button>
      </div>
    </div>
  );
}

