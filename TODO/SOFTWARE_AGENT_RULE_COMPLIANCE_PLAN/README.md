# Software Agent Rule Compliance Plan

상태: Draft / Planning
작성 기준일: 2026-08-11
대상: `BE`, `FE/user-web`, `FE/admin-web`

## 1. 목적

이 계획은 현재 구현된 Backend와 Frontend가 `AGENT/SOFTWARE_AGENT` 규칙을 더 엄격하게 따르도록 정비하기 위한 실행 계획이다.

이번 계획의 초점은 신규 기능 추가가 아니라 다음 품질 기준을 맞추는 것이다.

- Backend Clean Architecture 계층 의존성 정리
- Backend module boundary 정리
- Backend Prisma type infrastructure-only 원칙 정리
- Backend/Frontend 한글 주석 규칙 보완
- Frontend feature public API 경계 정리
- Admin Web mock 로그인 제거
- 기존 동작 보존과 typecheck/lint/test 회귀 방지

## 2. 배경

2026-08-11 검토에서 다음 문제가 확인됐다.

- Admin Web에 mock token 로그인과 fallback role 우회가 남아 있다.
- 일부 Backend application service가 `presentation/http/*response.mapper`를 import한다.
- Admin Operation application/port 계층이 `@prisma/client` enum/type을 직접 import한다.
- Deal/Schedule/Google Calendar/MeetingNote/Follow-up infrastructure 일부가 다른 module repository나 repository 구현체를 직접 import한다.
- Backend controller 일부에 `// API : ...` 주석과 numbered step comment가 빠져 있다.
- Frontend component/function/hook/API client 일부에 `// 기능 : ...` 주석이 빠져 있다.
- User Web feature 내부에서 다른 feature의 내부 `components/hooks/api/schemas/types/utils`를 직접 import하는 후보가 있다.

## 3. 범위

포함한다.

- `BE/src/modules`
- `BE/src/shared`
- `FE/user-web/src`
- `FE/admin-web/src`
- 필요한 경우 `AGENT/SOFTWARE_AGENT` 문서와 TODO 문서의 정합성 보완

제외한다.

- 신규 결제, 구독, billing, Paddle 구현
- 신규 API 기능 추가
- `AGENT/UXUI_AGENT` 기준의 UX/UI 개선, 화면 디자인, 레이아웃, 스타일, 인터랙션 재설계
- 기능/보안상 반드시 필요한 최소 UI 요소 제거 외의 사용자 경험 변경
- Prisma schema 변경과 DB migration
- 완료된 `TODO/DONE` 계획 수정

## 4. 실행 원칙

- 각 작업은 `COMMON/GOAL-SPECS`의 goal 문서를 먼저 읽고 실행한다.
- 각 goal 구현 전 `AGENT/SOFTWARE_AGENT` 하위의 관련 Backend/Frontend/Common/DB_SCHEMA 문서를 반드시 확인하고, 해당 규칙을 최우선 기준으로 따른다.
- goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 우선하며, 필요한 경우 구현 전에 TODO 문서를 보완한다.
- 이번 계획은 기능 소프트웨어 아키텍처 정합성 작업이다. UX/UI 산출물, 시각 디자인, 레이아웃, 스타일링은 변경하지 않는다.
- FE 화면 변경이 필요한 경우에도 mock login 버튼 제거처럼 보안/기능 정합성에 필요한 최소 변경만 수행한다.
- API 변경이 필요한 경우에는 구현 전에 `COMMON/API-SPEC`에 goal별 API 계약을 추가하고 `confirmed` 상태로 올린다.
- 구조 정비는 동작 보존을 우선한다.
- 주석 보완은 의미 없는 번역이 아니라 호출자가 기대하는 책임과 동작을 한국어로 적는다.
- 큰 파일의 주석 대량 보완은 구조 변경 이후 마지막 단계에서 수행한다.
- 각 goal 완료 시 최소 검증은 해당 앱의 `typecheck`와 `lint`다.

## 5. 문서 구조

```text
TODO/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN/
  README.md
  COMMON/
    README.md
    ISSUE-LOG.md
    GOAL-WORK-ORDER.md
    PLANNING-REVIEW.md
    API-SPEC/
      README.md
    GOAL-SPECS/
      README.md
      G01-ADMIN-WEB-AUTH-MOCK-REMOVAL.goal.md
      G02-BE-APPLICATION-PRESENTATION-BOUNDARY.goal.md
      G03-BE-ADMIN-PRISMA-TYPE-BOUNDARY.goal.md
      G04-BE-CROSS-MODULE-REPOSITORY-BOUNDARY.goal.md
      G05-BE-COMMENT-COVERAGE.goal.md
      G06-FE-FEATURE-PUBLIC-API-BOUNDARY.goal.md
      G07-FE-COMMENT-COVERAGE.goal.md
  BE-TODO/
    README.md
    API-TODO.md
    DB-SCHEMA.md
  FE-TODO/
    README.md
    ADMIN-WEB-TODO.md
    USER-WEB-TODO.md
```

## 6. 권장 작업 순서

1. G01 Admin Web mock 로그인 제거
2. G02 Backend application -> presentation 의존 제거
3. G03 Backend Admin Operation Prisma type 계층 정리
4. G04 Backend cross-module repository boundary 정리
5. G05 Backend 주석 커버리지 보완
6. G06 Frontend feature public API 경계 정리
7. G07 Frontend 주석 커버리지 보완

## 6.1 진행 현황

- G01 Admin Web mock 로그인 제거: 2026-08-11 구현 및 검증 완료
- G01 완료 로그: `TODO_LOG/2026-08-11/G01_ADMIN_WEB_AUTH_MOCK_REMOVAL/WORK_LOG.md`
- G02 Backend application -> presentation 의존 제거: 2026-08-11 구현 및 검증 완료
- G02 완료 로그: `TODO_LOG/2026-08-11/G02_BE_APPLICATION_PRESENTATION_BOUNDARY/WORK_LOG.md`
- 다음 권장 작업: G03 Backend Admin Operation Prisma type 계층 정리

## 7. 공통 검증

각 goal 완료 시 영향 범위에 맞춰 아래 명령을 실행한다.

```powershell
pnpm.cmd run typecheck
pnpm.cmd run lint
```

권장 전체 closeout 검증:

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

## 8. 관련 정본

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/README.md`
