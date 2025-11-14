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
      const next = searchParams.get("next") || "/profile";

      // At this point, the Supabase browser client should have already
      // processed the magic link code from the URL (detectSessionInUrl).
      // We just need to check if a user/session is present.
      const { data, error } = await supabase.auth.getUser();

      if (data.user) {
        setMsg("Signed in. Redirecting…");
        setDebug(null);
        router.replace(next);
        return;
      }

      setMsg("Could not sign in. Try again.");
      if (error) {
        console.error("Supabase getUser error on callback", error);
        setDebug(`Supabase getUser error: ${error.message}`);
      } else {
        setDebug("No user session found after magic link callback.");
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

