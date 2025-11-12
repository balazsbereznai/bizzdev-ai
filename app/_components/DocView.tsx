"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DocView({ id, heading }: { id: string; heading: string }) {
  const [doc, setDoc] = useState<any>(null);

  useEffect(() => { (async () => {
    const { data, error } = await sb.from("documents").select("*").eq("id", id).single();
    if (!error) setDoc(data);
  })(); }, [id]);

  if (!doc) return <div className="p-6">Loading…</div>;

  return (
    <div className="mx-auto max-w-[64rem] px-4 md:px-6 py-8 space-y-4">
      <h1 className="text-3xl md:text-4xl font-semibold">{doc.title || heading}</h1>
      <div className="rounded-2xl border border-white/10 p-6 bg-black/10 whitespace-pre-wrap leading-7">
        {doc.content_md}
      </div>
      <a
        href={`/runs/${doc.run_id}`}
        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[hsl(var(--brand))] text-black"
      >
        Back to Run
      </a>
    </div>
  );
}
