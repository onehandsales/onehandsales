import { z } from "zod";
import type {
  CreateDealActivityInput,
  CreateDealInput,
  DealLikelihoodStatus,
  DealStage,
  SnoozeDealNextActionInput,
} from "@/features/deal/types/deal";

const currencyPattern = /^[A-Za-z]{3}$/;

export const dealFormSchema = z
  .object({
    title: z.string().trim().min(1, "딜명을 입력해주세요."),
    amount: z
      .string()
      .trim()
      .min(1, "금액을 입력해주세요.")
      .refine((value) => /^\d+$/.test(value), "금액은 0 이상의 정수입니다."),
    currency: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || currencyPattern.test(value),
        "통화는 KRW처럼 3자리 코드로 입력해주세요."
      ),
    companyId: z.string().trim().optional(),
    companySearch: z.string().trim().optional(),
    contactId: z.string().trim().optional(),
    contactSearch: z.string().trim().optional(),
    productIds: z.array(z.string()).optional(),
    productSearch: z.string().trim().optional(),
    stage: z.enum(["INITIAL_CONTACT", "NEEDS_ANALYSIS", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
    likelihoodStatus: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
    likelihoodPercent: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || /^\d+$/.test(value),
        "가능성 퍼센트는 0에서 100 사이의 정수입니다."
      )
      .refine(
        (value) =>
          value.length === 0 || (Number(value) >= 0 && Number(value) <= 100),
        "가능성 퍼센트는 0에서 100 사이의 정수입니다."
      )
      .optional(),
    nextActionText: z.string().trim().optional(),
    nextActionDueAt: z.string().trim().optional(),
    expectedCloseDate: z.string().trim().optional(),
    initialMemo: z.string().trim().optional(),
  })
  .superRefine((values, context) => {
    assertSearchSelection(
      values.companySearch,
      values.companyId,
      "companySearch",
      "회사 검색 결과에서 선택하거나 입력값을 지워주세요.",
      context
    );
    assertSearchSelection(
      values.contactSearch,
      values.contactId,
      "contactSearch",
      "거래처 검색 결과에서 선택하거나 입력값을 지워주세요.",
      context
    );
    assertSearchSelection(
      values.productSearch,
      "",
      "productSearch",
      "제품 검색 결과에서 선택하거나 입력값을 지워주세요.",
      context
    );
  });

export type DealFormValues = z.infer<typeof dealFormSchema>;

export const dealActivityFormSchema = z.object({
  occurredAt: z.string().trim().min(1, "활동 시간을 입력해주세요."),
  title: z.string().trim().min(1, "활동 제목을 입력해주세요."),
  content: z.string().trim().optional(),
});

export type DealActivityFormValues = z.infer<typeof dealActivityFormSchema>;

export const dealSnoozeFormSchema = z.object({
  nextActionDueAt: z.string().trim().min(1, "미룰 일시를 입력해주세요."),
  reason: z.string().trim().optional(),
});

export type DealSnoozeFormValues = z.infer<typeof dealSnoozeFormSchema>;

export const emptyDealFormValues: DealFormValues = {
  title: "",
  amount: "",
  currency: "KRW",
  companyId: "",
  companySearch: "",
  contactId: "",
  contactSearch: "",
  productIds: [],
  productSearch: "",
  stage: "INITIAL_CONTACT",
  likelihoodStatus: "NEUTRAL",
  likelihoodPercent: "",
  nextActionText: "",
  nextActionDueAt: "",
  expectedCloseDate: "",
  initialMemo: "",
};

export function toCreateDealInput(values: DealFormValues): CreateDealInput {
  return {
    title: values.title.trim(),
    companyId: optionalText(values.companyId),
    contactId: optionalText(values.contactId),
    amount: Number(values.amount),
    currency: normalizeCurrency(values.currency),
    stage: values.stage as DealStage,
    likelihoodStatus: values.likelihoodStatus as DealLikelihoodStatus,
    likelihoodPercent: optionalNumber(values.likelihoodPercent),
    expectedCloseDate: optionalDate(values.expectedCloseDate),
    nextActionText: optionalText(values.nextActionText),
    nextActionDueAt: optionalDateTime(values.nextActionDueAt),
    productIds: values.productIds ?? [],
    initialMemo: optionalText(values.initialMemo),
  };
}

export function toCreateDealActivityInput(
  dealId: string,
  values: DealActivityFormValues
): CreateDealActivityInput {
  return {
    dealId,
    occurredAt: toIsoDateTime(values.occurredAt),
    title: values.title.trim(),
    content: optionalText(values.content),
  };
}

export function toSnoozeDealNextActionInput(
  dealId: string,
  values: DealSnoozeFormValues
): SnoozeDealNextActionInput {
  return {
    dealId,
    nextActionDueAt: toIsoDateTime(values.nextActionDueAt),
    reason: optionalText(values.reason),
  };
}

export function toDateTimeLocalValue(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const offsetMs = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function assertSearchSelection(
  search: string | undefined,
  selectedId: string | undefined,
  path: string,
  message: string,
  context: z.RefinementCtx
) {
  if ((search?.trim() ?? "").length > 0 && !selectedId) {
    context.addIssue({ code: "custom", message, path: [path] });
  }
}

function optionalText(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalNumber(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? Number(trimmed) : undefined;
}

function normalizeCurrency(value: string | undefined | null) {
  const trimmed = value?.trim().toUpperCase() ?? "";

  return trimmed.length > 0 ? trimmed : "KRW";
}

function optionalDate(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0
    ? new Date(`${trimmed}T00:00:00`).toISOString()
    : undefined;
}

function optionalDateTime(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? new Date(trimmed).toISOString() : undefined;
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}
