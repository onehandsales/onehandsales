import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useUpdateCompanyMutation } from "@/features/company/hooks/use-company-mutations";
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyEditFormValues>({
    resolver: zodResolver(companyEditFormSchema),
    defaultValues: toCompanyEditFormValues(company),
  });

  useEffect(() => {
    reset(toCompanyEditFormValues(company));
  }, [company, reset]);

  // 기능 : 회사 기본 정보 수정 요청을 보냅니다.
  const onSubmit = handleSubmit(async (values) => {
    await updateCompanyMutation.mutateAsync(
      toUpdateCompanyInput(company.id, values)
    );
    onSaved();
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
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
          <select
            aria-describedby={
              errors.companyFieldId ? "company-edit-field-error" : undefined
            }
            aria-invalid={Boolean(errors.companyFieldId)}
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="company-edit-field"
            {...register("companyFieldId")}
          >
            <option value="">분야 선택</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.field}
              </option>
            ))}
          </select>
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
          <select
            aria-describedby={
              errors.companyRegionId ? "company-edit-region-error" : undefined
            }
            aria-invalid={Boolean(errors.companyRegionId)}
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="company-edit-region"
            {...register("companyRegionId")}
          >
            <option value="">지역 선택</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.region}
              </option>
            ))}
          </select>
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
