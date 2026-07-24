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
  "encryptedAccessToken" TEXT NOT NULL,
  "encryptedRefreshToken" TEXT,
  "tokenExpiresAt" TIMESTAMPTZ(3),
  "grantedScopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "connectedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "disconnectedAt" TIMESTAMPTZ(3),
  "reconnectRequiredAt" TIMESTAMPTZ(3),
  "lastSentAt" TIMESTAMPTZ(3),
  "lastSendSafeErrorCode" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExternalEmailConnection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ExternalEmailConnection_providerAccountEmail_check" CHECK (length(trim("providerAccountEmail")) > 0),
  CONSTRAINT "ExternalEmailConnection_encryptedAccessToken_check" CHECK (length(trim("encryptedAccessToken")) > 0),
  CONSTRAINT "ExternalEmailConnection_encryptedRefreshToken_check" CHECK ("encryptedRefreshToken" IS NULL OR length(trim("encryptedRefreshToken")) > 0)
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
  "lastSentAt" TIMESTAMPTZ(3),
  "lastSendSafeErrorCode" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SmsSenderNumber_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SmsSenderNumber_phoneE164Hash_check" CHECK (length(trim("phoneE164Hash")) > 0),
  CONSTRAINT "SmsSenderNumber_phoneE164Ciphertext_check" CHECK (length(trim("phoneE164Ciphertext")) > 0),
  CONSTRAINT "SmsSenderNumber_phoneE164Masked_check" CHECK (length(trim("phoneE164Masked")) > 0),
  CONSTRAINT "SmsSenderNumber_verificationCodeHash_check" CHECK ("verificationCodeHash" IS NULL OR length(trim("verificationCodeHash")) > 0)
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
  CONSTRAINT "FollowUpMessageTarget_targetPath_check" CHECK (length(trim("targetPath")) > 0),
  CONSTRAINT "FollowUpMessageTarget_targetLabel_check" CHECK ("targetLabel" IS NULL OR length(trim("targetLabel")) > 0)
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
  CONSTRAINT "FollowUpDeliveryAttempt_latencyMs_check" CHECK ("latencyMs" IS NULL OR "latencyMs" >= 0),
  CONSTRAINT "FollowUpDeliveryAttempt_costCurrency_check" CHECK (length(trim("costCurrency")) > 0)
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
COMMENT ON TYPE "ExternalEmailProvider" IS 'External email providers supported for follow-up email delivery. G05 supports GOOGLE and MICROSOFT.';
COMMENT ON TYPE "ExternalEmailConnectionStatus" IS 'Connection lifecycle for external email accounts. RECONNECT_REQUIRED keeps history while blocking sends.';
COMMENT ON TYPE "SmsSenderNumberStatus" IS 'SMS sender verification lifecycle. Only VERIFIED numbers can be used by send flows.';
COMMENT ON TYPE "FollowUpDeliveryChannel" IS 'Follow-up delivery channel selected by the user. G05 prepares EMAIL and SMS only.';
COMMENT ON TYPE "FollowUpMessageStatus" IS 'Follow-up message lifecycle from draft to send success or failure.';
COMMENT ON TYPE "FollowUpTargetType" IS 'Stable target type used to attach follow-up history to report, deal, contact, meeting note, or schedule timelines.';
COMMENT ON TYPE "FollowUpDeliveryAttemptStatus" IS 'Provider delivery attempt lifecycle with safe retry tracking.';

-- Comments: ExternalEmailConnection
COMMENT ON TABLE "ExternalEmailConnection" IS 'Encrypted external email connection for user-confirmed follow-up email delivery. Raw OAuth tokens are never logged or stored outside ciphertext.';
COMMENT ON COLUMN "ExternalEmailConnection"."id" IS 'ExternalEmailConnection UUID primary key.';
COMMENT ON COLUMN "ExternalEmailConnection"."userId" IS 'Connection owner. All queries and mutations must be scoped by userId.';
COMMENT ON COLUMN "ExternalEmailConnection"."provider" IS 'External email provider, GOOGLE or MICROSOFT.';
COMMENT ON COLUMN "ExternalEmailConnection"."providerAccountId" IS 'Provider account identifier when available. This is not used as a public display value.';
COMMENT ON COLUMN "ExternalEmailConnection"."providerAccountEmail" IS 'Connected account email address shown to the user as sender identity.';
COMMENT ON COLUMN "ExternalEmailConnection"."status" IS 'Connection status. RECONNECT_REQUIRED blocks sending while preserving history.';
COMMENT ON COLUMN "ExternalEmailConnection"."encryptedAccessToken" IS 'AES-GCM encrypted OAuth access token envelope.';
COMMENT ON COLUMN "ExternalEmailConnection"."encryptedRefreshToken" IS 'AES-GCM encrypted OAuth refresh token envelope when the provider returns one.';
COMMENT ON COLUMN "ExternalEmailConnection"."tokenExpiresAt" IS 'Access token expiry instant returned by provider.';
COMMENT ON COLUMN "ExternalEmailConnection"."grantedScopes" IS 'Scopes granted by provider after OAuth exchange.';
COMMENT ON COLUMN "ExternalEmailConnection"."connectedAt" IS 'Connection creation or latest successful reconnect instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."disconnectedAt" IS 'User disconnect instant. The row stays for audit/history.';
COMMENT ON COLUMN "ExternalEmailConnection"."reconnectRequiredAt" IS 'Instant when auth expiry or permission failure required reconnect.';
COMMENT ON COLUMN "ExternalEmailConnection"."lastSentAt" IS 'Last successful follow-up email send instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."lastSendSafeErrorCode" IS 'Latest redacted send error code for the connection.';
COMMENT ON COLUMN "ExternalEmailConnection"."createdAt" IS 'Row creation instant.';
COMMENT ON COLUMN "ExternalEmailConnection"."updatedAt" IS 'Row update instant.';

-- Comments: ExternalEmailOAuthState
COMMENT ON TABLE "ExternalEmailOAuthState" IS 'Short-lived OAuth state for external email connection. Only a hash of state is stored.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."id" IS 'ExternalEmailOAuthState UUID primary key.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."userId" IS 'User who initiated OAuth. Callback validation resolves ownership through hashed state.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."provider" IS 'Email provider selected for the OAuth flow.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."stateHash" IS 'HMAC hash of the OAuth state. Raw state is never persisted.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."redirectUri" IS 'Redirect URI used to create the provider authorization URL.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."expiresAt" IS 'State expiry instant.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."consumedAt" IS 'Instant when callback consumed this state.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."createdAt" IS 'Row creation instant.';
COMMENT ON COLUMN "ExternalEmailOAuthState"."updatedAt" IS 'Row update instant.';

-- Comments: SmsSenderNumber
COMMENT ON TABLE "SmsSenderNumber" IS 'SMS sender number controlled by the user. The raw E.164 number is stored as hash, ciphertext, and masked display value only.';
COMMENT ON COLUMN "SmsSenderNumber"."id" IS 'SmsSenderNumber UUID primary key.';
COMMENT ON COLUMN "SmsSenderNumber"."userId" IS 'Sender owner. All queries and mutations must be scoped by userId.';
COMMENT ON COLUMN "SmsSenderNumber"."phoneE164Hash" IS 'HMAC hash of E.164 number for duplicate detection.';
COMMENT ON COLUMN "SmsSenderNumber"."phoneE164Ciphertext" IS 'AES-GCM encrypted E.164 number.';
COMMENT ON COLUMN "SmsSenderNumber"."phoneE164Masked" IS 'Masked phone number for UI and logs.';
COMMENT ON COLUMN "SmsSenderNumber"."status" IS 'Verification status. Only VERIFIED senders can send SMS.';
COMMENT ON COLUMN "SmsSenderNumber"."provider" IS 'SMS provider name when assigned.';
COMMENT ON COLUMN "SmsSenderNumber"."providerSenderId" IS 'Provider sender identifier when assigned.';
COMMENT ON COLUMN "SmsSenderNumber"."verificationCodeHash" IS 'HMAC hash of verification code. Raw code is never stored.';
COMMENT ON COLUMN "SmsSenderNumber"."verificationExpiresAt" IS 'Verification code expiry instant.';
COMMENT ON COLUMN "SmsSenderNumber"."verifiedAt" IS 'Successful sender verification instant.';
COMMENT ON COLUMN "SmsSenderNumber"."revokedAt" IS 'User revoke instant. The row stays for audit/history.';
COMMENT ON COLUMN "SmsSenderNumber"."lastSentAt" IS 'Last successful follow-up SMS send instant.';
COMMENT ON COLUMN "SmsSenderNumber"."lastSendSafeErrorCode" IS 'Latest redacted send error code for this sender.';
COMMENT ON COLUMN "SmsSenderNumber"."createdAt" IS 'Row creation instant.';
COMMENT ON COLUMN "SmsSenderNumber"."updatedAt" IS 'Row update instant.';

-- Comments: FollowUpConsentNotice
COMMENT ON TABLE "FollowUpConsentNotice" IS 'Channel consent acknowledgement for user-initiated follow-up delivery. One row is kept per user/channel.';
COMMENT ON COLUMN "FollowUpConsentNotice"."id" IS 'FollowUpConsentNotice UUID primary key.';
COMMENT ON COLUMN "FollowUpConsentNotice"."userId" IS 'Consent owner.';
COMMENT ON COLUMN "FollowUpConsentNotice"."channel" IS 'Acknowledged follow-up channel.';
COMMENT ON COLUMN "FollowUpConsentNotice"."acknowledgedAt" IS 'Latest acknowledgement instant.';
COMMENT ON COLUMN "FollowUpConsentNotice"."createdAt" IS 'Row creation instant.';
COMMENT ON COLUMN "FollowUpConsentNotice"."updatedAt" IS 'Row update instant.';

-- Comments: FollowUpMessage
COMMENT ON TABLE "FollowUpMessage" IS 'Follow-up draft and delivery history. Message body is persisted for user history, but logs and provider attempts must store only redacted metadata.';
COMMENT ON COLUMN "FollowUpMessage"."id" IS 'FollowUpMessage UUID primary key.';
COMMENT ON COLUMN "FollowUpMessage"."userId" IS 'Message owner. All history queries must be scoped by userId.';
COMMENT ON COLUMN "FollowUpMessage"."sourceReportId" IS 'AI weekly report that produced the source suggestion. History remains if report is removed.';
COMMENT ON COLUMN "FollowUpMessage"."sourceSuggestionId" IS 'AI follow-up suggestion that produced the draft. History remains if suggestion is removed.';
COMMENT ON COLUMN "FollowUpMessage"."channel" IS 'Delivery channel, EMAIL or SMS.';
COMMENT ON COLUMN "FollowUpMessage"."status" IS 'Draft/send lifecycle status.';
COMMENT ON COLUMN "FollowUpMessage"."languageTag" IS 'BCP 47 language tag used for the draft content.';
COMMENT ON COLUMN "FollowUpMessage"."emailConnectionId" IS 'External email connection used by an email follow-up.';
COMMENT ON COLUMN "FollowUpMessage"."smsSenderNumberId" IS 'SMS sender number used by an SMS follow-up.';
COMMENT ON COLUMN "FollowUpMessage"."senderDisplayName" IS 'Sender display name shown in compose/history.';
COMMENT ON COLUMN "FollowUpMessage"."senderEmail" IS 'Sender email display value for email follow-up.';
COMMENT ON COLUMN "FollowUpMessage"."senderPhoneE164Masked" IS 'Masked sender phone display value for SMS follow-up.';
COMMENT ON COLUMN "FollowUpMessage"."recipientContactId" IS 'CRM contact recipient when known. History remains if contact is removed.';
COMMENT ON COLUMN "FollowUpMessage"."recipientName" IS 'Recipient display name.';
COMMENT ON COLUMN "FollowUpMessage"."recipientEmail" IS 'Recipient email address for email follow-up.';
COMMENT ON COLUMN "FollowUpMessage"."recipientPhoneE164Masked" IS 'Masked recipient phone for SMS follow-up history.';
COMMENT ON COLUMN "FollowUpMessage"."subject" IS 'Email subject. SMS messages normally leave this null.';
COMMENT ON COLUMN "FollowUpMessage"."body" IS 'Full follow-up body stored for user history. Do not copy this into structured logs.';
COMMENT ON COLUMN "FollowUpMessage"."bodyPreview" IS 'Short body preview for lists and timelines.';
COMMENT ON COLUMN "FollowUpMessage"."provider" IS 'Provider used for final delivery.';
COMMENT ON COLUMN "FollowUpMessage"."providerMessageId" IS 'Safe provider message id returned after successful send.';
COMMENT ON COLUMN "FollowUpMessage"."safeErrorCode" IS 'Redacted final message error code.';
COMMENT ON COLUMN "FollowUpMessage"."safeErrorMessage" IS 'Redacted final message error message.';
COMMENT ON COLUMN "FollowUpMessage"."retryable" IS 'Whether the latest failure is retryable.';
COMMENT ON COLUMN "FollowUpMessage"."retryCount" IS 'Number of retry attempts recorded for this message.';
COMMENT ON COLUMN "FollowUpMessage"."sentAt" IS 'Final successful send instant.';
COMMENT ON COLUMN "FollowUpMessage"."failedAt" IS 'Final failure instant.';
COMMENT ON COLUMN "FollowUpMessage"."createdAt" IS 'Row creation instant.';
COMMENT ON COLUMN "FollowUpMessage"."updatedAt" IS 'Row update instant.';

-- Comments: FollowUpMessageTarget
COMMENT ON TABLE "FollowUpMessageTarget" IS 'Stable target links used to show follow-up history across report, deal, contact, meeting note, and schedule timelines.';
COMMENT ON COLUMN "FollowUpMessageTarget"."id" IS 'FollowUpMessageTarget UUID primary key.';
COMMENT ON COLUMN "FollowUpMessageTarget"."userId" IS 'Target link owner.';
COMMENT ON COLUMN "FollowUpMessageTarget"."messageId" IS 'Parent follow-up message. Deleting the message cascades child target links.';
COMMENT ON COLUMN "FollowUpMessageTarget"."targetType" IS 'Timeline target type.';
COMMENT ON COLUMN "FollowUpMessageTarget"."targetId" IS 'Timeline target UUID.';
COMMENT ON COLUMN "FollowUpMessageTarget"."targetPath" IS 'User Web route for the target.';
COMMENT ON COLUMN "FollowUpMessageTarget"."targetLabel" IS 'Human-readable target label.';
COMMENT ON COLUMN "FollowUpMessageTarget"."createdAt" IS 'Row creation instant.';

-- Comments: FollowUpDeliveryAttempt
COMMENT ON TABLE "FollowUpDeliveryAttempt" IS 'Follow-up provider delivery attempt. Stores safe status, cost, latency, retry metadata, and redacted detail only.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."id" IS 'FollowUpDeliveryAttempt UUID primary key.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."userId" IS 'Attempt owner. Operational queries must be scoped by userId.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."messageId" IS 'Parent follow-up message. Deleting the message cascades attempts.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."channel" IS 'Delivery channel for this attempt.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."status" IS 'Provider attempt lifecycle status.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."attemptNumber" IS 'Attempt sequence number starting at 1.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."provider" IS 'Email or SMS provider name.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."providerMessageId" IS 'Safe provider message id.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."providerStatusCode" IS 'Safe provider status or HTTP code.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."safeErrorCode" IS 'Redacted provider error code.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."safeErrorMessage" IS 'Redacted provider error message.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."retryable" IS 'Whether this failure can be retried.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."nextRetryAt" IS 'Next retry instant when retryable.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."latencyMs" IS 'Provider call latency in milliseconds.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."estimatedCostAmount" IS 'Estimated provider cost for this attempt.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."costCurrency" IS 'Cost currency, default USD.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."sentAt" IS 'Provider success instant.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."failedAt" IS 'Provider failure instant.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."detailJson" IS 'Allowlisted, redacted metadata only. No body, raw provider response, tokens, phone, or verification code.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."createdAt" IS 'Row creation instant.';
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."updatedAt" IS 'Row update instant.';

-- Comments: indexes
COMMENT ON INDEX "ExternalEmailConnection_userId_provider_key" IS 'A user can have one active row per external email provider while history fields preserve lifecycle changes.';
COMMENT ON INDEX "ExternalEmailConnection_userId_status_idx" IS 'Used to list connected or reconnect-required email accounts for a user.';
COMMENT ON INDEX "ExternalEmailOAuthState_stateHash_key" IS 'Prevents OAuth state replay by enforcing unique hashed state values.';
COMMENT ON INDEX "ExternalEmailOAuthState_userId_provider_expiresAt_idx" IS 'Used to expire and validate pending OAuth states for a provider/user.';
COMMENT ON INDEX "SmsSenderNumber_userId_phoneE164Hash_key" IS 'Prevents duplicate sender numbers per user without storing raw E.164 text.';
COMMENT ON INDEX "SmsSenderNumber_userId_status_createdAt_idx" IS 'Used to list verified/pending/revoked sender numbers.';
COMMENT ON INDEX "FollowUpConsentNotice_userId_channel_key" IS 'Keeps one channel consent acknowledgement row per user/channel.';
COMMENT ON INDEX "FollowUpMessage_userId_channel_status_createdAt_idx" IS 'Used for user follow-up history and draft/send status lists.';
COMMENT ON INDEX "FollowUpMessage_userId_sourceReportId_createdAt_idx" IS 'Used to list follow-ups generated from a weekly AI report.';
COMMENT ON INDEX "FollowUpMessage_recipientContactId_createdAt_idx" IS 'Used to render follow-up history on a contact timeline.';
COMMENT ON INDEX "FollowUpMessageTarget_messageId_targetType_targetId_key" IS 'Prevents duplicate target links on the same follow-up message.';
COMMENT ON INDEX "FollowUpMessageTarget_userId_targetType_targetId_createdAt_idx" IS 'Used to render follow-up history on report/deal/contact/meeting-note/schedule timelines.';
COMMENT ON INDEX "FollowUpDeliveryAttempt_messageId_createdAt_idx" IS 'Used to display provider attempt history for a follow-up message.';
COMMENT ON INDEX "FollowUpDeliveryAttempt_userId_channel_status_createdAt_idx" IS 'Used for operational follow-up delivery status views.';
COMMENT ON INDEX "FollowUpDeliveryAttempt_status_nextRetryAt_idx" IS 'Used by future retry workers to find due retryable attempts.';
