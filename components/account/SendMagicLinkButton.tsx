// components/account/SendMagicLinkButton.tsx — NEW FILE
"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SendMagicLinkButton({ email }: { email: string }) {
  const [sending, setSending] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  // Client-side Supabase
  const supabase = React.useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  async function onSend() {
    setMsg(null);
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMsg("Magic link sent. Check your email.");
    } catch (e: any) {
      setMsg(e?.message || "Could not send magic link.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onSend}
        disabled={sending}
        className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-60"
      >
        {sending ? "Sending..." : "Send me a sign-in link"}
      </button>
      {msg ? <span className="text-xs opacity-80">{msg}</span> : null}
    </div>
  );
}

