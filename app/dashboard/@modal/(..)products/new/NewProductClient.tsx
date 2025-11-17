'use client';

import * as React from 'react';
import ProductEditor from '@/app/products/[id]/product-editor';

export default function NewProductClient() {
  const [id, setId] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  const createViaApi = React.useCallback(async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/products/new', {
        method: 'POST',
        cache: 'no-store',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Create failed (${res.status})`);
      }
      const json = await res.json();
      if (!json?.id) throw new Error('Create returned no id');
      setId(json.id);
    } catch (e: any) {
      setErr(e?.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  }, []);

  // Create the temp product when the modal mounts
  React.useEffect(() => {
    createViaApi();
  }, [createViaApi]);

  // Mark as saved when the editor dispatches bd:saved (on successful Save & Exit)
  React.useEffect(() => {
    function handleSaved() {
      setSaved(true);
    }
    window.addEventListener('bd:saved', handleSaved);
    return () => window.removeEventListener('bd:saved', handleSaved);
  }, []);

  // Cleanup: if this was a new product and never saved, delete it on unmount
  React.useEffect(() => {
    return () => {
      if (!id || saved) return;
      // fire-and-forget; we don't block navigation on cleanup
      fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
    };
  }, [id, saved]);

  if (busy) {
    return (
      <div className="p-6">
        <div className="indeterminate-bar mb-3" />
        <div className="text-sm text-[--color-ink-3]">Creating a new product…</div>
        <style jsx>{`
          .indeterminate-bar {
            height: 8px;
            width: 100%;
            border-radius: 9999px;
            overflow: hidden;
            position: relative;
            background: rgba(255, 255, 255, 0.12);
          }
          .indeterminate-bar::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.25) 25%,
              rgba(255, 255, 255, 0.6) 50%,
              rgba(255, 255, 255, 0.25) 75%,
              transparent 100%
            );
            background-size: 200% 100%;
            animation: bdInd 1.1s linear infinite;
            border-radius: inherit;
          }
          @keyframes bdInd {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6 space-y-3">
        <div className="text-red-400">Error: {String(err)}</div>
        <button className="btn" onClick={createViaApi}>
          Try again
        </button>
      </div>
    );
  }

  if (!id) return null;

  return (
    <div id="product-edit-form">
      <ProductEditor id={id} newFlag />
    </div>
  );
}

