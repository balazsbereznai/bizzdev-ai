// pdf/registerFonts.ts
import { Font } from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";

let registered = false;

function fileToDataUrl(p: string) {
  const buf = fs.readFileSync(p);
  return `data:font/ttf;base64,${buf.toString("base64")}`;
}

export function registerFonts() {
  if (registered) return;
  registered = true;

  const root = process.cwd();
  const REG = path.join(root, "public", "fonts", "Inter-Regular.ttf");
  const MED = path.join(root, "public", "fonts", "Inter-Medium.ttf");
  const SEM = path.join(root, "public", "fonts", "Inter-SemiBold.ttf");

  const hasREG = fs.existsSync(REG);
  const hasMED = fs.existsSync(MED);
  const hasSEM = fs.existsSync(SEM);

  // (Optional) one-time debug; comment out later
  // console.log("[registerFonts] Inter font presence", { hasREG, hasMED, hasSEM, REG, MED, SEM });

  try {
    if (hasREG) Font.register({ family: "Inter-Regular", src: fileToDataUrl(REG) });
    if (hasMED) Font.register({ family: "Inter-Medium",  src: fileToDataUrl(MED) });
    if (hasSEM) Font.register({ family: "Inter-SemiBold", src: fileToDataUrl(SEM) });

    // Optional single-family mapping if you ever want to use fontWeight
    if (hasREG) Font.register({ family: "Inter", src: fileToDataUrl(REG), fontWeight: "normal" });
    if (hasMED) Font.register({ family: "Inter", src: fileToDataUrl(MED), fontWeight: 500 as any });
    if (hasSEM) Font.register({ family: "Inter", src: fileToDataUrl(SEM), fontWeight: 600 as any });
  } catch (e) {
    console.warn("[registerFonts] Font.register failed; PDF will fall back to default fonts.", e);
  }
}

