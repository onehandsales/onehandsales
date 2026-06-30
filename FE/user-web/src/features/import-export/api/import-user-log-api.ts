import type {
  ImportUserLogDetail,
  ImportUserLogListParams,
  ImportUserLogPageResponse,
} from "@/features/import-export/types/import-user-log";
import { apiClient } from "@/lib/api-client";

// 기능 : 성공한 데이터 불러오기 내역 목록을 조회합니다.
export function listImportUserLogs(params: ImportUserLogListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));

  for (const targetType of params.targetTypes ?? []) {
    query.append("targetTypes", targetType);
  }

  return apiClient<ImportUserLogPageResponse>(
    `/api/import-user-logs?${query.toString()}`
  );
}

// 기능 : 성공한 데이터 불러오기 내역 상세를 조회합니다.
export function getImportUserLog(importUserLogId: string) {
  return apiClient<ImportUserLogDetail>(
    `/api/import-user-logs/${importUserLogId}`
  );
}
