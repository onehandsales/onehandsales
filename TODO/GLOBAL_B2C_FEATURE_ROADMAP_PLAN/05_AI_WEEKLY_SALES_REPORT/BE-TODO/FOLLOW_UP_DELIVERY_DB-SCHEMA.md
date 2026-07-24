# 05-B DB Schema And SQL

상태: Implementation-ready draft

## 1. 생성 대상

| 이름 | 목적 |
|---|---|
| `ExternalEmailConnection` | Gmail/Microsoft 365 OAuth 연결 |
| `ExternalEmailOAuthState` | email provider OAuth callback 검증용 state |
| `SmsSenderNumber` | 사용자 인증 SMS 발신번호 |
| `FollowUpConsentNotice` | 첫 발송 주의 안내 확인 이력 |
| `FollowUpMessage` | follow-up draft/send 영업 활동 기록 |
| `FollowUpMessageTarget` | message와 AI report/deal/contact/meeting note/schedule 연결 |
| `FollowUpDeliveryAttempt` | provider 발송 시도와 safe error/cost 추적 |

## 2. Migration SQL 초안

```sql
-- CreateEnum
CREATE TYPE "ExternalEmailProvider" AS ENUM (
  'GOOGLE',
  'MICROSOFT'
);

-- CreateEnum
CREATE TYPE "ExternalEmailConnectionStatus" AS ENUM (
  'CONNECTED',
  'RECONNECT_REQUIRED',
  'DISCONNECTED'
);

-- CreateEnum
CREATE TYPE "SmsSenderNumberStatus" AS ENUM (
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REVOKED'
);

-- CreateEnum
CREATE TYPE "FollowUpDeliveryChannel" AS ENUM (
  'EMAIL',
  'SMS'
);

-- CreateEnum
CREATE TYPE "FollowUpMessageStatus" AS ENUM (
  'DRAFT',
  'SENDING',
  'SENT',
  'FAILED'
);

-- CreateEnum
CREATE TYPE "FollowUpTargetType" AS ENUM (
  'AI_WEEKLY_REPORT',
  'DEAL',
  'CONTACT',
  'MEETING_NOTE',
  'SCHEDULE'
);

-- CreateEnum
CREATE TYPE "FollowUpDeliveryAttemptStatus" AS ENUM (
  'PENDING',
  'SENT',
  'FAILED',
  'CANCELED'
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
  "grantedScopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "connectedAt" TIMESTAMPTZ(3),
  "disconnectedAt" TIMESTAMPTZ(3),
  "reconnectRequiredAt" TIMESTAMPTZ(3),
  "lastSendAt" TIMESTAMPTZ(3),
  "lastSendFailedAt" TIMESTAMPTZ(3),
  "lastSendErrorCode" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExternalEmailConnection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ExternalEmailConnection_providerAccountEmail_check" CHECK (length(trim("providerAccountEmail")) > 0)
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

  CONSTRAINT "ExternalEmailOAuthState_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ExternalEmailOAuthState_stateHash_check" CHECK (length(trim("stateHash")) > 0),
  CONSTRAINT "ExternalEmailOAuthState_redirectUri_check" CHECK (length(trim("redirectUri")) > 0)
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
  "lastSendAt" TIMESTAMPTZ(3),
  "lastSendFailedAt" TIMESTAMPTZ(3),
  "lastSendErrorCode" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SmsSenderNumber_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SmsSenderNumber_phoneE164Hash_check" CHECK (length(trim("phoneE164Hash")) > 0),
  CONSTRAINT "SmsSenderNumber_phoneE164Ciphertext_check" CHECK (length(trim("phoneE164Ciphertext")) > 0),
  CONSTRAINT "SmsSenderNumber_phoneE164Masked_check" CHECK (length(trim("phoneE164Masked")) > 0)
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

  CONSTRAINT "FollowUpMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FollowUpMessage_languageTag_check" CHECK (length(trim("languageTag")) > 0),
  CONSTRAINT "FollowUpMessage_recipientName_check" CHECK (length(trim("recipientName")) > 0),
  CONSTRAINT "FollowUpMessage_body_check" CHECK (length(trim("body")) > 0),
  CONSTRAINT "FollowUpMessage_bodyPreview_check" CHECK (length(trim("bodyPreview")) > 0),
  CONSTRAINT "FollowUpMessage_retryCount_check" CHECK ("retryCount" >= 0)
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

  CONSTRAINT "FollowUpMessageTarget_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FollowUpMessageTarget_targetPath_check" CHECK (length(trim("targetPath")) > 0)
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
  "estimatedCostAmount" DECIMAL(12, 6),
  "costCurrency" TEXT NOT NULL DEFAULT 'USD',
  "sentAt" TIMESTAMPTZ(3),
  "failedAt" TIMESTAMPTZ(3),
  "detailJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FollowUpDeliveryAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FollowUpDeliveryAttempt_attemptNumber_check" CHECK ("attemptNumber" >= 1),
  CONSTRAINT "FollowUpDeliveryAttempt_latencyMs_check" CHECK ("latencyMs" IS NULL OR "latencyMs" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalEmailConnection_userId_provider_key"
  ON "ExternalEmailConnection"("userId", "provider");

CREATE INDEX "ExternalEmailConnection_userId_status_idx"
  ON "ExternalEmailConnection"("userId", "status");

CREATE UNIQUE INDEX "ExternalEmailOAuthState_stateHash_key"
  ON "ExternalEmailOAuthState"("stateHash");

CREATE INDEX "ExternalEmailOAuthState_userId_provider_expiresAt_idx"
  ON "ExternalEmailOAuthState"("userId", "provider", "expiresAt");

CREATE UNIQUE INDEX "SmsSenderNumber_userId_phoneE164Hash_key"
  ON "SmsSenderNumber"("userId", "phoneE164Hash");

CREATE INDEX "SmsSenderNumber_userId_status_createdAt_idx"
  ON "SmsSenderNumber"("userId", "status", "createdAt");

CREATE UNIQUE INDEX "FollowUpConsentNotice_userId_channel_key"
  ON "FollowUpConsentNotice"("userId", "channel");

CREATE INDEX "FollowUpMessage_userId_channel_status_createdAt_idx"
  ON "FollowUpMessage"("userId", "channel", "status", "createdAt");

CREATE INDEX "FollowUpMessage_userId_sourceReportId_createdAt_idx"
  ON "FollowUpMessage"("userId", "sourceReportId", "createdAt");

CREATE INDEX "FollowUpMessage_recipientContactId_createdAt_idx"
  ON "FollowUpMessage"("recipientContactId", "createdAt");

CREATE UNIQUE INDEX "FollowUpMessageTarget_messageId_targetType_targetId_key"
  ON "FollowUpMessageTarget"("messageId", "targetType", "targetId");

CREATE INDEX "FollowUpMessageTarget_userId_targetType_targetId_createdAt_idx"
  ON "FollowUpMessageTarget"("userId", "targetType", "targetId", "createdAt");

CREATE INDEX "FollowUpDeliveryAttempt_messageId_createdAt_idx"
  ON "FollowUpDeliveryAttempt"("messageId", "createdAt");

CREATE INDEX "FollowUpDeliveryAttempt_userId_channel_status_createdAt_idx"
  ON "FollowUpDeliveryAttempt"("userId", "channel", "status", "createdAt");

CREATE INDEX "FollowUpDeliveryAttempt_status_nextRetryAt_idx"
  ON "FollowUpDeliveryAttempt"("status", "nextRetryAt");

-- AddForeignKey
ALTER TABLE "ExternalEmailConnection"
  ADD CONSTRAINT "ExternalEmailConnection_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ExternalEmailOAuthState"
  ADD CONSTRAINT "ExternalEmailOAuthState_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SmsSenderNumber"
  ADD CONSTRAINT "SmsSenderNumber_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FollowUpConsentNotice"
  ADD CONSTRAINT "FollowUpConsentNotice_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FollowUpMessage"
  ADD CONSTRAINT "FollowUpMessage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FollowUpMessage"
  ADD CONSTRAINT "FollowUpMessage_sourceReportId_fkey"
  FOREIGN KEY ("sourceReportId") REFERENCES "AiWeeklySalesReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FollowUpMessage"
  ADD CONSTRAINT "FollowUpMessage_sourceSuggestionId_fkey"
  FOREIGN KEY ("sourceSuggestionId") REFERENCES "AiWeeklySalesReportSuggestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FollowUpMessage"
  ADD CONSTRAINT "FollowUpMessage_emailConnectionId_fkey"
  FOREIGN KEY ("emailConnectionId") REFERENCES "ExternalEmailConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FollowUpMessage"
  ADD CONSTRAINT "FollowUpMessage_smsSenderNumberId_fkey"
  FOREIGN KEY ("smsSenderNumberId") REFERENCES "SmsSenderNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FollowUpMessage"
  ADD CONSTRAINT "FollowUpMessage_recipientContactId_fkey"
  FOREIGN KEY ("recipientContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FollowUpMessageTarget"
  ADD CONSTRAINT "FollowUpMessageTarget_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FollowUpMessageTarget"
  ADD CONSTRAINT "FollowUpMessageTarget_messageId_fkey"
  FOREIGN KEY ("messageId") REFERENCES "FollowUpMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FollowUpDeliveryAttempt"
  ADD CONSTRAINT "FollowUpDeliveryAttempt_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FollowUpDeliveryAttempt"
  ADD CONSTRAINT "FollowUpDeliveryAttempt_messageId_fkey"
  FOREIGN KEY ("messageId") REFERENCES "FollowUpMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Comments: enum types
COMMENT ON TYPE "ExternalEmailProvider" IS '05-B follow-up email 발송에 사용할 사용자 연결 email provider.';
COMMENT ON TYPE "ExternalEmailConnectionStatus" IS '사용자 email provider 연결 상태. 권한 만료 시 RECONNECT_REQUIRED로 전환한다.';
COMMENT ON TYPE "SmsSenderNumberStatus" IS '사용자 SMS 발신번호 인증 상태.';
COMMENT ON TYPE "FollowUpDeliveryChannel" IS 'follow-up 발송 채널. 05-B는 EMAIL과 SMS만 지원한다.';
COMMENT ON TYPE "FollowUpMessageStatus" IS 'follow-up message draft/send 상태.';
COMMENT ON TYPE "FollowUpTargetType" IS 'follow-up message가 연결되는 record target 타입.';
COMMENT ON TYPE "FollowUpDeliveryAttemptStatus" IS 'email/SMS provider 발송 시도 상태.';

-- Comments: ExternalEmailConnection
COMMENT ON TABLE "ExternalEmailConnection" IS '사용자별 Gmail/Microsoft 365 email 발송 OAuth 연결 정보. token 원문은 암호화 저장한다.';
COMMENT ON COLUMN "ExternalEmailConnection"."id" IS 'ExternalEmailConnection UUID primary key.';
COMMENT ON COLUMN "ExternalEmailConnection"."userId" IS 'email 연결 소유 사용자 ID.';
COMMENT ON COLUMN "ExternalEmailConnection"."provider" IS 'GOOGLE 또는 MICROSOFT.';
COMMENT ON COLUMN "ExternalEmailConnection"."providerAccountId" IS 'provider account 고유 ID.';
COMMENT ON COLUMN "ExternalEmailConnection"."providerAccountEmail" IS '사용자에게 보여줄 provider 계정 email.';
COMMENT ON COLUMN "ExternalEmailConnection"."status" IS '연결 상태. 발송 권한 만료 시 RECONNECT_REQUIRED.';
COMMENT ON COLUMN "ExternalEmailConnection"."encryptedAccessToken" IS '암호화된 access token.';
COMMENT ON COLUMN "ExternalEmailConnection"."encryptedRefreshToken" IS '암호화된 refresh token.';
COMMENT ON COLUMN "ExternalEmailConnection"."tokenExpiresAt" IS 'access token 만료 시각. UTC instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."grantedScopes" IS '사용자가 동의한 provider scope 목록.';
COMMENT ON COLUMN "ExternalEmailConnection"."connectedAt" IS '연결 성공 시각. UTC instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."disconnectedAt" IS '사용자가 연결 해제한 시각. UTC instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."reconnectRequiredAt" IS '재연결 필요 상태가 된 시각. UTC instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."lastSendAt" IS '마지막 email 발송 성공 시각. UTC instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."lastSendFailedAt" IS '마지막 email 발송 실패 시각. UTC instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."lastSendErrorCode" IS '마지막 email 발송 실패 safe error code.';
COMMENT ON COLUMN "ExternalEmailConnection"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: ExternalEmailOAuthState
COMMENT ON TABLE "ExternalEmailOAuthState" IS 'Gmail/Microsoft 365 OAuth callback 검증용 state 저장소. state 원문은 저장하지 않는다.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."id" IS 'ExternalEmailOAuthState UUID primary key.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."userId" IS 'OAuth 연결을 시작한 사용자 ID.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."provider" IS 'GOOGLE 또는 MICROSOFT.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."stateHash" IS 'OAuth state 원문 검증용 hash. 원문 state는 저장하지 않는다.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."redirectUri" IS 'callback 처리 후 User Web으로 돌려보낼 URL.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."expiresAt" IS 'state 만료 시각. UTC instant.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."consumedAt" IS 'callback에서 state를 사용한 시각. 재사용 방지용 UTC instant.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: SmsSenderNumber
COMMENT ON TABLE "SmsSenderNumber" IS '사용자가 SMS follow-up 발신번호로 인증한 E.164 번호. 원문 번호는 암호화 저장한다.';
COMMENT ON COLUMN "SmsSenderNumber"."id" IS 'SmsSenderNumber UUID primary key.';
COMMENT ON COLUMN "SmsSenderNumber"."userId" IS '발신번호 소유 사용자 ID.';
COMMENT ON COLUMN "SmsSenderNumber"."phoneE164Hash" IS 'E.164 번호 중복 감지용 hash.';
COMMENT ON COLUMN "SmsSenderNumber"."phoneE164Ciphertext" IS '암호화된 E.164 번호 원문.';
COMMENT ON COLUMN "SmsSenderNumber"."phoneE164Masked" IS '화면 표시용 마스킹 번호.';
COMMENT ON COLUMN "SmsSenderNumber"."status" IS '발신번호 인증 상태.';
COMMENT ON COLUMN "SmsSenderNumber"."provider" IS 'SMS provider 이름.';
COMMENT ON COLUMN "SmsSenderNumber"."providerSenderId" IS 'provider가 발급한 sender ID.';
COMMENT ON COLUMN "SmsSenderNumber"."verificationCodeHash" IS 'SMS 인증 code hash. code 원문은 저장하지 않는다.';
COMMENT ON COLUMN "SmsSenderNumber"."verificationExpiresAt" IS '인증 code 만료 시각. UTC instant.';
COMMENT ON COLUMN "SmsSenderNumber"."verifiedAt" IS '인증 완료 시각. UTC instant.';
COMMENT ON COLUMN "SmsSenderNumber"."revokedAt" IS '발신번호 해제 시각. UTC instant.';
COMMENT ON COLUMN "SmsSenderNumber"."lastSendAt" IS '마지막 SMS 발송 성공 시각. UTC instant.';
COMMENT ON COLUMN "SmsSenderNumber"."lastSendFailedAt" IS '마지막 SMS 발송 실패 시각. UTC instant.';
COMMENT ON COLUMN "SmsSenderNumber"."lastSendErrorCode" IS '마지막 SMS 발송 실패 safe error code.';
COMMENT ON COLUMN "SmsSenderNumber"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "SmsSenderNumber"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: FollowUpConsentNotice
COMMENT ON TABLE "FollowUpConsentNotice" IS '사용자가 email/SMS 첫 발송 전 수신 동의/주의 안내를 확인한 이력.';
COMMENT ON COLUMN "FollowUpConsentNotice"."id" IS 'FollowUpConsentNotice UUID primary key.';
COMMENT ON COLUMN "FollowUpConsentNotice"."userId" IS '안내 확인 사용자 ID.';
COMMENT ON COLUMN "FollowUpConsentNotice"."channel" IS 'EMAIL 또는 SMS.';
COMMENT ON COLUMN "FollowUpConsentNotice"."acknowledgedAt" IS '주의 안내를 확인한 시각. UTC instant.';
COMMENT ON COLUMN "FollowUpConsentNotice"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "FollowUpConsentNotice"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: FollowUpMessage
COMMENT ON TABLE "FollowUpMessage" IS '사용자가 AI follow-up 초안을 확인하고 보낸 email/SMS 영업 활동 기록. 제목과 본문 전체를 영구 보관한다.';
COMMENT ON COLUMN "FollowUpMessage"."id" IS 'FollowUpMessage UUID primary key.';
COMMENT ON COLUMN "FollowUpMessage"."userId" IS 'message 소유 사용자 ID.';
COMMENT ON COLUMN "FollowUpMessage"."sourceReportId" IS 'message를 시작한 AI 주간 리포트 ID.';
COMMENT ON COLUMN "FollowUpMessage"."sourceSuggestionId" IS 'message를 시작한 AI follow-up suggestion ID.';
COMMENT ON COLUMN "FollowUpMessage"."channel" IS 'EMAIL 또는 SMS.';
COMMENT ON COLUMN "FollowUpMessage"."status" IS 'draft/send 상태.';
COMMENT ON COLUMN "FollowUpMessage"."languageTag" IS '초안과 발송에 사용한 언어 tag.';
COMMENT ON COLUMN "FollowUpMessage"."emailConnectionId" IS 'email 발송에 사용한 연결 ID.';
COMMENT ON COLUMN "FollowUpMessage"."smsSenderNumberId" IS 'SMS 발송에 사용한 인증 발신번호 ID.';
COMMENT ON COLUMN "FollowUpMessage"."senderDisplayName" IS '발송자 표시 이름.';
COMMENT ON COLUMN "FollowUpMessage"."senderEmail" IS '발송 email 주소. 사용자 본인 연결 계정.';
COMMENT ON COLUMN "FollowUpMessage"."senderPhoneE164Masked" IS '발송 SMS 번호 마스킹 표시.';
COMMENT ON COLUMN "FollowUpMessage"."recipientContactId" IS '수신 담당자 ID.';
COMMENT ON COLUMN "FollowUpMessage"."recipientName" IS '발송 당시 수신자 이름 snapshot.';
COMMENT ON COLUMN "FollowUpMessage"."recipientEmail" IS '발송 당시 수신자 email snapshot.';
COMMENT ON COLUMN "FollowUpMessage"."recipientPhoneE164Masked" IS '발송 당시 수신자 phone 마스킹 snapshot.';
COMMENT ON COLUMN "FollowUpMessage"."subject" IS 'email 제목. SMS에서는 NULL이다.';
COMMENT ON COLUMN "FollowUpMessage"."body" IS 'email/SMS 본문 전체. 영업 활동 기록으로 영구 보관하며 structured log에는 남기지 않는다.';
COMMENT ON COLUMN "FollowUpMessage"."bodyPreview" IS '목록/timeline 표시용 짧은 본문 preview.';
COMMENT ON COLUMN "FollowUpMessage"."provider" IS '발송 provider 이름.';
COMMENT ON COLUMN "FollowUpMessage"."providerMessageId" IS 'provider가 반환한 안전한 message ID.';
COMMENT ON COLUMN "FollowUpMessage"."safeErrorCode" IS '발송 실패 safe error code.';
COMMENT ON COLUMN "FollowUpMessage"."safeErrorMessage" IS '발송 실패 safe error message.';
COMMENT ON COLUMN "FollowUpMessage"."retryable" IS '사용자 또는 자동 재시도 가능 여부.';
COMMENT ON COLUMN "FollowUpMessage"."retryCount" IS '재시도 횟수.';
COMMENT ON COLUMN "FollowUpMessage"."sentAt" IS '발송 성공 시각. UTC instant.';
COMMENT ON COLUMN "FollowUpMessage"."failedAt" IS '발송 실패 시각. UTC instant.';
COMMENT ON COLUMN "FollowUpMessage"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "FollowUpMessage"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: FollowUpMessageTarget
COMMENT ON TABLE "FollowUpMessageTarget" IS 'FollowUpMessage를 AI report와 Deal/Contact/MeetingNote/Schedule timeline에 연결하는 다형 target table.';
COMMENT ON COLUMN "FollowUpMessageTarget"."id" IS 'FollowUpMessageTarget UUID primary key.';
COMMENT ON COLUMN "FollowUpMessageTarget"."userId" IS 'target 연결 소유 사용자 ID.';
COMMENT ON COLUMN "FollowUpMessageTarget"."messageId" IS '연결할 follow-up message ID.';
COMMENT ON COLUMN "FollowUpMessageTarget"."targetType" IS '연결 target 타입.';
COMMENT ON COLUMN "FollowUpMessageTarget"."targetId" IS '연결 target ID. 다형 참조이므로 직접 FK를 걸지 않는다.';
COMMENT ON COLUMN "FollowUpMessageTarget"."targetPath" IS 'User Web에서 target을 열 경로.';
COMMENT ON COLUMN "FollowUpMessageTarget"."targetLabel" IS '화면 표시용 target label.';
COMMENT ON COLUMN "FollowUpMessageTarget"."createdAt" IS 'row 생성 시각. UTC instant.';

-- Comments: FollowUpDeliveryAttempt
COMMENT ON TABLE "FollowUpDeliveryAttempt" IS 'FollowUpMessage의 provider 발송 시도 이력. provider raw response는 저장하지 않는다.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."id" IS 'FollowUpDeliveryAttempt UUID primary key.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."userId" IS 'attempt 소유 사용자 ID.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."messageId" IS '발송 시도 대상 message ID.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."channel" IS 'EMAIL 또는 SMS.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."status" IS '발송 시도 상태.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."attemptNumber" IS 'message별 발송 시도 번호.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."provider" IS '발송 provider 이름.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."providerMessageId" IS 'provider가 반환한 안전한 message ID.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."providerStatusCode" IS 'provider 상태 code 또는 HTTP status.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."safeErrorCode" IS 'redacted provider error code.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."safeErrorMessage" IS 'redacted provider error message.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."retryable" IS '일시 장애 재시도 가능 여부.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."nextRetryAt" IS '자동 재시도 예정 시각. UTC instant.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."latencyMs" IS 'provider 호출 latency milliseconds.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."estimatedCostAmount" IS 'SMS 또는 provider 사용량 내부 추적용 예상 비용. 사용자 화면에는 기본 노출하지 않는다.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."costCurrency" IS '비용 통화. 기본 USD.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."sentAt" IS '발송 성공 시각. UTC instant.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."failedAt" IS '발송 실패 시각. UTC instant.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."detailJson" IS 'redacted 발송 detail. provider raw response, token, email/SMS 본문을 넣지 않는다.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: indexes
COMMENT ON INDEX "ExternalEmailConnection_userId_provider_key" IS '사용자당 provider별 email connection 하나를 유지한다.';
COMMENT ON INDEX "ExternalEmailConnection_userId_status_idx" IS '사용자 설정 화면에서 연결 상태를 조회한다.';
COMMENT ON INDEX "ExternalEmailOAuthState_stateHash_key" IS 'OAuth callback state 재사용과 충돌을 막는다.';
COMMENT ON INDEX "ExternalEmailOAuthState_userId_provider_expiresAt_idx" IS '사용자/provider별 유효 OAuth state 조회와 만료 정리에 사용한다.';
COMMENT ON INDEX "SmsSenderNumber_userId_phoneE164Hash_key" IS '같은 사용자의 SMS 발신번호 중복 등록을 막는다.';
COMMENT ON INDEX "SmsSenderNumber_userId_status_createdAt_idx" IS '사용자 설정 화면에서 발신번호 상태 목록을 조회한다.';
COMMENT ON INDEX "FollowUpConsentNotice_userId_channel_key" IS '사용자/channel별 첫 발송 주의 안내 확인을 한 번만 저장한다.';
COMMENT ON INDEX "FollowUpMessage_userId_channel_status_createdAt_idx" IS '사용자별 follow-up message 목록과 상태 필터 조회에 사용한다.';
COMMENT ON INDEX "FollowUpMessage_userId_sourceReportId_createdAt_idx" IS 'AI 리포트에서 시작된 발송 이력 조회에 사용한다.';
COMMENT ON INDEX "FollowUpMessage_recipientContactId_createdAt_idx" IS '담당자별 follow-up 이력 조회에 사용한다.';
COMMENT ON INDEX "FollowUpMessageTarget_messageId_targetType_targetId_key" IS '같은 message와 target 연결 중복을 막는다.';
COMMENT ON INDEX "FollowUpMessageTarget_userId_targetType_targetId_createdAt_idx" IS 'Deal/Contact/MeetingNote/Schedule timeline 이력 조회에 사용한다.';
COMMENT ON INDEX "FollowUpDeliveryAttempt_messageId_createdAt_idx" IS 'message별 provider 발송 시도 이력 조회에 사용한다.';
COMMENT ON INDEX "FollowUpDeliveryAttempt_userId_channel_status_createdAt_idx" IS '사용자별 발송 채널/상태 운영 조회에 사용한다.';
COMMENT ON INDEX "FollowUpDeliveryAttempt_status_nextRetryAt_idx" IS '자동 재시도 대상 provider attempt 조회에 사용한다.';
```

## 3. User model relation 추가 후보

```prisma
externalEmailConnections ExternalEmailConnection[]
externalEmailOAuthStates  ExternalEmailOAuthState[]
smsSenderNumbers         SmsSenderNumber[]
followUpConsentNotices   FollowUpConsentNotice[]
followUpMessages         FollowUpMessage[]
followUpMessageTargets   FollowUpMessageTarget[]
followUpDeliveryAttempts FollowUpDeliveryAttempt[]
```

## 4. 구현 주의

- `FollowUpMessage.body`는 영구 보관 대상이지만 structured log에는 절대 남기지 않는다.
- provider token과 phone 원문은 암호화 저장한다.
- SMS 인증 code 원문은 저장하지 않는다.
- 계정 삭제/법적 삭제 요청 정책은 별도 Privacy/Compliance 계획에서 다룬다.
- 05-B migration은 05-A의 `AiWeeklySalesReport`, `AiWeeklySalesReportSuggestion` 존재를 전제로 한다.
