export type AdminOperationCheckStatus = "PASS" | "WARN" | "FAIL";
export type AdminOperationCheckEnvironment =
  | "local"
  | "qa"
  | "staging"
  | "production";

export type AdminOperationCheckItems = {
  readonly prismaValidate: AdminOperationCheckStatus;
  readonly prismaGenerate: AdminOperationCheckStatus;
  readonly migrationStatus: AdminOperationCheckStatus;
  readonly seedNotRunOnSharedDb: AdminOperationCheckStatus;
  readonly backupVerified: AdminOperationCheckStatus;
  readonly restoreDryRun: AdminOperationCheckStatus;
  readonly providerSmoke: AdminOperationCheckStatus;
};

export type AdminOperationCheckRun = {
  readonly id: string;
  readonly environment: AdminOperationCheckEnvironment;
  readonly status: AdminOperationCheckStatus;
  readonly checkedAt: string;
  readonly checkedByAdminUserId: string;
  readonly items: AdminOperationCheckItems;
  readonly notes: string | null;
};

export type CreateAdminOperationCheckRunInput = {
  readonly environment: AdminOperationCheckEnvironment;
  readonly status: AdminOperationCheckStatus;
  readonly items: AdminOperationCheckItems;
  readonly notes?: string;
};
