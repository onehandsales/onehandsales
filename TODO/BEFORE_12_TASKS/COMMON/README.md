# Common

상태: Draft / Skeleton

## 1. 목적

이 폴더는 `BEFORE_12_TASKS`에서 Frontend, Backend, PM, UX/UI, Software 기준이 함께 봐야 하는 공통 계약을 둔다.

## 2. 문서 목록

| 문서 | 목적 |
| --- | --- |
| `SCOPE.md` | 포함/제외 범위와 구현 금지선 |
| `REFERENCES.md` | 선행 확인 문서와 실제 코드 확인 경로 |
| `USER-FLOW.md` | 운영자/작업자의 closeout 흐름 |
| `GOAL-WORK-ORDER.md` | `/goal` 실행 순서 |
| `PLANNING-REVIEW.md` | 구현 전 기획 검토 결과 |
| `FINAL-SERVICE-SHAPE.md` | 12 착수 전 최종 서비스/문서 상태 |
| `RELEASE-SCOPE-CHECK.md` | 12 착수 가능 여부와 제외 범위 검수 |
| `API-SPEC/README.md` | API 변경 여부와 계약 상태 |
| `API-SPEC/NO_NEW_API_CONTRACT.md` | 이번 계획의 API non-change 계약 |
| `GOAL-SPECS/README.md` | goal 상세 명세 index |

## 3. 공통 원칙

- 12 전 작업은 운영 smoke와 문서 정합성 closeout이다.
- 코드 변경이 필요하면 문서 정합성 정리를 위한 최소 변경인지 먼저 검토한다.
- 새 API, 새 DB, 새 FE route, 새 billing/customer admin 기능은 이 계획에서 만들지 않는다.
- 문서 정리는 실제 코드 상태를 기준으로 한다.
- stale 문서를 기준으로 이미 구현된 route/API를 rollback하지 않는다.

## 4. 관련 문서

- `TODO/BEFORE_12_TASKS/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
