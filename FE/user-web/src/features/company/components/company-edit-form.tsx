import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateCompanyMutation } from "@/features/company/hooks/use-company-mutations";
import {
  companyFormSchema,
  toCompanyFormValues,
  toUpdateCompanyInput,
  type CompanyFormValues,
} from "@/features/company/schemas/company-schema";
import type { Company } from "@/features/company/types/company";
import { getApiErrorMessage } from "@/lib/api-client";

type CompanyEditFormProps = {
  readonly company: Company;
  readonly onSaved: (company: Company) => void;
};

export function CompanyEditForm({ company, onSaved }: CompanyEditFormProps) {
  const updateCompanyMutation = useUpdateCompanyMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: toCompanyFormValues(company),
  });

  useEffect(() => {
    reset(toCompanyFormValues(company));
  }, [company, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const updatedCompany = await updateCompanyMutation.mutateAsync(
      toUpdateCompanyInput(company.id, values)
    );

    onSaved(updatedCompany);
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="company-detail-name">
          회사명
        </label>
        <input
          aria-describedby={
            errors.name ? "company-detail-name-error" : undefined
          }
          aria-invalid={Boolean(errors.name)}
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="company-detail-name"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-xs text-destructive" id="company-detail-name-error">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="company-detail-industry">
            분야
          </label>
          <input
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="company-detail-industry"
            {...register("industry")}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="company-detail-region">
            지역
          </label>
          <input
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="company-detail-region"
            {...register("region")}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="company-detail-address">
            주소
          </label>
          <input
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="company-detail-address"
            {...register("address")}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="company-detail-website">
            웹사이트
          </label>
          <input
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="company-detail-website"
            {...register("website")}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="company-detail-tags">
          태그
        </label>
        <input
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="company-detail-tags"
          {...register("tagsText")}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="company-detail-description">
          설명
        </label>
        <textarea
          className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="company-detail-description"
          {...register("description")}
        />
      </div>

      {updateCompanyMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(updateCompanyMutation.error)}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={updateCompanyMutation.isPending}
          type="submit"
        >
          <Save className="h-4 w-4" />
          저장
        </button>
      </div>
    </form>
  );
}
