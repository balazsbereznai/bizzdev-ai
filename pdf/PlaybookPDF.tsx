// pdf/PlaybookPDF.tsx
import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { mdToPdfNodes } from "@/lib/markdownToPdf";
// If no "@/": import { mdToPdfNodes } from "../lib/markdownToPdf";
import { registerFonts } from "@/pdf/registerFonts";
// If no "@/": import { registerFonts } from "./registerFonts";
import { colors, spacing, fonts, fontSizes } from "@/pdf/theme";
// If no "@/": import { colors, spacing, fonts, fontSizes } from "./theme";

registerFonts();

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: spacing.pageMargin,
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
    color: colors.body,
    lineHeight: 1.35,
  },
  container: { width: "100%" },
  coverTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.h1,
    color: colors.h1,
    marginBottom: 4,
  },
  coverSubtitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.h3,
    color: colors.h2,
    marginBottom: 6,
  },
  hr: { height: 2, backgroundColor: colors.tableRowB, marginBottom: spacing.sectionGap },
  content: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
    color: colors.body,
  },
});

type Props = { title: string; subtitle?: string; markdown: string };

export default async function PlaybookPDF({ title, subtitle, markdown }: Props) {
  // Brand colors passed to markdown renderer (tables/zebra/etc.)
  const brandColors = {
    primary: colors.h1,
    primaryLight: colors.h2,
    text: colors.body,
    border: colors.border,
    chart1: colors.tableRowA,
    chart2: colors.tableRowB,
  } as const;

  const contentNodes = await mdToPdfNodes(markdown, brandColors);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Cover */}
          <View style={{ paddingBottom: 8 }}>
            <Text style={styles.coverTitle}>{title || "Sales Playbook"}</Text>
            {subtitle ? <Text style={styles.coverSubtitle}>{subtitle}</Text> : null}
            <View style={styles.hr} />
          </View>

          {/* Content */}
          <View style={styles.content}>{contentNodes}</View>
        </View>
      </Page>
    </Document>
  );
}

