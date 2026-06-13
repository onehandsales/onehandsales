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

// 기능 : 딜 생성 form 스키마
export const dealCreateFormSchema = z.object({
  dealName: z.string().trim().min(1, "딜명을 입력해주세요."),
  dealCost: z
    .string()
    .trim()
    .min(1, "금액을 입력해주세요.")
    .refine((v) => /^\d+$/.test(v) && Number(v) >= 0, "금액은 0 이상의 정수입니다."),
  companyId: z.string().trim().min(1, "회사를 선택해주세요."),
  contactId: z.string().trim().min(1, "거래처를 선택해주세요."),
  productIds: z
    .array(z.string())
    .min(1, "제품을 1개 이상 선택해주세요."),
  dealStatus: dealStatusEnum,
  followingAction: z.string().trim().min(1, "다음 행동을 입력해주세요."),
  expectedEndDate: z
    .string()
    .trim()
    .min(1, "예상 마감일을 입력해주세요.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD입니다."),
  // UI 전용 search 필드
  companySearch: z.string().optional(),
  contactSearch: z.string().optional(),
  productSearch: z.string().optional(),
});

export type DealCreateFormValues = z.infer<typeof dealCreateFormSchema>;

// 기능 : 딜 수정 form 스키마
export const dealUpdateFormSchema = z.object({
  dealName: z.string().trim().min(1, "딜명을 입력해주세요."),
  dealCost: z
    .string()
    .trim()
    .min(1, "금액을 입력해주세요.")
    .refine((v) => /^\d+$/.test(v) && Number(v) >= 0, "금액은 0 이상의 정수입니다."),
  companyId: z.string().trim().min(1, "회사를 선택해주세요."),
  contactId: z.string().trim().min(1, "거래처를 선택해주세요."),
  productIds: z
    .array(z.string())
    .min(1, "제품을 1개 이상 선택해주세요."),
  dealStatus: dealStatusEnum,
  expectedEndDate: z
    .string()
    .trim()
    .min(1, "예상 마감일을 입력해주세요.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD입니다."),
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
    companyId: values.companyId,
    contactId: values.contactId,
    productIds: values.productIds,
    dealStatus: values.dealStatus,
    followingAction: values.followingAction,
    expectedEndDate: values.expectedEndDate,
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
    companyId: values.companyId,
    contactId: values.contactId,
    productIds: values.productIds,
    dealStatus: values.dealStatus,
    expectedEndDate: values.expectedEndDate,
  };
}

export const emptyDealCreateFormValues: DealCreateFormValues = {
  dealName: "",
  dealCost: "",
  companyId: "",
  contactId: "",
  productIds: [],
  dealStatus: "INITIAL_CONTACT",
  followingAction: "",
  expectedEndDate: "",
  companySearch: "",
  contactSearch: "",
  productSearch: "",
};
