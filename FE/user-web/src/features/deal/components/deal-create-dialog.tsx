// 기능 : 딜 추가 모달 — Backend Deal API 생성 계약 기준
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronsRight,
  HandCoins,
  IdCard,
  Layers,
  Loader2,
  MapPin,
  Maximize2,
  Package,
  Plus,
  type LucideIcon,
  Users,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useDropdownPlacement } from "@/components/ui/use-dropdown-placement";
import {
  useCompanyFields,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import { useCreateCompanyMutation } from "@/features/company/hooks/use-company-mutations";
import {
  companyCreateFormSchema,
  emptyCompanyCreateFormValues,
  toCreateCompanyInput,
  type CompanyCreateFormValues,
} from "@/features/company/schemas/company-schema";
import {
  useContactDepartments,
  useContactJobGrades,
} from "@/features/contact/hooks/use-contact-list";
import { useCreateContactMutation } from "@/features/contact/hooks/use-contact-mutations";
import { ContactTaxonomyManageDialog } from "@/features/contact/components/contact-taxonomy-manage-dialog";
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
  type DealStatus,
} from "@/features/deal/types/deal";
import {
  formatCurrencyInput,
  normalizeCurrencyInput,
  normalizeDateInput,
} from "@/features/deal/utils/deal-form-input";
import { CompanyTaxonomyCreateDialog } from "@/features/company/components/company-taxonomy-create-dialog";
import { ProductCreateDialog } from "@/features/product/components/product-create-dialog";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type DealCreateDialogProps = {
  readonly open: boolean;
  readonly initialValues?: Partial<DealCreateFormValues>;
  readonly mode?: "docked" | "overlay" | "page";
  readonly width?: number;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (deal: DealDetail) => void;
  readonly onExpand?: (values: DealCreateFormValues) => void;
  readonly onResizeStart?: () => void;
};

export function DealCreateDialog({
  open,
  initialValues,
  mode = "overlay",
  width,
  onOpenChange,
  onCreated,
  onExpand,
  onResizeStart,
}: DealCreateDialogProps) {
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isCompanyCreateOpen, setIsCompanyCreateOpen] = useState(false);
  const [isContactCreateOpen, setIsContactCreateOpen] = useState(false);
  const [isProductCreateOpen, setIsProductCreateOpen] = useState(false);
  const createDealMutation = useCreateDealMutation();
  const companyOptionsQuery = useDealCompanyOptions();
  const contactOptionsQuery = useDealContactOptions();
  const productOptionsQuery = useDealProductOptions();
  const memoTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealCreateFormValues>({
    resolver: zodResolver(dealCreateFormSchema),
    defaultValues: emptyDealCreateFormValues,
  });

  const dealCostValue = watch("dealCost");
  const dealStatusValue = watch("dealStatus");
  const expectedEndDateValue = watch("expectedEndDate");
  const dealMemo = watch("dealMemo") ?? "";
  const companySearch = watch("companySearch") ?? "";
  const contactSearch = watch("contactSearch") ?? "";
  const productSearch = watch("productSearch") ?? "";
  const memoRegister = register("dealMemo");

  useEffect(() => {
    if (open) {
      const nextValues = {
        ...emptyDealCreateFormValues,
        ...initialValues,
        companyIds: initialValues?.companyIds ?? [],
        contactIds: initialValues?.contactIds ?? [],
        productIds: initialValues?.productIds ?? [],
      };

      reset(nextValues);
      setSelectedCompanyIds(nextValues.companyIds);
      setSelectedContactIds(nextValues.contactIds);
      setSelectedProductIds(nextValues.productIds);
      setIsCompanyCreateOpen(false);
      setIsContactCreateOpen(false);
      setIsProductCreateOpen(false);
    }
  }, [initialValues, open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createDealMutation.isPending) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [createDealMutation.isPending, onOpenChange, open]);

  useEffect(() => {
    resizeMemoTextarea(memoTextareaRef.current);
  }, [initialValues, open]);

  const formId = "deal-create-form";

  const onCompanyToggle = (companyId: string) => {
    const next = selectedCompanyIds.includes(companyId)
      ? selectedCompanyIds.filter((id) => id !== companyId)
      : [...selectedCompanyIds, companyId];
    const nextCompanySet = new Set(next);
    const contacts = contactOptionsQuery.data ?? [];
    const nextContactIds = selectedContactIds.filter((contactId) => {
      const contact = contacts.find((item) => item.id === contactId);
      return contact ? nextCompanySet.has(contact.companyId) : false;
    });

    setSelectedCompanyIds(next);
    setSelectedContactIds(nextContactIds);
    setValue("companyIds", next, { shouldDirty: true, shouldValidate: true });
    setValue("contactIds", nextContactIds, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onContactToggle = (contactId: string) => {
    const next = selectedContactIds.includes(contactId)
      ? selectedContactIds.filter((id) => id !== contactId)
      : [...selectedContactIds, contactId];

    setSelectedContactIds(next);
    setValue("contactIds", next, { shouldDirty: true, shouldValidate: true });
  };

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

  // 기능 : 추가한 회사를 Deal 선택 옵션에서 찾아 자동 선택합니다.
  const onCompanyCreated = async (companyName: string) => {
    const updated = await companyOptionsQuery.refetch();
    const created = findCompanyOptionByName(updated.data ?? [], companyName);

    if (created) {
      const next = selectedCompanyIds.includes(created.id)
        ? selectedCompanyIds
        : [...selectedCompanyIds, created.id];

      setSelectedCompanyIds(next);
      setValue("companyIds", next, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("companySearch", "", { shouldDirty: true });
    }
  };

  // 기능 : 추가한 담당자를 Deal 선택 옵션에서 찾아 자동 선택합니다.
  const onContactCreated = async (payload: QuickContactCreatedPayload) => {
    const nextCompanyIds = selectedCompanyIds.includes(payload.companyId)
      ? selectedCompanyIds
      : [...selectedCompanyIds, payload.companyId];
    const updated = await contactOptionsQuery.refetch();
    const created = findContactOptionByName(
      updated.data ?? [],
      payload.username,
    );

    if (created) {
      const nextContactIds = selectedContactIds.includes(created.id)
        ? selectedContactIds
        : [...selectedContactIds, created.id];

      setSelectedCompanyIds(nextCompanyIds);
      setSelectedContactIds(nextContactIds);
      setValue("companyIds", nextCompanyIds, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("companySearch", "", { shouldDirty: true });
      setValue("contactIds", nextContactIds, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("contactSearch", "", { shouldDirty: true });
    }
  };

  // 기능 : 추가한 제품을 Deal 선택 옵션에서 찾아 자동 선택합니다.
  const onProductCreated = async (productName: string) => {
    const updated = await productOptionsQuery.refetch();
    const created = findProductOptionByName(updated.data ?? [], productName);

    if (created) {
      const next = selectedProductIds.includes(created.id)
        ? selectedProductIds
        : [...selectedProductIds, created.id];

      setSelectedProductIds(next);
      setValue("productIds", next, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("productSearch", "", { shouldDirty: true });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const deal = await createDealMutation.mutateAsync(
      toCreateDealInput(values),
    );
    onCreated(deal);
    onOpenChange(false);
  });

  const focusMemoTextarea = () => {
    memoTextareaRef.current?.focus();
  };

  const companyOptions = companyOptionsQuery.data ?? [];
  // 선택된 회사에 속한 담당자만 표시합니다. 백엔드에서 contact.companyId !== companyId 검사를 합니다.
  const allContactOptions = contactOptionsQuery.data ?? [];
  const selectedCompanyIdSet = new Set(selectedCompanyIds);
  const contactOptions =
    selectedCompanyIds.length > 0
      ? allContactOptions.filter((contact) =>
          selectedCompanyIdSet.has(contact.companyId),
        )
      : [];
  const productOptions = productOptionsQuery.data ?? [];
  const isDocked = mode === "docked";
  const isPage = mode === "page";
  const CloseIcon = isPage ? ArrowLeft : ChevronsRight;

  if (!open && !isDocked) {
    return null;
  }

  const panel = (
    <section
      aria-label="딜 생성"
      aria-modal={isPage ? undefined : !isDocked}
      className={
        isPage
          ? "flex min-h-full flex-col bg-white"
          : isDocked
            ? `fixed inset-y-0 right-0 z-50 flex h-screen shrink-0 flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-[transform,opacity] duration-[500ms] ease-out will-change-transform ${
                open
                  ? "deal-create-panel-enter pointer-events-auto translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-full opacity-0"
              }`
            : "pointer-events-auto relative flex h-full w-full flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] sm:max-w-[520px]"
      }
      role={isPage ? undefined : "dialog"}
      style={isDocked ? { width: width ?? 520 } : undefined}
    >
      {isDocked ? (
        <button
          aria-label="딜 생성 패널 폭 조절"
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
            aria-label={isPage ? "딜 목록으로 이동" : "딜 생성 패널 접기"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={createDealMutation.isPending}
            onClick={() => onOpenChange(false)}
            title={isPage ? "딜 목록으로 이동" : "딜 생성 패널 접기"}
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          {onExpand && !isPage ? (
            <button
              aria-label="전체 생성 페이지로 열기"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createDealMutation.isPending}
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
                htmlFor="deal-name"
              >
                딜이름
              </label>
              <div className="relative">
                <BriefcaseBusiness className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#CBD5E1]" />
                <input
                  aria-describedby={
                    errors.dealName ? "deal-name-error" : undefined
                  }
                  aria-invalid={Boolean(errors.dealName)}
                  className="h-14 w-full border-0 bg-transparent pl-8 pr-1 text-[32px] font-semibold leading-none text-[#111827] outline-none placeholder:text-[#CBD5E1] placeholder:opacity-100"
                  id="deal-name"
                  placeholder="딜이름을 넣어주세요."
                  {...register("dealName")}
                />
              </div>
              {errors.dealName ? (
                <p className="text-[12px] text-red-500" id="deal-name-error">
                  {errors.dealName.message}
                </p>
              ) : null}
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <DealCreatePanelProperty
                error={errors.dealCost?.message}
                errorId="deal-cost-error"
                label="금액"
              >
                <input type="hidden" {...register("dealCost")} />
                <div className="flex h-10 items-center overflow-hidden rounded-md border border-[#E6EAF0] focus-within:border-[#4880EE] focus-within:ring-1 focus-within:ring-[#4880EE]">
                  <span className="grid h-full w-10 shrink-0 place-items-center border-r border-[#E6EAF0] bg-[#F9FAFB]">
                    <HandCoins className="h-4 w-4 text-[#6B7280]" />
                  </span>
                  <input
                    aria-describedby={
                      errors.dealCost ? "deal-cost-error" : undefined
                    }
                    aria-invalid={Boolean(errors.dealCost)}
                    className="h-full min-w-0 flex-1 px-3 text-[13px] outline-none"
                    id="deal-cost"
                    inputMode="numeric"
                    onChange={onDealCostChange}
                    placeholder="0"
                    value={formatCurrencyInput(dealCostValue ?? "")}
                  />
                  <span className="shrink-0 select-none border-l border-[#E6EAF0] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#9CA3AF]">
                    KRW
                  </span>
                </div>
              </DealCreatePanelProperty>

              <DealCreatePanelProperty
                error={errors.expectedEndDate?.message}
                errorId="deal-end-date-error"
                label="예상 마감일"
              >
                <input type="hidden" {...register("expectedEndDate")} />
                <input
                  aria-describedby={
                    errors.expectedEndDate ? "deal-end-date-error" : undefined
                  }
                  aria-invalid={Boolean(errors.expectedEndDate)}
                  className="h-10 w-full rounded-md border border-[#E6EAF0] px-3 text-[13px] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                  id="deal-end-date"
                  onChange={onExpectedEndDateChange}
                  type="date"
                  value={expectedEndDateValue ?? ""}
                />
              </DealCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <DealCreatePanelProperty
                error={errors.companyIds?.message}
                label="회사"
              >
                <div className="grid gap-2">
                  <SearchSelectField
                    createActionLabel="회사 생성"
                    emptyText="검색어를 바꾸면 회사를 찾을 수 있어요."
                    getLabel={(company) => company.companyName}
                    icon={Building2}
                    id="deal-company"
                    inputClassName="border-[#E6EAF0] text-[13px] focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                    isLoading={companyOptionsQuery.isLoading}
                    items={companyOptions}
                    placeholder="회사 검색"
                    search={companySearch}
                    selectedId=""
                    selectedLabel=""
                    onCreate={() => setIsCompanyCreateOpen(true)}
                    onClear={() => {
                      setValue("companySearch", "", { shouldDirty: true });
                    }}
                    onSearchChange={(value) => {
                      setValue("companySearch", value, { shouldDirty: true });
                    }}
                    onSelect={(company) => {
                      if (!selectedCompanyIds.includes(company.id)) {
                        onCompanyToggle(company.id);
                      }
                      setValue("companySearch", "", { shouldDirty: true });
                      setValue("contactSearch", "", { shouldDirty: true });
                    }}
                  />
                  <SelectedOptionChips
                    getLabel={(company) => company.companyName}
                    items={companyOptions.filter((company) =>
                      selectedCompanyIds.includes(company.id),
                    )}
                    onRemove={onCompanyToggle}
                  />
                </div>
              </DealCreatePanelProperty>

              <DealCreatePanelProperty
                error={errors.contactIds?.message}
                label="담당자"
              >
                <div className="grid gap-2">
                  <SearchSelectField
                    createActionLabel="담당자 생성"
                    disabled={selectedCompanyIds.length === 0}
                    emptyText="검색어를 바꾸면 담당자를 찾을 수 있어요."
                    getDescription={(contact) =>
                      contact.contactDepartment.departmentName
                    }
                    getLabel={(contact) => contact.label}
                    icon={IdCard}
                    id="deal-contact"
                    inputClassName="border-[#E6EAF0] text-[13px] focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                    isLoading={contactOptionsQuery.isLoading}
                    items={contactOptions}
                    placeholder="담당자 검색"
                    search={contactSearch}
                    selectedId=""
                    selectedLabel=""
                    onCreate={() => setIsContactCreateOpen(true)}
                    onClear={() => {
                      setValue("contactSearch", "", { shouldDirty: true });
                    }}
                    onSearchChange={(value) => {
                      setValue("contactSearch", value, { shouldDirty: true });
                    }}
                    onSelect={(contact) => {
                      if (!selectedContactIds.includes(contact.id)) {
                        onContactToggle(contact.id);
                      }
                      setValue("contactSearch", "", { shouldDirty: true });
                    }}
                  />
                  <SelectedOptionChips
                    getLabel={(contact) => contact.label}
                    items={contactOptions.filter((contact) =>
                      selectedContactIds.includes(contact.id),
                    )}
                    onRemove={onContactToggle}
                  />
                </div>
              </DealCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <DealCreatePanelProperty
                error={errors.productIds?.message}
                label="제품"
              >
                <ProductMultiSelectDropdown
                  createActionLabel="제품 생성"
                  id="deal-products"
                  inputClassName="border-[#E6EAF0] text-[13px] focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                  isLoading={productOptionsQuery.isLoading}
                  items={productOptions}
                  search={productSearch}
                  selectedIds={selectedProductIds}
                  onCreate={() => setIsProductCreateOpen(true)}
                  onSearchChange={(value) => {
                    setValue("productSearch", value, { shouldDirty: true });
                  }}
                  onToggle={onProductToggle}
                />
              </DealCreatePanelProperty>

              <DealCreatePanelProperty
                error={errors.dealStatus?.message}
                label="딜 단계"
              >
                <input type="hidden" {...register("dealStatus")} />
                <DealStatusDropdown
                  buttonClassName="border-[#E6EAF0] text-[13px] focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                  id="deal-status"
                  value={dealStatusValue}
                  onChange={(status) =>
                    setValue("dealStatus", status, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </DealCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <DealCreatePanelProperty
                error={errors.followingAction?.message}
                label="다음 행동"
              >
                <input
                  aria-invalid={Boolean(errors.followingAction)}
                  className="h-10 w-full rounded-md border border-[#E6EAF0] px-3 text-[13px] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                  id="deal-following"
                  placeholder="예: 제안서 발송"
                  {...register("followingAction")}
                />
              </DealCreatePanelProperty>
            </section>

            <section className="grid cursor-auto gap-2">
              <label
                className="text-[16px] font-semibold text-[#94A3B8]"
                htmlFor="deal-memo"
              >
                메모
              </label>
              <div className="relative min-h-8">
                <textarea
                  aria-label="메모"
                  className="min-h-0 w-full resize-none overflow-hidden border-0 bg-white px-0 py-1 text-[14px] leading-6 text-[#111827] outline-none"
                  id="deal-memo"
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
                {dealMemo.trim().length === 0 ? (
                  <span className="pointer-events-none absolute left-0 top-1 text-[14px] font-semibold leading-6 text-[#CBD5E1]">
                    번뜩이는 생각들을 기록하세요!
                  </span>
                ) : null}
              </div>
            </section>

            {createDealMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(createDealMutation.error)}
                title="딜 저장 실패"
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
              disabled={createDealMutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
            >
              {isPage ? "목록으로" : "닫기"}
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#4880EE] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createDealMutation.isPending}
              type="submit"
            >
              {createDealMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {createDealMutation.isPending ? "저장 중" : "저장"}
            </button>
          </div>
        </footer>
      </form>
    </section>
  );

  return (
    <>
      {isDocked || isPage ? (
        panel
      ) : (
        <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex w-full justify-end">
          {panel}
        </div>
      )}

      <QuickCompanyCreateDialog
        open={isCompanyCreateOpen}
        onCreated={(companyName) => void onCompanyCreated(companyName)}
        onOpenChange={setIsCompanyCreateOpen}
      />
      <QuickContactCreateDialog
        companyOptions={companyOptions}
        defaultCompanyId={selectedCompanyIds[0] ?? ""}
        open={isContactCreateOpen}
        onCreated={(payload) => void onContactCreated(payload)}
        onOpenChange={setIsContactCreateOpen}
      />
      <ProductCreateDialog
        open={isProductCreateOpen}
        onCreated={(productName) => void onProductCreated(productName)}
        onOpenChange={setIsProductCreateOpen}
      />
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

type DealCreatePanelPropertyProps = {
  readonly children: ReactNode;
  readonly error?: string;
  readonly errorId?: string;
  readonly label: string;
};

function DealCreatePanelProperty({
  children,
  error,
  errorId,
  label,
}: DealCreatePanelPropertyProps) {
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

type QuickCompanyCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (companyName: string) => void;
};

// 기능 : 딜 추가 중 새 회사를 최소 정보로 생성합니다.
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyCreateFormValues>({
    resolver: zodResolver(companyCreateFormSchema),
    defaultValues: emptyCompanyCreateFormValues,
  });
  const formId = "deal-quick-company-create-form";
  const [taxonomyDialog, setTaxonomyDialog] = useState<{
    kind: "field" | "region";
  } | null>(null);
  const [pendingFieldName, setPendingFieldName] = useState("");
  const [pendingRegionName, setPendingRegionName] = useState("");
  const [fieldSearch, setFieldSearch] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const selectedFieldId = watch("companyFieldId") ?? "";
  const selectedRegionId = watch("companyRegionId") ?? "";

  useEffect(() => {
    if (open) {
      reset(emptyCompanyCreateFormValues);
      setTaxonomyDialog(null);
      setPendingFieldName("");
      setPendingRegionName("");
      setFieldSearch("");
      setRegionSearch("");
    }
  }, [open, reset]);

  const fields = useMemo(
    () => fieldsQuery.data?.items ?? [],
    [fieldsQuery.data],
  );
  const regions = useMemo(
    () => regionsQuery.data?.items ?? [],
    [regionsQuery.data],
  );
  const selectedField = fields.find((field) => field.id === selectedFieldId);
  const selectedRegion = regions.find(
    (region) => region.id === selectedRegionId,
  );

  useEffect(() => {
    if (!pendingFieldName) return;
    const matched = fields.find((f) => f.field === pendingFieldName);
    if (matched) {
      setValue("companyFieldId", matched.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setFieldSearch(matched.field);
      setPendingFieldName("");
    }
  }, [fields, pendingFieldName, setValue]);

  useEffect(() => {
    if (!pendingRegionName) return;
    const matched = regions.find((r) => r.region === pendingRegionName);
    if (matched) {
      setValue("companyRegionId", matched.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setRegionSearch(matched.region);
      setPendingRegionName("");
    }
  }, [regions, pendingRegionName, setValue]);

  if (!open) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    await createCompanyMutation.mutateAsync(toCreateCompanyInput(values));
    onCreated(values.companyName.trim());
    onOpenChange(false);
  });

  return (
    <>
      <ModalShell
        footer={
          <ModalFooterActions
            formId={formId}
            isSubmitting={createCompanyMutation.isPending}
            submitLabel="회사 저장"
            onCancel={() => onOpenChange(false)}
            onSubmit={() => void onSubmit()}
          />
        }
        open={open}
        panelClassName="max-h-[82vh] md:max-h-[560px]"
        size="sm"
        title="회사 생성"
        onOpenChange={onOpenChange}
      >
        <ModalForm id={formId} onSubmit={onSubmit}>
          <ModalFormSection title="회사 기본 정보">
            <ModalFieldGroup
              error={errors.companyName?.message}
              id="deal-quick-company-name"
              label="회사명"
            >
              <input
                aria-invalid={Boolean(errors.companyName)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-company-name"
                {...register("companyName")}
              />
            </ModalFieldGroup>

            <ModalFormRow columns={2}>
              <ModalFieldGroup
                error={errors.companyFieldId?.message}
                id="deal-quick-company-field"
                label="분야"
              >
                <input type="hidden" {...register("companyFieldId")} />
                <SearchSelectField
                  createActionLabel="분야 추가"
                  emptyText="검색어를 바꾸면 분야를 찾을 수 있어요."
                  getLabel={(field) => field.field}
                  icon={Layers}
                  id="deal-quick-company-field"
                  isLoading={fieldsQuery.isLoading}
                  items={fields}
                  placeholder="분야 선택"
                  search={fieldSearch}
                  selectedId={selectedFieldId}
                  selectedLabel={selectedField?.field ?? fieldSearch}
                  onCreate={() => setTaxonomyDialog({ kind: "field" })}
                  onClear={() => {
                    setValue("companyFieldId", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setFieldSearch("");
                  }}
                  onSearchChange={(value) => {
                    setFieldSearch(value);
                    if (selectedFieldId) {
                      setValue("companyFieldId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  onSelect={(field) => {
                    setValue("companyFieldId", field.id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setFieldSearch(field.field);
                  }}
                />
              </ModalFieldGroup>

              <ModalFieldGroup
                error={errors.companyRegionId?.message}
                id="deal-quick-company-region"
                label="지역"
              >
                <input type="hidden" {...register("companyRegionId")} />
                <SearchSelectField
                  createActionLabel="지역 추가"
                  emptyText="검색어를 바꾸면 지역을 찾을 수 있어요."
                  getLabel={(region) => region.region}
                  icon={MapPin}
                  id="deal-quick-company-region"
                  isLoading={regionsQuery.isLoading}
                  items={regions}
                  placeholder="지역 검색"
                  search={regionSearch}
                  selectedId={selectedRegionId}
                  selectedLabel={selectedRegion?.region ?? regionSearch}
                  onCreate={() => setTaxonomyDialog({ kind: "region" })}
                  onClear={() => {
                    setValue("companyRegionId", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setRegionSearch("");
                  }}
                  onSearchChange={(value) => {
                    setRegionSearch(value);
                    if (selectedRegionId) {
                      setValue("companyRegionId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  onSelect={(region) => {
                    setValue("companyRegionId", region.id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setRegionSearch(region.region);
                  }}
                />
              </ModalFieldGroup>
            </ModalFormRow>
          </ModalFormSection>

          <ModalFormSection title="메모(옵션)">
            <ModalFieldGroup id="deal-quick-company-memo">
              <textarea
                aria-label="메모"
                className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-company-memo"
                {...register("companyMemo")}
              />
            </ModalFieldGroup>
          </ModalFormSection>

          {createCompanyMutation.error ? (
            <ErrorState
              message={getApiErrorMessage(createCompanyMutation.error)}
              title="회사 저장 실패"
              variant="inline"
            />
          ) : null}
        </ModalForm>
      </ModalShell>
      <CompanyTaxonomyCreateDialog
        kind={taxonomyDialog?.kind ?? "field"}
        fields={fields}
        regions={regions}
        open={taxonomyDialog !== null}
        onCreated={(name) => {
          if (taxonomyDialog?.kind === "field") setPendingFieldName(name);
          else setPendingRegionName(name);
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTaxonomyDialog(null);
        }}
      />
    </>
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

// 기능 : 딜 추가 중 새 담당자를 최소 정보로 생성합니다.
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactCreateFormValues>({
    resolver: zodResolver(contactCreateFormSchema),
    defaultValues: emptyContactCreateFormValues,
  });
  const formId = "deal-quick-contact-create-form";
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);
  const [pendingDepartmentName, setPendingDepartmentName] = useState("");
  const [pendingJobGradeName, setPendingJobGradeName] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [jobGradeSearch, setJobGradeSearch] = useState("");
  const selectedDepartmentId = watch("contactDepartmentId") ?? "";
  const selectedJobGradeId = watch("contactJobGradeId") ?? "";
  const departments = useMemo(
    () => departmentsQuery.data?.items ?? [],
    [departmentsQuery.data],
  );
  const jobGrades = useMemo(
    () => jobGradesQuery.data?.items ?? [],
    [jobGradesQuery.data],
  );
  const selectedDepartment = departments.find(
    (department) => department.id === selectedDepartmentId,
  );
  const selectedJobGrade = jobGrades.find(
    (jobGrade) => jobGrade.id === selectedJobGradeId,
  );

  useEffect(() => {
    if (open) {
      reset({
        ...emptyContactCreateFormValues,
        companyId: defaultCompanyId,
      });
      setTaxonomyOpen(false);
      setPendingDepartmentName("");
      setPendingJobGradeName("");
      setDepartmentSearch("");
      setJobGradeSearch("");
    }
  }, [defaultCompanyId, open, reset]);

  useEffect(() => {
    if (!pendingDepartmentName) return;
    const matched = departments.find(
      (department) => department.departmentName === pendingDepartmentName,
    );
    if (matched) {
      setValue("contactDepartmentId", matched.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setDepartmentSearch(matched.departmentName);
      setPendingDepartmentName("");
    }
  }, [departments, pendingDepartmentName, setValue]);

  useEffect(() => {
    if (!pendingJobGradeName) return;
    const matched = jobGrades.find(
      (jobGrade) => jobGrade.jobGradeName === pendingJobGradeName,
    );
    if (matched) {
      setValue("contactJobGradeId", matched.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setJobGradeSearch(matched.jobGradeName);
      setPendingJobGradeName("");
    }
  }, [jobGrades, pendingJobGradeName, setValue]);

  if (!open) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    await createContactMutation.mutateAsync(toCreateContactInput(values));
    onCreated({
      username: values.username.trim(),
      companyId: values.companyId,
    });
    onOpenChange(false);
  });

  return (
    <>
      <ModalShell
        footer={
          <ModalFooterActions
            formId={formId}
            isSubmitting={createContactMutation.isPending}
            submitLabel="담당자 저장"
            onCancel={() => onOpenChange(false)}
            onSubmit={() => void onSubmit()}
          />
        }
        open={open}
        bodyClassName="py-4"
        footerClassName="h-14"
        panelClassName="max-h-[calc(100vh-2rem)] md:max-h-[720px]"
        size="md"
        title="담당자 생성"
        onOpenChange={onOpenChange}
      >
        <ModalForm className="gap-3" id={formId} onSubmit={onSubmit}>
          <ModalFormSection className="gap-2" title="담당자 기본 정보">
            <ModalFormRow columns={2}>
              <ModalFieldGroup
                error={errors.username?.message}
                id="deal-quick-contact-name"
                label="이름"
              >
                <input
                  aria-invalid={Boolean(errors.username)}
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-quick-contact-name"
                  {...register("username")}
                />
              </ModalFieldGroup>

              <ModalFieldGroup
                error={errors.companyId?.message}
                id="deal-quick-contact-company"
                label="회사"
              >
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
              <ModalFieldGroup
                error={errors.mobile?.message}
                id="deal-quick-contact-mobile"
                label="휴대폰번호"
              >
                <input
                  aria-invalid={Boolean(errors.mobile)}
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-quick-contact-mobile"
                  placeholder="010-0000-0000"
                  {...register("mobile")}
                />
              </ModalFieldGroup>

              <ModalFieldGroup
                error={errors.email?.message}
                id="deal-quick-contact-email"
                label="이메일"
              >
                <input
                  aria-invalid={Boolean(errors.email)}
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-quick-contact-email"
                  {...register("email")}
                />
              </ModalFieldGroup>
            </ModalFormRow>
          </ModalFormSection>

          <ModalFormSection className="gap-2" title="소속 정보">
            <ModalFormRow columns={2}>
              <ModalFieldGroup
                error={errors.contactDepartmentId?.message}
                id="deal-quick-contact-department"
                label="부서"
              >
                <input type="hidden" {...register("contactDepartmentId")} />
                <SearchSelectField
                  createActionLabel="부서 추가"
                  emptyText="검색어를 바꾸면 부서를 찾을 수 있어요."
                  getLabel={(department) => department.departmentName}
                  icon={Users}
                  id="deal-quick-contact-department"
                  isLoading={departmentsQuery.isLoading}
                  items={departments}
                  placeholder="부서 검색"
                  search={departmentSearch}
                  selectedId={selectedDepartmentId}
                  selectedLabel={
                    selectedDepartment?.departmentName ?? departmentSearch
                  }
                  onCreate={() => setTaxonomyOpen(true)}
                  onClear={() => {
                    setValue("contactDepartmentId", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setDepartmentSearch("");
                  }}
                  onSearchChange={(value) => {
                    setDepartmentSearch(value);
                    if (selectedDepartmentId) {
                      setValue("contactDepartmentId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  onSelect={(department) => {
                    setValue("contactDepartmentId", department.id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setDepartmentSearch(department.departmentName);
                  }}
                />
              </ModalFieldGroup>

              <ModalFieldGroup
                error={errors.contactJobGradeId?.message}
                id="deal-quick-contact-job-grade"
                label="직급"
              >
                <input type="hidden" {...register("contactJobGradeId")} />
                <SearchSelectField
                  createActionLabel="직급 추가"
                  emptyText="검색어를 바꾸면 직급을 찾을 수 있어요."
                  getLabel={(jobGrade) => jobGrade.jobGradeName}
                  icon={BadgeCheck}
                  id="deal-quick-contact-job-grade"
                  isLoading={jobGradesQuery.isLoading}
                  items={jobGrades}
                  placeholder="직급 검색"
                  search={jobGradeSearch}
                  selectedId={selectedJobGradeId}
                  selectedLabel={
                    selectedJobGrade?.jobGradeName ?? jobGradeSearch
                  }
                  onCreate={() => setTaxonomyOpen(true)}
                  onClear={() => {
                    setValue("contactJobGradeId", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setJobGradeSearch("");
                  }}
                  onSearchChange={(value) => {
                    setJobGradeSearch(value);
                    if (selectedJobGradeId) {
                      setValue("contactJobGradeId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  onSelect={(jobGrade) => {
                    setValue("contactJobGradeId", jobGrade.id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setJobGradeSearch(jobGrade.jobGradeName);
                  }}
                />
              </ModalFieldGroup>
            </ModalFormRow>
          </ModalFormSection>

          <ModalFormSection className="gap-2" title="메모(옵션)">
            <ModalFieldGroup id="deal-quick-contact-memo">
              <textarea
                aria-label="메모"
                className="h-16 resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-quick-contact-memo"
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
      <ContactTaxonomyManageDialog
        open={taxonomyOpen}
        onCreated={(kind, name) => {
          if (kind === "department") {
            setPendingDepartmentName(name);
          } else {
            setPendingJobGradeName(name);
          }
        }}
        onOpenChange={setTaxonomyOpen}
      />
    </>
  );
}

type ProductMultiSelectDropdownProps = {
  readonly id: string;
  readonly items: DealProductOption[];
  readonly search: string;
  readonly selectedIds: string[];
  readonly isLoading: boolean;
  readonly createActionLabel?: string;
  readonly inputClassName?: string;
  readonly onSearchChange: (search: string) => void;
  readonly onToggle: (productId: string) => void;
  readonly onCreate?: () => void;
};

type SearchSelectFieldProps<TItem extends { readonly id: string }> = {
  readonly id: string;
  readonly items: readonly TItem[];
  readonly search: string;
  readonly selectedId: string;
  readonly selectedLabel: string;
  readonly isLoading: boolean;
  readonly disabled?: boolean;
  readonly icon: LucideIcon;
  readonly placeholder: string;
  readonly emptyText: string;
  readonly createActionLabel?: string;
  readonly inputClassName?: string;
  readonly getLabel: (item: TItem) => string;
  readonly getDescription?: (item: TItem) => string;
  readonly onSearchChange: (search: string) => void;
  readonly onSelect: (item: TItem) => void;
  readonly onClear: () => void;
  readonly onCreate?: () => void;
};

// 기능 : 빈 입력에 검색어를 입력하면 일치하는 옵션을 아래에 표시하고 클릭 선택합니다.
export function SearchSelectField<TItem extends { readonly id: string }>({
  id,
  items,
  search,
  selectedId,
  selectedLabel,
  isLoading,
  disabled = false,
  icon: Icon,
  placeholder,
  emptyText,
  createActionLabel,
  inputClassName,
  getLabel,
  getDescription,
  onSearchChange,
  onSelect,
  onClear,
  onCreate,
}: SearchSelectFieldProps<TItem>) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const placement = useDropdownPlacement({
    estimatedHeight: 220,
    isOpen,
    triggerRef: wrapperRef,
  });
  const query = search.trim();
  const inputValue = selectedId ? selectedLabel : search;
  const filteredItems =
    query.length > 0
      ? items.filter((item) =>
          normalizeText(
            [getLabel(item), getDescription?.(item) ?? ""].join(" "),
          ).includes(normalizeText(query)),
        )
      : [];
  const visibleItems = query.length > 0 ? filteredItems : items;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  return (
    <div className="relative min-w-0 flex-1" ref={wrapperRef}>
      <Icon className="pointer-events-none absolute left-3 top-5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        aria-autocomplete="list"
        aria-expanded={isOpen && !selectedId}
        autoComplete="off"
        className={cn(
          "h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
          isOpen && "ring-2 ring-ring",
          inputClassName,
        )}
        disabled={disabled}
        id={id}
        onChange={(event) => {
          onSearchChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={disabled ? "회사를 먼저 선택해 주세요" : placeholder}
        value={inputValue}
      />
      {selectedId || search ? (
        <button
          aria-label={`${placeholder} 지우기`}
          className="absolute right-2 top-5 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
          onClick={() => {
            onClear();
            setIsOpen(true);
          }}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-5 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] transition-transform",
            isOpen && "rotate-180",
          )}
        />
      )}

      {isOpen && !selectedId ? (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 max-h-44 overflow-y-auto rounded-md border bg-white shadow-lg",
            placement === "up"
              ? "bottom-[calc(100%+4px)]"
              : "top-[calc(100%+4px)]"
          )}
        >
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              검색하고 있어요.
            </p>
          ) : visibleItems.length === 0 ? (
            <div className="grid gap-2 px-3 py-3">
              <p className="text-sm text-muted-foreground">{emptyText}</p>
              {query.length > 0 && onCreate && createActionLabel ? (
                <button
                  className="inline-flex h-8 items-center justify-center gap-1.5 self-start rounded-md border border-dashed border-primary/30 bg-primary/5 px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
                  onClick={() => {
                    setIsOpen(false);
                    onCreate();
                  }}
                  type="button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {createActionLabel}
                </button>
              ) : null}
            </div>
          ) : (
            visibleItems.map((item) => (
              <button
                className="grid w-full gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
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
type SelectedOptionChipsProps<TItem extends { readonly id: string }> = {
  readonly items: readonly TItem[];
  readonly getLabel: (item: TItem) => string;
  readonly onRemove: (id: string) => void;
};

export function SelectedOptionChips<TItem extends { readonly id: string }>({
  items,
  getLabel,
  onRemove,
}: SelectedOptionChipsProps<TItem>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 text-xs font-medium text-primary"
          key={item.id}
          onClick={() => onRemove(item.id)}
          type="button"
        >
          {getLabel(item)}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

type DealStatusDropdownProps = {
  readonly id: string;
  readonly value: DealStatus;
  readonly buttonClassName?: string;
  readonly onChange: (status: DealStatus) => void;
};

export function DealStatusDropdown({
  id,
  value,
  buttonClassName,
  onChange,
}: DealStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex h-10 w-full items-center rounded-md border px-3 pr-10 text-left text-sm outline-none focus:ring-2 focus:ring-ring",
          isOpen && "ring-2 ring-ring",
          buttonClassName,
        )}
        id={id}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate">
          {DEAL_STATUS_LABEL[value]}
        </span>
      </button>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] transition-transform",
          isOpen && "rotate-180",
        )}
      />

      {isOpen ? (
        <div
          className="absolute bottom-[calc(100%+4px)] left-0 right-0 z-50 max-h-44 overflow-y-auto rounded-md border bg-white shadow-lg"
          role="listbox"
        >
          {DEAL_STATUS_LIST.map((status) => {
            const isSelected = status === value;

            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                  isSelected && "bg-primary/10 font-medium text-primary",
                )}
                key={status}
                onClick={() => {
                  onChange(status);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                {DEAL_STATUS_LABEL[status]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ProductMultiSelectDropdown({
  id,
  items,
  search,
  selectedIds,
  isLoading,
  createActionLabel,
  inputClassName,
  onSearchChange,
  onToggle,
  onCreate,
}: ProductMultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const placement = useDropdownPlacement({
    estimatedHeight: 220,
    isOpen,
    triggerRef: wrapperRef,
  });
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const query = search.trim();
  const filteredItems =
    query.length > 0
      ? items.filter((item) =>
          normalizeText(item.productName).includes(normalizeText(query)),
        )
      : [];
  const visibleItems = query.length > 0 ? filteredItems : items;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
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
          aria-expanded={isOpen}
          autoComplete="off"
          className={cn(
            "h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring",
            isOpen && "ring-2 ring-ring",
            inputClassName,
          )}
          id={id}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={
            selectedItems.length > 0 ? "제품 추가 검색" : "제품명 검색"
          }
          value={search}
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </div>

      {selectedItems.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
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
      ) : null}

      {isOpen ? (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 overflow-hidden rounded-md border bg-white shadow-lg",
            placement === "up"
              ? "bottom-[calc(100%+4px)]"
              : "top-[calc(100%+4px)]"
          )}
          role="listbox"
        >
          <div className="hidden items-center justify-between border-b px-3 py-2">
            <span className="text-[11px] font-semibold text-muted-foreground">
              제품 선택
            </span>
            <span className="text-[11px] text-muted-foreground">
              {selectedIds.length}개 선택
            </span>
          </div>

          <div className="max-h-44 overflow-y-auto">
            {isLoading ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                제품을 불러오고 있어요.
              </p>
            ) : visibleItems.length === 0 ? (
              <div className="grid gap-2 px-3 py-4">
                <p className="text-center text-sm text-muted-foreground">
                  검색어를 바꾸면 제품을 찾을 수 있어요.
                </p>
                {query.length > 0 && onCreate && createActionLabel ? (
                  <button
                    className="inline-flex h-8 items-center justify-center gap-1.5 self-center rounded-md border border-dashed border-primary/30 bg-primary/5 px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
                    onClick={() => {
                      setIsOpen(false);
                      onCreate();
                    }}
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {createActionLabel}
                  </button>
                ) : null}
              </div>
            ) : (
              visibleItems.map((product) => {
                const isSelected = selectedIds.includes(product.id);

                return (
                  <button
                    className={cn(
                      "grid w-full cursor-pointer gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                      isSelected && "bg-primary/10",
                    )}
                    key={product.id}
                    onClick={() => {
                      onToggle(product.id);
                      onSearchChange("");
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                    <span className="font-medium">
                      {product.productName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {product.productCategory.categoryName} ·{" "}
                      {product.productStatus.statusName}
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
  companyName: string,
) {
  const target = normalizeText(companyName);
  return options.find((option) => normalizeText(option.companyName) === target);
}

function findContactOptionByName(
  options: readonly DealContactOption[],
  username: string,
) {
  const target = normalizeText(username);
  return options.find((option) => normalizeText(option.username) === target);
}

function findProductOptionByName(
  options: readonly DealProductOption[],
  productName: string,
) {
  const target = normalizeText(productName);
  return options.find((option) => normalizeText(option.productName) === target);
}
