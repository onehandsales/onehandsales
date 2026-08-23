import type {
  CreateErrorReportInput,
  CreateErrorReportResponse,
} from "@/features/error-report/types/error-report";
import { apiClient } from "@/lib/api-client";

// 기능 : 에러 신고 생성 요청을 multipart/form-data로 전송합니다.
export function createErrorReport(input: CreateErrorReportInput) {
  const formData = new FormData();
  formData.append("description", input.description);
  formData.append("pageUrl", input.pageUrl);

  if (input.screenshot) {
    formData.append("screenshot", input.screenshot, "screenshot.png");
  }

  return apiClient<CreateErrorReportResponse>("/api/error-reports", {
    method: "POST",
    body: formData,
  });
}
