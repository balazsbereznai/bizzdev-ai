// scripts/dryRunModel.ts
import OpenAI from "openai";
import { preparePlaybookPrompts, playbookCallConfig } from "../lib/prompts/playbookSpec";

(async () => {
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
    word_limit: 1800,
  });

  const resp = await client.chat.completions.create({
    model: "gpt-4.1-mini", // set your model here
    temperature: playbookCallConfig.temperature,
    top_p: playbookCallConfig.top_p,
    max_tokens: 3500,
    // @ts-ignore seed may not be supported in all SDK versions
    seed: playbookCallConfig.seed,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const text = resp.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Empty model response");

  // print raw model output to STDOUT
  console.log(text);
})();

