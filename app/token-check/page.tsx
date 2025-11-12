// app/token-check/page.tsx
import { ThemeSwitcher } from "@/components/twp/primitives/ThemeSwitcher";

export default function TokenCheckPage() {
  const swatches = [
    { name: "bg",        cls: "bg-bg" },
    { name: "surface",   cls: "bg-surface" },
    { name: "text",      cls: "bg-text text-bg" },
    { name: "muted",     cls: "bg-muted text-bg" },
    { name: "primary",   cls: "bg-primary text-bg" },
    { name: "accent",    cls: "bg-accent text-bg" },
    { name: "accent-2",  cls: "bg-accent-2 text-bg" },
    { name: "warning",   cls: "bg-warning text-bg" },
    { name: "success",   cls: "bg-success text-bg" },
    { name: "ring",      cls: "bg-ring text-bg" },
    { name: "border",    cls: "bg-border text-bg" },
  ];

  return (
    <main className="min-h-screen p-6 bg-bg text-text">
      <div className="mb-6 flex justify-end">
        <ThemeSwitcher />
      </div>

      <h1 className="text-2xl font-semibold mb-4">Token Utilities Check</h1>
      <p className="text-sm text-muted mb-6">
        These boxes use Tailwind utilities mapped to CSS variables from <code>styles/twp/index.css</code>.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {swatches.map((s) => (
          <div key={s.name} className="rounded-xl border border-border overflow-hidden">
            <div className={`h-16 ${s.cls}`} />
            <div className="p-2 text-sm flex items-center justify-between bg-surface">
              <span>{s.name}</span>
              <code className="text-muted">{s.cls}</code>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button className="px-3 py-1.5 rounded-lg bg-primary text-bg ring-1 ring-ring">
          Primary button
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-accent text-bg ring-1 ring-ring">
          Accent button
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-surface text-text ring-1 ring-border">
          Surface button
        </button>
      </div>
    </main>
  );
}

