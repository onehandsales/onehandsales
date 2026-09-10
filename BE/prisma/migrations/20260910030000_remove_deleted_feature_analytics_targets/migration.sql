UPDATE "ProductAnalyticsEvent"
SET "targetType" = NULL,
    "targetId" = NULL
WHERE "targetType"::text IN ('BUSINESS_CARD_SCAN', 'IMPORT_JOB');

ALTER TYPE "ProductAnalyticsTargetType" RENAME TO "ProductAnalyticsTargetType_old";

CREATE TYPE "ProductAnalyticsTargetType" AS ENUM (
  'USER',
  'DEAL',
  'SCHEDULE',
  'MEETING_NOTE',
  'EXPORT'
);

ALTER TABLE "ProductAnalyticsEvent"
  ALTER COLUMN "targetType" TYPE "ProductAnalyticsTargetType"
  USING ("targetType"::text::"ProductAnalyticsTargetType");

DROP TYPE "ProductAnalyticsTargetType_old";
