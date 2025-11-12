export default function ProductsInventoryLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  // Important: render {children}{modal} so the parallel @modal slot can intercept /products/:id
  return (
    <>
      {children}
      {modal}
    </>
  );
}

