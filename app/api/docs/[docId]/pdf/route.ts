import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { mdToPdfNodes } from "@/lib/markdownToPdf";
import { Document, Page, View, StyleSheet, pdf } from "@react-pdf/renderer";
import React from "react";
import "@/pdf/PlaybookPDF";

/* ---------------------------------------------------------
   Supabase helper
--------------------------------------------------------- */
async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
}

/* ---------------------------------------------------------
   Brand palette
--------------------------------------------------------- */
const brand = {
  border: "#d9e1ec",
  chart1: "#b0d1fa",
  chart2: "#e0edfd",
  text: "#000",
  h1: "#283c63",
  h2: "#375287",
  h3: "#375287",
};

/* ---------------------------------------------------------
   Misc helpers
--------------------------------------------------------- */
function safeFilename(s: string) {
  return (s || "document")
    .replace(/[^\p{L}\p{N}\s\-_]+/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64);
}

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 40, paddingHorizontal: 48 },
  defaultText: { fontSize: 11, lineHeight: 1.4, color: "#2a2a2a" },
});

function ensureKeys(node: any, path = "k"): any {
  if (Array.isArray(node)) return node.map((c, i) => ensureKeys(c, `${path}.${i}`));
  if (React.isValidElement(node)) {
    const props: Record<string, any> = { ...(((node as any).props ?? {}) as object) };

    if (props.children !== undefined) {
      if (Array.isArray(props.children)) {
        props.children = props.children.map((child: any, i: number) =>
          React.isValidElement(child)
            ? React.cloneElement(ensureKeys(child, `${path}.${i}`), { key: `${path}.${i}` })
            : ensureKeys(child, `${path}.${i}`)
        );
      } else {
        props.children = ensureKeys(props.children, `${path}.c`);
      }
    }
    return React.cloneElement(node, { ...props, key: (node as any).key ?? path });
  }
  return node;
}

function stripFontFamilyDeep(node: any, path = "n"): any {
  if (Array.isArray(node)) return node.map((c, i) => stripFontFamilyDeep(c, `${path}.${i}`));
  if (React.isValidElement(node)) {
    const props: Record<string, any> = { ...(((node as any).props ?? {}) as object) };

    const normalizeStyle = (st: any): any => {
      if (!st) return st;
      if (Array.isArray(st)) return st.map(normalizeStyle);
      if (typeof st === "object") {
        const next = { ...st };
        if ("fontFamily" in next) delete (next as any).fontFamily;
        return next;
      }
      return st;
    };

    if (props.style) props.style = normalizeStyle(props.style);

    if (props.children !== undefined) {
      if (Array.isArray(props.children)) {
        props.children = props.children.map((child: any, i: number) =>
          React.isValidElement(child)
            ? React.cloneElement(stripFontFamilyDeep(child, `${path}.${i}`), { key: `${path}.${i}` })
            : stripFontFamilyDeep(child, `${path}.${i}`)
        );
      } else {
        props.children = stripFontFamilyDeep(props.children, `${path}.c`);
      }
    }

    return React.cloneElement(node, { ...props, key: (node as any).key ?? path });
  }
  return node;
}

function createPdfDoc(meta: { title: string | null }, content: React.ReactNode) {
  return React.createElement(
    Document,
    { author: "BizzDev.ai", title: meta.title ?? "Document", subject: "Exported from BizzDev.ai" },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(View, { style: styles.defaultText }, content)
    )
  );
}

/* ---------------------------------------------------------
   GET
--------------------------------------------------------- */
export async function GET(_req: Request, ctx: { params: Promise<{ docId: string }> }) {
  const { docId } = await ctx.params;
  const supabase = await supabaseServer();

  const { data: doc, error } = await supabase
    .from("docs")
    .select("id, title, content, meta")
    .eq("id", docId)
    .single();

  if (error || !doc) {
    return new Response(JSON.stringify({ error: "Doc not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const markdown = doc.content ?? "";

  const rawNodes = await mdToPdfNodes(markdown, brand);
  let content = ensureKeys(rawNodes);

  try {
    const element = createPdfDoc({ title: doc.title }, content);
    const buffer = await pdf(element).toBuffer();
    const filename = `${safeFilename(doc.title ?? "document")}.pdf`;
    return new Response(buffer, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    if (typeof e?.message === "string" && e.message.includes("Font family not registered")) {
      const stripped = stripFontFamilyDeep(content);
      const element = createPdfDoc({ title: doc.title }, stripped);
      const buffer = await pdf(element).toBuffer();
      const filename = `${safeFilename(doc.title ?? "document")}.pdf`;
      return new Response(buffer, {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": `attachment; filename="${filename}"`,
          "cache-control": "no-store",
        },
      });
    }
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

