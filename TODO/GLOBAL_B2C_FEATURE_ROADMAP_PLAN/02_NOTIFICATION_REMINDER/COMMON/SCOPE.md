# Scope

상태: Confirmed
확정일: 2026-07-22

## 1. 목적

02는 `일정 시작 전`과 `딜 마감일`을 놓치지 않게 하는 알림 기능을 구현한다.

알림은 앱 안 알림을 정본으로 두고, 브라우저 푸시와 이메일은 같은 알림에 대한 외부 delivery attempt로 처리한다.

## 2. 포함 범위

| 항목 | 확정 내용 |
|---|---|
| 앱 안 알림 | `/app/notifications` 목록, unread count, 읽음 처리 |
| 브라우저 푸시 | Web Push VAPID 기반 subscription 등록/해제와 발송 |
| 이메일 | SMTP adapter 기반 알림 이메일 발송 |
| 일정 알림 | `Schedule.startAt - 30분`에 예약 |
| 딜 마감 알림 | `Deal.expectedEndDate - 1일` 사용자 `timeZone` 기준 오전 9시에 예약 |
| 알림 설정 | 일정 알림, 딜 마감 알림, email, browser push toggle 저장 |
| Delivery 기록 | email/browser push 발송 시도, 성공, 실패, retry, provider safe error 저장 |
| Worker/processor | `scheduledAt <= now`인 pending notification을 due 처리 |
| 보안 | user ownership, push subscription 암호화, provider error redaction |
| FE route | `/app/notifications` redirect 해제, app shell unread count |

## 3. 제외 범위

| 항목 | 이유 |
|---|---|
| 다음 행동 알림 | 딜 1건 데이터 구조가 바뀔 수 있어 06 DealActivity/다음 행동 고도화에서 설계한다. |
| 회의록 후속 알림 | 07 MeetingNote AI/provider log와 함께 설계한다. |
| 네이티브 push | iOS/Android 앱 이전에는 제외한다. |
| 마케팅 알림 | 제품 사용 reminder와 분리한다. |
| 복잡한 automation builder | Series A 이후 후보로 둔다. |
| digest email | 1차는 개별 일정/딜 알림 email만 구현한다. digest는 후속이다. |
| Admin provider failure UI | 11 Admin Operation에서 다룬다. 02는 user-facing 기능과 redacted log만 만든다. |

## 4. 알림 시간 정책

### 일정 시작 전

- 기준: `Schedule.startAt` UTC instant
- 예약 시각: `startAt - 30분`
- 사용자가 일정을 만들거나 수정할 때 pending schedule reminder를 생성 또는 갱신한다.
- 계산된 예약 시각이 이미 지났고 일정 시작 전이면 즉시 due 처리 가능한 notification을 만든다.
- 일정 시작 시각이 이미 지났으면 새 reminder를 만들지 않는다.

### 딜 마감일

- 기준: `Deal.expectedEndDate` date-only
- 사용자 timezone: `User.timeZone`
- 예약 시각: `expectedEndDate - 1일`의 local `09:00`
- API/DB 저장: local time을 UTC instant로 변환해 `Notification.scheduledAt`에 저장한다.
- 계산된 예약 시각이 이미 지났고 딜 마감일이 아직 지나지 않았으면 즉시 due 처리 가능한 notification을 만든다.
- 딜 마감일이 사용자 local date 기준 이미 지났으면 새 reminder를 만들지 않는다.

## 5. 상태 정책

- `Notification`은 앱 안 알림의 정본이다.
- `Notification.status = PENDING`이면 아직 사용자에게 보여줄 due 시간이 오지 않은 알림이다.
- `Notification.status = SENT`이면 앱 안 알림 목록에 노출 가능한 알림이다.
- `Notification.readAt`이 null이면 unread다.
- email/browser push 발송 성공과 실패는 `NotificationDeliveryAttempt`에 저장한다.
- email/browser push 실패가 있어도 앱 안 알림은 `SENT`가 될 수 있다.

## 6. 보관 정책

- `Notification`: 생성 후 90일 보관 후보
- `NotificationDeliveryAttempt`: 생성 후 30일 보관 후보
- `BrowserPushSubscription`: revoked 후 90일 보관 후보
- 사용자 계정 삭제 요청 시 Notification, setting, subscription, delivery attempt를 삭제 범위에 포함한다.

## 7. 완료 기준

- 알림 목록과 읽음 처리가 동작한다.
- unread count가 app shell과 알림 화면에 표시된다.
- 일정/딜 변경에 따라 pending 알림이 생성/갱신/취소된다.
- 사용자별 설정이 저장된다.
- email/browser push delivery attempt가 성공/실패/retry 상태를 기록한다.
- 다른 사용자의 알림과 subscription에 접근할 수 없다.
- push endpoint/key와 provider raw error가 response/log에 노출되지 않는다.
