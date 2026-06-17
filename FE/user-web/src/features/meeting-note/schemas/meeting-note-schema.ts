import { z } from "zod";
import type {
  CreateMeetingNoteInput,
  MeetingNote,
  UpdateMeetingNoteInput,
} from "@/features/meeting-note/types/meeting-note";

export const meetingNoteFormSchema = z.object({
  meetingLocalDateTime: z.string().trim().min(1, "미팅 일시를 선택해주세요."),
  companyName: z.string().trim().min(1, "회사명을 입력해주세요.").max(300),
  companyField: z.string().max(200).optional(),
  companyRegion: z.string().max(200).optional(),
  contactUsername: z.string().trim().min(1, "담당자명을 입력해주세요.").max(200),
  contactEmail: z.string().max(300).optional(),
  contactMobile: z.string().max(100).optional(),
  department: z.string().max(200).optional(),
  jobGrade: z.string().max(200).optional(),
  productName: z.string().max(300).optional(),
  productPrice: z
    .string()
    .refine(
      (value) =>
        value.trim().length === 0 ||
        (Number.isInteger(Number(value)) && Number(value) >= 0),
      "제품 금액은 0 이상의 정수로 입력해주세요."
    )
    .optional(),
  productCategory: z.string().max(200).optional(),
  productStatus: z.string().max(200).optional(),
  dealId: z.string().optional(),
  dealSearch: z.string().optional(),
  details: z.string().trim().min(1, "상세 내용을 입력해주세요.").max(10000),
  nextPlan: z.string().max(2000).optional(),
  requiredAction: z.string().max(2000).optional(),
});

export type MeetingNoteFormValues = z.infer<typeof meetingNoteFormSchema>;

export const emptyMeetingNoteFormValues: MeetingNoteFormValues = {
  meetingLocalDateTime: toDateTimeLocalInputValue(new Date()),
  companyName: "",
  companyField: "",
  companyRegion: "",
  contactUsername: "",
  contactEmail: "",
  contactMobile: "",
  department: "",
  jobGrade: "",
  productName: "",
  productPrice: "",
  productCategory: "",
  productStatus: "",
  dealId: "",
  dealSearch: "",
  details: "",
  nextPlan: "",
  requiredAction: "",
};

// 기능 : 회의록 form 값을 생성 request body로 변환합니다.
export const meetingNoteCreateFormSchema = z.object({
  meetingLocalDateTime: z.string().trim().min(1, "미팅 일시를 선택해주세요."),
  companyIds: z.array(z.string()).min(1, "회사를 1개 이상 선택해주세요."),
  contactIds: z.array(z.string()).min(1, "담당자를 1명 이상 선택해주세요."),
  productIds: z.array(z.string()).optional(),
  dealIds: z.array(z.string()).optional(),
  details: z.string().trim().min(1, "상세 내용을 입력해주세요.").max(10000),
  nextPlan: z.string().max(2000).optional(),
  requiredAction: z.string().max(2000).optional(),
});

export type MeetingNoteCreateFormValues = z.infer<
  typeof meetingNoteCreateFormSchema
>;

export const emptyMeetingNoteCreateFormValues: MeetingNoteCreateFormValues = {
  meetingLocalDateTime: toDateTimeLocalInputValue(new Date()),
  companyIds: [],
  contactIds: [],
  productIds: [],
  dealIds: [],
  details: "",
  nextPlan: "",
  requiredAction: "",
};

export function toCreateMeetingNoteInput(
  values: MeetingNoteCreateFormValues
): CreateMeetingNoteInput {
  return {
    sourceType: "MANUAL",
    meetingLocalDateTime: values.meetingLocalDateTime.trim(),
    details: values.details.trim(),
    nextPlan: toOptionalText(values.nextPlan),
    requiredAction: toOptionalText(values.requiredAction),
    companies: values.companyIds,
    contacts: values.contactIds,
    products: values.productIds?.length ? values.productIds : undefined,
    deals: values.dealIds?.length ? values.dealIds : undefined,
  };
}

// 기능 : 회의록 form 값을 수정 request body로 변환합니다.
export function toUpdateMeetingNoteInput(
  meetingNoteId: string,
  values: MeetingNoteFormValues
): UpdateMeetingNoteInput {
  const product = toProductInput(values);
  const dealId = toOptionalText(values.dealId);

  return {
    meetingNoteId,
    sourceType: "MANUAL",
    meetingLocalDateTime: values.meetingLocalDateTime.trim(),
    details: values.details.trim(),
    nextPlan: toOptionalText(values.nextPlan),
    requiredAction: toOptionalText(values.requiredAction),
    companies: [
      {
        companyName: values.companyName.trim(),
        companyField: toOptionalText(values.companyField),
        companyRegion: toOptionalText(values.companyRegion),
      },
    ],
    contacts: [
      {
        contactUsername: values.contactUsername.trim(),
        contactEmail: toOptionalText(values.contactEmail),
        contactMobile: toOptionalText(values.contactMobile),
        companyName: values.companyName.trim(),
        department: toOptionalText(values.department),
        jobGrade: toOptionalText(values.jobGrade),
      },
    ],
    products: product ? [product] : [],
    deals: dealId ? [{ dealId }] : [],
  };
}

// 기능 : 회의록 상세 응답을 form 초기값으로 변환합니다.
export function toMeetingNoteFormValues(
  meetingNote: MeetingNote | null
): MeetingNoteFormValues {
  if (!meetingNote) {
    return emptyMeetingNoteFormValues;
  }

  const company = meetingNote.companies[0];
  const contact = meetingNote.contacts[0];
  const product = meetingNote.products[0];
  const deal = meetingNote.deals[0];

  return {
    meetingLocalDateTime:
      meetingNote.meetingLocalDateTime?.slice(0, 16) ??
      emptyMeetingNoteFormValues.meetingLocalDateTime,
    companyName: company?.companyNameSnapshot ?? "",
    companyField: company?.companyFieldSnapshot ?? "",
    companyRegion: company?.companyRegionSnapshot ?? "",
    contactUsername: contact?.contactUsernameSnapshot ?? "",
    contactEmail: contact?.contactEmailSnapshot ?? "",
    contactMobile: contact?.contactMobileSnapshot ?? "",
    department: contact?.departmentSnapshot ?? "",
    jobGrade: contact?.jobGradeSnapshot ?? "",
    productName: product?.productNameSnapshot ?? "",
    productPrice:
      product?.productPriceSnapshot !== null &&
      product?.productPriceSnapshot !== undefined
        ? String(product.productPriceSnapshot)
        : "",
    productCategory: product?.productCategorySnapshot ?? "",
    productStatus: product?.productStatusSnapshot ?? "",
    dealId: deal?.dealId ?? "",
    dealSearch: deal?.dealNameSnapshot ?? "",
    details: meetingNote.details,
    nextPlan: meetingNote.nextPlan ?? "",
    requiredAction: meetingNote.requiredAction ?? "",
  };
}

// 기능 : 제품 관련 form 값을 선택 입력으로 변환합니다.
function toProductInput(values: MeetingNoteFormValues) {
  const productName = toOptionalText(values.productName);

  if (!productName) {
    return null;
  }

  return {
    productName,
    productPrice: toOptionalNumber(values.productPrice),
    productCategory: toOptionalText(values.productCategory),
    productStatus: toOptionalText(values.productStatus),
  };
}

// 기능 : 문자열 입력을 trim하고 빈 값이면 undefined로 변환합니다.
function toOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}

// 기능 : 선택 숫자 문자열을 숫자 또는 undefined로 변환합니다.
function toOptionalNumber(value: string | undefined) {
  const text = toOptionalText(value);

  if (!text) {
    return undefined;
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : undefined;
}

// 기능 : Date 값을 datetime-local input 값으로 변환합니다.
function toDateTimeLocalInputValue(value: Date) {
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  const local = new Date(value.getTime() - offsetMs);

  return local.toISOString().slice(0, 16);
}
