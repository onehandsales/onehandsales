import { useQuery } from "@tanstack/react-query";
import { listDeals } from "@/features/deal/api/deal-api";

export type MeetingNoteDealOption = {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
};

// 기능 : 회의록 form에서 선택할 딜 옵션을 딜 목록 API로 검색합니다.
export function useMeetingNoteDealOptions(search: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: normalizedSearch.length > 0,
    queryKey: ["meeting-note", "deal-options", normalizedSearch] as const,
    queryFn: async () => {
      const result = await listDeals({
        page: 1,
        search: normalizedSearch,
      });

      return result.items.map<MeetingNoteDealOption>((deal) => ({
        id: deal.id,
        name: deal.dealName,
        subtitle: [deal.company?.companyName, deal.contact?.username]
          .filter(Boolean)
          .join(" / "),
      }));
    },
  });
}
