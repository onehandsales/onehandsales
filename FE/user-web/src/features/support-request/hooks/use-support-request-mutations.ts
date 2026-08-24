import { useMutation } from "@tanstack/react-query";
import { createSupportRequest } from "@/features/support-request/api/support-request-api";
import type { CreateSupportRequestInput } from "@/features/support-request/types/support-request";

// 기능 : 지원 요청 생성 mutation을 제공합니다.
export function useCreateSupportRequestMutation() {
  return useMutation({
    mutationFn: (input: CreateSupportRequestInput) =>
      createSupportRequest(input),
  });
}
