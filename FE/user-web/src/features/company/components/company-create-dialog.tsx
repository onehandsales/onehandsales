import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronsRight,
  Loader2,
  Maximize2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { ManagedTaxonomyDropdown } from "@/components/ui/managed-taxonomy-dropdown";
import { ErrorState } from "@/components/ui/state";
import {
  useCreateCompanyFieldMutation,
  useCreateCompanyMutation,
  useCreateCompanyRegionMutation,
  useDeleteCompanyFieldMutation,
  useDeleteCompanyRegionMutation,
} from "@/features/company/hooks/use-company-mutations";
import {
  useCompanyFields,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import {
  companyCreateFormSchema,
  emptyCompanyCreateFormValues,
  toCreateCompanyInput,
  type CompanyCreateFormValues,
} from "@/features/company/schemas/company-schema";
import type {
  CompanyField,
  CompanyRegion,
} from "@/features/company/types/company";
import { getApiErrorMessage } from "@/lib/api-client";

type CompanyCreateDialogProps = {
  readonly open: boolean;
  readonly fields: CompanyField[];
  readonly initialCompanyName?: string;
  readonly initialValues?: Partial<CompanyCreateFormValues>;
  readonly isFieldsLoading?: boolean;
  readonly isRegionsLoading?: boolean;
  readonly mode?: "docked" | "overlay" | "page";
  readonly width?: number;
  readonly regions: CompanyRegion[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (companyName: string) => void;
  readonly onExpand?: (values: CompanyCreateFormValues) => void;
  readonly onResizeStart?: () => void;
};

// 기능 : 회사 생성 패널을 렌더링합니다.
export function CompanyCreateDialog({
  open,
  fields,
  initialCompanyName = "",
  initialValues,
  isFieldsLoading = false,
  isRegionsLoading = false,
  mode = "overlay",
  regions,
  width,
  onOpenChange,
  onCreated,
  onExpand,
  onResizeStart,
}: CompanyCreateDialogProps) {
  const createCompanyMutation = useCreateCompanyMutation();
  const createFieldMutation = useCreateCompanyFieldMutation();
  const createRegionMutation = useCreateCompanyRegionMutation();
  const deleteFieldMutation = useDeleteCompanyFieldMutation();
  const deleteRegionMutation = useDeleteCompanyRegionMutation();
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyCreateFormValues>({
    resolver: zodResolver(companyCreateFormSchema),
    defaultValues: emptyCompanyCreateFormValues,
  });
  const formId = "company-create-form";
  const [pendingFieldName, setPendingFieldName] = useState("");
  const [pendingRegionName, setPendingRegionName] = useState("");
  const memoTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedFieldId = watch("companyFieldId");
  const selectedRegionId = watch("companyRegionId");
  const companyMemo = watch("companyMemo") ?? "";
  const memoRegister = register("companyMemo");

  useEffect(() => {
    if (open) {
      reset({
        ...emptyCompanyCreateFormValues,
        ...initialValues,
        companyName: (initialValues?.companyName ?? initialCompanyName).trim(),
        companyFieldId: initialValues?.companyFieldId ?? "",
        companyRegionId: initialValues?.companyRegionId ?? "",
        companyMemo: initialValues?.companyMemo ?? "",
      });
      setPendingFieldName("");
      setPendingRegionName("");
    }
  }, [initialCompanyName, initialValues, open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createCompanyMutation.isPending) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [createCompanyMutation.isPending, onOpenChange, open]);

  useEffect(() => {
    resizeMemoTextarea(memoTextareaRef.current);
  }, [open, initialValues]);

  useEffect(() => {
    if (!pendingFieldName) {
      return;
    }

    const matchedField = fields.find(
      (field) => field.field === pendingFieldName,
    );

    if (matchedField) {
      setValue("companyFieldId", matchedField.id, { shouldValidate: true });
      setPendingFieldName("");
    }
  }, [fields, pendingFieldName, setValue]);

  useEffect(() => {
    if (!pendingRegionName) {
      return;
    }

    const matchedRegion = regions.find(
      (region) => region.region === pendingRegionName,
    );

    if (matchedRegion) {
      setValue("companyRegionId", matchedRegion.id, { shouldValidate: true });
      setPendingRegionName("");
    }
  }, [regions, pendingRegionName, setValue]);

  useEffect(() => {
    if (
      !isFieldsLoading &&
      selectedFieldId &&
      !fields.some((field) => field.id === selectedFieldId)
    ) {
      setValue("companyFieldId", "", { shouldValidate: true });
    }
  }, [fields, isFieldsLoading, selectedFieldId, setValue]);

  useEffect(() => {
    if (
      !isRegionsLoading &&
      selectedRegionId &&
      !regions.some((region) => region.id === selectedRegionId)
    ) {
      setValue("companyRegionId", "", { shouldValidate: true });
    }
  }, [isRegionsLoading, regions, selectedRegionId, setValue]);

  // 기능 : 회사 생성 요청을 보내고 성공 시 패널을 닫습니다.
  const onSubmit = handleSubmit(async (values) => {
    await createCompanyMutation.mutateAsync(toCreateCompanyInput(values));
    onCreated(values.companyName.trim());
    onOpenChange(false);
  });

  const createField = async (name: string) => {
    await createFieldMutation.mutateAsync({ field: name });
    const updated = await fieldsQuery.refetch();
    const created = updated.data?.items.find((field) => field.field === name);

    if (created) {
      setValue("companyFieldId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setPendingFieldName(name);
  };

  const createRegion = async (name: string) => {
    await createRegionMutation.mutateAsync({ region: name });
    const updated = await regionsQuery.refetch();
    const created = updated.data?.items.find((region) => region.region === name);

    if (created) {
      setValue("companyRegionId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setPendingRegionName(name);
  };

  const focusMemoTextarea = () => {
    memoTextareaRef.current?.focus();
  };

  const deleteField = async (field: CompanyField) => {
    await deleteFieldMutation.mutateAsync(field.id);

    if (selectedFieldId === field.id) {
      setValue("companyFieldId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const deleteRegion = async (region: CompanyRegion) => {
    await deleteRegionMutation.mutateAsync(region.id);

    if (selectedRegionId === region.id) {
      setValue("companyRegionId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const isDocked = mode === "docked";
  const isPage = mode === "page";
  const CloseIcon = isPage ? ArrowLeft : ChevronsRight;

  if (!open && !isDocked) {
    return null;
  }

  const panel = (
    <section
      aria-label="회사 생성"
      aria-modal={isPage ? undefined : !isDocked}
      className={
        isPage
          ? "flex min-h-full flex-col bg-white"
          : isDocked
          ? `fixed inset-y-0 right-0 z-50 flex h-screen shrink-0 flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-[transform,opacity] duration-[500ms] ease-out will-change-transform ${
              open
                ? "company-create-panel-enter pointer-events-auto translate-x-0 opacity-100"
                : "pointer-events-none translate-x-full opacity-0"
            }`
          : "pointer-events-auto relative flex h-full w-full flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] sm:max-w-[520px]"
      }
      role={isPage ? undefined : "dialog"}
      style={isDocked ? { width: width ?? 520 } : undefined}
    >
      {isDocked ? (
        <button
          aria-label="회사 생성 패널 폭 조절"
          className="absolute -left-1 top-0 z-10 h-full w-2 cursor-col-resize transition hover:bg-[#EFF6FF] focus:bg-[#EFF6FF] focus:outline-none"
          onMouseDown={(event) => {
            event.preventDefault();
            onResizeStart?.();
          }}
          type="button"
        />
      ) : null}
      <header className="flex h-10 shrink-0 items-center px-1.5">
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            aria-label={isPage ? "회사 목록으로 이동" : "회사 생성 패널 접기"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={createCompanyMutation.isPending}
            onClick={() => onOpenChange(false)}
            title={isPage ? "회사 목록으로 이동" : "회사 생성 패널 접기"}
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          {onExpand && !isPage ? (
            <button
              aria-label="전체 생성 페이지로 열기"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createCompanyMutation.isPending}
              onClick={() => onExpand(getValues())}
              title="전체 생성 페이지로 열기"
              type="button"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </header>

      <form
        className="flex min-h-0 flex-1 flex-col"
        id={formId}
        onSubmit={(event) => void onSubmit(event)}
      >
        <div
          className="min-h-0 flex-1 cursor-text overflow-y-auto px-5 py-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              focusMemoTextarea();
            }
          }}
        >
          <div
            className={
              isPage
                ? "mx-auto grid min-h-full w-full max-w-[920px] cursor-text content-start gap-4"
                : "grid min-h-full cursor-text content-start gap-4"
            }
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                focusMemoTextarea();
              }
            }}
          >
            <section className="grid cursor-auto gap-2">
              <label
                className="text-[16px] font-semibold text-[#94A3B8]"
                htmlFor="company-name"
              >
                회사명
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#CBD5E1]" />
                <input
                  aria-describedby={
                    errors.companyName ? "company-name-error" : undefined
                  }
                  aria-invalid={Boolean(errors.companyName)}
                  className="h-14 w-full border-0 bg-transparent pl-8 pr-1 text-[32px] font-semibold leading-none text-[#111827] outline-none placeholder:text-[#CBD5E1] placeholder:opacity-100"
                  id="company-name"
                  placeholder="회사명을 넣어주세요."
                  {...register("companyName")}
                />
              </div>
              {errors.companyName ? (
                <p
                  className="text-[12px] text-red-500"
                  id="company-name-error"
                >
                  {errors.companyName.message}
                </p>
              ) : null}
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <CompanyCreatePanelProperty
                error={errors.companyFieldId?.message}
                label="분야"
              >
                <input type="hidden" {...register("companyFieldId")} />
                <ManagedTaxonomyDropdown
                  addPlaceholder="분야명"
                  createActionLabel="새 분야 추가"
                  emptyText="분야를 추가하면 선택할 수 있어요"
                  getLabel={(field) => field.field}
                  id="company-field-id"
                  isCreating={createFieldMutation.isPending}
                  isDeleting={deleteFieldMutation.isPending}
                  items={fields}
                  listClassName="max-h-[132px]"
                  placeholder="분야 선택"
                  selectedId={selectedFieldId}
                  title="분야"
                  onCreate={createField}
                  onDelete={deleteField}
                  onSelect={(id) =>
                    setValue("companyFieldId", id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </CompanyCreatePanelProperty>

              <CompanyCreatePanelProperty
                error={errors.companyRegionId?.message}
                label="지역"
              >
                <input type="hidden" {...register("companyRegionId")} />
                <ManagedTaxonomyDropdown
                  addPlaceholder="지역명"
                  createActionLabel="새 지역 추가"
                  emptyText="지역을 추가하면 선택할 수 있어요"
                  getLabel={(region) => region.region}
                  id="company-region-id"
                  isCreating={createRegionMutation.isPending}
                  isDeleting={deleteRegionMutation.isPending}
                  items={regions}
                  listClassName="max-h-[132px]"
                  placeholder="지역 선택"
                  selectedId={selectedRegionId}
                  title="지역"
                  onCreate={createRegion}
                  onDelete={deleteRegion}
                  onSelect={(id) =>
                    setValue("companyRegionId", id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </CompanyCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-2">
              <label
                className="text-[16px] font-semibold text-[#94A3B8]"
                htmlFor="company-memo"
              >
                메모
              </label>
              <div className="relative min-h-8">
                <textarea
                  aria-label="메모"
                  className="min-h-0 w-full resize-none overflow-hidden border-0 bg-white px-0 py-1 text-[14px] leading-6 text-[#111827] outline-none"
                  id="company-memo"
                  {...memoRegister}
                  onChange={(event) => {
                    memoRegister.onChange(event);
                    resizeMemoTextarea(event.currentTarget);
                  }}
                  ref={(element) => {
                    memoRegister.ref(element);
                    memoTextareaRef.current = element;
                  }}
                  rows={1}
                />
                {companyMemo.trim().length === 0 ? (
                  <span className="pointer-events-none absolute left-0 top-1 text-[14px] font-semibold leading-6 text-[#CBD5E1]">
                    번뜩이는 생각들을 기록하세요!
                  </span>
                ) : null}
              </div>
            </section>

            {createCompanyMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(createCompanyMutation.error)}
                title="회사 저장 실패"
                variant="inline"
              />
            ) : null}
          </div>
        </div>

        <footer className="flex h-16 shrink-0 items-center px-5">
          <div
            className={
              isPage
                ? "mx-auto flex w-full max-w-[920px] justify-end gap-2"
                : "flex w-full justify-end gap-2"
            }
          >
            <button
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#475569] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createCompanyMutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
            >
              {isPage ? "목록으로" : "닫기"}
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#4880EE] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createCompanyMutation.isPending}
              type="submit"
            >
              {createCompanyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {createCompanyMutation.isPending ? "저장 중" : "저장"}
            </button>
          </div>
        </footer>
      </form>
    </section>
  );

  if (isDocked || isPage) {
    return panel;
  }

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex w-full justify-end">
      {panel}
    </div>
  );
}

function resizeMemoTextarea(element: HTMLTextAreaElement | null) {
  if (!element) {
    return;
  }

  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

type CompanyCreatePanelPropertyProps = {
  readonly children: ReactNode;
  readonly error?: string;
  readonly label: string;
};

function CompanyCreatePanelProperty({
  children,
  error,
  label,
}: CompanyCreatePanelPropertyProps) {
  return (
    <div className="grid min-w-0 gap-2">
      <div className="text-[16px] font-semibold text-[#94A3B8]">{label}</div>
      <div className="min-w-0">
        {children}
        {error ? (
          <p
            className="mt-1 truncate text-[12px] leading-4 text-red-500"
            title={error}
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
