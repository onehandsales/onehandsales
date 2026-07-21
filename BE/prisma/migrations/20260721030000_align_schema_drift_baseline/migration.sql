-- Align existing Supabase baseline drift with the current Prisma schema.

-- AlterEnum
BEGIN;
CREATE TYPE "OAuthProvider_new" AS ENUM ('KAKAO', 'GOOGLE', 'APPLE');
ALTER TABLE "UserOAuthAccount" ALTER COLUMN "provider" TYPE "OAuthProvider_new" USING ("provider"::text::"OAuthProvider_new");
ALTER TYPE "OAuthProvider" RENAME TO "OAuthProvider_old";
ALTER TYPE "OAuthProvider_new" RENAME TO "OAuthProvider";
DROP TYPE "public"."OAuthProvider_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "BusinessCardScanLog" DROP CONSTRAINT "BusinessCardScanLog_companyId_fkey";

-- DropForeignKey
ALTER TABLE "BusinessCardScanLog" DROP CONSTRAINT "BusinessCardScanLog_contactId_fkey";

-- DropForeignKey
ALTER TABLE "MeetingNoteCompany" DROP CONSTRAINT "MeetingNoteCompany_companyId_fkey";

-- DropForeignKey
ALTER TABLE "MeetingNoteContact" DROP CONSTRAINT "MeetingNoteContact_companyId_fkey";

-- DropForeignKey
ALTER TABLE "MeetingNoteContact" DROP CONSTRAINT "MeetingNoteContact_contactId_fkey";

-- DropForeignKey
ALTER TABLE "MeetingNoteProduct" DROP CONSTRAINT "MeetingNoteProduct_productId_fkey";

-- AddForeignKey
ALTER TABLE "MeetingNoteCompany" ADD CONSTRAINT "MeetingNoteCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteProduct" ADD CONSTRAINT "MeetingNoteProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScanLog" ADD CONSTRAINT "BusinessCardScanLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScanLog" ADD CONSTRAINT "BusinessCardScanLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
