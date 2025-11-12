// components/theme/ThemeProvider.tsx
"use client";

import { useEffect } from "react";

export default function ThemeProvider({
  theme = "deep", // "deep" | "slate"
  children,
}: {
  theme?: "deep" | "slate";
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Set attribute on <html>
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
}

