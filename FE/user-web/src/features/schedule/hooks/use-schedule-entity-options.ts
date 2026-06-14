import { useQuery } from "@tanstack/react-query";
import { listScheduleDealOptions } from "@/features/schedule/api/schedule-api";
import { scheduleQueryKeys } from "@/features/schedule/api/schedule-query-keys";

export type ScheduleEntityOption = {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
};

// 기능 : 일정 도메인 내부 API로 연결 가능한 딜 옵션을 검색합니다.
export function useScheduleDealOptions(search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  return useQuery({
    queryKey: [...scheduleQueryKeys.dealOptions(), normalizedSearch] as const,
    queryFn: listScheduleDealOptions,
    select: (result) =>
      result.items
        .filter((deal) =>
          deal.dealName.toLowerCase().includes(normalizedSearch)
        )
        .map<ScheduleEntityOption>((deal) => ({
          id: deal.id,
          name: deal.dealName,
          subtitle: `등록일 ${deal.createdAt.slice(0, 10)}`,
        })),
  });
}
