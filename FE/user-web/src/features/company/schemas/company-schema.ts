import { z } from "zod";
import type {
  Company,
  CreateCompanyInput,
  CreateCompanyLogInput,
  UpdateCompanyInput,
  UpdateCompanyLogInput,
} from "@/features/company/types/company";

export const companyFormSchema = z.object({
  name: z.string().trim().min(1, "회사명을 입력해주세요."),
  industry: z.string().trim().optional(),
  region: z.string().trim().optional(),
  address: z.string().trim().optional(),
  website: z.string().trim().optional(),
  description: z.string().trim().optional(),
  initialMemo: z.string().trim().optional(),
  tagsText: z.string().trim().optional(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const companyLogFormSchema = z.object({
  loggedAt: z.string().trim().min(1, "기록 시간을 입력해주세요."),
  title: z.string().trim().min(1, "로그 제목을 입력해주세요."),
  content: z.string().trim().optional(),
});

export type CompanyLogFormValues = z.infer<typeof companyLogFormSchema>;

export const emptyCompanyFormValues: CompanyFormValues = {
  name: "",
  industry: "",
  region: "",
  address: "",
  website: "",
  description: "",
  initialMemo: "",
  tagsText: "",
};

export function toCompanyFormValues(company: Company): CompanyFormValues {
  return {
    name: company.name,
    industry: company.industry ?? "",
    region: company.region ?? "",
    address: company.address ?? "",
    website: company.website ?? "",
    description: company.description ?? "",
    initialMemo: "",
    tagsText: company.tags.map((tag) => tag.name).join(", "),
  };
}

export function toCreateCompanyInput(
  values: CompanyFormValues
): CreateCompanyInput {
  const tags = parseTags(values.tagsText);

  return {
    name: values.name.trim(),
    industry: optionalText(values.industry),
    region: optionalText(values.region),
    address: optionalText(values.address),
    website: optionalText(values.website),
    description: optionalText(values.description),
    initialMemo: optionalText(values.initialMemo),
    tags: tags.length > 0 ? tags : undefined,
  };
}

export function toUpdateCompanyInput(
  companyId: string,
  values: CompanyFormValues
): UpdateCompanyInput {
  return {
    companyId,
    name: values.name.trim(),
    industry: optionalText(values.industry),
    region: optionalText(values.region),
    address: optionalText(values.address),
    website: optionalText(values.website),
    description: optionalText(values.description),
    tags: parseTags(values.tagsText),
  };
}

export function toCreateCompanyLogInput(
  companyId: string,
  values: CompanyLogFormValues
): CreateCompanyLogInput {
  return {
    companyId,
    loggedAt: toIsoDateTime(values.loggedAt),
    title: values.title.trim(),
    content: optionalText(values.content),
  };
}

export function toUpdateCompanyLogInput(
  companyId: string,
  logId: string,
  values: CompanyLogFormValues
): UpdateCompanyLogInput {
  return {
    companyId,
    logId,
    loggedAt: toIsoDateTime(values.loggedAt),
    title: values.title.trim(),
    content: optionalText(values.content),
  };
}

export function toDateTimeLocalValue(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const offsetMs = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function optionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}

function parseTags(value: string | undefined) {
  const uniqueTags = new Set<string>();

  for (const tag of value?.split(",") ?? []) {
    const trimmed = tag.trim();

    if (trimmed.length > 0) {
      uniqueTags.add(trimmed);
    }
  }

  return Array.from(uniqueTags);
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}
