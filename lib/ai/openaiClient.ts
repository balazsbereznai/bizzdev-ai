import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 40_000, // 40 s global timeout
});

export async function callWithTimeout<T>(
  fn: () => Promise<T>,
  ms = 45_000
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("OpenAI request timeout")), ms)
    ),
  ]);
}

