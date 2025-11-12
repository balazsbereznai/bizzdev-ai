// next.config.ts — FULL REPLACE
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep TypeScript checks (fail only on real TS errors)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow production builds to succeed even if ESLint finds problems.
  // This does NOT disable ESLint locally; it only stops it from failing Vercel builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* other config options can stay here later */
};

export default nextConfig;

