// components/ui/Toast.tsx
"use client";
import React from "react";

type ToastMsg = { id: number; type?: "success" | "error" | "info"; title: string; desc?: string };
type Ctx = {
  push: (msg: Omit<ToastMsg, "id">) => void;
};
const ToastCtx = React.createContext<Ctx | null>(null);
export function useToast() {
  const c = React.useContext(ToastCtx);
  if (!c) throw new Error("useToast must be used within <ToastProvider>");
  return c;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = React.useState<ToastMsg[]>([]);
  const idRef = React.useRef(1);

  const push: Ctx["push"] = (m) => {
    const id = idRef.current++;
    setList((prev) => [...prev, { id, type: m.type ?? "info", title: m.title, desc: m.desc }]);
    setTimeout(() => setList((prev) => prev.filter((x) => x.id !== id)), 4000);
  };

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed z-[60] bottom-4 right-4 flex flex-col gap-2">
        {list.map((t) => (
          <div
            key={t.id}
            className={
              "card elev-2 border-l-4 " +
              (t.type === "success"
                ? "border-l-emerald-500"
                : t.type === "error"
                ? "border-l-rose-500"
                : "border-l-[--color-primary]")
            }
            role="status"
          >
            <div className="card-body py-3 pr-4">
              <div className="font-medium">{t.title}</div>
              {t.desc ? <div className="text-sm text-[--color-ink-3] mt-1">{t.desc}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

