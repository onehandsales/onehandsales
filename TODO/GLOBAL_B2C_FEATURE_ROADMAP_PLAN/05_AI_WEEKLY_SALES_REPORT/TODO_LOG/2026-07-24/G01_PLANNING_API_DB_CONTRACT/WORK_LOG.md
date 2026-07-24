# G01 Planning API DB Contract Work Log

상태: Done
작성일: 2026-07-24
완료일: 2026-07-24

## 작업 내용

- 05 문서 구조를 04 Google Calendar Integration과 같은 실행 형태로 정리했다.
- `/goal` 작업 단위를 `COMMON/GOAL-SPECS` 기준으로 재구성했다.
- API spec, DB schema, FE TODO, business logic, user flow 문서를 04와 같은 루트 하위 폴더 구조로 모았다.
- G01 기준으로 `COMMON/SCOPE.md`, `COMMON/API-SPEC/*`, `COMMON/ARCHITECTURE-GUARDRAILS.md`, `COMMON/GOAL-COMPLETION-CHECKLIST.md`를 재검토했다.
- UX/UI 기준은 `AGENT/UXUI_AGENT`, backend/frontend/DB 기준은 `AGENT/SOFTWARE_AGENT` 문서를 참조했다.
- 현재 BE/FE 코드에서 03 주간 일정 보고서와 `/app/schedules/week` 구현 상태를 재확인했다.
- API/DB/business logic/goal spec 사이의 계약 불일치를 보정했다.

## 현재 코드 확인 결과

- Backend `ScheduleController`에는 `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`가 구현되어 있다.
- User Web router에는 `/app/schedules/week` route가 있고, `ScheduleWeekReportScreen`이 기존 주간 일정 보고서를 표시한다.
- `Schedule`, `MeetingNote`, `Deal`, `Contact` 구조는 05 AI input snapshot source로 사용할 수 있다.
- 05 신규 AI report/follow-up table, API, FE section은 아직 구현되어 있지 않으며 G02~G08의 구현 대상이다.
- User Web `apiClient`는 `/admin/api/*` 호출을 차단하므로 05는 User API `/api/*`만 사용한다.

## 문서 보정

- AI weekly report date 필드명을 `weekStart`로 통일했다.
- AI weekly report 생성 중복과 version 산정 기준을 `userId + weekStart + timeZone`으로 통일했다.
- `AiWeeklySalesReport` index SQL과 `COMMENT ON INDEX`를 timezone 포함 기준으로 맞췄다.
- G03 backend goal의 error code와 log event 이름을 API spec과 business logic 문서에 맞췄다.

## 검증

- `rg -n "Request 이름|Response 이름|CREATE TABLE|COMMENT ON|ExternalEmailOAuthState|GENERATING|FollowUpMessage" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `git diff --check`
- `rg -n "weekStartDate|AiWeeklyReportAlreadyGenerating|AiWeeklyReportWeekStartInvalid|AiWeeklyReportNotFound|AiWeeklySalesReportGenerationFailed|aiWeeklyReport\\." TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/BE-TODO TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/FE-TODO`

검증 결과:

- G01 지정 `rg` 검색은 request/response, SQL, `COMMENT ON`, OAuth state, `GENERATING`, `FollowUpMessage` 증거를 확인했다.
- stale 명칭 검색은 no match로 통과했다.
- `git diff --check`는 whitespace error 없이 통과했다. Windows line-ending 경고만 출력됐다.

## 비고

- G02~G09 구현 착수를 막는 미해결 질문은 없다.
