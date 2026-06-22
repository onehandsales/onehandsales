import type {
  CompanyContactListResponse,
  CompanyDealListResponse,
  CompanyDetail,
  CompanyExportFilters,
  CompanyFieldListResponse,
  CompanyListParams,
  CompanyListResponse,
  CompanyMemoLogConnectionResponse,
  CompanyPrivateMemoLogConnectionResponse,
  CompanyRegionListResponse,
  CreateCompanyFieldInput,
  CreateCompanyInput,
  CreateCompanyMemoLogInput,
  CreateCompanyPrivateMemoLogInput,
  CreateCompanyRegionInput,
  UpdateCompanyInput,
  UpdateCompanyMemoLogInput,
  UpdateCompanyPrivateMemoLogInput,
} from "@/features/company/types/company";
import {
  apiBlobClient,
  apiClient,
  type ApiBlobResponse,
} from "@/lib/api-client";

// 기능 : 회사 목록을 새 company 도메인 필터 기준으로 조회합니다.
export function listCompanies(params: CompanyListParams) {
  const query = toCompanyListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<CompanyListResponse>(`/api/companies${suffix}`);
}

// 기능 : 회사 상세 기본 정보를 조회합니다.
export function getCompany(companyId: string) {
  return apiClient<CompanyDetail>(`/api/companies/${companyId}`);
}

// 기능 : 회사 분야 목록을 조회합니다.
export function listCompanyFields() {
  return apiClient<CompanyFieldListResponse>("/api/company-fields");
}

// 기능 : 회사 지역 목록을 조회합니다.
export function listCompanyRegions() {
  return apiClient<CompanyRegionListResponse>("/api/company-regions");
}

// 기능 : 회사를 생성하고 선택 입력된 첫 메모를 일반 메모 로그로 저장합니다.
export function createCompany(input: CreateCompanyInput) {
  return apiClient<void>("/api/companies", {
    method: "POST",
    body: compactBody(input),
  });
}

// 기능 : 회사 기본 정보를 수정합니다.
export function updateCompany(input: UpdateCompanyInput) {
  return apiClient<void>(`/api/companies/${input.companyId}`, {
    method: "PATCH",
    body: compactBody({
      companyName: input.companyName,
      companyFieldId: input.companyFieldId,
      companyRegionId: input.companyRegionId,
    }),
  });
}

// 기능 : 참조가 없는 회사를 삭제합니다.
export function deleteCompany(companyId: string) {
  return apiClient<void>(`/api/companies/${companyId}`, {
    method: "DELETE",
  });
}

// 기능 : 회사 분야를 생성합니다.
export function createCompanyField(input: CreateCompanyFieldInput) {
  return apiClient<void>("/api/company-fields", {
    method: "POST",
    body: compactBody(input),
  });
}

// 기능 : 사용 중이지 않은 회사 분야를 삭제합니다.
export function deleteCompanyField(fieldId: string) {
  return apiClient<void>(`/api/company-fields/${fieldId}`, {
    method: "DELETE",
  });
}

// 기능 : 회사 지역을 생성합니다.
export function createCompanyRegion(input: CreateCompanyRegionInput) {
  return apiClient<void>("/api/company-regions", {
    method: "POST",
    body: compactBody(input),
  });
}

// 기능 : 사용 중이지 않은 회사 지역을 삭제합니다.
export function deleteCompanyRegion(regionId: string) {
  return apiClient<void>(`/api/company-regions/${regionId}`, {
    method: "DELETE",
  });
}

// 기능 : 회사에 연결된 담당자 전체 목록을 조회합니다.
export function listCompanyContacts(companyId: string) {
  return apiClient<CompanyContactListResponse>(
    `/api/companies/${companyId}/contacts`
  );
}

// 기능 : 회사에 연결된 딜 전체 목록을 조회합니다.
export function listCompanyDeals(companyId: string) {
  return apiClient<CompanyDealListResponse>(
    `/api/companies/${companyId}/deals`
  );
}

// 기능 : 회사 일반 메모 로그를 커서 기반으로 조회합니다.
export function listCompanyMemoLogs(companyId: string, cursor?: string) {
  const query = new URLSearchParams();

  if (cursor) {
    query.set("cursor", cursor);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<CompanyMemoLogConnectionResponse>(
    `/api/companies/${companyId}/memo-logs${suffix}`
  );
}

// 기능 : 회사 일반 메모 로그를 생성합니다.
export function createCompanyMemoLog(input: CreateCompanyMemoLogInput) {
  return apiClient<void>(`/api/companies/${input.companyId}/memo-logs`, {
    method: "POST",
    body: compactBody({
      memoType: input.memoType,
      memo: input.memo,
    }),
  });
}

// 기능 : 회사 일반 메모 로그를 수정합니다.
export function updateCompanyMemoLog(input: UpdateCompanyMemoLogInput) {
  return apiClient<void>(
    `/api/companies/${input.companyId}/memo-logs/${input.memoLogId}`,
    {
      method: "PATCH",
      body: compactBody({
        memoType: input.memoType,
        memo: input.memo,
      }),
    }
  );
}

// 기능 : 회사 개인 메모 로그를 커서 기반으로 조회합니다.
export function listCompanyPrivateMemoLogs(
  companyId: string,
  cursor?: string
) {
  const query = new URLSearchParams();

  if (cursor) {
    query.set("cursor", cursor);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<CompanyPrivateMemoLogConnectionResponse>(
    `/api/companies/${companyId}/private-memo-logs${suffix}`
  );
}

// 기능 : 회사 개인 메모 로그를 생성합니다.
export function createCompanyPrivateMemoLog(
  input: CreateCompanyPrivateMemoLogInput
) {
  return apiClient<void>(`/api/companies/${input.companyId}/private-memo-logs`, {
    method: "POST",
    body: compactBody({
      memo: input.memo,
    }),
  });
}

// 기능 : 회사 개인 메모 로그를 수정합니다.
export function updateCompanyPrivateMemoLog(
  input: UpdateCompanyPrivateMemoLogInput
) {
  return apiClient<void>(
    `/api/companies/${input.companyId}/private-memo-logs/${input.privateMemoLogId}`,
    {
      method: "PATCH",
      body: compactBody({
        memo: input.memo,
      }),
    }
  );
}

// 기능 : 현재 회사 필터에 해당하는 목록을 엑셀 Blob으로 내려받습니다.
export function exportCompaniesXlsx(
  filters: CompanyExportFilters
): Promise<ApiBlobResponse> {
  const query = toCompanyExportSearchParams(filters);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiBlobClient(`/api/companies/export/xlsx${suffix}`, {
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    method: "GET",
  });
}

// 기능 : 회사 목록 요청 query string을 새 API 명세에 맞게 구성합니다.
function toCompanyListSearchParams(params: CompanyListParams) {
  const searchParams = toCompanyExportSearchParams(params);

  searchParams.set("page", String(params.page ?? 1));

  return searchParams;
}

// 기능 : 회사 내보내기 요청 query string에서 page를 제외합니다.
function toCompanyExportSearchParams(params: CompanyExportFilters) {
  const searchParams = new URLSearchParams();
  const companyName = params.companyName?.trim() ?? "";

  if (companyName) {
    searchParams.set("companyName", companyName);
  }

  if (params.companyFieldId) {
    searchParams.set("companyFieldId", params.companyFieldId);
  }

  appendSearchParamValues(searchParams, "companyFieldIds", params.companyFieldIds);

  if (params.companyRegionId) {
    searchParams.set("companyRegionId", params.companyRegionId);
  }

  appendSearchParamValues(
    searchParams,
    "companyRegionIds",
    params.companyRegionIds
  );

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  return searchParams;
}

// 기능 : undefined 필드는 요청 본문에서 제외합니다.
function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}

function appendSearchParamValues(
  searchParams: URLSearchParams,
  key: string,
  values?: readonly string[]
) {
  for (const value of values ?? []) {
    if (value) {
      searchParams.append(key, value);
    }
  }
}
