import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  ChevronsRight,
  IdCard,
  Loader2,
  Mail,
  Maximize2,
  Phone,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { ManagedTaxonomyDropdown } from "@/components/ui/managed-taxonomy-dropdown";
import { ErrorState } from "@/components/ui/state";
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
  useCreateContactMutation,
  useCreateDepartmentMutation,
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
  readonly initialValues?: Partial<ContactCreateFormValues>;
  readonly mode?: "docked" | "overlay" | "page";
  readonly width?: number;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: () => void;
  readonly onExpand?: (values: ContactCreateFormValues) => void;
  readonly onResizeStart?: () => void;
};

// 기능 : 담당자 생성 패널을 렌더링합니다.
export function ContactCreateDialog({
  open,
  initialValues,
  mode = "overlay",
  width,
  onOpenChange,
  onCreated,
  onExpand,
  onResizeStart,
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
  const memoTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
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
  const contactMemo = watch("contactMemo") ?? "";
  const memoRegister = register("contactMemo");
  const formId = "contact-create-form";
  const companyFields = useMemo(
    () => companyFieldsQuery.data?.items ?? [],
    [companyFieldsQuery.data],
  );
  const companyRegions = useMemo(
    () => companyRegionsQuery.data?.items ?? [],
    [companyRegionsQuery.data],
  );
  const jobGrades = useMemo(
    () => jobGradesQuery.data?.items ?? [],
    [jobGradesQuery.data],
  );
  const departments = useMemo(
    () => departmentsQuery.data?.items ?? [],
    [departmentsQuery.data],
  );

  useEffect(() => {
    if (open) {
      reset({
        ...emptyContactCreateFormValues,
        ...initialValues,
        username: initialValues?.username ?? "",
        mobile: initialValues?.mobile ?? "",
        email: initialValues?.email ?? "",
        companyId: initialValues?.companyId ?? "",
        companySearch: initialValues?.companySearch ?? "",
        contactDepartmentId: initialValues?.contactDepartmentId ?? "",
        contactJobGradeId: initialValues?.contactJobGradeId ?? "",
        contactMemo: initialValues?.contactMemo ?? "",
      });
      setPendingDepartmentName("");
      setPendingJobGradeName("");
      setIsCompanyCreateOpen(false);
      setCompanyCreateName("");
    }
  }, [initialValues, open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !createContactMutation.isPending &&
        !isCompanyCreateOpen
      ) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    createContactMutation.isPending,
    isCompanyCreateOpen,
    onOpenChange,
    open,
  ]);

  useEffect(() => {
    resizeMemoTextarea(memoTextareaRef.current);
  }, [open, initialValues]);

  useEffect(() => {
    if (!pendingDepartmentName) {
      return;
    }

    const matchedDepartment = departments.find(
      (department) => department.departmentName === pendingDepartmentName,
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
      (jobGrade) => jobGrade.jobGradeName === pendingJobGradeName,
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
    if (
      !departmentsQuery.isLoading &&
      departmentId &&
      !departments.some((dept) => dept.id === departmentId)
    ) {
      setValue("contactDepartmentId", "", { shouldDirty: true });
    }
  }, [departmentId, departments, departmentsQuery.isLoading, setValue]);

  useEffect(() => {
    if (
      !jobGradesQuery.isLoading &&
      jobGradeId &&
      !jobGrades.some((grade) => grade.id === jobGradeId)
    ) {
      setValue("contactJobGradeId", "", { shouldDirty: true });
    }
  }, [jobGradeId, jobGrades, jobGradesQuery.isLoading, setValue]);

  // 기능 : 담당자를 생성하고 패널을 닫습니다.
  const onSubmit = handleSubmit(async (values) => {
    await createContactMutation.mutateAsync(toCreateContactInput(values));
    onCreated();
    onOpenChange(false);
  });

  const createDepartment = async (name: string) => {
    await createDepartmentMutation.mutateAsync({ departmentName: name });
    const updated = await departmentsQuery.refetch();
    const created = updated.data?.items.find(
      (department) => department.departmentName === name,
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
      (jobGrade) => jobGrade.jobGradeName === name,
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
      (company) => company.companyName === companyName,
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

  const focusMemoTextarea = () => {
    memoTextareaRef.current?.focus();
  };

  const isDocked = mode === "docked";
  const isPage = mode === "page";
  const CloseIcon = isPage ? ArrowLeft : ChevronsRight;

  if (!open && !isDocked) {
    return null;
  }

  const nestedCompanyCreateDialog = (
    <CompanyCreateDialog
      fields={companyFields}
      initialCompanyName={companyCreateName}
      isFieldsLoading={companyFieldsQuery.isLoading}
      isRegionsLoading={companyRegionsQuery.isLoading}
      onCreated={(companyName) => void onCompanyCreated(companyName)}
      onOpenChange={setIsCompanyCreateOpen}
      open={isCompanyCreateOpen}
      regions={companyRegions}
    />
  );

  const panel = (
    <section
      aria-label="담당자 생성"
      aria-modal={isPage ? undefined : !isDocked}
      className={
        isPage
          ? "flex min-h-full flex-col bg-white"
          : isDocked
          ? `fixed inset-y-0 right-0 z-50 flex h-screen shrink-0 flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-[transform,opacity] duration-[500ms] ease-out will-change-transform ${
              open
                ? "contact-create-panel-enter pointer-events-auto translate-x-0 opacity-100"
                : "pointer-events-none translate-x-full opacity-0"
            }`
          : "pointer-events-auto relative flex h-full w-full flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] sm:max-w-[520px]"
      }
      role={isPage ? undefined : "dialog"}
      style={isDocked ? { width: width ?? 520 } : undefined}
    >
      {isDocked ? (
        <button
          aria-label="담당자 생성 패널 폭 조절"
          className="absolute -left-1 top-0 z-10 h-full w-2 cursor-col-resize transition hover:bg-[#EFF6FF] focus:bg-[#EFF6FF] focus:outline-none"
          onMouseDown={(event) => {
            event.preventDefault();
            onResizeStart?.();
          }}
          type="button"
        />
      ) : null}
      <header className="flex h-10 shrink-0 items-center px-1.5">
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            aria-label={isPage ? "담당자 목록으로 이동" : "담당자 생성 패널 접기"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={createContactMutation.isPending}
            onClick={() => onOpenChange(false)}
            title={isPage ? "담당자 목록으로 이동" : "담당자 생성 패널 접기"}
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          {onExpand && !isPage ? (
            <button
              aria-label="전체 생성 페이지로 열기"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createContactMutation.isPending}
              onClick={() => onExpand(getValues())}
              title="전체 생성 페이지로 열기"
              type="button"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </header>

      <form
        className="flex min-h-0 flex-1 flex-col"
        id={formId}
        onSubmit={(event) => void onSubmit(event)}
      >
        <div
          className="min-h-0 flex-1 cursor-text overflow-y-auto px-5 py-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              focusMemoTextarea();
            }
          }}
        >
          <div
            className={
              isPage
                ? "mx-auto grid min-h-full w-full max-w-[920px] cursor-text content-start gap-4"
                : "grid min-h-full cursor-text content-start gap-4"
            }
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                focusMemoTextarea();
              }
            }}
          >
            <section className="grid cursor-auto gap-2">
              <label
                className="text-[16px] font-semibold text-[#94A3B8]"
                htmlFor="contact-username"
              >
                담당자명
              </label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#CBD5E1]" />
                <input
                  aria-describedby={
                    errors.username ? "contact-username-error" : undefined
                  }
                  aria-invalid={Boolean(errors.username)}
                  className="h-14 w-full border-0 bg-transparent pl-8 pr-1 text-[32px] font-semibold leading-none text-[#111827] outline-none placeholder:text-[#CBD5E1] placeholder:opacity-100"
                  id="contact-username"
                  placeholder="담당자명을 넣어주세요."
                  {...register("username")}
                />
              </div>
              {errors.username ? (
                <p
                  className="text-[12px] text-red-500"
                  id="contact-username-error"
                >
                  {errors.username.message}
                </p>
              ) : null}
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <ContactCreatePanelProperty
                error={errors.mobile?.message}
                errorId="contact-mobile-error"
                label="휴대폰번호"
              >
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    aria-label="휴대폰번호"
                    aria-describedby={
                      errors.mobile ? "contact-mobile-error" : undefined
                    }
                    aria-invalid={Boolean(errors.mobile)}
                    className="h-10 w-full rounded-md border border-[#E6EAF0] pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                    id="contact-mobile"
                    placeholder="010-0000-0000"
                    {...register("mobile")}
                  />
                </div>
              </ContactCreatePanelProperty>

              <ContactCreatePanelProperty
                error={errors.email?.message}
                errorId="contact-email-error"
                label="이메일"
              >
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    aria-label="이메일"
                    aria-describedby={
                      errors.email ? "contact-email-error" : undefined
                    }
                    aria-invalid={Boolean(errors.email)}
                    className="h-10 w-full rounded-md border border-[#E6EAF0] pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                    id="contact-email"
                    {...register("email")}
                  />
                </div>
              </ContactCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <ContactCreatePanelProperty
                error={errors.companyId?.message}
                label="회사"
              >
                <ContactCompanyField
                  companyId={companyId}
                  error={errors.companyId?.message}
                  hideError
                  hideLabel
                  id="contact-company"
                  inputClassName="border-[#E6EAF0] text-[13px] focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
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
              </ContactCreatePanelProperty>

              <ContactCreatePanelProperty
                error={errors.contactDepartmentId?.message}
                label="부서"
              >
                <input type="hidden" {...register("contactDepartmentId")} />
                <ManagedTaxonomyDropdown
                  addPlaceholder="부서명"
                  createActionLabel="새 부서 생성"
                  emptyText="부서를 추가하면 선택할 수 있어요"
                  getLabel={(department) => department.departmentName}
                  id="contact-department-id"
                  isCreating={createDepartmentMutation.isPending}
                  isDeleting={deleteDepartmentMutation.isPending}
                  items={departments}
                  listClassName="max-h-[132px]"
                  placeholder="부서 선택"
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
              </ContactCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <ContactCreatePanelProperty
                error={errors.contactJobGradeId?.message}
                label="직급"
              >
                <input type="hidden" {...register("contactJobGradeId")} />
                <ManagedTaxonomyDropdown
                  addPlaceholder="직급명"
                  createActionLabel="새 직급 생성"
                  emptyText="직급을 추가하면 선택할 수 있어요"
                  getLabel={(jobGrade) => jobGrade.jobGradeName}
                  id="contact-job-grade-id"
                  isCreating={createJobGradeMutation.isPending}
                  isDeleting={deleteJobGradeMutation.isPending}
                  items={jobGrades}
                  listClassName="max-h-[132px]"
                  placeholder="직급 선택"
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
              </ContactCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-2">
              <label
                className="text-[16px] font-semibold text-[#94A3B8]"
                htmlFor="contact-memo"
              >
                메모
              </label>
              <div className="relative min-h-8">
                <textarea
                  aria-label="메모"
                  className="min-h-0 w-full resize-none overflow-hidden border-0 bg-white px-0 py-1 text-[14px] leading-6 text-[#111827] outline-none"
                  id="contact-memo"
                  {...memoRegister}
                  onChange={(event) => {
                    memoRegister.onChange(event);
                    resizeMemoTextarea(event.currentTarget);
                  }}
                  ref={(element) => {
                    memoRegister.ref(element);
                    memoTextareaRef.current = element;
                  }}
                  rows={1}
                />
                {contactMemo.trim().length === 0 ? (
                  <span className="pointer-events-none absolute left-0 top-1 text-[14px] font-semibold leading-6 text-[#CBD5E1]">
                    번뜩이는 생각들을 기록하세요!
                  </span>
                ) : null}
              </div>
            </section>

            {createContactMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(createContactMutation.error)}
                title="담당자 저장 실패"
                variant="inline"
              />
            ) : null}
          </div>
        </div>

        <footer className="flex h-16 shrink-0 items-center px-5">
          <div
            className={
              isPage
                ? "mx-auto flex w-full max-w-[920px] justify-end gap-2"
                : "flex w-full justify-end gap-2"
            }
          >
            <button
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#475569] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createContactMutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
            >
              {isPage ? "목록으로" : "닫기"}
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#4880EE] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createContactMutation.isPending}
              type="submit"
            >
              {createContactMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {createContactMutation.isPending ? "저장 중" : "저장"}
            </button>
          </div>
        </footer>
      </form>
    </section>
  );

  if (isDocked || isPage) {
    return (
      <>
        {panel}
        {nestedCompanyCreateDialog}
      </>
    );
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex w-full justify-end">
        {panel}
      </div>
      {nestedCompanyCreateDialog}
    </>
  );
}

function resizeMemoTextarea(element: HTMLTextAreaElement | null) {
  if (!element) {
    return;
  }

  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

type ContactCreatePanelPropertyProps = {
  readonly children: ReactNode;
  readonly error?: string;
  readonly errorId?: string;
  readonly label: string;
};

function ContactCreatePanelProperty({
  children,
  error,
  errorId,
  label,
}: ContactCreatePanelPropertyProps) {
  return (
    <div className="grid min-w-0 gap-2">
      <div className="text-[16px] font-semibold text-[#94A3B8]">{label}</div>
      <div className="min-w-0">
        {children}
        {error ? (
          <p
            className="mt-1 truncate text-[12px] leading-4 text-red-500"
            id={errorId}
            title={error}
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
