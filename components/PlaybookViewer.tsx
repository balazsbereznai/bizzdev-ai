// components/PlaybookViewer.tsx
'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  markdown: string
  className?: string
}

export default function PlaybookViewer({ markdown, className = '' }: Props) {
  // Web-only cleanup (keep PAGEBREAKs for PDF layer)
  const md = (markdown || '').replace(/<!--\s*PAGEBREAK\s*-->/gi, '').trim()

  return (
    <div className={['prose prose-sm md:prose-base lg:prose-lg max-w-none', className].join(' ')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => <h1 className="text-[--h1,#283c63]" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-[--h2,#375287]" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-[--h3,#375287]" {...props} />,

          // Lists
          ul: ({ node, ...props }) => <ul className="space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="space-y-1" {...props} />,

          // Inline / block code
          code: (props: any) => {
            const { inline, children, ...rest } = props
            if (inline) {
              return (
                <code className="rounded bg-black/5 px-1.5 py-0.5 text-[0.9em]" {...rest}>
                  {children}
                </code>
              )
            }
            return (
              <pre className="rounded-xl border border-[--border] bg-[--surface] p-3 overflow-x-auto">
                <code className="text-sm">{children}</code>
              </pre>
            )
          },

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto rounded-xl border border-[--border] shadow-sm">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead {...props} />,
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr className="odd:bg-white even:bg-black/[0.02]" {...props} />,
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-left align-top font-medium" {...props} />
          ),
          td: ({ node, ...props }) => <td className="px-3 py-2 align-top" {...props} />,

          // Blockquote / hr
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-[--border] pl-4 italic text-black/70"
              {...props}
            />
          ),
          hr: () => <hr className="my-6 border-[--border]" />,
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  )
}

