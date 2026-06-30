import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadImportTemplate,
  listActiveImportTemplates,
} from "@/features/import-export/api/import-template-api";
import {
  getImportUserLog,
  listImportUserLogs,
} from "@/features/import-export/api/import-user-log-api";
import {
  importTemplateQueryKeys,
  importUserLogQueryKeys,
} from "@/features/import-export/api/import-template-query-keys";
import type { ImportUserLogListParams } from "@/features/import-export/types/import-user-log";

// 기능 : 활성화된 데이터 불러오기 양식 목록을 조회합니다.
export function useActiveImportTemplates() {
  return useQuery({
    queryKey: importTemplateQueryKeys.active(),
    queryFn: () => listActiveImportTemplates(),
  });
}

// 기능 : 데이터 불러오기 양식 다운로드 mutation을 제공합니다.
export function useDownloadImportTemplateMutation() {
  return useMutation({
    mutationFn: downloadImportTemplate,
  });
}

// 기능 : 성공한 데이터 불러오기 내역 목록을 조회합니다.
export function useImportUserLogList(params: ImportUserLogListParams) {
  return useQuery({
    queryKey: importUserLogQueryKeys.list(params),
    queryFn: () => listImportUserLogs(params),
  });
}

// 기능 : 성공한 데이터 불러오기 내역 상세를 조회합니다.
export function useImportUserLogDetail(importUserLogId: string) {
  return useQuery({
    enabled: Boolean(importUserLogId),
    queryKey: importUserLogQueryKeys.detail(importUserLogId),
    queryFn: () => getImportUserLog(importUserLogId),
  });
}
