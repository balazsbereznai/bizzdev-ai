// scripts/testPlaybookPrompt.ts
//
// Local helper script to inspect the generated system/user prompts for a
// sample PlaybookInput. Not used by the app at runtime.

import {
  preparePlaybookPrompts,
  PlaybookInputSchema,
  type PlaybookInput,
} from "../lib/prompts/playbookSpec";

const sample: PlaybookInput = {
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
  word_limit: 1800,
} as PlaybookInput;

const { system, user } = preparePlaybookPrompts(sample);

// If you want to inspect the validated/normalized input, parse it explicitly:
const parsed = PlaybookInputSchema.parse(sample);

console.log("=== SYSTEM PROMPT ===\n");
console.log(system);

console.log("\n=== USER PROMPT ===\n");
console.log(user);

console.log("\n=== INPUT (validated) ===\n");
console.dir(parsed, { depth: null });

