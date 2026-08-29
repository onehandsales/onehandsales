# G07 API-SPEC 템플릿 누락 문서 정리 계획 분리

상태: Completed
성격: 문서 감사
우선순위: P3
완료일: 2026-08-29
TODO_LOG: `TODO_LOG\2026-08-29\BE_SOFTWARE_AGENT_RULE_RECHECK\G07_API_SPEC_TEMPLATE_AUDIT\WORK_LOG.md`

## 1. 목적

API-SPEC 템플릿 누락 문서를 코드 수정 Goal과 분리해 후속 문서 정리 작업으로 관리한다.

## 2. 선행 문서

- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `AGENT\PM_AGENT\DECISIONS\020_todo_execution_plan_standard.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`

## 3. 포함 범위

- 활성화된 API-SPEC 문서와 완료 보관 문서 구분
- 수정 대상 우선순위 목록 작성
- 별도 TODO 문서가 필요하면 생성

## 4. 제외 범위

- BE 코드 변경
- API 계약 변경
- FE 코드 변경

## 5. 실행 지시

1. 아래 명령으로 API-SPEC 문서 목록을 확인한다.

```powershell
cd D:\workspace_repository\onehandsales
rg --files TODO | rg "COMMON[\\/]+API-SPEC[\\/]+.*\.md$"
```

2. `TODO\DONE` 보관 문서와 활성 TODO 문서를 구분한다.
3. 현재 production API와 직접 연결된 문서를 우선순위로 둔다.
4. 문서 대량 수정이 필요하면 별도 TODO 실행 문서를 만든다.
5. 이 Goal에서는 BE 코드를 수정하지 않는다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales
rg -n "API-SPEC|요청|응답|권한|에러|관측성|Transaction|Observability" TODO
git diff -- TODO
git diff -- BE
```

## 7. 완료 기준

- API-SPEC 템플릿 보강 대상과 제외 대상이 명확히 기록되어 있다.
- 후속 작업이 필요하면 별도 TODO 문서가 생성되어 있다.
- BE 코드 diff가 없다.
- 결과가 `TODO_LOG`에 기록되어 있다.

## 8. 완료 결과

- 전체 API-SPEC 문서 95개를 확인했고, 활성 TODO API-SPEC 3개와 `TODO/DONE` 보관 API-SPEC 92개를 구분했다.
- 활성 API-SPEC 중 `ERROR_REPORT_API.md`, `SUPPORT_REQUEST_API.md`, `README.md`를 우선 정규화 대상으로 판정했다.
- 보관 API-SPEC은 완료 이력이므로 G07에서 직접 수정하지 않고, production API 관련성 기준으로 후속 감사 인덱스 대상에 넣었다.
- 대량 문서 보강은 `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN`으로 분리했다.
- BE/FE 코드는 수정하지 않았다.
