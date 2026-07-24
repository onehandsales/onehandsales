# G01 Planning API DB Contract

상태: Done
완료일: 2026-07-24

## 1. 목적

05 AI Weekly Sales Report 구현 전에 문서 계약과 현재 코드가 충돌하지 않는지 최종 확인한다.

## 2. 선행 조건

- `COMMON/SCOPE.md` 상태가 `Confirmed`다.
- `COMMON/API-SPEC/*` 상태가 `confirmed`다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽고 따른다.
- Backend/DB/Frontend 구조는 `AGENT/SOFTWARE_AGENT` 기준을 따른다.
- UX/UI와 문구는 `AGENT/UXUI_AGENT` 기준을 따른다.

## 3. 포함 범위

- 05 문서 계약 검토
- 현재 Schedule/Weekly Report/MeetingNote/Deal/Contact/User Web 구조 재확인
- API request/response shape와 FE 타입 변경 필요성 점검
- DB migration scope 점검
- blocking 질문 여부 확인
- 문서 간 충돌이 있으면 문서 보정

## 4. 제외 범위

- Backend 코드 구현
- Frontend 코드 구현
- Prisma migration 생성
- 실제 AI/email/SMS provider smoke test
- provider 운영 console 설정

## 5. 확인해야 할 현재 코드 사실

- 03 Weekly Schedule Report는 완료 상태이며 `/app/schedules/week`와 `GET /api/schedules/week`를 05에서 다시 만들지 않는다.
- 05-A는 기존 week data 위에 AI report section과 API를 추가한다.
- 05-B는 05-A의 `FOLLOW_UP` suggestion을 기반으로 compose/send를 추가한다.
- User Web은 `/admin/api/*`를 호출하지 않아야 한다.
- provider env가 없으면 adapter test double로 자동 테스트를 닫는다.

## 6. 검토 체크

- `COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`가 모든 05-A request/response/business logic을 담고 있는가?
- `COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`가 모든 05-B request/response/business logic을 담고 있는가?
- `BE-TODO/AI_WEEKLY_REPORT_DB-SCHEMA.md`와 `BE-TODO/FOLLOW_UP_DELIVERY_DB-SCHEMA.md`에 SQL과 `COMMENT ON`이 있는가?
- `COMMON/AI_WEEKLY_REPORT_USER-FLOW.md`와 `COMMON/FOLLOW_UP_DELIVERY_USER-FLOW.md`가 유저 플로우를 설명하는가?
- report version, 실패 version, 삭제/숨김 불가 정책이 명시되어 있는가?
- full input snapshot 저장과 snapshot summary 노출 정책이 명시되어 있는가?
- OAuth callback state 검증, SMS 인증, 발송 로그 영구 보관이 명시되어 있는가?
- provider 호출 transaction 밖 원칙과 redaction 원칙이 명시되어 있는가?
- G02~G09 구현 착수를 막는 질문이 없는가?

## 7. 검증 명령

문서 검토 goal이므로 build/test는 필수 아님. 파일 구조와 검색 검증을 수행한다.

```powershell
rg -n "Request 이름|Response 이름|CREATE TABLE|COMMENT ON|ExternalEmailOAuthState|GENERATING|FollowUpMessage" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT
git diff --check
```

## 8. 완료 기준

- G02~G09 구현 착수를 막는 미해결 질문이 없다.
- 문서 간 API path, enum, 상태명, error code가 일치한다.
- 현재 코드와 충돌하는 부분은 "구현해야 할 변경"으로 문서에 명시되어 있다.
- 필요한 문서 보정이 끝났다.

## 9. 작업 로그 경로

- `TODO_LOG/2026-07-24/G01_PLANNING_API_DB_CONTRACT/WORK_LOG.md`

## 10. 완료 결과

### 참조한 기준 문서

- `AGENT/UXUI_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

### 현재 코드 대조 결과

- Backend에는 03 주간 일정 보고서 `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`가 이미 구현되어 있다.
- User Web에는 `/app/schedules/week` route와 `ScheduleWeekReportScreen`이 이미 구현되어 있다.
- 현재 Schedule, MeetingNote, Deal, Contact 구조는 05 AI input snapshot의 source로 사용할 수 있다.
- 05-A `AiWeeklySalesReport`, `AiWeeklySalesReportSuggestion`, `AiJob`, `AiProviderCallLog`와 05-B follow-up table/API는 아직 구현되어 있지 않으며 G02~G08 범위다.
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`에는 `/app/schedules/week` redirect로 남은 stale 설명이 있으나, 실제 코드와 03 완료 문서 기준으로는 `/app/schedules/week`가 구현 완료 상태다.
- User Web API client는 `/admin/api/*` 호출을 차단하므로 05도 User API `/api/*`로만 연결한다.

### 문서 보정 결과

- AI weekly report 필드명을 `weekStart`로 통일했다.
- 동일 주 생성/버전 기준을 `userId + weekStart + timeZone`으로 통일했다.
- G03 backend goal의 error code와 observability event 이름을 API spec과 business logic 문서에 맞췄다.

### 검증 결과

- G01 지정 `rg` 검색으로 request/response, SQL, `COMMENT ON`, OAuth state, `GENERATING`, `FollowUpMessage` 문서 증거를 확인했다.
- stale 명칭 검색에서 legacy date/error/event 명칭 잔존 항목이 없음을 확인했다.
- `git diff --check`는 whitespace error 없이 통과했다. Windows line-ending 경고만 출력됐다.

### Blocking 질문

- G02~G09 구현 착수를 막는 미해결 질문은 없다.
