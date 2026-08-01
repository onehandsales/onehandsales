import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelMyAccountDeletionRequest,
  createMyAccountDeletionRequest,
  createMyDataExportRequest,
} from "@/features/account-request/api/account-request-api";
import { accountRequestQueryKeys } from "@/features/account-request/api/account-request-query-keys";

// 기능 : 사용자 데이터 export 요청 생성 mutation을 구성합니다.
export function useCreateMyDataExportRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMyDataExportRequest,
    onSuccess: (response) => {
      queryClient.setQueryData(
        accountRequestQueryKeys.dataExport(response.id),
        response
      );
    },
  });
}

// 기능 : 사용자 계정 삭제 요청 생성 mutation을 구성합니다.
export function useCreateMyAccountDeletionRequestMutation() {
  return useMutation({
    mutationFn: createMyAccountDeletionRequest,
  });
}

// 기능 : 사용자 계정 삭제 요청 취소 mutation을 구성합니다.
export function useCancelMyAccountDeletionRequestMutation() {
  return useMutation({
    mutationFn: cancelMyAccountDeletionRequest,
  });
}
