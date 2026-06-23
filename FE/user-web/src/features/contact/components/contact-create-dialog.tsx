import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
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
import { CompanyCreateDialog } from "@/features/company/components/company-create-dialog";
import { useCompanyFields, useCompanyRegions } from "@/features/company/hooks/use-company-list";
import { ContactCompanyField } from "@/features/contact/components/contact-company-field";
import { useCompanyOptions } from "@/features/contact/hooks/use-company-options";
import { useContactDepartments, useContactJobGrades } from "@/features/contact/hooks/use-contact-list";
import {
  useCreateDepartmentMutation,
  useCreateContactMutation,
  useCreateJobGradeMutation,
  useDeleteDepartmentMutation,
  useDeleteJobGradeMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import {
  contactCreateFormSchema,
  emptyContactCreateFormValues,
  toCreateContactInput,
  type ContactCreateFormValues,
} from "@/features/contact/schemas/contact-schema";
import type {
  ContactDepartment,
  ContactJobGrade,
} from "@/features/contact/types/contact";
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
  const companyOptionsQuery = useCompanyOptions();
  const companyFieldsQuery = useCompanyFields();
  const companyRegionsQuery = useCompanyRegions();
  const jobGradesQuery = useContactJobGrades();
  const departmentsQuery = useContactDepartments();
  const createDepartmentMutation = useCreateDepartmentMutation();
  const createJobGradeMutation = useCreateJobGradeMutation();
  const deleteDepartmentMutation = useDeleteDepartmentMutation();
  const deleteJobGradeMutation = useDeleteJobGradeMutation();
  const [pendingDepartmentName, setPendingDepartmentName] = useState("");
  const [pendingJobGradeName, setPendingJobGradeName] = useState("");
  const [isCompanyCreateOpen, setIsCompanyCreateOpen] = useState(false);
  const [companyCreateName, setCompanyCreateName] = useState("");

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
  const companyFields = useMemo(
    () => companyFieldsQuery.data?.items ?? [],
    [companyFieldsQuery.data]
  );
  const companyRegions = useMemo(
    () => companyRegionsQuery.data?.items ?? [],
    [companyRegionsQuery.data]
  );
  const jobGrades = useMemo(() => jobGradesQuery.data?.items ?? [], [jobGradesQuery.data]);
  const departments = useMemo(
    () => departmentsQuery.data?.items ?? [],
    [departmentsQuery.data]
  );

  useEffect(() => {
    if (open) {
      reset(emptyContactCreateFormValues);
      setPendingDepartmentName("");
      setPendingJobGradeName("");
      setIsCompanyCreateOpen(false);
      setCompanyCreateName("");
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
      setValue("contactDepartmentId", matchedDepartment.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
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
      setValue("contactJobGradeId", matchedJobGrade.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
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

  const createDepartment = async (name: string) => {
    await createDepartmentMutation.mutateAsync({ departmentName: name });
    const updated = await departmentsQuery.refetch();
    const created = updated.data?.items.find(
      (department) => department.departmentName === name
    );

    if (created) {
      setValue("contactDepartmentId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setPendingDepartmentName(name);
  };

  const createJobGrade = async (name: string) => {
    await createJobGradeMutation.mutateAsync({ jobGradeName: name });
    const updated = await jobGradesQuery.refetch();
    const created = updated.data?.items.find(
      (jobGrade) => jobGrade.jobGradeName === name
    );

    if (created) {
      setValue("contactJobGradeId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setPendingJobGradeName(name);
  };

  const onCompanyCreated = async (companyName: string) => {
    const updated = await companyOptionsQuery.refetch();
    const created = updated.data?.items.find(
      (company) => company.companyName === companyName
    );

    if (created) {
      setValue("companyId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("companySearch", created.companyName, { shouldDirty: true });
    }
  };

  const deleteDepartment = async (department: ContactDepartment) => {
    await deleteDepartmentMutation.mutateAsync(department.id);

    if (departmentId === department.id) {
      setValue("contactDepartmentId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const deleteJobGrade = async (jobGrade: ContactJobGrade) => {
    await deleteJobGradeMutation.mutateAsync(jobGrade.id);

    if (jobGradeId === jobGrade.id) {
      setValue("contactJobGradeId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  return (
    <>
    <ModalShell
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createContactMutation.isPending}
          onCancel={() => onOpenChange(false)}
          onSubmit={() => void onSubmit()}
        />
      }
      open={open}
      size="md"
      title="담당자 추가"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection title="담당자 기본 정보">
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
          <ContactCompanyField
            companyId={companyId}
            error={errors.companyId?.message}
            id="contact-company"
            label="회사"
            onCreate={(companyName) => {
              setCompanyCreateName(companyName);
              setIsCompanyCreateOpen(true);
            }}
            onCompanyIdChange={(value) =>
              setValue("companyId", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            onSearchChange={(value) =>
              setValue("companySearch", value, { shouldDirty: true })
            }
            search={companySearch}
          />

          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.contactDepartmentId?.message}
              id="contact-department-id"
              label="부서"
            >
              <input type="hidden" {...register("contactDepartmentId")} />
              <ManagedTaxonomyDropdown
                addPlaceholder="부서명"
                createActionLabel="새 부서 생성"
                emptyText="부서가 없습니다"
                getLabel={(department) => department.departmentName}
                id="contact-department-id"
                isCreating={createDepartmentMutation.isPending}
                isDeleting={deleteDepartmentMutation.isPending}
                items={departments}
                listClassName="max-h-[88px]"
                placeholder="부서 검색"
                selectedId={departmentId}
                title="부서"
                onCreate={createDepartment}
                onDelete={deleteDepartment}
                onSelect={(id) =>
                  setValue("contactDepartmentId", id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.contactJobGradeId?.message}
              id="contact-job-grade-id"
              label="직급"
            >
              <input type="hidden" {...register("contactJobGradeId")} />
              <ManagedTaxonomyDropdown
                addPlaceholder="직급명"
                createActionLabel="새 직급 생성"
                emptyText="직급이 없습니다"
                getLabel={(jobGrade) => jobGrade.jobGradeName}
                id="contact-job-grade-id"
                isCreating={createJobGradeMutation.isPending}
                isDeleting={deleteJobGradeMutation.isPending}
                items={jobGrades}
                listClassName="max-h-[88px]"
                placeholder="직급 검색"
                selectedId={jobGradeId}
                title="직급"
                onCreate={createJobGrade}
                onDelete={deleteJobGrade}
                onSelect={(id) =>
                  setValue("contactJobGradeId", id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection title="메모(옵션)">
          <ModalFieldGroup id="contact-memo">
            <textarea
              aria-label="메모"
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
    </ModalShell>
    <CompanyCreateDialog
      fields={companyFields}
      initialCompanyName={companyCreateName}
      onCreated={(companyName) => void onCompanyCreated(companyName)}
      onOpenChange={setIsCompanyCreateOpen}
      open={isCompanyCreateOpen}
      regions={companyRegions}
    />
    </>
  );
}
