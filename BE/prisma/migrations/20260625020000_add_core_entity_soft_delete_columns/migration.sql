ALTER TABLE "Company"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "Contact"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "Product"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "Deal"
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

CREATE INDEX "Company_userId_deletedAt_idx" ON "Company"("userId", "deletedAt");
CREATE INDEX "Company_userId_trashExpiresAt_idx" ON "Company"("userId", "trashExpiresAt");
CREATE INDEX "Contact_userId_deletedAt_idx" ON "Contact"("userId", "deletedAt");
CREATE INDEX "Contact_userId_trashExpiresAt_idx" ON "Contact"("userId", "trashExpiresAt");
CREATE INDEX "Product_userId_deletedAt_idx" ON "Product"("userId", "deletedAt");
CREATE INDEX "Product_userId_trashExpiresAt_idx" ON "Product"("userId", "trashExpiresAt");
CREATE INDEX "Deal_userId_deletedAt_idx" ON "Deal"("userId", "deletedAt");
CREATE INDEX "Deal_userId_trashExpiresAt_idx" ON "Deal"("userId", "trashExpiresAt");
