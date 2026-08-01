import { z } from "zod";

export const sensitiveRawReasonMinLength = 10;
export const sensitiveRawReasonMaxLength = 1000;

// 기능 : 민감 원문 조회 사유 입력값의 10~1000자 정책을 검증합니다.
export const sensitiveRawAccessReasonSchema = z
  .string()
  .trim()
  .min(sensitiveRawReasonMinLength, "사유는 10자 이상 입력해 주세요")
  .max(sensitiveRawReasonMaxLength, "사유는 1000자 이하로 입력해 주세요");

// 기능 : 민감 원문 조회 사유를 검증하고 정규화된 문자열을 반환합니다.
export function parseSensitiveRawAccessReason(reason: string): string {
  return sensitiveRawAccessReasonSchema.parse(reason);
}
