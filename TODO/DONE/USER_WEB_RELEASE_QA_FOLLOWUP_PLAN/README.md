# User Web Release QA Follow-up Plan

상태: Done
작성일: 2026-07-20
완료일: 2026-07-20
목적: `USER_WEB_UXUI_COMMON_QA_PLAN` 완료 이후 남은 출시 전 품질 작업을 `/goal`로 바로 실행할 수 있게 정리한다.

## 1. 배경

`TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN` 기준으로 User Web UX/UI 공통 QA의 `G01`~`G06`은 완료됐다. 남은 Open/S0/S1/S2 UX/UI 이슈는 없다.

다만 `AGENT/PM_AGENT/DECISIONS/029_global_b2c_series_a_priority.md`, `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`, `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md` 기준으로 출시 전 품질 라운드는 아직 끝나지 않았다.

이번 계획은 UX/UI 공통 QA 이후 남은 작업을 다음 순서로 고정한다.

1. 완료 문서와 e2e 실행 환경 정리
2. 모바일 브라우저 390px/360px QA
3. Chrome/Edge 호환 QA
4. 다중 계정 보안 QA
5. DB/Prisma/migration 운영 정합성 QA
6. 발견된 S0/S1/S2 수정과 closeout
7. 이번 범위 밖 BE/API 개선 후보 분리

## 2. 포함 범위

- `TODO/README.md`와 완료된 UX/UI QA 문서의 상태 불일치 정리
- `FE/user-web` Playwright 실행 환경 복구
- 모바일 브라우저 Web 기준 390px/360px QA
- Chrome/Edge 브라우저 호환 QA
- User Web 핵심 화면의 reload, history, slow network, multi-tab smoke
- Search, Trash, Export, 직접 URL/API 접근의 다중 계정 데이터 격리 QA
- Prisma generate, migration status, seed 정책, 로컬 DB 실행 상태 점검
- 발견된 S0/S1/S2 bug 우선 수정
- UX/UI 공통 QA에서 분리된 BE/API 후보를 별도 계획 후보로 문서화

## 3. 제외 범위

- iOS/Android 네이티브 앱 QA
- Safari 전용 QA
- Notification 구현
- DataImport Job 영속화 구현
- Admin 운영 화면 구현
- 결제/구독 구현
- `/app` 내부 전체 다국어화
- Series A급 AI next action, retention, analytics 기능 구현

위 항목은 이번 계획에서 발견되더라도 실패로 처리하지 않고 `COMMON/ISSUE-LOG.md`에 `N/A` 또는 `별도 계획 후보`로 기록한다.

## 4. 바로 실행할 첫 goal

첫 번째 `/goal`은 아래 문서를 대상으로 실행한다.

```text
TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/GOAL-SPECS/G01-QA-ENV-AND-DOC-CLOSEOUT.goal.md
```

G01 완료 전에는 G02 모바일 QA로 넘어가지 않는다. G01에서 기본 Playwright 실행 환경이 막히면 G02/G03의 자동 QA도 같은 원인으로 막힌다.

## 5. Goal 작업 순서

| 순서 | Goal 문서 | 담당 영역 | 목적 |
|---:|---|---|---|
| 1 | `COMMON/GOAL-SPECS/G01-QA-ENV-AND-DOC-CLOSEOUT.goal.md` | Common, FE | 완료 문서 상태와 Playwright 기본 실행 환경을 정리한다. |
| 2 | `COMMON/GOAL-SPECS/G02-MOBILE-BROWSER-390-360-QA.goal.md` | FE/user-web | 390px/360px 모바일 브라우저 QA를 실행하고 S0~S4를 분류한다. |
| 3 | `COMMON/GOAL-SPECS/G03-CHROME-EDGE-COMPAT-QA.goal.md` | FE/user-web | Chrome/Edge 호환 QA를 실행한다. |
| 4 | `COMMON/GOAL-SPECS/G04-MULTI-ACCOUNT-SECURITY-QA.goal.md` | BE, FE | 다중 계정 데이터 격리와 User/Admin API 경계를 검증한다. |
| 5 | `COMMON/GOAL-SPECS/G05-DB-PRISMA-MIGRATION-OPS-QA.goal.md` | BE, DB | Prisma generate/migration/seed 운영 정합성을 정리한다. |
| 6 | `COMMON/GOAL-SPECS/G06-S0-S2-BUGFIX-CLOSEOUT.goal.md` | FE, BE | 발견된 S0/S1/S2를 우선 수정하고 release QA를 닫는다. |
| 7 | `COMMON/GOAL-SPECS/G07-DEFERRED-BE-API-BACKLOG-SPLIT.goal.md` | Common, BE | 이번 범위 밖 BE/API 개선 후보를 별도 계획 후보로 분리한다. |

## 6. 검증 명령 기본값

Frontend 기본 검증:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Backend 기본 검증:

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

DB/Prisma 검증:

```powershell
cd BE
pnpm db:dev:up
pnpm prisma:validate
pnpm prisma:generate
pnpm exec prisma migrate status
```

`DATABASE_URL`이 공유 Supabase 또는 운영성 DB를 가리키면 `prisma:migrate`, `prisma:seed`를 자동 실행하지 않는다. 이 경우 `Blocked`로 기록하고 로컬 전용 DB 전환 또는 사용자 결정을 받은 뒤 실행한다.

## 7. 완료 기준

- `G01`~`G07`이 Done이다.
- `COMMON/ISSUE-LOG.md`에 남은 S0/S1/S2가 없거나 명시적으로 보류 판단되어 있다.
- 모바일 390px/360px QA 결과가 `COMMON/QA-RESULTS.md`에 기록되어 있다.
- Chrome/Edge QA 결과가 `COMMON/QA-RESULTS.md`에 기록되어 있다.
- 다중 계정 보안 QA 결과가 `COMMON/QA-RESULTS.md`에 기록되어 있다.
- DB/Prisma/migration 운영 정합성 결과가 `COMMON/QA-RESULTS.md`에 기록되어 있다.
- 자동 검증 실패가 있으면 환경 문제, 테스트 결함, 실제 product bug 중 하나로 분류되어 있다.
- G07에서 이번 계획 밖 BE/API 후보가 별도 계획 후보로 분리되어 있다.

## 8. 반드시 먼저 읽을 문서

- `AGENT/PM_AGENT/DECISIONS/029_global_b2c_series_a_priority.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/README.md`
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/BE-TODO/API-TODO.md`

## 9. 관련 문서

- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/README.md`
- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/ISSUE-LOG.md`
- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/QA-RESULTS.md`
- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/BE-TODO/API-TODO.md`
