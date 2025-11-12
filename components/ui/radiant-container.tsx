import * as React from "react";

// Tailwind Plus vendor path (per your tree): components/twp/vendor/radiant/container.tsx
import * as Vendor from "@/components/twp/vendor/radiant/container";

// The vendor may export default or a named `Container`. Resolve safely.
const VendorContainer =
  // @ts-expect-error – vendor typing is not guaranteed
  (Vendor && (Vendor as any).Container) ||
  // @ts-expect-error – vendor typing is not guaranteed
  (Vendor && (Vendor as any).default);

export function Container({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  if (VendorContainer) {
    // @ts-expect-error – vendor component signature is opaque
    return <VendorContainer className={className} {...props} />;
  }
  // Fallback: centered page container with our tokens
  return (
    <div
      className={`mx-auto max-w-content container-px ${className}`}
      {...props}
    />
  );
}

