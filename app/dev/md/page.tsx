import MarkdownRenderer from "@/components/MarkdownRenderer";

const sample = `# Hello from BizzDev.ai
This is **brand prose** with a table and code.

| A | B |
|---|---|
| 1 | 2 |

\`\`\`ts
const hi = (n: string) => "Hello " + n;
\`\`\`
`;

export default function Page() {
  return (
    <div className="p-6">
      <MarkdownRenderer md={sample} />
    </div>
  );
}
