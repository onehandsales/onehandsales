import { useQuery } from "@tanstack/react-query";
import { listCompanies } from "@/features/company";
import { listContacts } from "@/features/contact";
import type {
  ProductConnectionTargetType,
} from "@/features/product/types/product";

export type ProductTargetOption = {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
};

export function useProductTargetOptions(
  targetType: ProductConnectionTargetType,
  search: string
) {
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: normalizedSearch.length > 0 && targetType !== "DEAL",
    queryKey: ["product", "target-options", targetType, normalizedSearch] as const,
    queryFn: async () => {
      if (targetType === "COMPANY") {
        const result = await listCompanies({
          page: 1,
          companyName: normalizedSearch,
        });

        return result.items.map<ProductTargetOption>((company) => ({
          id: company.id,
          name: company.companyName,
          subtitle: [company.companyField.field, company.companyRegion.region].join(
            " · "
          ),
        }));
      }

      const result = await listContacts({
        page: 1,
        username: normalizedSearch,
      });

      return result.items.map<ProductTargetOption>((contact) => ({
        id: contact.id,
        name: contact.username,
        subtitle: [
          contact.company.companyName,
          contact.contactJobGrade.jobGradeName,
        ]
          .filter(Boolean)
          .join(" · "),
      }));
    },
  });
}
