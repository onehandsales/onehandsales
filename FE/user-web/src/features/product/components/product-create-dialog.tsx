import { ChevronDown, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  useProductCategories,
  useProductStatuses,
} from "@/features/product/hooks/use-product-detail";
import {
  useCreateCategoryMutation,
  useCreateProductMutation,
  useCreateStatusMutation,
  useDeleteCategoryMutation,
  useDeleteStatusMutation,
} from "@/features/product/hooks/use-product-mutations";
import type { ProductCategory, ProductStatus } from "@/features/product/types/product";
import { ApiClientError, getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

const schema = z.object({
  productName: z.string().trim().min(1, "제품명을 입력해주세요."),
  productPrice: z
    .string()
    .trim()
    .refine(
      (v) => v.length === 0 || /^\d+$/.test(v),
      "단가는 0 이상의 정수로 입력해주세요."
    ),
  productCategoryId: z.string().trim().min(1, "카테고리를 선택해주세요."),
  productStatusId: z.string().trim().min(1, "상태를 선택해주세요."),
  productMemo: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

type ProductCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: () => void;
};

export function ProductCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: ProductCreateDialogProps) {
  const createProductMutation = useCreateProductMutation();
  const categoriesQuery = useProductCategories();
  const statusesQuery = useProductStatuses();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productName: "",
      productPrice: "0",
      productCategoryId: "",
      productStatusId: "",
      productMemo: "",
    },
  });

  const selectedCategoryId = watch("productCategoryId");
  const selectedStatusId = watch("productStatusId");

  useEffect(() => {
    if (open) {
      reset({
        productName: "",
        productPrice: "0",
        productCategoryId: "",
        productStatusId: "",
        productMemo: "",
      });
    }
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = handleSubmit(async (values) => {
    await createProductMutation.mutateAsync({
      productName: values.productName,
      productPrice: Number(values.productPrice || "0"),
      productCategoryId: values.productCategoryId,
      productStatusId: values.productStatusId,
      productMemo: values.productMemo?.trim() || undefined,
    });

    onCreated();
    onOpenChange(false);
  });

  return (
    <ModalShell
      description="제품명, 카테고리, 상태를 선택하고 저장합니다."
      footer={
        <div className="flex justify-end gap-2">
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            취소
          </button>
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#b45309] px-3 text-[13px] font-medium text-white hover:bg-[#92400e] disabled:opacity-60"
            disabled={createProductMutation.isPending}
            form="product-create-form"
            type="submit"
          >
            {createProductMutation.isPending ? "추가 중..." : "제품 추가"}
          </button>
        </div>
      }
      open={open}
      closeButtonClassName="text-white/80 hover:bg-white/20 hover:text-white"
      headerClassName="bg-[#b45309] border-[#92400e]"
      size="md"
      title="새 제품 등록"
      titleClassName="text-white"
      onOpenChange={onOpenChange}
    >
      <form className="flex flex-col gap-5" id="product-create-form" onSubmit={onSubmit}>
        {/* 제품 기본 정보 */}
        <section>
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">
            제품 기본 정보
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-[#374151]" htmlFor="pc-product-name">
                제품명 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                className="h-10 rounded-md border border-[#E6EAF0] px-3 text-[13px] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
                id="pc-product-name"
                placeholder="제품명 입력"
                {...register("productName")}
              />
              {errors.productName ? (
                <p className="text-[12px] text-[#EF4444]">{errors.productName.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-[#374151]" htmlFor="pc-product-price">
                단가
              </label>
              <div className="flex items-center overflow-hidden rounded-md border border-[#E6EAF0] focus-within:border-[#93C5FD] focus-within:ring-1 focus-within:ring-[#93C5FD]">
                <span className="shrink-0 select-none border-r border-[#E6EAF0] bg-[#F9FAFB] px-3 text-[13px] font-medium text-[#6B7280]">
                  ₩
                </span>
                <input
                  className="h-10 min-w-0 flex-1 px-3 text-[13px] outline-none"
                  id="pc-product-price"
                  inputMode="numeric"
                  placeholder="0"
                  {...register("productPrice")}
                />
                <span className="shrink-0 select-none border-l border-[#E6EAF0] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#9CA3AF]">
                  KRW
                </span>
              </div>
              {errors.productPrice ? (
                <p className="text-[12px] text-[#EF4444]">{errors.productPrice.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        {/* 카테고리 / 상태 */}
        <section>
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">
            카테고리 / 상태
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <CategoryDropdown
              error={errors.productCategoryId?.message}
              items={categoriesQuery.data?.items ?? []}
              selectedId={selectedCategoryId}
              onSelect={(id) => setValue("productCategoryId", id, { shouldValidate: true })}
            />
            <StatusDropdown
              error={errors.productStatusId?.message}
              items={statusesQuery.data?.items ?? []}
              selectedId={selectedStatusId}
              onSelect={(id) => setValue("productStatusId", id, { shouldValidate: true })}
            />
          </div>
        </section>

        {/* 첫 메모 */}
        <section>
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">
            첫 메모 (선택)
          </h3>
          <textarea
            className="min-h-[80px] w-full resize-y rounded-md border border-[#E6EAF0] px-3 py-2 text-[13px] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
            placeholder="메모를 입력하세요 (선택)"
            {...register("productMemo")}
          />
        </section>

        {createProductMutation.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-[#EF4444]">
            {getApiErrorMessage(createProductMutation.error)}
          </p>
        ) : null}
      </form>
    </ModalShell>
  );
}

// ── Category Dropdown ────────────────────────────────────────────────────────

function CategoryDropdown({
  items,
  selectedId,
  onSelect,
  error,
}: {
  readonly items: ProductCategory[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
  readonly error?: string;
}) {
  const createMutation = useCreateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowAdd(false);
        setNewName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Escape 키 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsOpen(false); setShowAdd(false); setNewName(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (showAdd) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [showAdd]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAddError(null);
    try {
      await createMutation.mutateAsync({ categoryName: newName.trim() });
      setNewName("");
      setShowAdd(false);
    } catch (err) {
      setAddError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedId === id) onSelect("");
    } catch (err) {
      const msg =
        err instanceof ApiClientError && err.statusCode === 409
          ? "이미 제품에 사용 중인 카테고리입니다."
          : getApiErrorMessage(err);
      setDeleteErrors((prev) => ({ ...prev, [id]: msg }));
    }
  };

  const selectedName = items.find((c) => c.id === selectedId)?.categoryName;

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[#374151]">
        카테고리 <span className="text-[#EF4444]">*</span>
      </span>
      {/* Trigger */}
      <button
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border px-3 text-[13px] outline-none transition-colors",
          isOpen
            ? "border-[#93C5FD] ring-1 ring-[#93C5FD]"
            : "border-[#E6EAF0] hover:border-[#93C5FD]",
          selectedName ? "text-[#111827]" : "text-[#9CA3AF]"
        )}
        onClick={() => setIsOpen((v) => !v)}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedName ?? "카테고리 선택"}
        </span>
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-md border border-[#E6EAF0] bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E6EAF0] px-3 py-2">
            <span className="text-[11px] font-semibold text-[#6B7280]">카테고리 관리</span>
            <button
              className="inline-flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium text-[#1D4ED8] hover:bg-[#EFF6FF]"
              onClick={() => { setShowAdd(true); setAddError(null); }}
              type="button"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              추가
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="flex items-center gap-1.5 border-b border-[#E6EAF0] p-1.5">
              <input
                ref={inputRef}
                className="h-7 min-w-0 flex-1 rounded border border-[#E6EAF0] px-2 text-[12px] outline-none focus:border-[#93C5FD]"
                placeholder="카테고리명"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); void handleAdd(); }
                  if (e.key === "Escape") { setShowAdd(false); setNewName(""); }
                }}
              />
              <button
                className="h-7 rounded bg-[#1D4ED8] px-2 text-[11px] font-medium text-white hover:bg-[#1E40AF] disabled:opacity-60"
                disabled={createMutation.isPending}
                onClick={() => void handleAdd()}
                type="button"
              >
                저장
              </button>
              <button
                className="h-7 rounded border border-[#E5E7EB] px-2 text-[11px] text-[#374151] hover:bg-[#F9FAFB]"
                onClick={() => { setShowAdd(false); setNewName(""); }}
                type="button"
              >
                취소
              </button>
            </div>
          )}
          {addError ? (
            <p className="px-2 py-1 text-[11px] text-[#EF4444]">{addError}</p>
          ) : null}

          {/* List */}
          <div className="max-h-[160px] overflow-y-auto">
            {items.length === 0 && !showAdd ? (
              <p className="px-3 py-4 text-center text-[12px] text-[#9CA3AF]">카테고리가 없습니다</p>
            ) : null}
            {items.map((cat) => (
              <div key={cat.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-[#F9FAFB]",
                    selectedId === cat.id && "bg-[#EFF6FF]"
                  )}
                >
                  <input
                    checked={selectedId === cat.id}
                    className="h-3.5 w-3.5 accent-[#1D4ED8]"
                    name="productCategoryId-radio"
                    type="radio"
                    onChange={() => { onSelect(cat.id); setIsOpen(false); }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[#374151]">{cat.categoryName}</span>
                  <button
                    className="h-5 w-5 rounded hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                    onClick={(e) => { e.preventDefault(); void handleDelete(cat.id); }}
                    title="삭제"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </label>
                {deleteErrors[cat.id] ? (
                  <p className="px-3 pb-1 text-[11px] text-[#EF4444]">{deleteErrors[cat.id]}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {error ? <p className="text-[12px] text-[#EF4444]">{error}</p> : null}
    </div>
  );
}

// ── Status Dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
  items,
  selectedId,
  onSelect,
  error,
}: {
  readonly items: ProductStatus[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
  readonly error?: string;
}) {
  const createMutation = useCreateStatusMutation();
  const deleteMutation = useDeleteStatusMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowAdd(false);
        setNewName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Escape 키 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsOpen(false); setShowAdd(false); setNewName(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (showAdd) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [showAdd]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAddError(null);
    try {
      await createMutation.mutateAsync({ statusName: newName.trim() });
      setNewName("");
      setShowAdd(false);
    } catch (err) {
      setAddError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedId === id) onSelect("");
    } catch (err) {
      const msg =
        err instanceof ApiClientError && err.statusCode === 409
          ? "이미 제품에 사용 중인 상태입니다."
          : getApiErrorMessage(err);
      setDeleteErrors((prev) => ({ ...prev, [id]: msg }));
    }
  };

  const selectedName = items.find((s) => s.id === selectedId)?.statusName;

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[#374151]">
        상태 <span className="text-[#EF4444]">*</span>
      </span>
      {/* Trigger */}
      <button
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border px-3 text-[13px] outline-none transition-colors",
          isOpen
            ? "border-[#93C5FD] ring-1 ring-[#93C5FD]"
            : "border-[#E6EAF0] hover:border-[#93C5FD]",
          selectedName ? "text-[#111827]" : "text-[#9CA3AF]"
        )}
        onClick={() => setIsOpen((v) => !v)}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedName ?? "상태 선택"}
        </span>
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-md border border-[#E6EAF0] bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E6EAF0] px-3 py-2">
            <span className="text-[11px] font-semibold text-[#6B7280]">상태 관리</span>
            <button
              className="inline-flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium text-[#1D4ED8] hover:bg-[#EFF6FF]"
              onClick={() => { setShowAdd(true); setAddError(null); }}
              type="button"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              추가
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="flex items-center gap-1.5 border-b border-[#E6EAF0] p-1.5">
              <input
                ref={inputRef}
                className="h-7 min-w-0 flex-1 rounded border border-[#E6EAF0] px-2 text-[12px] outline-none focus:border-[#93C5FD]"
                placeholder="상태명"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); void handleAdd(); }
                  if (e.key === "Escape") { setShowAdd(false); setNewName(""); }
                }}
              />
              <button
                className="h-7 rounded bg-[#1D4ED8] px-2 text-[11px] font-medium text-white hover:bg-[#1E40AF] disabled:opacity-60"
                disabled={createMutation.isPending}
                onClick={() => void handleAdd()}
                type="button"
              >
                저장
              </button>
              <button
                className="h-7 rounded border border-[#E5E7EB] px-2 text-[11px] text-[#374151] hover:bg-[#F9FAFB]"
                onClick={() => { setShowAdd(false); setNewName(""); }}
                type="button"
              >
                취소
              </button>
            </div>
          )}
          {addError ? (
            <p className="px-2 py-1 text-[11px] text-[#EF4444]">{addError}</p>
          ) : null}

          {/* List */}
          <div className="max-h-[160px] overflow-y-auto">
            {items.length === 0 && !showAdd ? (
              <p className="px-3 py-4 text-center text-[12px] text-[#9CA3AF]">상태가 없습니다</p>
            ) : null}
            {items.map((st) => (
              <div key={st.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-[#F9FAFB]",
                    selectedId === st.id && "bg-[#EFF6FF]"
                  )}
                >
                  <input
                    checked={selectedId === st.id}
                    className="h-3.5 w-3.5 accent-[#1D4ED8]"
                    name="productStatusId-radio"
                    type="radio"
                    onChange={() => { onSelect(st.id); setIsOpen(false); }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[#374151]">{st.statusName}</span>
                  <button
                    className="h-5 w-5 rounded hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                    onClick={(e) => { e.preventDefault(); void handleDelete(st.id); }}
                    title="삭제"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </label>
                {deleteErrors[st.id] ? (
                  <p className="px-3 pb-1 text-[11px] text-[#EF4444]">{deleteErrors[st.id]}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {error ? <p className="text-[12px] text-[#EF4444]">{error}</p> : null}
    </div>
  );
}
