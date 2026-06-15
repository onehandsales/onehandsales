import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormRow,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { ErrorState } from "@/components/ui/state";
import { CompanyTaxonomyCreateDialog } from "@/features/company/components/company-taxonomy-create-dialog";
import { useCreateCompanyMutation } from "@/features/company/hooks/use-company-mutations";
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
  readonly regions: CompanyRegion[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: () => void;
};

// 기능 : 회사 생성 모달을 렌더링합니다.
export function CompanyCreateDialog({
  open,
  fields,
  regions,
  onOpenChange,
  onCreated,
}: CompanyCreateDialogProps) {
  const createCompanyMutation = useCreateCompanyMutation();
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
  const [taxonomyDialog, setTaxonomyDialog] = useState<
    | { readonly kind: "field" | "region" }
    | null
  >(null);
  const [pendingFieldName, setPendingFieldName] = useState("");
  const [pendingRegionName, setPendingRegionName] = useState("");
  const selectedFieldId = watch("companyFieldId");
  const selectedRegionId = watch("companyRegionId");
  const companyFieldRegister = register("companyFieldId");
  const companyRegionRegister = register("companyRegionId");

  useEffect(() => {
    if (open) {
      reset(emptyCompanyCreateFormValues);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!pendingFieldName) {
      return;
    }

    const matchedField = fields.find((field) => field.field === pendingFieldName);

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
      (region) => region.region === pendingRegionName
    );

    if (matchedRegion) {
      setValue("companyRegionId", matchedRegion.id, { shouldValidate: true });
      setPendingRegionName("");
    }
  }, [regions, pendingRegionName, setValue]);

  useEffect(() => {
    if (selectedFieldId && !fields.some((field) => field.id === selectedFieldId)) {
      setValue("companyFieldId", "", { shouldValidate: true });
    }
  }, [fields, selectedFieldId, setValue]);

  useEffect(() => {
    if (selectedRegionId && !regions.some((region) => region.id === selectedRegionId)) {
      setValue("companyRegionId", "", { shouldValidate: true });
    }
  }, [regions, selectedRegionId, setValue]);

  if (!open) {
    return null;
  }

  // 기능 : 회사 생성 요청을 보내고 성공 시 모달을 닫습니다.
  const onSubmit = handleSubmit(async (values) => {
    await createCompanyMutation.mutateAsync(toCreateCompanyInput(values));
    onCreated();
    onOpenChange(false);
  });

  return (
    <ModalShell
      description="회사명, 분야, 지역을 저장합니다."
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createCompanyMutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      size="md"
      title="회사 추가"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection
          description="회사명과 분류 기준을 먼저 저장합니다."
          title="회사 기본 정보"
        >
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
              <select
                aria-describedby={
                  errors.companyFieldId ? "company-field-id-error" : undefined
                }
                aria-invalid={Boolean(errors.companyFieldId)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="company-field-id"
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === ADD_TAXONOMY_VALUE) {
                    setTaxonomyDialog({ kind: "field" });
                    return;
                  }
                  companyFieldRegister.onChange(event);
                }}
                value={selectedFieldId}
              >
                <option value="">분야 선택</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.field}
                  </option>
                ))}
                <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
              </select>
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.companyRegionId?.message}
              id="company-region-id"
              label="지역"
            >
              <select
                aria-describedby={
                  errors.companyRegionId
                    ? "company-region-id-error"
                    : undefined
                }
                aria-invalid={Boolean(errors.companyRegionId)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="company-region-id"
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === ADD_TAXONOMY_VALUE) {
                    setTaxonomyDialog({ kind: "region" });
                    return;
                  }
                  companyRegionRegister.onChange(event);
                }}
                value={selectedRegionId}
              >
                <option value="">지역 선택</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.region}
                  </option>
                ))}
                <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
              </select>
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection
          description="입력하면 첫 회사 메모 로그로 저장됩니다."
          title="첫 메모"
        >
          <ModalFieldGroup
            helper="회사 기본 정보 필드는 아닙니다."
            id="company-memo"
            label="첫 회사 메모"
          >
              <textarea
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

      <CompanyTaxonomyCreateDialog
        kind={taxonomyDialog?.kind ?? "field"}
        fields={fields}
        regions={regions}
        onCreated={(name) => {
          if (taxonomyDialog?.kind === "field") {
            setPendingFieldName(name);
          } else if (taxonomyDialog?.kind === "region") {
            setPendingRegionName(name);
          }
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setTaxonomyDialog(null);
          }
        }}
        open={taxonomyDialog !== null}
      />
    </ModalShell>
  );
}

const ADD_TAXONOMY_VALUE = "__add_taxonomy__";
