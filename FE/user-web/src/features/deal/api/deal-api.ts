import type {
  CreateDealInput,
  Deal,
  DealListParams,
  DealListResponse,
} from "@/features/deal/types/deal";
import { apiClient } from "@/lib/api-client";

export function listDeals(params: DealListParams) {
  const query = toDealListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<DealListResponse>(`/api/deals${suffix}`);
}

export function createDeal(input: CreateDealInput) {
  return apiClient<Deal>("/api/deals", {
    method: "POST",
    body: compactBody(input),
  });
}

function toDealListSearchParams(params: DealListParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 20));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.stage) {
    searchParams.set("stage", params.stage);
  }

  if (params.likelihoodStatus) {
    searchParams.set("likelihoodStatus", params.likelihoodStatus);
  }

  if (params.nextActionStatus) {
    searchParams.set("nextActionStatus", params.nextActionStatus);
  }

  if (params.companyId) {
    searchParams.set("companyId", params.companyId);
  }

  if (params.contactId) {
    searchParams.set("contactId", params.contactId);
  }

  if (params.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return searchParams;
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
