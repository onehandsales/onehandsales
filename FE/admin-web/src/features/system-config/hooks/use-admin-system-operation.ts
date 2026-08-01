import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminOperationCheckRun,
  getLatestAdminOperationCheckRun,
} from "../api/admin-system-operation-api";
import { adminSystemOperationKeys } from "../api/admin-system-operation-keys";

// 기능 : Admin 운영 gate 최신 점검 query를 실행합니다.
export function useLatestAdminOperationCheckRun() {
  return useQuery({
    queryKey: adminSystemOperationKeys.latest(),
    queryFn: getLatestAdminOperationCheckRun,
  });
}

// 기능 : Admin 운영 gate 점검 기록 mutation과 최신 query 갱신을 구성합니다.
export function useCreateAdminOperationCheckRunMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminOperationCheckRun,
    onSuccess: (response) => {
      queryClient.setQueryData(adminSystemOperationKeys.latest(), response);
      void queryClient.invalidateQueries({
        queryKey: adminSystemOperationKeys.all,
      });
    },
  });
}
