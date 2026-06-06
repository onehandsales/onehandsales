import type {
  Company,
  CompanyDetail,
  CompanyListParams,
  CompanyListResponse,
  CompanyLog,
  CreateCompanyInput,
  CreateCompanyLogInput,
  DeleteCompanyResponse,
  UpdateCompanyInput,
  UpdateCompanyLogInput,
} from "@/features/company/types/company";
import { apiClient } from "@/lib/api-client";

export function listCompanies(params: CompanyListParams) {
  const query = toCompanyListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<CompanyListResponse>(`/api/companies${suffix}`);
}

export function createCompany(input: CreateCompanyInput) {
  return apiClient<Company>("/api/companies", {
    method: "POST",
    body: compactBody(input),
  });
}

export function getCompany(companyId: string) {
  return apiClient<CompanyDetail>(`/api/companies/${companyId}`);
}

export function updateCompany(input: UpdateCompanyInput) {
  return apiClient<Company>(`/api/companies/${input.companyId}`, {
    method: "PATCH",
    body: compactBody({
      name: input.name,
      industry: input.industry,
      region: input.region,
      address: input.address,
      website: input.website,
      description: input.description,
      tags: input.tags,
    }),
  });
}

export function deleteCompany(companyId: string) {
  return apiClient<DeleteCompanyResponse>(`/api/companies/${companyId}`, {
    method: "DELETE",
  });
}

export function restoreCompany(companyId: string) {
  return apiClient<Company>(`/api/companies/${companyId}/restore`, {
    method: "POST",
  });
}

export function createCompanyLog(input: CreateCompanyLogInput) {
  return apiClient<CompanyLog>(`/api/companies/${input.companyId}/logs`, {
    method: "POST",
    body: compactBody({
      loggedAt: input.loggedAt,
      title: input.title,
      content: input.content,
    }),
  });
}

export function updateCompanyLog(input: UpdateCompanyLogInput) {
  return apiClient<CompanyLog>(
    `/api/companies/${input.companyId}/logs/${input.logId}`,
    {
      method: "PATCH",
      body: compactBody({
        loggedAt: input.loggedAt,
        title: input.title,
        content: input.content,
      }),
    }
  );
}

export function deleteCompanyLog(companyId: string, logId: string) {
  return apiClient<DeleteCompanyResponse>(
    `/api/companies/${companyId}/logs/${logId}`,
    {
      method: "DELETE",
    }
  );
}

function toCompanyListSearchParams(params: CompanyListParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 20));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return searchParams;
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
