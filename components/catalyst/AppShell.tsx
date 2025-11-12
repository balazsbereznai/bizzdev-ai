
"use client"

import { useState } from "react"
import { Topbar } from "./Topbar"
import { SidebarNav, type NavItem } from "./SidebarNav"
import { cn } from "@/lib/twp/cn"
import { motion, AnimatePresence } from "framer-motion"

type Props = {
  title?: string
  navItems?: NavItem[]
  rightPanel?: React.ReactNode
  children: React.ReactNode
}

/**
 * App shell with Topbar sticky and Utility Bar sticky in the main flow.
 * No padding-top offsets; bars manage their own stickiness.
 */
export function AppShell({ title = "BizzDev.ai", navItems, rightPanel, children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      <Topbar onMenu={() => setOpen(true)} title={title} />

      <div>
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_320px] gap-0">
          <div className="hidden md:block">
            <SidebarNav items={navItems} />
          </div>

          <main className={cn("min-h-[calc(100dvh-3.5rem)] p-4 sm:p-6 bg-[var(--bg)]")}>
            {children}
          </main>

          {rightPanel ? (
            <aside className="hidden lg:block border-l border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur">
              <div className="p-4 sm:p-6">{rightPanel}</div>
            </aside>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/20"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="fixed inset-y-0 left-0 z-[70] w-64 bg-[var(--surface)] border-r border-[var(--border)]"
            >
              <SidebarNav
                items={navItems}
                onNavigate={() => setOpen(false)}
                className="h-full"
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

