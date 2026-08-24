import type {
  CreateSupportRequestInput,
  CreateSupportRequestResponse,
} from "@/features/support-request/types/support-request";
import { apiClient } from "@/lib/api-client";

// 기능 : 지원 요청 생성 요청을 JSON body로 전송합니다.
export function createSupportRequest(input: CreateSupportRequestInput) {
  return apiClient<CreateSupportRequestResponse>("/api/support-requests", {
    method: "POST",
    body: {
      type: input.type,
      description: input.description,
      pageUrl: input.pageUrl,
    },
  });
}
