# G07 API-SPEC 템플릿 누락 문서 감사 작업 로그

상태: Completed
작업일: 2026-08-29
Goal 문서: `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md`

## 1. 수행 범위

- 활성화된 API-SPEC 문서와 `TODO\DONE` 보관 API-SPEC 문서를 구분한다.
- API-SPEC 필수 항목 누락 후보를 감사한다.
- 현재 production API와 직접 연결된 문서를 우선순위로 분류한다.
- 대량 문서 보강이 필요하면 별도 TODO 실행 문서를 만든다.
- G07 완료 후 관련 진행 문서를 갱신한다.

## 2. 제외 범위

- BE 코드 변경
- FE 코드 변경
- API request/response/path/error/transaction/observability 계약 변경
- 완료 보관 문서의 대량 직접 수정

## 3. 읽은 Agent/진행 문서

- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\README.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `AGENT\PM_AGENT\DECISIONS\020_todo_execution_plan_standard.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`

## 4. 진행 기록

- 작업 시작 전 `git status --short` 결과는 출력 없음으로 깨끗했다.
- G07은 문서 감사 Goal이며 BE/FE 코드를 수정하지 않는 범위로 확정했다.
- `rg --files TODO | rg "COMMON[\\/]+API-SPEC[\\/]+.*\.md$"`로 API-SPEC 전체 목록을 확인했다.
- 활성 API-SPEC과 `TODO/DONE` 보관 API-SPEC을 구분했다.
- 활성 API-SPEC 3개는 전문 확인했고, 완료 보관 API-SPEC 92개는 목록과 필수 항목 누락 후보를 정적 감사했다.
- 대량 문서 정규화가 필요하므로 `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN`을 새 후속 계획으로 생성했다.
- G07 진행 문서 상태를 Completed로 갱신하고 다음 실행 대상을 G08로 바꿨다.
- 후속 검토에서 G08 `Next` 상태 표기, `ERROR_REPORT_API.md`의 계약 상태 정규화 필요성, 보관 비인덱스 문서 71개 중 no-api 문서 2개 제외 시 API 계약 후보 69개임을 문서에 보정했다.
- 새 후속 계획의 상태 라인을 `G01 Next`, `G02 Ready after G01` 기준으로 맞춰 다음 실행 대상이 문서별로 일치하도록 정리했다.
- 상위 recheck 계획의 최종 검토 Goal은 G08 이후 실행해야 하므로 `COMMON/G99-FINAL-REVIEW.goal.md` 상태를 `Ready after G01-G08`로 맞췄다.

## 5. 감사 결과

API-SPEC 파일 수:

| 구분 | 파일 수 |
| --- | ---: |
| 전체 `TODO/**/COMMON/API-SPEC/*.md` | 95 |
| 활성 TODO API-SPEC | 3 |
| `TODO/DONE` 보관 API-SPEC | 92 |
| 보관 API-SPEC 중 README 제외 | 71 |
| 보관 API-SPEC 중 README와 no-api 문서 제외 | 69 |

정적 검색상 누락 후보:

| 구분 | 파일 수 |
| --- | ---: |
| 전체 누락 후보 포함 문서 | 85 |
| 활성 TODO 누락 후보 포함 문서 | 3 |
| 완료 보관 누락 후보 포함 문서 | 82 |
| 완료 보관 중 README 제외 누락 후보 포함 문서 | 61 |

활성 API-SPEC 수동 판정:

| 문서 | 판정 |
| --- | --- |
| `TODO\SERVICE_QA_PLAN\COMMON\API-SPEC\ERROR_REPORT_API.md` | 현재 production User API와 연결되어 있으며 계약 상태 `implemented` 여부, API 이름, API 식별자, 소비자, 호환성, Request/Response 이름, 권한, Error FE 처리/log level 등 템플릿 보강이 필요하다. |
| `TODO\SERVICE_QA_PLAN\COMMON\API-SPEC\SUPPORT_REQUEST_API.md` | 현재 production User API와 연결되어 있으며 별도 `권한` 항목과 계약 상태 표기 정규화가 필요하다. |
| `TODO\SERVICE_QA_PLAN\COMMON\API-SPEC\README.md` | API 계약서가 아니라 인덱스 문서이므로 per-API 템플릿 감사에서는 제외한다. 다만 `SUPPORT_REQUEST_API.md`가 인덱스에서 누락되어 최신화 대상이다. |

완료 보관 API-SPEC 판정:

- `TODO/DONE` 문서는 완료 이력이므로 G07에서 직접 대량 수정하지 않는다.
- current production API와 직접 연결된 문서 그룹은 후속 계획의 보관 문서 감사 인덱스에서 우선 분류한다.
- README, `NO_API_CHANGE`, `NO_NEW_API_CONTRACT`는 per-API 템플릿 보강 대상이 아니라 인덱스/비계약 문서로 별도 분류한다.

## 6. 수정 파일

- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\README.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\README.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\API_SPEC_AUDIT_RESULT.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\GOAL-WORK-ORDER.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G01-ACTIVE-SERVICE-QA-API-SPEC-NORMALIZATION.goal.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G02-DONE-API-SPEC-AUDIT-INDEX.goal.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G99-FINAL-REVIEW.goal.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\BE-TODO\README.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\FE-TODO\README.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\README.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\README.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\CURRENT-RISK-SUMMARY.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G99-FINAL-REVIEW.goal.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\GOAL-WORK-ORDER.md`
- `TODO\README.md`
- `TODO_LOG\2026-08-29\BE_SOFTWARE_AGENT_RULE_RECHECK\G07_API_SPEC_TEMPLATE_AUDIT\WORK_LOG.md`

BE/FE 코드는 수정하지 않았다.

## 7. 검증 명령

```powershell
cd D:\workspace_repository\onehandsales
rg -n "API-SPEC|요청|응답|권한|에러|관측성|Transaction|Observability" TODO
git diff -- TODO
git diff -- BE
git diff -- FE
git diff --check
git status --short
```

추가 확인:

```powershell
cd D:\workspace_repository\onehandsales
rg -n "API-SPEC|요청|응답|권한|에러|관측성|Transaction|Observability" TODO | wc -l
git diff --name-only -- TODO
git ls-files --others --exclude-standard TODO TODO_LOG
git diff --name-only -- BE
git diff --name-only -- FE
```

## 8. 검증 결과

- `rg -n "API-SPEC|요청|응답|권한|에러|관측성|Transaction|Observability" TODO`: 실행 완료. 출력 있음.
- 동일 검색의 출력 line 수: 2968
- `git diff -- TODO`: 의도한 TODO 문서 변경만 확인했다. 새로 만든 untracked TODO 문서는 `git ls-files --others --exclude-standard TODO TODO_LOG`로 별도 확인했다.
- `git diff -- BE`: 출력 없음. BE 코드 diff 없음.
- `git diff -- FE`: 최종 재확인 기준 출력 없음. FE 코드 diff 없음.
- `git diff --check`: 통과.
- `git status --short`: G07 관련 TODO/TODO_LOG 문서 변경만 표시된다.

후속 문서 보정 후 재검증:

- `git diff -- BE`: 출력 없음.
- `git diff -- FE`: 출력 없음.
- `git diff --check`: 통과.
- G07/G08 상태 표기 불일치, G02 단독 `Ready`, stale FE diff 기록 검색: 출력 없음.
- 완료 보관 API-SPEC 중 README 제외 비인덱스 문서 71개, `NO_API_CHANGE`/`NO_NEW_API_CONTRACT` 제외 API 계약 후보 69개를 재확인했다.

관련 문서 전체 상태 보정 후 재검증:

- `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN`의 상위 README, COMMON README, work order, G01/G02 goal 상태가 `G01 Next` 순서와 일치한다.
- `TODO/README.md`의 활성 계획 목록에도 `API_SPEC_TEMPLATE_NORMALIZATION_PLAN`의 다음 실행 대상이 `G01`로 기록되어 있다.
- 최종 재확인 기준 FE diff는 없다.
- `BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN`의 G99 상태가 `Ready after G01-G08`로 정리되어 상위 README/work order와 일치한다.

## 9. 자체 검토 결과

- G07의 포함 범위인 활성/보관 API-SPEC 구분과 우선순위 목록 작성을 완료했다.
- API-SPEC 템플릿 보강 대상과 제외 대상을 `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\API_SPEC_AUDIT_RESULT.md`에 기록했다.
- 대량 문서 보강은 새 후속 TODO인 `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN`으로 분리했다.
- G07에서는 BE 코드, FE 코드, API 계약 의미를 바꾸지 않았다.
- G07 진행 문서, 상위 README, 작업 순서표, 리스크 요약을 G07 완료 / G08 다음 실행 상태로 갱신했다.
- 사용자가 요청하지 않았으므로 커밋하지 않았다.

## 10. 남은 리스크

- 활성 Service QA API-SPEC 보강은 후속 `API_SPEC_TEMPLATE_NORMALIZATION_PLAN` G01에서 진행해야 한다.
- 완료 보관 API-SPEC 92개는 후속 G02에서 직접 수정 대상, 인덱스/비계약 제외 대상, 수동 검토 대상으로 더 세분화해야 한다.
- 후속 재확인 시점에는 FE diff가 없다.

## 11. 추가 TODO 필요 여부

필요함. 아래 후속 TODO를 생성했다.

- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN`

## 12. 관련 진행 문서 갱신 여부

- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`: G07 완료와 G08 다음 실행 반영
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\README.md`: G07 완료와 G08 Next 반영
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\README.md`: G07 완료 후 G08 다음 실행 안내 반영
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md`: 상태를 Next로 갱신
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\CURRENT-RISK-SUMMARY.md`: G07 해결 완료와 후속 TODO 생성 반영
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md`: 상태를 Completed로 갱신
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\GOAL-WORK-ORDER.md`: G07 완료와 G08 Next 반영
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G99-FINAL-REVIEW.goal.md`: `Ready after G01-G08` 상태로 보정
- `TODO\README.md`: 새 활성 문서 계획 `API_SPEC_TEMPLATE_NORMALIZATION_PLAN` 반영
