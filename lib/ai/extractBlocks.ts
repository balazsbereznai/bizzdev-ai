// lib/ai/extractBlocks.ts
export type PlaybookMeta = {
  doc_title: string;
  email_subject: string;
  email_preheader: string;
  filename_slug: string;
};

export type Extracted = {
  markdown: string;   // content between <<<BEGIN_PLAYBOOK_MD>>> ... <<<END_PLAYBOOK_MD>>>
  meta: PlaybookMeta; // parsed JSON between <<<META>>> ... <<<END_META>>>
};

const MD_RE = /<<<BEGIN_PLAYBOOK_MD>>>([\s\S]*?)<<<END_PLAYBOOK_MD>>>/;
const META_RE = /<<<META>>>([\s\S]*?)<<<END_META>>>/;

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Robust extractor that tolerates:
 * - missing META block
 * - invalid JSON
 * - empty or weird fields
 * Always returns safe markdown + fallback meta.
 */
export function extractPlaybookAndMeta(fullText: string): Extracted {
  if (!fullText || typeof fullText !== "string") {
    console.warn("[extractPlaybookAndMeta] empty input");
    return {
      markdown: "",
      meta: {
        doc_title: "Sales Playbook",
        email_subject: "Sales playbook attached",
        email_preheader: "Playbook summary",
        filename_slug: "sales-playbook",
      },
    };
  }

  const mdm = fullText.match(MD_RE);
  const mtm = fullText.match(META_RE);

  if (!mdm) {
    console.warn("[extractPlaybookAndMeta] missing PLAYBOOK_MD markers");
  }

  const markdown = mdm?.[1]?.trim() || "";

  let metaJson: any = {};
  if (mtm) {
    try {
      metaJson = JSON.parse(mtm[1]);
    } catch (e) {
      console.warn("[extractPlaybookAndMeta] META block invalid JSON, using fallback", e);
      metaJson = {};
    }
  } else {
    console.warn("[extractPlaybookAndMeta] META block missing, using fallback defaults");
  }

  // fallback defaults
  const docTitle = String(metaJson.doc_title || "Sales Playbook");
  const slug =
    metaJson.filename_slug ||
    slugify(metaJson.doc_title || docTitle || "sales-playbook");

  const meta: PlaybookMeta = {
    doc_title: docTitle,
    email_subject: String(
      metaJson.email_subject || `${docTitle}: tailored playbook attached`
    ),
    email_preheader: String(
      metaJson.email_preheader ||
        "Concise ICP, discovery, objections, KPIs — ready to use"
    ),
    filename_slug: slug,
  };

  // guard weird edge cases
  if (!meta.filename_slug || meta.filename_slug.length < 3) {
    meta.filename_slug = slugify(meta.doc_title || "sales-playbook");
  }

  return { markdown, meta };
}

