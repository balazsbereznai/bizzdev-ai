// app/dashboard/@modal/(..)icps/[id]/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import ModalHost from "@/components/ModalHost";
import ModalActionsPortal from "@/components/ModalActionsPortal";
import ModalSaveExitButton from "@/components/ModalSaveExitButton";
import ModalDeleteAction from "@/components/ModalDeleteAction";
import IcpEditor from "@/app/icps/[id]/icp-editor";

export const dynamic = "force-dynamic";

const brandBtnDeleteText = "text-[#7a1f1f]";

export default async function IcpModal({
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

  const { data: i } = await supabase
    .from("icps")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  return (
    <ModalHost title={`ICP — ${i?.name ?? ""}`} backHref="/dashboard/hub">
      <ModalActionsPortal>
        <ModalDeleteAction
          table="icps"
          id={id}
          label="Delete"
          afterHref="/dashboard/hub"
          className={brandBtnDeleteText}
          confirmText="Delete this ICP? This cannot be undone."
        />
        <ModalSaveExitButton onDoneHref="/dashboard/hub" />
      </ModalActionsPortal>

      <div id="icp-edit-form">
        <IcpEditor id={id} />
      </div>
    </ModalHost>
  );
}

