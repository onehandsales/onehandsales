export const MOBILE_LOCAL_DRAFT_SCHEMA_VERSION = 1;
export const MOBILE_LOCAL_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export type MobileLocalDraftType =
  | "BUSINESS_CARD_CONFIRM"
  | "MEETING_NOTE_CREATE";

export type MobileLocalDraftAnalyticsDraftType =
  | "business_card_confirm"
  | "meeting_note_create";

export type MobileLocalDraftDiscardReason =
  | "user_discarded"
  | "expired"
  | "saved";

export type MobileLocalDraftEnvelope<TPayload> = {
  readonly schemaVersion: typeof MOBILE_LOCAL_DRAFT_SCHEMA_VERSION;
  readonly draftType: MobileLocalDraftType;
  readonly draftKey: string;
  readonly savedAt: string;
  readonly expiresAt: string;
  readonly payload: TPayload;
};

export type SaveMobileLocalDraftRequest<TPayload> = {
  readonly draftType: MobileLocalDraftType;
  readonly draftKey: string;
  readonly payload: TPayload;
};

export type LocalDraftSaveResult = {
  readonly saved: true;
  readonly expiresAt: string;
};

export type LocalDraftLoadResult<TPayload> =
  | { readonly found: true; readonly draft: MobileLocalDraftEnvelope<TPayload> }
  | {
      readonly found: false;
      readonly reason: "NOT_FOUND" | "EXPIRED" | "VERSION_MISMATCH";
    };

export type RestorePromptResponse = "RESTORE" | "DISCARD";

export type BusinessCardConfirmLocalDraftPayload = {
  readonly scanLogId: string;
  readonly companyName?: string;
  readonly companyFieldName?: string;
  readonly companyRegionName?: string;
  readonly contactName?: string;
  readonly contactMobile?: string;
  readonly contactEmail?: string;
  readonly contactDepartmentName?: string;
  readonly contactJobGradeName?: string;
};

export type MeetingNoteCreateLocalDraftPayload = {
  readonly clientDraftId: string;
  readonly meetingLocalDateTime?: string;
  readonly companyIds?: readonly string[];
  readonly contactIds?: readonly string[];
  readonly dealIds?: readonly string[];
  readonly productIds?: readonly string[];
  readonly title?: string;
  readonly summary?: string;
  readonly details?: string;
  readonly nextPlan?: string;
  readonly requiredAction?: string;
};

export type MobileLocalDraftClientEvent =
  | {
      readonly eventName: "local_draft_saved";
      readonly eventVersion: 1;
      readonly payload: {
        readonly draftType: MobileLocalDraftAnalyticsDraftType;
      };
    }
  | {
      readonly eventName: "local_draft_restored";
      readonly eventVersion: 1;
      readonly payload: {
        readonly draftType: MobileLocalDraftAnalyticsDraftType;
      };
    }
  | {
      readonly eventName: "local_draft_discarded";
      readonly eventVersion: 1;
      readonly payload: {
        readonly draftType: MobileLocalDraftAnalyticsDraftType;
        readonly reason: MobileLocalDraftDiscardReason;
      };
    };
