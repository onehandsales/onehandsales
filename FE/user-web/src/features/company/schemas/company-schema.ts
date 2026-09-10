import { z } from "zod";
import type {
  CompanyDetail,
  CreateCompanyFieldInput,
  CreateCompanyInput,
  CreateCompanyRegionInput,
  UpdateCompanyInput,
} from "@/features/company/types/company";

export const companyCreateFormSchema = z.object({
  companyName: z.string().trim().min(1, "회사명을 입력해 주세요."),
  companyFieldId: z.string().trim().min(1, "분야를 선택해 주세요."),
  companyRegionId: z.string().trim().min(1, "지역을 선택해 주세요."),
  countryCode: z.enum(["KR", "US"]),
  regionCode: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export type CompanyCreateFormValues = z.infer<typeof companyCreateFormSchema>;

export const companyEditFormSchema = z.object({
  companyName: z.string().trim().min(1, "회사명을 입력해 주세요."),
  companyFieldId: z.string().trim().min(1, "분야를 선택해 주세요."),
  companyRegionId: z.string().trim().min(1, "지역을 선택해 주세요."),
  countryCode: z.enum(["KR", "US"]),
  regionCode: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export type CompanyEditFormValues = z.infer<typeof companyEditFormSchema>;

export const companyTaxonomyFormSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
});

export type CompanyTaxonomyFormValues = z.infer<typeof companyTaxonomyFormSchema>;

export const emptyCompanyCreateFormValues: CompanyCreateFormValues = {
  companyName: "",
  companyFieldId: "",
  companyRegionId: "",
  countryCode: "KR",
  regionCode: "",
  address: "",
};

export const emptyCompanyTaxonomyFormValues: CompanyTaxonomyFormValues = {
  name: "",
};

// 기능 : 회사 상세 응답을 수정 폼 기본값으로 변환합니다.
export function toCompanyEditFormValues(
  company: CompanyDetail
): CompanyEditFormValues {
  return {
    companyName: company.companyName,
    companyFieldId: company.companyField.id,
    companyRegionId: company.companyRegion.id,
    // 기능 : legacy/custom 지역은 기존 region ID를 유지하고 국가 선택만 KR 기본값으로 둡니다.
    countryCode: company.companyRegion.countryCode === "US" ? "US" : "KR",
    regionCode: company.companyRegion.regionCode ?? "",
    address: company.address ?? "",
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
    address: optionalText(values.address),
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
    address: values.address?.trim() ?? "",
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

// 기능 : 빈 문자열을 API 요청에서 제외할 수 있는 undefined로 변환합니다.
function optionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}
