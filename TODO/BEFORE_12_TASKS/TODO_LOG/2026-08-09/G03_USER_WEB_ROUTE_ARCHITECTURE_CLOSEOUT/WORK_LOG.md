# G03 User Web Route Architecture Closeout Work Log

상태: Done
작성일: 2026-08-09 KST
기준 goal: `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md`
연결 PRE12 ID: `PRE12-F32`

## 1. 결론

G03는 User Web route와 architecture 문서 정합성 closeout으로 완료했다.

이번 작업은 제품 기능 구현이 아니라 문서 상태 보정이다. `FE/user-web/src/app/router/router.tsx`, User Web feature API client, Backend schedule/notification controller, FE/AGENT architecture 문서를 대조했다.

확인 결과 실제 코드에서는 `/app/schedules/week`와 `/app/notifications`가 활성 route였고, `/app/export`만 `/app`으로 redirect되는 상태였다. 일부 FE/AGENT 문서에는 `/app/schedules/week`와 `/app/notifications`가 여전히 redirect 또는 hidden/future 상태로 남아 있어 실제 코드 기준과 맞게 보정했다.

이번 G03에서 추가하거나 수정한 문장은 한글 문장 기준을 따랐다. Route path, API path, framework 용어, provider 이름처럼 식별이 필요한 영어는 그대로 두되, 문장 전체는 한글 설명으로 구성했다.

## 2. 착수 체크리스트

- [x] `FE/user-web/src/app/router/router.tsx` 확인
- [x] `FE/user-web/ARCHITECTURE.md`와 `FE/ARCHITECTURE.md` 확인
- [x] `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md` 확인
- [x] `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md` 확인
- [x] User Web은 `/api/*`만 호출해야 한다는 기준 확인
- [x] 새 route/API를 만들지 않는 기준 확인
- [x] 코드 변경 발생 시 한글 주석 규칙과 typecheck/lint gate 확인

## 3. 실제 route 기준

`FE/user-web/src/app/router/router.tsx` 기준 실제 route 상태는 아래와 같다.

| route | 실제 상태 |
| --- | --- |
| `/app/schedules/week` | `ScheduleWeekPage` 활성 |
| `/app/notifications` | `NotificationsPage` 활성 |
| `/app/export` | `/app` redirect |
| `/contacts/scan` | `/app/business-cards` redirect |
| `/app/contacts/scan` | `/app/business-cards` redirect |
| `/import/review/:importJobId` | `/app/import/review/:importJobId` legacy redirect |
| `/app/import/review/:importJobId` | `ImportReviewPage` 활성 |

## 4. 실제 코드 확인 결과

Frontend:

- `FE/user-web/src/app/router/router.tsx`
  - `/app/schedules/week`가 `ScheduleWeekPage`로 연결되어 있다.
  - `/app/notifications`가 `NotificationsPage`로 연결되어 있다.
  - `/app/export`는 `Navigate replace to="/app"`으로 redirect된다.
  - `/contacts/scan`과 `/app/contacts/scan`은 `/app/business-cards`로 redirect된다.
  - `/import/review/:importJobId`와 `/app/import/review/:importJobId`가 import review 흐름으로 연결되어 있다.
- `FE/user-web/src/features/schedule`
  - `ScheduleWeekReportScreen`이 존재하고, 일정 화면의 `주간 보고서` link가 `/app/schedules/week`로 이동한다.
  - `GET /api/schedules/week`와 `GET /api/schedules/week/export/xlsx` client가 있다.
- `FE/user-web/src/features/notification`
  - 알림 목록, 읽음 처리, 설정, browser push public key/subscription API client가 있다.
  - `NotificationBellButton`이 `/app/notifications`로 이동한다.
- `FE/user-web/src/features/import-export`
  - generic export client와 `ExportScreen` 파일은 남아 있다.
  - 그러나 `/app/export` route는 `/app` redirect이므로 현재 활성 제품 route가 아니다.
- `FE/user-web/src/lib/api-client.ts`
  - `apiClient`와 `apiBlobClient`는 `/admin/api/*` path를 차단한다.

Backend:

- `BE/src/modules/schedule/presentation/http/schedule.controller.ts`
  - `GET /api/schedules/week`와 `GET /api/schedules/week/export/xlsx`가 존재한다.
- `BE/src/modules/notification/presentation/http/notification.controller.ts`
  - `GET /api/notifications`, `PATCH /api/notifications/:notificationId/read`, `GET/PATCH /api/notifications/settings`, browser push public key/subscription API가 존재한다.
- `BE/prisma/schema.prisma`
  - `UserNotificationSetting`, `Notification`, `NotificationDeliveryAttempt`, `BrowserPushSubscription` model이 존재한다.

## 5. 변경 파일

- `FE/ARCHITECTURE.md`
  - `/app/schedules/week`와 `/app/notifications`를 활성 route로 갱신
  - `/app/export`는 redirect/future 경계로 유지
  - Notification API 존재 상태와 generic Export 비활성 상태를 한글 문장으로 정리
- `FE/user-web/ARCHITECTURE.md`
  - 보호 앱 활성 route 목록을 실제 router와 맞춤
  - `/contacts/scan`, `/app/contacts/scan`, `/app/export` redirect 경계를 분리
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
  - `/app/schedules/week`와 `/app/notifications` 활성 상태를 반영
  - Notification route/API 존재 상태를 반영
  - `/app/export`와 `/api/exports` 기반 generic Export는 비활성 후속 범위로 유지
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
  - 화면 목록과 현재 코드 route 상태에서 stale redirect 설명을 보정
  - 활성화된 주간 보고서와 알림 화면을 실제 진입점 기준으로 기록
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
  - Notification route/API 활성 상태와 정책 확장 후속 범위를 분리
  - 현재 노출 기준을 한글 문장으로 보정
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
  - `/app/schedules/week`와 `/app/notifications`를 known limitation redirect로 보던 stale 항목을 제거
  - `/app/export` redirect만 후속/비활성 범위로 유지
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md`
  - 상태를 `Done`으로 갱신
  - 착수 체크리스트와 완료 기준을 체크
  - 최근 실행 로그 경로 추가
- `TODO/BEFORE_12_TASKS/README.md`
  - 상태를 `G01-G03 Done / G04-G06 Ready For Goal`로 갱신
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
  - G03 상태를 `Done`으로 갱신
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/README.md`
  - G03 상태를 `Done`으로 갱신
- `TODO/BEFORE_12_TASKS/FE-TODO/USER-WEB-TODO.md`
  - G03에 해당하는 User Web route 정합성 완료 기준을 체크

## 6. 금지 범위 확인

- 새 User Web route를 만들지 않았다.
- 기존 User Web route를 rollback하지 않았다.
- `/app/export`를 활성화하지 않았다.
- `/api/exports`를 새로 연결하지 않았다.
- `ExportJob` API/DB/화면을 구현하지 않았다.
- Notification source/TTL/cleanup 정책을 새로 정의하지 않았다.
- 새 Backend API를 만들지 않았다.
- 새 Prisma schema/migration/seed를 만들지 않았다.
- User Web에서 `/admin/api/*` 호출 flow를 만들지 않았다.
- 제품 business logic 또는 user flow를 변경하지 않았다.

정적 확인:

- `rg -n "/admin/api" FE/user-web/src`
  - 실제 호출은 없고, `FE/user-web/src/lib/api-client.ts`의 차단 guard만 존재한다.
- `rg -n "/api/exports" FE/user-web/src`
  - `FE/user-web/src/features/import-export` 안에 generic export client 문자열은 남아 있다.
  - `/app/export` route가 `/app` redirect이므로 활성 제품 route/API로 열리지 않는다.
- `rg -n "model UserNotificationSetting|model Notification|model NotificationDeliveryAttempt|model BrowserPushSubscription" BE/prisma/schema.prisma`
  - 기존 Notification model들이 존재한다.

## 7. 검증 결과

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

결과:

- FE user-web typecheck 통과
- FE user-web lint 통과

```bash
git diff --check
```

결과:

- 통과

추가 정적 확인:

- `/app/notifications`를 redirect 또는 Backend 미구현으로 설명하는 stale 문구가 남아 있지 않다.
- `/app/schedules/week`를 redirect 또는 미구현으로 설명하는 stale 문구가 남아 있지 않다.
- `/app/export`는 redirect/future 경계로 남아 있고 활성 route로 문서화되지 않았다.
- 이번 G03에서 추가하거나 수정한 문장은 한글 문장으로 작성되어 있다. Route path, API path, framework 용어, provider 이름은 식별자라서 그대로 유지했다.

## 8. 최종 판정

- G03 완료 여부: Yes
- 완료 성격: Documentation closeout only
- User Web architecture 문서가 `/app/notifications` 활성 상태를 반영한다.
- User Web architecture 문서가 `/app/schedules/week` 활성 상태를 반영한다.
- User Web architecture 문서가 `/app/export` redirect 상태를 반영한다.
- AGENT 문서의 stale route 설명이 실제 코드와 충돌하지 않게 정리됐다.
- route 정합성을 위해 코드를 되돌리거나 새 route를 열지 않았다.
- User Web에서 `/admin/api/*` 호출이 없다.
- 새 request/response, business logic, user flow, DB/Prisma 변경을 만들지 않았다.
