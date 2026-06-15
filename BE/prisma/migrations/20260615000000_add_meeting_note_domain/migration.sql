-- CreateEnum
CREATE TYPE "MeetingNoteSourceType" AS ENUM ('MANUAL', 'TEXT_AI', 'STT_AI');

-- CreateTable
CREATE TABLE "MeetingNote" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sourceType" "MeetingNoteSourceType" NOT NULL DEFAULT 'MANUAL',
    "meetingAt" TIMESTAMPTZ(3),
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "details" TEXT NOT NULL,
    "nextPlan" TEXT,
    "requiredAction" TEXT,
    "rawText" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MeetingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingNoteCompany" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "meetingNoteId" UUID NOT NULL,
    "companyId" UUID,
    "companyNameSnapshot" TEXT NOT NULL,
    "companyFieldSnapshot" TEXT,
    "companyRegionSnapshot" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingNoteCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingNoteContact" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "meetingNoteId" UUID NOT NULL,
    "contactId" UUID,
    "companyId" UUID,
    "contactUsernameSnapshot" TEXT NOT NULL,
    "contactEmailSnapshot" TEXT,
    "contactMobileSnapshot" TEXT,
    "contactCompanyNameSnapshot" TEXT,
    "contactDepartmentSnapshot" TEXT,
    "contactJobGradeSnapshot" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingNoteContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingNoteProduct" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "meetingNoteId" UUID NOT NULL,
    "productId" UUID,
    "productNameSnapshot" TEXT NOT NULL,
    "productPriceSnapshot" INTEGER,
    "productCategorySnapshot" TEXT,
    "productStatusSnapshot" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingNoteProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingNoteDeal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "meetingNoteId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "dealNameSnapshot" TEXT NOT NULL,
    "dealStatusSnapshot" TEXT NOT NULL,
    "dealCostSnapshot" INTEGER NOT NULL,
    "dealExpectedEndDateSnapshot" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingNoteDeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeetingNote_userId_meetingAt_idx" ON "MeetingNote"("userId", "meetingAt");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_createdAt_idx" ON "MeetingNote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MeetingNoteCompany_userId_meetingNoteId_idx" ON "MeetingNoteCompany"("userId", "meetingNoteId");

-- CreateIndex
CREATE INDEX "MeetingNoteCompany_userId_companyId_idx" ON "MeetingNoteCompany"("userId", "companyId");

-- CreateIndex
CREATE INDEX "MeetingNoteContact_userId_meetingNoteId_idx" ON "MeetingNoteContact"("userId", "meetingNoteId");

-- CreateIndex
CREATE INDEX "MeetingNoteContact_userId_contactId_idx" ON "MeetingNoteContact"("userId", "contactId");

-- CreateIndex
CREATE INDEX "MeetingNoteContact_userId_companyId_idx" ON "MeetingNoteContact"("userId", "companyId");

-- CreateIndex
CREATE INDEX "MeetingNoteProduct_userId_meetingNoteId_idx" ON "MeetingNoteProduct"("userId", "meetingNoteId");

-- CreateIndex
CREATE INDEX "MeetingNoteProduct_userId_productId_idx" ON "MeetingNoteProduct"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingNoteDeal_meetingNoteId_dealId_key" ON "MeetingNoteDeal"("meetingNoteId", "dealId");

-- CreateIndex
CREATE INDEX "MeetingNoteDeal_userId_meetingNoteId_idx" ON "MeetingNoteDeal"("userId", "meetingNoteId");

-- CreateIndex
CREATE INDEX "MeetingNoteDeal_userId_dealId_idx" ON "MeetingNoteDeal"("userId", "dealId");

-- AddForeignKey
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteCompany" ADD CONSTRAINT "MeetingNoteCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteCompany" ADD CONSTRAINT "MeetingNoteCompany_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteCompany" ADD CONSTRAINT "MeetingNoteCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteProduct" ADD CONSTRAINT "MeetingNoteProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteProduct" ADD CONSTRAINT "MeetingNoteProduct_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteProduct" ADD CONSTRAINT "MeetingNoteProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteDeal" ADD CONSTRAINT "MeetingNoteDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteDeal" ADD CONSTRAINT "MeetingNoteDeal_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteDeal" ADD CONSTRAINT "MeetingNoteDeal_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
