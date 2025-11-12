"use client"

import { useEffect, useState } from "react"

type ThemeKey = "green" | "navy"

const HTML_CLASS = {
  green: "bizzdev-green",
  navy: "bizzdev-navy",
} as const

const BODY_CLASS = {
  green: "theme-bizzdev-green",
  navy: "theme-bizzdev-navy",
} as const

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeKey>("green")

  // boot from localStorage
  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as ThemeKey | null
    const initial = stored ?? "green"
    applyTheme(initial)
    setTheme(initial)
  }, [])

  function applyTheme(next: ThemeKey) {
    const html = document.documentElement
    const body = document.body

    // remove both, then add desired
    html.classList.remove(HTML_CLASS.green, HTML_CLASS.navy)
    body.classList.remove(BODY_CLASS.green, BODY_CLASS.navy)

    html.classList.add(HTML_CLASS[next])
    body.classList.add(BODY_CLASS[next])

    localStorage.setItem("theme", next)
  }

  function toggle() {
    const next: ThemeKey = theme === "green" ? "navy" : "green"
    applyTheme(next)
    setTheme(next)
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm
                 bg-[var(--surface)] text-[var(--text)] ring-1 ring-[var(--border)]"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "green" ? "Navy" : "Green"} theme`}
    >
      {theme === "green" ? "🌙 Navy" : "🌤️ Green"}
    </button>
  )
}

