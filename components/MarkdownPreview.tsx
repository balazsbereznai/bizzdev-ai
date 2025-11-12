"use client";

import { useMemo } from "react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true }); // simple, safe-ish preview

export default function MarkdownPreview({ markdown }: { markdown: string }) {
  const html = useMemo(() => marked.parse(markdown ?? ""), [markdown]);
  return (
    <div
      className="md-preview space-y-3"
      dangerouslySetInnerHTML={{ __html: html as string }}
    />
  );
}

