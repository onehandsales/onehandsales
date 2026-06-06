import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateCompanyMutation } from "@/features/company/hooks/use-company-mutations";
import {
  companyFormSchema,
  emptyCompanyFormValues,
  toCreateCompanyInput,
  type CompanyFormValues,
} from "@/features/company/schemas/company-schema";
import type { Company } from "@/features/company/types/company";
import { getApiErrorMessage } from "@/lib/api-client";

type CompanyCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (company: Company) => void;
};

export function CompanyCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: CompanyCreateDialogProps) {
  const createCompanyMutation = useCreateCompanyMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: emptyCompanyFormValues,
  });

  useEffect(() => {
    if (open) {
      reset(emptyCompanyFormValues);
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    const company = await createCompanyMutation.mutateAsync(
      toCreateCompanyInput(values)
    );

    onCreated(company);
    onOpenChange(false);
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-6">
      <section
        aria-modal="true"
        className="w-full max-w-2xl overflow-hidden rounded-lg border bg-white shadow-xl"
        role="dialog"
      >
        <header className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">회사 빠른 등록</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              새 회사의 기본 정보와 첫 메모를 저장합니다.
            </p>
          </div>
          <button
            aria-label="닫기"
            className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground hover:bg-muted"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form className="grid gap-4 px-5 py-5" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="company-name">
              회사명
            </label>
            <input
              aria-describedby={errors.name ? "company-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-name"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-destructive" id="company-name-error">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="company-industry">
                분야
              </label>
              <input
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="company-industry"
                {...register("industry")}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="company-region">
                지역
              </label>
              <input
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="company-region"
                {...register("region")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="company-tags">
              태그
            </label>
            <input
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-tags"
              {...register("tagsText")}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="company-memo">
              첫 메모
            </label>
            <textarea
              className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-memo"
              {...register("initialMemo")}
            />
          </div>

          {createCompanyMutation.error ? (
            <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
              {getApiErrorMessage(createCompanyMutation.error)}
            </p>
          ) : null}

          <footer className="flex justify-end gap-2 border-t pt-4">
            <button
              className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              취소
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createCompanyMutation.isPending}
              type="submit"
            >
              <Plus className="h-4 w-4" />
              저장
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
