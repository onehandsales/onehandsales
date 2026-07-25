// 기능 : 딜 생성/수정 form Zod 스키마 — Backend Deal API 계약 기준
import { z } from "zod";
import {
  DEAL_STATUS_LIST,
  MANUAL_DEAL_ACTIVITY_TYPES,
  type CreateDealInput,
  type DealStatus,
  type ManualDealActivityType,
  type CreateManualDealActivityInput,
  type UpdateManualDealActivityInput,
  type UpdateDealInput,
} from "@/features/deal/types/deal";

const dealStatusEnum = z.enum(
  DEAL_STATUS_LIST as [DealStatus, ...DealStatus[]]
);

const manualDealActivityTypeEnum = z.enum(
  MANUAL_DEAL_ACTIVITY_TYPES as unknown as [
    ManualDealActivityType,
    ...ManualDealActivityType[],
  ]
);

const dealCostSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/,/g, ""))
  .refine((value) => value.length > 0, "금액을 입력해 주세요.")
  .refine(
    (value) => /^\d+$/.test(value) && Number(value) >= 0,
    "금액은 0 이상의 정수로 입력해 주세요."
  );

const expectedEndDateSchema = z
  .string()
  .trim()
  .transform((value) => normalizeDateText(value))
  .refine((value) => value.length > 0, "예상 마감일을 입력해 주세요.")
  .refine(
    (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
    "날짜는 YYYY-MM-DD 형식으로 입력해 주세요."
  );

// 기능 : 딜 생성 form 스키마
export const dealCreateFormSchema = z.object({
  dealName: z.string().trim().min(1, "딜이름을 입력해 주세요."),
  dealCost: dealCostSchema,
  companyIds: z.array(z.string()).min(1, "회사를 선택해 주세요."),
  contactIds: z.array(z.string()).min(1, "담당자를 선택해 주세요."),
  productIds: z
    .array(z.string())
    .min(1, "제품을 1개 이상 선택해 주세요."),
  dealStatus: dealStatusEnum,
  followingAction: z.string().trim().min(1, "다음 행동을 입력해 주세요."),
  expectedEndDate: expectedEndDateSchema,
  dealMemo: z.string().trim().optional(),
  // UI 전용 search 필드
  companySearch: z.string().optional(),
  contactSearch: z.string().optional(),
  productSearch: z.string().optional(),
});

export type DealCreateFormValues = z.infer<typeof dealCreateFormSchema>;

// 기능 : 딜 수정 form 스키마
export const dealUpdateFormSchema = z.object({
  dealName: z.string().trim().min(1, "딜이름을 입력해 주세요."),
  dealCost: dealCostSchema,
  companyIds: z.array(z.string()).min(1, "회사를 선택해 주세요."),
  contactIds: z.array(z.string()).min(1, "담당자를 선택해 주세요."),
  productIds: z
    .array(z.string())
    .min(1, "제품을 1개 이상 선택해 주세요."),
  dealStatus: dealStatusEnum,
  expectedEndDate: expectedEndDateSchema,
  // UI 전용 search 필드
  companySearch: z.string().optional(),
  contactSearch: z.string().optional(),
  productSearch: z.string().optional(),
});

export type DealUpdateFormValues = z.infer<typeof dealUpdateFormSchema>;

// 기능 : 다음 행동 로그 생성 form 스키마
export const followingActionLogFormSchema = z.object({
  followingAction: z.string().trim().min(1, "다음 행동을 입력해 주세요."),
});

export type FollowingActionLogFormValues = z.infer<
  typeof followingActionLogFormSchema
>;

// 기능 : 메모 로그 생성/수정 form 스키마
export const memoLogFormSchema = z.object({
  memoType: z.string().trim().min(1, "메모 타입을 입력해 주세요."),
  memo: z.string().trim().min(1, "메모 내용을 입력해 주세요."),
});

export type MemoLogFormValues = z.infer<typeof memoLogFormSchema>;

// 기능 : 수동 딜 활동 생성/수정 form 스키마
export const manualDealActivityFormSchema = z.object({
  activityType: manualDealActivityTypeEnum,
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력해 주세요.")
    .max(120, "제목은 120자 이하로 입력해 주세요."),
  body: z
    .string()
    .trim()
    .max(2000, "내용은 2000자 이하로 입력해 주세요.")
    .optional(),
  occurredAt: z
    .string()
    .trim()
    .min(1, "발생 시각을 입력해 주세요.")
    .refine(isValidLocalDateTime, "발생 시각을 확인해 주세요.")
    .refine(
      (value) => new Date(value).getTime() <= Date.now(),
      "발생 시각은 현재보다 미래로 설정할 수 없어요."
    ),
});

export type ManualDealActivityFormValues = z.infer<
  typeof manualDealActivityFormSchema
>;

// 기능 : form 값 → CreateDealInput 변환
export function toCreateDealInput(values: DealCreateFormValues): CreateDealInput {
  return {
    dealName: values.dealName,
    dealCost: Number(values.dealCost),
    companyIds: values.companyIds,
    contactIds: values.contactIds,
    productIds: values.productIds,
    dealStatus: values.dealStatus,
    followingAction: values.followingAction,
    expectedEndDate: values.expectedEndDate,
    dealMemo: values.dealMemo?.trim() || undefined,
  };
}

// 기능 : form 값 → UpdateDealInput 변환
export function toUpdateDealInput(
  dealId: string,
  values: DealUpdateFormValues
): UpdateDealInput {
  return {
    dealId,
    dealName: values.dealName,
    dealCost: Number(values.dealCost),
    companyIds: values.companyIds,
    contactIds: values.contactIds,
    productIds: values.productIds,
    dealStatus: values.dealStatus,
    expectedEndDate: values.expectedEndDate,
  };
}

// 기능 : 수동 activity form 값 → 생성 request body 변환
export function toCreateManualDealActivityInput(
  dealId: string,
  values: ManualDealActivityFormValues
): CreateManualDealActivityInput {
  return {
    dealId,
    activityType: values.activityType,
    title: values.title.trim(),
    body: normalizeOptionalText(values.body),
    occurredAt: toUtcInstant(values.occurredAt),
  };
}

// 기능 : 수동 activity form 값 → 수정 request body 변환
export function toUpdateManualDealActivityInput(
  dealId: string,
  activityId: string,
  values: ManualDealActivityFormValues
): UpdateManualDealActivityInput {
  return {
    dealId,
    activityId,
    activityType: values.activityType,
    title: values.title.trim(),
    body: normalizeOptionalText(values.body),
    occurredAt: toUtcInstant(values.occurredAt),
  };
}

export const emptyDealCreateFormValues: DealCreateFormValues = {
  dealName: "",
  dealCost: "",
  companyIds: [],
  contactIds: [],
  productIds: [],
  dealStatus: "INITIAL_CONTACT",
  followingAction: "",
  expectedEndDate: "",
  dealMemo: "",
  companySearch: "",
  contactSearch: "",
  productSearch: "",
};

// 기능 : 수동 activity form의 기본값을 현재 시각 기준으로 만듭니다.
export function createEmptyManualDealActivityFormValues(): ManualDealActivityFormValues {
  return {
    activityType: "NOTE",
    title: "",
    body: "",
    occurredAt: toLocalDateTimeInputValue(),
  };
}

// 기능 : UTC instant를 datetime-local input 값으로 변환합니다.
export function toLocalDateTimeInputValue(value?: string | null) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function normalizeDateText(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

  return value;
}

function isValidLocalDateTime(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

function toUtcInstant(value: string) {
  return new Date(value).toISOString();
}

function normalizeOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}
