// 기능 : 딜 빠른 등록 모달 — Backend Deal API 생성 계약 기준
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  ChevronDown,
  HandCoins,
  IdCard,
  Package,
  Plus,
  type LucideIcon,
  X,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
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
import { useCompanyFields, useCompanyRegions } from "@/features/company/hooks/use-company-list";
import { useCreateCompanyMutation } from "@/features/company/hooks/use-company-mutations";
import {
  companyCreateFormSchema,
  emptyCompanyCreateFormValues,
  toCreateCompanyInput,
  type CompanyCreateFormValues,
} from "@/features/company/schemas/company-schema";
import { useContactDepartments, useContactJobGrades } from "@/features/contact/hooks/use-contact-list";
import { useCreateContactMutation } from "@/features/contact/hooks/use-contact-mutations";
import {
  contactCreateFormSchema,
  emptyContactCreateFormValues,
  toCreateContactInput,
  type ContactCreateFormValues,
} from "@/features/contact/schemas/contact-schema";
import {
  useDealCompanyOptions,
  useDealContactOptions,
  useDealProductOptions,
} from "@/features/deal/hooks/use-deal-entity-options";
import { useCreateDealMutation } from "@/features/deal/hooks/use-deal-mutations";
import {
  dealCreateFormSchema,
  emptyDealCreateFormValues,
  toCreateDealInput,
  type DealCreateFormValues,
} from "@/features/deal/schemas/deal-schema";
import {
  DEAL_STATUS_LABEL,
  DEAL_STATUS_LIST,
  type DealCompanyOption,
  type DealContactOption,
  type DealDetail,
  type DealProductOption,
} from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type DealCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (deal: DealDetail) => void;
};

export function DealCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: DealCreateDialogProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isCompanyCreateOpen, setIsCompanyCreateOpen] = useState(false);
  const [isContactCreateOpen, setIsContactCreateOpen] = useState(false);
  const createDealMutation = useCreateDealMutation();
  const companyOptionsQuery = useDealCompanyOptions();
  const contactOptionsQuery = useDealContactOptions();
  const productOptionsQuery = useDealProductOptions();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealCreateFormValues>({
    resolver: zodResolver(dealCreateFormSchema),
    defaultValues: emptyDealCreateFormValues,
  });

  const selectedCompanyId = watch("companyId");
  const selectedContactId = watch("contactId");
  const dealCostValue = watch("dealCost");
  const expectedEndDateValue = watch("expectedEndDate");
  const companySearch = watch("companySearch") ?? "";
  const contactSearch = watch("contactSearch") ?? "";
  const productSearch = watch("productSearch") ?? "";

  useEffect(() => {
    if (open) {
      reset(emptyDealCreateFormValues);
      setSelectedProductIds([]);
      setIsCompanyCreateOpen(false);
      setIsContactCreateOpen(false);
    }
  }, [open, reset]);

  if (!open) return null;

  const formId = "deal-create-form";

  const onProductToggle = (productId: string) => {
    const next = selectedProductIds.includes(productId)
      ? selectedProductIds.filter((id) => id !== productId)
      : [...selectedProductIds, productId];

    setSelectedProductIds(next);
    setValue("productIds", next, { shouldValidate: true });
  };

  // 기능 : 금액 입력 표시에는 콤마를 넣고 form 값은 숫자 문자열로 유지합니다.
  const onDealCostChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue("dealCost", normalizeCurrencyInput(event.target.value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // 기능 : 20260410처럼 숫자만 입력해도 YYYY-MM-DD form 값으로 변환합니다.
  const onExpectedEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue("expectedEndDate", normalizeDateInput(event.target.value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // 기능 : 빠른 등록한 회사를 Deal 선택 옵션에서 찾아 자동 선택합니다.
  const onCompanyCreated = async (companyName: string) => {
    const updated = await companyOptionsQuery.refetch();
    const created = findCompanyOptionByName(updated.data ?? [], companyName);

    if (created) {
      setValue("companyId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("companySearch", created.companyName, {
        shouldDirty: true,
      });
      setValue("contactId", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("contactSearch", "", {
        shouldDirty: true,
      });
    }
  };

  // 기능 : 빠른 등록한 거래처를 Deal 선택 옵션에서 찾아 자동 선택합니다.
  const onContactCreated = async (payload: QuickContactCreatedPayload) => {
    setValue("companyId", payload.companyId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    const company = companyOptionsQuery.data?.find((option) => option.id === payload.companyId);

    if (company) {
      setValue("companySearch", company.companyName, {
        shouldDirty: true,
      });
    }

    const updated = await contactOptionsQuery.refetch();
    const created = findContactOptionByName(updated.data ?? [], payload.username);

    if (created) {
      setValue("contactId", created.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("contactSearch", created.label, {
        shouldDirty: true,
      });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const deal = await createDealMutation.mutateAsync(toCreateDealInput(values));
    onCreated(deal);
    onOpenChange(false);
  });

  const companyOptions = companyOptionsQuery.data ?? [];
  // 모든 거래처를 표시하고 최종 연결 검증은 BE 계약을 따릅니다.
  const contactOptions = contactOptionsQuery.data ?? [];
  const productOptions = productOptionsQuery.data ?? [];
  const selectedCompany = companyOptions.find((company) => company.id === selectedCompanyId);
  const selectedContact = contactOptions.find((contact) => contact.id === selectedContactId);

  return (
    <>
      <ModalShell
        description="딜명, 금액, 회사/거래처/제품과 다음 행동을 저장합니다."
        footer={
          <ModalFooterActions
            formId={formId}
            isSubmitting={createDealMutation.isPending}
            onCancel={() => onOpenChange(false)}
          />
        }
        open={open}
        size="lg"
        title="딜 빠른 등록"
        onOpenChange={onOpenChange}
      >
        <ModalForm id={formId} onSubmit={onSubmit}>
          {/* 딜 기본 정보 */}
          <ModalFormSection description="딜의 이름과 예상 금액을 입력합니다." title="딜 기본 정보">
            <ModalFormRow columns={2}>
              <ModalFieldGroup error={errors.dealName?.message} id="deal-name" label="딜명">
                <input
                  aria-invalid={Boolean(errors.dealName)}
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-name"
                  {...register("dealName")}
                />
              </ModalFieldGroup>

              <ModalFieldGroup error={errors.dealCost?.message} id="deal-cost" label="금액">
                <div className="relative">
                  <input type="hidden" {...register("dealCost")} />
                  <HandCoins className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    aria-invalid={Boolean(errors.dealCost)}
                    className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                    id="deal-cost"
                    inputMode="numeric"
                    onChange={onDealCostChange}
                    placeholder="예: 1,000,000"
                    value={formatCurrencyInput(dealCostValue ?? "")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    원
                  </span>
                </div>
              </ModalFieldGroup>
            </ModalFormRow>
          </ModalFormSection>

          {/* 연결 대상 */}
          <ModalFormSection description="회사, 거래처, 제품을 선택합니다." title="연결 대상">
            <ModalFormRow columns={2}>
              {/* 회사 */}
              <ModalFieldGroup error={errors.companyId?.message} id="deal-company" label="회사">
                <div className="flex gap-2">
                  <input type="hidden" {...register("companyId")} />
                  <SearchSelectField
                    emptyText="검색된 회사가 없습니다."
                    getLabel={(company) => company.companyName}
                    icon={Building2}
                    id="deal-company"
                    isLoading={companyOptionsQuery.isLoading}
                    items={companyOptions}
                    placeholder="회사명 검색"
                    search={companySearch}
                    selectedId={selectedCompanyId}
                    selectedLabel={selectedCompany?.companyName ?? ""}
                    onClear={() => {
                      setValue("companyId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("companySearch", "", { shouldDirty: true });
                      setValue("contactId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("contactSearch", "", { shouldDirty: true });
                    }}
                    onSearchChange={(value) => {
                      setValue("companySearch", value, { shouldDirty: true });
                      if (selectedCompanyId) {
                        setValue("companyId", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setValue("contactId", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setValue("contactSearch", "", { shouldDirty: true });
                      }
                    }}
                    onSelect={(company) => {
                      setValue("companyId", company.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("companySearch", company.companyName, {
                        shouldDirty: true,
                      });
                      setValue("contactId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("contactSearch", "", { shouldDirty: true });
                    }}
                  />
                  <button
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border bg-white px-3 text-xs font-medium hover:bg-muted"
                    onClick={() => setIsCompanyCreateOpen(true)}
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    등록
                  </button>
                </div>
              </ModalFieldGroup>

              {/* 거래처 */}
              <ModalFieldGroup error={errors.contactId?.message} id="deal-contact" label="거래처">
                <div className="flex gap-2">
                  <input type="hidden" {...register("contactId")} />
                  <SearchSelectField
                    emptyText="검색된 거래처가 없습니다."
                    getDescription={(contact) => contact.contactDepartment.departmentName}
                    getLabel={(contact) => contact.label}
                    icon={IdCard}
                    id="deal-contact"
                    isLoading={contactOptionsQuery.isLoading}
                    items={contactOptions}
                    placeholder="거래처명 검색"
                    search={contactSearch}
                    selectedId={selectedContactId}
                    selectedLabel={selectedContact?.label ?? ""}
                    onClear={() => {
                      setValue("contactId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("contactSearch", "", { shouldDirty: true });
                    }}
                    onSearchChange={(value) => {
                      setValue("contactSearch", value, { shouldDirty: true });
                      if (selectedContactId) {
                        setValue("contactId", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    onSelect={(contact) => {
                      setValue("contactId", contact.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("contactSearch", contact.label, {
                        shouldDirty: true,
                      });
                    }}
                  />
                  <button
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border bg-white px-3 text-xs font-medium hover:bg-muted"
                    onClick={() => setIsContactCreateOpen(true)}
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    등록
                  </button>
                </div>
              </ModalFieldGroup>
            </ModalFormRow>

            {/* 제품 다중 선택 */}
            <ModalFieldGroup error={errors.productIds?.message} id="deal-products" label="제품 (1개 이상)">
              <ProductMultiSelectDropdown
                id="deal-products"
                isLoading={productOptionsQuery.isLoading}
                items={productOptions}
                search={productSearch}
                selectedIds={selectedProductIds}
                onSearchChange={(value) => {
                  setValue("productSearch", value, { shouldDirty: true });
                }}
                onToggle={onProductToggle}
              />
            </ModalFieldGroup>
          </ModalFormSection>

          {/* 진행 상태 */}
          <ModalFormSection description="딜 단계와 예상 마감일, 다음 행동을 지정합니다." title="진행 상태">
            <ModalFormRow columns={2}>
              <ModalFieldGroup error={errors.dealStatus?.message} id="deal-status" label="딜 단계">
                <select
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-status"
                  {...register("dealStatus")}
                >
                  {DEAL_STATUS_LIST.map((status) => (
                    <option key={status} value={status}>
                      {DEAL_STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </ModalFieldGroup>

              <ModalFieldGroup error={errors.expectedEndDate?.message} id="deal-end-date" label="예상 마감일">
                <div className="relative">
                  <input type="hidden" {...register("expectedEndDate")} />
                  <input
                    aria-invalid={Boolean(errors.expectedEndDate)}
                    className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    id="deal-end-date"
                    inputMode="numeric"
                    onChange={onExpectedEndDateChange}
                    placeholder="예: 20260410"
                    value={expectedEndDateValue ?? ""}
                  />
                </div>
              </ModalFieldGroup>
            </ModalFormRow>

            <ModalFieldGroup error={errors.followingAction?.message} id="deal-following" label="다음 행동">
              <input
                aria-invalid={Boolean(errors.followingAction)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-following"
                placeholder="예: 제안서 발송"
                {...register("followingAction")}
              />
            </ModalFieldGroup>
          </ModalFormSection>

          {createDealMutation.error ? (
            <ErrorState
              message={getApiErrorMessage(createDealMutation.error)}
              title="딜 저장 실패"
              variant="inline"
            />
          ) : null}
        </ModalForm>
      </ModalShell>

      <QuickCompanyCreateDialog
        open={isCompanyCreateOpen}
        onCreated={(companyName) => void onCompanyCreated(companyName)}
        onOpenChange={setIsCompanyCreateOpen}
      />
      <QuickContactCreateDialog
        companyOptions={companyOptions}
        defaultCompanyId={selectedCompanyId}
        open={isContactCreateOpen}
        onCreated={(payload) => void onContactCreated(payload)}
        onOpenChange={setIsContactCreateOpen}
      />
    </>
  );
}

type QuickCompanyCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (companyName: string) => void;
};

// 기능 : 딜 빠른 등록 중 새 회사를 최소 정보로 생성합니다.
function QuickCompanyCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: QuickCompanyCreateDialogProps) {
  const createCompanyMutation = useCreateCompanyMutation();
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyCreateFormValues>({
    resolver: zodResolver(companyCreateFormSchema),
    defaultValues: emptyCompanyCreateFormValues,
  });
  const formId = "deal-quick-company-create-form";

  useEffect(() => {
    if (open) {
      reset(emptyCompanyCreateFormValues);
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  const fields = fieldsQuery.data?.items ?? [];
  const regions = regionsQuery.data?.items ?? [];

  const onSubmit = handleSubmit(async (values) => {
    await createCompanyMutation.mutateAsync(toCreateCompanyInput(values));
    onCreated(values.companyName.trim());
    onOpenChange(false);
  });

  return (
    <ModalShell
      description="딜에 바로 연결할 회사를 저장합니다."
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createCompanyMutation.isPending}
          submitLabel="회사 저장"
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      size="sm"
      title="회사 빠른 등록"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection title="회사 기본 정보">
          <ModalFieldGroup error={errors.companyName?.message} id="deal-quick-company-name" label="회사명">
            <input
              aria-invalid={Boolean(errors.companyName)}
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="deal-quick-company-name"
              {...register("companyName")}
            />
          </ModalFieldGroup>

          <ModalFormRow columns={2}>
            <ModalFieldGroup error={errors.companyFieldId?.message} id="deal-quick-company-field" label="분야">
              <select
                aria-invalid={Boolean(errors.companyFieldId)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-company-field"
                {...register("companyFieldId")}
              >
                <option value="">분야 선택</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.field}
                  </option>
                ))}
              </select>
            </ModalFieldGroup>

            <ModalFieldGroup error={errors.companyRegionId?.message} id="deal-quick-company-region" label="지역">
              <select
                aria-invalid={Boolean(errors.companyRegionId)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-company-region"
                {...register("companyRegionId")}
              >
                <option value="">지역 선택</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.region}
                  </option>
                ))}
              </select>
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFieldGroup id="deal-quick-company-memo" label="첫 메모">
          <textarea
            className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="deal-quick-company-memo"
            {...register("companyMemo")}
          />
        </ModalFieldGroup>

        {createCompanyMutation.error ? (
          <ErrorState
            message={getApiErrorMessage(createCompanyMutation.error)}
            title="회사 저장 실패"
            variant="inline"
          />
        ) : null}
      </ModalForm>
    </ModalShell>
  );
}

type QuickContactCreatedPayload = {
  readonly username: string;
  readonly companyId: string;
};

type QuickContactCreateDialogProps = {
  readonly open: boolean;
  readonly defaultCompanyId: string;
  readonly companyOptions: DealCompanyOption[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (payload: QuickContactCreatedPayload) => void;
};

// 기능 : 딜 빠른 등록 중 새 거래처를 최소 정보로 생성합니다.
function QuickContactCreateDialog({
  open,
  defaultCompanyId,
  companyOptions,
  onOpenChange,
  onCreated,
}: QuickContactCreateDialogProps) {
  const createContactMutation = useCreateContactMutation();
  const departmentsQuery = useContactDepartments();
  const jobGradesQuery = useContactJobGrades();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactCreateFormValues>({
    resolver: zodResolver(contactCreateFormSchema),
    defaultValues: emptyContactCreateFormValues,
  });
  const formId = "deal-quick-contact-create-form";

  useEffect(() => {
    if (open) {
      reset({
        ...emptyContactCreateFormValues,
        companyId: defaultCompanyId,
      });
    }
  }, [defaultCompanyId, open, reset]);

  if (!open) {
    return null;
  }

  const departments = departmentsQuery.data?.items ?? [];
  const jobGrades = jobGradesQuery.data?.items ?? [];

  const onSubmit = handleSubmit(async (values) => {
    await createContactMutation.mutateAsync(toCreateContactInput(values));
    onCreated({
      username: values.username.trim(),
      companyId: values.companyId,
    });
    onOpenChange(false);
  });

  return (
    <ModalShell
      description="딜에 바로 연결할 담당자를 저장합니다."
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createContactMutation.isPending}
          submitLabel="거래처 저장"
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      size="md"
      title="거래처 빠른 등록"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection title="거래처 기본 정보">
          <ModalFormRow columns={2}>
            <ModalFieldGroup error={errors.username?.message} id="deal-quick-contact-name" label="이름">
              <input
                aria-invalid={Boolean(errors.username)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-contact-name"
                {...register("username")}
              />
            </ModalFieldGroup>

            <ModalFieldGroup error={errors.companyId?.message} id="deal-quick-contact-company" label="회사">
              <select
                aria-invalid={Boolean(errors.companyId)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-contact-company"
                {...register("companyId")}
              >
                <option value="">회사 선택</option>
                {companyOptions.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </ModalFieldGroup>
          </ModalFormRow>

          <ModalFormRow columns={2}>
            <ModalFieldGroup error={errors.mobile?.message} id="deal-quick-contact-mobile" label="휴대폰번호">
              <input
                aria-invalid={Boolean(errors.mobile)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-contact-mobile"
                placeholder="010-0000-0000"
                {...register("mobile")}
              />
            </ModalFieldGroup>

            <ModalFieldGroup error={errors.email?.message} id="deal-quick-contact-email" label="이메일">
              <input
                aria-invalid={Boolean(errors.email)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-contact-email"
                {...register("email")}
              />
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection title="소속 정보">
          <ModalFormRow columns={2}>
            <ModalFieldGroup error={errors.contactDepartmentId?.message} id="deal-quick-contact-department" label="부서">
              <select
                aria-invalid={Boolean(errors.contactDepartmentId)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-contact-department"
                {...register("contactDepartmentId")}
              >
                <option value="">부서 선택</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.departmentName}
                  </option>
                ))}
              </select>
            </ModalFieldGroup>

            <ModalFieldGroup error={errors.contactJobGradeId?.message} id="deal-quick-contact-job-grade" label="직급">
              <select
                aria-invalid={Boolean(errors.contactJobGradeId)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-contact-job-grade"
                {...register("contactJobGradeId")}
              >
                <option value="">직급 선택</option>
                {jobGrades.map((jobGrade) => (
                  <option key={jobGrade.id} value={jobGrade.id}>
                    {jobGrade.jobGradeName}
                  </option>
                ))}
              </select>
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFieldGroup id="deal-quick-contact-memo" label="첫 메모">
          <textarea
            className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="deal-quick-contact-memo"
            {...register("contactMemo")}
          />
        </ModalFieldGroup>

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

type ProductMultiSelectDropdownProps = {
  readonly id: string;
  readonly items: DealProductOption[];
  readonly search: string;
  readonly selectedIds: string[];
  readonly isLoading: boolean;
  readonly onSearchChange: (search: string) => void;
  readonly onToggle: (productId: string) => void;
};

type SearchSelectFieldProps<TItem extends { readonly id: string }> = {
  readonly id: string;
  readonly items: readonly TItem[];
  readonly search: string;
  readonly selectedId: string;
  readonly selectedLabel: string;
  readonly isLoading: boolean;
  readonly icon: LucideIcon;
  readonly placeholder: string;
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly getDescription?: (item: TItem) => string;
  readonly onSearchChange: (search: string) => void;
  readonly onSelect: (item: TItem) => void;
  readonly onClear: () => void;
};

// 기능 : 빈 입력에 검색어를 입력하면 일치하는 옵션을 아래에 표시하고 클릭 선택합니다.
function SearchSelectField<TItem extends { readonly id: string }>({
  id,
  items,
  search,
  selectedId,
  selectedLabel,
  isLoading,
  icon: Icon,
  placeholder,
  emptyText,
  getLabel,
  getDescription,
  onSearchChange,
  onSelect,
  onClear,
}: SearchSelectFieldProps<TItem>) {
  const query = search.trim();
  const inputValue = selectedId ? selectedLabel : search;
  const filteredItems =
    query.length > 0
      ? items.filter((item) =>
          normalizeText([getLabel(item), getDescription?.(item) ?? ""].join(" ")).includes(
            normalizeText(query)
          )
        )
      : [];

  return (
    <div className="relative min-w-0 flex-1">
      <Icon className="pointer-events-none absolute left-3 top-5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        aria-autocomplete="list"
        aria-expanded={query.length > 0 && !selectedId}
        autoComplete="off"
        className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
        id={id}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={placeholder}
        value={inputValue}
      />
      {selectedId || search ? (
        <button
          aria-label={`${placeholder} 지우기`}
          className="absolute right-2 top-5 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
          onClick={onClear}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {query.length > 0 && !selectedId ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-44 overflow-y-auto rounded-md border bg-white shadow-lg">
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">검색 중입니다.</p>
          ) : filteredItems.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {emptyText}
            </p>
          ) : (
            filteredItems.map((item) => (
              <button
                className="grid w-full gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                key={item.id}
                onClick={() => onSelect(item)}
                type="button"
              >
                <span className="font-medium">{getLabel(item)}</span>
                {getDescription ? (
                  <span className="text-xs text-muted-foreground">
                    {getDescription(item)}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

// 기능 : 제품명을 검색해 결과를 클릭하는 다중 선택 입력을 제공합니다.
function ProductMultiSelectDropdown({
  id,
  items,
  search,
  selectedIds,
  isLoading,
  onSearchChange,
  onToggle,
}: ProductMultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const query = search.trim();
  const filteredItems =
    query.length > 0
      ? items.filter((item) =>
          normalizeText(item.productName).includes(normalizeText(query))
        )
      : [];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-autocomplete="list"
          aria-expanded={isOpen && query.length > 0}
          autoComplete="off"
          className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
          id={id}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedItems.length > 0 ? "제품 추가 검색" : "제품명 검색"}
          value={search}
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      <div className="mt-2 flex h-7 flex-nowrap gap-2 overflow-x-auto">
        {selectedItems.map((product) => (
          <button
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-medium text-primary"
            key={product.id}
            onClick={() => onToggle(product.id)}
            type="button"
          >
            {product.productName}
            <X className="h-3 w-3" />
          </button>
        ))}
      </div>

      {isOpen && query.length > 0 ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-md border bg-white shadow-lg"
          role="listbox"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-[11px] font-semibold text-muted-foreground">
              제품 선택
            </span>
            <span className="text-[11px] text-muted-foreground">
              {selectedIds.length}개 선택
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto">
            {isLoading ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                제품을 불러오는 중입니다.
              </p>
            ) : filteredItems.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                검색된 제품이 없습니다.
              </p>
            ) : (
              filteredItems.map((product) => {
                const isSelected = selectedIds.includes(product.id);

                return (
                  <button
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                      isSelected && "bg-primary/10"
                    )}
                    key={product.id}
                    onClick={() => {
                      onToggle(product.id);
                      onSearchChange("");
                      setIsOpen(true);
                    }}
                    type="button"
                  >
                    <input
                      readOnly
                      checked={isSelected}
                      className="h-3.5 w-3.5 accent-primary"
                      type="checkbox"
                    />
                    <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">
                      {product.productName}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function findCompanyOptionByName(
  options: readonly DealCompanyOption[],
  companyName: string
) {
  const target = normalizeText(companyName);
  return options.find((option) => normalizeText(option.companyName) === target);
}

function findContactOptionByName(
  options: readonly DealContactOption[],
  username: string
) {
  const target = normalizeText(username);
  return options.find((option) => normalizeText(option.username) === target);
}

function normalizeCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/^0+(?=\d)/, "");
}

function formatCurrencyInput(value: string) {
  const normalized = normalizeCurrencyInput(value);
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function normalizeDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}
