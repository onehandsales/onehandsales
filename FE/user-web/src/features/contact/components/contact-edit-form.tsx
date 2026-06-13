import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ContactCompanyField } from "@/features/contact/components/contact-company-field";
import { useContactDepartments, useContactJobGrades } from "@/features/contact/hooks/use-contact-list";
import {
  useCreateDepartmentMutation,
  useCreateJobGradeMutation,
  useUpdateContactMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import {
  contactEditFormSchema,
  toContactEditFormValues,
  toUpdateContactInput,
  type ContactEditFormValues,
} from "@/features/contact/schemas/contact-schema";
import type { ContactDetail } from "@/features/contact/types/contact";
import { ApiClientError, getApiErrorMessage } from "@/lib/api-client";

type ContactEditFormProps = {
  readonly contact: ContactDetail;
  readonly onSaved: () => void;
};

// 기능 : 거래처 기본 정보 수정 폼을 렌더링합니다.
export function ContactEditForm({ contact, onSaved }: ContactEditFormProps) {
  const updateContactMutation = useUpdateContactMutation();
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
  } = useForm<ContactEditFormValues>({
    resolver: zodResolver(contactEditFormSchema),
    defaultValues: toContactEditFormValues(contact),
  });
  const companyId = watch("companyId") ?? "";
  const companySearch = watch("companySearch") ?? "";

  useEffect(() => {
    reset(toContactEditFormValues(contact));
  }, [contact, reset]);

  // 기능 : 거래처 기본 정보를 수정합니다.
  const onSubmit = handleSubmit(async (values) => {
    await updateContactMutation.mutateAsync(
      toUpdateContactInput(contact.id, values)
    );
    onSaved();
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
    <form className="grid gap-4" onSubmit={(e) => void onSubmit(e)}>
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
        onCompanyIdChange={(value) =>
          setValue("companyId", value, { shouldDirty: true })
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
          <label className="text-sm font-medium" htmlFor="contact-detail-department">
            부서
          </label>
          <select
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="contact-detail-department"
            {...register("contactDepartmentId")}
          >
            <option value="">부서 선택</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.departmentName}
              </option>
            ))}
          </select>
          {errors.contactDepartmentId ? (
            <p className="text-xs text-destructive">
              {errors.contactDepartmentId.message}
            </p>
          ) : null}
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
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="contact-detail-job-grade">
            직급
          </label>
          <select
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="contact-detail-job-grade"
            {...register("contactJobGradeId")}
          >
            <option value="">직급 선택</option>
            {jobGrades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.jobGradeName}
              </option>
            ))}
          </select>
          {errors.contactJobGradeId ? (
            <p className="text-xs text-destructive">
              {errors.contactJobGradeId.message}
            </p>
          ) : null}
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
        </div>
      </div>

      {taxonomyError ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {taxonomyError}
        </p>
      ) : null}

      {updateContactMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(updateContactMutation.error)}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button
          disabled={updateContactMutation.isPending}
          isPending={updateContactMutation.isPending}
          type="submit"
          variant="primary"
        >
          <Save className="h-4 w-4" />
          저장
        </Button>
      </div>
    </form>
  );
}

type TextInputProps = {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly register: UseFormRegisterReturn;
};

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
