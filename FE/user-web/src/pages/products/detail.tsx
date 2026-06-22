import { useParams } from "react-router-dom";
import { ProductDetailScreen } from "@/features/product";

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  return <ProductDetailScreen productId={productId ?? ""} />;
}
