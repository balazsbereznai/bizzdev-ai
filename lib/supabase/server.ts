// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies, headers as nextHeaders } from "next/headers";

// Canonical Supabase server client for Next.js 15.
// Works in server actions, route handlers, and server components.
export async function supabaseServer() {
  const cookieStore = nextCookies();
  const headersList = nextHeaders();

  // Build a real Headers instance from Next's ReadonlyHeaders
  const headers = new Headers();
  headersList.forEach((value, key) => {
    headers.set(key, value);
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Next 15 + @supabase/ssr expect getAll/setAll-style cookie methods
      cookies: {
        getAll() {
          // Supabase only needs name/value; be explicit here
          return cookieStore
            .getAll()
            .map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(list) {
          list.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...(options as any) });
          });
        },
      },
      headers,
    }
  );

  return supabase;
}

// Also export default for convenience in places that do default import
export default supabaseServer;

