// lib/markdownToPdf.tsx
import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { colors as themeColors, spacing, fonts, fontSizes, BrandColors } from "@/pdf/theme";

/**
 * Deterministic Markdown → @react-pdf nodes
 * Headings #/##/###, paragraphs, bullets (1-level), pipe tables, callouts, pagebreaks.
 */

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.semibold, fontSize: fontSizes.h1, color: themeColors.h1, marginTop: spacing.sectionGap, marginBottom: spacing.paragraphGap },
  h2: { fontFamily: fonts.semibold, fontSize: fontSizes.h2, color: themeColors.h2, marginTop: spacing.sectionGap, marginBottom: 6 },
  h3: { fontFamily: fonts.medium,   fontSize: fontSizes.h3, color: themeColors.h2, marginTop: spacing.paragraphGap, marginBottom: 4 },
  p:  { marginBottom: spacing.paragraphGap, lineHeight: 1.35 },
  li: { marginBottom: 4 },
  liNested: { marginLeft: 8, marginBottom: 4 },
  table: { marginTop: spacing.tableGap, marginBottom: spacing.tableGap, borderWidth: 1, borderColor: themeColors.border },
  tr: { flexDirection: "row" },
  th: { flex: 1, fontFamily: fonts.semibold, fontSize: fontSizes.body, paddingVertical: spacing.rowPadV, paddingHorizontal: spacing.rowPadH, borderRightWidth: 1, borderRightColor: themeColors.border },
  td: { flex: 1, fontFamily: fonts.regular,  fontSize: fontSizes.body, paddingVertical: spacing.rowPadV, paddingHorizontal: spacing.rowPadH, borderRightWidth: 1, borderRightColor: themeColors.border },
});

function normalizePagebreaks(md: string) { return md.replace(/(?:<!--PAGEBREAK-->[\s]*){2,}/g, "<!--PAGEBREAK-->\n"); }
function splitOnPageBreaks(md: string): string[] { return md.split(/(?:\r?\n)?<!--PAGEBREAK-->(?:\r?\n)?/g); }

function isHeading(line: string) { if (/^#\s+/.test(line)) return 1; if (/^##\s+/.test(line)) return 2; if (/^###\s+/.test(line)) return 3; return 0; }
function stripHeading(line: string) { return line.replace(/^#{1,3}\s+/, "").trim(); }
function isListItem(line: string) { return /^- /.test(line.trim()); }
function nestLevel(line: string) { const m = line.match(/^(\s+)- /); const spaces = m?.[1]?.length ?? 0; return Math.min(1, Math.floor(spaces / 2)); }
function isDividerRow(row: string) { return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(row); }

function looksLikeTableBlock(lines: string[], startIdx: number) {
  if (startIdx + 2 >= lines.length) return false;
  const header = lines[startIdx]; const divider = lines[startIdx + 1];
  if (!header.includes("|")) return false;
  if (!isDividerRow(divider)) return false;
  return true;
}

function parseTable(lines: string[], startIdx: number) {
  const rows: string[][] = [];
  let i = startIdx;
  const headerRaw = lines[i++]; i++; // skip divider
  rows.push(splitRow(headerRaw));

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || !line.includes("|") || isDividerRow(line)) break;
    rows.push(splitRow(line));
    i++;
  }

  const width = rows[0]?.length ?? 0;
  for (let r = 0; r < rows.length; r++) {
    if (rows[r].length < width) rows[r] = [...rows[r], ...Array(width - rows[r].length).fill("")];
    else if (rows[r].length > width) rows[r] = rows[r].slice(0, width);
    rows[r] = rows[r].map((c) => c.trim().replace(/\s+/g, " "));
  }

  return { rows, nextIndex: i };
}

function splitRow(line: string) {
  const a = line.split("|").map((s) => s.trim());
  if (a[0] === "") a.shift();
  if (a[a.length - 1] === "") a.pop();
  return a;
}

function renderTable(rows: string[][], brand: BrandColors, keyPrefix: string) {
  if (rows.length < 2) {
    return (
      <View key={`${keyPrefix}-fallback`} style={styles.p}>
        {rows[0]?.map((h, i) => (
          <Text key={`${keyPrefix}-tf-${i}`} style={styles.p}>- {h}</Text>
        ))}
      </View>
    );
  }

  const header = rows[0];
  const body = rows.slice(1);

  return (
    <View style={[styles.table, { borderColor: brand.border }]} wrap key={`${keyPrefix}-tbl`}>
      <View style={[styles.tr, { backgroundColor: brand.chart1 }]} key={`${keyPrefix}-hdr`}>
        {header.map((cell, cidx) => (
          <Text key={`${keyPrefix}-th-${cidx}`} style={[styles.th, { borderRightColor: brand.border }]}>
            {cell}
          </Text>
        ))}
      </View>
      {body.map((row, ridx) => {
        const zebra = ridx % 2 === 0 ? brand.chart2 : "#ffffff";
        return (
          <View key={`${keyPrefix}-tr-${ridx}`} style={[styles.tr, { backgroundColor: zebra }]}>
            {row.map((cell, cidx) => (
              <Text key={`${keyPrefix}-td-${ridx}-${cidx}`} style={[styles.td, { borderRightColor: brand.border }]}>
                {safeCell(cell)}
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function safeCell(s: string) { return s.length > 500 ? s.slice(0, 497) + "…" : s; }
function isCallout(line: string) { return /^\s*\*\*[A-Za-z ][^*]*:\*\*/.test(line); }

function renderInlineBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*/);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i];
    nodes.push(i % 2 === 1 ? <Text key={`b-${i}`} style={{ fontFamily: fonts.semibold }}>{chunk}</Text> : <Text key={`t-${i}`}>{chunk}</Text>);
  }
  return nodes;
}

function renderParagraph(line: string) { return /\*\*.+\*\*/.test(line) ? <Text style={styles.p}>{renderInlineBold(line)}</Text> : <Text style={styles.p}>{line}</Text>; }
function renderHeading(level: number, content: string) { if (level === 1) return <Text style={styles.h1}>{content}</Text>; if (level === 2) return <Text style={styles.h2}>{content}</Text>; return <Text style={styles.h3}>{content}</Text>; }

type Brand = BrandColors;

export async function mdToPdfNodes(md: string, brand: Brand) {
  const nodes: React.ReactNode[] = [];
  const normalized = normalizePagebreaks(md);
  const chunks = splitOnPageBreaks(normalized);

  chunks.forEach((chunk, chunkIdx) => {
    const lines = chunk.split(/\r?\n/);
    let i = 0;
    let tableIdx = 0; // <- unique per chunk

    while (i < lines.length) {
      const line = lines[i] ?? "";
      const trimmed = line.trim();
      if (!trimmed) { i++; continue; }

      if (looksLikeTableBlock(lines, i)) {
        const { rows, nextIndex } = parseTable(lines, i);
        nodes.push(renderTable(rows, brand, `c${chunkIdx}-t${tableIdx++}`));
        i = nextIndex;
        continue;
      }

      const h = isHeading(line);
      if (h > 0) { nodes.push(renderHeading(h, stripHeading(line))); i++; continue; }

      if (isListItem(line)) {
        const listLines: string[] = [];
        while (i < lines.length && (isListItem(lines[i]) || /^\s+- /.test(lines[i]))) { listLines.push(lines[i]); i++; }
        nodes.push(
          <View key={`c${chunkIdx}-ul-${i}`} style={{ marginBottom: spacing.paragraphGap }}>
            {listLines.map((ll, idx) => {
              const lvl = nestLevel(ll);
              const text = ll.replace(/^\s*-\s+/, "");
              return <Text key={`c${chunkIdx}-li-${idx}`} style={lvl === 0 ? styles.li : styles.liNested}>• {text}</Text>;
            })}
          </View>
        );
        continue;
      }

      if (isCallout(line)) { nodes.push(renderParagraph(line)); i++; continue; }
      nodes.push(renderParagraph(line));
      i++;
    }

    if (chunkIdx < chunks.length - 1) nodes.push(<View key={`pb-${chunkIdx}`} style={{ height: spacing.sectionGap }} />);
  });

  return nodes;
}

