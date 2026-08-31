# Mobile Notification Permission Contract

상태: Confirmed

## 1. 목적

모바일 브라우저에서 영업 사용자에게 알림 설정과 browser push 권한을 명확히 안내하고, 사용자의 명시적 클릭 이후에만 browser permission request를 실행한다.

## 2. 원칙

- 회원가입/개인정보 처리방침/약관 동의로 browser push 권한을 자동 허용한 것으로 간주하지 않는다.
- 서비스성 in-app 알림 설정은 기본 ON이 가능하다.
- browser push는 OS/browser permission이 필요하므로 사용자가 버튼을 누른 뒤 `Notification.requestPermission()`을 호출한다.
- 마케팅/광고성 알림 opt-in은 서비스성 알림과 분리한다.
- 10번은 permission UX 개선만 한다. 02 Notification API를 재사용한다.

## 3. API Requests

### 3.1 Get Settings

`GET /api/notifications/settings`

Request body 없음.

### 3.2 Patch Settings

`PATCH /api/notifications/settings`

```ts
type UpdateNotificationSettingsRequest = {
  scheduleReminderEnabled?: boolean;
  dealDueReminderEnabled?: boolean;
  emailNotificationEnabled?: boolean;
  browserPushEnabled?: boolean;
};
```

`marketingPushEnabled`는 현재 DTO에 없다. 10번에서 무리하게 추가하지 않고 별도 정책/API 작업으로 분리한다. 단, UI copy와 문서에서는 서비스성 알림과 마케팅 알림이 분리되어야 함을 명시한다.

### 3.3 Get Browser Push Public Key

`GET /api/notifications/browser-push/public-key`

Request body 없음.

### 3.4 Create Browser Subscription

`POST /api/notifications/browser-subscriptions`

```ts
type CreateBrowserPushSubscriptionRequest = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  deviceLabel?: string;
};
```

client body에 `userId`를 넣지 않는다.

### 3.5 Delete Browser Subscription

`DELETE /api/notifications/browser-subscriptions/:subscriptionId`

Request body 없음.

## 4. API Responses

### 4.1 Settings Response

```ts
type NotificationSettingsResponse = {
  scheduleReminderEnabled: boolean;
  dealDueReminderEnabled: boolean;
  emailNotificationEnabled: boolean;
  browserPushEnabled: boolean;
  scheduleReminderMinutes: number;
  dealDueReminderDaysBefore: number;
  dealDueReminderLocalTime: string;
};
```

### 4.2 Public Key Response

```ts
type BrowserPushPublicKeyResponse = {
  publicKey: string;
};
```

### 4.3 Subscription Response

```ts
type BrowserPushSubscriptionResponse = {
  id: string;
  status: "ACTIVE" | "REVOKED";
  deviceLabel?: string | null;
  createdAt: string;
  revokedAt?: string | null;
};
```

## 5. Backend Business Logic

1. settings 조회/수정은 인증된 사용자 기준으로 수행한다.
2. browser subscription 생성은 사용자의 browser permission이 이미 `granted`인 상태에서만 FE가 호출한다.
3. endpoint와 key는 민감 값으로 취급하고 log에 기록하지 않는다.
4. subscription 삭제는 소유자 검증 후 soft deactivate 또는 delete를 기존 정책대로 따른다.
5. 10번에서 marketing opt-in DB/API를 새로 만들지 않는다.

## 6. DB/Prisma

기존 model 사용:

- `UserNotificationSetting`
- `BrowserPushSubscription`
- `Notification`
- `NotificationDeliveryAttempt`

신규 migration 없음.

주의:

- `UserNotificationSetting.browserPushEnabled`는 default false다.
- browser permission이 `denied`인 상태에서 server setting만 true로 만들어도 실제 push는 동작하지 않는다. FE는 이 불일치를 사용자에게 설정 안내로 풀어야 한다.

## 7. User Flow

1. 사용자가 모바일 알림 설정 화면에 진입한다.
2. in-app 서비스 알림은 현재 설정 상태를 보여준다.
3. browser push가 꺼져 있으면 `푸시 알림 켜기` 버튼을 보여준다.
4. 사용자가 버튼을 누르면 설명 bottom sheet/dialog를 보여준다.
5. 사용자가 계속 진행하면 `Notification.requestPermission()`을 호출한다.
6. `granted`이면 subscription을 생성하고 settings를 갱신한다.
7. `denied`이면 브라우저/OS 설정에서 권한을 바꾸는 안내를 제공한다.
8. `default`이면 다시 시도할 수 있는 상태로 둔다.

## 8. UX Copy

권장 copy:

- CTA: `푸시 알림 켜기`
- 설명 제목: `중요한 영업 알림을 놓치지 않게 할까요?`
- 설명 본문: `회의 리마인더와 고객 후속 조치 알림을 이 기기에서 받을 수 있어요. 브라우저 권한은 다음 단계에서 직접 허용해야 합니다.`
- 거부 상태: `브라우저에서 알림이 차단되어 있어요. 기기 설정에서 권한을 바꾼 뒤 다시 시도해 주세요.`

금지 copy:

- `가입하면 푸시 알림 수신에 동의한 것으로 간주합니다.`
- `자동으로 푸시 알림을 켰습니다.`

## 9. Observability

Client events:

- `mobile_push_permission_prompt_opened`
- `mobile_push_permission_result`

Payload:

- `permissionState`: `granted | denied | default | unsupported`
- `browserPushEnabled`: boolean

금지:

- endpoint
- subscription keys
- userAgent 전문
- device fingerprint

## 10. Tests

Backend:

- settings get/patch owner scope
- subscription create/delete owner scope
- endpoint/key logging 금지

Frontend:

- explicit click 이후에만 `Notification.requestPermission()` 호출
- `granted`, `denied`, `default`, unsupported 상태별 UI
- server setting과 browser permission 불일치 안내
- service/marketing copy 분리

E2E:

- mobile viewport에서 권한 안내 dialog/bottom sheet
- denied mock에서 설정 안내 노출

## 11. API_SPEC_TEMPLATE_NORMALIZATION G04 보강

판단: 이 문서는 현재 구현된 Notification HTTP API와 모바일 browser permission UX 계약이 함께 들어 있는 보관 문서다. 서버 HTTP API는 알림 설정/브라우저 push subscription API이며, `Notification.requestPermission()`, OS/browser permission state, permission 안내 dialog/bottom sheet는 서버 API 없음 범위로 분리한다. API path, method, request/response 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web mobile browser
- 호환성: 기존 02 Notification API 재사용. `marketingPushEnabled`는 현재 서버 DTO에 없으므로 별도 후속 정책/API 범위로 둔다. breaking change 없음
- 인증: User `AuthGuard`
- 권한: 현재 로그인한 사용자 본인 알림 설정과 본인 `BrowserPushSubscription`만 조회/수정/해지한다.

서버 API 없음:

- `Notification.requestPermission()` 호출, `granted/denied/default/unsupported` 판정, 권한 안내 dialog/bottom sheet는 browser-only UX 계약이다.
- 회원가입/약관 동의를 browser push 권한 동의로 간주하는 서버 API는 없다.
- marketing/광고성 opt-in은 현재 `UpdateNotificationSettingsDto`에 없으므로 10번 서버 API에 추가하지 않는다.

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| 모바일 알림 설정 조회 API | `GetNotificationSettings` | `GET` | `/api/notifications/settings` | `GetNotificationSettingsRequest` | `NotificationSettingsResponse` / FE `UserNotificationSetting` |
| 모바일 알림 설정 수정 API | `UpdateNotificationSettings` | `PATCH` | `/api/notifications/settings` | `UpdateNotificationSettingsDto` / FE `UpdateNotificationSettingsInput` | `NotificationSettingsResponse` / FE `UserNotificationSetting` |
| 브라우저 push 공개키 조회 API | `GetBrowserPushPublicKey` | `GET` | `/api/notifications/browser-push/public-key` | `GetBrowserPushPublicKeyRequest` | `BrowserPushPublicKeyResponse` |
| 브라우저 push 구독 등록 API | `CreateBrowserPushSubscription` | `POST` | `/api/notifications/browser-subscriptions` | `CreateBrowserPushSubscriptionDto` / FE `CreateBrowserPushSubscriptionInput` | `BrowserPushSubscriptionResponse` |
| 브라우저 push 구독 해지 API | `RevokeBrowserPushSubscription` | `DELETE` | `/api/notifications/browser-subscriptions/:subscriptionId` | `RevokeBrowserPushSubscriptionRequest` | `BrowserPushSubscriptionResponse` |

현재 구현 기준 Request 필드:

| API | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| `PATCH /api/notifications/settings` | `scheduleReminderEnabled` | boolean | 선택 | 일정 리마인더 사용 여부 |
| `PATCH /api/notifications/settings` | `dealDueReminderEnabled` | boolean | 선택 | 딜 마감 리마인더 사용 여부 |
| `PATCH /api/notifications/settings` | `emailNotificationEnabled` | boolean | 선택 | 이메일 알림 사용 여부 |
| `PATCH /api/notifications/settings` | `browserPushEnabled` | boolean | 선택 | 브라우저 push 알림 사용 여부 |
| `POST /api/notifications/browser-subscriptions` | `endpoint` | string | 필수 | PushSubscription endpoint. 저장 전 암호화/hash 처리 |
| `POST /api/notifications/browser-subscriptions` | `keys.p256dh` | string | 필수 | PushSubscription key. 저장 전 암호화 |
| `POST /api/notifications/browser-subscriptions` | `keys.auth` | string | 필수 | PushSubscription auth secret. 저장 전 암호화 |
| `POST /api/notifications/browser-subscriptions` | `userAgent` | string | 선택 | 길이 제한 후 저장. log 원문 금지 |
| `POST /api/notifications/browser-subscriptions` | `deviceLabel` | string | 선택 | 사용자 표시용 label |

Error FE 처리/log level:

| 상황 | HTTP | FE 처리 | log level |
|---|---:|---|---|
| 인증 없음 | 401 | 로그인/토큰 갱신 흐름 | warn |
| settings/subscription validation 실패 | 400 | 설정 변경 실패 안내 | warn |
| VAPID 설정 없음 | 503 | push 사용 불가 안내 | error |
| endpoint가 다른 사용자와 충돌 | 409 | 기존 구독 초기화/재시도 안내 | warn |
| subscription 없음 또는 타 사용자 소유 | 404 | settings 재조회 | warn |
| subscription 암호화 실패 | 500 | 잠시 후 재시도 안내 | error |

Transaction:

- `GET` 계열: 필요 여부 없음. 조회 전용이다.
- `PATCH /api/notifications/settings`: `UserNotificationSetting` upsert 단일 write다.
- `POST /api/notifications/browser-subscriptions`: `BrowserPushSubscription` upsert와 `UserNotificationSetting.browserPushEnabled=true` 갱신을 transaction으로 묶는다.
- `DELETE /api/notifications/browser-subscriptions/:subscriptionId`: subscription revoke와 active subscription 수에 따른 `browserPushEnabled=false` 갱신을 transaction으로 묶는다.
- browser push provider 발송은 이 설정/구독 API transaction 밖에서 수행한다.

Observability:

- log event key: `notification.settingsUpdated`, `notification.browserPush.subscriptionCreated`, `notification.browserPush.subscriptionRevoked`
- analytics event: `mobile_push_permission_prompt_opened`, `mobile_push_permission_result`
- audit log: 없음
- request id: 기존 middleware 기준 사용
- redaction: endpoint, p256dh, auth, userAgent 전문, device fingerprint logging 금지
- provider error context: VAPID 설정 누락, subscription encryption failure는 safe error code 수준만 허용

FE/BE 처리 기준:

- FE는 사용자의 명시적 클릭 이후 permission 안내 dialog를 열고, 계속 진행 시에만 `Notification.requestPermission()`을 호출한다.
- FE는 permission `granted` 이후 public key 조회, browser subscription 생성, settings 갱신 흐름을 수행한다.
- FE는 `denied/default/unsupported` 상태를 server setting과 분리해 안내하고, marketing opt-in copy를 서비스성 알림과 섞지 않는다.
- BE는 browser permission state를 신뢰하지 않고 subscription request의 endpoint/key를 validation, 암호화, ownership conflict 검사 후 저장한다.
