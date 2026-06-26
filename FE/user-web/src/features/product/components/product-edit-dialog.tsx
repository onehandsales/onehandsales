import { Save } from "lucide-react";
import { useState } from "react";
import { ModalFooterActions } from "@/components/ui/modal-form";
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
  const formId = "product-edit-form";
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ModalShell
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={isSubmitting}
          pendingLabel="저장 중"
          submitIcon={<Save className="h-4 w-4" />}
          submitLabel="저장"
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      bodyClassName="py-4"
      footerClassName="h-14"
      panelClassName="max-h-[calc(100vh-2rem)] md:max-h-[680px]"
      size="md"
      title="제품 수정"
      onOpenChange={onOpenChange}
    >
      <ProductEditForm
        formId={formId}
        product={product}
        onPendingChange={setIsSubmitting}
        onSaved={() => {
          onSaved();
          onOpenChange(false);
        }}
      />
    </ModalShell>
  );
}
