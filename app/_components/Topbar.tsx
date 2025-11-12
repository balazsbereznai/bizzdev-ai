"use client";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-[80rem] px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="font-semibold">BizzDev.ai</div>
        <nav className="flex gap-2">
          <a href="/runs/new" className="px-3 py-1.5 rounded-xl bg-[hsl(var(--brand))] text-black">New run</a>
          <a href="/products" className="px-3 py-1.5 rounded-xl border border-white/20">Products</a>
          <a href="/icps" className="px-3 py-1.5 rounded-xl border border-white/20">ICPs</a>
        </nav>
      </div>
    </header>
  );
}

