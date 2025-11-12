'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { createPortal } from 'react-dom';
import BrandButton from '@/components/ui/BrandButton';
import dynamic from 'next/dynamic';

const MarkdownPreview = dynamic(() => import('@/components/MarkdownPreview'), { ssr: false });

type Props = {
  runId: string;
  docId: string;
  titleFallback?: string;
};

export default function PlaybookModalClient({ runId, docId }: Props) {
  const [pending, start] = useTransition();
  const [title, setTitle] = React.useState<string | null>(null);
  const [markdown, setMarkdown] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [actionsHost, setActionsHost] = React.useState<HTMLElement | null>(null);

  // Load doc
  React.useEffect(() => {
    let on = true;
    (async () => {
      try {
        const res = await fetch(`/api/docs/${docId}`, { cache: 'no-store' });
        const j = await res.json();
        if (!on) return;
        if (j?.error) setError(j.error);
        else {
          setTitle(j?.doc?.title ?? null);
          setMarkdown(j?.doc?.markdown ?? j?.doc?.content ?? '');
        }
      } catch (e: any) {
        if (on) setError(e?.message ?? 'Failed to load document');
      }
    })();
    return () => { on = false; };
  }, [docId]);

  // Find header actions slot
  React.useEffect(() => {
    setActionsHost(document.getElementById('modal-actions'));
  }, []);

  // Export PDF only (Regenerate intentionally removed)
  const exportPdf = () =>
    start(async () => {
      try {
        const res = await fetch(`/api/docs/${docId}/pdf`);
        if (!res.ok) throw new Error('PDF generation failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title ?? 'playbook'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e: any) {
        alert(e?.message ?? 'PDF generation failed');
      }
    });

  const headerActions = (
    <>
      <BrandButton onClick={exportPdf} disabled={pending} className="!text-[#0b1220]">
        Export PDF
      </BrandButton>
    </>
  );

  return (
    <div>
      {/* Mobile fallback actions (when header is cramped) */}
      <div className="mb-3 flex items-center gap-2 sm:hidden">
        {headerActions}
      </div>

      {actionsHost && createPortal(headerActions, actionsHost)}

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</div>
      ) : (
        <div className="rounded-2xl border border-[--border] bg-[--surface] p-4 sm:p-5 shadow-[--shadow-0]">
          <div className="mdx">
            <MarkdownPreview markdown={markdown} />
          </div>
        </div>
      )}

      <style jsx>{`
        /* Typography polish inside the modal content scope */
        .mdx :global(h1) {
          font-size: 1.5rem;
          line-height: 1.3;
          font-weight: 700;
          margin: 0 0 0.5rem 0.25rem;
        }
        .mdx :global(h2) {
          font-size: 1.125rem;
          line-height: 1.35;
          font-weight: 700;
          margin: 1rem 0 0.5rem 0.35rem;
        }
        .mdx :global(h3) {
          font-size: 1rem;
          line-height: 1.35;
          font-weight: 600;
          margin: 0.75rem 0 0.4rem 0.5rem;
        }
        .mdx :global(p),
        .mdx :global(li) {
          font-size: 0.935rem;
          line-height: 1.6;
        }
        .mdx :global(p) { margin: 0.4rem 0 0.8rem 0.5rem; }
        .mdx :global(ul),
        .mdx :global(ol) {
          margin: 0.4rem 0 1rem 1.25rem;
          padding-left: 1rem;
        }
        .mdx :global(ul) { list-style: disc; }
        .mdx :global(ol) { list-style: decimal; }
        .mdx :global(hr) {
          border: 0;
          border-top: 1px solid var(--border);
          margin: 1rem 0;
          opacity: 0.6;
        }

        /* Softer tables with alternating rows, body-size fonts */
        .mdx :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0 1.25rem;
          border-radius: 12px;
          overflow: hidden;
          background: color-mix(in oklab, var(--surface) 92%, black 8%);
          box-shadow: var(--shadow-0);
        }
        .mdx :global(th),
        .mdx :global(td) {
          border: 1px solid var(--border);
          padding: 10px 12px;
          vertical-align: top;
          text-align: left;
          font-size: 0.874rem;   /* match body text */
          line-height: 1.5;      /* match body line-height */
        }
        .mdx :global(th) {
          font-weight: 600;
          background: color-mix(in oklab, var(--surface) 86%, black 14%);
        }
        .mdx :global(tbody tr:nth-child(odd) td) {
          background: color-mix(in oklab, var(--surface) 95%, black 5%);
        }
        .mdx :global(tbody tr:nth-child(even) td) {
          background: color-mix(in oklab, var(--surface) 90%, black 10%);
        }
        .mdx :global(code) {
          font-size: 0.85em;
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
          background: color-mix(in oklab, var(--surface) 88%, black 12%);
        }
      `}</style>
    </div>
  );
}

