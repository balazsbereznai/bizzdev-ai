import { describe, it, expect } from "vitest";
import { preparePlaybookPrompts } from "./playbookSpec";

describe("playbook prompts", () => {
  it("builds required sections", () => {
    const { user, system } = preparePlaybookPrompts({
      company_name: "Acme",
      product_name: "RocketAI",
      product_summary: "AI rockets",
      industry: "Aerospace",
      role_title: "CTO",
      company_size: "500-1000",
      hq_region: "EU",
      target_regions: "US, EU",
      sales_motion: "Hybrid",
      primary_objective: "Qualified meetings",
      tone: "Trusted advisor",
      experience_level: "Unexperienced",
      word_limit: 1600,
    });

    expect(system).toMatch(/You are a senior B2B Sales Enablement leader/i);
    [
      "<<<BEGIN_PLAYBOOK_MD>>>",
      "## 1) Executive Summary",
      "## 2) Ideal Customer Profile (ICP) & Pain Map",
      "## 3) Value Narrative (Problem → Insight → Outcome → Proof)",
      "## 4) Discovery Blueprint",
      "## 5) Recommended Call Flow (30–45 min)",
      "## 6) Objection Handling (Top 8)",
      "## 7) Competitive Angles",
      "## 8) KPIs & Success Criteria",
      "## 9) Email & Message Snippets",
      "## 10) Next Steps CTA & Mutual Action Plan Lite",
      "<<<END_PLAYBOOK_MD>>>",
      "<<<META>>>",
      "<<<END_META>>>",
    ].forEach(token => expect(user).toContain(token));
  });
});

