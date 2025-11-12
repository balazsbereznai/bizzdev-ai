import { ReactNode } from "react";

export default function DocShell({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[70vh] rounded-2xl border border-zinc-800 bg-zinc-950/40 shadow-xl">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-6 py-5
                      bg-gradient-to-r from-emerald-900/20 via-zinc-900 to-zinc-900 rounded-t-2xl">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50 tracking-tight">{title}</h1>
          {subtitle ? <p className="text-sm text-zinc-400">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
