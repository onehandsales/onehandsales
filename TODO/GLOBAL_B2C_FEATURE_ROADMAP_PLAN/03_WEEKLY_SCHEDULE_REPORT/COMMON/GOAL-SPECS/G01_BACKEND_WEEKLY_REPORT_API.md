# G01 Backend Weekly Report API

상태: Done

## 1. 목적

User Web이 주간 일정 보고서를 조회할 수 있도록 `GET /api/schedules/week`를 구현한다.

## 2. 선행 조건

- `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md` 계약 상태가 `confirmed`다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽고 따른다.
- `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 먼저 읽고 따른다.
- Backend/DB 구조는 `AGENT/SOFTWARE_AGENT` 기준을 따른다.
- 사용자 결정: 03은 주간 보고서 화면과 동기식 Excel 다운로드까지만 구현한다.
- 새 데이터베이스, 새 Prisma model, 새 table, 새 column, 새 index는 만들지 않는다.
- 새 Prisma migration은 만들지 않는다.

## 3. 포함 범위

- `GET /api/schedules/week`
- `GetWeeklyScheduleReportQueryDto`
- `WeeklyScheduleReportResponse` 관련 application response type
- weekly report builder
- `ScheduleRepository` weekly report projection method
- user ownership 필터
- active linked deal 필터
- timezone/weekStart validation
- 7일 `days[]` bucket 생성
- 다일 일정 day bucket 중복 표시
- summary 계산
- structured log `schedule.week_report.viewed`
- Backend unit/controller test

## 4. 제외 범위

- `GET /api/schedules/week/export/xlsx`
- User Web route 해제
- `/api/exports`
- `ExportJob`
- `/app/export`
- PDF
- 반복 일정 정식 모델
- 제품 요약
- AI 요약
- 일정 메모 본문 반환
- app-wide i18n
- currency/phone/address global data model
- product analytics event taxonomy

## 5. Backend 구조 기준

- `ScheduleController` route는 `@Get(":scheduleId")`보다 위에 둔다.
- controller는 request validation과 application service 호출만 담당한다.
- application service는 Prisma를 직접 import하지 않는다.
- repository는 `Schedule` 모듈 내부 projection으로 필요한 relation만 조회한다.
- `DealRepository`를 import하지 않는다.
- 기존 `GET /api/schedules` response는 변경하지 않는다.
- `Schedule.memo`는 `hasMemo` 계산에만 사용하고 response/log에 넣지 않는다.
- 새 Backend class/interface에는 한국어 `// 역할 : ...` 주석을 붙인다.
- 새 HTTP controller method에는 한국어 `// API : ...` 주석을 붙인다.
- 새 내부 method/function에는 한국어 `// 기능 : ...` 주석을 붙인다.
- DB 관련 repository/projection method에는 조회 목적과 ownership 조건을 한글 `// 기능 : ...` 주석으로 남긴다.

## 5A. DB 변경 금지와 주석 기준

- 이번 G01은 기존 DB 조회만 사용한다.
- Prisma schema와 migration 파일을 수정하지 않는다.
- `pnpm run prisma:migrate`와 seed를 실행하지 않는다.
- 새 DB 구조가 필요하다고 판단되면 구현을 확장하지 말고 별도 사용자 결정/goal로 분리한다.
- DB 조회 관련 코드에는 한글 주석을 둔다.
- 주석은 table/field 이름 번역이 아니라 조회 목적, ownership 조건, soft delete 조건, timezone range 의도를 설명한다.

## 6. 핵심 비즈니스 규칙

- `weekStart`는 `YYYY-MM-DD`이고 월요일만 허용한다.
- `timeZone`은 IANA timezone ID만 허용한다.
- `timeZone`이 없으면 `currentUser.timeZone`, 그것도 유효하지 않으면 `Asia/Seoul`을 사용한다.
- 조회 범위는 요청 timezone 기준 `[weekStart 00:00, weekStart + 7일 00:00)`다.
- 일정 조회 조건은 `Schedule.startAt < rangeEndAt` AND `Schedule.endAt > rangeStartAt`다.
- 일정은 요청 timezone 기준 겹치는 모든 day bucket에 표시한다.
- linked deal은 `Deal.deletedAt IS NULL`인 active deal만 포함한다.
- 다음 행동은 미완료/미삭제 중 `createdAt ASC`, `id ASC` 첫 항목이다.
- summary의 distinct deal 계산은 같은 딜이 여러 일정에 연결된 경우 중복 제거한다.
- 딜 금액은 기존 Deal 금액 semantics를 그대로 사용한다. currency code, 통화 변환, 국가별 금액 정책은 새로 만들지 않는다.
- structured log는 운영 로그이며 product analytics event taxonomy로 쓰지 않는다.

## 7. Observability

- event key: `schedule.week_report.viewed`
- audit log: 없음
- request id: 사용
- log에 남기는 값:
  - `userId`
  - `weekStart`
  - `timeZone`
  - `scheduleCount`
  - `scheduledDayCount`
  - `distinctLinkedDealCount`
- log에 남기지 않는 값:
  - 일정 제목
  - 장소
  - 일정 메모 본문
  - 딜명
  - 딜 금액
  - 회사명
  - 담당자명
  - 다음 행동 본문
  - response body 전체

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

- `GET /api/schedules/week`가 API spec과 일치한다.
- 인증 없는 요청은 401이다.
- invalid `weekStart`는 400이다.
- 월요일이 아닌 `weekStart`는 400이다.
- invalid `timeZone`은 400이다.
- 일정 없는 주도 7개 empty day를 반환한다.
- range overlap 일정이 포함된다.
- 주 경계 또는 날짜 경계를 걸치는 일정이 겹치는 day bucket에 표시된다.
- 타 사용자 일정/딜이 섞이지 않는다.
- deleted deal은 제외된다.
- distinct linked deal summary가 중복을 제거한다.
- 다음 행동은 미완료/미삭제 가장 오래된 항목이다.
- 일정 메모 본문이 response/log에 노출되지 않는다.
- DB 관련 repository/projection 코드에 한글 주석이 있다.
