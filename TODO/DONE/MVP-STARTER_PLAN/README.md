# MVP Starter Plan

## 1. 목적

이 폴더는 `한손에 영업 / onehand.sales` MVP 구현을 시작하기 위한 실행 계획을 정리한다.

제품 정본은 `AGENT` 문서에 있고, 이 폴더는 실제 구현자가 Frontend와 Backend 작업을 어떤 순서로 진행해야 하는지 확인하기 위한 작업 문서다.

## 2. 폴더 구조

```text
MVP-STARTER_PLAN/
  README.md
  COMMON/
    README.md
    G00-DECISIONS.md
    G00-PENDING-QUESTIONS.md
    USER-FLOW.md
    GOAL-WORK-ORDER.md
    PLANNING-REVIEW.md
    API-SPEC/
    GOAL-SPECS/
  FE-TODO/
    README.md
    USER-WEB-TODO.md
    ADMIN-WEB-TODO.md
  BE-TODO/
    README.md
    API-TODO.md
    DB-SCHEMA.md
```

## 3. 작성 원칙

- 모든 문서는 한국어로 작성한다.
- 기획자 관점에서 사용자 흐름, 포함 범위, 제외 범위, 완료 기준을 함께 적는다.
- FE와 BE가 함께 보는 공통 계약은 `COMMON`에 둔다.
- FE와 BE는 같은 계획 폴더 안에서 나누어 관리한다.
- 실제 구현은 `COMMON/GOAL-WORK-ORDER.md`의 작업 단위 순서대로 나누어 진행한다.
- 한 번의 `/goal`에는 하나의 작업 단위만 넣는다.
- G00에서 확정한 구현 전 결정은 `COMMON/G00-DECISIONS.md`에 기록한다.
- G00에서 새 미확정 질문이 생기면 `COMMON/G00-PENDING-QUESTIONS.md`에 기록하고, 이후 하나씩 확정한다. 확정된 현재 기준은 `COMMON/G00-DECISIONS.md`를 정본으로 본다.
- API 명세는 `COMMON/API-SPEC`에 둔다. 구현 시에는 API 요약 문서와 `*-ENDPOINT-CONTRACT.md`를 함께 본다.
- 각 `/goal`별 화면/API/DB 추적 명세는 `COMMON/GOAL-SPECS`에 둔다.
- DB 스키마는 `BE-TODO/DB-SCHEMA.md`에 둔다.
- 화면, 컴포넌트, 상태 관리, E2E 작업은 `FE-TODO`에 둔다.
- FE 화면 구현 전에는 `FE-TODO/README.md`의 UX/UI reference 기준을 확인한다.

## 4. 구현 우선순위

상세 작업 단위는 `COMMON/GOAL-WORK-ORDER.md`를 따른다.

1. 프로젝트 스캐폴딩
2. DB 스키마와 Prisma 설정
3. 인증과 사용자 데이터 분리
4. 회사/거래처(담당자)/제품 CRUD
5. 딜 CRUD와 딜 활동 로그
6. 일정 CRUD, 월간 일정 화면, 주간 일정 보고서
7. 회의록 저장과 딜 연결
8. 명함 OCR, Import/Export, 알림
9. Admin Web 기본 조회와 민감정보 감사 흐름
10. Playwright E2E와 Backend 위험 흐름 테스트

## 5. 관련 정본 문서

- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/DECISIONS/006_uxui_reference_style.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`

## 6. 관련 TODO 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-PENDING-QUESTIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/README.md`


