export default function InventoryLayout({
  children,
  modal, // <-- must be named exactly after @modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

