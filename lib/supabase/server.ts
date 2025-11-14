// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies, headers as nextHeaders } from "next/headers";

// Canonical Supabase server client for Next.js 15.
// Works in server actions, route handlers, and server components.
export async function supabaseServer() {
  const cookieStore = await nextCookies();
  const headersList = await nextHeaders();

  // Build a real Headers instance from Next's ReadonlyHeaders
  const headers = new Headers();
  headersList.forEach((value, key) => {
    headers.set(key, value);
  });

  // Provide both the "old" and "new" cookie method shapes so whichever
  // version of @supabase/ssr you have can use what it expects.
  const cookieMethods = {
    // Old-style methods (CookieMethodsServerDeprecated)
    get: (name: string) => cookieStore.get(name)?.value,
    set: (
      name: string,
      value: string,
      options?: Parameters<(typeof cookieStore)["set"]>[0]
    ) => {
      cookieStore.set({ name, value, ...(options as any) });
    },
    remove: (
      name: string,
      options?: Parameters<(typeof cookieStore)["delete"]>[0]
    ) => {
      cookieStore.delete({ name, ...(options as any) });
    },

    // New-style methods (CookieMethodsServer)
    getAll: () =>
      cookieStore
        .getAll()
        .map((c) => ({ name: c.name, value: c.value })),
    setAll: (
      list: { name: string; value: string; options?: any }[]
    ) => {
      list.forEach(({ name, value, options }) => {
        cookieStore.set({ name, value, ...(options as any) });
      });
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Cast as any to bypass the overload tug-of-war between
      // CookieMethodsServer and CookieMethodsServerDeprecated.
      cookies: cookieMethods as any,
      headers: headers as any,
    } as any
  );

  return supabase;
}

// Also export default for convenience in places that do default import
export default supabaseServer;

