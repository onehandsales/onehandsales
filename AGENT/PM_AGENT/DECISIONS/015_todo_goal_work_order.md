# TODO Goal 작업 단위 결정

## 결정

앞으로 `TODO` 아래의 계획 문서는 `/goal` 실행을 전제로 우선순위 작업 단위를 반드시 나눈다.

계획 폴더에는 다음 문서를 둔다.

```text
TODO/
  {PLAN_NAME}/
    README.md
    USER-FLOW.md
    GOAL-WORK-ORDER.md
    FE-TODO/
    BE-TODO/
```

## 이유

MVP 구현 범위는 Frontend, Backend, DB, API, Admin, 테스트를 모두 포함하기 때문에 한 번에 작업하면 누락 가능성이 높다.

따라서 AI가 작업할 때는 작은 목표 단위로 실행해야 한다. 각 작업 단위는 의존성, 포함 범위, 제외 범위, 완료 기준이 명확해야 한다.

## 적용 범위

- `TODO` 아래 새로 만드는 모든 계획 폴더
- 기존 `TODO/MVP-STARTER_PLAN`
- API 명세와 DB 스키마를 포함하는 상세 구현 계획
- `/goal`로 실행할 예정인 모든 작업 문서

## 규칙

- 계획 폴더마다 `GOAL-WORK-ORDER.md`를 만든다.
- 작업 단위는 `G00`, `G01`처럼 순번을 붙인다.
- 각 작업 단위에는 목적, 포함 범위, 제외 범위, 완료 기준을 적는다.
- 필요한 경우 참조 문서와 선행 작업을 적는다.
- 한 번의 `/goal`에는 하나의 작업 단위만 넣는 것을 기본으로 한다.
- 너무 큰 작업은 Backend, Frontend, 통합, 테스트로 나눈다.

## 금지

- `MVP 전체 구현`처럼 큰 목표를 한 번의 `/goal`로 실행하지 않는다.
- FE 전체와 BE 전체를 한 goal에서 동시에 구현하지 않는다.
- API 명세, DB 스키마, 모든 화면, 모든 테스트를 한 goal에 묶지 않는다.

## 관련 문서

- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `TODO/MVP-STARTER_PLAN/GOAL-WORK-ORDER.md`


