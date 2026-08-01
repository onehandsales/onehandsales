export type AdminProviderFailureType =
  | "AI"
  | "OCR"
  | "STT"
  | "CALENDAR"
  | "PUSH"
  | "EMAIL"
  | "SMS";

export type AdminProviderFailureFeatureArea =
  | "AI_WEEKLY_REPORT"
  | "FOLLOW_UP"
  | "MEETING_NOTE"
  | "BUSINESS_CARD_SCAN"
  | "NOTIFICATION"
  | "CALENDAR_SYNC";

export type AdminProviderFailureStatus = "FAILED" | "PENDING" | "CANCELED";
export type AdminProviderFailureStatusFilter = "FAILED" | "RETRYABLE" | "ALL";

export type AdminProviderFailureSafeContext = Record<
  string,
  string | number | boolean | null
>;

export type AdminProviderFailureListParams = {
  readonly providerType?: AdminProviderFailureType;
  readonly featureArea?: AdminProviderFailureFeatureArea;
  readonly status?: AdminProviderFailureStatusFilter;
  readonly retryable?: boolean;
  readonly userId?: string;
  readonly from?: string;
  readonly to?: string;
  readonly cursor?: string;
  readonly limit?: number;
};

export type AdminProviderFailureItem = {
  readonly id: string;
  readonly providerType: AdminProviderFailureType;
  readonly sourceModel: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly featureArea: AdminProviderFailureFeatureArea;
  readonly operation: string;
  readonly targetType: string;
  readonly targetId: string | null;
  readonly status: AdminProviderFailureStatus;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly latencyMs: number | null;
  readonly requestId: string | null;
  readonly occurredAt: string;
};

export type AdminProviderFailureDetail = AdminProviderFailureItem & {
  readonly safeContext: AdminProviderFailureSafeContext;
};

export type AdminProviderFailureListResponse = {
  readonly items: AdminProviderFailureItem[];
  readonly nextCursor: string | null;
};
