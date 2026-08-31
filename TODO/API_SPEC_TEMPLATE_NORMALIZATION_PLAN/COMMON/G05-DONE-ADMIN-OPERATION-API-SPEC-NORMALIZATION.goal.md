# G05 완료 보관 Admin Operation API-SPEC 정규화

상태: Next
성격: 문서 정규화
우선순위: P1

## 1. 목적

G02 감사 인덱스에서 `normalize-now-candidate`로 분류된 Admin Operation 보관 API-SPEC 문서를 현재 Backend API-SPEC 템플릿 기준으로 제한 정규화한다.

## 2. 선행 문서

- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\DONE_API_SPEC_AUDIT_INDEX.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\OBSERVABILITY.md`
- `AGENT\PM_AGENT\DECISIONS\022_goal_completion_review_todo_log.md`

## 3. 포함 범위

- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ACCOUNT_DATA_REQUEST_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_ANALYTICS_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_AUDIT_SECURITY_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_DOMAIN_READONLY_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_PROVIDER_FAILURE_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_SYSTEM_OPERATION_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_TRASH_OPERATION_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_USER_OPERATION_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/TRASH_USER_RECOVERY_API.md`

## 4. 제외 범위

- BE 코드 변경
- FE 코드 변경
- API 계약 의미 변경
- DB schema 변경
- Admin 신규 기능
- 민감정보 원문 응답 shape 변경

## 5. 실행 지시

1. Admin/User API prefix, Admin 권한, 민감정보 masking, audit log, observability 계약을 현재 구현 기준으로 확인한다.
2. 누락된 템플릿 항목만 보강한다.
3. User API와 Admin API가 한 문서에 함께 있는 경우 prefix와 소비자를 명확히 분리한다.
4. 민감정보 원문 조회, account data request, trash recovery 문서는 error FE 처리와 audit/log level을 명확히 적는다.
5. API 계약 의미와 구현 코드는 바꾸지 않는다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales
rg -n "API 이름|API 식별자|계약 상태|소비자|호환성|권한|Request 이름|Response 이름|Transaction|Observability|FE/BE|audit|masking|민감" TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\11_ADMIN_OPERATION\COMMON\API-SPEC
git diff -- TODO
git diff -- BE FE
git diff --check
```

## 7. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\API_SPEC_TEMPLATE_NORMALIZATION\G05_DONE_ADMIN_OPERATION_API_SPEC_NORMALIZATION\WORK_LOG.md
```

## 8. 완료 기준

- 포함 범위 문서의 템플릿 보강 또는 archive-reference-only 판단이 기록되어 있다.
- Admin/User API 경계와 민감정보/audit/observability 계약이 명확하다.
- API 계약 의미 변경이 없다.
- BE/FE 코드 diff가 없다.
- 결과와 남은 리스크가 TODO_LOG에 기록되어 있다.
