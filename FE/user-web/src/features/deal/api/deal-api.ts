// 기능 : Deal 도메인 API client — Backend /api/deals/* 계약 기준
import { apiClient, apiBlobClient, type ApiBlobResponse } from "@/lib/api-client";
import type {
  CreateDealInput,
  CreateFollowingActionLogInput,
  CreateMemoLogInput,
  DealCompanyOptionsResponse,
  DealContactOptionsResponse,
  DealDetail,
  DealExportParams,
  DealFollowingActionLog,
  DealFollowingActionLogsResponse,
  DealListParams,
  DealListResponse,
  DealMemoLog,
  DealMemoLogsResponse,
  DealProductOptionsResponse,
  DealStageCountsResponse,
  UpdateDealInput,
  UpdateFollowingActionLogInput,
  UpdateMemoLogInput,
} from "@/features/deal/types/deal";

// 기능 : 딜 단계별 개수 조회
export function getDealStageCounts() {
  return apiClient<DealStageCountsResponse>("/api/deals/stage-counts");
}

// 기능 : 딜 목록 페이지네이션 조회
export function listDeals(params: DealListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  if (params.search) query.set("search", params.search);
  if (params.dealStatus) query.set("dealStatus", params.dealStatus);
  if (params.sort) query.set("sort", params.sort);

  return apiClient<DealListResponse>(`/api/deals?${query.toString()}`);
}

// 기능 : 딜 단건 상세 조회
export function getDeal(dealId: string) {
  return apiClient<DealDetail>(`/api/deals/${dealId}`);
}

// 기능 : 딜 생성
export function createDeal(input: CreateDealInput) {
  return apiClient<DealDetail>("/api/deals", {
    method: "POST",
    body: input,
  });
}

// 기능 : 딜 수정
export function updateDeal(input: UpdateDealInput) {
  const { dealId, ...body } = input;
  return apiClient<DealDetail>(`/api/deals/${dealId}`, {
    method: "PATCH",
    body,
  });
}

// 기능 : 딜 form 회사 옵션 조회
export function getDealCompanyOptions() {
  return apiClient<DealCompanyOptionsResponse>("/api/deals/company-options");
}

// 기능 : 딜 form 거래처 옵션 조회
export function getDealContactOptions() {
  return apiClient<DealContactOptionsResponse>("/api/deals/contact-options");
}

// 기능 : 딜 form 제품 옵션 조회
export function getDealProductOptions() {
  return apiClient<DealProductOptionsResponse>("/api/deals/product-options");
}

// 기능 : 딜 xlsx export (blob 응답)
export function exportDealsXlsx(params: DealExportParams): Promise<ApiBlobResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.dealStatus) query.set("dealStatus", params.dealStatus);
  if (params.sort) query.set("sort", params.sort);

  return apiBlobClient(`/api/deals/export/xlsx?${query.toString()}`);
}

// 기능 : 다음 행동 로그 전체 목록 조회
export function listFollowingActionLogs(dealId: string) {
  return apiClient<DealFollowingActionLogsResponse>(
    `/api/deals/${dealId}/following-action-logs`
  );
}

// 기능 : 다음 행동 로그 생성
export function createFollowingActionLog(input: CreateFollowingActionLogInput) {
  return apiClient<DealFollowingActionLog>(
    `/api/deals/${input.dealId}/following-action-logs`,
    {
      method: "POST",
      body: { followingAction: input.followingAction },
    }
  );
}

// 기능 : 다음 행동 로그 수정
export function updateFollowingActionLog(input: UpdateFollowingActionLogInput) {
  const { dealId, followingActionLogId, ...body } = input;
  return apiClient<DealFollowingActionLog>(
    `/api/deals/${dealId}/following-action-logs/${followingActionLogId}`,
    {
      method: "PATCH",
      body,
    }
  );
}

// 기능 : 메모 로그 전체 목록 조회
export function listMemoLogs(dealId: string) {
  return apiClient<DealMemoLogsResponse>(`/api/deals/${dealId}/memo-logs`);
}

// 기능 : 메모 로그 생성
export function createMemoLog(input: CreateMemoLogInput) {
  return apiClient<DealMemoLog>(`/api/deals/${input.dealId}/memo-logs`, {
    method: "POST",
    body: { memoType: input.memoType, memo: input.memo },
  });
}

// 기능 : 메모 로그 수정
export function updateMemoLog(input: UpdateMemoLogInput) {
  const { dealId, memoLogId, ...body } = input;
  return apiClient<DealMemoLog>(`/api/deals/${dealId}/memo-logs/${memoLogId}`, {
    method: "PATCH",
    body,
  });
}
