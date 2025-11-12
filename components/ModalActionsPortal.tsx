// components/ModalActionsPortal.tsx
'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

export default function ModalActionsPortal({ children }: { children: React.ReactNode }) {
  const [host, setHost] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setHost(document.getElementById('modal-actions'));
  }, []);

  if (!host) return null;
  return createPortal(children, host);
}

