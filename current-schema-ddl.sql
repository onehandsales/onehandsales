-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('KAKAO', 'GOOGLE', 'NAVER', 'APPLE');

-- CreateEnum
CREATE TYPE "AuthSessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuthDeviceStatus" AS ENUM ('ACTIVE', 'REPLACED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AuthDeviceSlot" AS ENUM ('MOBILE', 'PERSONAL_LAPTOP', 'WORK_LAPTOP');

-- CreateEnum
CREATE TYPE "MeetingNoteSourceType" AS ENUM ('MANUAL', 'TEXT_AI', 'STT_AI');

-- CreateEnum
CREATE TYPE "BusinessCardScanStatus" AS ENUM ('OCR_SUCCESS', 'OCR_FAILED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "BusinessCardResolution" AS ENUM ('EXISTING', 'CREATED');

-- CreateEnum
CREATE TYPE "ImportTemplateType" AS ENUM ('COMPANY', 'CONTACT', 'PRODUCT', 'DEAL');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOAuthAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerEmail" TEXT,
    "accessTokenHash" TEXT,
    "refreshTokenHash" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthDevice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceSlot" "AuthDeviceSlot" NOT NULL,
    "deviceIdHash" TEXT NOT NULL,
    "label" TEXT,
    "status" "AuthDeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSeenAt" TIMESTAMP(3),
    "replacedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "authDeviceId" UUID NOT NULL,
    "status" "AuthSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "refreshTokenHash" TEXT,
    "userAgent" TEXT,
    "ipAddressHash" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyFieldId" UUID NOT NULL,
    "companyRegionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactJobGradeId" UUID NOT NULL,
    "contactDepartmentId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactJobGrade" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobGradeName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactJobGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactDepartment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMemoLog" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoType" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "ContactMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactUserPrivateMemoLog" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoCiphertext" TEXT NOT NULL,
    "memoKeyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "ContactUserPrivateMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productName" TEXT NOT NULL,
    "productPrice" INTEGER NOT NULL,
    "productCategoryId" UUID NOT NULL,
    "productStatusId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductStatus" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "statusName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMemoLog" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoType" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "ProductMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductUserPrivateMemoLog" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoCiphertext" TEXT NOT NULL,
    "memoKeyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "ProductUserPrivateMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealName" TEXT NOT NULL,
    "dealCost" INTEGER NOT NULL,
    "dealStatus" TEXT NOT NULL,
    "expectedEndDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "DealProduct" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealFollowingActionLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "followingAction" TEXT NOT NULL,
    "checkComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "DealFollowingActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealMemoLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "memoType" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "DealMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scheduleTitle" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "location" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleDeal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingNote" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sourceType" "MeetingNoteSourceType" NOT NULL DEFAULT 'MANUAL',
    "title" TEXT NOT NULL,
    "meetingAt" TIMESTAMPTZ(3) NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "details" TEXT NOT NULL,
    "nextPlan" TEXT,
    "requiredAction" TEXT,
    "rawText" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

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

-- CreateTable
CREATE TABLE "ImportTemplate" (
    "id" UUID NOT NULL,
    "templateType" "ImportTemplateType" NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "columnsJson" JSONB NOT NULL,
    "sampleRowsJson" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ImportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportUserLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "targetType" "ImportTemplateType" NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "templateColumnsJson" JSONB NOT NULL,
    "contextLabel" TEXT,
    "contextJson" JSONB,
    "originalFileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "totalRowCount" INTEGER NOT NULL,
    "importedRowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportUserLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportUserLogRow" (
    "id" UUID NOT NULL,
    "importUserLogId" UUID NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "submittedDataJson" JSONB NOT NULL,
    "targetLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportUserLogRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyField" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "field" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyRegion" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMemoLog" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoType" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "CompanyMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyUserPrivateMemoLog" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoCiphertext" TEXT NOT NULL,
    "memoKeyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),

    CONSTRAINT "CompanyUserPrivateMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "UserOAuthAccount_userId_idx" ON "UserOAuthAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOAuthAccount_provider_providerUserId_key" ON "UserOAuthAccount"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "AuthDevice_userId_idx" ON "AuthDevice"("userId");

-- CreateIndex
CREATE INDEX "AuthDevice_userId_deviceSlot_status_idx" ON "AuthDevice"("userId", "deviceSlot", "status");

-- CreateIndex
CREATE INDEX "AuthDevice_userId_deviceIdHash_idx" ON "AuthDevice"("userId", "deviceIdHash");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "AuthSession_authDeviceId_idx" ON "AuthSession"("authDeviceId");

-- CreateIndex
CREATE INDEX "AuthSession_status_idx" ON "AuthSession"("status");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

-- CreateIndex
CREATE INDEX "Company_userId_createdAt_idx" ON "Company"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Company_userId_companyName_idx" ON "Company"("userId", "companyName");

-- CreateIndex
CREATE INDEX "Company_userId_companyFieldId_idx" ON "Company"("userId", "companyFieldId");

-- CreateIndex
CREATE INDEX "Company_userId_companyRegionId_idx" ON "Company"("userId", "companyRegionId");

-- CreateIndex
CREATE INDEX "Company_userId_deletedAt_idx" ON "Company"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Company_userId_trashExpiresAt_idx" ON "Company"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "Contact_userId_createdAt_idx" ON "Contact"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Contact_userId_username_idx" ON "Contact"("userId", "username");

-- CreateIndex
CREATE INDEX "Contact_userId_companyId_idx" ON "Contact"("userId", "companyId");

-- CreateIndex
CREATE INDEX "Contact_userId_contactDepartmentId_idx" ON "Contact"("userId", "contactDepartmentId");

-- CreateIndex
CREATE INDEX "Contact_userId_contactJobGradeId_idx" ON "Contact"("userId", "contactJobGradeId");

-- CreateIndex
CREATE INDEX "Contact_userId_deletedAt_idx" ON "Contact"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Contact_userId_trashExpiresAt_idx" ON "Contact"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "ContactJobGrade_userId_idx" ON "ContactJobGrade"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactJobGrade_userId_jobGradeName_key" ON "ContactJobGrade"("userId", "jobGradeName");

-- CreateIndex
CREATE INDEX "ContactDepartment_userId_idx" ON "ContactDepartment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactDepartment_userId_departmentName_key" ON "ContactDepartment"("userId", "departmentName");

-- CreateIndex
CREATE INDEX "ContactMemoLog_contactId_createdAt_idx" ON "ContactMemoLog"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMemoLog_userId_contactId_idx" ON "ContactMemoLog"("userId", "contactId");

-- CreateIndex
CREATE INDEX "ContactMemoLog_userId_deletedAt_idx" ON "ContactMemoLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "ContactMemoLog_userId_trashExpiresAt_idx" ON "ContactMemoLog"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "ContactUserPrivateMemoLog_contactId_createdAt_idx" ON "ContactUserPrivateMemoLog"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "ContactUserPrivateMemoLog_userId_contactId_idx" ON "ContactUserPrivateMemoLog"("userId", "contactId");

-- CreateIndex
CREATE INDEX "ContactUserPrivateMemoLog_userId_deletedAt_idx" ON "ContactUserPrivateMemoLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "ContactUserPrivateMemoLog_userId_trashExpiresAt_idx" ON "ContactUserPrivateMemoLog"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "Product_userId_createdAt_idx" ON "Product"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_userId_productName_idx" ON "Product"("userId", "productName");

-- CreateIndex
CREATE INDEX "Product_userId_productCategoryId_idx" ON "Product"("userId", "productCategoryId");

-- CreateIndex
CREATE INDEX "Product_userId_productStatusId_idx" ON "Product"("userId", "productStatusId");

-- CreateIndex
CREATE INDEX "Product_userId_deletedAt_idx" ON "Product"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Product_userId_trashExpiresAt_idx" ON "Product"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "ProductCategory_userId_idx" ON "ProductCategory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_userId_categoryName_key" ON "ProductCategory"("userId", "categoryName");

-- CreateIndex
CREATE INDEX "ProductStatus_userId_idx" ON "ProductStatus"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductStatus_userId_statusName_key" ON "ProductStatus"("userId", "statusName");

-- CreateIndex
CREATE INDEX "ProductMemoLog_productId_createdAt_idx" ON "ProductMemoLog"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductMemoLog_userId_productId_idx" ON "ProductMemoLog"("userId", "productId");

-- CreateIndex
CREATE INDEX "ProductMemoLog_userId_deletedAt_idx" ON "ProductMemoLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "ProductMemoLog_userId_trashExpiresAt_idx" ON "ProductMemoLog"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "ProductUserPrivateMemoLog_productId_createdAt_idx" ON "ProductUserPrivateMemoLog"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductUserPrivateMemoLog_userId_productId_idx" ON "ProductUserPrivateMemoLog"("userId", "productId");

-- CreateIndex
CREATE INDEX "ProductUserPrivateMemoLog_userId_deletedAt_idx" ON "ProductUserPrivateMemoLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "ProductUserPrivateMemoLog_userId_trashExpiresAt_idx" ON "ProductUserPrivateMemoLog"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "Deal_userId_createdAt_idx" ON "Deal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Deal_userId_dealName_idx" ON "Deal"("userId", "dealName");

-- CreateIndex
CREATE INDEX "Deal_userId_dealStatus_idx" ON "Deal"("userId", "dealStatus");

-- CreateIndex
CREATE INDEX "Deal_userId_expectedEndDate_idx" ON "Deal"("userId", "expectedEndDate");

-- CreateIndex
CREATE INDEX "Deal_userId_dealCost_idx" ON "Deal"("userId", "dealCost");

-- CreateIndex
CREATE INDEX "Deal_userId_deletedAt_idx" ON "Deal"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Deal_userId_trashExpiresAt_idx" ON "Deal"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "DealCompany_userId_dealId_idx" ON "DealCompany"("userId", "dealId");

-- CreateIndex
CREATE INDEX "DealCompany_userId_companyId_idx" ON "DealCompany"("userId", "companyId");

-- CreateIndex
CREATE INDEX "DealCompany_companyId_idx" ON "DealCompany"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DealCompany_dealId_companyId_key" ON "DealCompany"("dealId", "companyId");

-- CreateIndex
CREATE INDEX "DealContact_userId_dealId_idx" ON "DealContact"("userId", "dealId");

-- CreateIndex
CREATE INDEX "DealContact_userId_contactId_idx" ON "DealContact"("userId", "contactId");

-- CreateIndex
CREATE INDEX "DealContact_contactId_idx" ON "DealContact"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "DealContact_dealId_contactId_key" ON "DealContact"("dealId", "contactId");

-- CreateIndex
CREATE INDEX "DealProduct_userId_dealId_idx" ON "DealProduct"("userId", "dealId");

-- CreateIndex
CREATE INDEX "DealProduct_userId_productId_idx" ON "DealProduct"("userId", "productId");

-- CreateIndex
CREATE INDEX "DealProduct_productId_idx" ON "DealProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "DealProduct_dealId_productId_key" ON "DealProduct"("dealId", "productId");

-- CreateIndex
CREATE INDEX "DealFollowingActionLog_dealId_createdAt_idx" ON "DealFollowingActionLog"("dealId", "createdAt");

-- CreateIndex
CREATE INDEX "DealFollowingActionLog_userId_dealId_idx" ON "DealFollowingActionLog"("userId", "dealId");

-- CreateIndex
CREATE INDEX "DealFollowingActionLog_userId_checkComplete_idx" ON "DealFollowingActionLog"("userId", "checkComplete");

-- CreateIndex
CREATE INDEX "DealFollowingActionLog_userId_deletedAt_idx" ON "DealFollowingActionLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "DealFollowingActionLog_userId_trashExpiresAt_idx" ON "DealFollowingActionLog"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "DealMemoLog_dealId_createdAt_idx" ON "DealMemoLog"("dealId", "createdAt");

-- CreateIndex
CREATE INDEX "DealMemoLog_userId_dealId_idx" ON "DealMemoLog"("userId", "dealId");

-- CreateIndex
CREATE INDEX "DealMemoLog_userId_deletedAt_idx" ON "DealMemoLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "DealMemoLog_userId_trashExpiresAt_idx" ON "DealMemoLog"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_startAt_idx" ON "Schedule"("userId", "startAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_createdAt_idx" ON "Schedule"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ScheduleDeal_userId_scheduleId_idx" ON "ScheduleDeal"("userId", "scheduleId");

-- CreateIndex
CREATE INDEX "ScheduleDeal_userId_dealId_idx" ON "ScheduleDeal"("userId", "dealId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleDeal_scheduleId_dealId_key" ON "ScheduleDeal"("scheduleId", "dealId");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_meetingAt_idx" ON "MeetingNote"("userId", "meetingAt");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_title_idx" ON "MeetingNote"("userId", "title");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_createdAt_idx" ON "MeetingNote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_deletedAt_idx" ON "MeetingNote"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "MeetingNote_userId_trashExpiresAt_idx" ON "MeetingNote"("userId", "trashExpiresAt");

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
CREATE INDEX "MeetingNoteDeal_userId_meetingNoteId_idx" ON "MeetingNoteDeal"("userId", "meetingNoteId");

-- CreateIndex
CREATE INDEX "MeetingNoteDeal_userId_dealId_idx" ON "MeetingNoteDeal"("userId", "dealId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingNoteDeal_meetingNoteId_dealId_key" ON "MeetingNoteDeal"("meetingNoteId", "dealId");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_createdAt_idx" ON "BusinessCardScanLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_status_createdAt_idx" ON "BusinessCardScanLog"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_companyId_idx" ON "BusinessCardScanLog"("userId", "companyId");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_contactId_idx" ON "BusinessCardScanLog"("userId", "contactId");

-- CreateIndex
CREATE INDEX "ImportTemplate_templateType_isActive_idx" ON "ImportTemplate"("templateType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ImportTemplate_templateType_templateVersion_key" ON "ImportTemplate"("templateType", "templateVersion");

-- CreateIndex
CREATE INDEX "ImportUserLog_userId_createdAt_idx" ON "ImportUserLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ImportUserLog_userId_targetType_createdAt_idx" ON "ImportUserLog"("userId", "targetType", "createdAt");

-- CreateIndex
CREATE INDEX "ImportUserLogRow_importUserLogId_rowNumber_idx" ON "ImportUserLogRow"("importUserLogId", "rowNumber");

-- CreateIndex
CREATE INDEX "CompanyField_userId_idx" ON "CompanyField"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyField_userId_field_key" ON "CompanyField"("userId", "field");

-- CreateIndex
CREATE INDEX "CompanyRegion_userId_idx" ON "CompanyRegion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyRegion_userId_region_key" ON "CompanyRegion"("userId", "region");

-- CreateIndex
CREATE INDEX "CompanyMemoLog_companyId_createdAt_idx" ON "CompanyMemoLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyMemoLog_userId_companyId_idx" ON "CompanyMemoLog"("userId", "companyId");

-- CreateIndex
CREATE INDEX "CompanyMemoLog_userId_deletedAt_idx" ON "CompanyMemoLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "CompanyMemoLog_userId_trashExpiresAt_idx" ON "CompanyMemoLog"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "CompanyUserPrivateMemoLog_companyId_createdAt_idx" ON "CompanyUserPrivateMemoLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyUserPrivateMemoLog_userId_companyId_idx" ON "CompanyUserPrivateMemoLog"("userId", "companyId");

-- CreateIndex
CREATE INDEX "CompanyUserPrivateMemoLog_userId_deletedAt_idx" ON "CompanyUserPrivateMemoLog"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "CompanyUserPrivateMemoLog_userId_trashExpiresAt_idx" ON "CompanyUserPrivateMemoLog"("userId", "trashExpiresAt");

-- AddForeignKey
ALTER TABLE "UserOAuthAccount" ADD CONSTRAINT "UserOAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthDevice" ADD CONSTRAINT "AuthDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_authDeviceId_fkey" FOREIGN KEY ("authDeviceId") REFERENCES "AuthDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_companyFieldId_fkey" FOREIGN KEY ("companyFieldId") REFERENCES "CompanyField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_companyRegionId_fkey" FOREIGN KEY ("companyRegionId") REFERENCES "CompanyRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contactJobGradeId_fkey" FOREIGN KEY ("contactJobGradeId") REFERENCES "ContactJobGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contactDepartmentId_fkey" FOREIGN KEY ("contactDepartmentId") REFERENCES "ContactDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactJobGrade" ADD CONSTRAINT "ContactJobGrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactDepartment" ADD CONSTRAINT "ContactDepartment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMemoLog" ADD CONSTRAINT "ContactMemoLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMemoLog" ADD CONSTRAINT "ContactMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactUserPrivateMemoLog" ADD CONSTRAINT "ContactUserPrivateMemoLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactUserPrivateMemoLog" ADD CONSTRAINT "ContactUserPrivateMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productStatusId_fkey" FOREIGN KEY ("productStatusId") REFERENCES "ProductStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStatus" ADD CONSTRAINT "ProductStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMemoLog" ADD CONSTRAINT "ProductMemoLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMemoLog" ADD CONSTRAINT "ProductMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUserPrivateMemoLog" ADD CONSTRAINT "ProductUserPrivateMemoLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUserPrivateMemoLog" ADD CONSTRAINT "ProductUserPrivateMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "DealProduct" ADD CONSTRAINT "DealProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealProduct" ADD CONSTRAINT "DealProduct_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealProduct" ADD CONSTRAINT "DealProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealFollowingActionLog" ADD CONSTRAINT "DealFollowingActionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealFollowingActionLog" ADD CONSTRAINT "DealFollowingActionLog_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealMemoLog" ADD CONSTRAINT "DealMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealMemoLog" ADD CONSTRAINT "DealMemoLog_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleDeal" ADD CONSTRAINT "ScheduleDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleDeal" ADD CONSTRAINT "ScheduleDeal_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleDeal" ADD CONSTRAINT "ScheduleDeal_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteCompany" ADD CONSTRAINT "MeetingNoteCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteCompany" ADD CONSTRAINT "MeetingNoteCompany_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteCompany" ADD CONSTRAINT "MeetingNoteCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteContact" ADD CONSTRAINT "MeetingNoteContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteProduct" ADD CONSTRAINT "MeetingNoteProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteProduct" ADD CONSTRAINT "MeetingNoteProduct_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteProduct" ADD CONSTRAINT "MeetingNoteProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteDeal" ADD CONSTRAINT "MeetingNoteDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteDeal" ADD CONSTRAINT "MeetingNoteDeal_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "MeetingNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingNoteDeal" ADD CONSTRAINT "MeetingNoteDeal_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScanLog" ADD CONSTRAINT "BusinessCardScanLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScanLog" ADD CONSTRAINT "BusinessCardScanLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCardScanLog" ADD CONSTRAINT "BusinessCardScanLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportUserLog" ADD CONSTRAINT "ImportUserLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportUserLogRow" ADD CONSTRAINT "ImportUserLogRow_importUserLogId_fkey" FOREIGN KEY ("importUserLogId") REFERENCES "ImportUserLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyField" ADD CONSTRAINT "CompanyField_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyRegion" ADD CONSTRAINT "CompanyRegion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMemoLog" ADD CONSTRAINT "CompanyMemoLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMemoLog" ADD CONSTRAINT "CompanyMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUserPrivateMemoLog" ADD CONSTRAINT "CompanyUserPrivateMemoLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUserPrivateMemoLog" ADD CONSTRAINT "CompanyUserPrivateMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

