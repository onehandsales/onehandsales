# 기획 검토 게이트 결정

## 결정

앞으로 `AGENT`와 `TODO`에 작성된 기획서, 요구사항 문서, API 명세, DB 스키마, FE/BE 작업 문서는 실제 구현에 들어가기 전에 기획 검토 게이트를 통과해야 한다.

검토 기준 문서는 `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`로 둔다.

## 이유

AI가 사용자의 요청을 바탕으로 문서를 작성하더라도, 큰 범위의 기획과 명세에는 누락이나 해석 차이가 생길 수 있다.

특히 이 프로젝트는 하나의 계획 폴더 안에서 공통 사용자 흐름, FE 화면, BE API, DB 스키마, `/goal` 작업 순서를 함께 관리한다. 문서들이 같은 방향을 바라보지 않으면 구현 단계에서 다음 문제가 생긴다.

- FE 화면이 필요한 데이터를 BE API가 제공하지 못한다.
- API 명세가 DB 스키마와 연결되지 않는다.
- 사용자의 원래 의도와 TODO 작업 단위가 다르게 나뉜다.
- `/goal` 작업 범위가 커져 AI가 누락할 가능성이 높아진다.
- 권한, 민감정보, 감사 로그 같은 위험 흐름이 구현 전에 확인되지 않는다.

따라서 구현 전에 기획 문서를 다시 검토하는 별도 기준을 두고, 통과 여부를 판단한 뒤 작업을 시작한다.

## 적용 범위

- `AGENT/PM_AGENT/PLANNING`의 제품 기획 문서
- `AGENT/UXUI_AGENT/PLANNING`의 사용자 흐름과 화면 문서
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE`의 구현 방향 문서
- `TODO/{PLAN_NAME}/README.md`
- `TODO/{PLAN_NAME}/USER-FLOW.md`
- `TODO/{PLAN_NAME}/GOAL-WORK-ORDER.md`
- `TODO/{PLAN_NAME}/FE-TODO/*`
- `TODO/{PLAN_NAME}/BE-TODO/*`
- API 명세 문서
- DB 스키마 문서

## 규칙

- 새 계획 폴더를 만들면 구현 전 검토를 수행한다.
- 사용자가 "검토해줘", "구현 들어가도 되는지", "부족한 점이 있는지"라고 요청하면 기획 검토 체크리스트를 기준으로 답한다.
- 검토 결과는 `통과`, `조건부 통과`, `수정 필요`, `보류` 중 하나로 판정한다.
- Critical 문제가 있으면 구현을 시작하지 않는다.
- 사용자의 결정이 필요한 항목은 AI가 임의로 확정하지 않고 질문 또는 결정 필요 항목으로 남긴다.
- 명확한 문서 누락, 링크 누락, 용어 불일치, API 필수 항목 누락은 검토 과정에서 바로 보완할 수 있다.
- 검토 결과가 문서 구조나 우선순위를 바꾸는 경우 관련 문서를 함께 갱신한다.

## 금지

- 검토 없이 큰 TODO 계획을 바로 `/goal` 구현으로 넘기지 않는다.
- API 명세나 DB 스키마가 부족한 상태에서 구현 가능하다고 판단하지 않는다.
- FE/BE 책임이 맞지 않는 상태를 "구현 중 조정"으로 넘기지 않는다.
- 사용자 의도 확인이 필요한 결정을 AI가 임의로 확정하지 않는다.

## 관련 문서

- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/DECISIONS/015_todo_goal_work_order.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
- `TODO/README.md`
