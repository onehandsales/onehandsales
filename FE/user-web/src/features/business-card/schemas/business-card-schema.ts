import { z } from "zod";
import type {
  BusinessCardScanLog,
  ConfirmBusinessCardScanInput,
} from "@/features/business-card/types/business-card";

export const BUSINESS_CARD_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const krMobilePattern = /^010-\d{4}-\d{4}$/;
const usPhonePattern = /^[2-9]\d{2}-[2-9]\d{2}-\d{4}$/;

export const businessCardConfirmSchema = z.object({
  companyName: z.string().trim().min(1, "회사명을 입력해 주세요.").max(160),
  companyFieldName: z.string().trim().max(120).optional(),
  companyRegionName: z.string().trim().max(120).optional(),
  contactName: z.string().trim().min(1, "담당자 이름을 입력해 주세요.").max(120),
  contactMobile: z
    .string()
    .trim()
    .refine(
      (value) => isSupportedBusinessCardPhone(value),
      "KR/US 전화번호 형식으로 입력해 주세요."
    ),
  contactEmail: z.string().trim().email("올바른 이메일 형식으로 입력해 주세요."),
  contactDepartmentName: z.string().trim().max(120).optional(),
  contactJobGradeName: z.string().trim().max(120).optional(),
});

export type BusinessCardConfirmFormValues = z.infer<
  typeof businessCardConfirmSchema
>;

export const emptyBusinessCardConfirmFormValues: BusinessCardConfirmFormValues = {
  companyName: "",
  companyFieldName: "",
  companyRegionName: "",
  contactName: "",
  contactMobile: "",
  contactEmail: "",
  contactDepartmentName: "",
  contactJobGradeName: "",
};

export function validateBusinessCardImage(file: File | null): string | null {
  if (!file) {
    return "명함 이미지 파일을 선택해 주세요.";
  }

  if (!allowedMimeTypes.has(file.type)) {
    return "JPG, PNG, WebP 이미지만 올릴 수 있어요.";
  }

  if (file.size > BUSINESS_CARD_MAX_FILE_SIZE_BYTES) {
    return "10MB 이하 이미지만 올릴 수 있어요.";
  }

  return null;
}

export function toConfirmFormValues(
  scanLog: BusinessCardScanLog
): BusinessCardConfirmFormValues {
  return {
    companyName: scanLog.extracted.companyName ?? "",
    companyFieldName: scanLog.extracted.companyFieldName ?? "",
    companyRegionName: scanLog.extracted.companyRegionName ?? "",
    contactName: scanLog.extracted.contactName ?? "",
    contactMobile: formatMobileNumber(scanLog.extracted.contactMobile ?? ""),
    contactEmail: scanLog.extracted.contactEmail ?? "",
    contactDepartmentName: scanLog.extracted.contactDepartmentName ?? "",
    contactJobGradeName: scanLog.extracted.contactJobGradeName ?? "",
  };
}

export function toConfirmInput(
  scanLogId: string,
  values: BusinessCardConfirmFormValues
): ConfirmBusinessCardScanInput {
  return {
    scanLogId,
    companyName: values.companyName.trim(),
    companyFieldName: toOptionalText(values.companyFieldName),
    companyRegionName: toOptionalText(values.companyRegionName),
    contactName: values.contactName.trim(),
    contactMobile: formatMobileNumber(values.contactMobile),
    contactEmail: values.contactEmail.trim(),
    contactDepartmentName: toOptionalText(values.contactDepartmentName),
    contactJobGradeName: toOptionalText(values.contactJobGradeName),
  };
}

export function formatMobileNumber(value: string) {
  const rawDigits = value.replace(/\D/g, "");
  const digits =
    rawDigits.length === 11 && rawDigits.startsWith("1")
      ? rawDigits.slice(1)
      : rawDigits.slice(0, 11);

  if (digits.length === 10 && !digits.startsWith("010")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// 기능 : 명함 보정 전화번호가 KR mobile 또는 US national number인지 확인합니다.
function isSupportedBusinessCardPhone(value: string) {
  const formatted = formatMobileNumber(value);

  return krMobilePattern.test(formatted) || usPhonePattern.test(formatted);
}

function toOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}
