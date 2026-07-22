# G01 DB Notification Foundation

상태: Ready

## 1. 목적

Notification reminder 기능을 저장할 Prisma schema, migration, repository 기반, push subscription 암호화 기반을 만든다.

## 2. 선행 조건

- `BE/prisma/schema.prisma`가 현재 DB schema source of truth다.
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`의 `NBA-014` DB/Prisma 운영 gate를 먼저 확인한다.
- 공유/운영성 DB에는 사용자 결정 없이 migrate/seed를 실행하지 않는다.
- DB target, migration status, Prisma generate/seed 영향이 확인되지 않으면 migration 실행은 하지 않는다.
- `BE-TODO/DB-SCHEMA.md`가 confirmed 상태다.

## 3. 포함 범위

- Prisma enum 추가
  - `NotificationType`
  - `NotificationStatus`
  - `NotificationSourceType`
  - `NotificationDeliveryChannel`
  - `NotificationDeliveryStatus`
  - `BrowserPushSubscriptionStatus`
- Prisma model 추가
  - `Notification`
  - `UserNotificationSetting`
  - `BrowserPushSubscription`
  - `NotificationDeliveryAttempt`
- `User` relation 추가
- migration 생성
- migration SQL comment 추가
- repository port와 Prisma adapter 기반 추가
- push subscription encryption port/service 추가
- repository/encryption unit test

## 4. 제외 범위

- HTTP API controller 구현
- SMTP/Web Push 실제 발송
- User Web 화면 구현
- 다음 행동 알림
- 회의록 후속 알림
- Admin provider failure UI

## 5. 구현 기준

- `BE-TODO/DB-SCHEMA.md`를 Prisma schema 기준으로 사용한다.
- `NBA-014` 기준상 기존 migration 파일은 수정하지 않고 신규 migration만 추가한다.
- `BrowserPushSubscription.endpoint/p256dh/auth`는 원문 저장 금지다.
- `Notification.dedupeKey`는 `@@unique([userId, dedupeKey])`로 중복을 막는다.
- `NotificationDeliveryAttempt.detailJson`에는 provider raw response를 저장하지 않는다.
- 모든 시스템 시각은 UTC instant이다.

## 6. 검증 명령

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run test -- notification
```

`pnpm run prisma:migrate`는 DB target이 로컬 dev/test로 확인된 경우에만 실행한다.

## 7. 완료 기준

- Prisma schema에 신규 enum/model/relation이 반영되어 있다.
- migration에 table, index, FK, check constraint, comment가 포함되어 있다.
- `NBA-014` 선행 체크 결과가 goal work log 또는 planning/QA 문서에 남아 있다.
- repository adapter가 user ownership 조회를 제공한다.
- push subscription encryption/decryption 또는 send용 복호화 흐름이 테스트된다.
- endpoint/key 원문이 DB에 저장되지 않는다.
