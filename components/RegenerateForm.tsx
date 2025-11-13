"use client";

import * as React from "react";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { generatePlaybookAction } from "@/app/actions/generate";

type Props = {
  docId: string;
  initial?: Partial<{
    company_name: string;
    product_name: string;
    product_summary: string;
    industry: string;
    role_title: string;
    company_size: string;
    hq_region: string;
    target_regions: string;
    sales_motion: "Outbound" | "Expansion" | "Channel" | "Hybrid";
    primary_objective: string;
    tone: "Trusted advisor" | "Challenger" | "Friendly expert" | "Formal";
    experience_level: "Experienced" | "Unexperienced";
    word_limit: number;
  }>;
};

export default function RegenerateForm({ docId, initial = {} }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: initial.company_name ?? "Acme",
    product_name: initial.product_name ?? "RocketAI",
    product_summary: initial.product_summary ?? "AI-assisted sales enablement platform",
    industry: initial.industry ?? "B2B SaaS",
    role_title: initial.role_title ?? "VP Sales",
    company_size: initial.company_size ?? "200–500",
    hq_region: initial.hq_region ?? "EU",
    target_regions: initial.target_regions ?? "EMEA, US",
    sales_motion: (initial.sales_motion as any) ?? "Outbound",
    primary_objective: initial.primary_objective ?? "Increase qualified pipeline",
    tone: (initial.tone as any) ?? "Trusted advisor",
    experience_level: (initial.experience_level as any) ?? "Experienced",
    word_limit: initial.word_limit ?? 1600,
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    startTransition(async () => {
      try {
        const payloadInput = {
          company_name: form.company_name,
          product_name: form.product_name,
          product_summary: form.product_summary,
          industry: form.industry,
          role_title: form.role_title,
          company_size: form.company_size,
          hq_region: form.hq_region,
          target_regions: form.target_regions,
          sales_motion: form.sales_motion as any,
          primary_objective: form.primary_objective,
          tone: form.tone as any,
          experience_level: form.experience_level as any,
          word_limit: Number(form.word_limit),
        };

        // Cast to any to avoid over-strict typing while keeping payload intact
        await generatePlaybookAction({
          docId,
          input: payloadInput as any,
        } as any);

        setOk("Regenerated successfully.");
        router.refresh();
      } catch (e: any) {
        console.error(e);
        setErr(e?.message || "Generation failed");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 border rounded-lg p-4 bg-white">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Company name</span>
          <input
            className="border rounded px-2 py-1"
            value={form.company_name}
            onChange={(e) => update("company_name", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Product name</span>
          <input
            className="border rounded px-2 py-1"
            value={form.product_name}
            onChange={(e) => update("product_name", e.target.value)}
          />
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm font-medium">Product summary</span>
          <textarea
            className="border rounded px-2 py-1"
            rows={2}
            value={form.product_summary}
            onChange={(e) => update("product_summary", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Industry</span>
          <input
            className="border rounded px-2 py-1"
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Role title</span>
          <input
            className="border rounded px-2 py-1"
            value={form.role_title}
            onChange={(e) => update("role_title", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Company size</span>
          <input
            className="border rounded px-2 py-1"
            value={form.company_size}
            onChange={(e) => update("company_size", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">HQ region</span>
          <input
            className="border rounded px-2 py-1"
            value={form.hq_region}
            onChange={(e) => update("hq_region", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Target regions</span>
          <input
            className="border rounded px-2 py-1"
            value={form.target_regions}
            onChange={(e) => update("target_regions", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Sales motion</span>
          <select
            className="border rounded px-2 py-1"
            value={form.sales_motion}
            onChange={(e) => update("sales_motion", e.target.value as any)}
          >
            <option>Outbound</option>
            <option>Expansion</option>
            <option>Channel</option>
            <option>Hybrid</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Primary objective</span>
          <input
            className="border rounded px-2 py-1"
            value={form.primary_objective}
            onChange={(e) => update("primary_objective", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Tone</span>
          <select
            className="border rounded px-2 py-1"
            value={form.tone}
            onChange={(e) => update("tone", e.target.value as any)}
          >
            <option>Trusted advisor</option>
            <option>Challenger</option>
            <option>Friendly expert</option>
            <option>Formal</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Experience level</span>
          <select
            className="border rounded px-2 py-1"
            value={form.experience_level}
            onChange={(e) => update("experience_level", e.target.value as any)}
          >
            <option>Experienced</option>
            <option>Unexperienced</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Word limit</span>
          <input
            type="number"
            className="border rounded px-2 py-1"
            value={form.word_limit}
            onChange={(e) => update("word_limit", Number(e.target.value))}
            min={800}
            max={2200}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded bg-[#283c63] px-3 py-1.5 text-white disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? "Regenerating…" : "Regenerate"}
        </button>
        {ok && <span className="text-sm text-green-700">{ok}</span>}
        {err && <span className="text-sm text-red-700">{err}</span>}
      </div>
    </form>
  );
}

