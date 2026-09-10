// 기능 : User Web client 분석 이벤트 payload schema 버전을 고정합니다.
export const PRODUCT_ANALYTICS_EVENT_VERSION = 1;

// 기능 : Backend 제품 분석 routeKey allowlist와 같은 값을 Frontend에 고정합니다.
export const PRODUCT_ANALYTICS_APP_ROUTE_KEYS = [
  "home",
  "companies",
  "company_create",
  "company_detail",
  "contacts",
  "contact_create",
  "contact_detail",
  "products",
  "product_create",
  "product_detail",
  "deals",
  "deal_create",
  "deal_detail",
  "schedules",
  "schedule_week",
  "schedule_detail",
  "meeting_notes",
  "meeting_note_create",
  "meeting_note_detail",
  "trash",
  "more",
] as const;

export type ProductAnalyticsAppRouteKey =
  (typeof PRODUCT_ANALYTICS_APP_ROUTE_KEYS)[number];

export type MobileFieldAnalyticsClientEventName =
  | "meeting_note_recording_started"
  | "meeting_note_recording_completed"
  | "meeting_note_recording_failed"
  | "local_draft_saved"
  | "local_draft_restored"
  | "local_draft_discarded";

export type ProductAnalyticsClientEventName =
  | "app_route_viewed"
  | MobileFieldAnalyticsClientEventName;

export type ProductAnalyticsClientTargetType =
  | "MEETING_NOTE"
  | "USER";

export type ProductAnalyticsClientEventContext = {
  readonly occurredAt?: string;
  readonly targetId?: string;
  readonly targetType?: ProductAnalyticsClientTargetType;
};

export type AppRouteViewedAnalyticsPayload = {
  readonly routeKey: ProductAnalyticsAppRouteKey;
};

export type AppRouteViewedAnalyticsEventInput = {
  readonly eventName: "app_route_viewed";
  readonly eventVersion: typeof PRODUCT_ANALYTICS_EVENT_VERSION;
  readonly payload: AppRouteViewedAnalyticsPayload;
};

export type MeetingNoteRecordingAnalyticsEventInput =
  | {
      readonly eventName: "meeting_note_recording_started";
      readonly eventVersion: typeof PRODUCT_ANALYTICS_EVENT_VERSION;
      readonly payload: {
        readonly entryPoint: "meeting_note_create";
      };
    }
  | {
      readonly eventName: "meeting_note_recording_completed";
      readonly eventVersion: typeof PRODUCT_ANALYTICS_EVENT_VERSION;
      readonly payload: {
        readonly durationBucket:
          | "under_1m"
          | "1m_5m"
          | "5m_15m"
          | "over_15m";
      };
    }
  | {
      readonly eventName: "meeting_note_recording_failed";
      readonly eventVersion: typeof PRODUCT_ANALYTICS_EVENT_VERSION;
      readonly payload: {
        readonly reason:
          | "permission_denied"
          | "unsupported"
          | "interrupted"
          | "unknown";
      };
    };

export type LocalDraftAnalyticsEventInput =
  | {
      readonly eventName: "local_draft_saved";
      readonly eventVersion: typeof PRODUCT_ANALYTICS_EVENT_VERSION;
      readonly payload: {
        readonly draftType: "meeting_note_create";
      };
    }
  | {
      readonly eventName: "local_draft_restored";
      readonly eventVersion: typeof PRODUCT_ANALYTICS_EVENT_VERSION;
      readonly payload: {
        readonly draftType: "meeting_note_create";
      };
    }
  | {
      readonly eventName: "local_draft_discarded";
      readonly eventVersion: typeof PRODUCT_ANALYTICS_EVENT_VERSION;
      readonly payload: {
        readonly draftType: "meeting_note_create";
        readonly reason: "user_discarded" | "expired" | "saved";
      };
    };

export type MobileFieldAnalyticsEventInput =
  | MeetingNoteRecordingAnalyticsEventInput
  | LocalDraftAnalyticsEventInput;

export type TrackAnalyticsEventInput = ProductAnalyticsClientEventContext &
  (AppRouteViewedAnalyticsEventInput | MobileFieldAnalyticsEventInput);

export type CollectProductAnalyticsEventResponse = {
  readonly accepted: true;
};

export type TrackAnalyticsEvent = (
  input: TrackAnalyticsEventInput
) => Promise<CollectProductAnalyticsEventResponse>;
