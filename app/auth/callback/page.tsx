// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function Callback() {
  const [msg, setMsg] = useState("Finishing sign in…");
  const [debug, setDebug] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/profile";

      if (!code) {
        setMsg("Missing login code. Please request a new magic link.");
        setDebug("URL query param `code` was missing on /auth/callback");
        return;
      }

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.session) {
          console.error("Error exchanging code for session", error);
          setMsg("Could not sign in. Try again.");
          setDebug(
            error?.message
              ? `Supabase error: ${error.message}`
              : `Supabase returned no session. Raw response: ${JSON.stringify(
                  data
                )}`
          );
          return;
        }

        setMsg("Signed in. Redirecting…");
        router.replace(next);
      } catch (err: any) {
        console.error("Unexpected error during auth callback", err);
        setMsg("Could not sign in. Try again.");
        setDebug(
          err?.message
            ? `Unexpected error: ${err.message}`
            : `Unexpected error: ${String(err)}`
        );
      }
    };

    run();
  }, [router, searchParams, supabase]);

  return (
    <main style={{ padding: 24 }}>
      <p>{msg}</p>
      {debug && (
        <pre
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "#b91c1c",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {debug}
        </pre>
      )}
    </main>
  );
}

