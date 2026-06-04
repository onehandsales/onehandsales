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

Frontend와 Backend는 같은 요구사항과 기획을 바라보지만 역할이 다르다. 따라서 하나의 계획 폴더 안에서 공통 사용자 흐름을 공유하고, 세부 작업은 `FE-TODO`, `BE-TODO`로 나누어 작성한다.

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
- `/goal`은 `GOAL-WORK-ORDER.md`의 우선순위 순서대로 순차 실행한다.
- 선행 작업이 완료 기준을 만족하지 못하면 후속 작업으로 넘어가지 않는다.
- 너무 큰 작업은 Backend, Frontend, 통합, 테스트로 나눈다.

## API 명세 규칙

Backend API 명세에는 API마다 다음을 반드시 포함한다.

- API 이름
- request 이름
- 비즈니스 로직 흐름
- response 이름
- 연결된 DB 스키마

상세 작성 규칙은 `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`를 따른다.

## 금지

- `MVP 전체 구현`처럼 큰 목표를 한 번의 `/goal`로 실행하지 않는다.
- FE 전체와 BE 전체를 한 goal에서 동시에 구현하지 않는다.
- API 명세, DB 스키마, 모든 화면, 모든 테스트를 한 goal에 묶지 않는다.

## 관련 문서

- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
- `TODO/MVP-STARTER_PLAN/GOAL-WORK-ORDER.md`


