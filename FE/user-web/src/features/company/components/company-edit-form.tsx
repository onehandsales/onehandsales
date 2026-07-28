import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ManagedTaxonomyDropdown } from "@/components/ui/managed-taxonomy-dropdown";
import { useAppI18n } from "@/features/app-i18n";
import { CompanyRegionSelect } from "@/features/company/components/company-region-select";
import { useCompanyFields, useCompanyRegions } from "@/features/company/hooks/use-company-list";
import {
  useCreateCompanyFieldMutation,
  useCreateCompanyRegionMutation,
  useDeleteCompanyFieldMutation,
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
import {
  findCompanyRegionByCode,
  type CompanyRegionSelectOption,
} from "@/features/company/utils/company-region-options";
import { getApiErrorMessage } from "@/lib/api-client";

type CompanyEditFormProps = {
  readonly company: CompanyDetail;
  readonly fields: CompanyField[];
  readonly formId?: string;
  readonly regions: CompanyRegion[];
  readonly onPendingChange?: (isPending: boolean) => void;
  readonly onSaved: () => void;
};

// 기능 : 회사 상세 기본 정보 수정 폼을 렌더링합니다.
export function CompanyEditForm({
  company,
  fields,
  formId,
  regions,
  onPendingChange,
  onSaved,
}: CompanyEditFormProps) {
  const { locale } = useAppI18n();
  const updateCompanyMutation = useUpdateCompanyMutation();
  const createFieldMutation = useCreateCompanyFieldMutation();
  const createRegionMutation = useCreateCompanyRegionMutation();
  const deleteFieldMutation = useDeleteCompanyFieldMutation();
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const [pendingFieldName, setPendingFieldName] = useState("");
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
  const selectedCountryCode = watch("countryCode") ?? "KR";
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
  }, [company, reset]);

  useEffect(() => {
    onPendingChange?.(updateCompanyMutation.isPending);
  }, [onPendingChange, updateCompanyMutation.isPending]);

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

  // 기능 : 표준 지역은 사용자별 CompanyRegion row가 없으면 생성한 뒤 선택합니다.
  const selectRegionOption = async (option: CompanyRegionSelectOption | null) => {
    if (!option) {
      setValue("companyRegionId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("regionCode", "", { shouldDirty: true });
      return;
    }

    if (option.countryCode) {
      setValue("countryCode", option.countryCode, { shouldDirty: true });
    }
    setValue("regionCode", option.regionCode ?? "", { shouldDirty: true });

    if (option.companyRegionId) {
      setValue("companyRegionId", option.companyRegionId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (!option.countryCode || !option.regionCode) {
      return;
    }

    await createRegionMutation.mutateAsync({
      region: option.region,
      countryCode: option.countryCode,
      regionCode: option.regionCode,
    });

    const updated = await regionsQuery.refetch();
    const created = findCompanyRegionByCode(
      updated.data?.items ?? regionItems,
      option.countryCode,
      option.regionCode
    );

    if (created) {
      setValue("companyRegionId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  // 기능 : 국가가 바뀌면 이전 국가의 지역 선택을 비워 잘못된 code 조합을 막습니다.
  const changeRegionCountry = (countryCode: "KR" | "US") => {
    setValue("countryCode", countryCode, { shouldDirty: true });
    setValue("regionCode", "", { shouldDirty: true });
    setValue("companyRegionId", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form
      className="grid gap-3"
      id={formId}
      onSubmit={(event) => void onSubmit(event)}
    >
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
                  emptyText="분야를 추가하면 선택할 수 있어요"
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
          <input type="hidden" {...register("countryCode")} />
          <input type="hidden" {...register("regionCode")} />
          <CompanyRegionSelect
            countryCode={selectedCountryCode}
            idPrefix="company-edit"
            isCreating={createRegionMutation.isPending}
            locale={locale}
            regions={regionItems}
            selectedRegionId={selectedRegionId}
            onCountryChange={changeRegionCountry}
            onRegionSelect={selectRegionOption}
          />
          {errors.companyRegionId ? (
            <p className="text-xs text-destructive" id="company-edit-region-error">
              {errors.companyRegionId.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="company-edit-address">
          주소
        </label>
        <input
          className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="company-edit-address"
          placeholder="주소를 입력해 주세요"
          {...register("address")}
        />
        {errors.address ? (
          <p className="text-xs text-destructive" id="company-edit-address-error">
            {errors.address.message}
          </p>
        ) : null}
      </div>

      {updateCompanyMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(updateCompanyMutation.error)}
        </p>
      ) : null}

    </form>
  );
}
