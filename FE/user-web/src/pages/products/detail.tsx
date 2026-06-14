import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ProductDetailScreen } from "@/features/product";

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = searchParams.get("edit") === "1";

  return (
    <ProductDetailScreen
      isEditing={isEditing}
      productId={productId ?? ""}
      onEditingChange={(v) => {
        void navigate(
          v ? `/products/${productId ?? ""}?edit=1` : `/products/${productId ?? ""}`,
          { replace: true }
        );
      }}
    />
  );
}
