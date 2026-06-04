# MVP Starter COMMON

## 1. 목적

이 폴더는 `MVP-STARTER_PLAN`에서 Frontend와 Backend가 함께 봐야 하는 공통 계약 문서를 관리한다.

`FE-TODO`와 `BE-TODO`는 역할별 실행 문서지만, 사용자 흐름, `/goal` 작업 순서, API 계약, goal별 화면/DB/API 연결, 구현 전 검토 결과는 두 역할이 같은 기준으로 봐야 한다. 따라서 이 폴더를 공통 기준으로 둔다.

## 2. 폴더 구조

```text
COMMON/
  README.md
  USER-FLOW.md
  GOAL-WORK-ORDER.md
  PLANNING-REVIEW.md
  API-SPEC/
    README.md
    G01-G05-FOUNDATION-AUTH-API.md
    G06-G12-CORE-DOMAIN-API.md
    G17-G29-WORKFLOW-AUTOMATION-API.md
    G30-G32-ADMIN-AUDIT-API.md
  GOAL-SPECS/
    README.md
    P0-G00-G04-FOUNDATION.md
    P1-G05-G11-CORE-DATA.md
    P2-G12-G16-DEAL-LOOP.md
    P3-G17-G20-SCHEDULE-MEETING.md
    P4-G21-G29-AUTOMATION.md
    P5-G30-G32-ADMIN-AUDIT.md
    P6-G33-G36-TEST-RELEASE.md
```

## 3. 문서 역할

- `USER-FLOW.md`: 사용자의 실제 업무 흐름과 FE/BE 처리 흐름을 함께 설명한다.
- `GOAL-WORK-ORDER.md`: `/goal`로 실행할 작업 순서와 각 goal의 포함/제외/완료 기준을 정의한다.
- `PLANNING-REVIEW.md`: 구현 전 기획 검토 결과와 남은 보완 항목을 기록한다.
- `API-SPEC`: FE와 BE가 함께 보는 API 계약 문서를 둔다. 구현 시에는 도메인 API 문서와 해당 `*-ENDPOINT-CONTRACT.md`를 함께 본다.
- `GOAL-SPECS`: 각 `/goal`별 화면 명세, API 연결, DB 연결, 테스트 기준을 둔다.

## 4. 사용 원칙

- 구현 전에는 `PLANNING-REVIEW.md`의 판정을 먼저 확인한다.
- `/goal` 실행 전에는 `GOAL-WORK-ORDER.md`와 `GOAL-SPECS`의 해당 goal을 함께 확인한다.
- FE 작업자는 화면 명세를 보면서 필요한 API를 `API-SPEC`과 `*-ENDPOINT-CONTRACT.md`에서 확인한다.
- BE 작업자는 API 명세와 엔드포인트 구현 계약을 보면서 필요한 DB 모델을 `BE-TODO/DB-SCHEMA.md`에서 확인한다.
- API 명세는 전체를 한 번에 구현하기 위한 문서가 아니라, 우선순위에 따라 goal 단위로 구현할 수 있게 나눈 계약 문서다.

## 5. 관련 문서

- `TODO/MVP-STARTER_PLAN/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/README.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/README.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
