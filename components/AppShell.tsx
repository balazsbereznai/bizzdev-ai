"use client";

import React from "react";
import Topbar from "@/components/Topbar";

type Props = {
  children: React.ReactNode;
  utilityBar?: React.ReactNode; // optional slot for sticky utility
};

export default function AppShell({ children, utilityBar }: Props) {
  return (
    <>
      <Topbar />
      <main className="pt-[var(--topbar-h)]">
        {utilityBar}
        <div className="mx-auto max-w-[var(--content-max)] px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </>
  );
}

