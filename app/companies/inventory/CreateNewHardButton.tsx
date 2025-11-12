'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function CreateNewHardButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push('/companies/new')}
      className="btn btn-primary !py-2 !px-3 !text-[#0b1220]"
      aria-label="Create new company"
    >
      Create New
    </button>
  );
}

