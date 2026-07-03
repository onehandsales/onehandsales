import { ProductListScreen } from "@/features/product";
import { useNavigate } from "react-router-dom";

export function ProductNewPage() {
  const navigate = useNavigate();

  return (
    <ProductListScreen
      initialCreateOpen
      onCreateDialogClose={() => {
        void navigate("/app/products", { replace: true });
      }}
    />
  );
}
