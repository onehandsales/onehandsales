import { useMutation } from "@tanstack/react-query";
import { createErrorReport } from "@/features/error-report/api/error-report-api";
import type { CreateErrorReportInput } from "@/features/error-report/types/error-report";

// 기능 : 에러 신고 생성 mutation을 제공합니다.
export function useCreateErrorReportMutation() {
  return useMutation({
    mutationFn: (input: CreateErrorReportInput) => createErrorReport(input),
  });
}
