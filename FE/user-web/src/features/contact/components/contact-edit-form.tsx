import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { ManagedTaxonomyDropdown } from "@/components/ui/managed-taxonomy-dropdown";
import { CompanyCreateDialog } from "@/features/company/components/company-create-dialog";
import {
  useCompanyFields,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import { ContactCompanyField } from "@/features/contact/components/contact-company-field";
import { useCompanyOptions } from "@/features/contact/hooks/use-company-options";
import {
  useContactDepartments,
  useContactJobGrades,
} from "@/features/contact/hooks/use-contact-list";
import {
  useCreateDepartmentMutation,
  useCreateJobGradeMutation,
  useDeleteDepartmentMutation,
  useDeleteJobGradeMutation,
  useUpdateContactMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import {
  contactEditFormSchema,
  toContactEditFormValues,
  toUpdateContactInput,
  type ContactEditFormValues,
} from "@/features/contact/schemas/contact-schema";
import type {
  ContactDepartment,
  ContactDetail,
  ContactJobGrade,
} from "@/features/contact/types/contact";
import { getApiErrorMessage } from "@/lib/api-client";

type ContactEditFormProps = {
  readonly contact: ContactDetail;
  readonly formId?: string;
  readonly onPendingChange?: (isPending: boolean) => void;
  readonly onSaved: () => void;
};

// 기능 : 담당자 기본 정보 수정 폼을 렌더링합니다.
export function ContactEditForm({
  contact,
  formId,
  onPendingChange,
  onSaved,
}: ContactEditFormProps) {
  const updateContactMutation = useUpdateContactMutation();
  const companyOptionsQuery = useCompanyOptions();
  const companyFieldsQuery = useCompanyFields();
  const companyRegionsQuery = useCompanyRegions();
  const jobGradesQuery = useContactJobGrades();
  const departmentsQuery = useContactDepartments();
  const createJobGradeMutation = useCreateJobGradeMutation();
  const createDepartmentMutation = useCreateDepartmentMutation();
  const deleteJobGradeMutation = useDeleteJobGradeMutation();
  const deleteDepartmentMutation = useDeleteDepartmentMutation();
  const [pendingJobGradeName, setPendingJobGradeName] = useState("");
  const [pendingDepartmentName, setPendingDepartmentName] = useState("");
  const [isCompanyCreateOpen, setIsCompanyCreateOpen] = useState(false);
  const [companyCreateName, setCompanyCreateName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactEditFormValues>({
    resolver: zodResolver(contactEditFormSchema),
    defaultValues: toContactEditFormValues(contact),
  });
  const companyId = watch("companyId") ?? "";
  const companySearch = watch("companySearch") ?? "";
  const departmentId = watch("contactDepartmentId") ?? "";
  const jobGradeId = watch("contactJobGradeId") ?? "";
  const companyFields = useMemo(
    () => companyFieldsQuery.data?.items ?? [],
    [companyFieldsQuery.data]
  );
  const companyRegions = useMemo(
    () => companyRegionsQuery.data?.items ?? [],
    [companyRegionsQuery.data]
  );
  const jobGrades = useMemo(
    () => jobGradesQuery.data?.items ?? [],
    [jobGradesQuery.data]
  );
  const departments = useMemo(
    () => departmentsQuery.data?.items ?? [],
    [departmentsQuery.data]
  );

  useEffect(() => {
    reset(toContactEditFormValues(contact));
    setPendingDepartmentName("");
    setPendingJobGradeName("");
    setIsCompanyCreateOpen(false);
    setCompanyCreateName("");
  }, [contact, reset]);

  useEffect(() => {
    onPendingChange?.(updateContactMutation.isPending);
  }, [onPendingChange, updateContactMutation.isPending]);

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
      setValue("contactDepartmentId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [departments, departmentId, setValue]);

  useEffect(() => {
    if (jobGradeId && !jobGrades.some((grade) => grade.id === jobGradeId)) {
      setValue("contactJobGradeId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [jobGradeId, jobGrades, setValue]);

  // 기능 : 담당자 기본 정보를 수정합니다.
  const onSubmit = handleSubmit(async (values) => {
    await updateContactMutation.mutateAsync(
      toUpdateContactInput(contact.id, values)
    );
    onSaved();
  });

  // 기능 : 새 회사 생성 후 담당자 회사 선택값으로 반영합니다.
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

  // 기능 : 새 부서를 생성하고 생성된 항목을 선택합니다.
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

  // 기능 : 새 직급을 생성하고 생성된 항목을 선택합니다.
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

  // 기능 : 부서를 삭제하고 선택 중인 항목이면 선택값을 비웁니다.
  const deleteDepartment = async (department: ContactDepartment) => {
    await deleteDepartmentMutation.mutateAsync(department.id);

    if (departmentId === department.id) {
      setValue("contactDepartmentId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  // 기능 : 직급을 삭제하고 선택 중인 항목이면 선택값을 비웁니다.
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
      <form
        className="grid gap-3"
        id={formId}
        onSubmit={(event) => void onSubmit(event)}
      >
        <TextInput
          error={errors.username?.message}
          id="contact-detail-username"
          label="이름"
          register={register("username")}
        />

        <ContactCompanyField
          companyId={companyId}
          error={errors.companyId?.message}
          id="contact-detail-company"
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

        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            error={errors.mobile?.message}
            id="contact-detail-mobile"
            label="휴대폰번호"
            register={register("mobile")}
          />
          <TextInput
            error={errors.email?.message}
            id="contact-detail-email"
            label="이메일"
            register={register("email")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label
              className="text-sm font-medium"
              htmlFor="contact-detail-department"
            >
              부서
            </label>
            <input type="hidden" {...register("contactDepartmentId")} />
            <ManagedTaxonomyDropdown
              addPlaceholder="부서명"
              createActionLabel="새 부서 생성"
                  emptyText="부서를 추가하면 선택할 수 있어요"
              getLabel={(department) => department.departmentName}
              id="contact-detail-department"
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
            {errors.contactDepartmentId ? (
              <p className="text-xs text-destructive">
                {errors.contactDepartmentId.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-medium"
              htmlFor="contact-detail-job-grade"
            >
              직급
            </label>
            <input type="hidden" {...register("contactJobGradeId")} />
            <ManagedTaxonomyDropdown
              addPlaceholder="직급명"
              createActionLabel="새 직급 생성"
                  emptyText="직급을 추가하면 선택할 수 있어요"
              getLabel={(jobGrade) => jobGrade.jobGradeName}
              id="contact-detail-job-grade"
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
            {errors.contactJobGradeId ? (
              <p className="text-xs text-destructive">
                {errors.contactJobGradeId.message}
              </p>
            ) : null}
          </div>
        </div>

        {updateContactMutation.error ? (
          <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {getApiErrorMessage(updateContactMutation.error)}
          </p>
        ) : null}

      </form>
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

type TextInputProps = {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly register: UseFormRegisterReturn;
};

// 기능 : 담당자 수정 form의 텍스트 입력 필드를 렌더링합니다.
function TextInput({ id, label, error, register }: TextInputProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        id={id}
        {...register}
      />
      {error ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
