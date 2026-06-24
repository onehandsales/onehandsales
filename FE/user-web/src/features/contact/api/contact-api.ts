import type {
  ContactDepartmentListResponse,
  ContactDealListResponse,
  ContactDetail,
  ContactExportParams,
  ContactJobGradeListResponse,
  ContactListParams,
  ContactMemoLogConnection,
  ContactPageResponse,
  ContactPrivateMemoLogConnection,
  ContactCompanyOptionListResponse,
  CreateContactDepartmentInput,
  CreateContactInput,
  CreateContactJobGradeInput,
  CreateContactMemoLogInput,
  CreateContactPrivateMemoLogInput,
  UpdateContactInput,
  UpdateContactMemoLogInput,
  UpdateContactPrivateMemoLogInput,
} from "@/features/contact/types/contact";
import {
  apiBlobClient,
  apiClient,
  type ApiBlobResponse,
} from "@/lib/api-client";

// 기능 : 담당자 목록을 조회합니다.
export function listContacts(params: ContactListParams) {
  const query = toContactListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<ContactPageResponse>(`/api/contacts${suffix}`);
}

// 기능 : 담당자 상세를 조회합니다.
export function getContact(contactId: string) {
  return apiClient<ContactDetail>(`/api/contacts/${contactId}`);
}

// 기능 : 담당자에 연결된 딜 전체 목록을 조회합니다.
export function listContactDeals(contactId: string) {
  return apiClient<ContactDealListResponse>(`/api/contacts/${contactId}/deals`);
}

// 기능 : 담당자를 생성합니다.
export function createContact(input: CreateContactInput) {
  return apiClient<void>("/api/contacts", {
    method: "POST",
    body: compactBody(input),
  });
}

// 기능 : 담당자 기본 정보를 수정합니다.
export function updateContact(input: UpdateContactInput) {
  return apiClient<void>(`/api/contacts/${input.contactId}`, {
    method: "PATCH",
    body: compactBody({
      username: input.username,
      mobile: input.mobile,
      email: input.email,
      companyId: input.companyId,
      contactDepartmentId: input.contactDepartmentId,
      contactJobGradeId: input.contactJobGradeId,
    }),
  });
}

// 기능 : 참조가 없는 담당자를 삭제합니다.
export function deleteContact(contactId: string) {
  return apiClient<void>(`/api/contacts/${contactId}`, {
    method: "DELETE",
  });
}

// 기능 : 담당자 회사 옵션 목록을 조회합니다.
export function listContactCompanyOptions() {
  return apiClient<ContactCompanyOptionListResponse>(
    "/api/contacts/company-options"
  );
}

// 기능 : 담당자 직급 목록을 조회합니다.
export function listContactJobGrades() {
  return apiClient<ContactJobGradeListResponse>("/api/contact-job-grades");
}

// 기능 : 담당자 직급을 생성합니다.
export function createContactJobGrade(input: CreateContactJobGradeInput) {
  return apiClient<void>("/api/contact-job-grades", {
    method: "POST",
    body: compactBody(input),
  });
}

// 기능 : 담당자 직급을 삭제합니다.
export function deleteContactJobGrade(jobGradeId: string) {
  return apiClient<void>(`/api/contact-job-grades/${jobGradeId}`, {
    method: "DELETE",
  });
}

// 기능 : 담당자 부서 목록을 조회합니다.
export function listContactDepartments() {
  return apiClient<ContactDepartmentListResponse>("/api/contact-departments");
}

// 기능 : 담당자 부서를 생성합니다.
export function createContactDepartment(input: CreateContactDepartmentInput) {
  return apiClient<void>("/api/contact-departments", {
    method: "POST",
    body: compactBody(input),
  });
}

// 기능 : 담당자 부서를 삭제합니다.
export function deleteContactDepartment(departmentId: string) {
  return apiClient<void>(`/api/contact-departments/${departmentId}`, {
    method: "DELETE",
  });
}

// 기능 : 담당자 일반 메모 로그를 커서 기반으로 조회합니다.
export function listContactMemoLogs(contactId: string, cursor?: string) {
  const query = new URLSearchParams();

  if (cursor) {
    query.set("cursor", cursor);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<ContactMemoLogConnection>(
    `/api/contacts/${contactId}/memo-logs${suffix}`
  );
}

// 기능 : 담당자 일반 메모 로그를 생성합니다.
export function createContactMemoLog(input: CreateContactMemoLogInput) {
  return apiClient<void>(`/api/contacts/${input.contactId}/memo-logs`, {
    method: "POST",
    body: compactBody({
      memoType: input.memoType,
      memo: input.memo,
    }),
  });
}

// 기능 : 담당자 일반 메모 로그를 수정합니다.
export function updateContactMemoLog(input: UpdateContactMemoLogInput) {
  return apiClient<void>(
    `/api/contacts/${input.contactId}/memo-logs/${input.memoLogId}`,
    {
      method: "PATCH",
      body: compactBody({
        memoType: input.memoType,
        memo: input.memo,
      }),
    }
  );
}

// 기능 : 담당자 개인 비밀 메모 로그를 커서 기반으로 조회합니다.
export function listContactPrivateMemoLogs(contactId: string, cursor?: string) {
  const query = new URLSearchParams();

  if (cursor) {
    query.set("cursor", cursor);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<ContactPrivateMemoLogConnection>(
    `/api/contacts/${contactId}/private-memo-logs${suffix}`
  );
}

// 기능 : 담당자 개인 비밀 메모 로그를 생성합니다.
export function createContactPrivateMemoLog(
  input: CreateContactPrivateMemoLogInput
) {
  return apiClient<void>(`/api/contacts/${input.contactId}/private-memo-logs`, {
    method: "POST",
    body: compactBody({
      memo: input.memo,
    }),
  });
}

// 기능 : 담당자 개인 비밀 메모 로그를 수정합니다.
export function updateContactPrivateMemoLog(
  input: UpdateContactPrivateMemoLogInput
) {
  return apiClient<void>(
    `/api/contacts/${input.contactId}/private-memo-logs/${input.privateMemoLogId}`,
    {
      method: "PATCH",
      body: compactBody({
        memo: input.memo,
      }),
    }
  );
}

// 기능 : 현재 담당자 필터에 해당하는 목록을 엑셀 Blob으로 내려받습니다.
export function exportContactsXlsx(
  filters: ContactExportParams
): Promise<ApiBlobResponse> {
  const query = toContactExportSearchParams(filters);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiBlobClient(`/api/contacts/export/xlsx${suffix}`, {
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    method: "GET",
  });
}

// 기능 : 담당자 목록 요청 query string을 API 명세에 맞게 구성합니다.
function toContactListSearchParams(params: ContactListParams) {
  const searchParams = toContactExportSearchParams(params);

  searchParams.set("page", String(params.page ?? 1));

  return searchParams;
}

// 기능 : 담당자 내보내기 요청 query string에서 page를 제외합니다.
function toContactExportSearchParams(params: ContactExportParams) {
  const searchParams = new URLSearchParams();
  const username = params.username?.trim() ?? "";

  if (username) {
    searchParams.set("username", username);
  }

  if (params.companyId) {
    searchParams.set("companyId", params.companyId);
  }

  appendSearchParamValues(searchParams, "companyIds", params.companyIds);

  if (params.contactDepartmentId) {
    searchParams.set("contactDepartmentId", params.contactDepartmentId);
  }

  if (params.contactJobGradeId) {
    searchParams.set("contactJobGradeId", params.contactJobGradeId);
  }

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
