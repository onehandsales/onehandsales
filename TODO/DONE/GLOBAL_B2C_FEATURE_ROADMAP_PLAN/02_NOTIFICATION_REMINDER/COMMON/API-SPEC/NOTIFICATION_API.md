# Notification Reminder API

계약 상태: confirmed
구현 상태: User API G02 Done / internal scheduling-delivery G03 Done / User Web G04 Done / QA G05 Done
소비자:
- User Web

호환성:
- 신규 API다.
- 기존 FE notification feature의 타입과 client는 이 계약에 맞춰 수정한다.
- Backend migration이 선행되어야 한다.

## 1. 공통 계약

### 인증과 권한

- 모든 API는 `AuthGuard`가 필요하다.
- 모든 조회와 변경은 `userId = currentUser.id` 기준 ownership을 적용한다.
- 다른 사용자의 `notificationId` 또는 `browserSubscriptionId`에 접근하면 존재 여부를 노출하지 않고 not found로 처리한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.

### 알림 생성 범위

02에서 생성하는 notification type은 두 개다.

| 값 | 의미 |
|---|---|
| `SCHEDULE_START_REMINDER` | 일정 시작 30분 전 알림 |
| `DEAL_DUE_REMINDER` | 딜 마감일 1일 전 오전 9시 알림 |

### 상태 enum

`NotificationStatus`

| 값 | 의미 |
|---|---|
| `PENDING` | 예약됐지만 아직 due 시간이 오지 않았다. |
| `SENT` | due 처리되어 앱 안 알림 목록에 표시 가능하다. |
| `FAILED` | 내부 처리 실패로 앱 안 알림 처리에 실패했다. |
| `CANCELED` | 원본 일정/딜 변경 또는 삭제로 취소됐다. |

`NotificationDeliveryChannel`

| 값 | 의미 |
|---|---|
| `EMAIL` | 이메일 발송 |
| `BROWSER_PUSH` | 브라우저 push 발송 |

`NotificationDeliveryStatus`

| 값 | 의미 |
|---|---|
| `PENDING` | 발송 대기 또는 재시도 대기 |
| `SENT` | provider 발송 성공 |
| `FAILED` | provider 발송 실패 |
| `CANCELED` | 사용자 설정 또는 subscription 상태로 발송하지 않음 |

### 공통 response object

`NotificationResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | no | Notification ID |
| `type` | `SCHEDULE_START_REMINDER \| DEAL_DUE_REMINDER` | no | 알림 타입 |
| `status` | `PENDING \| SENT \| FAILED \| CANCELED` | no | 앱 안 알림 상태 |
| `sourceType` | `SCHEDULE \| DEAL` | no | 원본 데이터 타입 |
| `sourceId` | string | no | 원본 데이터 ID |
| `targetPath` | string | no | User Web 이동 경로 |
| `title` | string | no | 화면 표시 제목 |
| `body` | string | yes | 화면 표시 짧은 내용 |
| `targetLabel` | string | yes | 화면 표시용 대상명 |
| `scheduledAt` | string | no | UTC ISO string |
| `sentAt` | string | yes | UTC ISO string |
| `readAt` | string | yes | UTC ISO string |
| `createdAt` | string | no | UTC ISO string |
| `updatedAt` | string | no | UTC ISO string |

`NotificationSettingsResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `scheduleReminderEnabled` | boolean | no | 일정 알림 사용 여부 |
| `dealDueReminderEnabled` | boolean | no | 딜 마감 알림 사용 여부 |
| `emailNotificationEnabled` | boolean | no | 이메일 알림 사용 여부 |
| `browserPushEnabled` | boolean | no | 브라우저 push 알림 사용 여부 |
| `scheduleReminderMinutes` | number | no | 기본 30 |
| `dealDueReminderDaysBefore` | number | no | 기본 1 |
| `dealDueReminderLocalTime` | string | no | 기본 `09:00` |

`BrowserPushSubscriptionResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | no | subscription ID |
| `status` | `ACTIVE \| REVOKED` | no | subscription 상태 |
| `deviceLabel` | string | yes | 사용자 표시용 기기명 |
| `createdAt` | string | no | UTC ISO string |
| `revokedAt` | string | yes | UTC ISO string |

### 공통 scheduling rule

- 일정 알림 예약 시각: `Schedule.startAt - 30분`
- 딜 마감 알림 예약 시각: `Deal.expectedEndDate - 1일` 사용자 timezone local `09:00`
- `Notification.scheduledAt`은 UTC instant로 저장하고 응답은 ISO 8601 UTC string이다.
- 딜 마감일은 date-only이므로 FE가 임의로 timezone 변환해 request하지 않는다.

### 공통 transaction/observability

- 일정/딜 변경과 pending notification 생성/취소는 가능하면 같은 transaction으로 묶는다.
- email/browser push provider 호출은 DB transaction 밖에서 실행한다.
- provider 호출 결과는 `NotificationDeliveryAttempt`에 redacted summary로 저장한다.
- application log event key는 `notification.*` dot notation을 사용한다.
- email body 전문, push endpoint/key, provider raw response, private memo, meeting note body, deal amount는 structured log에 남기지 않는다.

## 2. 알림 목록 API

- API 이름: 알림 목록 API
- API 식별자: `ListNotifications`
- 계약 상태: confirmed
- 소비자: User Web
- Method: GET
- Path: `/api/notifications`
- 인증: AuthGuard
- 권한: current user owned notifications only

### Request

Request 이름: `ListNotificationsRequest`

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `page` | number | 선택 | 기본 1 |
| `pageSize` | number | 선택 | 기본 15, 최대 50 |
| `read` | `ALL \| READ \| UNREAD` | 선택 | 기본 `ALL` |
| `includeUpcoming` | boolean | 선택 | 기본 false. false면 `scheduledAt <= now`인 알림만 반환 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. query를 validation한다.
3. `userId = currentUser.id` 조건을 적용한다.
4. 기본적으로 `status = SENT`이고 `scheduledAt <= now`인 알림을 조회한다.
5. `read` 필터에 따라 `readAt` 조건을 적용한다.
6. `scheduledAt DESC`, `createdAt DESC`로 정렬한다.
7. unread count는 같은 user의 due/SENT/readAt null 기준으로 계산한다.
8. `NotificationListResponse`로 반환한다.

### Response

Response 이름: `NotificationListResponse`
Status: 200

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | `NotificationResponse[]` | 알림 목록 |
| `unreadCount` | number | 읽지 않은 due 알림 수 |
| `page` | number | 현재 page |
| `pageSize` | number | page size |
| `totalCount` | number | 필터 조건 전체 수 |

### 연결된 DB 스키마

- 조회: `Notification`
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 단순 조회다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `notification.listed`
- audit log: 없음
- request id: 사용
- redaction: 알림 body 대량 dump 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면으로 이동 | warn |
| query validation 실패 | `ValidationError` | 400 | 필터 초기화 | warn |

### FE/BE 처리 기준

- FE: `/app/notifications` 진입 시 호출한다.
- BE: unread count는 user ownership을 반드시 적용한다.
- 검증: 다른 사용자의 알림이 목록에 나오지 않아야 한다.

## 3. unread count API

- API 이름: 알림 unread count API
- API 식별자: `GetNotificationUnreadCount`
- 계약 상태: confirmed
- 소비자: User Web
- Method: GET
- Path: `/api/notifications/unread-count`
- 인증: AuthGuard
- 권한: current user only

### Request

Request 이름: `GetNotificationUnreadCountRequest`

Query 없음.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `userId = currentUser.id`, `status = SENT`, `readAt IS NULL`, `scheduledAt <= now` 조건으로 count한다.
3. `NotificationUnreadCountResponse`로 반환한다.

### Response

Response 이름: `NotificationUnreadCountResponse`
Status: 200

| 필드 | 타입 | 설명 |
|---|---|---|
| `unreadCount` | number | 읽지 않은 due 알림 수 |

### 연결된 DB 스키마

- 조회: `Notification`
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 단순 count 조회다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `notification.unreadCountViewed`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면으로 이동 | warn |

### FE/BE 처리 기준

- FE: app shell badge에서 호출한다.
- BE: count query는 user ownership과 due 조건을 적용한다.
- 검증: 읽음 처리 후 count가 감소해야 한다.

## 4. 알림 읽음 API

- API 이름: 알림 읽음 처리 API
- API 식별자: `MarkNotificationRead`
- 계약 상태: confirmed
- 소비자: User Web
- Method: PATCH
- Path: `/api/notifications/:notificationId/read`
- 인증: AuthGuard
- 권한: current user owned notification only

### Request

Request 이름: `MarkNotificationReadRequest`

Path:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `notificationId` | string | 필수 | Notification ID |

Body 없음.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `notificationId`, `userId`로 알림을 조회한다.
3. 알림이 없으면 `NotificationNotFound`를 반환한다.
4. 이미 `readAt`이 있으면 idempotent success로 기존 알림을 반환한다.
5. `readAt = now`로 갱신한다.
6. `NotificationResponse`로 반환한다.

### Response

Response 이름: `NotificationResponse`
Status: 200
Body: `NotificationResponse`

### 연결된 DB 스키마

- 조회: `Notification`
- 수정: `Notification.readAt`
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 단일 row update다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `notification.read`
- audit log: 없음
- request id: 사용
- redaction: 알림 body logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 알림 없음 또는 소유권 없음 | `NotificationNotFound` | 404 | 목록 재조회 | warn |
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면 이동 | warn |

### FE/BE 처리 기준

- FE: 성공 후 list와 unread count query를 invalidation한다.
- BE: 이미 읽은 알림은 200으로 처리한다.
- 검증: 다른 사용자 알림 read 시도는 404다.

## 5. 알림 설정 조회 API

- API 이름: 알림 설정 조회 API
- API 식별자: `GetNotificationSettings`
- 계약 상태: confirmed
- 소비자: User Web
- Method: GET
- Path: `/api/notifications/settings`
- 인증: AuthGuard
- 권한: current user only

### Request

Request 이름: `GetNotificationSettingsRequest`

Query 없음.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `UserNotificationSetting`을 조회한다.
3. 없으면 기본값 response를 반환한다. 필요하면 upsert는 수정 API에서만 한다.
4. `NotificationSettingsResponse`로 반환한다.

### Response

Response 이름: `NotificationSettingsResponse`
Status: 200
Body: `NotificationSettingsResponse`

### 연결된 DB 스키마

- 조회: `UserNotificationSetting`
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 단순 조회다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `notification.settingsViewed`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면 이동 | warn |

### FE/BE 처리 기준

- FE: 알림 화면과 설정 화면에서 호출한다.
- BE: 기본값은 `scheduleReminderEnabled=true`, `dealDueReminderEnabled=true`, `emailNotificationEnabled=true`, `browserPushEnabled=false`, `scheduleReminderMinutes=30`, `dealDueReminderDaysBefore=1`, `dealDueReminderLocalTime=09:00`이다.
- 검증: setting row가 없어도 기본 response를 반환해야 한다.

## 6. 알림 설정 수정 API

- API 이름: 알림 설정 수정 API
- API 식별자: `UpdateNotificationSettings`
- 계약 상태: confirmed
- 소비자: User Web
- Method: PATCH
- Path: `/api/notifications/settings`
- 인증: AuthGuard
- 권한: current user only

### Request

Request 이름: `UpdateNotificationSettingsRequest`

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `scheduleReminderEnabled` | boolean | 선택 | 일정 알림 사용 여부 |
| `dealDueReminderEnabled` | boolean | 선택 | 딜 마감 알림 사용 여부 |
| `emailNotificationEnabled` | boolean | 선택 | 이메일 알림 사용 여부 |
| `browserPushEnabled` | boolean | 선택 | 브라우저 push 알림 사용 여부 |

`scheduleReminderMinutes`, `dealDueReminderDaysBefore`, `dealDueReminderLocalTime`은 02에서 사용자가 수정하지 않고 고정 기본값으로 둔다. 내부 저장 field는 확장성을 위해 둔다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. body를 validation한다.
3. current user의 `UserNotificationSetting`을 upsert한다.
4. `browserPushEnabled=false`로 바뀌면 active subscription을 유지하되 delivery processor가 push attempt를 만들지 않는다.
5. `NotificationSettingsResponse`로 반환한다.

### Response

Response 이름: `NotificationSettingsResponse`
Status: 200
Body: `NotificationSettingsResponse`

### 연결된 DB 스키마

- 생성/수정: `UserNotificationSetting`
- transaction: 필요 후보

### Transaction

- 필요 여부: 필요
- 이유: setting upsert와 후속 상태 조정이 함께 일어날 수 있다.
- transaction model: `UserNotificationSetting`
- rollback 범위: setting 변경 전체
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `notification.settingsUpdated`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| validation 실패 | `ValidationError` | 400 | field error 표시 | warn |
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면 이동 | warn |

### FE/BE 처리 기준

- FE: 성공 후 settings query를 invalidation한다.
- BE: 빈 body는 validation error로 처리한다.
- 검증: 사용자 A의 설정 수정이 사용자 B에게 영향을 주면 안 된다.

## 7. Browser Push public key API

- API 이름: Browser Push public key API
- API 식별자: `GetBrowserPushPublicKey`
- 계약 상태: confirmed
- 소비자: User Web
- Method: GET
- Path: `/api/notifications/browser-push/public-key`
- 인증: AuthGuard
- 권한: current user

### Request

Request 이름: `GetBrowserPushPublicKeyRequest`

Query 없음.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. env의 VAPID public key가 설정되어 있는지 확인한다.
3. `BrowserPushPublicKeyResponse`로 반환한다.

### Response

Response 이름: `BrowserPushPublicKeyResponse`
Status: 200

| 필드 | 타입 | 설명 |
|---|---|---|
| `publicKey` | string | PushManager subscribe에 사용할 VAPID public key |

### 연결된 DB 스키마

- 없음

### Transaction

- 필요 여부: 없음
- 이유: DB 변경이 없다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `notification.browserPush.publicKeyViewed`
- audit log: 없음
- request id: 사용
- redaction: private key logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| VAPID 설정 없음 | `BrowserPushNotConfigured` | 503 | push 사용 불가 안내 | error |
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면 이동 | warn |

### FE/BE 처리 기준

- FE: browser push toggle을 켤 때 호출한다.
- BE: private key를 절대 response/log에 넣지 않는다.
- 검증: env 누락 시 안전한 503을 반환한다.

## 8. Browser Push 구독 등록 API

- API 이름: Browser Push 구독 등록 API
- API 식별자: `CreateBrowserPushSubscription`
- 계약 상태: confirmed
- 소비자: User Web
- Method: POST
- Path: `/api/notifications/browser-subscriptions`
- 인증: AuthGuard
- 권한: current user

### Request

Request 이름: `CreateBrowserPushSubscriptionRequest`

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `endpoint` | string | 필수 | PushSubscription endpoint |
| `keys.p256dh` | string | 필수 | PushSubscription p256dh key |
| `keys.auth` | string | 필수 | PushSubscription auth key |
| `userAgent` | string | 선택 | browser user agent |
| `deviceLabel` | string | 선택 | 사용자 표시용 기기명 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. body를 validation한다.
3. endpoint hash를 계산한다.
4. endpoint, p256dh, auth를 encryption port로 암호화한다.
5. 같은 endpoint hash가 있으면 current user 소유인지 확인한다.
6. 같은 user의 revoked subscription이면 active로 복구하고 key를 갱신한다.
7. 다른 user가 같은 endpoint hash를 소유하면 conflict로 처리한다.
8. `UserNotificationSetting.browserPushEnabled=true`로 upsert한다.
9. `BrowserPushSubscriptionResponse`로 반환한다.

### Response

Response 이름: `BrowserPushSubscriptionResponse`
Status: 201 또는 200
Body: `BrowserPushSubscriptionResponse`

### 연결된 DB 스키마

- 생성/수정: `BrowserPushSubscription`, `UserNotificationSetting`
- transaction: 필요

### Transaction

- 필요 여부: 필요
- 이유: subscription upsert와 setting update가 하나의 사용자 행동이다.
- transaction model: `BrowserPushSubscription`, `UserNotificationSetting`
- rollback 범위: subscription/setting 변경 전체
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `notification.browserPush.subscriptionCreated`
- audit log: 없음
- request id: 사용
- redaction: endpoint, p256dh, auth logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| validation 실패 | `ValidationError` | 400 | push 설정 실패 안내 | warn |
| 다른 user endpoint 충돌 | `PushSubscriptionConflict` | 409 | 브라우저 재구독 안내 | warn |
| encryption 실패 | `PushSubscriptionEncryptFailed` | 500 | 잠시 후 재시도 안내 | error |

### FE/BE 처리 기준

- FE: permission granted와 PushManager subscribe 성공 후 호출한다.
- BE: endpoint/key 원문은 저장하지 않는다.
- 검증: DB row에는 ciphertext와 hash만 있어야 한다.

## 9. Browser Push 구독 해제 API

- API 이름: Browser Push 구독 해제 API
- API 식별자: `RevokeBrowserPushSubscription`
- 계약 상태: confirmed
- 소비자: User Web
- Method: DELETE
- Path: `/api/notifications/browser-subscriptions/:subscriptionId`
- 인증: AuthGuard
- 권한: current user owned subscription only

### Request

Request 이름: `RevokeBrowserPushSubscriptionRequest`

Path:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `subscriptionId` | string | 필수 | BrowserPushSubscription ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `subscriptionId`, `userId`로 subscription을 조회한다.
3. 없으면 `PushSubscriptionNotFound`를 반환한다.
4. 이미 revoked면 idempotent success로 반환한다.
5. `status=REVOKED`, `revokedAt=now`로 갱신한다.
6. active subscription이 더 없으면 `UserNotificationSetting.browserPushEnabled=false`로 갱신한다.
7. `BrowserPushSubscriptionResponse`로 반환한다.

### Response

Response 이름: `BrowserPushSubscriptionResponse`
Status: 200
Body: `BrowserPushSubscriptionResponse`

### 연결된 DB 스키마

- 조회/수정: `BrowserPushSubscription`, `UserNotificationSetting`
- transaction: 필요

### Transaction

- 필요 여부: 필요
- 이유: subscription revoke와 setting update가 함께 일어날 수 있다.
- transaction model: `BrowserPushSubscription`, `UserNotificationSetting`
- rollback 범위: subscription/setting 변경 전체
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `notification.browserPush.subscriptionRevoked`
- audit log: 없음
- request id: 사용
- redaction: endpoint/key logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| subscription 없음 또는 소유권 없음 | `PushSubscriptionNotFound` | 404 | settings 재조회 | warn |
| 인증 없음 | `Unauthorized` | 401 | 로그인 화면 이동 | warn |

### FE/BE 처리 기준

- FE: 브라우저 PushSubscription unsubscribe 성공 여부와 무관하게 서버 revoke를 시도한다.
- BE: hard delete하지 않는다.
- 검증: 다른 사용자 subscription revoke 시도는 404다.

## 10. 내부 due processor 계약

HTTP API는 아니다. Backend worker 또는 scheduler runner에서 호출한다.

### ProcessDueNotificationsUseCase

목적:

- `Notification.status = PENDING`이고 `scheduledAt <= now`인 알림을 batch로 처리한다.
- 앱 안 알림을 `SENT`로 전환한다.
- 사용자 설정에 따라 email/browser push delivery attempt를 생성하고 provider 발송을 시도한다.

비즈니스 로직:

1. batch size 기준으로 due notification을 조회한다.
2. 각 notification의 user setting을 조회한다.
3. notification을 `SENT`, `sentAt=now`로 갱신한다.
4. email enabled이고 user email이 있으면 EMAIL delivery attempt를 만든다.
5. browser push enabled이고 active subscription이 있으면 BROWSER_PUSH delivery attempt를 만든다.
6. provider 호출은 transaction 밖에서 실행한다.
7. provider 성공 시 delivery attempt를 `SENT`로 갱신한다.
8. retryable 실패면 `FAILED`, `retryable=true`, `nextRetryAt`을 저장한다.
9. non-retryable push subscription 실패면 subscription을 `REVOKED`로 전환한다.

Retry 기본값:

- retryable failure 최대 3회
- retry 간격 후보: 5분, 15분, 60분
- provider raw response 저장 금지

Observability:

- `notification.dueProcessed`
- `notification.delivery.succeeded`
- `notification.delivery.failed`
- `notification.delivery.retryScheduled`

## 11. 내부 reminder scheduling 계약

HTTP API는 아니다. Schedule/Deal application service에서 호출한다.

### 일정 reminder

- source: `Schedule`
- type: `SCHEDULE_START_REMINDER`
- scheduledAt: `schedule.startAt - 30분`
- targetPath: `/app/schedules/:scheduleId`
- pending reminder dedupe key가 동일하면 중복 생성하지 않는다.
- startAt 변경 시 기존 pending reminder는 `CANCELED` 처리한다.
- schedule hard delete 시 기존 pending reminder는 `CANCELED` 처리한다.

### 딜 마감 reminder

- source: `Deal`
- type: `DEAL_DUE_REMINDER`
- scheduledAt: user timezone 기준 `expectedEndDate - 1일 09:00`
- targetPath: `/app/deals/:dealId`
- expectedEndDate 변경 시 기존 pending reminder는 `CANCELED` 처리한다.
- deal soft delete 시 기존 pending reminder는 `CANCELED` 처리한다.
- 다음 행동 로그는 02에서 사용하지 않는다.
