import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import MarkdownRendererServer from "@/components/MarkdownRendererServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; docId: string };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getDocument(docId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", docId)
    .single();
  if (error || !data) return null;
  return data;
}

export default async function PrintPage({ params }: { params: Promise<Params> }) {
  const { docId } = await params;
  const doc = await getDocument(docId);
  if (!doc) return notFound();

  const title = (doc.title as string) || "Sales Playbook";
  const subtitle = (doc.doc_type as string) || "Playbook";

  const raw =
    (doc.markdown as string | null) ??
    (doc.content_markdown as string | null) ??
    (doc.content as string | null) ??
    "";

  // Allow <!--PAGEBREAK--> in markdown
  const md = raw.replaceAll("<!--PAGEBREAK-->", '\n\n<div class="page-break"></div>\n\n');

  // Palette (printer-friendly)
  const primary = "#283c63";      // H1/H2
  const primaryLight = "#375287"; // H3/subtitles
  const chart1 = "#b0d1fa";
  const chart2 = "#e0edfd";
  const text = "#000000";
  const border = "#e5e7eb";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <style>{`
          @page { size: A4; margin: 18mm 16mm 20mm 16mm; }
          html, body {
            background: #ffffff;
            color: ${text};
            font: 12pt/1.5 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          :root {
            --primary: ${primary};
            --primary-light: ${primaryLight};
            --chart-1: ${chart1};
            --chart-2: ${chart2};
            --border: ${border};
          }

          .container { max-width: 720px; margin: 0 auto; }

          /* Title block */
          .title-wrap { padding: 8mm 0 6mm; }
          .title     { font-size: 24pt; line-height: 1.2; color: var(--primary); margin: 0 0 4px; }
          .subtitle  { font-size: 11pt; color: var(--primary-light); margin: 0; }
          .rule      { height: 2px; background: var(--chart-2); margin: 8px 0 10px; }

          .page-break { page-break-before: always; }

          /* Typography */
          h1, h2, h3 { color: var(--primary); margin: 0 0 8px; line-height: 1.25; }
          h1 { font-size: 18pt; border-bottom: 1px solid var(--chart-2); padding-bottom: 6px; margin-bottom: 12px; }
          h2 { font-size: 15pt; margin-top: 18pt; break-after: avoid; }
          h3 { font-size: 13pt; color: var(--primary-light); margin-top: 12pt; }
          p, ul, ol { margin: 0 0 10px; }
          ul, ol { padding-left: 20px; }
          a { color: var(--primary); text-decoration: none; border-bottom: 1px dotted var(--primary-light); }
          strong { font-weight: 600; }

          /* Code */
          code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: 10pt; background: #f6f8fa; padding: 1px 3px; border-radius: 3px;
          }

          /* Tables */
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid var(--border); padding: 6px 8px; text-align: left; vertical-align: top; }
          th { background: var(--chart-2); color: var(--primary); }

          /* Media */
          img, svg { max-width: 100%; height: auto; }
          .chart { border: 1px solid var(--chart-2); background: var(--chart-1); padding: 8px; border-radius: 6px; }

          .avoid-break-inside { break-inside: avoid; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <section className="title-wrap">
            <div className="title">{title}</div>
            <div className="subtitle">{subtitle}</div>
            <div className="rule"></div>
          </section>

          <article>
            <MarkdownRendererServer md={md} />
          </article>
        </div>
      </body>
    </html>
  );
}

