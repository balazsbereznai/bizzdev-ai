// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode; // parallel route slot
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

