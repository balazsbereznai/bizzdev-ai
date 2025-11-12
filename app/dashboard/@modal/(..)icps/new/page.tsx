// app/dashboard/@modal/(..)icps/new/page.tsx
import ModalHost from "@/components/ModalHost";
import ModalActionsPortal from "@/components/ModalActionsPortal";
import ModalSaveExitButton from "@/components/ModalSaveExitButton";
import NewIcpClient from "./NewIcpClient";

export const dynamic = "force-dynamic";

export default function IcpCreateModal() {
  return (
    <ModalHost title="ICP — New" backHref="/dashboard/hub">
      <ModalActionsPortal>
        <ModalSaveExitButton to="/dashboard/hub" />
      </ModalActionsPortal>

      <NewIcpClient />
    </ModalHost>
  );
}

