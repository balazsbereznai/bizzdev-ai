// pdf/theme.ts
export const colors = {
  h1: "#283c63",
  h2: "#375287",
  body: "#000000",
  tableRowA: "#b0d1fa",
  tableRowB: "#e0edfd",
  border: "#d4def7",
};

export const spacing = {
  pageMargin: 36,
  sectionGap: 16,
  paragraphGap: 8,
  tableGap: 10,
  rowPadV: 6,
  rowPadH: 8,
};

// MUST match registerFonts() family names
export const fonts = {
  regular: "Inter-Regular",
  medium:  "Inter-Medium",
  semibold:"Inter-SemiBold",
};

export const fontSizes = {
  h1: 20,
  h2: 13,
  h3: 11,
  body: 10,
  small: 9,
};

export type BrandColors = {
  primary: string;
  primaryLight: string;
  text: string;
  border: string;
  chart1: string;
  chart2: string;
};

