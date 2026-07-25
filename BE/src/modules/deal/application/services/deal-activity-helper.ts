import type {
  CreateDealActivityInput,
  DealActivityRecord,
  DealActivityRepository,
} from "@/modules/deal/application/ports/deal-activity.repository";

export const DEAL_ACTIVITY_LINKED_RECORD_TARGET_TYPES = [
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
  "CONTACT",
  "COMPANY",
  "PRODUCT",
  "FOLLOW_UP_MESSAGE",
] as const;

export type DealActivityLinkedRecordTargetType =
  (typeof DEAL_ACTIVITY_LINKED_RECORD_TARGET_TYPES)[number];

// 역할 : DealActivityLinkedRecordValue 안전한 activity 연결 record 구조를 정의합니다.
export interface DealActivityLinkedRecordValue {
  readonly targetType: DealActivityLinkedRecordTargetType;
  readonly targetId: string;
  readonly targetPath: string;
  readonly targetLabel: string | null;
}

// 기능 : User Web route prefix를 정규화합니다.
export function normalizeDealActivityTargetPath(path: string): string {
  if (path.startsWith("/app/")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `/app${path}`;
  }

  return `/app/${path}`;
}

// 기능 : timeline 응답에 사용할 연결 record를 생성합니다.
export function createDealActivityLinkedRecord(input: {
  readonly targetType: DealActivityLinkedRecordTargetType;
  readonly targetId: string;
  readonly targetPath: string;
  readonly targetLabel: string | null;
}): DealActivityLinkedRecordValue {
  return {
    targetType: input.targetType,
    targetId: input.targetId,
    targetPath: normalizeDealActivityTargetPath(input.targetPath),
    targetLabel: input.targetLabel,
  };
}

// 기능 : 딜 상세 timeline에서 자기 딜로 이동하는 연결 record를 생성합니다.
export function createDealLinkedRecord(
  dealId: string,
  dealName: string | null
): DealActivityLinkedRecordValue {
  return createDealActivityLinkedRecord({
    targetType: "DEAL",
    targetId: dealId,
    targetPath: `/deals/${dealId}`,
    targetLabel: dealName,
  });
}

// 기능 : source row 기준 자동 activity 중복을 확인하고 없을 때만 생성합니다.
export async function createDealActivityIfAbsent(
  repository: Pick<
    DealActivityRepository,
    "findActivityBySource" | "createActivity"
  >,
  input: CreateDealActivityInput & { readonly sourceId: string }
): Promise<DealActivityRecord | null> {
  const existing = await repository.findActivityBySource({
    userId: input.userId,
    dealId: input.dealId,
    activityType: input.activityType,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
  });

  if (existing) {
    return null;
  }

  return repository.createActivity(input);
}

// 기능 : 안전한 요약 텍스트 길이를 제한합니다.
export function createSafeActivitySummary(value: string | null | undefined): string | null {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";

  if (!normalized) {
    return null;
  }

  return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
}
