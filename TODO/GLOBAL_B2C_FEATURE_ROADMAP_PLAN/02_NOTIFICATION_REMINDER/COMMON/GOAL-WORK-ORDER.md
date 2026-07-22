# Goal Work Order

상태: Confirmed
확정일: 2026-07-22

## 1. 원칙

02는 DB 기반을 먼저 만들고, Backend API, reminder 생성/delivery, User Web, QA 순서로 간다.

각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

G01은 신규 Prisma migration을 만들기 때문에 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`의 `NBA-014` DB/Prisma 운영 gate를 선행 조건으로 둔다.

## 2. 실행 순서

```text
G01_DB_NOTIFICATION_FOUNDATION
-> G02_BACKEND_NOTIFICATION_API
-> G03_REMINDER_GENERATION_DELIVERY
-> G04_USER_WEB_NOTIFICATION_UX
-> G05_QA_REVIEW_CLOSEOUT
```

## 3. G01 DB Notification Foundation

상세 명세: `COMMON/GOAL-SPECS/G01_DB_NOTIFICATION_FOUNDATION.md`

목표:

- Notification 관련 Prisma enum/model/relation/migration을 추가한다.
- BrowserPushSubscription endpoint/key 암호화 저장 기반을 만든다.
- DB target, migration status, generate/seed 영향을 먼저 확인하고 공유/운영성 DB에는 무단 migrate를 실행하지 않는다.

## 4. G02 Backend Notification API

상세 명세: `COMMON/GOAL-SPECS/G02_BACKEND_NOTIFICATION_API.md`

목표:

- `COMMON/API-SPEC/NOTIFICATION_API.md`의 User API를 구현한다.
- 목록, unread count, 읽음 처리, 설정, browser push subscription API를 제공한다.

## 5. G03 Reminder Generation Delivery

상세 명세: `COMMON/GOAL-SPECS/G03_REMINDER_GENERATION_DELIVERY.md`

목표:

- 일정/딜 변경 시 reminder notification을 예약/취소한다.
- due processor가 앱 안 알림을 열고 email/browser push delivery attempt를 처리한다.

## 6. G04 User Web Notification UX

상세 명세: `COMMON/GOAL-SPECS/G04_USER_WEB_NOTIFICATION_UX.md`

목표:

- `/app/notifications` route를 열고 기존 notification feature를 API 계약에 맞게 고친다.
- app shell unread count, 목록, 읽음 처리, 설정, browser push permission UX를 구현한다.

## 7. G05 QA Review Closeout

상세 명세: `COMMON/GOAL-SPECS/G05_QA_REVIEW_CLOSEOUT.md`

목표:

- Backend/User Web 검증, provider failure redaction, cross-user 차단, 모바일/브라우저 fallback을 점검한다.
- `COMMON/REVIEW-CHECKLIST.md` 기준으로 구현 검토를 닫는다.

## 8. 권장 첫 실행 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/COMMON/GOAL-SPECS/G01_DB_NOTIFICATION_FOUNDATION.md 기준으로 G01을 구현해줘.
```
