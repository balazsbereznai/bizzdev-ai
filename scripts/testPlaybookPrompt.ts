// scripts/testPlaybookPrompt.ts
import { preparePlaybookPrompts } from "../lib/prompts/playbookSpec";

const sample = {
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
};

const { system, user, parsed, config } = preparePlaybookPrompts(sample);

console.log("=== SYSTEM PROMPT ===\n");
console.log(system);
console.log("\n=== USER PROMPT ===\n");
console.log(user);
console.log("\n=== CONFIG ===\n", config);
console.log("\n=== INPUT (validated) ===\n", parsed);

