// app/dashboard/@modal/(..)companies/[id]/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import ModalHost from "@/components/ModalHost";
import ModalActionsPortal from "@/components/ModalActionsPortal";
// Replaced ModalDeleteButton with our styled client action:
import ModalDeleteAction from "@/components/ModalDeleteAction";
import CompanyForm from "@/app/companies/CompanyForm";

export const dynamic = "force-dynamic";

const brandBtn =
  "inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm " +
  "bg-[#dbc078] text-[#0b1220] border border-white/10 shadow-[--shadow-0] " +
  "hover:-translate-y-[1px] hover:shadow-[--shadow-1] active:translate-y-[0.5px] transition";

const brandBtnDeleteText = "text-[#7a1f1f]"; // dark red text on gold pill

export default async function CompanyModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const { data: company, error } = await supabase
    .from("company_profile")
    .select("id, company_name, industry, region, size, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !company) return null;

  return (
    <ModalHost title={`Company — ${company.company_name ?? ""}`} backHref="/dashboard/hub">
      <ModalActionsPortal>
        {/* Delete: same size/shape as Save, gold pill with dark-red text */}
        <ModalDeleteAction
          table="company_profile"
          id={id}
          label="Delete"
          afterHref="/dashboard/hub"
          className={`${brandBtn} ${brandBtnDeleteText}`}
          confirmText="Delete this company? This cannot be undone."
        />
        {/* Save & Exit: gold pill, black text */}
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
        mode="edit"
        id={company.id}
        initial={{
          company_name: company.company_name ?? "",
          industry: company.industry ?? "",
          region: company.region ?? "",
          size: company.size ?? "",
        }}
        minimal
        hideFooterActions
        afterSave={{ type: "href", href: "/dashboard/hub" }}
      />
    </ModalHost>
  );
}

