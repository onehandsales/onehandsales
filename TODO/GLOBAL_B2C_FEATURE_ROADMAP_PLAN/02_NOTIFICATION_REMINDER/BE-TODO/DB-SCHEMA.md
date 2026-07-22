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

## 5. Dedupe key

중복 알림 방지를 위해 `Notification.dedupeKey`를 사용한다.

권장 형식:

```text
schedule:{scheduleId}:start:{scheduledAtUtcIso}
deal:{dealId}:due:{expectedEndDate}:{scheduledAtUtcIso}
```

일정 시작 시각이나 딜 마감일이 바뀌면 기존 pending notification은 `CANCELED` 처리하고 새 dedupe key로 다시 생성한다.

## 6. 데이터 보관과 민감정보

- `BrowserPushSubscription.endpointCiphertext`, `p256dhCiphertext`, `authCiphertext`는 encryption port로 암호화한다.
- `endpointHash`는 중복 감지를 위한 hash다.
- provider raw response는 `NotificationDeliveryAttempt.detailJson`에 저장하지 않는다.
- `Notification.body`에는 private memo, meeting note body, deal amount, contact phone/email을 넣지 않는다.
- email/push payload는 generic title/body와 `targetPath` 중심으로 만든다.

## 7. Migration 주의

- 기존 migration 파일은 수정하지 않는다.
- 신규 migration 이름 후보: `20260722010000_add_notification_reminder`
- 모든 시스템 시각은 UTC instant이며 `timestamptz(3)`를 사용한다.
- date-only인 `Deal.expectedEndDate`는 사용자 timezone 기준 local 09:00 계산 후 UTC instant로 저장한다.
- 공유/운영성 DB에는 사용자 결정 없이 migrate/seed를 실행하지 않는다.

## 8. 검증 기준

- `pnpm run prisma:validate`
- `pnpm run prisma:generate`
- notification repository ownership test
- subscription endpoint/key 암호화 test
- dedupe key unique test
- due notification query index 기준 test
