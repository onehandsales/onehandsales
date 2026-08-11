# Final Service Follow-up Audit

상태: Closed / 03 추가 후속 구현 없음
검토일: 2026-08-04

## 1. 결론

`03_WEEKLY_SCHEDULE_REPORT`는 최종 서비스 형태 기준으로 다시 대조해도 추가 구현할 후속 작업이 없다.

03의 완료 범위는 기본 주간 일정 보고서 화면, `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`, 동기식 Excel 다운로드, timezone/weekStart 처리, linked deal summary, 보안 redaction이다. 이후 `04_GOOGLE_CALENDAR_INTEGRATION`과 `08_GLOBAL_DATA_I18N`에서 상위 문서에 추가로 반영된 Google-origin schedule source/meeting URL, currency-aware weekly report도 실제 BE/FE 코드에 반영되어 있다.

## 2. 대조 기준

- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`
- 실제 구현 상태: `BE`, `FE/user-web`

## 3. 실제 구현 확인

Backend:

- `BE/src/modules/schedule/presentation/http/schedule.controller.ts`에 `@Get("week/export/xlsx")`, `@Get("week")`가 `@Get(":scheduleId")`보다 먼저 선언되어 있다.
- `BE/src/modules/schedule/application/services/schedule-application.service.ts`에 `getWeeklyScheduleReport`, `exportWeeklyScheduleReportXlsx`, timezone range 계산, Monday `weekStart` 검증, 7일 day bucket, linked deal summary, xlsx row 변환이 구현되어 있다.
- `BE/src/modules/schedule/infrastructure/persistence/prisma-schedule.repository.ts`에 weekly report 전용 projection이 있으며 기존 `Schedule`, `ScheduleDeal`, `Deal`, `Company`, `Contact`, `DealFollowingActionLog`를 runtime aggregation으로 사용한다.
- Google-origin active schedule의 `sourceType`, `googleCalendar`, `meetingUrl`과 Deal `currencyCode`가 weekly report projection/response/xlsx에 반영되어 있다.

User Web:

- `FE/user-web/src/app/router/router.tsx`에 `/app/schedules/week` route와 legacy `/schedules/week` redirect가 있다.
- `FE/user-web/src/features/schedule/api/schedule-api.ts`가 `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`를 호출한다.
- `FE/user-web/src/features/schedule/components/schedule-week-report-screen.tsx`가 week navigation, loading/empty/error/export error, Excel download, linked deal, Google source badge, meeting URL, currency-aware display를 표시한다.
- `FE/user-web/tests/e2e/weekly-schedule-report-ux.spec.ts`가 route, query update, xlsx download request를 검증한다.

## 4. 03 후속으로 보지 않는 항목

| 항목 | 판단 |
|---|---|
| AI/고급 주간 영업 리포트 | 03 미완료가 아니라 `05_AI_WEEKLY_SALES_REPORT` 또는 post-12 고급 리포트 후보 |
| PDF export | 03에서 제외한 별도 Export 확장 |
| 범용 ExportJob | 03에서 제외한 대량/비동기 export 운영 범위 |
| 반복 일정 정식 모델 | 03과 04에서 제외한 별도 calendar model 후보 |
| Google Calendar export/write/realtime webhook/watch | 04 완료 범위를 넘어서는 별도 Google Calendar 확장 |
| 회의록 follow-up 알림/자동 발송 | 02/07 완료 범위를 넘어서는 별도 retention/notification 확장 |
| 추가 국가/통화/provider, `/app` locale prefix | 08 완료 범위를 넘어서는 별도 global follow-up |

## 5. 검증 결과

- `cd BE; pnpm.cmd test -- schedule`: 통과, 11 suites / 56 tests.
- `cd FE/user-web; pnpm.cmd test:e2e -- tests/e2e/weekly-schedule-report-ux.spec.ts`: 통과, 1 test.

## 6. 문서 판단

`NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`에 문서화되어 있으나 03 초기 문서에 없던 Google-origin source/meeting URL, currency-aware weekly report는 이미 04/08 후속 구현으로 실제 코드에 반영되어 있다. 따라서 03 폴더를 다시 열어 작업할 항목은 없다.

남는 항목은 기존 완료 폴더를 재개하지 않고, 로드맵 DONE 이후 새 TODO 폴더로 승격할지 판단한다.
