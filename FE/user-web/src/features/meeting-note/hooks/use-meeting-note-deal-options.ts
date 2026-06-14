import { useQuery } from "@tanstack/react-query";
import { listDeals } from "@/features/deal/api/deal-api";

export type MeetingNoteDealOption = {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
};

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
          .join(" · "),
      }));
    },
  });
}
