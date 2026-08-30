import type { AdminOperationCheckRunStatus } from "@/modules/admin-operation/application/ports/admin-operation.types";
import type { AdminOperationCheckRunRecord } from "@/modules/admin-operation/application/ports/admin-system-operation-read-model.types";

// 역할 : AdminOperationCheckItemsResponse 운영 gate 점검 항목별 응답을 정의합니다.
export interface AdminOperationCheckItemsResponse {
  readonly prismaValidate: AdminOperationCheckRunStatus;
  readonly prismaGenerate: AdminOperationCheckRunStatus;
  readonly migrationStatus: AdminOperationCheckRunStatus;
  readonly seedNotRunOnSharedDb: AdminOperationCheckRunStatus;
  readonly backupVerified: AdminOperationCheckRunStatus;
  readonly restoreDryRun: AdminOperationCheckRunStatus;
  readonly providerSmoke: AdminOperationCheckRunStatus;
}

// 역할 : AdminOperationCheckRunResponse 운영 gate 점검 기록 API 응답을 정의합니다.
export interface AdminOperationCheckRunResponse {
  readonly id: string;
  readonly environment: string;
  readonly status: string;
  readonly checkedAt: string;
  readonly checkedByAdminUserId: string;
  readonly items: AdminOperationCheckItemsResponse;
  readonly notes: string | null;
}

// 기능 : 운영 gate 점검 record를 secret 없는 API 응답으로 변환합니다.
export function toAdminOperationCheckRunResponse(
  run: AdminOperationCheckRunRecord
): AdminOperationCheckRunResponse {
  return {
    id: run.id,
    environment: run.environment,
    status: run.status,
    checkedAt: run.checkedAt.toISOString(),
    checkedByAdminUserId: run.checkedByAdminUserId,
    items: run.items,
    notes: run.notes,
  };
}
