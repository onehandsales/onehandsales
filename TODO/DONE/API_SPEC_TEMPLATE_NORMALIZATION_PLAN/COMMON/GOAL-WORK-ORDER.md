# Goal Work Order

상태: Completed / G99 Completed

## 1. 실행 원칙

- 한 번의 `/goal`에서는 하나의 goal 파일만 실행한다.
- 이 계획은 문서 정규화 계획이며 BE/FE 코드를 수정하지 않는다.
- API path, method, request, response, error code, transaction, observability 의미를 바꾸지 않는다.
- 작업 시작 전 `git status --short`와 관련 AGENT 문서를 확인한다.
- 각 goal은 `TODO_LOG\<YYYY-MM-DD>\API_SPEC_TEMPLATE_NORMALIZATION\<GOAL_ID>_<TASK_TITLE>\WORK_LOG.md`를 작성하거나 갱신한다.

## 2. 실행 순서

| 순서 | Goal | 파일 | 성격 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | G01 | `COMMON/G01-ACTIVE-SERVICE-QA-API-SPEC-NORMALIZATION.goal.md` | 활성 API-SPEC 정규화 | Completed 2026-08-31 |
| 2 | G02 | `COMMON/G02-DONE-API-SPEC-AUDIT-INDEX.goal.md` | 보관 API-SPEC 감사 인덱스 | Completed 2026-08-31 |
| 3 | G03 | `COMMON/G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md` | 보관 Core/User API-SPEC 정규화 | Completed 2026-08-31 |
| 4 | G04 | `COMMON/G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md` | 보관 Mobile Field API-SPEC 정규화 | Completed 2026-08-31 |
| 5 | G05 | `COMMON/G05-DONE-ADMIN-OPERATION-API-SPEC-NORMALIZATION.goal.md` | 보관 Admin Operation API-SPEC 정규화 | Completed 2026-08-31 |
| 6 | G06 | `COMMON/G06-DONE-DOMAIN-GLOBAL-DATA-API-SPEC-NORMALIZATION.goal.md` | Domain Global Data 복합 API-SPEC 정규화 | Completed 2026-08-31 |
| 7 | G99 | `COMMON/G99-FINAL-REVIEW.goal.md` | 최종 검토 | Completed 2026-08-31 |

## 3. 실행 프롬프트

완료 보관된 계획이므로 추가 실행 프롬프트는 없다.

G01~G06과 G99의 완료 이력은 `TODO_LOG\2026-08-31\API_SPEC_TEMPLATE_NORMALIZATION`을 기준으로 본다.

## 4. 완료 판정

- 활성 API-SPEC의 템플릿 누락 보강 또는 제외 판단이 기록되어 있다.
- 완료 보관 API-SPEC은 직접 수정 대상, 인덱스/비계약 제외 대상, 보류 대상으로 분류되어 있다.
- G03-G06으로 분리된 `normalize-now-candidate`와 수동 판단 후속 정규화 결과가 기록되어 있다.
- BE/FE 코드 diff가 없다.
- API 계약 의미 변경이 없다.
- TODO_LOG에 검증 결과와 남은 리스크가 기록되어 있다.
