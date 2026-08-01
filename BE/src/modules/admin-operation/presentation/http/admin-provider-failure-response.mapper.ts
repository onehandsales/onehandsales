import type {
  AdminProviderFailureDetailRecord,
  AdminProviderFailureListPageRecord,
  AdminProviderFailureRecord,
  AdminProviderFailureSafeContext,
} from "@/modules/admin-operation/application/ports/admin-provider-failure.repository";
import { maskEmail } from "./admin-redaction.mapper";

// 역할 : AdminProviderFailureListResponse Admin provider 실패 목록 API 응답을 정의합니다.
export interface AdminProviderFailureListResponse {
  readonly items: AdminProviderFailureItemResponse[];
  readonly nextCursor: string | null;
}

// 역할 : AdminProviderFailureItemResponse Admin provider 실패 목록 item 응답을 정의합니다.
export interface AdminProviderFailureItemResponse {
  readonly id: string;
  readonly providerType: string;
  readonly sourceModel: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly featureArea: string;
  readonly operation: string;
  readonly targetType: string;
  readonly targetId: string | null;
  readonly status: string;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly latencyMs: number | null;
  readonly requestId: string | null;
  readonly occurredAt: string;
}

// 역할 : AdminProviderFailureDetailResponse Admin provider 실패 safe 상세 API 응답을 정의합니다.
export interface AdminProviderFailureDetailResponse
  extends AdminProviderFailureItemResponse {
  readonly safeContext: AdminProviderFailureSafeContext;
}

// 기능 : Admin provider 실패 목록 page record를 API 응답으로 변환합니다.
export function toAdminProviderFailureListResponse(
  page: AdminProviderFailureListPageRecord
): AdminProviderFailureListResponse {
  return {
    items: page.items.map((item) => toProviderFailureItemResponse(item)),
    nextCursor: page.nextCursor,
  };
}

// 기능 : Admin provider 실패 상세 record를 safe context 포함 응답으로 변환합니다.
export function toAdminProviderFailureDetailResponse(
  detail: AdminProviderFailureDetailRecord
): AdminProviderFailureDetailResponse {
  return {
    ...toProviderFailureItemResponse(detail),
    safeContext: detail.safeContext,
  };
}

// 기능 : provider 실패 record에서 사용자 email 원문을 제거한 응답 item을 만듭니다.
function toProviderFailureItemResponse(
  item: AdminProviderFailureRecord
): AdminProviderFailureItemResponse {
  return {
    id: item.id,
    providerType: item.providerType,
    sourceModel: item.sourceModel,
    userId: item.userId,
    userEmailMasked: maskEmail(item.userEmail),
    featureArea: item.featureArea,
    operation: item.operation,
    targetType: item.targetType,
    targetId: item.targetId,
    status: item.status,
    safeErrorCode: item.safeErrorCode,
    safeErrorMessage: item.safeErrorMessage,
    retryable: item.retryable,
    latencyMs: item.latencyMs,
    requestId: item.requestId,
    occurredAt: item.occurredAt.toISOString(),
  };
}
