import type { CurrentUserRole } from "@/shared/application/context/current-user.context";

export const SUPPORT_REQUEST_REPOSITORY = Symbol("SUPPORT_REQUEST_REPOSITORY");

export const SUPPORT_REQUEST_TYPES = [
  "FEATURE_QUESTION",
  "PRICING_QUESTION",
  "PHONE_CONSULTATION",
  "FEATURE_SUGGESTION",
  "OTHER",
] as const;

export type SupportRequestType = (typeof SUPPORT_REQUEST_TYPES)[number];

// 역할 : SupportRequestUserSnapshot 지원 요청 저장 시점의 사용자 snapshot을 정의합니다.
export interface SupportRequestUserSnapshot {
  readonly id: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly role: CurrentUserRole;
}

// 역할 : CreateSupportRequestInput 지원 요청 row 생성에 필요한 값을 정의합니다.
export interface CreateSupportRequestInput {
  readonly user: SupportRequestUserSnapshot;
  readonly type: SupportRequestType;
  readonly description: string;
  readonly pageUrl: string;
  readonly userAgent: string | null;
  readonly requestId: string | null;
}

// 역할 : SupportRequestRecord 지원 요청 저장 결과 record를 정의합니다.
export interface SupportRequestRecord {
  readonly id: string;
}

// 역할 : SupportRequestRepository 지원 요청 영속성 계약을 정의합니다.
export interface SupportRequestRepository {
  // 기능 : 인증 사용자 ID로 지원 요청 저장용 사용자 snapshot을 조회합니다.
  findUserSnapshotById(
    userId: string
  ): Promise<SupportRequestUserSnapshot | null>;
  // 기능 : 지원 요청 row를 저장합니다.
  createSupportRequest(
    input: CreateSupportRequestInput
  ): Promise<SupportRequestRecord>;
}
