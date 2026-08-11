export const DEAL_ACTIVITY_LINKED_RECORD_TARGET_TYPES = [
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
  "CONTACT",
  "COMPANY",
  "PRODUCT",
  "FOLLOW_UP_MESSAGE",
] as const;

export const DEAL_ACTIVITY_TYPES = [
  "DEAL_CREATED",
  "STAGE_CHANGED",
  "NEXT_ACTION_CREATED",
  "NEXT_ACTION_COMPLETION_CHANGED",
  "SCHEDULE_LINKED",
  "SCHEDULE_UNLINKED",
  "MEETING_NOTE_LINKED",
  "MEETING_NOTE_UNLINKED",
  "FOLLOW_UP_SENT",
  "FOLLOW_UP_FAILED",
  "CALL",
  "MEETING",
  "EMAIL",
  "VISIT",
  "NOTE",
] as const;

export type DealActivityLinkedRecordTargetType =
  (typeof DEAL_ACTIVITY_LINKED_RECORD_TARGET_TYPES)[number];
export type DealActivityTypeCode = (typeof DEAL_ACTIVITY_TYPES)[number];
export type DealActivitySourceTypeCode =
  | "SYSTEM"
  | "USER"
  | "NEXT_ACTION"
  | "SCHEDULE"
  | "MEETING_NOTE"
  | "FOLLOW_UP";

// 역할 : DealActivityLinkedRecordValue timeline 연결 record 구조를 정의합니다.
export interface DealActivityLinkedRecordValue {
  readonly targetType: DealActivityLinkedRecordTargetType;
  readonly targetId: string;
  readonly targetPath: string;
  readonly targetLabel: string | null;
}

// 역할 : DealActivityRecord deal timeline activity record를 정의합니다.
export interface DealActivityRecord {
  readonly id: string;
  readonly userId: string;
  readonly dealId: string;
  readonly activityType: DealActivityTypeCode;
  readonly sourceType: DealActivitySourceTypeCode;
  readonly sourceId: string | null;
  readonly title: string;
  readonly summary: string | null;
  readonly body: string | null;
  readonly occurredAt: Date;
  readonly linkedRecordsJson: unknown | null;
  readonly metadataJson: unknown | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : CreateDealActivityInput deal activity 생성 값을 정의합니다.
export interface CreateDealActivityInput {
  readonly userId: string;
  readonly dealId: string;
  readonly activityType: DealActivityTypeCode;
  readonly sourceType: DealActivitySourceTypeCode;
  readonly sourceId?: string | null;
  readonly title: string;
  readonly summary?: string | null;
  readonly body?: string | null;
  readonly occurredAt: Date;
  readonly linkedRecordsJson?: unknown | null;
  readonly metadataJson?: unknown | null;
}

// 역할 : FindDealActivityBySourceInput 자동 activity 원본 조회 기준을 정의합니다.
export interface FindDealActivityBySourceInput {
  readonly userId: string;
  readonly dealId: string;
  readonly activityType: DealActivityTypeCode;
  readonly sourceType: DealActivitySourceTypeCode;
  readonly sourceId: string;
}

// 역할 : DealActivityWritePort 다른 module transaction 안에서 deal activity를 쓰는 최소 계약을 정의합니다.
export interface DealActivityWritePort {
  // 기능 : 딜 활동 행을 생성합니다.
  createActivity(input: CreateDealActivityInput): Promise<DealActivityRecord>;
  // 기능 : 자동 활동 원본 기준으로 기존 딜 활동을 조회합니다.
  findActivityBySource(
    input: FindDealActivityBySourceInput
  ): Promise<DealActivityRecord | null>;
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
  repository: DealActivityWritePort,
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
