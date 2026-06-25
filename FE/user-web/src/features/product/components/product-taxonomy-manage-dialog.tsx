import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ModalShell } from "@/components/ui/modal-shell";
import { ErrorState } from "@/components/ui/state";
import {
  useCreateCategoryMutation,
  useCreateStatusMutation,
  useDeleteCategoryMutation,
  useDeleteStatusMutation,
} from "@/features/product/hooks/use-product-mutations";
import type {
  ProductCategory,
  ProductStatus,
} from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";

type ProductTaxonomyKind = "category" | "status";

type ProductTaxonomyManageDialogProps = {
  readonly open: boolean;
  readonly kind: ProductTaxonomyKind;
  readonly categories: ProductCategory[];
  readonly statuses: ProductStatus[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (kind: ProductTaxonomyKind, name: string) => void;
};

export function ProductTaxonomyManageDialog({
  open,
  kind,
  categories,
  statuses,
  onOpenChange,
  onCreated,
}: ProductTaxonomyManageDialogProps) {
  const createCategoryMutation = useCreateCategoryMutation();
  const createStatusMutation = useCreateStatusMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const deleteStatusMutation = useDeleteStatusMutation();
  const [categoryName, setCategoryName] = useState("");
  const [statusName, setStatusName] = useState("");

  useEffect(() => {
    if (open) {
      setCategoryName("");
      setStatusName("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const sections =
    kind === "status"
      ? [
          {
            key: "status" as const,
            title: "제품 상태",
            placeholder: "예: 판매중",
            value: statusName,
            setValue: setStatusName,
          },
          {
            key: "category" as const,
            title: "카테고리",
            placeholder: "예: 솔루션",
            value: categoryName,
            setValue: setCategoryName,
          },
        ]
      : [
          {
            key: "category" as const,
            title: "카테고리",
            placeholder: "예: 솔루션",
            value: categoryName,
            setValue: setCategoryName,
          },
          {
            key: "status" as const,
            title: "제품 상태",
            placeholder: "예: 판매중",
            value: statusName,
            setValue: setStatusName,
          },
        ];

  const addCategory = async () => {
    const name = categoryName.trim();
    if (!name) {
      return;
    }

    await createCategoryMutation.mutateAsync({ categoryName: name });
    onCreated("category", name);
    setCategoryName("");
  };

  const addStatus = async () => {
    const name = statusName.trim();
    if (!name) {
      return;
    }

    await createStatusMutation.mutateAsync({ statusName: name });
    onCreated("status", name);
    setStatusName("");
  };

  const deleteCategory = async (category: ProductCategory) => {
    if (!window.confirm(`${category.categoryName} 카테고리를 삭제할까요?`)) {
      return;
    }

    await deleteCategoryMutation.mutateAsync(category.id);
  };

  const deleteStatus = async (status: ProductStatus) => {
    if (!window.confirm(`${status.statusName} 상태를 삭제할까요?`)) {
      return;
    }

    await deleteStatusMutation.mutateAsync(status.id);
  };

  return (
    <ModalShell
      open={open}
      size="lg"
      title="제품 분류 관리"
      onOpenChange={onOpenChange}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div
            className="grid gap-3 rounded-lg border border-[#E5EAF0] bg-white p-4"
            key={section.key}
          >
            <div>
              <h3 className="text-[14px] font-semibold text-[#111827]">
                {section.title}
              </h3>
              <p className="mt-1 text-[12px] text-[#6B7280]">
                목록 필터에서 바로 사용할 항목을 관리합니다.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                className="h-10 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                onChange={(event) => section.setValue(event.target.value)}
                placeholder={section.placeholder}
                value={section.value}
              />
              <button
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-[#4880EE] px-3 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                disabled={
                  section.value.trim().length === 0 ||
                  (section.key === "category"
                    ? createCategoryMutation.isPending
                    : createStatusMutation.isPending)
                }
                onClick={() => {
                  void (section.key === "category" ? addCategory() : addStatus());
                }}
                type="button"
              >
                + 추가
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(section.key === "category" ? categories : statuses).length ===
              0 ? (
                <span className="text-sm text-muted-foreground">
                  등록된 항목이 없습니다.
                </span>
              ) : (
                (section.key === "category" ? categories : statuses).map(
                  (item) => (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[12px] text-[#374151]"
                      key={item.id}
                    >
                      <span className="max-w-40 truncate">
                        {section.key === "category"
                          ? (item as ProductCategory).categoryName
                          : (item as ProductStatus).statusName}
                      </span>
                      <button
                        aria-label={`${
                          section.key === "category"
                            ? (item as ProductCategory).categoryName
                            : (item as ProductStatus).statusName
                        } 삭제`}
                        className="grid h-5 w-5 place-items-center rounded-full text-[#9CA3AF] hover:bg-white hover:text-[#EF4444]"
                        disabled={
                          section.key === "category"
                            ? deleteCategoryMutation.isPending
                            : deleteStatusMutation.isPending
                        }
                        onClick={() => {
                          void (section.key === "category"
                            ? deleteCategory(item as ProductCategory)
                            : deleteStatus(item as ProductStatus));
                        }}
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ),
                )
              )}
            </div>

            {section.key === "category" && createCategoryMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(createCategoryMutation.error)}
                title="카테고리 추가 실패"
                variant="inline"
              />
            ) : null}
            {section.key === "status" && createStatusMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(createStatusMutation.error)}
                title="제품 상태 추가 실패"
                variant="inline"
              />
            ) : null}
            {section.key === "category" && deleteCategoryMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(deleteCategoryMutation.error)}
                title="카테고리 삭제 실패"
                variant="inline"
              />
            ) : null}
            {section.key === "status" && deleteStatusMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(deleteStatusMutation.error)}
                title="제품 상태 삭제 실패"
                variant="inline"
              />
            ) : null}
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
