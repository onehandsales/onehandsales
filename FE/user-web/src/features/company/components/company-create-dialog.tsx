import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, Loader2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
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
  readonly mode?: "docked" | "overlay";
  readonly width?: number;
  readonly regions: CompanyRegion[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (companyName: string) => void;
  readonly onResizeStart?: () => void;
};

// 기능 : 회사 생성 패널을 렌더링합니다.
export function CompanyCreateDialog({
  open,
  fields,
  initialCompanyName = "",
  mode = "overlay",
  regions,
  width,
  onOpenChange,
  onCreated,
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
  const selectedFieldId = watch("companyFieldId");
  const selectedRegionId = watch("companyRegionId");

  useEffect(() => {
    if (open) {
      reset({
        ...emptyCompanyCreateFormValues,
        companyName: initialCompanyName.trim(),
      });
      setPendingFieldName("");
      setPendingRegionName("");
    }
  }, [initialCompanyName, open, reset]);

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
      selectedFieldId &&
      !fields.some((field) => field.id === selectedFieldId)
    ) {
      setValue("companyFieldId", "", { shouldValidate: true });
    }
  }, [fields, selectedFieldId, setValue]);

  useEffect(() => {
    if (
      selectedRegionId &&
      !regions.some((region) => region.id === selectedRegionId)
    ) {
      setValue("companyRegionId", "", { shouldValidate: true });
    }
  }, [regions, selectedRegionId, setValue]);

  if (!open) {
    return null;
  }

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
  const panel = (
    <section
      aria-labelledby="company-create-panel-title"
      aria-modal={!isDocked}
      className={
        isDocked
          ? "pointer-events-auto fixed inset-y-0 right-0 z-50 flex h-screen shrink-0 flex-col border-l border-[#E5E7EB] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)]"
          : "pointer-events-auto relative flex h-full w-full flex-col border-l border-[#E5E7EB] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] sm:max-w-[520px]"
      }
      role="dialog"
      style={isDocked ? { width: width ?? 520 } : undefined}
    >
      {isDocked ? (
        <button
          aria-label="회사 생성 패널 폭 조절"
          className="absolute -left-1 top-0 z-10 h-full w-2 cursor-col-resize border-x border-transparent transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF] focus:border-[#4880EE] focus:bg-[#EFF6FF] focus:outline-none"
          onMouseDown={(event) => {
            event.preventDefault();
            onResizeStart?.();
          }}
          type="button"
        />
      ) : null}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#E5E7EB] px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] text-[#64748B]">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[#94A3B8]">새 항목</p>
          <h2
            className="truncate text-[14px] font-semibold text-[#111827]"
            id="company-create-panel-title"
          >
            회사 생성
          </h2>
        </div>
        <button
          aria-label="회사 생성 닫기"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#94A3B8] transition hover:bg-[#F3F4F6] hover:text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={createCompanyMutation.isPending}
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <form
        className="flex min-h-0 flex-1 flex-col"
        id={formId}
        onSubmit={(event) => void onSubmit(event)}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div className="grid gap-6">
            <section className="grid gap-2">
              <label
                className="text-[12px] font-medium text-[#94A3B8]"
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
                  className="h-12 w-full border-0 border-b border-transparent bg-transparent pl-8 pr-1 text-[22px] font-semibold leading-none text-[#111827] outline-none placeholder:text-[#CBD5E1] focus:border-[#CBD5E1]"
                  id="company-name"
                  placeholder="제목 없는 회사"
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

            <section className="grid gap-1 border-y border-[#EEF2F7]">
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

            <section className="grid gap-2">
              <label
                className="text-[12px] font-medium text-[#94A3B8]"
                htmlFor="company-memo"
              >
                메모
              </label>
              <textarea
                aria-label="메모"
                className="min-h-[148px] resize-y rounded-md border border-transparent bg-transparent px-0 py-1 text-[14px] leading-6 text-[#111827] outline-none placeholder:text-[#CBD5E1] focus:border-[#E5E7EB] focus:bg-[#F9FAFB] focus:px-3"
                id="company-memo"
                placeholder="필요한 메모를 남겨두세요."
                {...register("companyMemo")}
              />
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

        <footer className="flex h-16 shrink-0 items-center justify-end gap-2 border-t border-[#E5E7EB] px-5">
          <button
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#475569] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={createCompanyMutation.isPending}
            onClick={() => onOpenChange(false)}
            type="button"
          >
            닫기
          </button>
          <button
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#111827] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:opacity-60"
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
        </footer>
      </form>
    </section>
  );

  if (isDocked) {
    return panel;
  }

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex w-full justify-end">
      {panel}
    </div>
  );
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
    <div className="grid gap-2 border-b border-[#EEF2F7] py-3 last:border-b-0 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-start">
      <div className="pt-2 text-[12px] font-medium text-[#94A3B8]">{label}</div>
      <div className="min-w-0">
        {children}
        <p
          className="mt-1 h-4 truncate text-[12px] leading-4 text-red-500"
          title={error}
        >
          {error ?? ""}
        </p>
      </div>
    </div>
  );
}
