'use client'

import PlaybookViewer from '@/components/PlaybookViewer'

type Props = {
  title: string
  pdfHref: string
  markdown: string
}

export default function PlaybookModal({ title, pdfHref, markdown }: Props) {
  return (
    /* Overlay fills viewport; padding creates a gutter so the box never touches edges */
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      {/* Viewport-sized container (minus overlay padding).
          Using h-full/w-full here solves the “modal bottom outside viewport” problem. */}
      <div className="h-full w-full flex items-center justify-center">
        {/* Modal: width capped; height capped by the viewport container.
           Flex column + min-h-0 lets the scroll pane shrink properly. */}
        <div
          role="dialog"
          aria-modal="true"
          className="
            w-[min(1100px,100%)] max-h-full
            box-border rounded-2xl border border-[--border] bg-[--surface] shadow-2xl glass
            flex flex-col min-h-0 overflow-hidden
          "
        >
          {/* Header (title wraps; actions fixed & always visible) */}
          <div className="flex items-start justify-between gap-3 border-b border-[--border] px-4 py-3">
            <h1 className="text-lg font-semibold leading-snug break-words pr-2">
              {title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <a href={pdfHref} className="btn">Export PDF</a>
              <a href="/runs" className="btn-subtle">Close</a>
            </div>
          </div>

          {/* Sole scrollable content pane.
             flex-1 gives it the remaining height, min-h-0 allows it to actually shrink,
             overflow-y-auto makes the inner area scroll. */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 overscroll-contain scroll-shadows">
            {markdown ? (
              <PlaybookViewer markdown={markdown} />
            ) : (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                This document has no content yet.
              </div>
            )}
            {/* tiny spacer so last line never hugs the rounded edge */}
            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

