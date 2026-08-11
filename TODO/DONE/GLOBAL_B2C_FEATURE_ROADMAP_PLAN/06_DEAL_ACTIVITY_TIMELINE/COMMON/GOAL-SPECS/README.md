# Goal Specs

상태: Confirmed
확정일: 2026-07-25

## 1. 실행 규칙

한 번의 `/goal`에는 아래 문서 중 하나만 넣는다.

```text
G01_PLANNING_API_DB_CONTRACT
G02_DEAL_ACTIVITY_DB_PRISMA
G03_DEAL_ACTIVITY_BACKEND
G04_DEAL_ACTIVITY_USER_WEB
G05_DEAL_RECORD_SUMMARY_BACKEND
G06_DEAL_RECORD_SUMMARY_USER_WEB
G07_QA_REVIEW_CLOSEOUT
```

## 2. 순서

`COMMON/GOAL-WORK-ORDER.md`의 순서를 따른다.

## 3. 공통 완료 기준

- AGENT UXUI/SOFTWARE 기준을 먼저 읽는다.
- 상위 계획 반영 범위는 `COMMON/SOURCE-PLAN-COVERAGE.md`와 일치한다.
- 비즈니스 로직은 `COMMON/BUSINESS-LOGIC.md`와 일치한다.
- API가 있으면 `COMMON/API-SPEC`과 일치한다.
- DB 변경이 있으면 `BE-TODO/DB-SCHEMA.md`와 일치한다.
- FE 변경이 있으면 `FE-TODO/USER-WEB-TODO.md`와 일치한다.
- 구현 후 검증 명령 또는 미실행 사유를 기록한다.
- 다음 goal로 넘어가기 전 구현 결과를 문서에 반영한다.
