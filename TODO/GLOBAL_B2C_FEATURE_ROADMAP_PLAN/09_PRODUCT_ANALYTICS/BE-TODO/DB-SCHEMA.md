# DB Schema TODO

상태: Confirmed Plan

## 1. 현재 Prisma 기준

09 구현 전 반드시 확인한다.

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`

현재 존재하는 관련 model:

- `User`
- `AuthDevice`
- `AuthSession`
- `Deal`
- `DealFollowingActionLog`
- `Schedule`
- `ScheduleDeal`
- `MeetingNote`
- `MeetingNoteDeal`
- `BusinessCardScanLog`
- `ImportJob`
- `ImportUserLog`
- `AiProviderCallLog`

## 2. 신규 enum 구현 대상

```prisma
/// 기능 : 제품 분석 이벤트가 어떤 경로에서 기록됐는지 구분합니다.
enum ProductAnalyticsEventSource {
  CLIENT
  SERVER
  SYSTEM
}

/// 기능 : 사용자 activation snapshot 계산 상태를 구분합니다.
enum UserActivationStatus {
  NOT_ACTIVATED
  ACTIVATED
}

/// 기능 : 제품 분석 이벤트가 연결할 수 있는 안전한 대상 타입을 구분합니다.
enum ProductAnalyticsTargetType {
  USER
  DEAL
  SCHEDULE
  MEETING_NOTE
  BUSINESS_CARD_SCAN
  IMPORT_JOB
  EXPORT
}
```

Migration에는 enum 생성 주석을 남긴다.

Migration SQL에는 아래 enum 생성을 포함한다.

```sql
CREATE TYPE "ProductAnalyticsEventSource" AS ENUM ('CLIENT', 'SERVER', 'SYSTEM');
CREATE TYPE "UserActivationStatus" AS ENUM ('NOT_ACTIVATED', 'ACTIVATED');
CREATE TYPE "ProductAnalyticsTargetType" AS ENUM ('USER', 'DEAL', 'SCHEDULE', 'MEETING_NOTE', 'BUSINESS_CARD_SCAN', 'IMPORT_JOB', 'EXPORT');
```

## 3. ProductAnalyticsEvent

기존 model에 추가할 relation field:

```prisma
model User {
  /// 기능 : 사용자의 제품 분석 원본 이벤트 목록입니다. 계정 실제 삭제 시 함께 삭제됩니다.
  productAnalyticsEvents ProductAnalyticsEvent[]
  /// 기능 : 사용자의 activation 계산 snapshot입니다. 계정 실제 삭제 시 함께 삭제됩니다.
  activationSnapshot     UserActivationSnapshot?
}

model AuthSession {
  /// 기능 : 이 app session에서 발생한 제품 분석 이벤트 목록입니다.
  productAnalyticsEvents ProductAnalyticsEvent[]
}

model AuthDevice {
  /// 기능 : 이 인증 기기에서 발생한 제품 분석 이벤트 목록입니다.
  productAnalyticsEvents ProductAnalyticsEvent[]
}
```

신규 model 구현 대상:

```prisma
/// 기능 : Global B2C 제품 사용 분석을 위한 allowlist 기반 원본 이벤트입니다.
model ProductAnalyticsEvent {
  /// 기능 : 분석 이벤트 row의 고유 식별자입니다.
  id              String                      @id @default(uuid()) @db.Uuid
  /// 기능 : 이벤트를 발생시킨 사용자입니다. 계정 실제 삭제 시 함께 삭제됩니다.
  userId          String                      @db.Uuid
  /// 기능 : Backend app session 식별자입니다. Client가 보내지 않고 Backend가 현재 인증에서 채웁니다.
  authSessionId   String?                     @db.Uuid
  /// 기능 : 인증 device 식별자입니다. AuthSession 조회로 Backend가 채웁니다.
  authDeviceId    String?                     @db.Uuid
  /// 기능 : allowlist에 등록된 snake_case 이벤트 이름입니다.
  eventName       String
  /// 기능 : 이벤트 payload schema 버전입니다.
  eventVersion    Int                         @default(1)
  /// 기능 : client, server, system 중 이벤트 기록 출처입니다.
  source          ProductAnalyticsEventSource
  /// 기능 : 이벤트 발생 시각입니다. UTC instant로 저장합니다.
  occurredAt      DateTime                    @db.Timestamptz(3)
  /// 기능 : 이벤트 당시 사용자 timezone 기준 날짜입니다. D1/D7/D30 계산에 사용합니다.
  eventDate       DateTime                    @db.Date
  /// 기능 : 이벤트 당시 사용자 IANA timezone입니다.
  timeZone        String
  /// 기능 : 같은 server event의 중복 기록을 막는 선택 idempotency key입니다.
  idempotencyKey  String?
  /// 기능 : 이벤트가 연결된 안전한 대상 타입입니다. 회사명/담당자명 같은 PII는 저장하지 않습니다.
  targetType      ProductAnalyticsTargetType?
  /// 기능 : 이벤트가 연결된 안전한 대상 UUID입니다. payload에는 중복 저장하지 않습니다.
  targetId        String?                     @db.Uuid
  /// 기능 : event별 allowlist schema를 통과한 비식별 payload입니다.
  payloadJson     Json                        @default("{}")
  /// 기능 : 이벤트가 수집된 시각입니다.
  createdAt       DateTime                    @default(now()) @db.Timestamptz(3)

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  authSession AuthSession? @relation(fields: [authSessionId], references: [id], onDelete: SetNull)
  authDevice  AuthDevice?  @relation(fields: [authDeviceId], references: [id], onDelete: SetNull)

  @@unique([userId, eventName, idempotencyKey])
  @@index([userId, eventName, occurredAt])
  @@index([userId, eventDate])
  @@index([eventName, eventDate])
  @@index([source, createdAt])
  @@index([occurredAt])
  @@index([authSessionId])
  @@index([authDeviceId])
}
```

주의:

- `payloadJson`은 자유 JSON이 아니다. application allowlist를 통과한 JSON만 저장한다.
- `userAgent`, `ipAddressHash`, `deviceIdHash`를 analytics table에 복제하지 않는다.
- `eventName`, `eventVersion`, `payloadJson` 구조는 domain taxonomy 파일과 API spec이 같은 내용을 말해야 한다.
- 계정 삭제 hard delete 시 `ProductAnalyticsEvent`는 user relation cascade 또는 삭제 job으로 반드시 제거된다.

Event name 동기화 기준:

- `ProductAnalyticsEvent.eventName`은 DB enum이 아니라 string으로 둔다. event 의미 변경 시 `eventVersion` 또는 신규 event name으로 대응하기 위해서다.
- 09 runtime 저장 allowlist 정본은 `COMMON/EVENT-TAXONOMY.md`다.
- 09 runtime client event는 `app_route_viewed`만 저장한다.
- 09 runtime server event는 `auth_signup_completed`, `deal_created`, `deal_next_action_created`, `schedule_created`, `schedule_deal_linked`, `meeting_note_created`, `meeting_note_deal_linked`, `business_card_scan_confirmed`, `import_confirmed`, `export_downloaded`만 저장한다.
- `paywall_viewed`, `upgrade_clicked`, `trial_started`, `coupon_applied`, `referral_invited`, `subscription_started`, `subscription_canceled`, `churn_survey_submitted`는 09 runtime allowlist에 넣지 않고 12 Billing reserved로만 둔다.

## 4. UserActivationSnapshot

```prisma
/// 기능 : 사용자별 activation 달성 여부와 달성 시점을 저장합니다.
model UserActivationSnapshot {
  /// 기능 : activation snapshot row의 고유 식별자입니다.
  id                         String               @id @default(uuid()) @db.Uuid
  /// 기능 : activation을 계산할 사용자입니다. 계정 실제 삭제 시 함께 삭제됩니다.
  userId                     String               @unique @db.Uuid
  /// 기능 : 현재 activation 계산 상태입니다.
  status                     UserActivationStatus @default(NOT_ACTIVATED)
  /// 기능 : 첫 딜 생성 이벤트 시각입니다.
  firstDealCreatedAt         DateTime?            @db.Timestamptz(3)
  /// 기능 : 첫 다음 행동/일정/회의록 연결 이벤트 시각입니다.
  firstMeaningfulActionAt    DateTime?            @db.Timestamptz(3)
  /// 기능 : activation 달성 시각입니다.
  activatedAt                DateTime?            @db.Timestamptz(3)
  /// 기능 : activation 달성 이벤트 row의 사용자 timezone 기준 날짜입니다.
  activatedEventDate         DateTime?            @db.Date
  /// 기능 : activation 달성 이벤트 row에 저장된 사용자 timezone입니다.
  timeZone                   String?
  /// 기능 : snapshot 마지막 계산 시각입니다.
  calculatedAt               DateTime             @default(now()) @db.Timestamptz(3)
  /// 기능 : row 생성 시각입니다.
  createdAt                  DateTime             @default(now()) @db.Timestamptz(3)
  /// 기능 : row 수정 시각입니다.
  updatedAt                  DateTime             @updatedAt @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status, activatedEventDate])
  @@index([activatedAt])
}
```

`UserActivationSnapshot`을 추가하면 `User` model의 `activationSnapshot` relation도 함께 추가한다.

## 5. RetentionCohortSnapshot

```prisma
/// 기능 : 비식별 cohort 단위 retention 계산 결과를 저장합니다.
model RetentionCohortSnapshot {
  /// 기능 : retention cohort snapshot row의 고유 식별자입니다.
  id                String   @id @default(uuid()) @db.Uuid
  /// 기능 : cohort 기준 날짜입니다. 사용자 timezone 기준 activation date를 사용합니다.
  cohortDate        DateTime @db.Date
  /// 기능 : retention day offset입니다. 예: 1, 7, 30.
  dayOffset         Int
  /// 기능 : cohort에 포함된 사용자 수입니다.
  cohortUserCount   Int
  /// 기능 : 해당 day에 active로 관측된 사용자 수입니다.
  retainedUserCount Int
  /// 기능 : snapshot 계산 시각입니다.
  calculatedAt      DateTime @default(now()) @db.Timestamptz(3)
  /// 기능 : row 생성 시각입니다.
  createdAt         DateTime @default(now()) @db.Timestamptz(3)
  /// 기능 : row 수정 시각입니다.
  updatedAt         DateTime @updatedAt @db.Timestamptz(3)

  @@unique([cohortDate, dayOffset])
  @@index([cohortDate])
}
```

`RetentionCohortSnapshot`은 userId를 저장하지 않는 aggregate다. 계정 삭제 이후에도 장기 보관한다.

## 6. Reserved / 후속 모델

09에서 만들지 않는다.

- `AiUsageDaily`: 09에서는 만들지 않는다. 12 Billing의 AI plan/quota에서 source of truth 여부를 확정한다.
- `ExperimentAssignment`: 09에서는 만들지 않는다. 12 이후 growth experiment에서 생성 여부를 확정한다.
- `ChurnSurveyResponse`: 12 cancel/churn flow에서 저장 위치를 확정한다.
- `BillingEvent`, `UserSubscription`, `UsageMeter`: 12에서 확정한다.

## 7. Migration 주의

- 기존 migration 파일은 수정하지 않는다.
- 새 table/enum/column에는 Prisma schema 한국어 `/// 기능 : ...` 주석을 둔다.
- migration SQL에는 table comment, column comment, 주요 index comment를 남긴다. 구체적인 SQL COMMENT 기준은 `COMMON/PRISMA-MIGRATION-SPEC.md`를 따른다.
- 운영/공유 DB에 무단 `migrate dev`, `migrate deploy`, `seed`를 실행하지 않는다.
- raw event table은 빠르게 커질 수 있으므로 `eventDate`, `eventName`, `userId` index를 처음부터 둔다.
- retention purge query가 index를 타도록 `occurredAt` 단일 index를 반드시 둔다.
- PII/raw text가 저장되지 않도록 DB가 아니라 application allowlist에서 먼저 차단한다.
