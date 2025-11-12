// app/actions/generate.ts
"use server";

import OpenAI from "openai";
import { z } from "zod";
import {
  preparePlaybookPrompts,
  playbookCallConfig,
  PlaybookInputSchema,
} from "@/lib/prompts/playbookSpec";
import { extractPlaybookAndMeta } from "@/lib/ai/extractBlocks";
import { createClient } from "@supabase/supabase-js";
import { log, rid } from "@/lib/log";

/** ================================
 *  Constants & helpers
 *  ================================ */
const MODEL_PRIMARY = "gpt-4.1";
const MODEL_FALLBACK = "gpt-4.1-mini";
const OPENAI_TIMEOUT_MS = 120_000;    // was 60_000
const MAX_ATTEMPTS = 3;               // was 2
const MAX_MARKDOWN_LEN = 400_000;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function withTimeout<T>(p: Promise<T>, ms = OPENAI_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("OpenAI request timeout")), ms)),
  ]);
}

/** ================================
 *  Zod input schemas
 *  ================================ */
const OutputLangSchema = z.enum(["auto", "en", "hu", "de", "fr", "es", "it"]);

const GenerateArgs = z.object({
  docId: z.string().min(1),
  input: PlaybookInputSchema.extend({
    output_language: OutputLangSchema.optional(),
  }),
});
type GenerateArgs = z.infer<typeof GenerateArgs>;

/** ================================
 *  Main entry
 *  ================================ */
export async function generatePlaybookAction(args: GenerateArgs) {
  const reqId = rid("gen");
  const t0 = Date.now();
  const { docId, input } = GenerateArgs.parse(args);

  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");

  if (!input.company_name || !input.product_name) {
    throw new Error("Missing required input: company_name or product_name");
  }

  // Resolve requested output language. For now: "auto" -> "en" (English).
  const requestedOutputLang = input.output_language ?? "en";
  const resolvedOutputLang = requestedOutputLang === "auto" ? "en" : requestedOutputLang;

  const inputSafe = {
    // Company
    company_name: input.company_name,
    industry: input.industry || "General B2B",
    company_size: input.company_size || input.icp_company_size || "100–1000",
    hq_region: input.hq_region || "",
    target_regions: input.target_regions || (input as any).target_region || "",

    // Product
    product_name: input.product_name,
    product_summary: input.product_summary || (input as any).one_liner || "TBD product summary",
    differentiator: input.differentiator || "",
    pricing_model: input.pricing_model || "",
    assets: input.assets || "",
    integrations: input.integrations || "",
    category: input.category || "",

    // ICP
    role_title: (input as any).role_title || input.ideal_customer || "Buyer",
    ideal_customer: input.ideal_customer || "",
    use_cases: input.use_cases || "",
    buyer_roles: input.buyer_roles || [],
    pain_points: input.pain_points || [],
    objections: input.objections || "",
    icp_company_size: input.icp_company_size || input.company_size || "",

    // Knobs
    sales_motion: (input as any).sales_motion || "",
    tone: input.tone || "",
    experience_level: input.experience_level || "Experienced",
    primary_objective: (input as any).primary_objective || "Pipeline growth",
    word_limit: input.word_limit ?? 2200,

    // New: carry the resolved output language forward
    output_language: resolvedOutputLang,
  };

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Service-role client (server action) to persist generated content
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { system, user } = preparePlaybookPrompts(inputSafe as any);

  log.info("generate.start", {
    reqId,
    docId,
    modelPrimary: MODEL_PRIMARY,
    modelFallback: MODEL_FALLBACK,
  });

  const callOnce = async (model: string) => {
    const tStart = Date.now();
    const resp = await withTimeout(
      openai.chat.completions.create({
        model,
        temperature: playbookCallConfig.temperature,
        top_p: 0.85,
        max_tokens: 3800, // was 4500; slightly smaller for faster completion
        // @ts-ignore (seed not always typed)
        seed: playbookCallConfig.seed,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content:
              user +
              "\n\n# DO NOT OMIT THE META BLOCK. Return both PLAYBOOK_MD and META blocks.",
          },
        ],
      })
    );
    const content = resp.choices?.[0]?.message?.content ?? "";
    log.debug("generate.openai.call", {
      reqId,
      model,
      ms: Date.now() - tStart,
      contentLen: content.length,
    });
    return content;
  };

  let raw = "";
  let attempts = 0;
  let lastErr: unknown = null;
  const models = [MODEL_PRIMARY, MODEL_FALLBACK];

  for (const model of models) {
    while (attempts < MAX_ATTEMPTS) {
      try {
        attempts++;
        raw = await callOnce(model);

        const hasMd =
          raw.includes("<<<BEGIN_PLAYBOOK_MD>>>") && raw.includes("<<<END_PLAYBOOK_MD>>>");
        const hasMeta = raw.includes("<<<META>>>") && raw.includes("<<<END_META>>>");

        if (hasMd && hasMeta) {
          attempts = MAX_ATTEMPTS; // stop outer loop too
          break;
        }

        if (hasMd && !hasMeta) {
          // Repair META only
          const metaOnlyPrompt = `
You omitted the META block previously. Output ONLY the META block now for:
doc_title = "${inputSafe.company_name} — ${inputSafe.product_name} Sales Playbook"
email_subject = "${inputSafe.product_name}: tailored playbook attached"
email_preheader = "ICP, discovery, objections, KPIs — region-aware"
filename_slug = "${slugify(inputSafe.company_name)}_${slugify(
            inputSafe.product_name
          )}_sales-playbook"
          
Reprint exactly:
            
<<<META>>>
{
"doc_title": "${inputSafe.company_name} — ${inputSafe.product_name} Sales Playbook",
  "email_subject": "${inputSafe.product_name}: tailored playbook attached",
  "email_preheader": "ICP, discovery, objections, KPIs — region-aware",
  "filename_slug": "${slugify(inputSafe.company_name)}_${slugify(
            inputSafe.product_name
          )}_sales-playbook"
}
<<<END_META>>>
          `.trim();

          const tFix = Date.now();
          const resp2 = await withTimeout(
            openai.chat.completions.create({
              model: MODEL_FALLBACK,
              temperature: 0.1,
              max_tokens: 300,
              messages: [
                { role: "system", content: "You are precise and output exactly the requested block." },
                { role: "user", content: metaOnlyPrompt },
              ],
            }),
            20_000
          );

          const metaOnly = resp2.choices?.[0]?.message?.content ?? "";
          log.debug("generate.openai.metaRepair", {
            reqId,
            ms: Date.now() - tFix,
            metaLen: metaOnly.length,
          });

          if (metaOnly.includes("<<<META>>>") && metaOnly.includes("<<<END_META>>>")) {
            raw = raw + "\n\n" + metaOnly.trim();
            attempts = MAX_ATTEMPTS; // stop loops
            break;
          }
        }
      } catch (e) {
        lastErr = e;
        log.warn("generate.openai.retry", { reqId, attempt: attempts, model, err: String(e) });
        await new Promise((r) => setTimeout(r, 700));
      }
    }
    if (attempts >= MAX_ATTEMPTS && raw) break;
    if (attempts >= MAX_ATTEMPTS && !raw) continue; // try next model
  }

  if (!raw) {
    log.error("generate.openai.fail", { reqId, attempts, err: String(lastErr ?? "unknown") });
    throw new Error(`OpenAI failed after ${attempts} attempt(s): ${String(lastErr ?? "unknown")}`);
  }

  log.info("generate.openai.done", {
    reqId,
    attempts,
    ok: !!raw,
    ms: Date.now() - t0,
    rawLen: raw.length,
  });

  const { markdown, meta } = extractPlaybookAndMeta(raw);

  const safeTitle = String(
    meta.doc_title || `${inputSafe.company_name} — ${inputSafe.product_name} Sales Playbook`
  ).slice(0, 200);

  const safeMarkdown = String(markdown).slice(0, MAX_MARKDOWN_LEN);

  const { error: persistErr } = await supabase
    .from("docs")
    .update({
      title: safeTitle,
      markdown: safeMarkdown,
      content: safeMarkdown,
      meta: meta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", docId)
    .select("id")
    .maybeSingle();

  if (persistErr) {
    log.error("generate.persist.fail", {
      reqId,
      code: persistErr.code,
      msg: persistErr.message,
    });
    throw new Error(persistErr.message || "Failed to persist document");
  }

  log.info("generate.persist.ok", { reqId, docId, mdLen: safeMarkdown.length });

  log.info("generate.done", {
    reqId,
    docId,
    metaSlug: meta.filename_slug,
    totalMs: Date.now() - t0,
  });

  return { ok: true as const, docId, meta };
}

