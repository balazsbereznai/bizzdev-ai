import OpenAI from "openai";
import { preparePlaybookPrompts, playbookCallConfig } from "../lib/prompts/playbookSpec";

async function callOnce(model: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { system, user } = preparePlaybookPrompts({
    company_name: "Nexora",
    product_name: "SignalAI",
    product_summary: "AI-powered prospecting and conversation intelligence",
    industry: "B2B SaaS",
    role_title: "VP Sales",
    company_size: "200–500",
    hq_region: "UK",
    target_regions: "EMEA, US",
    sales_motion: "Outbound",
    primary_objective: "Increase qualified pipeline",
    tone: "Challenger",
    experience_level: "Experienced",
    word_limit: 1600,
  });

  const resp = await client.chat.completions.create({
    model,
    temperature: playbookCallConfig.temperature,
    top_p: 0.8,
    max_tokens: 3500,
    // @ts-ignore
    seed: playbookCallConfig.seed,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  return resp.choices?.[0]?.message?.content ?? "";
}

(async () => {
  const primaryModel = "gpt-4.1-mini";
  let text = await callOnce(primaryModel);

  const hasMeta = text.includes("<<<META>>>") && text.includes("<<<END_META>>>");
  const hasMd   = text.includes("<<<BEGIN_PLAYBOOK_MD>>>") && text.includes("<<<END_PLAYBOOK_MD>>>");

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
        { role: "system", content: "You are a careful assistant that outputs exactly what is asked, no extra text." },
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

