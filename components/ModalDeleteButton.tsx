// components/ModalDeleteButton.tsx
'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase-browser';
import BrandButton from '@/components/ui/BrandButton';

type Props = {
  table: 'company_profile' | 'products' | 'icps';
  id: string;
  label?: string;
  afterHref?: string; // default /dashboard/hub
};

export default function ModalDeleteButton({
  table,
  id,
  label = 'Delete',
  afterHref = '/dashboard/hub',
}: Props) {
  const supabase = createClient();
  const [busy, setBusy] = React.useState(false);

  const onDelete = async () => {
    if (!id) return;
    const ok = confirm(
      'Are you sure you want to delete this item? This cannot be undone.'
    );
    if (!ok) return;
    try {
      setBusy(true);
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      // Always land on Hub after delete
      window.location.href = afterHref;
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BrandButton
      onClick={onDelete}
      disabled={busy}
      outline
      className="!py-2 !px-3 !border-red-400 !text-red-200 hover:!bg-red-500/10"
      title="Delete this item"
    >
      {busy ? 'Deleting…' : label}
    </BrandButton>
  );
}

