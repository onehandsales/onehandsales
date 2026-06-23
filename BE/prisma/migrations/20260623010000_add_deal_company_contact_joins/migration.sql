-- CreateTable
CREATE TABLE "DealCompany" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealContact" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealContact_pkey" PRIMARY KEY ("id")
);

-- Backfill existing one-company deal rows into the join table before dropping Deal.companyId.
INSERT INTO "DealCompany" ("id", "userId", "dealId", "companyId", "createdAt", "updatedAt")
SELECT
    (
        SUBSTRING(MD5("id"::text || "companyId"::text) FROM 1 FOR 8) || '-' ||
        SUBSTRING(MD5("id"::text || "companyId"::text) FROM 9 FOR 4) || '-' ||
        SUBSTRING(MD5("id"::text || "companyId"::text) FROM 13 FOR 4) || '-' ||
        SUBSTRING(MD5("id"::text || "companyId"::text) FROM 17 FOR 4) || '-' ||
        SUBSTRING(MD5("id"::text || "companyId"::text) FROM 21 FOR 12)
    )::uuid,
    "userId",
    "id",
    "companyId",
    "createdAt",
    "updatedAt"
FROM "Deal";

-- Backfill existing one-contact deal rows into the join table before dropping Deal.contactId.
INSERT INTO "DealContact" ("id", "userId", "dealId", "contactId", "createdAt", "updatedAt")
SELECT
    (
        SUBSTRING(MD5("id"::text || "contactId"::text) FROM 1 FOR 8) || '-' ||
        SUBSTRING(MD5("id"::text || "contactId"::text) FROM 9 FOR 4) || '-' ||
        SUBSTRING(MD5("id"::text || "contactId"::text) FROM 13 FOR 4) || '-' ||
        SUBSTRING(MD5("id"::text || "contactId"::text) FROM 17 FOR 4) || '-' ||
        SUBSTRING(MD5("id"::text || "contactId"::text) FROM 21 FOR 12)
    )::uuid,
    "userId",
    "id",
    "contactId",
    "createdAt",
    "updatedAt"
FROM "Deal";

-- CreateIndex
CREATE UNIQUE INDEX "DealCompany_dealId_companyId_key" ON "DealCompany"("dealId", "companyId");

-- CreateIndex
CREATE INDEX "DealCompany_userId_dealId_idx" ON "DealCompany"("userId", "dealId");

-- CreateIndex
CREATE INDEX "DealCompany_userId_companyId_idx" ON "DealCompany"("userId", "companyId");

-- CreateIndex
CREATE INDEX "DealCompany_companyId_idx" ON "DealCompany"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DealContact_dealId_contactId_key" ON "DealContact"("dealId", "contactId");

-- CreateIndex
CREATE INDEX "DealContact_userId_dealId_idx" ON "DealContact"("userId", "dealId");

-- CreateIndex
CREATE INDEX "DealContact_userId_contactId_idx" ON "DealContact"("userId", "contactId");

-- CreateIndex
CREATE INDEX "DealContact_contactId_idx" ON "DealContact"("contactId");

-- AddForeignKey
ALTER TABLE "DealCompany" ADD CONSTRAINT "DealCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealCompany" ADD CONSTRAINT "DealCompany_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealCompany" ADD CONSTRAINT "DealCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealContact" ADD CONSTRAINT "DealContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealContact" ADD CONSTRAINT "DealContact_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealContact" ADD CONSTRAINT "DealContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_contactId_fkey";

-- DropIndex
DROP INDEX "Deal_companyId_idx";

-- DropIndex
DROP INDEX "Deal_contactId_idx";

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "companyId",
DROP COLUMN "contactId";
