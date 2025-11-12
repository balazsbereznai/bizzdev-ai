'use client';

import * as React from 'react';
import MarkdownPreview from '@/components/MarkdownPreview';

export default function ViewerPageClient({ markdown }: { markdown: string }) {
  return (
    <div className="rounded-2xl border border-[--border] bg-[--surface] p-4 sm:p-5 shadow-[--shadow-0]">
      <div className="mdx">
        <MarkdownPreview markdown={markdown} />
      </div>

      {/* Mirror modal typography so full-page looks identical */}
      <style jsx>{`
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
          font-size: 0.874rem;
          line-height: 1.5;
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

