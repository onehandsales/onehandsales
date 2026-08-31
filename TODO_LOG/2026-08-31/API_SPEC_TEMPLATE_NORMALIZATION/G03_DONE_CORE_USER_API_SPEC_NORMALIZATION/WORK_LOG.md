# G03 Done Core/User API-SPEC Normalization Work Log

작업명: G03 완료 보관 Core/User API-SPEC 정규화
작업 일자: 2026-08-31
상태: 완료

## 1. 관련 계획과 Goal

- `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md`
- `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/DONE_API_SPEC_AUDIT_INDEX.md`
- `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/API_SPEC_AUDIT_RESULT.md`

## 2. 관련 AGENT/TODO 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 3. 예정 범위

- G02에서 `normalize-now-candidate`로 분류된 Core/User 보관 API-SPEC 9개를 현재 Backend API-SPEC 템플릿 기준으로 제한 보강한다.
- `DOMAIN_GLOBAL_DATA_API.md`는 core domain 문서 흡수 또는 별도 G06 분리 여부를 판단한다.
- BE/FE 코드, DB schema, API path/method/request/response/error 의미는 변경하지 않는다.

## 4. 진행 기록

- 작업 시작 시 `git status --short --untracked-files=all` 결과 변경 없음.
- G03 goal, G02 감사 인덱스, API-SPEC/API-CONTRACT 규칙, TODO_LOG 규칙을 재확인했다.
- BusinessCard, Contact, Product, Deal, Import Template, Meeting Note controller/application service와 User Web API client/type을 대조했다.
- Core/User 보관 API-SPEC 후보 9개 중 6개는 템플릿 보강, 3개 개요 문서는 `archive-reference-only`로 판단했다.
- `DOMAIN_GLOBAL_DATA_API.md`는 Product/Deal/Contact/Company 복합 계약이므로 G03에 흡수하지 않고 별도 G06으로 분리했다.

## 5. 적용 범위

- 템플릿 보강:
  - `TODO/DONE/BUSINESS_CARD_OCR_PLAN/COMMON/API-SPEC/BUSINESS_CARD_OCR_API.md`
  - `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
  - `TODO/DONE/IMPORT_TEMPLATE_PLAN/COMMON/API-SPEC/IMPORT_TEMPLATE_API.md`
  - `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
  - `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/API-SPEC/MEETING_NOTE_AI_DRAFT_LOG_API.md`
  - `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/API-SPEC/MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md`
- `archive-reference-only` 판단:
  - `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
  - `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
  - `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- G06 분리:
  - `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/DOMAIN_GLOBAL_DATA_API.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G06-DONE-DOMAIN-GLOBAL-DATA-API-SPEC-NORMALIZATION.goal.md`
- 관련 계획 문서:
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/README.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/README.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/GOAL-WORK-ORDER.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/API_SPEC_AUDIT_RESULT.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/DONE_API_SPEC_AUDIT_INDEX.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G99-FINAL-REVIEW.goal.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/BE-TODO/README.md`
  - `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/FE-TODO/README.md`
  - `TODO/README.md`

## 6. 검증 결과

- `rg -n "API 이름|API 식별자|계약 상태|소비자|호환성|권한|Request 이름|Response 이름|Transaction|Observability|FE/BE|DOMAIN_GLOBAL_DATA_API" ...`: 통과
- `git diff -- BE FE`: 출력 없음. BE/FE 코드 diff 없음
- `git diff --check`: 통과
- `git status --short --untracked-files=all`: TODO 문서 변경과 G06/TODO_LOG 신규 파일만 확인

## 7. 검토 결과

- G03 포함 범위의 보관 API-SPEC 문서에는 템플릿 보강 또는 `archive-reference-only` 판단이 기록됐다.
- API path, method, request, response, error, transaction, observability 의미는 변경하지 않았다.
- BE/FE 코드는 수정하지 않았다.
- `DOMAIN_GLOBAL_DATA_API.md` 후속 처리 판단은 별도 G06 분리로 기록했다.

## 8. 남은 리스크 또는 보류 사항

- G04 Mobile Field API-SPEC 후보 4개 정규화가 남아 있다.
- G05 Admin Operation API-SPEC 후보 9개 정규화가 남아 있다.
- G06 `DOMAIN_GLOBAL_DATA_API.md` 복합 계약 matrix 보강이 남아 있다.
- G99 최종 검토 전까지 전체 API 계약 의미 변경 없음과 BE/FE 코드 diff 없음 확인을 반복해야 한다.

## 9. 다음 권장 작업

- `G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md` 실행

## 10. 전체 작업 진행 현황

- G01: Completed 2026-08-31
- G02: Completed 2026-08-31
- G03: Completed 2026-08-31
- G04: Next
- G05: Ready after G04
- G06: Ready after G05
- G99: Ready after G01-G06
