// Server component — mirrors your on-screen renderer as closely as possible.
// If you use extra rehype plugins in your UI, add them here too.
import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";   // enable if you need raw HTML
// import rehypeSlug from "rehype-slug"; // enable if you use slugged headings

export default function MarkdownRendererServer({ md }: { md: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      // rehypePlugins={[rehypeRaw, rehypeSlug]}
    >
      {md}
    </Markdown>
  );
}

