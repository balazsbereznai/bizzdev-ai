// lib/log.ts
type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const CURRENT = (() => {
  const env = (process.env.LOG_LEVEL || "info").toLowerCase();
  return (LEVELS as any)[env] ?? LEVELS.info;
})();

function emit(level: Level, msg: string, fields?: Record<string, unknown>) {
  if (LEVELS[level] < CURRENT) return;
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  };
  // single-line JSON: easy to grep / ship to log tools
  // eslint-disable-next-line no-console
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](JSON.stringify(line));
}

export const log = {
  debug: (msg: string, f?: Record<string, unknown>) => emit("debug", msg, f),
  info:  (msg: string, f?: Record<string, unknown>) => emit("info", msg, f),
  warn:  (msg: string, f?: Record<string, unknown>) => emit("warn", msg, f),
  error: (msg: string, f?: Record<string, unknown>) => emit("error", msg, f),
};

// helper: generate a short request id (no PII)
export function rid(prefix = "req") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

