import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAiWeeklyReport } from "@/features/ai-weekly-report/api/ai-weekly-report-api";
import { aiWeeklyReportQueryKeys } from "@/features/ai-weekly-report/api/ai-weekly-report-query-keys";

export function useCreateAiWeeklyReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAiWeeklyReport,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: aiWeeklyReportQueryKeys.weeks(),
      });
    },
  });
}
