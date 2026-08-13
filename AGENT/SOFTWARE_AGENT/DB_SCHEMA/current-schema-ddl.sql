-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('KAKAO', 'GOOGLE', 'APPLE', 'LINE');

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

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('UPLOADED', 'MAPPED', 'NEEDS_REVIEW', 'READY_TO_CONFIRM', 'CONFIRMING', 'CONFIRMED', 'FAILED', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ImportJobRowStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'EXCLUDED', 'IMPORTED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportJobMappingSource" AS ENUM ('NONE', 'AI', 'RULE_BASED', 'USER');

-- CreateEnum
CREATE TYPE "ImportUploadedFileStatus" AS ENUM ('STORED', 'PARSED', 'DELETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ImportJobErrorType" AS ENUM ('PARSE', 'AI_MAPPING', 'VALIDATION', 'CONFIRM', 'STORAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ImportJobErrorSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SCHEDULE_START_REMINDER', 'DEAL_DUE_REMINDER');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "NotificationSourceType" AS ENUM ('SCHEDULE', 'DEAL');

-- CreateEnum
CREATE TYPE "NotificationDeliveryChannel" AS ENUM ('EMAIL', 'BROWSER_PUSH');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "BrowserPushSubscriptionStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "ExternalCalendarProvider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "ExternalCalendarConnectionStatus" AS ENUM ('CONNECTED', 'RECONNECT_REQUIRED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "ExternalCalendarSourceStatus" AS ENUM ('SELECTED', 'UNSELECTED');

-- CreateEnum
CREATE TYPE "ScheduleSourceType" AS ENUM ('INTERNAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "ScheduleExternalSyncStatus" AS ENUM ('SYNCED', 'LOCAL_MODIFIED', 'GOOGLE_DELETED', 'LOCAL_DELETED');

-- CreateEnum
CREATE TYPE "AiWeeklySalesReportStatus" AS ENUM ('GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AiWeeklySalesReportSuggestionType" AS ENUM ('RISK', 'NEXT_ACTION', 'FOLLOW_UP', 'DATA_CLEANUP');

-- CreateEnum
CREATE TYPE "AiSuggestionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AiJobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AiProviderOperation" AS ENUM ('WEEKLY_SALES_REPORT', 'FOLLOW_UP_EMAIL_DRAFT', 'FOLLOW_UP_SMS_DRAFT', 'MEETING_NOTE_TEXT_DRAFT', 'MEETING_NOTE_STT_TRANSCRIPTION', 'MEETING_NOTE_STT_DRAFT', 'MEETING_NOTE_NEXT_ACTION_DRAFT', 'MEETING_NOTE_FOLLOW_UP_DRAFT');

-- CreateEnum
CREATE TYPE "AiProviderCallStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ExternalEmailProvider" AS ENUM ('GOOGLE', 'MICROSOFT');

-- CreateEnum
CREATE TYPE "ExternalEmailConnectionStatus" AS ENUM ('CONNECTED', 'RECONNECT_REQUIRED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "SmsSenderNumberStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REVOKED');

-- CreateEnum
CREATE TYPE "FollowUpDeliveryChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "FollowUpMessageStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "FollowUpTargetType" AS ENUM ('AI_WEEKLY_REPORT', 'DEAL', 'CONTACT', 'MEETING_NOTE', 'SCHEDULE');

-- CreateEnum
CREATE TYPE "FollowUpDeliveryAttemptStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "DealActivityType" AS ENUM ('DEAL_CREATED', 'STAGE_CHANGED', 'NEXT_ACTION_CREATED', 'NEXT_ACTION_COMPLETION_CHANGED', 'SCHEDULE_LINKED', 'SCHEDULE_UNLINKED', 'MEETING_NOTE_LINKED', 'MEETING_NOTE_UNLINKED', 'FOLLOW_UP_SENT', 'FOLLOW_UP_FAILED', 'CALL', 'MEETING', 'EMAIL', 'VISIT', 'NOTE');

-- CreateEnum
CREATE TYPE "DealActivitySourceType" AS ENUM ('SYSTEM', 'USER', 'NEXT_ACTION', 'SCHEDULE', 'MEETING_NOTE', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "ProductAnalyticsEventSource" AS ENUM ('CLIENT', 'SERVER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "UserActivationStatus" AS ENUM ('NOT_ACTIVATED', 'ACTIVATED');

-- CreateEnum
CREATE TYPE "ProductAnalyticsTargetType" AS ENUM ('USER', 'DEAL', 'SCHEDULE', 'MEETING_NOTE', 'BUSINESS_CARD_SCAN', 'IMPORT_JOB', 'EXPORT');

-- CreateEnum
CREATE TYPE "AdminAuditAction" AS ENUM ('ADMIN_LOGIN', 'ADMIN_USER_LIST_VIEW', 'ADMIN_USER_DETAIL_VIEW', 'ADMIN_DOMAIN_RECORDS_VIEW', 'ADMIN_TRASH_VIEW', 'ADMIN_PROVIDER_FAILURE_VIEW', 'ADMIN_ANALYTICS_VIEW', 'ADMIN_ACCOUNT_DELETION_VIEW', 'ADMIN_DATA_EXPORT_VIEW', 'ADMIN_SYSTEM_CHECK_VIEW', 'ADMIN_SYSTEM_CHECK_RECORDED', 'ADMIN_SENSITIVE_RAW_ACCESS');

-- CreateEnum
CREATE TYPE "AdminAuditResult" AS ENUM ('SUCCESS', 'DENIED', 'FAILED');

-- CreateEnum
CREATE TYPE "AdminTargetType" AS ENUM ('USER', 'COMPANY', 'CONTACT', 'PRODUCT', 'DEAL', 'SCHEDULE', 'MEETING_NOTE', 'BUSINESS_CARD_SCAN', 'IMPORT_JOB', 'NOTIFICATION', 'PROVIDER_FAILURE', 'TRASH_RECORD', 'ACCOUNT_DELETION_REQUEST', 'DATA_EXPORT_REQUEST', 'SYSTEM_OPERATION_CHECK');

-- CreateEnum
CREATE TYPE "AdminSensitiveFieldSet" AS ENUM ('USER_CONTACT', 'DOMAIN_MEMO', 'MEETING_NOTE_BODY', 'TRASH_RECORD_DETAIL');

-- CreateEnum
CREATE TYPE "TrashRecoveryRequestStatus" AS ENUM ('REQUESTED', 'REVIEWING', 'WAITING_RECOVERY_POLICY', 'RECOVERY_AVAILABLE', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AccountDeletionRequestStatus" AS ENUM ('REQUESTED', 'CANCELLED', 'PROCESSING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "UserDataExportRequestStatus" AS ENUM ('REQUESTED', 'PROCESSING', 'READY', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "AdminOperationCheckRunStatus" AS ENUM ('PASS', 'WARN', 'FAIL');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "preferredLocale" TEXT NOT NULL DEFAULT 'ko-KR',
    "countryCode" TEXT NOT NULL DEFAULT 'KR',
    "defaultCurrencyCode" TEXT NOT NULL DEFAULT 'KRW',
    "signupLocale" TEXT,
    "signupCountryCode" TEXT,
    "signupTimeZone" TEXT,
    "lastLoginLocale" TEXT,
    "lastLoginCountryCode" TEXT,
    "lastLoginTimeZone" TEXT,
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
CREATE TABLE "AdminAuditLog" (
    "id" UUID NOT NULL,
    "adminUserId" UUID NOT NULL,
    "targetUserId" UUID,
    "targetType" "AdminTargetType" NOT NULL,
    "targetId" UUID,
    "action" "AdminAuditAction" NOT NULL,
    "result" "AdminAuditResult" NOT NULL DEFAULT 'SUCCESS',
    "reason" TEXT,
    "requestId" TEXT,
    "ipHash" TEXT,
    "userAgentHash" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSensitiveAccessLog" (
    "id" UUID NOT NULL,
    "auditLogId" UUID NOT NULL,
    "adminUserId" UUID NOT NULL,
    "targetUserId" UUID NOT NULL,
    "targetType" "AdminTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "fieldSet" "AdminSensitiveFieldSet" NOT NULL,
    "reason" TEXT NOT NULL,
    "returnedFieldNames" TEXT[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSensitiveAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrashRecoveryRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "deletedAt" TIMESTAMPTZ(3) NOT NULL,
    "trashExpiresAt" TIMESTAMPTZ(3) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TrashRecoveryRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "TrashRecoveryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountDeletionRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "AccountDeletionRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "reasonCode" TEXT,
    "reasonMessage" TEXT,
    "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledDeletionAt" TIMESTAMPTZ(3) NOT NULL,
    "canCancelUntil" TIMESTAMPTZ(3) NOT NULL,
    "cancelledAt" TIMESTAMPTZ(3),
    "processingStartedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDataExportRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "UserDataExportRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "includeSensitive" BOOLEAN NOT NULL DEFAULT false,
    "format" TEXT NOT NULL DEFAULT 'ZIP_JSON_XLSX',
    "artifactPath" TEXT,
    "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingStartedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3),
    "safeErrorCode" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserDataExportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminOperationCheckRun" (
    "id" UUID NOT NULL,
    "adminUserId" UUID NOT NULL,
    "environment" TEXT NOT NULL,
    "status" "AdminOperationCheckRunStatus" NOT NULL,
    "itemsJson" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "checkedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminOperationCheckRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAnalyticsEvent" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "authSessionId" UUID,
    "authDeviceId" UUID,
    "eventName" TEXT NOT NULL,
    "eventVersion" INTEGER NOT NULL DEFAULT 1,
    "source" "ProductAnalyticsEventSource" NOT NULL,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL,
    "eventDate" DATE NOT NULL,
    "timeZone" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "targetType" "ProductAnalyticsTargetType",
    "targetId" UUID,
    "payloadJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivationSnapshot" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "UserActivationStatus" NOT NULL DEFAULT 'NOT_ACTIVATED',
    "firstDealCreatedAt" TIMESTAMPTZ(3),
    "firstMeaningfulActionAt" TIMESTAMPTZ(3),
    "activatedAt" TIMESTAMPTZ(3),
    "activatedEventDate" DATE,
    "timeZone" TEXT,
    "calculatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserActivationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionCohortSnapshot" (
    "id" UUID NOT NULL,
    "cohortDate" DATE NOT NULL,
    "dayOffset" INTEGER NOT NULL,
    "cohortUserCount" INTEGER NOT NULL,
    "retainedUserCount" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RetentionCohortSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyFieldId" UUID NOT NULL,
    "companyRegionId" UUID NOT NULL,
    "address" TEXT,
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
    "phoneCountryCode" TEXT,
    "phoneNationalNumber" TEXT,
    "phoneE164" TEXT,
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
    "currencyCode" TEXT NOT NULL DEFAULT 'KRW',
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
    "currencyCode" TEXT NOT NULL DEFAULT 'KRW',
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
CREATE TABLE "DealActivity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "activityType" "DealActivityType" NOT NULL,
    "sourceType" "DealActivitySourceType" NOT NULL,
    "sourceId" UUID,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL,
    "linkedRecordsJson" JSONB,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DealActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalCalendarConnection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "ExternalCalendarProvider" NOT NULL,
    "providerAccountId" TEXT,
    "providerAccountEmail" TEXT,
    "status" "ExternalCalendarConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMPTZ(3),
    "grantedScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "connectedAt" TIMESTAMPTZ(3),
    "disconnectedAt" TIMESTAMPTZ(3),
    "reconnectRequiredAt" TIMESTAMPTZ(3),
    "lastSyncedAt" TIMESTAMPTZ(3),
    "lastSyncStartedAt" TIMESTAMPTZ(3),
    "lastSyncFailedAt" TIMESTAMPTZ(3),
    "lastSyncErrorCode" TEXT,
    "syncLockExpiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalCalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalCalendarSource" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "connectionId" UUID NOT NULL,
    "provider" "ExternalCalendarProvider" NOT NULL,
    "calendarId" TEXT NOT NULL,
    "calendarName" TEXT NOT NULL,
    "calendarTimeZone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isSystemCalendar" BOOLEAN NOT NULL DEFAULT false,
    "status" "ExternalCalendarSourceStatus" NOT NULL DEFAULT 'UNSELECTED',
    "syncToken" TEXT,
    "lastSyncedAt" TIMESTAMPTZ(3),
    "lastSyncFailedAt" TIMESTAMPTZ(3),
    "lastSyncErrorCode" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalCalendarSource_pkey" PRIMARY KEY ("id")
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
    "meetingUrl" TEXT,
    "memo" TEXT,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" "ScheduleSourceType" NOT NULL DEFAULT 'INTERNAL',
    "externalCalendarSourceId" UUID,
    "externalEventId" TEXT,
    "externalEventICalUid" TEXT,
    "externalEventEtag" TEXT,
    "externalHtmlLink" TEXT,
    "externalUpdatedAt" TIMESTAMPTZ(3),
    "lastExternalSyncedAt" TIMESTAMPTZ(3),
    "externalDeletedAt" TIMESTAMPTZ(3),
    "externalSyncStatus" "ScheduleExternalSyncStatus",
    "deletedAt" TIMESTAMPTZ(3),
    "deletedByUserId" UUID,
    "trashExpiresAt" TIMESTAMPTZ(3),
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
CREATE TABLE "AiWeeklySalesReport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekEnd" DATE NOT NULL,
    "timeZone" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "AiWeeklySalesReportStatus" NOT NULL DEFAULT 'GENERATING',
    "provider" TEXT,
    "model" TEXT,
    "inputSnapshotJson" JSONB NOT NULL DEFAULT '{}',
    "inputMetadataJson" JSONB NOT NULL DEFAULT '{}',
    "outputJson" JSONB,
    "dataCoverageJson" JSONB NOT NULL DEFAULT '{}',
    "safeErrorCode" TEXT,
    "safeErrorMessage" TEXT,
    "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMPTZ(3),
    "generatedAt" TIMESTAMPTZ(3),
    "failedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiWeeklySalesReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiWeeklySalesReportSuggestion" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "AiWeeklySalesReportSuggestionType" NOT NULL,
    "suggestionKey" TEXT NOT NULL,
    "priority" "AiSuggestionPriority" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "reason" TEXT,
    "targetType" TEXT,
    "targetId" UUID,
    "targetPath" TEXT,
    "targetLabel" TEXT,
    "payloadJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiWeeklySalesReportSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiJob" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "operation" "AiProviderOperation" NOT NULL,
    "status" "AiJobStatus" NOT NULL DEFAULT 'PENDING',
    "targetType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "idempotencyKey" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttemptCount" INTEGER NOT NULL DEFAULT 1,
    "safeErrorCode" TEXT,
    "safeErrorMessage" TEXT,
    "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "failedAt" TIMESTAMPTZ(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProviderCallLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "operation" "AiProviderOperation" NOT NULL,
    "status" "AiProviderCallStatus" NOT NULL DEFAULT 'PENDING',
    "reportId" UUID,
    "jobId" UUID,
    "targetType" TEXT,
    "targetId" UUID,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "requestId" TEXT,
    "latencyMs" INTEGER,
    "inputTokenCount" INTEGER,
    "outputTokenCount" INTEGER,
    "totalTokenCount" INTEGER,
    "estimatedCostAmount" DECIMAL(12,6),
    "costCurrency" TEXT NOT NULL DEFAULT 'USD',
    "safeErrorCode" TEXT,
    "safeErrorMessage" TEXT,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(3),
    "failedAt" TIMESTAMPTZ(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiProviderCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalEmailConnection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "ExternalEmailProvider" NOT NULL,
    "providerAccountId" TEXT,
    "providerAccountEmail" TEXT NOT NULL,
    "status" "ExternalEmailConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMPTZ(3),
    "grantedScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "connectedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnectedAt" TIMESTAMPTZ(3),
    "reconnectRequiredAt" TIMESTAMPTZ(3),
    "lastSentAt" TIMESTAMPTZ(3),
    "lastSendSafeErrorCode" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalEmailConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalEmailOAuthState" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "ExternalEmailProvider" NOT NULL,
    "stateHash" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "consumedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalEmailOAuthState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsSenderNumber" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "phoneE164Hash" TEXT NOT NULL,
    "phoneE164Ciphertext" TEXT NOT NULL,
    "phoneE164Masked" TEXT NOT NULL,
    "status" "SmsSenderNumberStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "provider" TEXT,
    "providerSenderId" TEXT,
    "verificationCodeHash" TEXT,
    "verificationExpiresAt" TIMESTAMPTZ(3),
    "verifiedAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "lastSentAt" TIMESTAMPTZ(3),
    "lastSendSafeErrorCode" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsSenderNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpConsentNotice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "channel" "FollowUpDeliveryChannel" NOT NULL,
    "acknowledgedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUpConsentNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpMessage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sourceReportId" UUID,
    "sourceSuggestionId" UUID,
    "channel" "FollowUpDeliveryChannel" NOT NULL,
    "status" "FollowUpMessageStatus" NOT NULL DEFAULT 'DRAFT',
    "languageTag" TEXT NOT NULL,
    "emailConnectionId" UUID,
    "smsSenderNumberId" UUID,
    "senderDisplayName" TEXT,
    "senderEmail" TEXT,
    "senderPhoneE164Masked" TEXT,
    "recipientContactId" UUID,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhoneE164Masked" TEXT,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "bodyPreview" TEXT NOT NULL,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "safeErrorCode" TEXT,
    "safeErrorMessage" TEXT,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMPTZ(3),
    "failedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUpMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpMessageTarget" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "targetType" "FollowUpTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "targetPath" TEXT NOT NULL,
    "targetLabel" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUpMessageTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpDeliveryAttempt" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "channel" "FollowUpDeliveryChannel" NOT NULL,
    "status" "FollowUpDeliveryAttemptStatus" NOT NULL DEFAULT 'PENDING',
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "providerStatusCode" TEXT,
    "safeErrorCode" TEXT,
    "safeErrorMessage" TEXT,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "nextRetryAt" TIMESTAMPTZ(3),
    "latencyMs" INTEGER,
    "estimatedCostAmount" DECIMAL(12,6),
    "costCurrency" TEXT NOT NULL DEFAULT 'USD',
    "sentAt" TIMESTAMPTZ(3),
    "failedAt" TIMESTAMPTZ(3),
    "detailJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUpDeliveryAttempt_pkey" PRIMARY KEY ("id")
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
    "safeErrorCode" TEXT,
    "safeErrorMessage" TEXT,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "ImportJob" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "targetType" "ImportTemplateType" NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "templateColumnsJson" JSONB NOT NULL,
    "sourceColumnsJson" JSONB NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'UPLOADED',
    "mappingJson" JSONB NOT NULL DEFAULT '{}',
    "mappingSource" "ImportJobMappingSource" NOT NULL DEFAULT 'NONE',
    "contextLabel" TEXT,
    "contextJson" JSONB,
    "originalFileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "totalRowCount" INTEGER NOT NULL DEFAULT 0,
    "validRowCount" INTEGER NOT NULL DEFAULT 0,
    "invalidRowCount" INTEGER NOT NULL DEFAULT 0,
    "importedRowCount" INTEGER NOT NULL DEFAULT 0,
    "failedRowCount" INTEGER NOT NULL DEFAULT 0,
    "importUserLogId" UUID,
    "confirmIdempotencyKey" VARCHAR(128),
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "confirmedAt" TIMESTAMPTZ(3),
    "canceledAt" TIMESTAMPTZ(3),
    "failedAt" TIMESTAMPTZ(3),
    "lastErrorCode" TEXT,
    "lastErrorMessage" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJobRow" (
    "id" UUID NOT NULL,
    "importJobId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawDataJson" JSONB NOT NULL,
    "mappedDataJson" JSONB NOT NULL DEFAULT '{}',
    "normalizedDataJson" JSONB,
    "status" "ImportJobRowStatus" NOT NULL DEFAULT 'PENDING',
    "validationErrorsJson" JSONB NOT NULL DEFAULT '[]',
    "targetLabel" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJobRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJobError" (
    "id" UUID NOT NULL,
    "importJobId" UUID NOT NULL,
    "importJobRowId" UUID,
    "userId" UUID NOT NULL,
    "errorType" "ImportJobErrorType" NOT NULL,
    "errorCode" TEXT NOT NULL,
    "severity" "ImportJobErrorSeverity" NOT NULL DEFAULT 'ERROR',
    "rowNumber" INTEGER,
    "fieldKey" TEXT,
    "safeMessage" TEXT NOT NULL,
    "detailJson" JSONB,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJobError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportUploadedFile" (
    "id" UUID NOT NULL,
    "importJobId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storageBucket" TEXT,
    "storageKey" TEXT NOT NULL,
    "status" "ImportUploadedFileStatus" NOT NULL DEFAULT 'STORED',
    "uploadedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportUploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationSetting" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scheduleReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dealDueReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailNotificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "browserPushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleReminderMinutes" INTEGER NOT NULL DEFAULT 30,
    "dealDueReminderDaysBefore" INTEGER NOT NULL DEFAULT 1,
    "dealDueReminderLocalTime" TEXT NOT NULL DEFAULT '09:00',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "sourceType" "NotificationSourceType" NOT NULL,
    "sourceId" UUID NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "targetLabel" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMPTZ(3) NOT NULL,
    "sentAt" TIMESTAMPTZ(3),
    "readAt" TIMESTAMPTZ(3),
    "canceledAt" TIMESTAMPTZ(3),
    "cancelReason" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDeliveryAttempt" (
    "id" UUID NOT NULL,
    "notificationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "channel" "NotificationDeliveryChannel" NOT NULL,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "providerStatusCode" TEXT,
    "safeErrorCode" TEXT,
    "safeErrorMessage" TEXT,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "nextRetryAt" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3),
    "failedAt" TIMESTAMPTZ(3),
    "detailJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationDeliveryAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrowserPushSubscription" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "endpointHash" TEXT NOT NULL,
    "endpointCiphertext" TEXT NOT NULL,
    "p256dhCiphertext" TEXT NOT NULL,
    "authCiphertext" TEXT NOT NULL,
    "contentKeyVersion" TEXT NOT NULL,
    "status" "BrowserPushSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "userAgent" TEXT,
    "deviceLabel" TEXT,
    "lastSeenAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrowserPushSubscription_pkey" PRIMARY KEY ("id")
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
    "countryCode" TEXT,
    "regionCode" TEXT,
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
CREATE INDEX "AdminAuditLog_adminUserId_createdAt_idx" ON "AdminAuditLog"("adminUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetUserId_createdAt_idx" ON "AdminAuditLog"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetType_targetId_createdAt_idx" ON "AdminAuditLog"("targetType", "targetId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSensitiveAccessLog_auditLogId_key" ON "AdminSensitiveAccessLog"("auditLogId");

-- CreateIndex
CREATE INDEX "AdminSensitiveAccessLog_adminUserId_createdAt_idx" ON "AdminSensitiveAccessLog"("adminUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminSensitiveAccessLog_targetUserId_createdAt_idx" ON "AdminSensitiveAccessLog"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminSensitiveAccessLog_targetType_targetId_createdAt_idx" ON "AdminSensitiveAccessLog"("targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "TrashRecoveryRequest_userId_status_createdAt_idx" ON "TrashRecoveryRequest"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "TrashRecoveryRequest_targetType_targetId_idx" ON "TrashRecoveryRequest"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "TrashRecoveryRequest_status_createdAt_idx" ON "TrashRecoveryRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TrashRecoveryRequest_createdAt_idx" ON "TrashRecoveryRequest"("createdAt");

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_userId_status_requestedAt_idx" ON "AccountDeletionRequest"("userId", "status", "requestedAt");

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_status_requestedAt_idx" ON "AccountDeletionRequest"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_scheduledDeletionAt_idx" ON "AccountDeletionRequest"("scheduledDeletionAt");

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_createdAt_idx" ON "AccountDeletionRequest"("createdAt");

-- CreateIndex
CREATE INDEX "UserDataExportRequest_userId_status_requestedAt_idx" ON "UserDataExportRequest"("userId", "status", "requestedAt");

-- CreateIndex
CREATE INDEX "UserDataExportRequest_status_requestedAt_idx" ON "UserDataExportRequest"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "UserDataExportRequest_expiresAt_idx" ON "UserDataExportRequest"("expiresAt");

-- CreateIndex
CREATE INDEX "UserDataExportRequest_createdAt_idx" ON "UserDataExportRequest"("createdAt");

-- CreateIndex
CREATE INDEX "AdminOperationCheckRun_environment_checkedAt_idx" ON "AdminOperationCheckRun"("environment", "checkedAt");

-- CreateIndex
CREATE INDEX "AdminOperationCheckRun_status_checkedAt_idx" ON "AdminOperationCheckRun"("status", "checkedAt");

-- CreateIndex
CREATE INDEX "AdminOperationCheckRun_adminUserId_checkedAt_idx" ON "AdminOperationCheckRun"("adminUserId", "checkedAt");

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_userId_eventName_occurredAt_idx" ON "ProductAnalyticsEvent"("userId", "eventName", "occurredAt");

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_userId_eventDate_idx" ON "ProductAnalyticsEvent"("userId", "eventDate");

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_eventName_eventDate_idx" ON "ProductAnalyticsEvent"("eventName", "eventDate");

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_source_createdAt_idx" ON "ProductAnalyticsEvent"("source", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_occurredAt_idx" ON "ProductAnalyticsEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_authSessionId_idx" ON "ProductAnalyticsEvent"("authSessionId");

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_authDeviceId_idx" ON "ProductAnalyticsEvent"("authDeviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAnalyticsEvent_userId_eventName_idempotencyKey_key" ON "ProductAnalyticsEvent"("userId", "eventName", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserActivationSnapshot_userId_key" ON "UserActivationSnapshot"("userId");

-- CreateIndex
CREATE INDEX "UserActivationSnapshot_status_activatedEventDate_idx" ON "UserActivationSnapshot"("status", "activatedEventDate");

-- CreateIndex
CREATE INDEX "UserActivationSnapshot_activatedAt_idx" ON "UserActivationSnapshot"("activatedAt");

-- CreateIndex
CREATE INDEX "RetentionCohortSnapshot_cohortDate_idx" ON "RetentionCohortSnapshot"("cohortDate");

-- CreateIndex
CREATE UNIQUE INDEX "RetentionCohortSnapshot_cohortDate_dayOffset_key" ON "RetentionCohortSnapshot"("cohortDate", "dayOffset");

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
CREATE INDEX "Contact_userId_phoneE164_idx" ON "Contact"("userId", "phoneE164");

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
CREATE INDEX "DealActivity_userId_dealId_occurredAt_id_idx" ON "DealActivity"("userId", "dealId", "occurredAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "DealActivity_userId_activityType_occurredAt_idx" ON "DealActivity"("userId", "activityType", "occurredAt");

-- CreateIndex
CREATE INDEX "DealActivity_userId_sourceType_sourceId_idx" ON "DealActivity"("userId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_userId_status_idx" ON "ExternalCalendarConnection"("userId", "status");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_provider_providerAccountId_idx" ON "ExternalCalendarConnection"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_userId_lastSyncedAt_idx" ON "ExternalCalendarConnection"("userId", "lastSyncedAt");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_userId_syncLockExpiresAt_idx" ON "ExternalCalendarConnection"("userId", "syncLockExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCalendarConnection_userId_provider_key" ON "ExternalCalendarConnection"("userId", "provider");

-- CreateIndex
CREATE INDEX "ExternalCalendarSource_connectionId_status_idx" ON "ExternalCalendarSource"("connectionId", "status");

-- CreateIndex
CREATE INDEX "ExternalCalendarSource_userId_status_idx" ON "ExternalCalendarSource"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCalendarSource_userId_provider_calendarId_key" ON "ExternalCalendarSource"("userId", "provider", "calendarId");

-- CreateIndex
CREATE INDEX "Schedule_userId_startAt_idx" ON "Schedule"("userId", "startAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_createdAt_idx" ON "Schedule"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_sourceType_startAt_idx" ON "Schedule"("userId", "sourceType", "startAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_deletedAt_idx" ON "Schedule"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_trashExpiresAt_idx" ON "Schedule"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "Schedule_externalCalendarSourceId_idx" ON "Schedule"("externalCalendarSourceId");

-- CreateIndex
CREATE INDEX "Schedule_userId_externalSyncStatus_idx" ON "Schedule"("userId", "externalSyncStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_userId_externalCalendarSourceId_externalEventId_key" ON "Schedule"("userId", "externalCalendarSourceId", "externalEventId");

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
CREATE INDEX "AiWeeklySalesReport_userId_weekStart_timeZone_status_idx" ON "AiWeeklySalesReport"("userId", "weekStart", "timeZone", "status");

-- CreateIndex
CREATE INDEX "AiWeeklySalesReport_userId_weekStart_timeZone_version_idx" ON "AiWeeklySalesReport"("userId", "weekStart", "timeZone", "version" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "AiWeeklySalesReport_userId_weekStart_timeZone_version_key" ON "AiWeeklySalesReport"("userId", "weekStart", "timeZone", "version");

-- CreateIndex
CREATE INDEX "AiWeeklySalesReportSuggestion_userId_reportId_type_idx" ON "AiWeeklySalesReportSuggestion"("userId", "reportId", "type");

-- CreateIndex
CREATE INDEX "AiWeeklySalesReportSuggestion_userId_targetType_targetId_idx" ON "AiWeeklySalesReportSuggestion"("userId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "AiWeeklySalesReportSuggestion_reportId_suggestionKey_key" ON "AiWeeklySalesReportSuggestion"("reportId", "suggestionKey");

-- CreateIndex
CREATE INDEX "AiJob_status_operation_createdAt_idx" ON "AiJob"("status", "operation", "createdAt");

-- CreateIndex
CREATE INDEX "AiJob_userId_operation_status_createdAt_idx" ON "AiJob"("userId", "operation", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AiJob_userId_targetType_targetId_idx" ON "AiJob"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "AiProviderCallLog_userId_operation_createdAt_idx" ON "AiProviderCallLog"("userId", "operation", "createdAt");

-- CreateIndex
CREATE INDEX "AiProviderCallLog_userId_targetType_targetId_createdAt_idx" ON "AiProviderCallLog"("userId", "targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "AiProviderCallLog_reportId_createdAt_idx" ON "AiProviderCallLog"("reportId", "createdAt");

-- CreateIndex
CREATE INDEX "AiProviderCallLog_jobId_createdAt_idx" ON "AiProviderCallLog"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "AiProviderCallLog_status_createdAt_idx" ON "AiProviderCallLog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ExternalEmailConnection_userId_status_idx" ON "ExternalEmailConnection"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalEmailConnection_userId_provider_key" ON "ExternalEmailConnection"("userId", "provider");

-- CreateIndex
CREATE INDEX "ExternalEmailOAuthState_userId_provider_expiresAt_idx" ON "ExternalEmailOAuthState"("userId", "provider", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalEmailOAuthState_stateHash_key" ON "ExternalEmailOAuthState"("stateHash");

-- CreateIndex
CREATE INDEX "SmsSenderNumber_userId_status_createdAt_idx" ON "SmsSenderNumber"("userId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SmsSenderNumber_userId_phoneE164Hash_key" ON "SmsSenderNumber"("userId", "phoneE164Hash");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUpConsentNotice_userId_channel_key" ON "FollowUpConsentNotice"("userId", "channel");

-- CreateIndex
CREATE INDEX "FollowUpMessage_userId_channel_status_createdAt_idx" ON "FollowUpMessage"("userId", "channel", "status", "createdAt");

-- CreateIndex
CREATE INDEX "FollowUpMessage_userId_sourceReportId_createdAt_idx" ON "FollowUpMessage"("userId", "sourceReportId", "createdAt");

-- CreateIndex
CREATE INDEX "FollowUpMessage_recipientContactId_createdAt_idx" ON "FollowUpMessage"("recipientContactId", "createdAt");

-- CreateIndex
CREATE INDEX "FollowUpMessageTarget_userId_targetType_targetId_createdAt_idx" ON "FollowUpMessageTarget"("userId", "targetType", "targetId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUpMessageTarget_messageId_targetType_targetId_key" ON "FollowUpMessageTarget"("messageId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "FollowUpDeliveryAttempt_messageId_createdAt_idx" ON "FollowUpDeliveryAttempt"("messageId", "createdAt");

-- CreateIndex
CREATE INDEX "FollowUpDeliveryAttempt_userId_channel_status_createdAt_idx" ON "FollowUpDeliveryAttempt"("userId", "channel", "status", "createdAt");

-- CreateIndex
CREATE INDEX "FollowUpDeliveryAttempt_status_nextRetryAt_idx" ON "FollowUpDeliveryAttempt"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_createdAt_idx" ON "BusinessCardScanLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_status_createdAt_idx" ON "BusinessCardScanLog"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessCardScanLog_userId_status_safeErrorCode_createdAt_idx" ON "BusinessCardScanLog"("userId", "status", "safeErrorCode", "createdAt");

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
CREATE UNIQUE INDEX "ImportJob_importUserLogId_key" ON "ImportJob"("importUserLogId");

-- CreateIndex
CREATE INDEX "ImportJob_userId_status_createdAt_idx" ON "ImportJob"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJob_userId_expiresAt_idx" ON "ImportJob"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "ImportJob_userId_targetType_createdAt_idx" ON "ImportJob"("userId", "targetType", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJob_templateId_idx" ON "ImportJob"("templateId");

-- CreateIndex
CREATE INDEX "ImportJobRow_importJobId_status_idx" ON "ImportJobRow"("importJobId", "status");

-- CreateIndex
CREATE INDEX "ImportJobRow_userId_status_idx" ON "ImportJobRow"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ImportJobRow_importJobId_rowNumber_key" ON "ImportJobRow"("importJobId", "rowNumber");

-- CreateIndex
CREATE INDEX "ImportJobError_importJobId_createdAt_idx" ON "ImportJobError"("importJobId", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJobError_userId_createdAt_idx" ON "ImportJobError"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJobError_importJobRowId_idx" ON "ImportJobError"("importJobRowId");

-- CreateIndex
CREATE UNIQUE INDEX "ImportUploadedFile_importJobId_key" ON "ImportUploadedFile"("importJobId");

-- CreateIndex
CREATE INDEX "ImportUploadedFile_userId_status_expiresAt_idx" ON "ImportUploadedFile"("userId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "ImportUploadedFile_checksum_idx" ON "ImportUploadedFile"("checksum");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSetting_userId_key" ON "UserNotificationSetting"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_status_scheduledAt_idx" ON "Notification"("userId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_scheduledAt_idx" ON "Notification"("userId", "readAt", "scheduledAt");

-- CreateIndex
CREATE INDEX "Notification_userId_sourceType_sourceId_idx" ON "Notification"("userId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Notification_scheduledAt_status_idx" ON "Notification"("scheduledAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");

-- CreateIndex
CREATE INDEX "NotificationDeliveryAttempt_notificationId_channel_createdA_idx" ON "NotificationDeliveryAttempt"("notificationId", "channel", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDeliveryAttempt_userId_channel_status_createdAt_idx" ON "NotificationDeliveryAttempt"("userId", "channel", "status", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDeliveryAttempt_status_nextRetryAt_idx" ON "NotificationDeliveryAttempt"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "BrowserPushSubscription_userId_status_createdAt_idx" ON "BrowserPushSubscription"("userId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BrowserPushSubscription_endpointHash_key" ON "BrowserPushSubscription"("endpointHash");

-- CreateIndex
CREATE INDEX "CompanyField_userId_idx" ON "CompanyField"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyField_userId_field_key" ON "CompanyField"("userId", "field");

-- CreateIndex
CREATE INDEX "CompanyRegion_userId_idx" ON "CompanyRegion"("userId");

-- CreateIndex
CREATE INDEX "CompanyRegion_userId_countryCode_regionCode_idx" ON "CompanyRegion"("userId", "countryCode", "regionCode");

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
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSensitiveAccessLog" ADD CONSTRAINT "AdminSensitiveAccessLog_auditLogId_fkey" FOREIGN KEY ("auditLogId") REFERENCES "AdminAuditLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSensitiveAccessLog" ADD CONSTRAINT "AdminSensitiveAccessLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrashRecoveryRequest" ADD CONSTRAINT "TrashRecoveryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountDeletionRequest" ADD CONSTRAINT "AccountDeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDataExportRequest" ADD CONSTRAINT "UserDataExportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminOperationCheckRun" ADD CONSTRAINT "AdminOperationCheckRun_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnalyticsEvent" ADD CONSTRAINT "ProductAnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnalyticsEvent" ADD CONSTRAINT "ProductAnalyticsEvent_authSessionId_fkey" FOREIGN KEY ("authSessionId") REFERENCES "AuthSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnalyticsEvent" ADD CONSTRAINT "ProductAnalyticsEvent_authDeviceId_fkey" FOREIGN KEY ("authDeviceId") REFERENCES "AuthDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivationSnapshot" ADD CONSTRAINT "UserActivationSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "DealActivity" ADD CONSTRAINT "DealActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealActivity" ADD CONSTRAINT "DealActivity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCalendarConnection" ADD CONSTRAINT "ExternalCalendarConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCalendarSource" ADD CONSTRAINT "ExternalCalendarSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCalendarSource" ADD CONSTRAINT "ExternalCalendarSource_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ExternalCalendarConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_externalCalendarSourceId_fkey" FOREIGN KEY ("externalCalendarSourceId") REFERENCES "ExternalCalendarSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "AiWeeklySalesReport" ADD CONSTRAINT "AiWeeklySalesReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiWeeklySalesReportSuggestion" ADD CONSTRAINT "AiWeeklySalesReportSuggestion_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AiWeeklySalesReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiWeeklySalesReportSuggestion" ADD CONSTRAINT "AiWeeklySalesReportSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiJob" ADD CONSTRAINT "AiJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderCallLog" ADD CONSTRAINT "AiProviderCallLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderCallLog" ADD CONSTRAINT "AiProviderCallLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AiWeeklySalesReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProviderCallLog" ADD CONSTRAINT "AiProviderCallLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "AiJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalEmailConnection" ADD CONSTRAINT "ExternalEmailConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalEmailOAuthState" ADD CONSTRAINT "ExternalEmailOAuthState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsSenderNumber" ADD CONSTRAINT "SmsSenderNumber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpConsentNotice" ADD CONSTRAINT "FollowUpConsentNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpMessage" ADD CONSTRAINT "FollowUpMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpMessage" ADD CONSTRAINT "FollowUpMessage_sourceReportId_fkey" FOREIGN KEY ("sourceReportId") REFERENCES "AiWeeklySalesReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpMessage" ADD CONSTRAINT "FollowUpMessage_sourceSuggestionId_fkey" FOREIGN KEY ("sourceSuggestionId") REFERENCES "AiWeeklySalesReportSuggestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpMessage" ADD CONSTRAINT "FollowUpMessage_emailConnectionId_fkey" FOREIGN KEY ("emailConnectionId") REFERENCES "ExternalEmailConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpMessage" ADD CONSTRAINT "FollowUpMessage_smsSenderNumberId_fkey" FOREIGN KEY ("smsSenderNumberId") REFERENCES "SmsSenderNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpMessage" ADD CONSTRAINT "FollowUpMessage_recipientContactId_fkey" FOREIGN KEY ("recipientContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpMessageTarget" ADD CONSTRAINT "FollowUpMessageTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpMessageTarget" ADD CONSTRAINT "FollowUpMessageTarget_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "FollowUpMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpDeliveryAttempt" ADD CONSTRAINT "FollowUpDeliveryAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpDeliveryAttempt" ADD CONSTRAINT "FollowUpDeliveryAttempt_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "FollowUpMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ImportTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_importUserLogId_fkey" FOREIGN KEY ("importUserLogId") REFERENCES "ImportUserLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobRow" ADD CONSTRAINT "ImportJobRow_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobRow" ADD CONSTRAINT "ImportJobRow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobError" ADD CONSTRAINT "ImportJobError_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobError" ADD CONSTRAINT "ImportJobError_importJobRowId_fkey" FOREIGN KEY ("importJobRowId") REFERENCES "ImportJobRow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobError" ADD CONSTRAINT "ImportJobError_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportUploadedFile" ADD CONSTRAINT "ImportUploadedFile_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportUploadedFile" ADD CONSTRAINT "ImportUploadedFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationSetting" ADD CONSTRAINT "UserNotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDeliveryAttempt" ADD CONSTRAINT "NotificationDeliveryAttempt_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDeliveryAttempt" ADD CONSTRAINT "NotificationDeliveryAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowserPushSubscription" ADD CONSTRAINT "BrowserPushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

