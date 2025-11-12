export async function getBrowser() {
  // Local dev uses full puppeteer; on Vercel we can swap to chromium + puppeteer-core
  const puppeteer = await import("puppeteer");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--font-render-hinting=medium",
      "--ignore-certificate-errors",
    ],
  });

  return browser;
}

