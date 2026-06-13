import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, HandCoins, IdCard, Package, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  ModalAdvancedSection,
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormRow,
  ModalFormSection,
  ModalHelperText,
  ModalInlineCreateArea,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { ErrorState } from "@/components/ui/state";
import { DealEntitySearchField } from "@/features/deal/components/deal-entity-search-field";
import {
  type DealEntityOption,
  useDealCompanyOptions,
  useDealContactOptions,
  useDealProductOptions,
} from "@/features/deal/hooks/use-deal-entity-options";
import { useCreateDealMutation } from "@/features/deal/hooks/use-deal-mutations";
import {
  dealFormSchema,
  emptyDealFormValues,
  toCreateDealInput,
  type DealFormValues,
} from "@/features/deal/schemas/deal-schema";
import type { Deal } from "@/features/deal/types/deal";
import { useCreateProductMutation } from "@/features/product/hooks/use-product-mutations";
import { getApiErrorMessage } from "@/lib/api-client";

type DealCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (deal: Deal) => void;
};

export function DealCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: DealCreateDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<DealEntityOption[]>(
    []
  );
  const [inlineProductUnitPrice, setInlineProductUnitPrice] = useState("");
  const [inlineProductUnitPriceError, setInlineProductUnitPriceError] =
    useState<string | null>(null);
  const createDealMutation = useCreateDealMutation();
  const createProductMutation = useCreateProductMutation();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: emptyDealFormValues,
  });
  const companyId = useWatch({ control, name: "companyId" }) ?? "";
  const companySearch = useWatch({ control, name: "companySearch" }) ?? "";
  const contactId = useWatch({ control, name: "contactId" }) ?? "";
  const contactSearch = useWatch({ control, name: "contactSearch" }) ?? "";
  const productSearch = useWatch({ control, name: "productSearch" }) ?? "";
  const companyOptionsQuery = useDealCompanyOptions(companySearch);
  const contactOptionsQuery = useDealContactOptions(contactSearch, companyId);
  const productOptionsQuery = useDealProductOptions(productSearch);
  const companyName = companySearch.trim();
  const contactName = contactSearch.trim();
  const productName = productSearch.trim();
  const canCreateProductInline = canShowInlineCreate({
    search: productSearch,
    selectedId: "",
    isFetching: productOptionsQuery.isFetching,
    isError: productOptionsQuery.isError,
  });
  const isCreatingInlineEntity = createProductMutation.isPending;
  const formId = "deal-create-form";

  useEffect(() => {
    if (open) {
      reset(emptyDealFormValues);
      setSelectedProducts([]);
      setInlineProductUnitPrice("");
      setInlineProductUnitPriceError(null);
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  const clearContact = () => {
    setValue("contactId", "", { shouldValidate: true });
    setValue("contactSearch", "", { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const deal = await createDealMutation.mutateAsync(toCreateDealInput(values));

    onCreated(deal);
    onOpenChange(false);
  });

  const onProductSelect = (option: DealEntityOption) => {
    const nextProducts = selectedProducts.some((product) => product.id === option.id)
      ? selectedProducts
      : [...selectedProducts, option];

    setSelectedProducts(nextProducts);
    setValue(
      "productIds",
      nextProducts.map((product) => product.id),
      { shouldValidate: true }
    );
    setValue("productSearch", "", { shouldValidate: true });
  };

  const onProductRemove = (productId: string) => {
    const nextProducts = selectedProducts.filter(
      (product) => product.id !== productId
    );

    setSelectedProducts(nextProducts);
    setValue(
      "productIds",
      nextProducts.map((product) => product.id),
      { shouldValidate: true }
    );
  };

  const onInlineProductCreate = async () => {
    if (!productName) {
      return;
    }

    const unitPrice = parseOptionalUnitPrice(inlineProductUnitPrice);

    if (unitPrice === null) {
      setInlineProductUnitPriceError("단가는 0 이상의 정수입니다.");
      return;
    }

    setInlineProductUnitPriceError(null);

    const product = await createProductMutation.mutateAsync(
      unitPrice === undefined
        ? { name: productName, currency: "KRW" }
        : { name: productName, unitPrice, currency: "KRW" }
    );

    onProductSelect({
      id: product.id,
      name: product.name,
      subtitle: [product.category, formatInlineProductPrice(product.unitPrice)]
        .filter(Boolean)
        .join(" · "),
    });
    setInlineProductUnitPrice("");
  };

  return (
    <ModalShell
      description="딜명, 금액, 연결 대상과 다음 행동을 저장합니다."
      footer={
        <ModalFooterActions
          disabled={isCreatingInlineEntity}
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
          <ModalFormSection
            description="딜의 이름, 예상 금액, 통화를 먼저 정합니다."
            title="딜 기본 정보"
          >
            <ModalFormRow className="md:grid-cols-[minmax(0,1fr)_180px_120px]" columns={1}>
              <ModalFieldGroup
                error={errors.title?.message}
                id="deal-title"
                label="딜명"
              >
                <input
                  aria-describedby={errors.title ? "deal-title-error" : undefined}
                  aria-invalid={Boolean(errors.title)}
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-title"
                  {...register("title")}
                />
              </ModalFieldGroup>

              <ModalFieldGroup
                error={errors.amount?.message}
                id="deal-amount"
                label="금액"
              >
                <div className="relative">
                  <HandCoins className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    aria-describedby={
                      errors.amount ? "deal-amount-error" : undefined
                    }
                    aria-invalid={Boolean(errors.amount)}
                    className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    id="deal-amount"
                    inputMode="numeric"
                    {...register("amount")}
                  />
                </div>
              </ModalFieldGroup>

              <ModalFieldGroup
                error={errors.currency?.message}
                id="deal-currency"
                label="통화"
              >
                <input
                  aria-describedby={
                    errors.currency ? "deal-currency-error" : undefined
                  }
                  aria-invalid={Boolean(errors.currency)}
                  className="h-10 rounded-md border px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
                  id="deal-currency"
                  maxLength={3}
                  {...register("currency")}
                />
              </ModalFieldGroup>
            </ModalFormRow>
          </ModalFormSection>

          <ModalFormSection
            description="회사, 거래처, 제품을 검색해 연결합니다."
            title="연결 대상"
          >
            <ModalFormRow columns={2}>
              <div className="grid content-start gap-2">
                <DealEntitySearchField
                  emptyText="선택할 회사가 없습니다."
                  errorMessage={errors.companySearch?.message}
                  icon={Building2}
                  id="deal-company"
                  isLoading={companyOptionsQuery.isLoading}
                  label="회사"
                  onClear={() => {
                    setValue("companyId", "", { shouldValidate: true });
                    setValue("companySearch", "", { shouldValidate: true });
                    clearContact();
                  }}
                  onSearchChange={(value) => {
                    setValue("companySearch", value, { shouldValidate: true });
                    setValue("companyId", "", { shouldValidate: true });
                    clearContact();
                  }}
                  onSelect={(option) => {
                    setValue("companyId", option.id, { shouldValidate: true });
                    setValue("companySearch", option.name, {
                      shouldValidate: true,
                    });
                    clearContact();
                  }}
                  options={companyOptionsQuery.data ?? []}
                  placeholder="회사 검색"
                  search={companySearch}
                  selectedId={companyId}
                />

                {companyName &&
                !companyId &&
                !companyOptionsQuery.isFetching &&
                (companyOptionsQuery.data?.length ?? 0) === 0 ? (
                  <ModalHelperText className="rounded-md border bg-muted px-3 py-2">
                    새 회사는 회사 화면에서 분야와 지역을 함께 등록해주세요.
                  </ModalHelperText>
                ) : null}
              </div>

              <div className="grid content-start gap-2">
                <DealEntitySearchField
                  emptyText="선택할 거래처가 없습니다."
                  errorMessage={errors.contactSearch?.message}
                  icon={IdCard}
                  id="deal-contact"
                  isLoading={contactOptionsQuery.isLoading}
                  label="거래처"
                  onClear={() => {
                    clearContact();
                  }}
                  onSearchChange={(value) => {
                    setValue("contactSearch", value, { shouldValidate: true });
                    setValue("contactId", "", { shouldValidate: true });
                  }}
                  onSelect={(option) => {
                    setValue("contactId", option.id, { shouldValidate: true });
                    setValue("contactSearch", option.name, {
                      shouldValidate: true,
                    });
                  }}
                  options={contactOptionsQuery.data ?? []}
                  placeholder="거래처 검색"
                  search={contactSearch}
                  selectedId={contactId}
                />

                {contactName && !contactId && !contactOptionsQuery.isFetching && !contactOptionsQuery.isError && (contactOptionsQuery.data?.length ?? 0) === 0 ? (
                  <ModalHelperText className="rounded-md border bg-muted px-3 py-2">
                    새 거래처는 거래처 화면에서 부서와 직급을 함께 등록해주세요.
                  </ModalHelperText>
                ) : null}
              </div>
            </ModalFormRow>

            <div className="grid gap-2">
              <DealEntitySearchField
                emptyText="선택할 제품이 없습니다."
                errorMessage={errors.productSearch?.message}
                icon={Package}
                id="deal-product"
                isLoading={productOptionsQuery.isLoading}
                label="제품"
                onClear={() => {
                  createProductMutation.reset();
                  setInlineProductUnitPrice("");
                  setInlineProductUnitPriceError(null);
                  setValue("productSearch", "", { shouldValidate: true });
                }}
                onSearchChange={(value) => {
                  createProductMutation.reset();
                  setInlineProductUnitPriceError(null);
                  setValue("productSearch", value, { shouldValidate: true });
                }}
                onSelect={(option) => {
                  createProductMutation.reset();
                  onProductSelect(option);
                }}
                options={productOptionsQuery.data ?? []}
                placeholder="제품 검색 후 추가"
                search={productSearch}
                selectedId=""
              />

              {canCreateProductInline ? (
                <ModalInlineCreateArea
                  actionLabel="새 제품 만들기"
                  disabled={!productName || Boolean(inlineProductUnitPriceError)}
                  errorMessage={
                    createProductMutation.error
                      ? getApiErrorMessage(createProductMutation.error)
                      : null
                  }
                  isPending={createProductMutation.isPending}
                  name={productName}
                  onCreate={onInlineProductCreate}
                  title="새 제품"
                >
                  <ModalFieldGroup
                    error={inlineProductUnitPriceError ?? undefined}
                    id="deal-inline-product-unit-price"
                    label="단가"
                    className="sm:w-40"
                  >
                    <input
                      aria-describedby={
                        inlineProductUnitPriceError
                          ? "deal-inline-product-unit-price-error"
                          : undefined
                      }
                      aria-invalid={Boolean(inlineProductUnitPriceError)}
                      className="h-9 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      id="deal-inline-product-unit-price"
                      inputMode="numeric"
                      onChange={(event) => {
                        setInlineProductUnitPrice(event.target.value);
                        setInlineProductUnitPriceError(null);
                      }}
                      value={inlineProductUnitPrice}
                    />
                  </ModalFieldGroup>
                </ModalInlineCreateArea>
              ) : null}

              {selectedProducts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map((product) => (
                    <span
                      className="inline-flex h-8 items-center gap-2 rounded-md border bg-muted px-2 text-sm"
                      key={product.id}
                    >
                      <span className="max-w-52 truncate">{product.name}</span>
                      <button
                        aria-label={`${product.name} 제품 제거`}
                        className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-white"
                        onClick={() => onProductRemove(product.id)}
                        type="button"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </ModalFormSection>

          <ModalFormSection
            description="현재 단계와 다음 행동을 빠르게 지정합니다."
            title="진행 상태"
          >
            <ModalFormRow columns={2}>
              <ModalFieldGroup id="deal-stage" label="단계">
                <select
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-stage"
                  {...register("stage")}
                >
                  <option value="INITIAL_CONTACT">초기 접촉</option>
                  <option value="NEEDS_ANALYSIS">니즈 확인</option>
                  <option value="PROPOSAL">제안/견적</option>
                  <option value="NEGOTIATION">협상</option>
                  <option value="WON">성사</option>
                  <option value="LOST">실패</option>
                </select>
              </ModalFieldGroup>

              <ModalFieldGroup id="deal-likelihood" label="가능성">
                <select
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-likelihood"
                  {...register("likelihoodStatus")}
                >
                  <option value="POSITIVE">긍정</option>
                  <option value="NEUTRAL">중립</option>
                  <option value="NEGATIVE">부정</option>
                </select>
              </ModalFieldGroup>
            </ModalFormRow>

            <ModalFormRow columns={2}>
              <ModalFieldGroup id="deal-next" label="다음 행동">
                <input
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-next"
                  {...register("nextActionText")}
                />
              </ModalFieldGroup>

              <ModalFieldGroup id="deal-next-due" label="다음 행동 일시">
                <input
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-next-due"
                  type="datetime-local"
                  {...register("nextActionDueAt")}
                />
              </ModalFieldGroup>
            </ModalFormRow>
          </ModalFormSection>

          <ModalAdvancedSection title="고급 옵션">
              <ModalFormRow columns={2}>
                <ModalFieldGroup id="deal-close-date" label="예상 종료일">
                  <input
                    className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    id="deal-close-date"
                    type="date"
                    {...register("expectedCloseDate")}
                  />
                </ModalFieldGroup>

                <ModalFieldGroup
                  error={errors.likelihoodPercent?.message}
                  id="deal-likelihood-percent"
                  label="가능성 %"
                >
                  <input
                    aria-describedby={
                      errors.likelihoodPercent
                        ? "deal-likelihood-percent-error"
                        : undefined
                    }
                    aria-invalid={Boolean(errors.likelihoodPercent)}
                    className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    id="deal-likelihood-percent"
                    inputMode="numeric"
                    {...register("likelihoodPercent")}
                  />
                </ModalFieldGroup>
              </ModalFormRow>

              <ModalFieldGroup id="deal-memo" label="첫 메모">
                <textarea
                  className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-memo"
                  {...register("initialMemo")}
                />
              </ModalFieldGroup>
          </ModalAdvancedSection>

            {createDealMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(createDealMutation.error)}
                title="딜 저장 실패"
                variant="inline"
              />
            ) : null}
        </ModalForm>
    </ModalShell>
  );
}

function canShowInlineCreate({
  search,
  selectedId,
  isFetching,
  isError,
}: {
  readonly search: string;
  readonly selectedId: string;
  readonly isFetching: boolean;
  readonly isError: boolean;
}) {
  return search.trim().length > 0 && !selectedId && !isFetching && !isError;
}

function parseOptionalUnitPrice(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  return Number(trimmed);
}

function formatInlineProductPrice(unitPrice: number | null) {
  return unitPrice === null ? "" : unitPrice.toLocaleString("ko-KR");
}
