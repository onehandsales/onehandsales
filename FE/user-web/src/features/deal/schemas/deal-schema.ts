// 기능 : 딜 생성/수정 form Zod 스키마 — Backend Deal API 계약 기준
import { z } from "zod";
import {
  DEAL_STATUS_LIST,
  type CreateDealInput,
  type DealStatus,
  type UpdateDealInput,
} from "@/features/deal/types/deal";

const dealStatusEnum = z.enum(
  DEAL_STATUS_LIST as [DealStatus, ...DealStatus[]]
);

const dealCostSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/,/g, ""))
  .refine((value) => value.length > 0, "금액을 입력해주세요.")
  .refine(
    (value) => /^\d+$/.test(value) && Number(value) >= 0,
    "금액은 0 이상의 정수입니다."
  );

const expectedEndDateSchema = z
  .string()
  .trim()
  .transform((value) => normalizeDateText(value))
  .refine((value) => value.length > 0, "예상 마감일을 입력해주세요.")
  .refine(
    (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
    "날짜 형식은 YYYY-MM-DD입니다."
  );

// 기능 : 딜 생성 form 스키마
export const dealCreateFormSchema = z.object({
  dealName: z.string().trim().min(1, "딜명을 입력해주세요."),
  dealCost: dealCostSchema,
  companyIds: z.array(z.string()).min(1, "회사를 선택해주세요."),
  contactIds: z.array(z.string()).min(1, "담당자를 선택해주세요."),
  productIds: z
    .array(z.string())
    .min(1, "제품을 1개 이상 선택해주세요."),
  dealStatus: dealStatusEnum,
  followingAction: z.string().trim().min(1, "다음 행동을 입력해주세요."),
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
  dealName: z.string().trim().min(1, "딜명을 입력해주세요."),
  dealCost: dealCostSchema,
  companyIds: z.array(z.string()).min(1, "회사를 선택해주세요."),
  contactIds: z.array(z.string()).min(1, "담당자를 선택해주세요."),
  productIds: z
    .array(z.string())
    .min(1, "제품을 1개 이상 선택해주세요."),
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
  followingAction: z.string().trim().min(1, "다음 행동을 입력해주세요."),
});

export type FollowingActionLogFormValues = z.infer<
  typeof followingActionLogFormSchema
>;

// 기능 : 메모 로그 생성/수정 form 스키마
export const memoLogFormSchema = z.object({
  memoType: z.string().trim().min(1, "메모 타입을 입력해주세요."),
  memo: z.string().trim().min(1, "메모 내용을 입력해주세요."),
});

export type MemoLogFormValues = z.infer<typeof memoLogFormSchema>;

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

function normalizeDateText(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

  return value;
}
