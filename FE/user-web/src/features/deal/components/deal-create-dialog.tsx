// 기능 : 딜 빠른 등록 모달 — Backend Deal API 생성 계약 기준
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, HandCoins, IdCard, Package, X } from "lucide-react";
import { useEffect, useState } from "react";
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
import { DEAL_STATUS_LABEL, DEAL_STATUS_LIST, type DealDetail } from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";

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

  useEffect(() => {
    if (open) {
      reset(emptyDealCreateFormValues);
      setSelectedProductIds([]);
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

  const onSubmit = handleSubmit(async (values) => {
    const deal = await createDealMutation.mutateAsync(toCreateDealInput(values));
    onCreated(deal);
    onOpenChange(false);
  });

  const companyOptions = companyOptionsQuery.data ?? [];
  const contactOptions = (contactOptionsQuery.data ?? []).filter(
    (c) => !selectedCompanyId || true // 모든 거래처 표시 (BE에서 validate)
  );
  const productOptions = productOptionsQuery.data ?? [];

  return (
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
                <HandCoins className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  aria-invalid={Boolean(errors.dealCost)}
                  className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-cost"
                  inputMode="numeric"
                  {...register("dealCost")}
                />
              </div>
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        {/* 연결 대상 */}
        <ModalFormSection description="회사, 거래처, 제품을 선택합니다." title="연결 대상">
          <ModalFormRow columns={2}>
            {/* 회사 */}
            <ModalFieldGroup error={errors.companyId?.message} id="deal-company" label="회사">
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  aria-invalid={Boolean(errors.companyId)}
                  className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-company"
                  {...register("companyId")}
                >
                  <option value="">회사 선택</option>
                  {companyOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </ModalFieldGroup>

            {/* 거래처 */}
            <ModalFieldGroup error={errors.contactId?.message} id="deal-contact" label="거래처">
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  aria-invalid={Boolean(errors.contactId)}
                  className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-contact"
                  {...register("contactId")}
                >
                  <option value="">거래처 선택</option>
                  {contactOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              {selectedContactId && (
                <button
                  className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setValue("contactId", "", { shouldValidate: true })}
                  type="button"
                >
                  <X className="h-3 w-3" /> 선택 해제
                </button>
              )}
            </ModalFieldGroup>
          </ModalFormRow>

          {/* 제품 다중 선택 */}
          <ModalFieldGroup error={errors.productIds?.message} id="deal-products" label="제품 (1개 이상)">
            <div className="flex flex-wrap gap-2 rounded-md border p-3">
              {productOptions.length === 0 && !productOptionsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">등록된 제품이 없습니다.</p>
              ) : (
                productOptions.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <button
                      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-white text-muted-foreground hover:bg-muted"
                      }`}
                      key={p.id}
                      onClick={() => onProductToggle(p.id)}
                      type="button"
                    >
                      <Package className="h-3.5 w-3.5" />
                      {p.productName}
                    </button>
                  );
                })
              )}
            </div>
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
              <input
                aria-invalid={Boolean(errors.expectedEndDate)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="deal-end-date"
                type="date"
                {...register("expectedEndDate")}
              />
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
  );
}
