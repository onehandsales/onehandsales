import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ManagedTaxonomyDropdown } from "@/components/ui/managed-taxonomy-dropdown";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormRow,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
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
  readonly regions: CompanyRegion[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (companyName: string) => void;
};

// 기능 : 회사 생성 모달을 렌더링합니다.
export function CompanyCreateDialog({
  open,
  fields,
  initialCompanyName = "",
  regions,
  onOpenChange,
  onCreated,
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

  // 기능 : 회사 생성 요청을 보내고 성공 시 모달을 닫습니다.
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

  return (
    <ModalShell
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createCompanyMutation.isPending}
          onCancel={() => onOpenChange(false)}
          onSubmit={() => void onSubmit()}
        />
      }
      open={open}
      panelClassName="max-h-[82vh] md:max-h-[620px]"
      size="md"
      title="회사 추가"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection title="회사 기본 정보">
          <ModalFieldGroup
            error={errors.companyName?.message}
            id="company-name"
            label="회사명"
          >
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                aria-describedby={
                  errors.companyName ? "company-name-error" : undefined
                }
                aria-invalid={Boolean(errors.companyName)}
                className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="company-name"
                {...register("companyName")}
              />
            </div>
          </ModalFieldGroup>

          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.companyFieldId?.message}
              id="company-field-id"
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
                listClassName="max-h-[88px]"
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
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.companyRegionId?.message}
              id="company-region-id"
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
                listClassName="max-h-[88px]"
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
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection title="메모(옵션)">
          <ModalFieldGroup id="company-memo">
            <textarea
              aria-label="메모"
              className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-memo"
              {...register("companyMemo")}
            />
          </ModalFieldGroup>
        </ModalFormSection>

        {createCompanyMutation.error ? (
          <ErrorState
            message={getApiErrorMessage(createCompanyMutation.error)}
            title="회사 저장 실패"
            variant="inline"
          />
        ) : null}
      </ModalForm>
    </ModalShell>
  );
}
