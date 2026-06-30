import { z } from "zod";
import type {
  CompanyDetail,
  CreateCompanyFieldInput,
  CreateCompanyInput,
  CreateCompanyMemoLogInput,
  CreateCompanyPrivateMemoLogInput,
  CreateCompanyRegionInput,
  UpdateCompanyInput,
  UpdateCompanyMemoLogInput,
  UpdateCompanyPrivateMemoLogInput,
} from "@/features/company/types/company";

export const companyCreateFormSchema = z.object({
  companyName: z.string().trim().min(1, "회사명을 입력해 주세요."),
  companyFieldId: z.string().trim().min(1, "분야를 선택해 주세요."),
  companyRegionId: z.string().trim().min(1, "지역을 선택해 주세요."),
  companyMemo: z.string().trim().optional(),
});

export type CompanyCreateFormValues = z.infer<typeof companyCreateFormSchema>;

export const companyEditFormSchema = z.object({
  companyName: z.string().trim().min(1, "회사명을 입력해 주세요."),
  companyFieldId: z.string().trim().min(1, "분야를 선택해 주세요."),
  companyRegionId: z.string().trim().min(1, "지역을 선택해 주세요."),
});

export type CompanyEditFormValues = z.infer<typeof companyEditFormSchema>;

export const companyTaxonomyFormSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
});

export type CompanyTaxonomyFormValues = z.infer<typeof companyTaxonomyFormSchema>;

export const companyMemoLogFormSchema = z.object({
  memoType: z.string().trim().min(1, "메모 유형을 입력해 주세요."),
  memo: z.string().trim().min(1, "메모를 입력해 주세요."),
});

export type CompanyMemoLogFormValues = z.infer<typeof companyMemoLogFormSchema>;

export const companyPrivateMemoLogFormSchema = z.object({
  memo: z.string().trim().min(1, "개인 메모를 입력해 주세요."),
});

export type CompanyPrivateMemoLogFormValues = z.infer<
  typeof companyPrivateMemoLogFormSchema
>;

export const emptyCompanyCreateFormValues: CompanyCreateFormValues = {
  companyName: "",
  companyFieldId: "",
  companyRegionId: "",
  companyMemo: "",
};

export const emptyCompanyTaxonomyFormValues: CompanyTaxonomyFormValues = {
  name: "",
};

export const emptyCompanyMemoLogFormValues: CompanyMemoLogFormValues = {
  memoType: "일반 메모",
  memo: "",
};

export const emptyCompanyPrivateMemoLogFormValues: CompanyPrivateMemoLogFormValues =
  {
    memo: "",
  };

// 기능 : 회사 상세 응답을 수정 폼 기본값으로 변환합니다.
export function toCompanyEditFormValues(
  company: CompanyDetail
): CompanyEditFormValues {
  return {
    companyName: company.companyName,
    companyFieldId: company.companyField.id,
    companyRegionId: company.companyRegion.id,
  };
}

// 기능 : 회사 생성 폼 값을 API 요청 값으로 변환합니다.
export function toCreateCompanyInput(
  values: CompanyCreateFormValues
): CreateCompanyInput {
  return {
    companyName: values.companyName.trim(),
    companyFieldId: values.companyFieldId,
    companyRegionId: values.companyRegionId,
    companyMemo: optionalText(values.companyMemo),
  };
}

// 기능 : 회사 수정 폼 값을 API 요청 값으로 변환합니다.
export function toUpdateCompanyInput(
  companyId: string,
  values: CompanyEditFormValues
): UpdateCompanyInput {
  return {
    companyId,
    companyName: values.companyName.trim(),
    companyFieldId: values.companyFieldId,
    companyRegionId: values.companyRegionId,
  };
}

// 기능 : 분야 생성 폼 값을 API 요청 값으로 변환합니다.
export function toCreateCompanyFieldInput(
  values: CompanyTaxonomyFormValues
): CreateCompanyFieldInput {
  return {
    field: values.name.trim(),
  };
}

// 기능 : 지역 생성 폼 값을 API 요청 값으로 변환합니다.
export function toCreateCompanyRegionInput(
  values: CompanyTaxonomyFormValues
): CreateCompanyRegionInput {
  return {
    region: values.name.trim(),
  };
}

// 기능 : 일반 메모 생성 폼 값을 API 요청 값으로 변환합니다.
export function toCreateCompanyMemoLogInput(
  companyId: string,
  values: CompanyMemoLogFormValues
): CreateCompanyMemoLogInput {
  return {
    companyId,
    memoType: values.memoType.trim(),
    memo: values.memo.trim(),
  };
}

// 기능 : 일반 메모 수정 폼 값을 API 요청 값으로 변환합니다.
export function toUpdateCompanyMemoLogInput(
  companyId: string,
  memoLogId: string,
  values: CompanyMemoLogFormValues
): UpdateCompanyMemoLogInput {
  return {
    ...toCreateCompanyMemoLogInput(companyId, values),
    memoLogId,
  };
}

// 기능 : 개인 메모 생성 폼 값을 API 요청 값으로 변환합니다.
export function toCreateCompanyPrivateMemoLogInput(
  companyId: string,
  values: CompanyPrivateMemoLogFormValues
): CreateCompanyPrivateMemoLogInput {
  return {
    companyId,
    memo: values.memo.trim(),
  };
}

// 기능 : 개인 메모 수정 폼 값을 API 요청 값으로 변환합니다.
export function toUpdateCompanyPrivateMemoLogInput(
  companyId: string,
  privateMemoLogId: string,
  values: CompanyPrivateMemoLogFormValues
): UpdateCompanyPrivateMemoLogInput {
  return {
    ...toCreateCompanyPrivateMemoLogInput(companyId, values),
    privateMemoLogId,
  };
}

// 기능 : 빈 문자열을 API 요청에서 제외할 수 있는 undefined로 변환합니다.
function optionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}
