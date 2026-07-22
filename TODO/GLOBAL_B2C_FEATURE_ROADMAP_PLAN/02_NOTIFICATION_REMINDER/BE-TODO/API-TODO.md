# Backend API TODO

상태: Confirmed
구현 상태: Not Started
기준 API 계약: `COMMON/API-SPEC/NOTIFICATION_API.md`

## 1. 목표

Notification module을 새로 만들고, User Web이 알림 목록, unread count, 읽음 처리, 알림 설정, browser push subscription을 사용할 수 있게 한다.

일정과 딜 변경 시 reminder notification을 예약하고, due processor가 앱 안 알림을 열고 email/browser push delivery attempt를 처리한다.

## 2. User API

| Method | Path | API 식별자 | 목적 |
|---|---|---|---|
| `GET` | `/api/notifications` | `ListNotifications` | 알림 목록 조회 |
| `GET` | `/api/notifications/unread-count` | `GetNotificationUnreadCount` | app shell unread count 조회 |
| `PATCH` | `/api/notifications/:notificationId/read` | `MarkNotificationRead` | 알림 읽음 처리 |
| `GET` | `/api/notifications/settings` | `GetNotificationSettings` | 알림 설정 조회 |
| `PATCH` | `/api/notifications/settings` | `UpdateNotificationSettings` | 알림 설정 수정 |
| `GET` | `/api/notifications/browser-push/public-key` | `GetBrowserPushPublicKey` | VAPID public key 조회 |
| `POST` | `/api/notifications/browser-subscriptions` | `CreateBrowserPushSubscription` | browser push 구독 등록 |
| `DELETE` | `/api/notifications/browser-subscriptions/:subscriptionId` | `RevokeBrowserPushSubscription` | browser push 구독 해제 |

## 3. 내부 use case

HTTP API가 아닌 application use case도 구현한다.

| Use case | 목적 |
|---|---|
| `ScheduleNotificationReminderUseCase` | 일정 생성/수정 시 schedule reminder 예약 |
| `CancelScheduleNotificationReminderUseCase` | 일정 삭제/변경 시 pending reminder 취소 |
| `ScheduleDealDueReminderUseCase` | 딜 생성/수정 시 due reminder 예약 |
| `CancelDealDueReminderUseCase` | 딜 삭제/마감일 변경 시 pending reminder 취소 |
| `ProcessDueNotificationsUseCase` | due notification을 앱 안 알림으로 열고 delivery attempt 생성/처리 |
| `SendNotificationDeliveryAttemptUseCase` | email/browser push 발송 시도 |

## 4. Backend 구조

### Controller

- `NotificationController`
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:notificationId/read`
- `GET /api/notifications/settings`
- `PATCH /api/notifications/settings`
- `GET /api/notifications/browser-push/public-key`
- `POST /api/notifications/browser-subscriptions`
- `DELETE /api/notifications/browser-subscriptions/:subscriptionId`

### Application

- `NotificationApplicationService`
- `NotificationReminderScheduler`
- `NotificationDeliveryProcessor`
- repository ports
- `EmailDeliveryPort`
- `BrowserPushDeliveryPort`
- `NotificationEncryptionPort`
- transaction manager port 사용 후보

### Infrastructure

- Prisma repository adapter
- SMTP email adapter
- Web Push VAPID adapter
- push subscription encryption service
- due notification processor runner

## 5. Transaction 기준

반드시 transaction:

- browser push subscription 등록: hash 중복 확인, encrypted subscription upsert
- schedule/deal mutation과 pending notification 생성/취소를 같은 사용자 행동으로 처리할 때
- due processor가 notification 상태와 delivery attempt를 함께 생성할 때
- delivery attempt retry count/status 갱신

Transaction 밖:

- SMTP provider 호출
- Web Push provider 호출
- push endpoint/key 암호화 자체는 짧은 CPU 작업이지만 provider 호출은 아님

실패 보정:

- notification row 생성 성공 후 email/push 실패는 notification 자체를 rollback하지 않는다.
- provider 실패는 `NotificationDeliveryAttempt`에 safe error만 저장한다.
- push endpoint 404/410 성격의 실패는 subscription을 `REVOKED`로 전환한다.

## 6. Observability 기준

Structured log event key:

- `notification.listed`
- `notification.unreadCountViewed`
- `notification.read`
- `notification.settingsViewed`
- `notification.settingsUpdated`
- `notification.browserPush.publicKeyViewed`
- `notification.browserPush.subscriptionCreated`
- `notification.browserPush.subscriptionRevoked`
- `notification.reminder.scheduled`
- `notification.reminder.canceled`
- `notification.dueProcessed`
- `notification.delivery.succeeded`
- `notification.delivery.failed`
- `notification.delivery.retryScheduled`

Logging 금지:

- email address 원문 대량 dump
- email body 전문
- push endpoint
- p256dh/auth key
- provider raw response
- private memo
- meeting note body
- deal amount
- authorization header/token

## 7. Env / dependency 후보

Backend dependency 후보:

- `web-push`
- `nodemailer`
- `@types/web-push`
- `@types/nodemailer`

Backend env 후보:

- `WEB_PUSH_VAPID_PUBLIC_KEY`
- `WEB_PUSH_VAPID_PRIVATE_KEY`
- `WEB_PUSH_VAPID_SUBJECT`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `NOTIFICATION_PROCESSOR_ENABLED`
- `NOTIFICATION_PROCESSOR_BATCH_SIZE`

실제 env 이름은 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`, `BE/.env.example`와 함께 확정한다.

## 8. 테스트 기준

Unit:

- notification time 계산
- schedule/deal reminder dedupe key 생성
- setting default/upsert
- browser push subscription encryption
- provider failure mapping
- retry 가능/불가능 판단

Integration:

- 알림 목록 ownership
- unread count ownership
- 읽음 처리 idempotent
- 설정 저장과 조회
- subscription 등록/해제
- 일정 생성/수정/삭제에 따른 pending notification 생성/취소
- 딜 expectedEndDate 생성/수정/삭제에 따른 pending notification 생성/취소
- due processor가 delivery attempt를 생성하고 상태를 갱신

검증 명령:

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- notification
pnpm run build
```
