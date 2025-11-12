// components/ui/Modal.tsx
"use client";

import * as React from "react";
import clsx from "clsx";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnBackdrop?: boolean;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div
      aria-hidden={!open}
      className={clsx(
        "fixed inset-0 z-[70] transition",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        onClick={closeOnBackdrop ? onClose : undefined}
        className={clsx(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-start justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className={clsx(
            "w-full rounded-app border border-[var(--border)] bg-[var(--panel)] shadow-app mt-28 mx-4",
            sizes[size],
            open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3",
            "transition-all duration-150"
          )}
        >
          {title ? (
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="font-semibold">{title}</div>
              <button
                onClick={onClose}
                className="rounded-md px-2 py-1 text-sm border border-transparent hover:border-[var(--border)]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          ) : null}

          <div className="px-5 py-4">{children}</div>

          {footer ? (
            <div className="px-5 py-4 border-t border-[var(--border)]">
              <div className="flex justify-end gap-2">{footer}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
