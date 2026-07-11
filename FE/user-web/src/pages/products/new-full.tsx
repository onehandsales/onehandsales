import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ProductCreateDialog,
  type ProductCreateFormValues,
} from "@/features/product/components/product-create-dialog";

// 기능 : 패널에서 확대한 제품 생성 전용 페이지를 렌더링합니다.
export function ProductNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialValues = useMemo(
    () => readProductCreateDraft(location.state),
    [location.state],
  );

  const closeToList = () => {
    void navigate("/app/products", { replace: true });
  };

  const navigateAfterCreated = () => {
    void navigate("/app/products", {
      replace: true,
      state: { notice: "제품을 추가했어요." },
    });
  };

  return (
    <ProductCreateDialog
      initialValues={initialValues}
      mode="page"
      onCreated={navigateAfterCreated}
      onOpenChange={(open) => {
        if (!open) {
          closeToList();
        }
      }}
      open
    />
  );
}

function readProductCreateDraft(
  state: unknown,
): Partial<ProductCreateFormValues> | undefined {
  if (!isRecord(state) || !isRecord(state.productCreateDraft)) {
    return undefined;
  }

  const draft = state.productCreateDraft;

  return {
    productName: readString(draft.productName),
    productPrice: readString(draft.productPrice),
    productCategoryId: readString(draft.productCategoryId),
    productStatusId: readString(draft.productStatusId),
    productMemo: readString(draft.productMemo),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}
