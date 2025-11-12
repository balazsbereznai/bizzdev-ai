"use client";

import { useState } from "react";

export default function StripeBuyButton({
  priceId,
  label = "Buy now",
  className = "",
}: {
  priceId: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Something went wrong creating the checkout session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={[
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] font-medium",
        "bg-[--primary] text-white hover:opacity-90 active:opacity-80",
        "border border-[color:var(--primary)/.25] shadow-sm",
        "transition-[opacity,transform] will-change-transform",
        loading ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {loading ? "Redirecting…" : label}
    </button>
  );
}

