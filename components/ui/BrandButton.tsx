// components/ui/BrandButton.tsx
"use client";
import React, { CSSProperties } from "react";
import { Button } from "@/components/vendor/catalyst/button";

type Props = React.ComponentProps<typeof Button> & {
  hex?: string;         // background
  borderHex?: string;   // optional custom border
  hoverOverlay?: string;// optional overlay
};

// ✅ default is your brand green via CSS var
export default function BrandButton({
  hex = "var(--color-primary)",
  borderHex,
  hoverOverlay = "rgba(255,255,255,.10)",
  className,
  style,
  ...rest
}: Props) {
  const cssVars: CSSProperties = {
    ["--btn-bg" as any]: hex,
    ["--btn-border" as any]: borderHex ?? hex,
    ["--btn-hover-overlay" as any]: hoverOverlay,
  };
  return <Button {...rest} className={className} style={{ ...cssVars, ...style }} />;
}

