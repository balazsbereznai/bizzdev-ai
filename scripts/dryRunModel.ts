// scripts/dryRunModel.ts
//
// Local helper script to dry-run the playbook model with a sample payload.
// This is not used by the app at runtime; it's only for manual testing.

import OpenAI from "openai";
import {
  preparePlaybookPrompts,
  playbookCallConfig,
  type PlaybookInput,
} from "../lib/prompts/playbookSpec";
import { MODEL } from "../lib/ai";

(async () => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const sampleInput: PlaybookInput = {
    // Required
    company_name: "Nexora",
    product_name: "SignalAI",

    // Company
    industry: "B2B SaaS",
    company_size: "200-500",
    hq_region: "UK",

    // Product
    product_summary: "AI-powered prospecting and conversation intelligence",
    differentiator:
      "Real-time intent signals and call analysis tightly integrated with CRM",
    pricing_model: "Subscription, seat-based",
    category: "Sales engagement / revenue intelligence",
    region_scope: "Global",
    integrations: "Salesforce, HubSpot, Outreach",
    value_props: [
      "Higher outbound conversion rates",
      "Shorter sales cycles via better qualification",
      "Improved coaching through conversation insights",
    ],
    proof_points: [
      "Average 22% increase in reply rates across pilot customers",
      "15% uplift in qualified pipeline within 2 quarters",
    ],

    // ICP (simple sample)
    icp_name: "Scaling B2B SaaS revenue teams",
    icp_industry: "B2B SaaS",
    icp_company_size: "200-1000 employees",
    buyer_roles: ["VP Sales", "Head of Revenue Operations"],
    pain_points: [
      "Low outbound conversion rates",
      "Limited visibility into what top reps do differently",
    ],
    ideal_customer:
      "Post-Series B SaaS companies with 15+ sellers and structured outbound motion",
    use_cases:
      "Prospecting optimization, call analysis, coaching and deal review",
    decision_makers: "VP Sales, CRO",
    influencers: "RevOps, Sales Enablement",
    triggers: "New market entry, pipeline coverage gaps, hiring ramp",
    deal_breakers: "Strict data residency requirements without EU hosting",
    target_regions: "EMEA, US",
    objections: "Budget constraints, change management and rep adoption",

    // Style knobs
    tone: "Challenger",
    experience_level: "Experienced",
    output_language: "en",
    word_limit: 1800,
  };

  const { system, user } = preparePlaybookPrompts(sampleInput);

  const resp = await client.chat.completions.create({
    model: MODEL,
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

