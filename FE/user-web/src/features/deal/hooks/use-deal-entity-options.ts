// 기능 : 딜 form 회사/담당자/제품 옵션 TanStack Query hook
import { useQuery } from "@tanstack/react-query";
import {
  getDealCompanyOptions,
  getDealContactOptions,
  getDealProductOptions,
} from "@/features/deal/api/deal-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import type {
  DealCompanyOption,
  DealContactOption,
  DealProductOption,
} from "@/features/deal/types/deal";

export type { DealCompanyOption, DealContactOption, DealProductOption };

// 기능 : deal-entity-search-field 하위 호환용 범용 옵션 타입
export type DealEntityOption = {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
};

export function useDealCompanyOptions(options?: { readonly enabled?: boolean }) {
  return useQuery({
    queryKey: dealQueryKeys.companyOptions(),
    queryFn: () => getDealCompanyOptions(),
    enabled: options?.enabled ?? true,
    select: (data) => data.items,
  });
}

export function useDealContactOptions(options?: { readonly enabled?: boolean }) {
  return useQuery({
    queryKey: dealQueryKeys.contactOptions(),
    queryFn: () => getDealContactOptions(),
    enabled: options?.enabled ?? true,
    select: (data) => data.items,
  });
}

export function useDealProductOptions(options?: { readonly enabled?: boolean }) {
  return useQuery({
    queryKey: dealQueryKeys.productOptions(),
    queryFn: () => getDealProductOptions(),
    enabled: options?.enabled ?? true,
    select: (data) => data.items,
  });
}
