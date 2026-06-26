import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  HandCoins,
  IdCard,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormRow,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  DealStatusDropdown,
  ProductMultiSelectDropdown,
  SearchSelectField,
  SelectedOptionChips,
} from "@/features/deal/components/deal-create-dialog";
import {
  useDealCompanyOptions,
  useDealContactOptions,
  useDealProductOptions,
} from "@/features/deal/hooks/use-deal-entity-options";
import { useUpdateDealMutation } from "@/features/deal/hooks/use-deal-mutations";
import {
  dealUpdateFormSchema,
  toUpdateDealInput,
  type DealUpdateFormValues,
} from "@/features/deal/schemas/deal-schema";
import type {
  DealCompany,
  DealCompanyOption,
  DealContact,
  DealContactOption,
  DealDetail,
  DealProduct,
  DealProductOption,
} from "@/features/deal/types/deal";
import {
  formatCurrencyInput,
  normalizeCurrencyInput,
  normalizeDateInput,
} from "@/features/deal/utils/deal-form-input";
import { getApiErrorMessage } from "@/lib/api-client";

type DealEditDialogProps = {
  readonly open: boolean;
  readonly deal: DealDetail;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSaved: (deal: DealDetail) => void;
};

// 기능 : 딜 기본 정보와 연결 대상을 수정하는 모달을 렌더링합니다.
export function DealEditDialog({
  open,
  deal,
  onOpenChange,
  onSaved,
}: DealEditDialogProps) {
  const updateDealMutation = useUpdateDealMutation();
  const companyOptionsQuery = useDealCompanyOptions();
  const contactOptionsQuery = useDealContactOptions();
  const productOptionsQuery = useDealProductOptions();
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealUpdateFormValues>({
    resolver: zodResolver(dealUpdateFormSchema),
    defaultValues: toDealUpdateFormValues(deal),
  });
  const dealCostValue = watch("dealCost");
  const dealStatusValue = watch("dealStatus");
  const expectedEndDateValue = watch("expectedEndDate");
  const companySearch = watch("companySearch") ?? "";
  const contactSearch = watch("contactSearch") ?? "";
  const productSearch = watch("productSearch") ?? "";

  const companyOptions = useMemo(
    () => mergeCompanyOptions(companyOptionsQuery.data ?? [], deal.companies),
    [companyOptionsQuery.data, deal.companies],
  );
  const allContactOptions = useMemo(
    () => mergeContactOptions(contactOptionsQuery.data ?? [], deal.contacts),
    [contactOptionsQuery.data, deal.contacts],
  );
  const productOptions = useMemo(
    () => mergeProductOptions(productOptionsQuery.data ?? [], deal.products),
    [productOptionsQuery.data, deal.products],
  );
  const selectedCompanyIdSet = new Set(selectedCompanyIds);
  const contactOptions =
    selectedCompanyIds.length > 0
      ? allContactOptions.filter((contact) =>
          selectedCompanyIdSet.has(contact.companyId),
        )
      : [];
  const formId = "deal-edit-form";

  useEffect(() => {
    if (!open) {
      return;
    }

    const values = toDealUpdateFormValues(deal);
    setSelectedCompanyIds(values.companyIds);
    setSelectedContactIds(values.contactIds);
    setSelectedProductIds(values.productIds);
    reset(values);
  }, [deal, open, reset]);

  // 기능 : 딜 수정 모달의 회사 선택 상태를 갱신하고 담당자 선택을 유효 범위로 맞춥니다.
  const onCompanyToggle = (companyId: string) => {
    const next = selectedCompanyIds.includes(companyId)
      ? selectedCompanyIds.filter((id) => id !== companyId)
      : [...selectedCompanyIds, companyId];
    const nextCompanySet = new Set(next);
    const nextContactIds = selectedContactIds.filter((contactId) => {
      const contact = allContactOptions.find((item) => item.id === contactId);
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

  // 기능 : 딜 수정 모달의 담당자 선택 상태를 갱신합니다.
  const onContactToggle = (contactId: string) => {
    const next = selectedContactIds.includes(contactId)
      ? selectedContactIds.filter((id) => id !== contactId)
      : [...selectedContactIds, contactId];

    setSelectedContactIds(next);
    setValue("contactIds", next, { shouldDirty: true, shouldValidate: true });
  };

  // 기능 : 딜 수정 모달의 제품 선택 상태를 갱신합니다.
  const onProductToggle = (productId: string) => {
    const next = selectedProductIds.includes(productId)
      ? selectedProductIds.filter((id) => id !== productId)
      : [...selectedProductIds, productId];

    setSelectedProductIds(next);
    setValue("productIds", next, { shouldDirty: true, shouldValidate: true });
  };

  // 기능 : 금액 입력값을 숫자 문자열로 정규화해 form에 반영합니다.
  const onDealCostChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue("dealCost", normalizeCurrencyInput(event.target.value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // 기능 : 날짜 입력값을 YYYY-MM-DD 형태로 정규화해 form에 반영합니다.
  const onExpectedEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue("expectedEndDate", normalizeDateInput(event.target.value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    const updated = await updateDealMutation.mutateAsync(
      toUpdateDealInput(deal.id, values),
    );
    onSaved(updated);
    onOpenChange(false);
  });

  return (
    <ModalShell
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={updateDealMutation.isPending}
          pendingLabel="저장 중"
          submitIcon={<Save className="h-4 w-4" />}
          submitLabel="저장"
          onCancel={() => onOpenChange(false)}
          onSubmit={() => void onSubmit()}
        />
      }
      open={open}
      panelClassName="max-h-[86vh] md:max-h-[760px]"
      size="lg"
      title="딜 수정"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection title="딜 기본 정보">
          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.dealName?.message}
              id="deal-edit-name"
              label="딜명"
            >
              <input
                aria-invalid={Boolean(errors.dealName)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-edit-name"
                {...register("dealName")}
              />
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.dealCost?.message}
              id="deal-edit-cost"
              label="금액"
            >
              <div className="relative">
                <input type="hidden" {...register("dealCost")} />
                <HandCoins className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  aria-invalid={Boolean(errors.dealCost)}
                  className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-edit-cost"
                  inputMode="numeric"
                  onChange={onDealCostChange}
                  value={formatCurrencyInput(dealCostValue ?? "")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  원
                </span>
              </div>
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection title="연결 대상">
          <ModalFormRow className="items-start" columns={2}>
            <ModalFieldGroup
              error={errors.companyIds?.message}
              id="deal-edit-company"
              label="회사"
            >
              <div className="grid gap-2">
                <input type="hidden" {...register("companyIds")} />
                <SearchSelectField
                  emptyText="검색된 회사가 없습니다."
                  getLabel={(company) => company.companyName}
                  icon={Building2}
                  id="deal-edit-company"
                  isLoading={companyOptionsQuery.isLoading}
                  items={companyOptions}
                  placeholder="회사명 검색"
                  search={companySearch}
                  selectedId=""
                  selectedLabel=""
                  onClear={() => setValue("companySearch", "", { shouldDirty: true })}
                  onSearchChange={(value) =>
                    setValue("companySearch", value, { shouldDirty: true })
                  }
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
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.contactIds?.message}
              id="deal-edit-contact"
              label="담당자"
            >
              <div className="grid gap-2">
                <input type="hidden" {...register("contactIds")} />
                <SearchSelectField
                  disabled={selectedCompanyIds.length === 0}
                  emptyText="검색된 담당자가 없습니다."
                  getDescription={(contact) =>
                    contact.contactDepartment.departmentName
                  }
                  getLabel={(contact) => contact.label}
                  icon={IdCard}
                  id="deal-edit-contact"
                  isLoading={contactOptionsQuery.isLoading}
                  items={contactOptions}
                  placeholder="담당자명 검색"
                  search={contactSearch}
                  selectedId=""
                  selectedLabel=""
                  onClear={() => setValue("contactSearch", "", { shouldDirty: true })}
                  onSearchChange={(value) =>
                    setValue("contactSearch", value, { shouldDirty: true })
                  }
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
            </ModalFieldGroup>
          </ModalFormRow>

          <ModalFieldGroup
            error={errors.productIds?.message}
            id="deal-edit-products"
            label="제품"
          >
            <input type="hidden" {...register("productIds")} />
            <ProductMultiSelectDropdown
              id="deal-edit-products"
              isLoading={productOptionsQuery.isLoading}
              items={productOptions}
              search={productSearch}
              selectedIds={selectedProductIds}
              onSearchChange={(value) =>
                setValue("productSearch", value, { shouldDirty: true })
              }
              onToggle={onProductToggle}
            />
          </ModalFieldGroup>
        </ModalFormSection>

        <ModalFormSection title="진행 상태">
          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.dealStatus?.message}
              id="deal-edit-status"
              label="딜 단계"
            >
              <input type="hidden" {...register("dealStatus")} />
              <DealStatusDropdown
                id="deal-edit-status"
                value={dealStatusValue}
                onChange={(status) =>
                  setValue("dealStatus", status, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.expectedEndDate?.message}
              id="deal-edit-end-date"
              label="예상 마감일"
            >
              <input type="hidden" {...register("expectedEndDate")} />
              <input
                aria-invalid={Boolean(errors.expectedEndDate)}
                className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-edit-end-date"
                onChange={onExpectedEndDateChange}
                type="date"
                value={expectedEndDateValue ?? ""}
              />
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        {updateDealMutation.error ? (
          <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {getApiErrorMessage(updateDealMutation.error)}
          </p>
        ) : null}
      </ModalForm>
    </ModalShell>
  );
}

// 기능 : 딜 상세 값을 수정 form 기본값으로 변환합니다.
function toDealUpdateFormValues(deal: DealDetail): DealUpdateFormValues {
  return {
    companyIds: deal.companies
      .filter((company) => !company.isDeleted)
      .map((company) => company.id),
    contactIds: deal.contacts
      .filter((contact) => !contact.isDeleted && !contact.company.isDeleted)
      .map((contact) => contact.id),
    dealCost: String(deal.dealCost ?? 0),
    dealName: deal.dealName,
    dealStatus: deal.dealStatus,
    expectedEndDate: deal.expectedEndDate?.slice(0, 10) ?? "",
    productIds: deal.products
      .filter((product) => !product.isDeleted)
      .map((product) => product.id),
    companySearch: "",
    contactSearch: "",
    productSearch: "",
  };
}

// 기능 : 현재 딜에 연결된 active 회사를 옵션 목록에 보강합니다.
function mergeCompanyOptions(
  options: readonly DealCompanyOption[],
  companies: readonly DealCompany[],
): DealCompanyOption[] {
  const optionIds = new Set(options.map((option) => option.id));
  const currentOptions = companies
    .filter((company) => !company.isDeleted && !optionIds.has(company.id))
    .map((company) => ({
      companyField: company.companyField,
      companyName: company.companyName,
      companyRegion: company.companyRegion,
      id: company.id,
      isDeleted: company.isDeleted,
    }));

  return [...options, ...currentOptions];
}

// 기능 : 현재 딜에 연결된 active 담당자를 옵션 목록에 보강합니다.
function mergeContactOptions(
  options: readonly DealContactOption[],
  contacts: readonly DealContact[],
): DealContactOption[] {
  const optionIds = new Set(options.map((option) => option.id));
  const currentOptions = contacts
    .filter(
      (contact) =>
        !contact.isDeleted && !contact.company.isDeleted && !optionIds.has(contact.id),
    )
    .map((contact) => ({
      company: contact.company,
      companyId: contact.companyId,
      contactDepartment: contact.contactDepartment,
      contactJobGrade: contact.contactJobGrade,
      email: contact.email,
      id: contact.id,
      isDeleted: contact.isDeleted,
      label: contact.username,
      mobile: contact.mobile,
      username: contact.username,
    }));

  return [...options, ...currentOptions];
}

// 기능 : 현재 딜에 연결된 active 제품을 옵션 목록에 보강합니다.
function mergeProductOptions(
  options: readonly DealProductOption[],
  products: readonly DealProduct[],
): DealProductOption[] {
  const optionIds = new Set(options.map((option) => option.id));
  const currentOptions = products
    .filter((product) => !product.isDeleted && !optionIds.has(product.id))
    .map((product) => ({
      id: product.id,
      isDeleted: product.isDeleted,
      productCategory: product.productCategory,
      productName: product.productName,
      productPrice: product.productPrice,
      productStatus: product.productStatus,
    }));

  return [...options, ...currentOptions];
}
