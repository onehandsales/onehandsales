ALTER TYPE "UserRole" RENAME TO "PlatformRole";

ALTER TABLE "User" RENAME COLUMN "role" TO "platformRole";
ALTER INDEX "User_role_idx" RENAME TO "User_platformRole_idx";

ALTER TABLE "ErrorReport" RENAME COLUMN "userRole" TO "userPlatformRole";
ALTER TABLE "SupportRequest" RENAME COLUMN "userRole" TO "userPlatformRole";

COMMENT ON COLUMN "User"."platformRole" IS 'Platform-level role. Workspace and team roles are stored separately.';
COMMENT ON COLUMN "ErrorReport"."userPlatformRole" IS 'User platform role snapshot at the time of the error report.';
COMMENT ON COLUMN "SupportRequest"."userPlatformRole" IS 'User platform role snapshot at the time of the support request.';
