UPDATE "MeetingNote"
SET "meetingAt" = "createdAt"
WHERE "meetingAt" IS NULL;

ALTER TABLE "MeetingNote"
ALTER COLUMN "meetingAt" SET NOT NULL;
