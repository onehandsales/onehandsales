import type {
  CreateErrorReportInput,
  CreateErrorReportResponse,
} from "@/features/error-report/types/error-report";
import { apiClient } from "@/lib/api-client";

// 기능 : 에러 신고 생성 요청을 multipart/form-data로 전송합니다.
export function createErrorReport(input: CreateErrorReportInput) {
  // 1. 이후 단계에서 사용할 formData 값을 준비한다.
  const formData = new FormData();
  // 2. 현재 단계에서 필요한 동작을 실행한다.
  formData.append("description", input.description);
  // 3. 현재 단계에서 필요한 동작을 실행한다.
  formData.append("pageUrl", input.pageUrl);

  // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (input.screenshot) {
    formData.append("screenshot", input.screenshot, "screenshot.png");
  }

  // 5. 계산된 결과를 호출자에게 반환한다.
  return apiClient<CreateErrorReportResponse>("/api/error-reports", {
    method: "POST",
    body: formData,
  });
}
