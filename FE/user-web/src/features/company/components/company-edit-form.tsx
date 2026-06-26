import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ManagedTaxonomyDropdown } from "@/components/ui/managed-taxonomy-dropdown";
import { Button } from "@/components/ui/button";
import { useCompanyFields, useCompanyRegions } from "@/features/company/hooks/use-company-list";
import {
  useCreateCompanyFieldMutation,
  useCreateCompanyRegionMutation,
  useDeleteCompanyFieldMutation,
  useDeleteCompanyRegionMutation,
  useUpdateCompanyMutation,
} from "@/features/company/hooks/use-company-mutations";
import {
  companyEditFormSchema,
  toCompanyEditFormValues,
  toUpdateCompanyInput,
  type CompanyEditFormValues,
} from "@/features/company/schemas/company-schema";
import type {
  CompanyDetail,
  CompanyField,
  CompanyRegion,
} from "@/features/company/types/company";
import { getApiErrorMessage } from "@/lib/api-client";

type CompanyEditFormProps = {
  readonly company: CompanyDetail;
  readonly fields: CompanyField[];
  readonly regions: CompanyRegion[];
  readonly onSaved: () => void;
};

// 기능 : 회사 상세 기본 정보 수정 폼을 렌더링합니다.
export function CompanyEditForm({
  company,
  fields,
  regions,
  onSaved,
}: CompanyEditFormProps) {
  const updateCompanyMutation = useUpdateCompanyMutation();
  const createFieldMutation = useCreateCompanyFieldMutation();
  const createRegionMutation = useCreateCompanyRegionMutation();
  const deleteFieldMutation = useDeleteCompanyFieldMutation();
  const deleteRegionMutation = useDeleteCompanyRegionMutation();
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const [pendingFieldName, setPendingFieldName] = useState("");
  const [pendingRegionName, setPendingRegionName] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyEditFormValues>({
    resolver: zodResolver(companyEditFormSchema),
    defaultValues: toCompanyEditFormValues(company),
  });
  const selectedFieldId = watch("companyFieldId") ?? "";
  const selectedRegionId = watch("companyRegionId") ?? "";
  const fieldItems = useMemo(
    () => fieldsQuery.data?.items ?? fields,
    [fields, fieldsQuery.data]
  );
  const regionItems = useMemo(
    () => regionsQuery.data?.items ?? regions,
    [regions, regionsQuery.data]
  );

  useEffect(() => {
    reset(toCompanyEditFormValues(company));
    setPendingFieldName("");
    setPendingRegionName("");
  }, [company, reset]);

  useEffect(() => {
    if (!pendingFieldName) {
      return;
    }

    const matchedField = fieldItems.find(
      (field) => field.field === pendingFieldName
    );

    if (matchedField) {
      setValue("companyFieldId", matchedField.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPendingFieldName("");
    }
  }, [fieldItems, pendingFieldName, setValue]);

  useEffect(() => {
    if (!pendingRegionName) {
      return;
    }

    const matchedRegion = regionItems.find(
      (region) => region.region === pendingRegionName
    );

    if (matchedRegion) {
      setValue("companyRegionId", matchedRegion.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPendingRegionName("");
    }
  }, [pendingRegionName, regionItems, setValue]);

  useEffect(() => {
    if (
      selectedFieldId &&
      !fieldItems.some((field) => field.id === selectedFieldId)
    ) {
      setValue("companyFieldId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [fieldItems, selectedFieldId, setValue]);

  useEffect(() => {
    if (
      selectedRegionId &&
      !regionItems.some((region) => region.id === selectedRegionId)
    ) {
      setValue("companyRegionId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [regionItems, selectedRegionId, setValue]);

  // 기능 : 회사 기본 정보 수정 요청을 보냅니다.
  const onSubmit = handleSubmit(async (values) => {
    await updateCompanyMutation.mutateAsync(
      toUpdateCompanyInput(company.id, values)
    );
    onSaved();
  });

  // 기능 : 새 회사 분야를 생성하고 생성된 항목을 선택합니다.
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

  // 기능 : 새 회사 지역을 생성하고 생성된 항목을 선택합니다.
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

  // 기능 : 회사 분야를 삭제하고 선택 중인 항목이면 선택값을 비웁니다.
  const deleteField = async (field: CompanyField) => {
    await deleteFieldMutation.mutateAsync(field.id);

    if (selectedFieldId === field.id) {
      setValue("companyFieldId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  // 기능 : 회사 지역을 삭제하고 선택 중인 항목이면 선택값을 비웁니다.
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
    <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="company-edit-name">
          회사명
        </label>
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-describedby={
              errors.companyName ? "company-edit-name-error" : undefined
            }
            aria-invalid={Boolean(errors.companyName)}
            className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="company-edit-name"
            {...register("companyName")}
          />
        </div>
        {errors.companyName ? (
          <p className="text-xs text-destructive" id="company-edit-name-error">
            {errors.companyName.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="company-edit-field">
            분야
          </label>
          <input type="hidden" {...register("companyFieldId")} />
          <ManagedTaxonomyDropdown
            addPlaceholder="분야명"
            createActionLabel="새 분야 추가"
            emptyText="분야가 없습니다"
            getLabel={(field) => field.field}
            id="company-edit-field"
            isCreating={createFieldMutation.isPending}
            isDeleting={deleteFieldMutation.isPending}
            items={fieldItems}
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
          {errors.companyFieldId ? (
            <p className="text-xs text-destructive" id="company-edit-field-error">
              {errors.companyFieldId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="company-edit-region">
            지역
          </label>
          <input type="hidden" {...register("companyRegionId")} />
          <ManagedTaxonomyDropdown
            addPlaceholder="지역명"
            createActionLabel="새 지역 추가"
            emptyText="지역이 없습니다"
            getLabel={(region) => region.region}
            id="company-edit-region"
            isCreating={createRegionMutation.isPending}
            isDeleting={deleteRegionMutation.isPending}
            items={regionItems}
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
          {errors.companyRegionId ? (
            <p className="text-xs text-destructive" id="company-edit-region-error">
              {errors.companyRegionId.message}
            </p>
          ) : null}
        </div>
      </div>

      {updateCompanyMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(updateCompanyMutation.error)}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button
          disabled={updateCompanyMutation.isPending}
          isPending={updateCompanyMutation.isPending}
          type="submit"
          variant="primary"
        >
          {updateCompanyMutation.isPending ? "저장 중" : "저장"}
        </Button>
      </div>
    </form>
  );
}
