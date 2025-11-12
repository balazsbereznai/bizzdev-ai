// hooks/useScrollShadow.ts
"use client";
import * as React from "react";

export function useScrollShadow(threshold = 8) {
  const [shadow, setShadow] = React.useState(false);

  React.useEffect(() => {
    function handle() {
      setShadow(window.scrollY > threshold);
    }
    window.addEventListener("scroll", handle);
    handle(); // initialize on mount
    return () => window.removeEventListener("scroll", handle);
  }, [threshold]);

  return shadow;
}

