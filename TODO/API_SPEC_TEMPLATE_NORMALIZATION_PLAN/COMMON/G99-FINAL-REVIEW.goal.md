# G99 API-SPEC 정규화 최종 검토

상태: Ready after G01-G05
성격: 최종 검토
우선순위: 필수

## 1. 목적

API-SPEC 템플릿 정규화 작업이 문서 범위를 벗어나지 않았고, API 계약 의미와 BE/FE 코드가 변경되지 않았음을 최종 확인한다.

## 2. 선행 문서

- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\README.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\API_SPEC_AUDIT_RESULT.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\DONE_API_SPEC_AUDIT_INDEX.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\GOAL-WORK-ORDER.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G05-DONE-ADMIN-OPERATION-API-SPEC-NORMALIZATION.goal.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- 각 Goal의 `TODO_LOG`

## 3. 포함 범위

- 활성 API-SPEC 정규화 결과 확인
- 보관 API-SPEC 감사 인덱스 확인
- G03 Core/User 보관 API-SPEC 정규화 결과 확인
- G04 Mobile Field 보관 API-SPEC 정규화 결과 확인
- G05 Admin Operation 보관 API-SPEC 정규화 결과 확인
- BE/FE 코드 diff 없음 확인
- API 계약 의미 변경 없음 확인
- TODO_LOG 완료 상태 확인

## 4. 제외 범위

- 신규 API 구현
- BE/FE 코드 수정
- DB schema 변경
- 완료 보관 문서 대량 보강

## 5. 검증

```powershell
cd D:\workspace_repository\onehandsales
rg -n "API 이름|API 식별자|소비자|호환성|권한|Request 이름|Response 이름|Transaction|Observability|FE/BE" TODO\SERVICE_QA_PLAN\COMMON\API-SPEC
rg -n "normalize-now-candidate|index-only|no-api-contract|archive-reference-only|needs-manual-review|G03-DONE|G04-DONE|G05-DONE" TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\DONE_API_SPEC_AUDIT_INDEX.md
rg -n "상태: Completed|G03 Next|Ready after G04|Ready after G01-G05" TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON
git diff -- TODO
git diff -- BE FE
git status --short
```

## 6. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\API_SPEC_TEMPLATE_NORMALIZATION\G99_FINAL_REVIEW\WORK_LOG.md
```

## 7. 완료 기준

- G01-G05 완료 여부가 확인되어 있다.
- API 계약 의미 변경이 없다.
- BE/FE 코드 diff가 없다.
- 남은 API-SPEC 정규화 리스크가 명확히 기록되어 있다.
