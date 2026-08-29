# G01 활성 Service QA API-SPEC 정규화

상태: Next for `/goal`
성격: 문서 정규화
우선순위: P1

## 1. 목적

활성 TODO인 `SERVICE_QA_PLAN`의 API-SPEC 문서를 현재 Backend API-SPEC 템플릿 기준으로 정규화한다.

## 2. 선행 문서

- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\README.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\API_SPEC_AUDIT_RESULT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\PM_AGENT\DECISIONS\020_todo_execution_plan_standard.md`
- `AGENT\PM_AGENT\DECISIONS\022_goal_completion_review_todo_log.md`

## 3. 포함 범위

- `TODO\SERVICE_QA_PLAN\COMMON\API-SPEC\ERROR_REPORT_API.md`
- `TODO\SERVICE_QA_PLAN\COMMON\API-SPEC\SUPPORT_REQUEST_API.md`
- `TODO\SERVICE_QA_PLAN\COMMON\API-SPEC\README.md`

## 4. 제외 범위

- BE 코드 변경
- FE 코드 변경
- API path/method/request/response/error 의미 변경
- DB schema 변경
- `TODO/DONE` 보관 문서 수정

## 5. 실행 지시

1. 실제 Backend controller/application과 FE API client가 있는지 읽어서 문서가 현재 구현과 어긋나지 않는지 확인한다.
2. `ERROR_REPORT_API.md`에 누락된 템플릿 항목을 현재 구현 기준으로 보강한다.
   - API 이름
   - API 식별자
   - 계약 상태 `implemented` 여부
   - 소비자
   - 호환성
   - 권한
   - Request 이름
   - Response 이름
   - Error의 FE 처리와 log level
   - Transaction의 필요 여부, rollback 범위, 외부 Provider 위치
   - Observability의 `errorReport.created`, storage 실패 이벤트, redaction 기준
3. `SUPPORT_REQUEST_API.md`는 별도 `권한` 항목과 계약 상태 표기만 보강한다.
4. `README.md`에는 `SUPPORT_REQUEST_API.md`도 인덱스에 추가하고, README는 per-API 템플릿 감사 제외 문서임을 명시한다.
5. 모든 변경은 계약 의미 변경이 아니라 문서 템플릿 보강이어야 한다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales
rg -n "API 이름|API 식별자|소비자|호환성|Request 이름|Response 이름|권한|Transaction|Observability|FE/BE" TODO\SERVICE_QA_PLAN\COMMON\API-SPEC
git diff -- TODO\SERVICE_QA_PLAN\COMMON\API-SPEC
git diff -- BE FE
```

## 7. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\API_SPEC_TEMPLATE_NORMALIZATION\G01_ACTIVE_SERVICE_QA_API_SPEC_NORMALIZATION\WORK_LOG.md
```

## 8. 완료 기준

- 활성 Service QA API-SPEC의 per-API 문서가 템플릿 필수 항목을 갖는다.
- README 인덱스가 실제 API-SPEC 파일 목록과 맞는다.
- BE/FE 코드 diff가 없다.
- API 계약 의미 변경이 없음을 TODO_LOG에 기록했다.
