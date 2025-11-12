'use client';

import React from 'react';

type Props = {
  title: string;
  backHref: string;           // fallback if history is shallow
  children: React.ReactNode;  // modal body
};

export default function ModalHost({ title, backHref, children }: Props) {
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  const doNavigateBack = React.useCallback(() => {
    if (window.history.length > 1) history.back();
    else window.location.href = backHref;
  }, [backHref]);

  const requestClose = React.useCallback(() => {
    setClosing(true);
    const timeout = setTimeout(doNavigateBack, 300);
    return () => clearTimeout(timeout);
  }, [doNavigateBack]);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') requestClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestClose]);

  const show = mounted && !closing;

  return (
    <>
      <div
        aria-hidden
        onClick={requestClose}
        className={[
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-300",
          show ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <div
        className={[
          "fixed inset-x-0 top-[calc(var(--topbar-h)+24px)] z-[65]",
          "mx-auto w-[min(880px,calc(100vw-2rem))]",
          "rounded-2xl border border-[--color-border]",
          "bg-[--color-surface]/95 backdrop-blur-md shadow-[--shadow-2]",
          "transform-gpu will-change-[transform,opacity]",
          "transition duration-300",
          show ? "opacity-100 scale-100 translate-y-0"
               : "opacity-0 scale-[0.98] translate-y-2",
        ].join(" ")}
      >
        <div className="relative px-6 py-4 border-b border-[--color-border] rounded-t-2xl">
          <h1 className="text-2xl font-semibold text-[--color-primary]">{title}</h1>
          <button
            aria-label="Close"
            onClick={requestClose}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full
                       border border-[--color-border] bg-[--color-surface] text-[--color-ink]
                       shadow-[--shadow-1] hover:bg-[--color-muted] focus-visible:outline-none"
          >
            <span className="block leading-none text-lg">×</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </>
  );
}

