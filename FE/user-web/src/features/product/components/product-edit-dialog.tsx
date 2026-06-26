import { ModalShell } from "@/components/ui/modal-shell";
import { ProductEditForm } from "@/features/product/components/product-edit-form";
import type { ProductDetail } from "@/features/product/types/product";

type ProductEditDialogProps = {
  readonly open: boolean;
  readonly product: ProductDetail;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSaved: () => void;
};

// 기능 : 제품 수정 form을 생성 모달과 같은 overlay 안에서 표시합니다.
export function ProductEditDialog({
  open,
  product,
  onOpenChange,
  onSaved,
}: ProductEditDialogProps) {
  return (
    <ModalShell
      open={open}
      panelClassName="max-h-[82vh] md:max-h-[620px]"
      size="md"
      title="제품 수정"
      onOpenChange={onOpenChange}
    >
      <ProductEditForm
        product={product}
        onSaved={() => {
          onSaved();
          onOpenChange(false);
        }}
      />
    </ModalShell>
  );
}
