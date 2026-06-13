import { zodResolver } from "@hookform/resolvers/zod";
import { type FormEvent, useEffect, useState } from "react";
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
import { ContactCompanyField } from "@/features/contact/components/contact-company-field";
import { useContactDepartments, useContactJobGrades } from "@/features/contact/hooks/use-contact-list";
import {
  useCreateContactMutation,
  useCreateDepartmentMutation,
  useCreateJobGradeMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import {
  contactCreateFormSchema,
  emptyContactCreateFormValues,
  toCreateContactInput,
  type ContactCreateFormValues,
} from "@/features/contact/schemas/contact-schema";
import { ApiClientError, getApiErrorMessage } from "@/lib/api-client";

type ContactCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: () => void;
};

// 기능 : 거래처 생성 모달을 렌더링합니다.
export function ContactCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: ContactCreateDialogProps) {
  const createContactMutation = useCreateContactMutation();
  const jobGradesQuery = useContactJobGrades();
  const departmentsQuery = useContactDepartments();
  const createJobGradeMutation = useCreateJobGradeMutation();
  const createDepartmentMutation = useCreateDepartmentMutation();
  const [newJobGradeName, setNewJobGradeName] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactCreateFormValues>({
    resolver: zodResolver(contactCreateFormSchema),
    defaultValues: emptyContactCreateFormValues,
  });
  const companyId = watch("companyId") ?? "";
  const companySearch = watch("companySearch") ?? "";
  const formId = "contact-create-form";

  useEffect(() => {
    if (open) {
      reset(emptyContactCreateFormValues);
      setNewJobGradeName("");
      setNewDepartmentName("");
      setTaxonomyError(null);
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  // 기능 : 거래처를 생성하고 모달을 닫습니다.
  const onSubmit = handleSubmit(async (values) => {
    await createContactMutation.mutateAsync(toCreateContactInput(values));
    onCreated();
    onOpenChange(false);
  });

  // 기능 : 새 직급을 생성하고 자동 선택합니다.
  const onJobGradeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTaxonomyError(null);
    const name = newJobGradeName.trim();

    if (!name) {
      return;
    }

    try {
      await createJobGradeMutation.mutateAsync({ jobGradeName: name });
      const updated = await jobGradesQuery.refetch();
      const created = updated.data?.items.find((g) => g.jobGradeName === name);

      if (created) {
        setValue("contactJobGradeId", created.id, { shouldDirty: true });
      }

      setNewJobGradeName("");
    } catch (error) {
      setTaxonomyError(
        error instanceof ApiClientError && error.statusCode === 409
          ? "이미 사용 중인 직급입니다."
          : getApiErrorMessage(error)
      );
    }
  };

  // 기능 : 새 부서를 생성하고 자동 선택합니다.
  const onDepartmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTaxonomyError(null);
    const name = newDepartmentName.trim();

    if (!name) {
      return;
    }

    try {
      await createDepartmentMutation.mutateAsync({ departmentName: name });
      const updated = await departmentsQuery.refetch();
      const created = updated.data?.items.find((d) => d.departmentName === name);

      if (created) {
        setValue("contactDepartmentId", created.id, { shouldDirty: true });
      }

      setNewDepartmentName("");
    } catch (error) {
      setTaxonomyError(
        error instanceof ApiClientError && error.statusCode === 409
          ? "이미 사용 중인 부서입니다."
          : getApiErrorMessage(error)
      );
    }
  };

  const jobGrades = jobGradesQuery.data?.items ?? [];
  const departments = departmentsQuery.data?.items ?? [];

  return (
    <ModalShell
      description="담당자 정보와 연결 회사를 저장합니다."
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createContactMutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      size="md"
      title="거래처 빠른 등록"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection
          description="담당자 이름과 연결 회사를 지정합니다."
          title="거래처 기본 정보"
        >
          <ModalFieldGroup
            error={errors.username?.message}
            id="contact-username"
            label="이름"
          >
            <input
              aria-describedby={errors.username ? "contact-username-error" : undefined}
              aria-invalid={Boolean(errors.username)}
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-username"
              {...register("username")}
            />
          </ModalFieldGroup>

          <ContactCompanyField
            companyId={companyId}
            error={errors.companyId?.message}
            id="contact-company"
            label="회사"
            onCompanyIdChange={(value) =>
              setValue("companyId", value, { shouldDirty: true })
            }
            onSearchChange={(value) =>
              setValue("companySearch", value, { shouldDirty: true })
            }
            search={companySearch}
          />
        </ModalFormSection>

        <ModalFormSection title="연락 정보">
          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.mobile?.message}
              id="contact-mobile"
              label="휴대폰번호"
            >
              <input
                aria-describedby={errors.mobile ? "contact-mobile-error" : undefined}
                aria-invalid={Boolean(errors.mobile)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="contact-mobile"
                placeholder="010-0000-0000"
                {...register("mobile")}
              />
            </ModalFieldGroup>
            <ModalFieldGroup
              error={errors.email?.message}
              id="contact-email"
              label="이메일"
            >
              <input
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                aria-invalid={Boolean(errors.email)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="contact-email"
                {...register("email")}
              />
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection title="소속 정보">
          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.contactDepartmentId?.message}
              id="contact-department-id"
              label="부서"
            >
              <select
                aria-describedby={
                  errors.contactDepartmentId ? "contact-department-id-error" : undefined
                }
                aria-invalid={Boolean(errors.contactDepartmentId)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="contact-department-id"
                {...register("contactDepartmentId")}
              >
                <option value="">부서 선택</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
              <form
                className="flex gap-2"
                onSubmit={(e) => void onDepartmentSubmit(e)}
              >
                <input
                  className="h-8 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="새 부서 추가"
                  value={newDepartmentName}
                />
                <button
                  className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    createDepartmentMutation.isPending ||
                    newDepartmentName.trim().length === 0
                  }
                  type="submit"
                >
                  저장
                </button>
              </form>
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.contactJobGradeId?.message}
              id="contact-job-grade-id"
              label="직급"
            >
              <select
                aria-describedby={
                  errors.contactJobGradeId ? "contact-job-grade-id-error" : undefined
                }
                aria-invalid={Boolean(errors.contactJobGradeId)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="contact-job-grade-id"
                {...register("contactJobGradeId")}
              >
                <option value="">직급 선택</option>
                {jobGrades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.jobGradeName}
                  </option>
                ))}
              </select>
              <form
                className="flex gap-2"
                onSubmit={(e) => void onJobGradeSubmit(e)}
              >
                <input
                  className="h-8 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                  onChange={(e) => setNewJobGradeName(e.target.value)}
                  placeholder="새 직급 추가"
                  value={newJobGradeName}
                />
                <button
                  className="h-8 rounded-md border px-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    createJobGradeMutation.isPending ||
                    newJobGradeName.trim().length === 0
                  }
                  type="submit"
                >
                  저장
                </button>
              </form>
            </ModalFieldGroup>
          </ModalFormRow>

          {taxonomyError ? (
            <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
              {taxonomyError}
            </p>
          ) : null}
        </ModalFormSection>

        <ModalFormSection
          description="입력하면 첫 메모 로그로 저장됩니다."
          title="첫 메모"
        >
          <ModalFieldGroup id="contact-memo" label="첫 메모">
            <textarea
              className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-memo"
              {...register("contactMemo")}
            />
          </ModalFieldGroup>
        </ModalFormSection>

        {createContactMutation.error ? (
          <ErrorState
            message={getApiErrorMessage(createContactMutation.error)}
            title="거래처 저장 실패"
            variant="inline"
          />
        ) : null}
      </ModalForm>
    </ModalShell>
  );
}
