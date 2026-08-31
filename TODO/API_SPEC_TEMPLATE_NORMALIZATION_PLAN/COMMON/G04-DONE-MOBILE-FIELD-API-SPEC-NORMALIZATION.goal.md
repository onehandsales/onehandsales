# G04 완료 보관 Mobile Field API-SPEC 정규화

상태: Ready after G03
성격: 문서 정규화
우선순위: P1

## 1. 목적

G02 감사 인덱스에서 `normalize-now-candidate`로 분류된 Mobile PWA field use 보관 문서를 현재 API-SPEC 템플릿 기준으로 제한 정규화한다.

## 2. 선행 문서

- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\DONE_API_SPEC_AUDIT_INDEX.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\PM_AGENT\DECISIONS\022_goal_completion_review_todo_log.md`

## 3. 포함 범위

- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE_CONTRACT.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/MEETING_NOTE_MOBILE_RECORDING_STT_CONTRACT.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/MOBILE_FIELD_ANALYTICS_EVENT_CONTRACT.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/MOBILE_NOTIFICATION_PERMISSION_CONTRACT.md`

## 4. 제외 범위

- BE 코드 변경
- FE 코드 변경
- API 계약 의미 변경
- DB schema 변경
- `LOCAL_DRAFT_CONTRACT.md` 서버 API 생성 또는 정규화
- G05 Admin Operation 문서

## 5. 실행 지시

1. mobile field 문서가 실제 HTTP API 계약인지, FE local/browser contract인지 먼저 분리한다.
2. HTTP API와 연결되는 문서는 템플릿 필수 항목을 현재 구현 기준으로 보강한다.
3. local/browser-only contract는 서버 API가 아님을 명확히 기록하고 per-HTTP API 템플릿 보강 대상에서 제외한다.
4. Mobile UX 계약을 바꾸지 않고 문서 구조와 누락 항목만 보강한다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales
rg -n "API 이름|API 식별자|계약 상태|소비자|호환성|권한|Request 이름|Response 이름|Transaction|Observability|FE/BE|서버 API 없음" TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE\COMMON\API-SPEC
git diff -- TODO
git diff -- BE FE
git diff --check
```

## 7. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\API_SPEC_TEMPLATE_NORMALIZATION\G04_DONE_MOBILE_FIELD_API_SPEC_NORMALIZATION\WORK_LOG.md
```

## 8. 완료 기준

- 포함 범위 문서의 API/비API 경계가 명확하다.
- HTTP API 문서는 템플릿 필수 항목을 갖는다.
- API 계약 의미 변경이 없다.
- BE/FE 코드 diff가 없다.
- 결과와 남은 리스크가 TODO_LOG에 기록되어 있다.
