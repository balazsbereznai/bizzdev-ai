import * as React from "react";

/**
 * Stable page container: centered, max width bound to our token,
 * with responsive padding matching our globals.css `.container-px`.
 */
export function Container({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mx-auto max-w-content container-px ${className}`} {...props} />
  );
}

