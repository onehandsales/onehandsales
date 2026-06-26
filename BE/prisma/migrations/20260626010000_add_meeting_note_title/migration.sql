ALTER TABLE "MeetingNote"
ADD COLUMN "title" TEXT;

UPDATE "MeetingNote"
SET "title" = COALESCE(
    NULLIF(SUBSTRING(REGEXP_REPLACE("details", '[[:space:]]+', ' ', 'g') FROM 1 FOR 100), ''),
    'Untitled meeting note'
);

ALTER TABLE "MeetingNote"
ALTER COLUMN "title" SET NOT NULL;

CREATE INDEX "MeetingNote_userId_title_idx" ON "MeetingNote"("userId", "title");
