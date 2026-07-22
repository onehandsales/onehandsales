# Notification Reminder DB Schema

상태: Confirmed
구현 상태: Not Started
기준: `BE/prisma/schema.prisma`

## 1. 목적

일정 시작 전과 딜 마감일 알림을 DB에 예약하고, 앱 안 알림과 email/browser push delivery 상태를 추적한다.

## 2. 테이블 결정

새로 만든다:

- `Notification`: 앱 안 알림 정본과 예약 상태
- `UserNotificationSetting`: 사용자별 알림 설정
- `BrowserPushSubscription`: Web Push subscription 정보
- `NotificationDeliveryAttempt`: email/browser push 발송 시도 이력

기존 모델에 relation을 추가한다:

- `User`
- `Schedule`
- `Deal`

## 3. Prisma enum 초안

```prisma
enum NotificationType {
  SCHEDULE_START_REMINDER
  DEAL_DUE_REMINDER
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  CANCELED
}

enum NotificationSourceType {
  SCHEDULE
  DEAL
}

enum NotificationDeliveryChannel {
  EMAIL
  BROWSER_PUSH
}

enum NotificationDeliveryStatus {
  PENDING
  SENT
  FAILED
  CANCELED
}

enum BrowserPushSubscriptionStatus {
  ACTIVE
  REVOKED
}
```

## 4. Prisma model 초안

```prisma
model UserNotificationSetting {
  id                         String   @id @default(uuid()) @db.Uuid
  userId                     String   @unique @db.Uuid
  scheduleReminderEnabled    Boolean  @default(true)
  dealDueReminderEnabled     Boolean  @default(true)
  emailNotificationEnabled   Boolean  @default(true)
  browserPushEnabled         Boolean  @default(false)
  scheduleReminderMinutes    Int      @default(30)
  dealDueReminderDaysBefore  Int      @default(1)
  dealDueReminderLocalTime   String   @default("09:00")
  createdAt                  DateTime @default(now()) @db.Timestamptz(3)
  updatedAt                  DateTime @updatedAt @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id])
}

model Notification {
  id             String                   @id @default(uuid()) @db.Uuid
  userId         String                   @db.Uuid
  type           NotificationType
  sourceType     NotificationSourceType
  sourceId       String                   @db.Uuid
  dedupeKey      String
  targetPath     String
  title          String
  body           String?
  targetLabel    String?
  status         NotificationStatus       @default(PENDING)
  scheduledAt    DateTime                 @db.Timestamptz(3)
  sentAt         DateTime?                @db.Timestamptz(3)
  readAt         DateTime?                @db.Timestamptz(3)
  canceledAt     DateTime?                @db.Timestamptz(3)
  cancelReason   String?
  metadataJson   Json                     @default("{}")
  createdAt      DateTime                 @default(now()) @db.Timestamptz(3)
  updatedAt      DateTime                 @updatedAt @db.Timestamptz(3)

  user      User                          @relation(fields: [userId], references: [id])
  deliveries NotificationDeliveryAttempt[]

  @@unique([userId, dedupeKey])
  @@index([userId, status, scheduledAt])
  @@index([userId, readAt, scheduledAt])
  @@index([userId, sourceType, sourceId])
  @@index([scheduledAt, status])
}

model NotificationDeliveryAttempt {
  id                  String                     @id @default(uuid()) @db.Uuid
  notificationId      String                     @db.Uuid
  userId              String                     @db.Uuid
  channel             NotificationDeliveryChannel
  status              NotificationDeliveryStatus @default(PENDING)
  attemptNumber       Int                        @default(1)
  provider            String?
  providerMessageId   String?
  providerStatusCode  String?
  safeErrorCode       String?
  safeErrorMessage    String?
  retryable           Boolean                    @default(false)
  nextRetryAt         DateTime?                  @db.Timestamptz(3)
  sentAt              DateTime?                  @db.Timestamptz(3)
  failedAt            DateTime?                  @db.Timestamptz(3)
  detailJson          Json                       @default("{}")
  createdAt           DateTime                   @default(now()) @db.Timestamptz(3)
  updatedAt           DateTime                   @updatedAt @db.Timestamptz(3)

  notification Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id])

  @@index([notificationId, channel, createdAt])
  @@index([userId, channel, status, createdAt])
  @@index([status, nextRetryAt])
}

model BrowserPushSubscription {
  id                 String                        @id @default(uuid()) @db.Uuid
  userId             String                        @db.Uuid
  endpointHash       String
  endpointCiphertext String
  p256dhCiphertext   String
  authCiphertext     String
  contentKeyVersion  String
  status             BrowserPushSubscriptionStatus @default(ACTIVE)
  userAgent          String?
  deviceLabel        String?
  lastSeenAt         DateTime?                     @db.Timestamptz(3)
  revokedAt          DateTime?                     @db.Timestamptz(3)
  createdAt          DateTime                      @default(now()) @db.Timestamptz(3)
  updatedAt          DateTime                      @updatedAt @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id])

  @@unique([endpointHash])
  @@index([userId, status, createdAt])
}
```

`User` relation 추가:

```prisma
notificationSetting       UserNotificationSetting?
notifications             Notification[]
notificationDeliveries    NotificationDeliveryAttempt[]
browserPushSubscriptions  BrowserPushSubscription[]
```

## 5. SQL DDL 초안

아래 SQL은 PostgreSQL 기준 migration 초안이다. 실제 구현 시에는 Prisma migration 생성 결과를 기준으로 하되, enum/table/index/FK/comment가 이 초안과 동등한지 확인한다.

```sql
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
    'SCHEDULE_START_REMINDER',
    'DEAL_DUE_REMINDER'
);

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED',
    'CANCELED'
);

-- CreateEnum
CREATE TYPE "NotificationSourceType" AS ENUM (
    'SCHEDULE',
    'DEAL'
);

-- CreateEnum
CREATE TYPE "NotificationDeliveryChannel" AS ENUM (
    'EMAIL',
    'BROWSER_PUSH'
);

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED',
    'CANCELED'
);

-- CreateEnum
CREATE TYPE "BrowserPushSubscriptionStatus" AS ENUM (
    'ACTIVE',
    'REVOKED'
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

    CONSTRAINT "UserNotificationSetting_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserNotificationSetting_scheduleReminderMinutes_check" CHECK ("scheduleReminderMinutes" >= 0 AND "scheduleReminderMinutes" <= 1440),
    CONSTRAINT "UserNotificationSetting_dealDueReminderDaysBefore_check" CHECK ("dealDueReminderDaysBefore" >= 0 AND "dealDueReminderDaysBefore" <= 30),
    CONSTRAINT "UserNotificationSetting_dealDueReminderLocalTime_check" CHECK ("dealDueReminderLocalTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
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

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Notification_dedupeKey_check" CHECK (length(trim("dedupeKey")) > 0),
    CONSTRAINT "Notification_targetPath_check" CHECK (length(trim("targetPath")) > 0),
    CONSTRAINT "Notification_title_check" CHECK (length(trim("title")) > 0)
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

    CONSTRAINT "NotificationDeliveryAttempt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "NotificationDeliveryAttempt_attemptNumber_check" CHECK ("attemptNumber" >= 1)
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

    CONSTRAINT "BrowserPushSubscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BrowserPushSubscription_endpointHash_check" CHECK (length(trim("endpointHash")) > 0),
    CONSTRAINT "BrowserPushSubscription_endpointCiphertext_check" CHECK (length(trim("endpointCiphertext")) > 0),
    CONSTRAINT "BrowserPushSubscription_p256dhCiphertext_check" CHECK (length(trim("p256dhCiphertext")) > 0),
    CONSTRAINT "BrowserPushSubscription_authCiphertext_check" CHECK (length(trim("authCiphertext")) > 0),
    CONSTRAINT "BrowserPushSubscription_contentKeyVersion_check" CHECK (length(trim("contentKeyVersion")) > 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSetting_userId_key" ON "UserNotificationSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");

-- CreateIndex
CREATE INDEX "Notification_userId_status_scheduledAt_idx" ON "Notification"("userId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_scheduledAt_idx" ON "Notification"("userId", "readAt", "scheduledAt");

-- CreateIndex
CREATE INDEX "Notification_userId_sourceType_sourceId_idx" ON "Notification"("userId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Notification_scheduledAt_status_idx" ON "Notification"("scheduledAt", "status");

-- CreateIndex
CREATE INDEX "NotificationDeliveryAttempt_notificationId_channel_createdAt_idx" ON "NotificationDeliveryAttempt"("notificationId", "channel", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDeliveryAttempt_userId_channel_status_createdAt_idx" ON "NotificationDeliveryAttempt"("userId", "channel", "status", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDeliveryAttempt_status_nextRetryAt_idx" ON "NotificationDeliveryAttempt"("status", "nextRetryAt");

-- CreateIndex
CREATE UNIQUE INDEX "BrowserPushSubscription_endpointHash_key" ON "BrowserPushSubscription"("endpointHash");

-- CreateIndex
CREATE INDEX "BrowserPushSubscription_userId_status_createdAt_idx" ON "BrowserPushSubscription"("userId", "status", "createdAt");

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

-- Comments: enum types
COMMENT ON TYPE "NotificationType" IS '02 Notification Reminder에서 생성하는 알림 타입. 일정 시작 전과 딜 마감일 알림만 포함한다.';
COMMENT ON TYPE "NotificationStatus" IS '앱 안 알림 정본의 예약, 노출, 실패, 취소 상태.';
COMMENT ON TYPE "NotificationSourceType" IS '알림을 발생시킨 원본 도메인 타입. 02에서는 SCHEDULE 또는 DEAL만 사용한다.';
COMMENT ON TYPE "NotificationDeliveryChannel" IS '앱 안 알림 외부 발송 채널. 02에서는 EMAIL과 BROWSER_PUSH를 사용한다.';
COMMENT ON TYPE "NotificationDeliveryStatus" IS 'email/browser push delivery attempt의 발송, 실패, 취소 상태.';
COMMENT ON TYPE "BrowserPushSubscriptionStatus" IS '브라우저 push subscription의 활성/해지 상태.';

-- Comments: UserNotificationSetting
COMMENT ON TABLE "UserNotificationSetting" IS '사용자별 알림 설정. 02에서는 일정 시작 전, 딜 마감일, 이메일, 브라우저 push toggle을 저장한다.';
COMMENT ON COLUMN "UserNotificationSetting"."id" IS 'UserNotificationSetting UUID primary key.';
COMMENT ON COLUMN "UserNotificationSetting"."userId" IS '설정 소유 사용자 ID. 사용자당 하나의 설정 row만 허용한다.';
COMMENT ON COLUMN "UserNotificationSetting"."scheduleReminderEnabled" IS '일정 시작 전 알림 사용 여부. 기본값은 true.';
COMMENT ON COLUMN "UserNotificationSetting"."dealDueReminderEnabled" IS '딜 마감일 알림 사용 여부. 기본값은 true.';
COMMENT ON COLUMN "UserNotificationSetting"."emailNotificationEnabled" IS '이메일 알림 사용 여부. 기본값은 true.';
COMMENT ON COLUMN "UserNotificationSetting"."browserPushEnabled" IS '브라우저 push 알림 사용 여부. 구독 등록 전 기본값은 false.';
COMMENT ON COLUMN "UserNotificationSetting"."scheduleReminderMinutes" IS '일정 시작 몇 분 전에 알림을 예약할지 나타내는 내부 확장 필드. 02 기본값은 30이다.';
COMMENT ON COLUMN "UserNotificationSetting"."dealDueReminderDaysBefore" IS '딜 마감일 며칠 전에 알림을 예약할지 나타내는 내부 확장 필드. 02 기본값은 1이다.';
COMMENT ON COLUMN "UserNotificationSetting"."dealDueReminderLocalTime" IS '딜 마감일 알림 local time HH:mm. 02 기본값은 사용자 timezone 기준 09:00이다.';
COMMENT ON COLUMN "UserNotificationSetting"."createdAt" IS '설정 row 생성 시각. UTC instant.';
COMMENT ON COLUMN "UserNotificationSetting"."updatedAt" IS '설정 row 마지막 수정 시각. UTC instant.';

-- Comments: Notification
COMMENT ON TABLE "Notification" IS '앱 안 알림의 정본과 예약 상태. email/browser push는 이 row를 기준으로 delivery attempt를 만든다.';
COMMENT ON COLUMN "Notification"."id" IS 'Notification UUID primary key.';
COMMENT ON COLUMN "Notification"."userId" IS '알림 소유 사용자 ID. 모든 조회와 변경은 current user ownership으로 제한한다.';
COMMENT ON COLUMN "Notification"."type" IS '알림 타입. 02에서는 SCHEDULE_START_REMINDER 또는 DEAL_DUE_REMINDER만 사용한다.';
COMMENT ON COLUMN "Notification"."sourceType" IS '알림 원본 타입. SCHEDULE 또는 DEAL.';
COMMENT ON COLUMN "Notification"."sourceId" IS '알림 원본 Schedule 또는 Deal ID. 다형 참조이므로 FK를 직접 걸지 않는다.';
COMMENT ON COLUMN "Notification"."dedupeKey" IS '동일 사용자 내 중복 알림 방지 key. userId와 함께 unique index를 가진다.';
COMMENT ON COLUMN "Notification"."targetPath" IS '알림 클릭 시 이동할 User Web 경로. 예: /app/schedules/:scheduleId, /app/deals/:dealId.';
COMMENT ON COLUMN "Notification"."title" IS '화면, email, browser push에 사용할 안전한 짧은 제목.';
COMMENT ON COLUMN "Notification"."body" IS '화면 표시용 짧은 본문. private memo, meeting note body, deal amount, contact phone/email을 넣지 않는다.';
COMMENT ON COLUMN "Notification"."targetLabel" IS '사용자에게 보여줄 원본 대상명. 일정 제목 또는 딜 이름 등 안전한 label만 저장한다.';
COMMENT ON COLUMN "Notification"."status" IS '알림 상태. PENDING은 due 전, SENT는 앱 안 알림 목록 노출 가능, FAILED는 내부 처리 실패, CANCELED는 원본 변경/삭제 취소다.';
COMMENT ON COLUMN "Notification"."scheduledAt" IS '알림 due 시각. UTC instant. 일정은 startAt-30분, 딜은 사용자 timezone 기준 마감 1일 전 09:00을 UTC로 변환한다.';
COMMENT ON COLUMN "Notification"."sentAt" IS '앱 안 알림이 due 처리되어 SENT가 된 시각. UTC instant.';
COMMENT ON COLUMN "Notification"."readAt" IS '사용자가 알림을 읽음 처리한 시각. NULL이면 unread.';
COMMENT ON COLUMN "Notification"."canceledAt" IS '원본 일정/딜 변경 또는 삭제로 pending 알림이 취소된 시각. UTC instant.';
COMMENT ON COLUMN "Notification"."cancelReason" IS '취소 사유 code 또는 안전한 짧은 설명.';
COMMENT ON COLUMN "Notification"."metadataJson" IS '알림 처리에 필요한 최소 metadata. provider raw response, private memo, meeting note body, deal amount를 저장하지 않는다.';
COMMENT ON COLUMN "Notification"."createdAt" IS '알림 row 생성 시각. UTC instant.';
COMMENT ON COLUMN "Notification"."updatedAt" IS '알림 row 마지막 수정 시각. UTC instant.';

-- Comments: NotificationDeliveryAttempt
COMMENT ON TABLE "NotificationDeliveryAttempt" IS 'Notification을 기준으로 생성되는 email/browser push 발송 시도 이력. provider raw detail은 저장하지 않는다.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."id" IS 'NotificationDeliveryAttempt UUID primary key.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."notificationId" IS '발송 대상 Notification ID. Notification 삭제 시 함께 삭제된다.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."userId" IS '발송 대상 사용자 ID. delivery 조회와 보조 ownership 필터에 사용한다.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."channel" IS '발송 채널. EMAIL 또는 BROWSER_PUSH.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."status" IS '발송 시도 상태. PENDING, SENT, FAILED, CANCELED 중 하나다.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."attemptNumber" IS '같은 notification/channel에 대한 시도 번호. 첫 시도는 1이다.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."provider" IS '발송 provider 이름. 예: smtp, resend, web-push.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."providerMessageId" IS 'provider가 반환한 안전한 message ID. provider raw response 전체를 저장하지 않는다.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."providerStatusCode" IS 'provider가 반환한 안전한 상태 code 또는 HTTP status.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."safeErrorCode" IS '사용자/운영자에게 노출해도 되는 redacted error code.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."safeErrorMessage" IS '사용자/운영자에게 노출해도 되는 redacted error message. API key, quota detail, endpoint 원문을 넣지 않는다.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."retryable" IS '동일 delivery attempt 재시도 또는 새 attempt 생성이 의미 있는지 여부.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."nextRetryAt" IS '재시도 가능 시각. UTC instant.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."sentAt" IS 'provider 발송 성공 시각. UTC instant.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."failedAt" IS 'provider 발송 실패 시각. UTC instant.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."detailJson" IS 'redacted delivery detail. provider raw response, email body 전문, push endpoint/key를 저장하지 않는다.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."createdAt" IS 'delivery attempt row 생성 시각. UTC instant.';
COMMENT ON COLUMN "NotificationDeliveryAttempt"."updatedAt" IS 'delivery attempt row 마지막 수정 시각. UTC instant.';

-- Comments: BrowserPushSubscription
COMMENT ON TABLE "BrowserPushSubscription" IS '사용자 브라우저 push subscription의 암호화 저장 정보. endpoint, p256dh, auth 원문은 저장하지 않는다.';
COMMENT ON COLUMN "BrowserPushSubscription"."id" IS 'BrowserPushSubscription UUID primary key.';
COMMENT ON COLUMN "BrowserPushSubscription"."userId" IS 'subscription 소유 사용자 ID. 모든 변경은 current user ownership으로 제한한다.';
COMMENT ON COLUMN "BrowserPushSubscription"."endpointHash" IS 'push endpoint 중복 감지용 hash. endpoint 원문을 저장하지 않는다.';
COMMENT ON COLUMN "BrowserPushSubscription"."endpointCiphertext" IS '암호화된 push endpoint.';
COMMENT ON COLUMN "BrowserPushSubscription"."p256dhCiphertext" IS '암호화된 Web Push p256dh key.';
COMMENT ON COLUMN "BrowserPushSubscription"."authCiphertext" IS '암호화된 Web Push auth secret.';
COMMENT ON COLUMN "BrowserPushSubscription"."contentKeyVersion" IS 'subscription 암호화에 사용한 key version.';
COMMENT ON COLUMN "BrowserPushSubscription"."status" IS 'subscription 상태. ACTIVE 또는 REVOKED.';
COMMENT ON COLUMN "BrowserPushSubscription"."userAgent" IS '구독을 등록한 브라우저 user agent. 긴 값 또는 민감한 값 저장 여부는 구현 시 제한한다.';
COMMENT ON COLUMN "BrowserPushSubscription"."deviceLabel" IS '사용자에게 보여줄 기기 label.';
COMMENT ON COLUMN "BrowserPushSubscription"."lastSeenAt" IS 'subscription이 마지막으로 확인되거나 사용된 시각. UTC instant.';
COMMENT ON COLUMN "BrowserPushSubscription"."revokedAt" IS 'subscription이 사용자 해제 또는 provider 실패로 revoke된 시각. UTC instant.';
COMMENT ON COLUMN "BrowserPushSubscription"."createdAt" IS 'subscription row 생성 시각. UTC instant.';
COMMENT ON COLUMN "BrowserPushSubscription"."updatedAt" IS 'subscription row 마지막 수정 시각. UTC instant.';

-- Comments: indexes
COMMENT ON INDEX "UserNotificationSetting_userId_key" IS '사용자당 하나의 알림 설정 row만 허용한다.';
COMMENT ON INDEX "Notification_userId_dedupeKey_key" IS '같은 사용자에게 동일 원본/시각 알림이 중복 생성되지 않도록 막는다.';
COMMENT ON INDEX "Notification_userId_status_scheduledAt_idx" IS '사용자별 due 알림 목록과 상태 필터 조회에 사용한다.';
COMMENT ON INDEX "Notification_userId_readAt_scheduledAt_idx" IS '사용자별 unread/read 필터와 최신 알림 정렬에 사용한다.';
COMMENT ON INDEX "Notification_userId_sourceType_sourceId_idx" IS '일정/딜 변경 시 기존 pending 알림 조회와 취소에 사용한다.';
COMMENT ON INDEX "Notification_scheduledAt_status_idx" IS 'due processor가 PENDING이고 scheduledAt이 지난 알림을 찾는 데 사용한다.';
COMMENT ON INDEX "NotificationDeliveryAttempt_notificationId_channel_createdAt_idx" IS '알림별 email/browser push delivery attempt 이력 조회에 사용한다.';
COMMENT ON INDEX "NotificationDeliveryAttempt_userId_channel_status_createdAt_idx" IS '사용자별 delivery 상태와 채널별 운영 조회에 사용한다.';
COMMENT ON INDEX "NotificationDeliveryAttempt_status_nextRetryAt_idx" IS 'retryable delivery attempt 재처리 대상 조회에 사용한다.';
COMMENT ON INDEX "BrowserPushSubscription_endpointHash_key" IS '같은 browser push endpoint 중복 등록을 막는다.';
COMMENT ON INDEX "BrowserPushSubscription_userId_status_createdAt_idx" IS '사용자별 active/revoked browser push subscription 조회에 사용한다.';
```

DDL 주의:

- `Notification.sourceId`는 `sourceType`에 따라 `Schedule.id` 또는 `Deal.id`를 가리키는 다형 참조이므로 DB FK를 직접 걸지 않는다. 소유권과 존재 검증은 application/service layer에서 한다.
- UUID 기본값은 기존 migration 스타일처럼 DB default를 두지 않고 Prisma/application 생성값을 사용한다.
- Prisma migration 생성 결과가 index/check/comment 이름을 다르게 만들 수 있다. 실제 migration에서는 의미가 같은지 확인하고 문서와 다르면 문서를 갱신한다.

## 6. Dedupe key

중복 알림 방지를 위해 `Notification.dedupeKey`를 사용한다.

권장 형식:

```text
schedule:{scheduleId}:start:{scheduledAtUtcIso}
deal:{dealId}:due:{expectedEndDate}:{scheduledAtUtcIso}
```

일정 시작 시각이나 딜 마감일이 바뀌면 기존 pending notification은 `CANCELED` 처리하고 새 dedupe key로 다시 생성한다.

## 7. 데이터 보관과 민감정보

- `BrowserPushSubscription.endpointCiphertext`, `p256dhCiphertext`, `authCiphertext`는 encryption port로 암호화한다.
- `endpointHash`는 중복 감지를 위한 hash다.
- provider raw response는 `NotificationDeliveryAttempt.detailJson`에 저장하지 않는다.
- `Notification.body`에는 private memo, meeting note body, deal amount, contact phone/email을 넣지 않는다.
- email/push payload는 generic title/body와 `targetPath` 중심으로 만든다.

## 8. Migration 주의

- 기존 migration 파일은 수정하지 않는다.
- 신규 migration 이름 후보: `20260722010000_add_notification_reminder`
- 위 SQL DDL 초안의 type/table/index/FK/comment를 migration 결과와 대조한다.
- 모든 시스템 시각은 UTC instant이며 `timestamptz(3)`를 사용한다.
- date-only인 `Deal.expectedEndDate`는 사용자 timezone 기준 local 09:00 계산 후 UTC instant로 저장한다.
- 공유/운영성 DB에는 사용자 결정 없이 migrate/seed를 실행하지 않는다.

## 9. 검증 기준

- `pnpm run prisma:validate`
- `pnpm run prisma:generate`
- migration SQL에 `COMMENT ON TYPE`, `COMMENT ON TABLE`, `COMMENT ON COLUMN`, `COMMENT ON INDEX`가 포함되어 있는지 확인
- notification repository ownership test
- subscription endpoint/key 암호화 test
- dedupe key unique test
- due notification query index 기준 test
