# 02 Notification Reminder

상태: Confirmed Plan
구현 상태: G01 DB foundation 완료 / G02 Backend API 대기
확정일: 2026-07-22
순서: 02
성격: 구현 착수 가능한 `/goal` 계획
결정 상태: 사용자 결정 2026-07-22 반영

## 0. 이번 확정 결정

02의 1차 범위는 알림 채널과 알림 대상을 명확히 좁힌다.

| 항목 | 결정 |
|---|---|
| 채널 | 앱 안 알림, 브라우저 푸시, 이메일을 모두 만든다. |
| 일정 알림 | `Schedule.startAt - 30분`에 보낸다. |
| 딜 마감 알림 | `Deal.expectedEndDate - 1일`의 사용자 `timeZone` 기준 오전 9시에 보낸다. |
| 다음 행동 알림 | 이번 02에서 제외한다. 딜 1건 데이터 구조가 바뀔 수 있으므로 06에서 다시 설계한다. |
| 회의록 후속 알림 | 이번 02에서 제외한다. 07 MeetingNote AI/provider log와 함께 다시 검토한다. |
| 마케팅 알림 | 제외한다. |
| 복잡한 자동화 builder | 제외한다. |

## 1. 목적

사용자가 영업 일정과 딜 마감일을 놓치지 않도록 앱 안 알림, 브라우저 푸시, 이메일을 제공한다.

02는 retention loop의 첫 기능이다. 다만 모든 자동화 알림을 한 번에 만들지 않고, 현재 DB 모델로 안정적으로 판단할 수 있는 `일정 시작 전`과 `딜 마감일`만 구현한다.

## 2. 현재 상태

- FE에는 `features/notification`, `pages/notifications`, `public/notification-sw.js`가 남아 있다.
- `/app/notifications` route는 현재 `/app`으로 redirect된다.
- Backend G01 DB foundation은 완료됐다. `NotificationModule`, Prisma schema/migration, repository adapter, browser push subscription 암호화 기반이 있다.
- Backend User API, 일정/딜 reminder 예약, due processor, SMTP/Web Push 실제 발송은 아직 구현 전이다.
- BE package에는 SMTP/Web Push 발송 dependency가 없다.

## 3. 구현 결과 목표

- 일정 생성/수정 시 일정 시작 30분 전 알림이 예약된다.
- 딜 생성/수정 시 마감일 1일 전 오전 9시 알림이 예약된다.
- 예약된 알림 시간이 되면 앱 안 알림이 읽을 수 있는 상태가 된다.
- 같은 알림에 대해 browser push와 email 발송 시도가 기록된다.
- 사용자는 `/app/notifications`에서 알림 목록과 unread count를 확인하고 읽음 처리할 수 있다.
- 사용자는 알림 설정에서 email/browser push를 켜고 끌 수 있다.
- browser push subscription endpoint/key는 암호화해 저장한다.
- provider raw error, push endpoint/key, email 원문, private memo, meeting note body, deal amount는 log/response에 노출하지 않는다.

## 4. 문서 구조

```text
02_NOTIFICATION_REMINDER/
  README.md
  COMMON/
    SCOPE.md
    REFERENCES.md
    API-SPEC/
      README.md
      NOTIFICATION_API.md
    GOAL-WORK-ORDER.md
    GOAL-SPECS/
      README.md
      G01_DB_NOTIFICATION_FOUNDATION.md
      G02_BACKEND_NOTIFICATION_API.md
      G03_REMINDER_GENERATION_DELIVERY.md
      G04_USER_WEB_NOTIFICATION_UX.md
      G05_QA_REVIEW_CLOSEOUT.md
    PLANNING-REVIEW.md
    REVIEW-CHECKLIST.md
  BE-TODO/
    API-TODO.md
    DB-SCHEMA.md
  FE-TODO/
    USER-WEB-TODO.md
```

## 5. `/goal` 실행 기준

한 번의 `/goal`에는 `COMMON/GOAL-SPECS`의 goal 문서 하나만 넣는다.

권장 첫 실행 문구:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/COMMON/GOAL-SPECS/G01_DB_NOTIFICATION_FOUNDATION.md 기준으로 G01을 구현해줘.
```

실행 순서:

```text
G01_DB_NOTIFICATION_FOUNDATION
-> G02_BACKEND_NOTIFICATION_API
-> G03_REMINDER_GENERATION_DELIVERY
-> G04_USER_WEB_NOTIFICATION_UX
-> G05_QA_REVIEW_CLOSEOUT
```

## 6. 완료 기준

- `COMMON/API-SPEC/NOTIFICATION_API.md`의 User API가 구현된다.
- 신규 Prisma model과 migration이 구현된다.
- 일정/딜 생성, 수정, 삭제 또는 soft delete에 따라 pending 알림이 생성/갱신/취소된다.
- due notification processor가 앱 안 알림 상태를 열고 email/browser push delivery attempt를 처리한다.
- `/app/notifications` route가 노출되고, app shell unread count와 읽음 처리가 동작한다.
- cross-user 접근 차단, provider failure redaction, browser push permission fallback, email 발송 실패 재시도 기준이 검증된다.
- 구현 완료 후 `COMMON/REVIEW-CHECKLIST.md` 기준으로 검토를 통과한다.
