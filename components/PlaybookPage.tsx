'use client'

import PlaybookViewer from '@/components/PlaybookViewer'

type Props = {
  title: string
  pdfHref: string
  markdown: string
}

export default function PlaybookPage({ title, pdfHref, markdown }: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[--bg]">
      <header className="sticky top-0 z-50 border-b border-[--border] bg-[--surface]/95 backdrop-blur">
        <div className="container-px mx-auto max-w-[1100px] flex items-start justify-end py-3">
          <div className="flex items-center gap-4 shrink-0">
            <a href={pdfHref} className="btn">Export PDF</a>
            {/* add a tiny manual spacer to defeat border-collapsing visuals */}
            <a href="/runs" className="btn-subtle ml-5">Close</a>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="container-px mx-auto max-w-[1100px] py-6">
          {markdown ? (
            <PlaybookViewer markdown={markdown} />
          ) : (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              This document has no content yet.
            </div>
          )}
          <div className="h-8" />
        </div>
      </main>
    </div>
  )
}

