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
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  browserPushEnabled?: boolean;
  reminderEnabled?: boolean;
  reminderLeadTimeMinutes?: number;
  marketingPushEnabled?: boolean;
};
```

`marketingPushEnabled`가 기존 DTO에 없다면 10번에서 무리하게 추가하지 않고 별도 정책/API 작업으로 분리한다. 단, UI copy와 문서에서는 서비스성 알림과 마케팅 알림이 분리되어야 함을 명시한다.

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
type UserNotificationSettingResponse = {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  browserPushEnabled: boolean;
  reminderEnabled: boolean;
  reminderLeadTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
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
  endpoint: string;
  deviceLabel?: string | null;
  userAgent?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
