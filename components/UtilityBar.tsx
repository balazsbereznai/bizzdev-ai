"use client";
import { Container } from "@/components/ui/Container";

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export default function UtilityBar({ left, right }: Props) {
  return (
    <div
      className="
        sticky top-[var(--topbar-h)] z-40 glass
        bg-[var(--surface)]/75 border-b border-[--border]
      "
      role="region"
      aria-label="Utility bar"
    >
      <Container>
        <div className="toolbar">
          <div className="flex items-center gap-2 text-sm">
            <span className="section-title">Workspace</span>
            <span className="section-chip">Doc tools</span>
            {left}
          </div>
          <div className="flex items-center gap-2">{right}</div>
        </div>
      </Container>
    </div>
  );
}

