// components/ui/radiant-container.tsx
import * as React from "react";

/**
 * App-wide layout container.
 * Originally this could wrap Tailwind Plus Radiant's Container,
 * but in this UAT build we fall back to a simple max-width shell
 * so we don't depend on vendor files being present.
 */
export function Container({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mx-auto max-w-content container-px ${className}`}
      {...props}
    />
  );
}

export default Container;

