DROP TABLE IF EXISTS "CompanyUserPrivateMemoLog" CASCADE;
DROP TABLE IF EXISTS "CompanyMemoLog" CASCADE;

DROP INDEX IF EXISTS "Company_userId_deletedAt_idx";
DROP INDEX IF EXISTS "Company_userId_trashExpiresAt_idx";

ALTER TABLE "Company"
  DROP COLUMN IF EXISTS "deletedAt",
  DROP COLUMN IF EXISTS "deletedByUserId",
  DROP COLUMN IF EXISTS "trashExpiresAt";
