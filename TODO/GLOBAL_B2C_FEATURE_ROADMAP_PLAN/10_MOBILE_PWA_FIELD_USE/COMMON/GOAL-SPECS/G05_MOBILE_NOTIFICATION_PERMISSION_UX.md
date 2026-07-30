# G05 Mobile Notification Permission UX

상태: Ready

## 1. 목적

모바일 브라우저에서 서비스성 알림과 browser push 권한을 분리해 안내하고, 사용자의 명시적 클릭 이후에만 browser push permission을 요청한다.

## 2. 포함 범위

- 모바일 알림 설정 UX
- `Notification.requestPermission()` explicit click flow
- existing notification API client 연동
- denied/default/unsupported 상태 안내
- service notification과 marketing notification copy 분리
- FE/tests

## 3. 제외 범위

- 회원가입 동의만으로 push permission 요청/구독 등록
- marketing opt-in 신규 DB/API
- native push token
- notification delivery runner 변경

## 4. Request 계약

기준 문서: `COMMON/API-SPEC/MOBILE_NOTIFICATION_PERMISSION_CONTRACT.md`

사용 API:

- `GET /api/notifications/settings`
- `PATCH /api/notifications/settings`
- `GET /api/notifications/browser-push/public-key`
- `POST /api/notifications/browser-subscriptions`
- `DELETE /api/notifications/browser-subscriptions/:subscriptionId`

browser permission request:

```ts
type BrowserPushPermissionRequest = {
  trigger: "USER_CLICK";
};
```

## 5. Response 계약

API response는 기존 notification DTO 유지.

browser permission result:

```ts
type BrowserPushPermissionResult = {
  permissionState: "granted" | "denied" | "default" | "unsupported";
  subscriptionCreated: boolean;
};
```

## 6. Backend Business Logic

1. 기존 notification settings/subscription API owner scope를 유지한다.
2. subscription endpoint/key는 log에 남기지 않는다.
3. browser permission이 실제 granted인지 판단하는 책임은 browser/FE에 있다.
4. server setting은 권한 자동 허용을 의미하지 않는다.
5. marketing opt-in은 10번에서 새로 만들지 않는다.

## 7. User Flow

1. 사용자가 모바일 알림 설정 화면에 진입한다.
2. 현재 in-app/email/browser push 상태를 확인한다.
3. 사용자가 `푸시 알림 켜기`를 누른다.
4. 설명 dialog/bottom sheet를 보여준다.
5. 사용자가 계속 진행하면 browser permission prompt를 호출한다.
6. `granted`이면 push subscription을 등록하고 설정을 갱신한다.
7. `denied`이면 기기/브라우저 설정 안내를 보여준다.
8. `default`이면 다시 시도 가능한 상태로 둔다.

## 8. DB/Prisma 영향

신규 DB migration 없음.

기존 model:

- `UserNotificationSetting`
- `BrowserPushSubscription`

주의:

- `browserPushEnabled` default false 유지
- push endpoint/key logging 금지

## 9. 코드 주석 기준

Frontend:

- permission flow hook/component/API client에 `// 기능 : ...`

Backend:

- notification API 변경 시 controller/service/repository 주석 기준 적용

## 10. 검증

권장 command:

```powershell
pnpm --dir BE test -- notification
pnpm --dir FE/user-web test -- notification
pnpm --dir FE/user-web test:e2e -- notification
```

## 11. Goal 검토 체크리스트

- [ ] 회원가입/약관 동의로 browser push 자동 허용 처리하지 않았다.
- [ ] `Notification.requestPermission()`은 사용자 클릭 이후에만 호출된다.
- [ ] `granted`, `denied`, `default`, unsupported 상태 UI가 있다.
- [ ] service notification과 marketing notification copy가 분리되어 있다.
- [ ] endpoint/key/token이 log/analytics에 없다.
- [ ] existing notification API를 재사용한다.
- [ ] 신규 marketing opt-in DB/API를 만들지 않았다.
- [ ] DB 추가/생성 없이 기존 notification model만 사용했다.
- [ ] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에 한국어 주석을 적용했다.
- [ ] Global B2C 개인 영업자 모바일 현장 업무 target을 벗어나지 않았다.
- [ ] UX/UI 변경 전 `AGENT/UXUI_AGENT` 기준을 확인했다.
- [ ] Software/architecture 변경 전 `AGENT/SOFTWARE_AGENT` 기준을 확인했다.
- [ ] 360px/390px viewport에서 permission UX가 겹치지 않는다.
- [ ] BE/FE/E2E targeted 검증 결과를 기록했다.
- [ ] `COMMON/GOAL-REVIEW-CHECKLIST.md`를 확인했다.

## 12. 실행 결과

구현 후 기록한다.
