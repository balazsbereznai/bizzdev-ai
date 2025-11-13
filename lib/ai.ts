// lib/ai.ts
import OpenAI from "openai";

// Force no-store so Next.js won't try to cache the OpenAI fetch
const noStoreFetch: typeof fetch = (url, options) =>
  fetch(url, { ...(options || {}), cache: "no-store" });

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  fetch: noStoreFetch,
});

// Centralize model choice
export const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

