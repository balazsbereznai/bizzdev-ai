// scripts/dryRunWithRetry.ts
//
// Local helper script to dry-run the playbook model with a sample payload,
// with a simple retry that patches in a META block if the first run omits it.
// Not used by the app at runtime.

import OpenAI from "openai";
import {
  preparePlaybookPrompts,
  playbookCallConfig,
  type PlaybookInput,
} from "../lib/prompts/playbookSpec";
import { MODEL } from "../lib/ai";

async function callOnce(model: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const sampleInput: PlaybookInput = {
    // Required
    company_name: "Nexora",
    product_name: "SignalAI",

    // Company
    product_summary: "AI-powered prospecting and conversation intelligence",
    industry: "B2B SaaS",
    company_size: "200-500",
    hq_region: "UK",

    // ICP / region
    target_regions: "EMEA, US",

    // Style knobs
    tone: "Challenger",
    experience_level: "Experienced",
    output_language: "en",
    word_limit: 1600,
  };

  const { system, user } = preparePlaybookPrompts(sampleInput);

  const resp = await client.chat.completions.create({
    model,
    temperature: playbookCallConfig.temperature,
    top_p: 0.8,
    max_tokens: 3500,
    // @ts-ignore seed may not be supported in all SDK versions
    seed: playbookCallConfig.seed,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  return resp.choices?.[0]?.message?.content ?? "";
}

(async () => {
  const primaryModel = MODEL;
  let text = await callOnce(primaryModel);

  const hasMeta =
    text.includes("<<<META>>>") && text.includes("<<<END_META>>>");
  const hasMd =
    text.includes("<<<BEGIN_PLAYBOOK_MD>>>") &&
    text.includes("<<<END_PLAYBOOK_MD>>>");

  if (!hasMeta || !hasMd) {
    // Retry with stricter reminder appended to user instructions
    // (cheap trick: ask the model only for META if missing)
    const metaOnlyPrompt = `
You omitted the META block previously. Output ONLY the META block now.
Reprint exactly:

<<<META>>>
{
  "doc_title": "Nexora — SignalAI Sales Playbook", 
  "email_subject": "SignalAI: tailored playbook attached",
  "email_preheader": "Concise ICP, discovery, objections, KPIs — ready to use",
  "filename_slug": "nexora_signalai_sales-playbook"
}
<<<END_META>>>
`.trim();

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp2 = await client.chat.completions.create({
      model: "gpt-4.1",
      temperature: 0.1,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are a careful assistant that outputs exactly what is asked, no extra text.",
        },
        { role: "user", content: metaOnlyPrompt },
      ],
    });

    const metaOnly = resp2.choices?.[0]?.message?.content ?? "";
    // stitch only if the first run had the MD block
    if (hasMd && metaOnly.includes("<<<META>>>")) {
      text = text + "\n\n" + metaOnly.trim();
    }
  }

  console.log(text);
})();

