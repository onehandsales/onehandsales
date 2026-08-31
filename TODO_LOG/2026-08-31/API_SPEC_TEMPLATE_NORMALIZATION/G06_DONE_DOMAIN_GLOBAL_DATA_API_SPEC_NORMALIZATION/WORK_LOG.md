# G06 Domain Global Data API-SPEC Normalization Work Log

작업 일자: 2026-08-31
상태: 완료

## 관련 계획과 Goal

- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G06-DONE-DOMAIN-GLOBAL-DATA-API-SPEC-NORMALIZATION.goal.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/DONE_API_SPEC_AUDIT_INDEX.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/GOAL-WORK-ORDER.md`

## 관련 규칙

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 예정 범위

- `DOMAIN_GLOBAL_DATA_API.md`를 current Product/Deal/Contact/Company BE/FE 구현 기준으로 제한 정규화한다.
- Product/Deal currency, Contact global phone, Company region/address request/response matrix를 보강한다.
- BE controller/DTO/application service, User Web API client/type, Prisma schema를 대조한다.
- API 계약 의미와 runtime 동작을 바꾸지 않는다.

## 제외 범위

- BE 코드 변경
- FE 코드 변경
- API path, method, request, response, error code, transaction, observability 의미 변경
- DB schema 변경
- G04 Mobile Field 문서
- G05 Admin Operation 문서

## 진행 기록

- 2026-08-31: G06 목표 문서와 Backend API-SPEC/API-CONTRACT/TRANSACTION/OBSERVABILITY 규칙을 확인했다.
- 2026-08-31: `DOMAIN_GLOBAL_DATA_API.md`의 기존 G03 수동 판단 섹션과 current BE/FE 구현 근거를 대조했다.
- 2026-08-31: Product/Deal/Contact/Company controller, DTO, application service, User Web API client/type, Prisma schema를 대조했다.
- 2026-08-31: `DOMAIN_GLOBAL_DATA_API.md`에 Product/Deal currency, Contact global phone, Company region/address matrix와 Error/FE 처리/log level, Transaction, Observability 기준을 보강했다.
- 2026-08-31: 관련 계획 문서와 인덱스를 G06 완료 상태로 갱신했고, 이후 G99 최종 검토까지 완료했다.

## 적용 범위

- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/DOMAIN_GLOBAL_DATA_API.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/README.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/README.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/README.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/API_SPEC_AUDIT_RESULT.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/DONE_API_SPEC_AUDIT_INDEX.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G06-DONE-DOMAIN-GLOBAL-DATA-API-SPEC-NORMALIZATION.goal.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G99-FINAL-REVIEW.goal.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/BE-TODO/README.md`
- `TODO/DONE/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/FE-TODO/README.md`
- `TODO/README.md`

## 검증 결과

- `rg -n "API 이름|API 식별자|계약 상태|소비자|호환성|권한|Request 이름|Response 이름|Transaction|Observability|FE/BE|currencyCode|phoneCountryCode|regionCode|address" TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/DOMAIN_GLOBAL_DATA_API.md`: template 필수 키워드와 global data field 보강 확인
- `git diff -- TODO`: G06 대상 문서와 관련 계획 문서 diff 확인
- `git diff -- BE FE`: 출력 없음
- `git diff --check`: 통과
- stale 상태 검색(이전 G06 대기/준비 문구와 G06 다음 실행 포인터): 출력 없음

## 검토 결과

- G06 대상 문서는 current BE/FE 구현과 어긋나지 않게 정규화되어 있다.
- API path, method, runtime request/response/error, transaction, observability 의미 변경은 없다.
- BE/FE 코드 diff는 없다.

## 남은 리스크 또는 보류 사항

- 문서 정규화 최종 일관성 검토는 G99에서 수행한다.

## 다음 권장 작업

- `G99-FINAL-REVIEW.goal.md`를 실행한다.

## 전체 작업 진행 현황

- G01 활성 Service QA API-SPEC 정규화: 완료
- G02 보관 API-SPEC 감사 인덱스 작성: 완료
- G03 보관 Core/User API-SPEC 정규화: 완료
- G04 보관 Mobile Field API-SPEC 정규화: 완료
- G05 보관 Admin Operation API-SPEC 정규화: 완료
- G06 Domain Global Data 복합 API-SPEC 정규화: 완료
- G99 최종 검토: 다음 실행 대상
