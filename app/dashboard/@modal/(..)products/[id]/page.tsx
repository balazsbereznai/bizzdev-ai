// app/dashboard/@modal/(..)products/[id]/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import ModalHost from "@/components/ModalHost";
import ModalActionsPortal from "@/components/ModalActionsPortal";
import ModalSaveExitButton from "@/components/ModalSaveExitButton";
import ModalDeleteAction from "@/components/ModalDeleteAction";
import ProductEditor from "@/app/products/[id]/product-editor";

export const dynamic = "force-dynamic";

const brandBtnDeleteText = "text-[#7a1f1f]"; // dark red text on gold pill

export default async function ProductModal({
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

  // Optional title lookup
  const { data: p } = await supabase
    .from("products")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  return (
    <ModalHost title={`Product — ${p?.name ?? ""}`} backHref="/dashboard/hub">
      <ModalActionsPortal>
        <ModalDeleteAction
          table="products"
          id={id}
          label="Delete"
          afterHref="/dashboard/hub"
          className={brandBtnDeleteText}
          confirmText="Delete this product? This cannot be undone."
        />
        <ModalSaveExitButton onDoneHref="/dashboard/hub" />
      </ModalActionsPortal>

      {/* ProductEditor renders the full editor UI */}
      <div id="product-edit-form">
        <ProductEditor id={id} />
      </div>
    </ModalHost>
  );
}

