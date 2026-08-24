import { z } from "zod";

// 기능 : 지원 요청 form Zod 스키마입니다.
export const supportRequestFormSchema = z.object({
  type: z.enum([
    "FEATURE_QUESTION",
    "PRICING_QUESTION",
    "PHONE_CONSULTATION",
    "FEATURE_SUGGESTION",
    "OTHER",
  ]),
  description: z
    .string()
    .trim()
    .min(1, "문의 내용을 입력해 주세요.")
    .max(1000, "문의 내용은 1000자 이하로 입력해 주세요."),
});

export type SupportRequestFormValues = z.infer<
  typeof supportRequestFormSchema
>;
