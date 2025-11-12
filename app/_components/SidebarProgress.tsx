"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STEPS = [
  { slug: "onboarding",  label: "Setup" },
  { slug: "workspace",   label: "Workspace" },
  { slug: "runs",        label: "Run overview" },
  { slug: "playbooks",   label: "Playbook" },
  { slug: "research",    label: "Client research" },
  { slug: "culture",     label: "Cultural tips" },
  { slug: "proposal",    label: "Proposal" },
  { slug: "negotiation", label: "Negotiation" },
];

export default function SidebarProgress() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-64 border-r border-white/10 min-h-screen">
      <div className="p-4">
        <div className="text-xs uppercase opacity-60 mb-3">Progress</div>
        <nav className="space-y-1">
          {STEPS.map((s, i) => {
            const active = pathname.includes(`/${s.slug}`);
            return (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-xl border",
                  active ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))]" : "border-white/10 hover:border-white/25"
                ].join(" ")}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20">{i+1}</span>
                <span>{s.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

