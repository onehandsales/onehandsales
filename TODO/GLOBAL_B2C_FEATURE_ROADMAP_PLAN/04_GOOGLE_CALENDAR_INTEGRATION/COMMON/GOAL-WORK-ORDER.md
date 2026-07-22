# Goal Work Order

상태: Confirmed
확정일: 2026-07-22

## 1. 원칙

04는 Planning/API/DB 계약 확인, Backend DB+connection, Backend calendar list+sync, User Web UX, QA 순서로 간다.

각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

모든 `/goal`은 `COMMON/ARCHITECTURE-GUARDRAILS.md`, `COMMON/SCOPE.md`, `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`를 먼저 읽고 진행한다.

DB migration을 허용한다. Prisma schema와 migration에는 한글 주석 기준을 지킨다.

이번 04는 Google Calendar read-only import다. Google export, 양방향 sync, webhook, 반복 일정 정식 모델, 참석자 import, Google reminders import는 만들지 않는다.

기존 Schedule 삭제 API는 hard delete에서 soft delete/Trash 이동으로 바꾼다. 이 변경은 Google 연동과 분리하지 않는다.

## 2. 실행 순서

```text
G01_PLANNING_API_DB_CONTRACT
-> G02_BACKEND_DB_GOOGLE_CONNECTION
-> G03_BACKEND_CALENDAR_LIST_SYNC
-> G04_USER_WEB_GOOGLE_CALENDAR_UX
-> G05_QA_REVIEW_CLOSEOUT
```

## 3. G01 Planning API DB Contract

상세 명세: `COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md`

목표:

- 현재 코드와 문서 계약 충돌 여부를 최종 확인한다.
- 필요한 경우 문서 계약만 보정한다.
- 구현 착수 전 blocking 질문이 없음을 확인한다.

## 4. G02 Backend DB Google Connection

상세 명세: `COMMON/GOAL-SPECS/G02_BACKEND_DB_GOOGLE_CONNECTION.md`

목표:

- Prisma schema/migration을 추가한다.
- Schedule soft delete와 Trash `SCHEDULE` restore를 구현한다.
- Google connection/status/connect/callback/disconnect API를 구현한다.
- token 암호화, OAuth state, reconnect required 처리의 foundation을 만든다.

## 5. G03 Backend Calendar List Sync

상세 명세: `COMMON/GOAL-SPECS/G03_BACKEND_CALENDAR_LIST_SYNC.md`

목표:

- calendar list/selection API를 구현한다.
- selected calendar event sync를 구현한다.
- Google event field mapping, local modified, Google deleted, reminders를 닫는다.
- 기존 Schedule list/detail/week/export response를 확장한다.

## 6. G04 User Web Google Calendar UX

상세 명세: `COMMON/GOAL-SPECS/G04_USER_WEB_GOOGLE_CALENDAR_UX.md`

목표:

- `/app/schedules`, `/app/settings`, `/app/schedules/:scheduleId`, `/app/schedules/week`, `/app/trash` UX를 연결한다.
- connect/reconnect/calendar selection/manual sync/disconnect/source badge/meeting URL/soft delete restore를 구현한다.

## 7. G05 QA Review Closeout

상세 명세: `COMMON/GOAL-SPECS/G05_QA_REVIEW_CLOSEOUT.md`

목표:

- Backend/User Web 검증, migration, ownership, token redaction, reminder, Trash restore, hidden Google filter를 점검한다.
- `COMMON/REVIEW-CHECKLIST.md` 기준으로 구현 검토를 닫는다.

## 8. 첫 실행 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md 기준으로 G01을 구현해줘.
```
