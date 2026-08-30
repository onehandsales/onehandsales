import type { AdminOperationCheckRunStatus } from "./admin-operation.types";

// 역할 : AdminOperationCheckEnvironment 운영 gate 점검 대상 환경 값을 정의합니다.
export type AdminOperationCheckEnvironment =
  | "local"
  | "qa"
  | "staging"
  | "production";

// 역할 : AdminOperationCheckItemsRecord 운영 gate 점검 항목별 application read model을 정의합니다.
export interface AdminOperationCheckItemsRecord {
  readonly prismaValidate: AdminOperationCheckRunStatus;
  readonly prismaGenerate: AdminOperationCheckRunStatus;
  readonly migrationStatus: AdminOperationCheckRunStatus;
  readonly seedNotRunOnSharedDb: AdminOperationCheckRunStatus;
  readonly backupVerified: AdminOperationCheckRunStatus;
  readonly restoreDryRun: AdminOperationCheckRunStatus;
  readonly providerSmoke: AdminOperationCheckRunStatus;
}

// 역할 : AdminOperationCheckRunRecord 운영 gate 점검 기록 application read model을 정의합니다.
export interface AdminOperationCheckRunRecord {
  readonly id: string;
  readonly environment: AdminOperationCheckEnvironment;
  readonly status: AdminOperationCheckRunStatus;
  readonly checkedAt: Date;
  readonly checkedByAdminUserId: string;
  readonly items: AdminOperationCheckItemsRecord;
  readonly notes: string | null;
}
