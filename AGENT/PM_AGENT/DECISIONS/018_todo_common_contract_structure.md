# TODO COMMON 공통 계약 구조 결정

## 결정

앞으로 `TODO` 아래에 특정 요구사항 또는 기획 계획 폴더를 만들 때는 `COMMON` 폴더를 반드시 둔다.

`TODO` 계획 폴더는 단순 정리 문서가 아니라 바로 실행 가능한 계획서로 작성한다. 구현자는 `TODO/{PLAN_NAME}` 문서만 보고 어떤 순서로 `/goal`을 실행하고, FE/BE/API/DB를 어디까지 구현하며, 무엇으로 완료를 검증해야 하는지 알 수 있어야 한다.

`COMMON`은 Frontend와 Backend가 함께 봐야 하는 공통 계약 문서를 관리한다. 사용자 흐름, `/goal` 작업 순서, API 명세, goal별 화면/기능/DB 추적 명세, 기획 검토 결과는 `COMMON` 아래에 둔다.

기본 구조는 다음을 따른다.

```text
TODO/
  {PLAN_NAME}/
    README.md
    COMMON/
      README.md
      USER-FLOW.md
      GOAL-WORK-ORDER.md
      PLANNING-REVIEW.md
      API-SPEC/
        README.md
        G00-...md
      GOAL-SPECS/
        README.md
        P0-...md
    FE-TODO/
      README.md
    BE-TODO/
      README.md
      DB-SCHEMA.md
```

## 이유

Frontend와 Backend는 같은 요구사항을 구현하지만 역할이 다르다.

기존처럼 사용자 흐름과 작업 순서는 계획 폴더 루트에, API 명세는 `BE-TODO`에 두면 다음 문제가 생긴다.

- Frontend가 API 계약을 공통 기준으로 확인하기 어렵다.
- Backend가 화면에서 필요한 response 필드를 놓칠 수 있다.
- API 명세가 Backend 작업 목록처럼 보이고, FE/BE 계약 문서로 작동하지 못한다.
- `/goal` 단위별로 화면, API, DB, 테스트가 어떻게 연결되는지 추적하기 어렵다.

따라서 FE와 BE가 모두 참조해야 하는 문서는 `COMMON`에 모으고, FE와 BE의 세부 실행 문서는 각자의 TODO 폴더에 둔다.

## 적용 범위

- `TODO` 아래 새로 만드는 모든 계획 폴더
- 기존 `TODO/DONE/MVP-STARTER_PLAN`
- 사용자 흐름, API 명세, DB 스키마, FE/BE 작업이 함께 필요한 모든 기획
- `/goal`로 구현할 모든 요구사항 문서

## 기본 작성 규칙

- 계획 폴더에는 `COMMON`, `FE-TODO`, `BE-TODO`를 둔다.
- 계획 폴더의 모든 문서는 실행 계획서 수준으로 작성한다.
- `COMMON/USER-FLOW.md`에는 FE/BE가 함께 봐야 하는 사용자 흐름을 쓴다.
- `COMMON/GOAL-WORK-ORDER.md`에는 `/goal` 우선순위 작업 순서를 쓴다.
- `COMMON/GOAL-WORK-ORDER.md`의 각 작업은 한 번의 `/goal`로 실행 가능한 크기여야 한다.
- `COMMON/API-SPEC`에는 API 명세를 둔다.
- API 명세는 전체 API를 한 번에 큰 문서로 쓰지 않고, 우선순위와 `/goal` 단위에 맞춰 나눈다.
- `COMMON/GOAL-SPECS`에는 각 `/goal`별 화면 명세, API 연결, DB 연결, 완료 기준을 쓴다.
- `COMMON/PLANNING-REVIEW.md`에는 구현 전 기획 검토 결과를 쓴다.
- `BE-TODO/DB-SCHEMA.md`에는 구현 직전 Prisma schema로 옮길 수 있는 수준의 DB 스키마를 둔다.
- `FE-TODO`에는 화면 구현 작업, 컴포넌트, 상태 관리, E2E 작업을 둔다.
- `BE-TODO`에는 Backend 내부 구조, 도메인 계층, repository, service, provider adapter, 테스트 작업을 둔다.
- 완료 기준은 명령 실행, 화면 확인, 테스트 통과, 문서 검토처럼 검증 가능한 형태로 쓴다.

## API 명세 기본값

사용자가 별도로 다시 지정하지 않아도 API 명세는 다음 기준으로 작성한다.

- 위치: `TODO/{PLAN_NAME}/COMMON/API-SPEC`
- 단위: `/goal` 우선순위에 맞춘 문서
- 필수 항목: API 이름, API 식별자, method, path, request 이름, request 필드, 비즈니스 로직 흐름, response 이름, response 필드, 연결된 DB 스키마, 에러 응답, 관련 문서
- 목적: Frontend와 Backend가 함께 보는 계약 문서

## 화면 명세 기본값

사용자가 별도로 다시 지정하지 않아도 화면 명세는 다음 기준으로 작성한다.

- 위치: `TODO/{PLAN_NAME}/COMMON/GOAL-SPECS`
- 단위: 각 `/goal`
- 필수 항목: 화면 목적, 사용자 행동, 주요 UI, 입력 필드, 상태, validation, empty/loading/error/success, 필요한 API, 연결 DB, 테스트 기준
- 목적: 구현 직전에 FE가 바로 화면 작업을 시작할 수 있게 하는 것

## 기획 검토 기본값

사용자가 별도로 다시 지정하지 않아도 구현 전 검토 문서는 다음 기준으로 작성한다.

- 위치: `TODO/{PLAN_NAME}/COMMON/PLANNING-REVIEW.md`
- 판정: `통과`, `조건부 통과`, `수정 필요`, `보류`
- 기준: `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- Critical 문제가 있으면 구현을 시작하지 않는다.

## 금지

- API 명세를 `BE-TODO` 안에만 두어 FE가 공통 계약으로 보지 못하게 하지 않는다.
- 사용자 흐름과 `/goal` 순서를 계획 폴더 루트에 흩어두지 않는다.
- 전체 API 명세를 한 번에 거대한 문서로 만들어 `/goal` 우선순위를 흐리지 않는다.
- TODO 문서를 아이디어 메모 수준으로 남기지 않는다.
- 구현자가 다음 작업 순서와 완료 기준을 추론해야 하는 상태로 두지 않는다.
- 화면 명세 없이 FE 작업을 구현 가능하다고 판단하지 않는다.
- DB 스키마 없이 Backend 작업을 구현 가능하다고 판단하지 않는다.
- 사용자가 이미 확정한 이 구조를 매번 다시 질문하지 않는다.

## 관련 문서

- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/015_todo_goal_work_order.md`
- `AGENT/PM_AGENT/DECISIONS/017_planning_review_gate.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
- `TODO/DONE/MVP-STARTER_PLAN/README.md`
