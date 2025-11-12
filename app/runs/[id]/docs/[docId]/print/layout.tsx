export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  // No headers/nav/footers — just the print page
  return children;
}

