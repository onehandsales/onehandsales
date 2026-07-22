# G02 Backend Weekly Report Xlsx Export

상태: Done

## 1. 목적

주간 일정 보고서를 Excel 파일로 즉시 다운로드할 수 있도록 `GET /api/schedules/week/export/xlsx`를 구현한다.

## 2. 선행 조건

- G01 Backend Weekly Report API가 완료되어 report builder를 재사용할 수 있다.
- `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md` 계약 상태가 `confirmed`다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽고 따른다.
- `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 먼저 읽고 따른다.
- Backend/DB 구조는 `AGENT/SOFTWARE_AGENT` 기준을 따른다.
- 새 데이터베이스, 새 Prisma model, 새 table, 새 column, 새 index, 새 migration은 만들지 않는다.

## 3. 포함 범위

- `GET /api/schedules/week/export/xlsx`
- `ExportWeeklyScheduleReportXlsxQueryDto`
- `ScheduleModule`의 `XlsxInfrastructureModule` import
- `XlsxWorkbookWriter` port 주입
- weekly report response를 Excel row로 변환
- xlsx binary response
- `createTimestampedXlsxFileName("weekly_schedules")`
- `createXlsxDownloadResponse` 사용
- Excel writer 실패 error 변환
- structured log `schedule.week_report.exported`
- Backend unit/controller test

## 4. 제외 범위

- `/api/exports`
- `ExportJob`
- 파일 저장
- TTL
- 다운로드 재조회 endpoint
- PDF
- 민감정보 포함 export
- `/app/export`
- User Web 다운로드 버튼 연결

## 5. Backend 구조 기준

- xlsx route는 `@Get("week/export/xlsx")`로 둔다.
- route는 `@Get(":scheduleId")`보다 위에 둔다.
- 기존 company/contact/product/deal export의 `StreamableFile` 패턴을 따른다.
- Excel 생성은 application service에서 `XlsxWorkbookWriter` port로 수행한다.
- Excel writer adapter를 직접 controller에서 호출하지 않는다.
- report builder는 G01과 공유한다.
- 새 Backend class/interface에는 한국어 `// 역할 : ...` 주석을 붙인다.
- 새 HTTP controller method에는 한국어 `// API : ...` 주석을 붙인다.
- 새 내부 method/function에는 한국어 `// 기능 : ...` 주석을 붙인다.

## 5A. DB 변경 금지와 주석 기준

- 이번 G02는 기존 DB 조회 결과를 Excel row로 변환하고 파일을 즉시 반환한다.
- xlsx 파일을 서버에 저장하지 않는다.
- `ExportJob`, `ExportJobFile`, `ExportJobFilter`를 만들지 않는다.
- Prisma schema와 migration 파일을 수정하지 않는다.
- `pnpm run prisma:migrate`와 seed를 실행하지 않는다.
- 새 DB 구조가 필요하다고 판단되면 구현을 확장하지 말고 별도 사용자 결정/goal로 분리한다.
- G02에서 DB repository/projection 코드를 추가하거나 수정하면 한글 `// 기능 : ...` 주석으로 조회 목적과 ownership 조건을 설명한다.

## 6. Excel 계약

- sheet name: `Weekly Schedules`
- 파일명 prefix: `weekly_schedules`
- 파일은 서버에 저장하지 않는다.
- Excel header는 현재 User Web 기준 한국어 header를 사용한다.
- export localization 체계와 국가별 통화 변환은 이번 G02에서 만들지 않는다.
- 일정 없는 day도 1행으로 표현한다.
- 다일 일정은 표시되는 day마다 1행으로 표현한다.
- 한 일정에 여러 딜이 연결되면 딜 관련 값은 comma-separated text로 합친다.

Columns:

| Header | key |
|---|---|
| `날짜` | `date` |
| `요일` | `weekdayLabel` |
| `시간` | `timeRange` |
| `일정` | `scheduleTitle` |
| `장소` | `location` |
| `딜` | `dealNames` |
| `딜단계` | `dealStatusLabels` |
| `딜금액합계` | `dealCostTotal` |
| `딜마감일` | `expectedEndDates` |
| `다음행동` | `nextFollowingActions` |

Excel에 넣지 않는다.

- schedule ID
- deal ID
- contact ID
- company ID
- 일정 메모 본문
- private memo
- meeting note body
- provider raw response
- deleted deal

## 7. Observability

- event key: `schedule.week_report.exported`
- audit log: 없음
- request id: 사용
- log에 남기는 값:
  - `userId`
  - `weekStart`
  - `timeZone`
  - `scheduleCount`
  - `scheduledDayCount`
  - `distinctLinkedDealCount`
  - `rowCount`
- log에 남기지 않는 값:
  - Excel row 전체
  - 일정 제목
  - 장소
  - 일정 메모 본문
  - 딜명
  - 딜 금액
  - 회사명
  - 담당자명
  - 다음 행동 본문

## 8. 검증 명령

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- schedule
pnpm run build
```

## 9. 완료 기준

- `GET /api/schedules/week/export/xlsx`가 API spec과 일치한다.
- 인증 없는 요청은 401이다.
- validation 실패 시 파일을 만들지 않는다.
- xlsx response header가 기존 domain export와 일관된다.
- 파일명이 `weekly_schedules_YYYYMMDD_HHMMSS.xlsx` 형태다.
- 일정 없는 주도 7개 날짜 row가 생성된다.
- xlsx row에 ID/private memo/meeting note body가 없다.
- Excel writer 실패는 `ScheduleWeekReportExportFailed`로 변환된다.
- Excel row 내용이 structured log에 남지 않는다.
- 새 DB 구조와 migration이 생기지 않았다.
- export localization, currency conversion, product analytics event taxonomy가 생기지 않았다.
