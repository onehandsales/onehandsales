-- Remove schedule, meeting note, AI report/provider log, and follow-up delivery schema for the pivot.

DELETE FROM "DealActivity"
WHERE "activityType" IN (
  'SCHEDULE_LINKED',
  'SCHEDULE_UNLINKED',
  'MEETING_NOTE_LINKED',
  'MEETING_NOTE_UNLINKED',
  'FOLLOW_UP_SENT',
  'FOLLOW_UP_FAILED'
)
   OR "sourceType" IN ('SCHEDULE', 'MEETING_NOTE', 'FOLLOW_UP');

UPDATE "ProductAnalyticsEvent"
SET "targetType" = NULL,
    "targetId" = NULL
WHERE "targetType" IN ('SCHEDULE', 'MEETING_NOTE');

DROP TABLE IF EXISTS "FollowUpDeliveryAttempt";
DROP TABLE IF EXISTS "FollowUpMessageTarget";
DROP TABLE IF EXISTS "FollowUpMessage";
DROP TABLE IF EXISTS "FollowUpConsentNotice";
DROP TABLE IF EXISTS "ExternalEmailOAuthState";
DROP TABLE IF EXISTS "ExternalEmailConnection";
DROP TABLE IF EXISTS "SmsSenderNumber";

DROP TABLE IF EXISTS "AiProviderCallLog";
DROP TABLE IF EXISTS "AiJob";
DROP TABLE IF EXISTS "AiWeeklySalesReportSuggestion";
DROP TABLE IF EXISTS "AiWeeklySalesReport";

DROP TABLE IF EXISTS "MeetingNoteDeal";
DROP TABLE IF EXISTS "MeetingNoteProduct";
DROP TABLE IF EXISTS "MeetingNoteContact";
DROP TABLE IF EXISTS "MeetingNoteCompany";
DROP TABLE IF EXISTS "MeetingNote";

DROP TABLE IF EXISTS "ScheduleDeal";
DROP TABLE IF EXISTS "Schedule";
DROP TABLE IF EXISTS "ExternalCalendarSource";
DROP TABLE IF EXISTS "ExternalCalendarConnection";

ALTER TYPE "DealActivityType" RENAME TO "DealActivityType_old";
CREATE TYPE "DealActivityType" AS ENUM (
  'DEAL_CREATED',
  'STAGE_CHANGED',
  'NEXT_ACTION_CREATED',
  'NEXT_ACTION_COMPLETION_CHANGED',
  'CALL',
  'MEETING',
  'EMAIL',
  'VISIT',
  'NOTE'
);
ALTER TABLE "DealActivity"
  ALTER COLUMN "activityType" TYPE "DealActivityType"
  USING ("activityType"::text::"DealActivityType");
DROP TYPE "DealActivityType_old";

ALTER TYPE "DealActivitySourceType" RENAME TO "DealActivitySourceType_old";
CREATE TYPE "DealActivitySourceType" AS ENUM (
  'SYSTEM',
  'USER',
  'NEXT_ACTION'
);
ALTER TABLE "DealActivity"
  ALTER COLUMN "sourceType" TYPE "DealActivitySourceType"
  USING ("sourceType"::text::"DealActivitySourceType");
DROP TYPE "DealActivitySourceType_old";

ALTER TYPE "ProductAnalyticsTargetType" RENAME TO "ProductAnalyticsTargetType_old";
CREATE TYPE "ProductAnalyticsTargetType" AS ENUM (
  'USER',
  'DEAL',
  'EXPORT'
);
ALTER TABLE "ProductAnalyticsEvent"
  ALTER COLUMN "targetType" TYPE "ProductAnalyticsTargetType"
  USING ("targetType"::text::"ProductAnalyticsTargetType");
DROP TYPE "ProductAnalyticsTargetType_old";

DROP TYPE IF EXISTS "FollowUpDeliveryAttemptStatus";
DROP TYPE IF EXISTS "FollowUpTargetType";
DROP TYPE IF EXISTS "FollowUpMessageStatus";
DROP TYPE IF EXISTS "FollowUpDeliveryChannel";
DROP TYPE IF EXISTS "SmsSenderNumberStatus";
DROP TYPE IF EXISTS "ExternalEmailConnectionStatus";
DROP TYPE IF EXISTS "ExternalEmailProvider";

DROP TYPE IF EXISTS "AiProviderCallStatus";
DROP TYPE IF EXISTS "AiProviderOperation";
DROP TYPE IF EXISTS "AiJobStatus";
DROP TYPE IF EXISTS "AiWeeklySalesReportSuggestionType";
DROP TYPE IF EXISTS "AiWeeklySalesReportStatus";

DROP TYPE IF EXISTS "ScheduleExternalSyncStatus";
DROP TYPE IF EXISTS "ScheduleSourceType";
DROP TYPE IF EXISTS "ExternalCalendarSourceStatus";
DROP TYPE IF EXISTS "ExternalCalendarConnectionStatus";
DROP TYPE IF EXISTS "ExternalCalendarProvider";
DROP TYPE IF EXISTS "MeetingNoteSourceType";
