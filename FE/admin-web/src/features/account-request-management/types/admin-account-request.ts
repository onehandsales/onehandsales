export type AdminAccountDeletionRequestStatus =
  | "REQUESTED"
  | "CANCELLED"
  | "PROCESSING"
  | "COMPLETED";

export type AdminDataExportRequestStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "READY"
  | "EXPIRED"
  | "FAILED";

export type AdminAccountDeletionRequestQueueItem = {
  readonly id: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly status: AdminAccountDeletionRequestStatus;
  readonly requestedAt: string;
  readonly scheduledDeletionAt: string;
  readonly reasonCode: string | null;
};

export type AdminAccountDeletionRequestsResponse = {
  readonly items: AdminAccountDeletionRequestQueueItem[];
  readonly nextCursor: string | null;
};

export type AdminDataExportRequestQueueItem = {
  readonly id: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly status: AdminDataExportRequestStatus;
  readonly includeSensitive: boolean;
  readonly format: string;
  readonly requestedAt: string;
  readonly expiresAt: string | null;
};

export type AdminDataExportRequestsResponse = {
  readonly items: AdminDataExportRequestQueueItem[];
  readonly nextCursor: string | null;
};

export type AdminAccountDeletionRequestsParams = {
  readonly status?: AdminAccountDeletionRequestStatus;
  readonly cursor?: string;
  readonly limit?: number;
};

export type AdminDataExportRequestsParams = {
  readonly status?: AdminDataExportRequestStatus;
  readonly cursor?: string;
  readonly limit?: number;
};
