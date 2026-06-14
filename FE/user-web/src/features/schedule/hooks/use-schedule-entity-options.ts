import { useQuery } from "@tanstack/react-query";
import { listCompanies } from "@/features/company";
import { listContacts } from "@/features/contact";
import { listDeals } from "@/features/deal/api/deal-api";

export type ScheduleEntityOption = {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly companyId?: string | null;
  readonly companyName?: string | null;
  readonly contactId?: string | null;
  readonly contactName?: string | null;
};

export function useScheduleDealOptions(search: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: normalizedSearch.length > 0,
    queryKey: ["schedule", "deal-options", normalizedSearch] as const,
    queryFn: async () => {
      const result = await listDeals({
        page: 1,
        search: normalizedSearch,
      });

      return result.items.map<ScheduleEntityOption>((deal) => ({
        id: deal.id,
        name: deal.dealName,
        subtitle: [deal.company?.companyName, deal.contact?.username]
          .filter(Boolean)
          .join(" · "),
        companyId: deal.company?.id ?? null,
        companyName: deal.company?.companyName ?? null,
        contactId: deal.contact?.id ?? null,
        contactName: deal.contact?.username ?? null,
      }));
    },
  });
}

export function useScheduleCompanyOptions(search: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: normalizedSearch.length > 0,
    queryKey: ["schedule", "company-options", normalizedSearch] as const,
    queryFn: async () => {
      const result = await listCompanies({
        page: 1,
        companyName: normalizedSearch,
      });

      return result.items.map<ScheduleEntityOption>((company) => ({
        id: company.id,
        name: company.companyName,
        subtitle: [company.companyField.field, company.companyRegion.region].join(
          " · "
        ),
      }));
    },
  });
}

export function useScheduleContactOptions(search: string, companyId: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: normalizedSearch.length > 0,
    queryKey: [
      "schedule",
      "contact-options",
      normalizedSearch,
      companyId,
    ] as const,
    queryFn: async () => {
      const result = await listContacts({
        page: 1,
        username: normalizedSearch,
        companyId: companyId || undefined,
      });

      return result.items.map<ScheduleEntityOption>((contact) => ({
        id: contact.id,
        name: contact.username,
        subtitle: [
          contact.company.companyName,
          contact.contactJobGrade.jobGradeName,
        ]
          .filter(Boolean)
          .join(" · "),
        companyId: contact.company.id,
        companyName: contact.company.companyName,
      }));
    },
  });
}
