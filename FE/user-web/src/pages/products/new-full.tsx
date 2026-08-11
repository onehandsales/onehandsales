import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppI18n } from "@/features/app-i18n";
import {
  ProductCreateDialog,
  type ProductCreateFormValues,
} from "@/features/product";

// 기능 : 패널에서 확대한 제품 생성 전용 페이지를 렌더링합니다.
export function ProductNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAppI18n();
  const initialValues = useMemo(
    () => readProductCreateDraft(location.state),
    [location.state],
  );

  // 기능 : 프론트엔드 화면에서 현재 패널이나 모달을 닫습니다.
  const closeToList = () => {
    void navigate("/app/products", { replace: true });
  };

  // 기능 : 프론트엔드 생성 완료 후 후속 이동을 처리합니다.
  const navigateAfterCreated = () => {
    void navigate("/app/products", {
      replace: true,
      state: { notice: t("productList.createdNotice") },
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

// 기능 : route state에서 제품 생성 draft 값을 복원합니다.
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

// 기능 : unknown 값을 key-value 항목로 안전하게 좁힙니다.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// 기능 : route state draft에서 문자열 값을 안전하게 읽습니다.
function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}
