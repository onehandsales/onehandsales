import { adminApiClient } from "@/lib/admin-api-client";
import type {
  AdminAuditLogListParams,
  AdminAuditLogListResponse,
  AdminSensitiveRawAccessRequest,
  AdminSensitiveRawAccessResponse,
} from "../types/admin-audit-log";

// 기능 : Admin 감사 로그 목록 API를 호출합니다.
export function listAdminAuditLogs(
  params: AdminAuditLogListParams
): Promise<AdminAuditLogListResponse> {
  const searchParams = new URLSearchParams();

  appendParam(searchParams, "cursor", params.cursor);
  appendParam(searchParams, "limit", params.limit?.toString());
  appendParam(searchParams, "adminUserId", params.adminUserId);
  appendParam(searchParams, "targetUserId", params.targetUserId);
  appendParam(searchParams, "action", params.action);
  appendParam(searchParams, "result", params.result);
  appendDateParam(searchParams, "from", params.from);
  appendDateParam(searchParams, "to", params.to);

  const queryString = searchParams.toString();

  return adminApiClient<AdminAuditLogListResponse>(
    `/audit-logs${queryString ? `?${queryString}` : ""}`
  );
}

// 기능 : Admin 민감 원문 조회 API를 호출합니다.
export function accessAdminSensitiveRawData(
  request: AdminSensitiveRawAccessRequest
): Promise<AdminSensitiveRawAccessResponse> {
  return adminApiClient<AdminSensitiveRawAccessResponse>(
    "/sensitive/raw-access",
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

// 기능 : 비어 있지 않은 query param만 URLSearchParams에 추가합니다.
function appendParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | undefined
): void {
  const normalized = value?.trim();

  if (normalized) {
    searchParams.set(key, normalized);
  }
}

// 기능 : datetime-local 값을 API가 기대하는 ISO instant 문자열로 변환해 추가합니다.
function appendDateParam(
  searchParams: URLSearchParams,
  key: "from" | "to",
  value: string | undefined
): void {
  const normalized = value?.trim();

  if (!normalized) {
    return;
  }

  const date = new Date(normalized);

  if (!Number.isNaN(date.getTime())) {
    searchParams.set(key, date.toISOString());
  }
}
