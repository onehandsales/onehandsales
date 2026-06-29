-- CreateEnum
CREATE TYPE "BusinessCardScanStatus" AS ENUM ('OCR_SUCCESS', 'OCR_FAILED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "BusinessCardResolution" AS ENUM ('EXISTING', 'CREATED');

-- CreateTable
CREATE TABLE "BusinessCardScanLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "BusinessCardScanStatus" NOT NULL,
    "companyName" TEXT,
    "companyFieldName" TEXT,
    "companyRegionName" TEXT,
    "contactName" TEXT,
    "contactMobile" TEXT,
    "contactEmail" TEXT,
    "contactDepartmentName" TEXT,
    "contactJobGradeName" TEXT,
    "companyId" UUID,
    "contactId" UUID,
    "companyResolution" "BusinessCardResolution",
    "contactResolution" "BusinessCardResolution",
    "aiProvider" TEXT NOT NULL DEFAULT 'OPENAI',
    "aiModel" TEXT NOT NULL,
    "promptSnapshot" TEXT NOT NULL,
    "requestToken" DOUBLE PRECISION,
    "responseToken" DOUBLE PRECISION,
    "totalToken" DOUBLE PRECISION,
    "requestCost" DOUBLE PRECISION,
    "responseCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "costCurrency" TEXT NOT NULL DEFAULT 'USD',
    "pendingTimeMs" DOUBLE PRECISION,
    "confirmedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BusinessCardScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_createdAt_idx" ON "BusinessCardScanLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_status_createdAt_idx" ON "BusinessCardScanLog"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_companyId_idx" ON "BusinessCardScanLog"("userId", "companyId");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_contactId_idx" ON "BusinessCardScanLog"("userId", "contactId");

-- AddForeignKey
ALTER TABLE "BusinessCardScanLog" ADD CONSTRAINT "BusinessCardScanLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScanLog" ADD CONSTRAINT "BusinessCardScanLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScanLog" ADD CONSTRAINT "BusinessCardScanLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
