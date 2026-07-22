# DB Schema TODO

상태: completed
최종 업데이트: 2026-07-22
정본 계약: `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`
아키텍처/DB 기준: `COMMON/ARCHITECTURE-GUARDRAILS.md`
Global B2C 대조: `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`

## 1. 이번 03의 DB 결정

- 새 Prisma model은 만들지 않는다.
- 새 migration은 만들지 않는다.
- 주간 보고서는 기존 row를 실시간 조회해 계산한다.
- Excel 파일은 서버에 저장하지 않는다.
- `ExportJob`, `ExportJobFile`, `ExportJobFilter`는 이번 03에서 만들지 않는다.
- 반복 일정 정식 모델은 이번 03에서 만들지 않는다.
- currency/phone/address global data model은 이번 03에서 만들지 않는다.
- product analytics table/event schema는 이번 03에서 만들지 않는다.
- Pricing/Billing/Admin/Trust policy 관련 DB 구조는 이번 03에서 만들지 않는다.

## 2. DB 주석 규칙

DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 반드시 둔다.

이번 03에서 허용되는 DB 관련 작업:

- 기존 table 조회
- 기존 relation select
- 기존 index를 활용한 weekly report projection
- `Schedule.memo` 존재 여부를 `hasMemo`로 계산

이번 03에서 금지되는 DB 관련 작업:

- Prisma schema model/field/enum 추가
- migration 생성
- table/column/index 생성
- report snapshot table 생성
- `ExportJob` 계열 table 생성
- recurring schedule table 생성
- seed 실행

만약 구현 중 새 DB 구조가 필요하다고 판단되면 03 구현에 섞지 않고 별도 사용자 결정/goal로 분리한다.

별도 사용자 결정으로 DB 변경이 확정되는 경우에는 아래 한글 주석을 모두 포함한다.

- `BE/prisma/schema.prisma`: model, enum, field, relation, index 의도에 `///` 한글 설명을 둔다.
- `BE/prisma/migrations/*/migration.sql`: DDL block 앞에 `--` 한글 설명을 둔다.
- repository/projection method: DB 조회 목적과 ownership 조건을 `// 기능 : ...` 한글 주석으로 설명한다.
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/*`: table 역할, column 의미, nullable 여부, 기본값, 관계, index 의도를 한글로 갱신한다.
- 이 문서: 실제 구현 결과와 다른 부분을 한글로 갱신한다.

주석은 이름을 번역하는 수준이 아니라 역할, 관계, 보안 조건, timezone 처리, index 의도를 설명해야 한다.

## 3. 조회 모델

| 모델 | 사용 |
|---|---|
| `User` | 기본 timezone fallback |
| `Schedule` | 주간 범위 안 일정 조회 |
| `ScheduleDeal` | 일정-딜 연결 |
| `Deal` | active linked deal 요약 |
| `DealCompany` | 딜 연결 회사 |
| `DealContact` | 딜 연결 담당자 |
| `Company` | 회사 표시명 |
| `Contact` | 담당자 표시명과 소속 회사 |
| `DealFollowingActionLog` | 대표 미완료 다음 행동 |

## 4. 조회 조건

Schedule:

- `Schedule.userId = currentUser.id`
- `Schedule.startAt < rangeEndAt`
- `Schedule.endAt > rangeStartAt`

Linked deal:

- `ScheduleDeal.userId = currentUser.id`
- `Deal.userId = currentUser.id`
- `Deal.deletedAt IS NULL`

Next following action:

- `DealFollowingActionLog.userId = currentUser.id`
- `DealFollowingActionLog.dealId IN linkedDealIds`
- `DealFollowingActionLog.checkComplete = false`
- `DealFollowingActionLog.deletedAt IS NULL`
- 정렬: `createdAt ASC`, `id ASC`

## 5. Response/export에 포함하지 않는 값

- `Schedule.memo` 본문
- private memo
- meeting note body
- provider raw response
- DB 내부 ID 컬럼의 Excel 노출
- deleted deal
- `DealProduct` 기반 제품 요약

`Schedule.memo`는 `hasMemo` 계산에만 사용한다.

## 6. Index 판단

현재 1차 구현은 기존 index로 충분하다.

- `Schedule @@index([userId, startAt])`
- `ScheduleDeal @@index([userId, scheduleId])`
- `ScheduleDeal @@index([userId, dealId])`
- `Deal @@index([userId, deletedAt])`
- `DealFollowingActionLog @@index([userId, dealId])`
- `DealFollowingActionLog @@index([userId, checkComplete])`

주간 범위는 7일 고정이므로 별도 report table이나 snapshot table은 만들지 않는다.

## 7. 별도 사용자 결정/goal DB 항목

아래는 이번 03 구현 범위가 아니다.

- `WeeklyScheduleReportSnapshot`
- `ExportJob`
- `ExportJobFile`
- `ExportJobFilter`
- `ScheduleRecurringRule`
- `ScheduleRecurringException`
- `ProductAnalyticsEvent`
- `BillingSubscription`
- `AdminAuditLog`
- global currency/phone/address normalization table

파일 저장, TTL, 다운로드 재시도, 민감정보 포함 export, PDF, 대용량 export worker는 별도 사용자 결정/goal로 확정되면 별도 DB/API 계약을 만든다.

## 8. 구현 결과

- 이번 03 구현에서 새 데이터베이스, Prisma model, table, column, enum, index, migration은 생성하지 않았다.
- `BE/prisma/schema.prisma`는 기존 `Schedule`, `ScheduleDeal`, `Deal`, `DealCompany`, `DealContact`, `Company`, `Contact`, `DealFollowingActionLog` 관계와 index를 그대로 사용한다.
- `BE/src/modules/schedule/infrastructure/persistence/prisma-schedule.repository.ts`의 `listSchedulesForWeeklyReport` projection은 `Schedule.userId`, schedule range overlap, linked `Deal.userId`, `Deal.deletedAt IS NULL`, 미완료/미삭제 following action 조건으로 조회한다.
- DB 관련 projection/service/controller 구현에는 한글 `// 기능 : ...`, `// API : ...` 주석이 포함되어 있다.
- `pnpm.cmd run prisma:validate` 통과로 schema 유효성을 확인했다.
- 별도 DB 구조가 필요한 `ExportJob`, recurring schedule, report snapshot, product analytics, billing/admin/trust policy 항목은 이번 03에 포함하지 않았다.
