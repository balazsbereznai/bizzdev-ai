'use client';

import React from 'react';
import BrandButton from '@/components/ui/BrandButton';

type Props = {
  title: string;
  backHref: string;
  children: React.ReactNode;
};

export default function ModalHost({ title, backHref, children }: Props) {
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [saveDisabled, setSaveDisabled] = React.useState(false);
  const saveBtnRef = React.useRef<HTMLButtonElement | null>(null);

  // NAV
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

  // Find real "Save & Exit" and mirror disabled state
  React.useEffect(() => {
    let tries = 0;

    const findBtn = () => {
      const host = document.querySelector<HTMLElement>('.modal-host');
      if (!host) return false;

      const buttons = Array.from(host.querySelectorAll<HTMLButtonElement>('button'));
      const target =
        buttons.find(b => (b.textContent || '').trim().includes('Save & Exit')) || null;

      if (target) {
        saveBtnRef.current = target;
        setSaveDisabled(target.disabled);
        return true;
      }
      return false;
    };

    const interval = setInterval(() => {
      tries += 1;
      if (findBtn() || tries > 20) clearInterval(interval);
    }, 200);

    const obs = new MutationObserver(() => {
      const btn = saveBtnRef.current;
      if (btn) setSaveDisabled(btn.disabled);
    });
    obs.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled'],
    });

    return () => {
      clearInterval(interval);
      obs.disconnect();
    };
  }, []);

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

      {/* Modal */}
      <div
        className={[
          'modal-host',
          'fixed inset-x-0 top-[calc(var(--topbar-h)+24px)] z-[65]',
          'mx-auto w-[min(880px,calc(100vw-2rem))]',
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
        <div className="relative px-6 py-4 border-b border-[--color-border] rounded-t-2xl shrink-0">
          <h1 className="text-2xl font-semibold text-[--color-primary]">{title}</h1>
          <button
            aria-label="Close"
            onClick={requestClose}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface] text-[--color-ink] shadow-[--shadow-1] hover:bg-[--color-muted] focus-visible:outline-none"
          >
            <span className="block leading-none text-lg">×</span>
          </button>
        </div>

        {/* Scroll region + spacer + sticky footer */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pb-28">
            {children}
          </div>

          <div className="sticky bottom-0 left-0 right-0 z-20 border-t border-[--color-border] bg-[--color-surface] px-6 py-3">
            <div className="flex items-center justify-end">
              <BrandButton
                type="button"
                onClick={() => saveBtnRef.current?.click()}
                disabled={saveDisabled}
                className="!py-2 !px-3"
              >
                Save changes
              </BrandButton>
            </div>
          </div>
        </div>

        {/* Hide inner top action row (Save & Exit / Cancel) and big H1 inside modal */}
        <style jsx global>{`
          .modal-host .container-px > .flex.items-center.justify-between.gap-4 { display: none !important; }
        `}</style>
      </div>
    </>
  );
}


