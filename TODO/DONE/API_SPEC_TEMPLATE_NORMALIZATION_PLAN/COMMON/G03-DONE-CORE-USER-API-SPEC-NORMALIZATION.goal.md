# G03 완료 보관 Core/User API-SPEC 정규화

상태: Completed 2026-08-31
성격: 문서 정규화
우선순위: P1

## 1. 목적

G02 감사 인덱스에서 `normalize-now-candidate`로 분류된 Core/User API 보관 문서를 현재 Backend API-SPEC 템플릿 기준으로 제한 정규화한다.

## 2. 선행 문서

- `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\DONE_API_SPEC_AUDIT_INDEX.md`
- `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\API_SPEC_AUDIT_RESULT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\PM_AGENT\DECISIONS\022_goal_completion_review_todo_log.md`

## 3. 포함 범위

정규화 후보:

- `TODO/DONE/BUSINESS_CARD_OCR_PLAN/COMMON/API-SPEC/BUSINESS_CARD_OCR_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/IMPORT_TEMPLATE_PLAN/COMMON/API-SPEC/IMPORT_TEMPLATE_API.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/API-SPEC/MEETING_NOTE_AI_DRAFT_LOG_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/API-SPEC/MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md`

수동 판단 범위:

- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/DOMAIN_GLOBAL_DATA_API.md`

## 4. 제외 범위

- BE 코드 변경
- FE 코드 변경
- API 계약 의미 변경
- DB schema 변경
- G04 mobile field 문서
- G05 Admin Operation 문서

## 5. 실행 지시

1. 각 문서가 참조하는 현재 Backend controller/application과 FE API client 또는 사용 흐름을 확인한다.
2. 누락된 템플릿 항목만 보강한다.
   - API 이름
   - API 식별자
   - 계약 상태
   - 소비자
   - 호환성
   - 인증/권한
   - Request/Response 이름
   - Error FE 처리/log level
   - Transaction
   - Observability
   - FE/BE 처리 기준
3. 중복된 과거 문서가 더 최신 상세 문서로 대체되는 경우, 원문 삭제 대신 `archive-reference-only` 판단을 문서에 명시한다.
4. 수동 판단 범위인 `DOMAIN_GLOBAL_DATA_API.md`를 core domain 문서에 흡수할지 별도 G06으로 분리할지 판단한다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales
rg -n "API 이름|API 식별자|계약 상태|소비자|호환성|권한|Request 이름|Response 이름|Transaction|Observability|FE/BE|DOMAIN_GLOBAL_DATA_API" TODO\DONE\BUSINESS_CARD_OCR_PLAN TODO\DONE\CONTACT_DOMAIN_PLAN TODO\DONE\DEAL_DOMAIN_PLAN TODO\DONE\PRODUCT_DOMAIN_PLAN TODO\DONE\IMPORT_TEMPLATE_PLAN TODO\DONE\MEETING_NOTE_AI_STT_PLAN TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\07_MEETING_NOTE_AI_PROVIDER_LOG TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\08_GLOBAL_DATA_I18N\COMMON\API-SPEC\DOMAIN_GLOBAL_DATA_API.md
git diff -- TODO
git diff -- BE FE
git diff --check
```

## 7. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\API_SPEC_TEMPLATE_NORMALIZATION\G03_DONE_CORE_USER_API_SPEC_NORMALIZATION\WORK_LOG.md
```

## 8. 완료 기준

- 포함 범위 문서의 템플릿 보강 또는 archive-reference-only 판단이 기록되어 있다.
- API 계약 의미 변경이 없다.
- BE/FE 코드 diff가 없다.
- `DOMAIN_GLOBAL_DATA_API.md` 후속 처리 판단이 기록되어 있다.
- 결과와 남은 리스크가 TODO_LOG에 기록되어 있다.

## 9. 완료 결과

- 템플릿 보강: `BUSINESS_CARD_OCR_API.md`, `DEAL_API_DETAIL.md`, `IMPORT_TEMPLATE_API.md`, `MEETING_NOTE_AI_STT_API.md`, `MEETING_NOTE_AI_DRAFT_LOG_API.md`, `MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md`
- `archive-reference-only` 판단: `CONTACT_API.md`, `DEAL_API.md`, `PRODUCT_API.md`
- 수동 판단: `DOMAIN_GLOBAL_DATA_API.md`는 core domain 문서에 흡수하지 않고 `G06-DONE-DOMAIN-GLOBAL-DATA-API-SPEC-NORMALIZATION.goal.md`로 분리했다.
- BE/FE 코드는 수정하지 않았고 API 계약 의미를 변경하지 않았다.
