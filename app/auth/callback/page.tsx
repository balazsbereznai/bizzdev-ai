// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function Callback() {
  const [msg, setMsg] = useState("Finishing sign in…");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/profile";

      if (!code) {
        setMsg("Missing login code. Please request a new magic link.");
        return;
      }

      // Exchange the code from the magic link for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        console.error("Error exchanging code for session", error);
        setMsg("Could not sign in. Try again.");
        return;
      }

      setMsg("Signed in. Redirecting…");
      router.replace(next);
    };

    run();
  }, [router, searchParams, supabase]);

  return <main style={{ padding: 24 }}>{msg}</main>;
}

