import { useQuery } from "@tanstack/react-query";
import { listCompanies } from "@/features/company";
import { listContacts } from "@/features/contact";
import { listProducts } from "@/features/product";

export type DealEntityOption = {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
};

export function useDealCompanyOptions(search: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: normalizedSearch.length > 0,
    queryKey: ["deal", "company-options", normalizedSearch] as const,
    queryFn: async () => {
      const result = await listCompanies({
        page: 1,
        pageSize: 8,
        search: normalizedSearch,
      });

      return result.items.map<DealEntityOption>((company) => ({
        id: company.id,
        name: company.name,
        subtitle: [company.industry, company.region].filter(Boolean).join(" · "),
      }));
    },
  });
}

export function useDealContactOptions(search: string, companyId: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: normalizedSearch.length > 0,
    queryKey: ["deal", "contact-options", normalizedSearch, companyId] as const,
    queryFn: async () => {
      const result = await listContacts({
        page: 1,
        pageSize: 8,
        search: normalizedSearch,
        companyId: companyId || undefined,
      });

      return result.items.map<DealEntityOption>((contact) => ({
        id: contact.id,
        name: contact.name,
        subtitle: [contact.companyName, contact.position]
          .filter(Boolean)
          .join(" · "),
      }));
    },
  });
}

export function useDealProductOptions(search: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: normalizedSearch.length > 0,
    queryKey: ["deal", "product-options", normalizedSearch] as const,
    queryFn: async () => {
      const result = await listProducts({
        page: 1,
        pageSize: 8,
        search: normalizedSearch,
      });

      return result.items.map<DealEntityOption>((product) => ({
        id: product.id,
        name: product.name,
        subtitle: [product.category, formatProductPrice(product.unitPrice)]
          .filter(Boolean)
          .join(" · "),
      }));
    },
  });
}

function formatProductPrice(unitPrice: number | null) {
  return unitPrice === null ? "" : unitPrice.toLocaleString("ko-KR");
}
