import { describe, it, expect } from "vitest";
import React from "react";
import { mdToPdfNodes } from "@/lib/markdownToPdf";
import { colors } from "@/pdf/theme";

const brand = {
  primary: colors.h1,
  primaryLight: colors.h2,
  text: colors.body,
  border: colors.border,
  chart1: colors.tableRowA,
  chart2: colors.tableRowB,
} as const;

describe("markdownToPdf", () => {
  it("produces unique table keys and respects pagebreaks", async () => {
    const md = `
# Title
| A | B |
|---|---|
| 1 | 2 |

Some text

| C | D |
|---|---|
| 3 | 4 |

<!--PAGEBREAK-->

| E | F |
|---|---|
| 5 | 6 |
`;
    const nodes = await mdToPdfNodes(md, brand);

    // Collect top-level keys for tables
    const tableKeys = nodes
      .map((n: any) => n?.key)
      .filter((k: any) => typeof k === "string" && k.endsWith("-tbl"));

    // We expect 3 tables, all unique keys
    expect(tableKeys.length).toBe(3);
    expect(new Set(tableKeys).size).toBe(3);

    // We also expect a pagebreak separator View (we added a spacer node per break)
    const pbKeys = nodes.map((n: any) => n?.key).filter((k: any) => typeof k === "string" && /^pb-/.test(k));
    expect(pbKeys.length).toBe(1);
  });
});

