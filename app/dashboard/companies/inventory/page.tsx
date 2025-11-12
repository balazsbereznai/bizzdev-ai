// app/dashboard/companies/inventory/page.tsx
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Keep dashboard URLs working, but render the canonical standalone page.
export default function Page() {
  redirect("/companies/inventory");
}

