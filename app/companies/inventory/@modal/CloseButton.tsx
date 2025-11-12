'use client';

import React from 'react';

export default function CloseButton() {
  const onClose = () => {
    if (window.history.length > 1) history.back();
    else window.location.href = '/companies/inventory';
  };

  return (
    <button
      aria-label="Close"
      onClick={onClose}
      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full
                 border border-[--color-border] bg-[--color-surface] text-[--color-ink]
                 shadow-[--shadow-1] hover:bg-[--color-muted] focus-visible:outline-none"
    >
      <span className="block leading-none text-lg">×</span>
    </button>
  );
}

