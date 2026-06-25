ALTER TABLE "CompanyMemoLog"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "CompanyUserPrivateMemoLog"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "ContactMemoLog"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "ContactUserPrivateMemoLog"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "ProductMemoLog"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "ProductUserPrivateMemoLog"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "DealFollowingActionLog"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "DealMemoLog"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

CREATE INDEX "CompanyMemoLog_userId_deletedAt_idx" ON "CompanyMemoLog"("userId", "deletedAt");
CREATE INDEX "CompanyMemoLog_userId_trashExpiresAt_idx" ON "CompanyMemoLog"("userId", "trashExpiresAt");
CREATE INDEX "CompanyUserPrivateMemoLog_userId_deletedAt_idx" ON "CompanyUserPrivateMemoLog"("userId", "deletedAt");
CREATE INDEX "CompanyUserPrivateMemoLog_userId_trashExpiresAt_idx" ON "CompanyUserPrivateMemoLog"("userId", "trashExpiresAt");

CREATE INDEX "ContactMemoLog_userId_deletedAt_idx" ON "ContactMemoLog"("userId", "deletedAt");
CREATE INDEX "ContactMemoLog_userId_trashExpiresAt_idx" ON "ContactMemoLog"("userId", "trashExpiresAt");
CREATE INDEX "ContactUserPrivateMemoLog_userId_deletedAt_idx" ON "ContactUserPrivateMemoLog"("userId", "deletedAt");
CREATE INDEX "ContactUserPrivateMemoLog_userId_trashExpiresAt_idx" ON "ContactUserPrivateMemoLog"("userId", "trashExpiresAt");

CREATE INDEX "ProductMemoLog_userId_deletedAt_idx" ON "ProductMemoLog"("userId", "deletedAt");
CREATE INDEX "ProductMemoLog_userId_trashExpiresAt_idx" ON "ProductMemoLog"("userId", "trashExpiresAt");
CREATE INDEX "ProductUserPrivateMemoLog_userId_deletedAt_idx" ON "ProductUserPrivateMemoLog"("userId", "deletedAt");
CREATE INDEX "ProductUserPrivateMemoLog_userId_trashExpiresAt_idx" ON "ProductUserPrivateMemoLog"("userId", "trashExpiresAt");

CREATE INDEX "DealFollowingActionLog_userId_deletedAt_idx" ON "DealFollowingActionLog"("userId", "deletedAt");
CREATE INDEX "DealFollowingActionLog_userId_trashExpiresAt_idx" ON "DealFollowingActionLog"("userId", "trashExpiresAt");
CREATE INDEX "DealMemoLog_userId_deletedAt_idx" ON "DealMemoLog"("userId", "deletedAt");
CREATE INDEX "DealMemoLog_userId_trashExpiresAt_idx" ON "DealMemoLog"("userId", "trashExpiresAt");
