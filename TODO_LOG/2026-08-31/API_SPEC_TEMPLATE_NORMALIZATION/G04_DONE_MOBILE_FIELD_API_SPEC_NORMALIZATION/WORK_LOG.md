# G04 Done Mobile Field API-SPEC Normalization Work Log

작업명: G04 완료 보관 Mobile Field API-SPEC 정규화
작업 일자: 2026-08-31
상태: 완료

## 1. 관련 계획과 Goal

- `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md`
- `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/DONE_API_SPEC_AUDIT_INDEX.md`
- `TODO/API_SPEC_TEMPLATE_NORMALIZATION_PLAN/COMMON/API_SPEC_AUDIT_RESULT.md`

## 2. 관련 AGENT/TODO 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/README.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/LOCAL_DRAFT_CONTRACT.md`

## 3. 예정 범위

- G02에서 `normalize-now-candidate`로 분류된 Mobile PWA field use 보관 API-SPEC 4개를 현재 Backend API-SPEC 템플릿 기준으로 제한 보강한다.
- 각 문서에서 HTTP API와 browser/local-only contract 경계를 명확히 한다.
- BE/FE 코드, DB schema, API path/method/request/response/error/transaction/observability 동작은 변경하지 않는다.
- `LOCAL_DRAFT_CONTRACT.md`는 서버 API 없음 경계 근거로만 확인하고 정규화 대상에서 제외한다.

## 4. 진행 기록

- 작업 시작 시 `git status --short --untracked-files=all` 결과 변경 없음.
- G04 goal, G02 감사 인덱스, API-SPEC/API-CONTRACT 규칙, TODO_LOG 규칙을 재확인했다.
- BusinessCard, MeetingNote STT, Analytics, Notification controller/DTO/application service와 User Web API client/type을 대조했다.
- `LOCAL_DRAFT_CONTRACT.md`는 IndexedDB/localStorage contract이며 서버 API 없음 문서로 유지한다고 판단했다.
- 대상 보관 API-SPEC 4개에 `API_SPEC_TEMPLATE_NORMALIZATION G04 보강` 섹션을 추가했다.
- 현재 구현과 다르던 보관 초안의 MeetingNote STT 필수 field 표기와 Notification settings/subscription response 예시를 current DTO 기준으로 정렬했다.

## 5. 적용 범위

- 템플릿 보강:
  - `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE_CONTRACT.md`
  - `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/MEETING_NOTE_MOBILE_RECORDING_STT_CONTRACT.md`
  - `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/MOBILE_FIELD_ANALYTICS_EVENT_CONTRACT.md`
  - `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/MOBILE_NOTIFICATION_PERMISSION_CONTRACT.md`
- 제외 유지:
  - `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/LOCAL_DRAFT_CONTRACT.md`

## 6. 검증 결과

- `rg -n "API 이름|API 식별자|계약 상태|소비자|호환성|권한|Request 이름|Response 이름|Transaction|Observability|FE/BE|서버 API 없음" TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC`: 통과
- `rg -l "API_SPEC_TEMPLATE_NORMALIZATION G04 보강" ...`: 포함 범위 4개 문서 모두 출력
- 상태 전환 stale pattern 검색: 출력 없음
- 포함 범위 4개 문서의 stale response/request field pattern 검색: 출력 없음
- `git diff -- TODO`: G04 대상 API-SPEC 4개, API_SPEC_TEMPLATE_NORMALIZATION_PLAN 상태 문서, `TODO/README.md` 변경만 확인
- `git diff -- BE FE`: 출력 없음. BE/FE 코드 diff 없음
- `git diff --check`: 통과
- `git status --short --untracked-files=all`: TODO 문서 변경과 G04 TODO_LOG 신규 파일만 확인

## 7. 검토 결과

- 포함 범위 4개 문서에 HTTP API와 browser/local-only contract 경계를 명확히 기록했다.
- HTTP API 문서에는 `계약 상태`, `소비자`, `호환성`, `권한`, `API 이름`, `API 식별자`, `Request 이름`, `Response 이름`, `Transaction`, `Observability`, `FE/BE 처리 기준`을 보강했다.
- `LOCAL_DRAFT_CONTRACT.md`는 서버 API 없음 계약으로 유지하고 per-HTTP API 템플릿 보강 대상에서 제외했다.
- MeetingNote STT의 `meetingLocalDateTime`, `companies`, `contacts` 필수 여부와 `MeetingNoteAiDraftResponse` 예시는 current BE/FE DTO 기준으로 정렬했다.
- Notification settings/subscription request/response 예시는 current 02 Notification API와 BE/FE DTO 기준으로 정렬했다.
- API path, method, runtime request/response/error/transaction/observability 동작과 BE/FE 코드는 변경하지 않았다.

## 8. 남은 리스크 또는 보류 사항

- G05 Admin Operation API-SPEC 후보 9개 정규화가 남아 있다.
- G06 `DOMAIN_GLOBAL_DATA_API.md` 복합 계약 matrix 보강이 남아 있다.
- G99 최종 검토 전까지 전체 API 계약 의미 변경 없음과 BE/FE 코드 diff 없음 확인을 반복해야 한다.
- G04 문서는 현재 구현 기준으로 보관 문서를 정렬했다. 향후 BE/FE DTO가 바뀌면 해당 API-SPEC도 함께 갱신해야 한다.

## 9. 다음 권장 작업

- `G05-DONE-ADMIN-OPERATION-API-SPEC-NORMALIZATION.goal.md` 실행

## 10. 전체 작업 진행 현황

- G01: Completed 2026-08-31
- G02: Completed 2026-08-31
- G03: Completed 2026-08-31
- G04: Completed 2026-08-31
- G05: Next
- G06: Ready after G05
- G99: Ready after G01-G06
