"use client"

import { toast } from "sonner"
import { Download, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/twp/cn"

type Props = {
  title?: string
  meta?: React.ReactNode
  onRegenerate?: () => Promise<void> | void
  onExportPdf?: () => Promise<void> | void
  rightSlot?: React.ReactNode
}

/**
 * Sticky utility bar under the Topbar. Both live in normal flow.
 */
export default function StickyUtilityBar({
  title = "Document",
  meta,
  onRegenerate,
  onExportPdf,
  rightSlot,
}: Props) {
  async function handleRegenerate() {
    try {
      toast.loading("Regenerating…", { id: "regen" })
      await onRegenerate?.()
      toast.success("Regenerated", { id: "regen" })
    } catch {
      toast.error("Failed to regenerate", { id: "regen" })
    }
  }
  async function handleExport() {
    try {
      toast.loading("Exporting PDF…", { id: "export" })
      await onExportPdf?.()
      toast.success("PDF exported", { id: "export" })
    } catch {
      toast.error("Failed to export PDF", { id: "export" })
    }
  }

  return (
    <div
      className={cn(
        "sticky top-14 z-40", // <- exactly one Topbar height below
        "border-b border-[var(--border)]",
        "backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg)_82%,transparent)]"
      )}
    >
      <motion.div initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="lg:flex lg:items-center lg:justify-between py-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)]">{title}</h2>
              {meta ? <div className="mt-1 text-sm text-[var(--muted)]">{meta}</div> : null}
            </div>

            <div className="mt-3 flex lg:mt-0 lg:ml-4">
              <span className="hidden sm:block">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className={cn(
                    "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    "bg-[var(--surface)] text-[var(--text)] ring-1 ring-[var(--border)] hover:opacity-95"
                  )}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </button>
              </span>

              <span className="sm:ml-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className={cn(
                    "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    "bg-[var(--accent)] text-[var(--bg)] ring-1 ring-[var(--ring)]/20 hover:opacity-95"
                  )}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </button>
              </span>

              {rightSlot ? <div className="ml-3 hidden sm:block">{rightSlot}</div> : null}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

