// app/layout.tsx — FULL REPLACE
import "@/app/globals.css";
import React from "react";
import Topbar from "@/components/Topbar";
import { ToastProvider } from "@/components/ui/Toast";

// Keep your existing dynamic export as-is
export const dynamic = "force-dynamic";

// Vercel instrumentation (added)
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* App chrome */}
        <Topbar />

        {/* Global toasts + page content on dark patterned background */}
        <ToastProvider>
          <main className="min-h-screen pattern-iso3d-elite">
            {children}
          </main>
        </ToastProvider>

        {/* Telemetry: non-visual */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

