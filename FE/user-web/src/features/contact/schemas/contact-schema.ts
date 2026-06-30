import { z } from "zod";
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
const mobilePattern = /^010-\d{4}-\d{4}$/;

// 담당자 생성 폼 스키마
export const contactCreateFormSchema = z.object({
  username: z.string().trim().min(1, "이름을 입력해 주세요."),
  mobile: z
    .string()
    .trim()
    .regex(mobilePattern, "010-0000-0000 형식으로 입력해 주세요."),
  email: z
    .string()
    .trim()
    .regex(emailPattern, "이메일 형식을 확인해 주세요."),
  companyId: z.string().trim().min(1, "회사를 선택해 주세요."),
  companySearch: z.string().trim().optional(),
  contactDepartmentId: z.string().trim().min(1, "부서를 선택해 주세요."),
  contactJobGradeId: z.string().trim().min(1, "직급을 선택해 주세요."),
  contactMemo: z.string().trim().optional(),
});

export type ContactCreateFormValues = z.infer<typeof contactCreateFormSchema>;

// 담당자 수정 폼 스키마
export const contactEditFormSchema = z.object({
  username: z.string().trim().min(1, "이름을 입력해 주세요."),
  mobile: z
    .string()
    .trim()
    .regex(mobilePattern, "010-0000-0000 형식으로 입력해 주세요."),
  email: z
    .string()
    .trim()
    .regex(emailPattern, "이메일 형식을 확인해 주세요."),
  companyId: z.string().trim().min(1, "회사를 선택해 주세요."),
  companySearch: z.string().trim().optional(),
  contactDepartmentId: z.string().trim().min(1, "부서를 선택해 주세요."),
  contactJobGradeId: z.string().trim().min(1, "직급을 선택해 주세요."),
});

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
  return {
    username: contact.username,
    mobile: contact.mobile,
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
  return {
    username: values.username.trim(),
    mobile: values.mobile.trim(),
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
  return {
    contactId,
    username: values.username.trim(),
    mobile: values.mobile.trim(),
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
