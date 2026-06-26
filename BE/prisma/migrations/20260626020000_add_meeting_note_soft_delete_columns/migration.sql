ALTER TABLE "MeetingNote"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

CREATE INDEX "MeetingNote_userId_deletedAt_idx" ON "MeetingNote"("userId", "deletedAt");
CREATE INDEX "MeetingNote_userId_trashExpiresAt_idx" ON "MeetingNote"("userId", "trashExpiresAt");
