// app/dashboard/@modal/(..)products/new/page.tsx
import ModalHost from "@/components/ModalHost";
import ModalActionsPortal from "@/components/ModalActionsPortal";
import ModalSaveExitButton from "@/components/ModalSaveExitButton";
import NewProductClient from "./NewProductClient";

export const dynamic = "force-dynamic";

export default function ProductCreateModal() {
  return (
    <ModalHost title="Product — New" backHref="/dashboard/hub">
      <ModalActionsPortal>
        {/* No Delete on brand-new entry */}
        <ModalSaveExitButton to="/dashboard/hub" />
      </ModalActionsPortal>

      <NewProductClient />
    </ModalHost>
  );
}

