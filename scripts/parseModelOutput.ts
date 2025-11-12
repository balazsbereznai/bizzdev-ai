// scripts/parseModelOutput.ts
import fs from "node:fs";
import { extractPlaybookAndMeta } from "../lib/ai/extractBlocks";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: pnpm dlx tsx scripts/parseModelOutput.ts <file>");
  process.exit(1);
}

const full = fs.readFileSync(inputPath, "utf8");
const { markdown, meta } = extractPlaybookAndMeta(full);

console.log("=== MARKDOWN START ===");
console.log(markdown.slice(0, 200) + (markdown.length > 200 ? "..." : ""));
console.log("=== MARKDOWN END ===\n");

console.log("=== META ===");
console.log(meta);

