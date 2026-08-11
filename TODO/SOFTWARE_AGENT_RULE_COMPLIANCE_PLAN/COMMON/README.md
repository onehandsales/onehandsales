# Common

상태: Draft

## 1. 목적

이 폴더는 `SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN`의 FE/BE 공통 계약, 발견 이슈, goal 작업 순서, goal별 상세 스펙을 보관한다.

## 2. 문서

| 문서 | 역할 |
| --- | --- |
| `ISSUE-LOG.md` | 2026-08-11 검토에서 확인한 위반 후보와 근거 |
| `GOAL-WORK-ORDER.md` | `/goal`로 실행할 작업 순서와 의존성 |
| `PLANNING-REVIEW.md` | 계획 착수 전 검토 결과 |
| `API-SPEC/README.md` | 이번 계획의 API 변경 여부와 계약 작성 기준 |
| `GOAL-SPECS/*.goal.md` | goal별 실행 스펙 |

## 3. 공통 완료 기준

- 모든 goal은 구현 전에 `AGENT/SOFTWARE_AGENT` 관련 문서를 확인하고 그 규칙을 우선 적용한다.
- goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 기준으로 TODO 문서를 보완한 뒤 진행한다.
- `AGENT/UXUI_AGENT` 기준의 UX/UI 개선, 화면 디자인, 레이아웃, 스타일, 인터랙션 재설계는 수행하지 않는다.
- FE 화면 변경은 보안/기능 정합성에 필요한 최소 범위로 제한한다.
- 기존 기능 동작을 보존한다.
- `typecheck`와 `lint`를 통과한다.
- 수정한 class/interface/function/API method에는 SOFTWARE_AGENT 주석 규칙을 적용한다.
- 새 API나 API shape 변경이 생기면 구현 전에 `COMMON/API-SPEC`에 계약 문서를 추가한다.
- 불가피한 예외는 goal 문서와 최종 결과에 기록한다.
