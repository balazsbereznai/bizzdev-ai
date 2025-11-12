"use client"

import { ThemeSwitcher } from "@/components/twp/primitives/ThemeSwitcher"
import { motion } from "framer-motion"
import { Menu, Search } from "lucide-react"
import { cn } from "@/lib/twp/cn"
import Link from "next/link"

type TopbarProps = {
  onMenu?: () => void
  title?: string
  rightSlot?: React.ReactNode
}

export function Topbar({ onMenu, title = "BizzDev.ai", rightSlot }: TopbarProps) {
  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "sticky top-0 z-50 w-full", // <- sticky instead of fixed
        "backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg)_78%,transparent)]",
        "border-b border-[var(--border)]"
      )}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMenu}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-[var(--border)] bg-[var(--surface)] sm:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4 text-[var(--text)]" />
            </button>

            <Link
              href="/"
              className="inline-flex items-center rounded-lg px-2 py-1 text-sm font-semibold text-[var(--text)] hover:opacity-90"
            >
              {title}
            </Link>
          </div>

          <div className="hidden sm:flex items-center">
            <div className="flex w-full max-w-md items-center gap-2 rounded-xl bg-[var(--surface)] ring-1 ring-[var(--border)] px-3 h-9">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input
                aria-label="Search"
                placeholder="Search…"
                className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] outline-none"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {rightSlot}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </motion.header>
  )
}

