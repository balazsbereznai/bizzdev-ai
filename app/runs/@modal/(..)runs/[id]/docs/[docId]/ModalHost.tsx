'use client';

import React from 'react';

type Props = {
  title: string;
  backHref: string;
  children: React.ReactNode;
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
    const t = setTimeout(doNavigateBack, 300);
    return () => clearTimeout(t);
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
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={requestClose}
        className={[
          'fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          show ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      {/* Modal container */}
      <div
        className={[
          'fixed inset-x-0 top-[calc(var(--topbar-h)+24px)] z-[65]',
          'mx-auto w-[min(1100px,calc(100vw-2rem))]',
          'rounded-2xl border border-[--color-border]',
          'bg-[--color-surface]/95 backdrop-blur-md shadow-[--shadow-2]',
          'transform-gpu transition duration-300',
          'flex flex-col overflow-hidden',
          show ? 'opacity-100 scale-100 translate-y-0'
               : 'opacity-0 scale-[0.98] translate-y-2',
        ].join(' ')}
        style={{ maxHeight: 'calc(100vh - var(--topbar-h) - 48px)' }}
      >
        {/* Header */}
        <div className="relative px-5 sm:px-6 py-4 border-b border-[--color-border] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-[--color-primary] flex-1">
              {title}
            </h1>

            {/* Client will portal its buttons here */}
            <div id="modal-actions" className="hidden sm:flex items-center gap-2" />

            <button
              aria-label="Close"
              onClick={requestClose}
              className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full
                         border border-[--color-border] bg-[--color-surface] text-[--color-ink]
                         shadow-[--shadow-1] hover:bg-[--color-muted] focus-visible:outline-none"
            >
              <span className="leading-none text-lg">×</span>
            </button>
          </div>
        </div>

        {/* Scroll body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </>
  );
}

