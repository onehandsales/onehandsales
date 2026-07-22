# Backend API TODO

상태: confirmed
최종 업데이트: 2026-07-22
정본 계약: `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`
아키텍처/주석 기준: `COMMON/ARCHITECTURE-GUARDRAILS.md`

## 0. Software Agent 기준

- Backend 구조는 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`를 따른다.
- API, transaction, observability, comment/logging은 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/*`를 따른다.
- DB와 timezone 기준은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/*`를 따른다.
- Global B2C 대조는 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 따른다.
- 이번 03은 `NBA-009 Schedule week report`만 confirmed API로 승격한다.
- `NBA-001`, `NBA-003`, `NBA-008`, `NBA-014` 등 다른 NBA 후보를 이번 03 구현에 섞지 않는다.
- 새 Backend class/interface에는 한국어 `// 역할 : ...` 주석을 붙인다.
- 새 HTTP controller method에는 한국어 `// API : ...` 주석을 붙인다.
- 새 내부 method/function에는 한국어 `// 기능 : ...` 주석을 붙인다.
- DB 관련 repository/projection method에는 조회 목적과 ownership 조건을 한글 `// 기능 : ...` 주석으로 남긴다.
- 이번 03에서 새 Prisma model, table, column, index, migration은 만들지 않는다.
- app-wide i18n, currency/phone/address global data model, product analytics event taxonomy, Pricing/Billing/Admin/Trust policy API는 만들지 않는다.

## 1. 이번 03에서 만들 API

| Method | Path | 식별자 | 목적 |
|---|---|---|---|
| `GET` | `/api/schedules/week` | `GetWeeklyScheduleReport` | 주간 일정 보고서 조회 |
| `GET` | `/api/schedules/week/export/xlsx` | `ExportWeeklyScheduleReportXlsx` | 주간 일정 보고서 Excel 다운로드 |

## 2. 이번 03에서 만들지 않는 API

| 제외 API | 처리 |
|---|---|
| `POST /api/schedules/week/export` | 현재 도메인별 xlsx export 관례와 맞지 않아 사용하지 않는다. `GET /api/schedules/week/export/xlsx`로 확정한다. |
| `/api/exports` | 범용 ExportJob 별도 사용자 결정/goal |
| `/api/exports/:exportJobId` | 범용 ExportJob 별도 사용자 결정/goal |
| `/api/exports/:exportJobId/download` | 범용 ExportJob 별도 사용자 결정/goal |
| `/api/schedules/recurring-rules` | 반복 일정 정식 모델 별도 사용자 결정/goal |
| Product analytics API/event taxonomy | Global B2C first-sale gate 별도 사용자 결정/goal |
| Pricing/Billing/Admin API | Global B2C first-sale gate 별도 사용자 결정/goal |

## 3. Backend 구현 작업

### Controller

- `ScheduleController`에 아래 route를 추가한다.
  - `@Get("week")`
  - `@Get("week/export/xlsx")`
- 두 route는 반드시 `@Get(":scheduleId")`보다 위에 선언한다.
- xlsx route는 기존 domain export와 같은 `@Res({ passthrough: true })`, `StreamableFile`, `createXlsxDownloadResponse` 패턴을 사용한다.

### DTO

- `GetWeeklyScheduleReportQueryDto`
  - `weekStart`: required, `YYYY-MM-DD`
  - `timeZone`: optional string
- `ExportWeeklyScheduleReportXlsxQueryDto`
  - `GetWeeklyScheduleReportQueryDto`와 동일해도 된다.
- validation 상세는 API spec을 따른다.

### Application Service

- `getWeeklyScheduleReport(currentUser, query)`를 추가한다.
- `exportWeeklyScheduleReportXlsx(currentUser, query)`를 추가한다.
- 공통 builder를 두어 조회 API와 xlsx API가 같은 보고서 데이터를 사용하게 한다.
- `weekStart`는 월요일만 허용한다.
- 일정 없는 날도 7개 day bucket에 포함한다.
- 다일 일정은 요청 timezone 기준 겹치는 모든 day bucket에 포함한다.
- active linked deal만 포함한다. `Deal.deletedAt IS NULL`.
- 다음 행동은 미완료/미삭제 중 `createdAt ASC`, `id ASC` 첫 항목이다.
- `Schedule.memo` 본문은 response/export/log에 넣지 않고 `hasMemo`만 계산한다.

### Repository

- 기존 `listSchedules` 응답을 확장하지 말고 report projection 전용 method를 추가한다.
- 권장 method:

```ts
listSchedulesForWeeklyReport(
  input: ListSchedulesForWeeklyReportInput
): Promise<WeeklyScheduleReportScheduleRecord[]>
```

- 조회 조건:
  - `Schedule.userId = currentUser.id`
  - `Schedule.startAt < rangeEndAt`
  - `Schedule.endAt > rangeStartAt`
  - linked `Deal.userId = currentUser.id`
  - linked `Deal.deletedAt IS NULL`
- `DealRepository`를 import하지 않는다. 필요한 read projection은 schedule repository의 Prisma query에서 relation select로 처리한다.

### Excel

- `ScheduleModule`에 `XlsxInfrastructureModule`을 import한다.
- `XlsxWorkbookWriter` port를 application service에 주입한다.
- sheet name은 `Weekly Schedules`다.
- 파일명은 `createTimestampedXlsxFileName("weekly_schedules")`를 사용한다.
- 서버에 파일을 저장하지 않는다.

## 4. Transaction

- `GET /api/schedules/week`: 없음. 조회 전용.
- `GET /api/schedules/week/export/xlsx`: 없음. 조회와 메모리 내 파일 생성만 수행한다.
- 외부 Provider 호출 없음.
- outbox 없음.
- audit log 없음.

## 5. Observability

| API | event key | logging |
|---|---|---|
| `GET /api/schedules/week` | `schedule.week_report.viewed` | count, weekStart, timeZone 중심 |
| `GET /api/schedules/week/export/xlsx` | `schedule.week_report.exported` | count, weekStart, timeZone, rowCount 중심 |

로그에 남기지 않는다.

- 일정 제목
- 장소
- 일정 메모 본문
- 딜명
- 딜 금액
- 회사명
- 담당자명
- 다음 행동 본문
- response body 전체
- xlsx row 전체

## 6. 에러

| 상황 | error code | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| `weekStart` 누락/형식 오류/실제 날짜 아님 | `ValidationError` | 400 |
| `weekStart`가 월요일이 아님 | `ValidationError` | 400 |
| invalid `timeZone` | `ValidationError` | 400 |
| Excel writer 실패 | `ScheduleWeekReportExportFailed` | 500 |

## 7. 테스트 기준

- 인증 없는 두 API는 401이다.
- invalid `weekStart`는 400이다.
- 월요일이 아닌 `weekStart`는 400이다.
- invalid `timeZone`은 400이다.
- 일정 없는 주도 7개 empty day를 반환한다.
- range overlap 일정이 포함된다.
- 주 경계 또는 날짜 경계를 걸치는 일정이 겹치는 day bucket에 표시된다.
- 타 사용자 일정/딜은 제외된다.
- deleted deal은 제외된다.
- distinct linked deal summary는 중복을 제거한다.
- 다음 행동은 미완료/미삭제 가장 오래된 항목이다.
- xlsx 응답 header와 filename이 기존 domain export와 일관된다.
- xlsx row에 ID/private memo/meeting note body가 없다.
- xlsx writer 실패는 안전한 500 error로 변환된다.
