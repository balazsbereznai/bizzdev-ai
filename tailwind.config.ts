import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        "primary-ink": "var(--primary-ink)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        warn: "var(--warn)",
        border: "var(--border)",
      },
      maxWidth: {
        content: "var(--content-max)",
      },
      spacing: {
        topbar: "var(--topbar-h)",
      },
      boxShadow: {
        ring: "0 0 0 3px var(--ring)",
      },
    },
  },
  plugins: [],
} satisfies Config;

