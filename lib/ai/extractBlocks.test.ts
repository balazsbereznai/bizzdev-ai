import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractPlaybookAndMeta } from "./extractBlocks";

const SAMPLE = `
<<<BEGIN_PLAYBOOK_MD>>>
# Acme — RocketAI Sales Playbook
## 1) Executive Summary
Hello
<<<END_PLAYBOOK_MD>>>

<<<META>>>
{
  "doc_title": "Acme — RocketAI Sales Playbook",
  "email_subject": "RocketAI: tailored playbook attached",
  "email_preheader": "Concise ICP, discovery, objections, KPIs — ready to use",
  "filename_slug": "acme_rocketai_sales-playbook"
}
<<<END_META>>>
`;

describe("extractBlocks", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("parses markdown and meta", () => {
    const { markdown, meta } = extractPlaybookAndMeta(SAMPLE);
    expect(markdown).toContain("# Acme — RocketAI Sales Playbook");
    expect(meta.filename_slug).toBe("acme_rocketai_sales-playbook");
    expect(meta.doc_title).toBe("Acme — RocketAI Sales Playbook");
  });

  it("returns safe fallbacks without markers (no throw)", () => {
    const { markdown, meta } = extractPlaybookAndMeta("oops");
    expect(markdown).toBe(""); // tolerant extractor
    expect(meta.doc_title).toBe("Sales Playbook");
    expect(meta.filename_slug).toBe("sales-playbook");
    expect(warnSpy).toHaveBeenCalled(); // it should log a warning
  });

  it("falls back to slugified title if missing filename_slug", () => {
    // Remove the filename_slug property cleanly (first/middle/last)
    const INPUT = SAMPLE.replace(/,\s*"filename_slug"\s*:\s*"[^"]*"/m, "")
                        .replace(/"filename_slug"\s*:\s*"[^"]*"\s*,?/m, "");
    const { meta } = extractPlaybookAndMeta(INPUT);
    expect(meta.filename_slug).toBe("acme-rocketai-sales-playbook");
  });
});

