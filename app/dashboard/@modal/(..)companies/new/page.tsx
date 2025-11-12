// app/dashboard/@modal/(..)companies/new/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import ModalHost from "@/components/ModalHost";
import ModalActionsPortal from "@/components/ModalActionsPortal";
import CompanyForm from "@/app/companies/CompanyForm";

export const dynamic = "force-dynamic";

const brandBtn =
  "inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm " +
  "bg-[#dbc078] text-[#0b1220] border border-white/10 shadow-[--shadow-0] " +
  "hover:-translate-y-[1px] hover:shadow-[--shadow-1] active:translate-y-[0.5px] transition";

export default async function CompanyCreateModal() {
  // Auth guard (RLS remains intact)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  return (
    <ModalHost title="New Company" backHref="/dashboard/hub">
      <ModalActionsPortal>
        {/* Header Save&Exit submits the inner form by id */}
        <button
          type="submit"
          form="company-edit-form"
          className={brandBtn}
          aria-label="Save and close"
        >
          Save &amp; Exit
        </button>
      </ModalActionsPortal>

      <CompanyForm
        mode="create"
        initial={{ company_name: "", industry: "", region: "", size: "" }}
        minimal
        hideFooterActions
        // Hard navigation ensures modal unmount + fresh Hub
        afterSave={{ type: "href", href: "/dashboard/hub" }}
      />
    </ModalHost>
  );
}

