# G02 Done API-SPEC Audit Index Work Log

작업일: 2026-08-31
상태: Completed

## 1. 작업 범위

- `TODO/DONE/**/COMMON/API-SPEC/*.md` 목록 전수 확인
- README/index 문서와 no-api 문서 제외 분류
- current production API 관련 문서 우선순위 분류
- 필요한 follow-up goal 분리 판단
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN` 상태 갱신

## 2. 제외 범위

- BE 코드 변경
- FE 코드 변경
- API 계약 의미 변경
- 완료 보관 API-SPEC 본문 대량 수정

## 3. 확인한 기준 문서

- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G02-DONE-API-SPEC-AUDIT-INDEX.goal.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/README.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/API_SPEC_AUDIT_RESULT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 4. 진행 기록

- `git status --short --untracked-files=all`: clean 상태에서 시작.
- `rg --files TODO/DONE | rg 'COMMON[\\/]+API-SPEC[\\/]+.*\.md$'`: 보관 API-SPEC 92개 확인.
- `README.md`, `NO_API_CHANGE.md`, `NO_NEW_API_CONTRACT.md` 제외 후보 23개 확인.
- Backend controller 목록을 검색해 보관 문서의 current production API 연결 여부를 확인했다.
- 필수 템플릿 키워드 14개 정적 검색으로 비인덱스 API-SPEC 69개 누락 수를 산정했다.
- `COMMON/DONE_API_SPEC_AUDIT_INDEX.md`에 92개 보관 API-SPEC 전수 분류를 기록했다.
- 대량 보강 후보 22개를 G03/G04/G05 follow-up goal로 분리했다.

## 5. 변경 내용

- `COMMON/DONE_API_SPEC_AUDIT_INDEX.md`를 추가해 전수 분류를 기록했다.
- `COMMON/G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md`를 추가했다.
- `COMMON/G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md`를 추가했다.
- `COMMON/G05-DONE-ADMIN-OPERATION-API-SPEC-NORMALIZATION.goal.md`를 추가했다.
- G02 goal, work order, README, audit result, G99 readiness, TODO_LOG를 완료 상태로 갱신했다.
- 보관 API-SPEC 본문은 수정하지 않았다.

## 6. 분류 결과

| 분류 | 파일 수 |
| --- | ---: |
| `normalize-now-candidate` | 22 |
| `index-only` | 21 |
| `no-api-contract` | 6 |
| `archive-reference-only` | 42 |
| `needs-manual-review` | 1 |
| 합계 | 92 |

## 7. 계약 의미 변경 여부

- API path, method, request field, response field, error code, transaction, observability 의미 변경 없음.
- `TODO/DONE/**/COMMON/API-SPEC/*.md` 본문 수정 없음.
- BE 코드 변경 없음.
- FE 코드 변경 없음.

## 8. 검증

- `rg --files TODO/DONE | rg 'COMMON[\\/]+API-SPEC[\\/]+.*\.md$'`: pass. 보관 API-SPEC 92개 확인.
- 인덱스 내 실제 보관 API-SPEC 경로 추출 후 count: pass. 92개 확인.
- 원본 `TODO/DONE` API-SPEC 목록과 인덱스 경로 목록의 `comm -3` 대조: pass. 누락/초과 실제 경로 없음.
- `git diff -- TODO/DONE`: pass. 보관 API-SPEC 본문 diff 없음.
- `git diff -- TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN`: pass. 감사 인덱스와 계획 문서 변경 확인.
- `git diff -- BE FE`: pass. BE/FE 코드 diff 없음.
- `git diff --check`: pass. whitespace error 없음.
- `git status --short --untracked-files=all`: pass. 변경 범위는 API-SPEC 정규화 계획 문서와 G02 TODO_LOG로 제한됨.
- 신규 Markdown 파일 대상 trailing whitespace 검색: pass. 결과 없음.

## 9. 남은 리스크

- G02는 보관 문서 원문을 직접 정규화하지 않고 후보를 분류한 감사 goal이다.
- `normalize-now-candidate` 22개는 G03/G04/G05에서 실제 템플릿 보강이 필요하다.
- `DOMAIN_GLOBAL_DATA_API.md`는 복합 도메인 확장 계약이라 G03에서 흡수할지 별도 G06으로 분리할지 판단해야 한다.

## 10. 다음 작업

- `COMMON/G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md`를 실행한다.

## 11. 재검토 기록

2026-08-31 재검토에서 감사 인덱스와 후속 goal의 추적성을 다시 확인했다.

- `DOMAIN_GLOBAL_DATA_API.md`가 `needs-manual-review`로 분류되어 있었지만 G03 goal의 수동 판단 범위에 파일 경로가 직접 명시되어 있지 않아 보강했다.
- G99 최종 검토가 G03-G05 결과를 직접 확인하도록 선행 문서, 포함 범위, 검증 명령을 보강했다.
- `GOAL-WORK-ORDER.md` 완료 판정에 G03-G05 후속 정규화 결과 확인 조건을 추가했다.
- `README.md` 포함 범위에 G02에서 분류된 보관 API-SPEC 정규화 후보의 제한 보강을 추가했다.

재검토 검증:

- 인덱스 분류별 행 수 확인: pass. `normalize-now-candidate` 22, `index-only` 21, `no-api-contract` 6, `archive-reference-only` 42, `needs-manual-review` 1.
- 원본 `TODO/DONE` API-SPEC 목록과 인덱스 경로 목록 대조: pass. 누락/초과 실제 경로 없음.
- G03 goal 수동 판단 범위에 `DOMAIN_GLOBAL_DATA_API.md` 경로 명시 확인: pass.
- G99 goal 선행 문서, 포함 범위, 검증 명령에 G03-G05 확인 조건 포함: pass.
- 오래된 `G02 Next` 상태 문구 검색: pass. 결과 없음.
- `git diff -- BE FE`: pass. BE/FE 코드 diff 없음.
- `git diff --check`: pass. whitespace error 없음.
