import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

/**
 * Synchronous Markdown renderer:
 * - GFM tables, lists, strikethrough
 * - Safe raw HTML rendering (you already control the source)
 * - Syntax highlighting via rehype-highlight (sync; avoids runSync async error)
 *
 * Tailwind Typography styles are applied via `prose prose-brand`.
 */
export default function MarkdownRenderer({ md }: { md: string }) {
return (
  <div className="prose prose-invert prose-brand max-w-none">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
    >
      {md}
    </ReactMarkdown>
  </div>
);
}

