import { renderToBuffer } from "@react-pdf/renderer";
import PlaybookPDF from "@/pdf/PlaybookPDF";

(async () => {
  const md = `
# Acme — RocketAI Sales Playbook

## 1) Executive Summary
- One-liner.

| KPI | Owner | 30d |
| --- | ----- | --- |
| Time to value | Champion | 7d |

<!--PAGEBREAK-->

## 2) ICP & Pain Map
- Bullets...
`;

  const title = "Acme — RocketAI Sales Playbook";
  const pdf = await renderToBuffer(await PlaybookPDF({ title, subtitle: "Playbook", markdown: md }));

  const fs = await import("node:fs");
  fs.writeFileSync("/tmp/playbook_smoke.pdf", pdf);
  console.log("✅ Wrote /tmp/playbook_smoke.pdf, bytes=", pdf.byteLength);
})();

