"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/twp/cn"
import { FileText, Home, Layers, Settings } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const DEFAULT_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/runs", label: "Runs", icon: Layers },
  // helpful deep link for our focus route
  { href: "/runs/demo/docs/demo", label: "Docs (demo)", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

type Props = {
  items?: NavItem[]
  onNavigate?: () => void // optional: close drawer on mobile
  className?: string
}

export function SidebarNav({ items = DEFAULT_ITEMS, onNavigate, className }: Props) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "h-full w-60 shrink-0",
        "border-r border-[var(--border)]",
        "bg-[var(--surface)]/80 backdrop-blur",
        className
      )}
    >
      <div className="p-3">
        <nav className="grid gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  "ring-1 ring-[var(--border)]",
                  active
                    ? "bg-[var(--primary)] text-[var(--bg)]"
                    : "bg-[var(--surface)] text-[var(--text)] hover:opacity-95"
                )}
              >
                {Icon ? (
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-[var(--bg)]" : "text-[var(--text)]/80"
                    )}
                  />
                ) : null}
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

