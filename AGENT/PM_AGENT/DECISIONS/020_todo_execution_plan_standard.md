# TODO 실행 계획서 기준 결정

## 1. 결정

앞으로 `TODO` 아래에 작성되는 모든 계획 문서는 단순 아이디어 정리, 회의 메모, 초안 목록이 아니라 바로 실행 가능한 계획서로 작성한다.

`TODO/{PLAN_NAME}` 문서를 읽는 구현자는 다음을 즉시 알 수 있어야 한다.

- 어떤 목적의 작업인지
- 무엇을 포함하고 무엇을 제외하는지
- 어떤 순서로 실행해야 하는지
- 한 번의 `/goal`에는 어디까지 넣어야 하는지
- Frontend, Backend, 공통 계약이 각각 무엇을 해야 하는지
- 어떤 API, DB 스키마, 화면, 상태, 테스트 기준을 따라야 하는지
- 완료 여부를 어떤 명령, 화면 확인, 테스트, 문서 기준으로 검증해야 하는지

## 2. 이유

사용자는 `TODO` 문서를 최종 구현을 지시하기 위한 실행 계획서로 사용한다.

따라서 `TODO` 문서가 추상적이면 다음 문제가 생긴다.

- `/goal` 실행 시 작업 범위가 커져 누락 가능성이 높아진다.
- AI가 구현 순서, API 세부 조건, DB 제약, 화면 상태를 임의로 해석할 수 있다.
- FE와 BE가 같은 기획을 보더라도 서로 다른 계약을 전제로 작업할 수 있다.
- AGENT의 상위 원칙이 실제 구현 단위로 내려오지 못한다.

따라서 `TODO` 문서는 항상 구현 직전 수준의 실행 계획서로 유지한다.

## 3. 작성 기준

`TODO/{PLAN_NAME}`에는 최소한 다음 내용이 있어야 한다.

- 계획 목적과 배경
- 포함 범위와 제외 범위
- 공통 사용자 흐름
- `/goal` 우선순위 작업 순서
- 각 `/goal`의 목적, 포함 범위, 제외 범위, 선행 조건, 완료 기준
- FE 화면 명세, 사용자 행동, 입력 필드, 상태, validation, E2E 기준
- BE API 명세, business flow, 권한, transaction, error, 연결 DB
- DB 스키마, 제약, index, soft delete, audit log, 민감정보 기준
- 관련 AGENT 정본 문서와 TODO 내부 문서 링크
- 구현 전 검토 결과

작성 금지:

- "적절히 구현", "추후 정리", "나중에 결정", "필요하면 추가"처럼 구현자가 다르게 해석할 수 있는 표현을 남기지 않는다.
- 확정되지 않은 제품/기술 판단을 완료된 계획처럼 쓰지 않는다.
- 전체 MVP 또는 여러 우선순위를 한 번의 `/goal`로 묶지 않는다.
- FE 작업, BE 작업, API 계약, DB 스키마를 서로 연결하지 않은 채 따로 두지 않는다.

## 4. 검토 기준

`TODO` 문서는 구현 전 검토에서 다음 질문을 통과해야 한다.

- 문서만 보고 첫 번째 `/goal`을 바로 실행할 수 있는가?
- 각 `/goal`이 너무 크지 않고 검증 가능한 완료 기준을 가지는가?
- API 명세와 DB 스키마가 FE 화면 요구를 실제로 지원하는가?
- Backend 작업이 `SOFTWARE_AGENT`의 Clean Architecture, DDD, 계층 분리, port/adapter, transaction, audit log 기준으로 구체화되어 있는가?
- Frontend/UX 작업이 `UXUI_AGENT`와 `SOFTWARE_AGENT`의 User Web/Admin Web 기준으로 구체화되어 있는가?
- 아직 결정되지 않은 항목은 `Question` 또는 G00 같은 선행 결정 작업으로 분리되어 있는가?

이 기준을 만족하지 못하면 `COMMON/PLANNING-REVIEW.md`에서 `조건부 통과`, `수정 필요`, 또는 `보류`로 판정한다.

## 5. 관련 문서

- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/015_todo_goal_work_order.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/019_agent_based_planning_review.md`
- `TODO/DONE/MVP-STARTER_PLAN/README.md`
