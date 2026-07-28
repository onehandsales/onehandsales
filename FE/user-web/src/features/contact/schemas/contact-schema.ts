import { z } from "zod";
import {
  APP_SUPPORTED_PHONE_COUNTRY_CODES,
  DEFAULT_APP_COUNTRY_CODE,
  normalizeAppPhoneCountryCode,
  type AppPhoneCountryCode,
} from "@/features/app-i18n";
import type {
  ContactDetail,
  CreateContactInput,
  UpdateContactInput,
  CreateContactMemoLogInput,
  UpdateContactMemoLogInput,
  CreateContactPrivateMemoLogInput,
  UpdateContactPrivateMemoLogInput,
} from "@/features/contact/types/contact";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactPhoneCountryCodeSchema = z.enum(APP_SUPPORTED_PHONE_COUNTRY_CODES, {
  error: "전화번호 국가를 선택해 주세요.",
});

const contactPhoneFieldSchema = {
  mobile: z.string().trim().optional(),
  phoneCountryCode: contactPhoneCountryCodeSchema,
  phoneNationalNumber: z
    .string()
    .trim()
    .min(1, "전화번호를 입력해 주세요."),
};

// 담당자 생성 폼 스키마
export const contactCreateFormSchema = z
  .object({
    username: z.string().trim().min(1, "이름을 입력해 주세요."),
    ...contactPhoneFieldSchema,
    email: z
      .string()
      .trim()
      .regex(emailPattern, "이메일 형식을 확인해 주세요."),
    companyId: z.string().trim().min(1, "회사를 선택해 주세요."),
    companySearch: z.string().trim().optional(),
    contactDepartmentId: z.string().trim().min(1, "부서를 선택해 주세요."),
    contactJobGradeId: z.string().trim().min(1, "직급을 선택해 주세요."),
    contactMemo: z.string().trim().optional(),
  })
  .superRefine(validateContactPhoneForm);

export type ContactCreateFormValues = z.infer<typeof contactCreateFormSchema>;

// 담당자 수정 폼 스키마
export const contactEditFormSchema = z
  .object({
    username: z.string().trim().min(1, "이름을 입력해 주세요."),
    ...contactPhoneFieldSchema,
    email: z
      .string()
      .trim()
      .regex(emailPattern, "이메일 형식을 확인해 주세요."),
    companyId: z.string().trim().min(1, "회사를 선택해 주세요."),
    companySearch: z.string().trim().optional(),
    contactDepartmentId: z.string().trim().min(1, "부서를 선택해 주세요."),
    contactJobGradeId: z.string().trim().min(1, "직급을 선택해 주세요."),
  })
  .superRefine(validateContactPhoneForm);

export type ContactEditFormValues = z.infer<typeof contactEditFormSchema>;

// 메모 로그 폼 스키마
export const contactMemoLogFormSchema = z.object({
  memoType: z.string().trim().min(1, "메모 유형을 입력해 주세요."),
  memo: z.string().trim().min(1, "메모를 입력해 주세요."),
});

export type ContactMemoLogFormValues = z.infer<typeof contactMemoLogFormSchema>;

// 개인 메모 로그 폼 스키마
export const contactPrivateMemoLogFormSchema = z.object({
  memo: z.string().trim().min(1, "개인 메모를 입력해 주세요."),
});

export type ContactPrivateMemoLogFormValues = z.infer<
  typeof contactPrivateMemoLogFormSchema
>;

// 기본값
export const emptyContactCreateFormValues: ContactCreateFormValues = {
  username: "",
  mobile: "",
  phoneCountryCode: DEFAULT_APP_COUNTRY_CODE,
  phoneNationalNumber: "",
  email: "",
  companyId: "",
  companySearch: "",
  contactDepartmentId: "",
  contactJobGradeId: "",
  contactMemo: "",
};

export const emptyContactMemoLogFormValues: ContactMemoLogFormValues = {
  memoType: "일반 메모",
  memo: "",
};

export const emptyContactPrivateMemoLogFormValues: ContactPrivateMemoLogFormValues =
  {
    memo: "",
  };

// 기능 : 담당자 상세 응답을 수정 폼 기본값으로 변환합니다.
export function toContactEditFormValues(
  contact: ContactDetail
): ContactEditFormValues {
  const phoneCountryCode = normalizeAppPhoneCountryCode(contact.phoneCountryCode);
  const phoneNationalNumber = resolveContactPhoneNationalNumber(
    phoneCountryCode,
    contact.phoneNationalNumber,
    contact.phoneE164,
    contact.phoneDisplay,
    contact.mobile
  );

  return {
    username: contact.username,
    mobile: toLegacyPhoneDisplay(phoneCountryCode, phoneNationalNumber),
    phoneCountryCode,
    phoneNationalNumber,
    email: contact.email,
    companyId: contact.company.id,
    companySearch: contact.company.companyName,
    contactDepartmentId: contact.contactDepartment.id,
    contactJobGradeId: contact.contactJobGrade.id,
  };
}

// 기능 : 담당자 생성 폼 값을 API 요청 값으로 변환합니다.
export function toCreateContactInput(
  values: ContactCreateFormValues
): CreateContactInput {
  const phone = toContactPhoneInput(values);

  return {
    username: values.username.trim(),
    mobile: phone.mobile,
    phoneCountryCode: phone.phoneCountryCode,
    phoneNationalNumber: phone.phoneNationalNumber,
    phoneE164: phone.phoneE164,
    email: values.email.trim(),
    companyId: values.companyId,
    contactDepartmentId: values.contactDepartmentId,
    contactJobGradeId: values.contactJobGradeId,
    contactMemo: optionalText(values.contactMemo),
  };
}

// 기능 : 담당자 수정 폼 값을 API 요청 값으로 변환합니다.
export function toUpdateContactInput(
  contactId: string,
  values: ContactEditFormValues
): UpdateContactInput {
  const phone = toContactPhoneInput(values);

  return {
    contactId,
    username: values.username.trim(),
    mobile: phone.mobile,
    phoneCountryCode: phone.phoneCountryCode,
    phoneNationalNumber: phone.phoneNationalNumber,
    phoneE164: phone.phoneE164,
    email: values.email.trim(),
    companyId: values.companyId,
    contactDepartmentId: values.contactDepartmentId,
    contactJobGradeId: values.contactJobGradeId,
  };
}

// 기능 : 메모 로그 생성 폼 값을 API 요청 값으로 변환합니다.
export function toCreateContactMemoLogInput(
  contactId: string,
  values: ContactMemoLogFormValues
): CreateContactMemoLogInput {
  return {
    contactId,
    memoType: values.memoType.trim(),
    memo: values.memo.trim(),
  };
}

// 기능 : 메모 로그 수정 폼 값을 API 요청 값으로 변환합니다.
export function toUpdateContactMemoLogInput(
  contactId: string,
  memoLogId: string,
  values: ContactMemoLogFormValues
): UpdateContactMemoLogInput {
  return {
    ...toCreateContactMemoLogInput(contactId, values),
    memoLogId,
  };
}

// 기능 : 개인 메모 로그 생성 폼 값을 API 요청 값으로 변환합니다.
export function toCreateContactPrivateMemoLogInput(
  contactId: string,
  values: ContactPrivateMemoLogFormValues
): CreateContactPrivateMemoLogInput {
  return {
    contactId,
    memo: values.memo.trim(),
  };
}

// 기능 : 개인 메모 로그 수정 폼 값을 API 요청 값으로 변환합니다.
export function toUpdateContactPrivateMemoLogInput(
  contactId: string,
  privateMemoLogId: string,
  values: ContactPrivateMemoLogFormValues
): UpdateContactPrivateMemoLogInput {
  return {
    ...toCreateContactPrivateMemoLogInput(contactId, values),
    privateMemoLogId,
  };
}

// 기능 : 빈 문자열을 API 요청에서 제외할 수 있는 undefined로 변환합니다.
function optionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}

// 기능 : 담당자 전화번호 국가별 national number 규칙을 폼 단계에서 검증합니다.
function validateContactPhoneForm(
  values: {
    readonly phoneCountryCode: AppPhoneCountryCode;
    readonly phoneNationalNumber: string;
  },
  context: z.RefinementCtx
) {
  const nationalNumber = normalizePhoneNationalNumber(
    values.phoneCountryCode,
    values.phoneNationalNumber
  );
  const isValid =
    values.phoneCountryCode === "KR"
      ? /^010\d{8}$/.test(nationalNumber)
      : /^[2-9]\d{2}[2-9]\d{6}$/.test(nationalNumber);

  if (!isValid) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        values.phoneCountryCode === "KR"
          ? "010으로 시작하는 11자리 번호를 입력해 주세요."
          : "미국 10자리 번호를 입력해 주세요.",
      path: ["phoneNationalNumber"],
    });
  }
}

// 기능 : 폼 전화번호 값을 backend Contact API 입력 구조로 변환합니다.
function toContactPhoneInput(values: {
  readonly phoneCountryCode: AppPhoneCountryCode;
  readonly phoneNationalNumber: string;
}) {
  const phoneCountryCode = values.phoneCountryCode;
  const phoneNationalNumber = normalizePhoneNationalNumber(
    phoneCountryCode,
    values.phoneNationalNumber
  );

  return {
    mobile: toLegacyPhoneDisplay(phoneCountryCode, phoneNationalNumber),
    phoneCountryCode,
    phoneNationalNumber,
    phoneE164: toPhoneE164(phoneCountryCode, phoneNationalNumber),
  };
}

// 기능 : 상세 응답의 신규 필드와 legacy 값을 폼 national number로 복원합니다.
function resolveContactPhoneNationalNumber(
  countryCode: AppPhoneCountryCode,
  ...values: ReadonlyArray<string | null | undefined>
) {
  for (const value of values) {
    const normalized = normalizePhoneNationalNumber(countryCode, value ?? "");

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

// 기능 : 국가별 전화번호 입력에서 숫자 national number를 추출합니다.
function normalizePhoneNationalNumber(
  countryCode: AppPhoneCountryCode,
  value: string
) {
  const digits = value.replace(/\D/g, "");

  if (countryCode === "KR" && digits.startsWith("82")) {
    return `0${digits.slice(2)}`;
  }

  if (countryCode === "US" && digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  return digits;
}

// 기능 : 국가별 national number를 E.164 문자열로 변환합니다.
function toPhoneE164(
  countryCode: AppPhoneCountryCode,
  nationalNumber: string
) {
  return countryCode === "KR"
    ? `+82${nationalNumber.slice(1)}`
    : `+1${nationalNumber}`;
}

// 기능 : legacy mobile 필드 호환을 위한 국가별 표시 문자열을 생성합니다.
function toLegacyPhoneDisplay(
  countryCode: AppPhoneCountryCode,
  nationalNumber: string
) {
  if (!nationalNumber) {
    return "";
  }

  if (countryCode === "KR") {
    return `${nationalNumber.slice(0, 3)}-${nationalNumber.slice(
      3,
      7
    )}-${nationalNumber.slice(7)}`;
  }

  return `${nationalNumber.slice(0, 3)}-${nationalNumber.slice(
    3,
    6
  )}-${nationalNumber.slice(6)}`;
}
