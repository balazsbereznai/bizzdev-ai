// lib/puppeteer.ts

/**
 * Placeholder Puppeteer integration.
 *
 * The original vendor code expected a `puppeteer` dependency which is not
 * installed in this project, causing TypeScript/module resolution errors
 * during build.
 *
 * For now we keep the same function signature but throw a clear runtime
 * error if this is ever called. That way:
 * - The app can build and run.
 * - Any feature that tries to use Puppeteer fails loudly and explicitly,
 *   instead of failing at import time.
 *
 * If you decide to enable Puppeteer-based rendering later, you can:
 *   1) `pnpm add puppeteer` (or chromium + puppeteer-core for serverless),
 *   2) Restore a proper implementation here.
 */

export async function getBrowser(): Promise<any> {
  throw new Error(
    "Puppeteer-based browser rendering is not configured. Install 'puppeteer' and update lib/puppeteer.ts if you need this feature."
  );
}

