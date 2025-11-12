'use client';

import React from 'react';
import BrandButton from '@/components/ui/BrandButton';
import { createCompanyFromHub } from '@/app/actions/companyActions';

export default function NewCompanyButton() {
  return (
    <form action={createCompanyFromHub}>
      <BrandButton type="submit" className="!py-2 !px-3 !text-[#0b1220]">
        Add new company
      </BrandButton>
    </form>
  );
}

