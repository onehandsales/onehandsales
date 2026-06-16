import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
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
import { ContactTaxonomyManageDialog } from "@/features/contact/components/contact-taxonomy-manage-dialog";
import { useContactDepartments, useContactJobGrades } from "@/features/contact/hooks/use-contact-list";
import {
  useCreateContactMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import {
  contactCreateFormSchema,
  emptyContactCreateFormValues,
  toCreateContactInput,
  type ContactCreateFormValues,
} from "@/features/contact/schemas/contact-schema";
import { getApiErrorMessage } from "@/lib/api-client";

type ContactCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: () => void;
};

// 기능 : 담당자 생성 모달을 렌더링합니다.
export function ContactCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: ContactCreateDialogProps) {
  const createContactMutation = useCreateContactMutation();
  const jobGradesQuery = useContactJobGrades();
  const departmentsQuery = useContactDepartments();
  const [taxonomyDialog, setTaxonomyDialog] = useState<
    | { readonly kind: "department" | "jobGrade" }
    | null
  >(null);
  const [pendingDepartmentName, setPendingDepartmentName] = useState("");
  const [pendingJobGradeName, setPendingJobGradeName] = useState("");

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
  const departmentId = watch("contactDepartmentId") ?? "";
  const jobGradeId = watch("contactJobGradeId") ?? "";
  const formId = "contact-create-form";
  const departmentRegister = register("contactDepartmentId");
  const jobGradeRegister = register("contactJobGradeId");
  const jobGrades = useMemo(() => jobGradesQuery.data?.items ?? [], [jobGradesQuery.data]);
  const departments = useMemo(
    () => departmentsQuery.data?.items ?? [],
    [departmentsQuery.data]
  );

  useEffect(() => {
    if (open) {
      reset(emptyContactCreateFormValues);
      setTaxonomyDialog(null);
      setPendingDepartmentName("");
      setPendingJobGradeName("");
    }
  }, [open, reset]);

  useEffect(() => {
    if (!pendingDepartmentName) {
      return;
    }

    const matchedDepartment = departments.find(
      (department) => department.departmentName === pendingDepartmentName
    );

    if (matchedDepartment) {
      setValue("contactDepartmentId", matchedDepartment.id, { shouldDirty: true });
      setPendingDepartmentName("");
    }
  }, [departments, pendingDepartmentName, setValue]);

  useEffect(() => {
    if (!pendingJobGradeName) {
      return;
    }

    const matchedJobGrade = jobGrades.find(
      (jobGrade) => jobGrade.jobGradeName === pendingJobGradeName
    );

    if (matchedJobGrade) {
      setValue("contactJobGradeId", matchedJobGrade.id, { shouldDirty: true });
      setPendingJobGradeName("");
    }
  }, [jobGrades, pendingJobGradeName, setValue]);

  useEffect(() => {
    if (departmentId && !departments.some((dept) => dept.id === departmentId)) {
      setValue("contactDepartmentId", "", { shouldDirty: true });
    }
  }, [departments, departmentId, setValue]);

  useEffect(() => {
    if (jobGradeId && !jobGrades.some((grade) => grade.id === jobGradeId)) {
      setValue("contactJobGradeId", "", { shouldDirty: true });
    }
  }, [jobGrades, jobGradeId, setValue]);

  if (!open) {
    return null;
  }

  // 기능 : 담당자를 생성하고 모달을 닫습니다.
  const onSubmit = handleSubmit(async (values) => {
    await createContactMutation.mutateAsync(toCreateContactInput(values));
    onCreated();
    onOpenChange(false);
  });

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
      title="담당자 빠른 등록"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection
          description="담당자 이름과 연결 회사를 지정합니다."
          title="담당자 기본 정보"
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
                onChange={(event) => {
                  if (event.target.value === ADD_TAXONOMY_VALUE) {
                    setTaxonomyDialog({ kind: "department" });
                    return;
                  }
                  departmentRegister.onChange(event);
                }}
                value={departmentId}
              >
                <option value="">부서 선택</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.departmentName}
                  </option>
                ))}
                <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
              </select>
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
                onChange={(event) => {
                  if (event.target.value === ADD_TAXONOMY_VALUE) {
                    setTaxonomyDialog({ kind: "jobGrade" });
                    return;
                  }
                  jobGradeRegister.onChange(event);
                }}
                value={jobGradeId}
              >
                <option value="">직급 선택</option>
                {jobGrades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.jobGradeName}
                  </option>
                ))}
                <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
              </select>
            </ModalFieldGroup>
          </ModalFormRow>
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
            title="담당자 저장 실패"
            variant="inline"
          />
        ) : null}
      </ModalForm>

      <ContactTaxonomyManageDialog
        onCreated={(kind, name) => {
          if (kind === "department") {
            setPendingDepartmentName(name);
          } else {
            setPendingJobGradeName(name);
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
