# Weekly Schedule Report API

상태: confirmed
최종 업데이트: 2026-07-22
소비자: User Web
호환성: 신규 API. 기존 `GET /api/schedules` 계약은 변경하지 않는다.
아키텍처/UXUI 기준: `../ARCHITECTURE-GUARDRAILS.md`

## 1. 결정 요약

03 Weekly Schedule Report에서 바로 구현할 API는 아래 2개다.

| API | 상태 | 목적 |
|---|---|---|
| `GET /api/schedules/week` | confirmed | `weekStart`와 `timeZone` 기준 7일 주간 영업 일정 보고서 조회 |
| `GET /api/schedules/week/export/xlsx` | confirmed | 같은 보고서를 Excel 파일로 즉시 다운로드 |

이번 03에서는 아래 API를 만들지 않는다.

| API | 처리 |
|---|---|
| `POST /api/schedules/week/export` | 사용하지 않는다. 현재 도메인별 xlsx export 관례와 맞춰 `GET /api/schedules/week/export/xlsx`로 확정한다. |
| `/api/exports`, `/api/exports/:exportJobId`, `/api/exports/:exportJobId/download` | 범용 ExportJob은 별도 사용자 결정/goal로 분리한다. |
| `/api/schedules/recurring-rules` | 반복 일정 정식 모델은 별도 사용자 결정/goal로 분리한다. |
| PDF export | 별도 사용자 결정/goal로 분리한다. |

## 2. 공통 계약

### 아키텍처 기준

- Backend, DB, Frontend 구조는 `AGENT/SOFTWARE_AGENT`를 따른다.
- UX/UI와 사용자 노출 문구는 `AGENT/UXUI_AGENT`를 따른다.
- 구현 세부 guardrail은 `COMMON/ARCHITECTURE-GUARDRAILS.md`를 따른다.
- Global B2C 대조 기준은 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 따른다.
- 이번 03은 `NBA-009 Schedule week report`를 confirmed API로 승격한 계약이다.
- 이번 API는 User API `/api/*`만 만들고 Admin API `/admin/api/*`는 만들지 않는다.
- generic `export` Backend module, `/api/exports`, `ExportJob`는 만들지 않는다.
- 앱 전체 다국어, 국가별 currency/phone/address model, product analytics event taxonomy는 만들지 않는다.

### 인증과 권한

- 인증: `Authorization: Bearer <app_access_token>`
- Guard: `AuthGuard`
- 권한: 현재 사용자 본인 `userId`의 일정과 연결 데이터만 조회한다.
- Admin API 없음. User Web은 `/admin/api/*`를 호출하지 않는다.

### 시간과 주간 범위

- `weekStart`는 `YYYY-MM-DD` date-only string이다.
- `weekStart`는 요청 `timeZone` 기준 주의 월요일이어야 한다.
- `timeZone`은 IANA timezone ID다.
- `timeZone`이 없으면 현재 사용자 `User.timeZone`을 사용한다.
- 사용자 timezone도 유효하지 않으면 `Asia/Seoul`로 fallback한다.
- 조회 범위는 `[weekStart 00:00, weekStart + 7일 00:00)` local range를 `timeZone`으로 해석한 UTC instant range다.
- 응답의 `rangeStartAt`, `rangeEndAt`, 일정 `startAt`, `endAt`, `generatedAt`은 ISO 8601 UTC string이다.
- 응답의 `weekStart`, `weekEnd`, `days[].date`, `deals[].expectedEndDate`는 `YYYY-MM-DD` date-only string이며 timezone 변환 대상이 아니다.

### 보고서 데이터 원칙

- 응답은 항상 7개 `days[]`를 반환한다. 일정이 없는 날도 `schedules: []`로 반환한다.
- 일정 정렬은 `startAt ASC`, `id ASC`다.
- 일정은 요청 `timeZone` 기준으로 해당 날짜의 local day interval과 겹치는 모든 `days[]`에 포함한다.
- 예: 월요일 23:00에 시작해 화요일 01:00에 끝나는 일정은 월요일과 화요일 day bucket에 모두 포함된다.
- `summary.totalScheduleCount`는 distinct schedule row 수이고, `summary.totalScheduleEntryCount`는 `days[].schedules[]`에 들어간 총 표시 row 수다.
- 연결 딜은 삭제되지 않은 active deal만 포함한다. 조건은 `Deal.deletedAt IS NULL`이다.
- 딜 status label은 기존 Deal API와 같은 label mapping을 사용한다.
- 다음 행동은 기존 Deal 목록의 `nextFollowingAction` 기준과 동일하게, 삭제되지 않았고 완료되지 않은 `DealFollowingActionLog` 중 `createdAt ASC`, `id ASC` 첫 항목이다.
- 제품 요약은 이번 API에 넣지 않는다. `NBA-001`이 끝나기 전 FE가 제품 요약을 꾸며내면 안 된다.
- 일정 메모 본문, private memo, meeting note body, provider raw response는 보고서 응답과 export에 넣지 않는다.
- `hasMemo`는 일정에 메모가 있는지 여부만 알려준다. 사용자가 메모 본문을 보려면 기존 일정 상세를 연다.
- 딜 금액은 현재 Deal list/export API에도 노출되는 사용자 본인 소유 딜 기본 필드이므로 보고서에 포함한다. 단 structured log에는 금액 원문이나 합계를 남기지 않는다.
- 딜 금액은 기존 Deal 금액 semantics를 그대로 사용한다. 03에서 currency code, 통화 변환, 국가별 금액 정책을 새로 만들지 않는다.

### 공통 enum

Weekday:

| 값 | label |
|---|---|
| `MONDAY` | `월` |
| `TUESDAY` | `화` |
| `WEDNESDAY` | `수` |
| `THURSDAY` | `목` |
| `FRIDAY` | `금` |
| `SATURDAY` | `토` |
| `SUNDAY` | `일` |

Deal status:

| 값 | label |
|---|---|
| `INITIAL_CONTACT` | `초기 접촉` |
| `NEEDS_CHECK` | `니즈 확인` |
| `PROPOSAL_QUOTE` | `제안/견적` |
| `NEGOTIATION` | `협상` |
| `WON` | `성사` |
| `LOST` | `실패` |

### 연결 DB 스키마

- 생성: 없음
- 수정: 없음
- 삭제: 없음
- 조회:
  - `User`
  - `Schedule`
  - `ScheduleDeal`
  - `Deal`
  - `DealCompany`
  - `DealContact`
  - `Company`
  - `Contact`
  - `DealFollowingActionLog`
- soft delete:
  - `Deal.deletedAt IS NULL`
  - `DealFollowingActionLog.deletedAt IS NULL`
  - 연결 회사/담당자는 딜 요약 context로만 반환하며, 삭제 상태가 필요해지기 전까지 이번 response에는 넣지 않는다.
- audit log: 없음
- migration: 없음
- 새 Prisma model, table, column, enum, index: 없음
- DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 반드시 둔다.
- 새 DB 구조가 필요하다고 판단되면 이번 03 구현에 섞지 않고 별도 사용자 결정/goal로 분리한다.

### 공통 에러

| 상황 | error code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인으로 이동 | warn |
| `weekStart` 누락 | `ValidationError` | 400 | 날짜를 다시 선택하게 안내 | warn |
| `weekStart` 형식 오류 | `ValidationError` | 400 | `YYYY-MM-DD` 형식 안내 | warn |
| `weekStart`가 실제 날짜가 아님 | `ValidationError` | 400 | 날짜를 다시 선택하게 안내 | warn |
| `weekStart`가 월요일이 아님 | `ValidationError` | 400 | 해당 주의 월요일로 다시 요청 | warn |
| `timeZone`이 IANA ID가 아님 | `ValidationError` | 400 | 사용자 timezone fallback 또는 다시 시도 | warn |
| Excel 생성 실패 | `ScheduleWeekReportExportFailed` | 500 | `보고서를 다운로드하지 못했어요. 다시 시도해 주세요.` | error |

## 3. GET /api/schedules/week

- API 이름: 주간 일정 보고서 조회 API
- API 식별자: `GetWeeklyScheduleReport`
- 계약 상태: confirmed
- 소비자: User Web
- 호환성: 신규 API, breaking change 없음
- Method: `GET`
- Path: `/api/schedules/week`
- 인증: AuthGuard
- 권한: 현재 사용자 본인 데이터
- Request 이름: `GetWeeklyScheduleReportQueryDto`
- Response 이름: `WeeklyScheduleReportResponse`

### 목적

사용자가 `/app/schedules/week`에서 선택한 한 주의 일정을 날짜별 영업 보고서 형태로 확인한다. 월/주 calendar view와 달리, 이 API는 7일 `days[]`, 연결 딜 요약, 주간 summary를 Backend에서 완성해서 반환한다.

### Request

Header:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `Authorization` | string | 예 | Bearer token | 앱 access token |

Query:

| 필드 | 타입 | 필수 | nullable | validation | 예시 | 설명 |
|---|---|---:|---:|---|---|---|
| `weekStart` | string | 예 | 아니오 | `YYYY-MM-DD`, 실제 날짜, 월요일 | `2026-07-20` | 보고서 시작일. 요청 timezone 기준 월요일 |
| `timeZone` | string | 아니오 | 아니오 | IANA timezone ID | `Asia/Seoul` | 주간 범위 계산과 화면 표시 기준 timezone |

Body: 없음

### Response

Status: `200 OK`

Body: `WeeklyScheduleReportResponse`

```json
{
  "weekStart": "2026-07-20",
  "weekEnd": "2026-07-26",
  "timeZone": "Asia/Seoul",
  "rangeStartAt": "2026-07-19T15:00:00.000Z",
  "rangeEndAt": "2026-07-26T15:00:00.000Z",
  "generatedAt": "2026-07-22T03:10:00.000Z",
  "summary": {
    "totalScheduleCount": 3,
    "totalScheduleEntryCount": 3,
    "scheduledDayCount": 2,
    "unlinkedScheduleCount": 1,
    "scheduleDealLinkCount": 2,
    "distinctLinkedDealCount": 2,
    "totalDealCost": 12000000,
    "dealStatusCounts": [
      {
        "dealStatus": "INITIAL_CONTACT",
        "dealStatusLabel": "초기 접촉",
        "count": 1
      }
    ]
  },
  "days": [
    {
      "date": "2026-07-20",
      "weekday": "MONDAY",
      "weekdayLabel": "월",
      "scheduleCount": 1,
      "linkedDealCount": 1,
      "schedules": [
        {
          "id": "6c98477d-97fb-42ed-89dc-2982d49f1164",
          "scheduleTitle": "제품 데모 미팅",
          "startAt": "2026-07-20T01:00:00.000Z",
          "endAt": "2026-07-20T02:00:00.000Z",
          "timeZone": "Asia/Seoul",
          "location": "강남",
          "hasMemo": true,
          "deals": [
            {
              "id": "7d5cf9ef-fcbb-4d4c-b3c0-33ce5f8ef3a0",
              "dealName": "하반기 CRM 도입",
              "dealCost": 12000000,
              "dealStatus": "INITIAL_CONTACT",
              "dealStatusLabel": "초기 접촉",
              "expectedEndDate": "2026-08-31",
              "companies": [
                {
                  "id": "8fa78f41-5a0b-4939-8443-93cbb7470d81",
                  "companyName": "한손상사"
                }
              ],
              "contacts": [
                {
                  "id": "b63a0248-2ca9-4a5f-aa7d-46b820a144e7",
                  "username": "김민수",
                  "companyId": "8fa78f41-5a0b-4939-8443-93cbb7470d81",
                  "companyName": "한손상사"
                }
              ],
              "nextFollowingAction": {
                "id": "1c399158-10b4-4376-99bd-0a271da48a48",
                "followingAction": "제안서 보내기",
                "checkComplete": false,
                "createdAt": "2026-07-18T02:10:00.000Z",
                "remainingCount": 0
              }
            }
          ]
        }
      ]
    }
  ]
}
```

Top-level fields:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `weekStart` | string | 아니오 | 요청 기준 주의 월요일. `YYYY-MM-DD` |
| `weekEnd` | string | 아니오 | 요청 기준 주의 일요일. `YYYY-MM-DD` |
| `timeZone` | string | 아니오 | Backend가 최종 적용한 IANA timezone ID |
| `rangeStartAt` | string | 아니오 | 조회 시작 UTC instant. inclusive |
| `rangeEndAt` | string | 아니오 | 조회 종료 UTC instant. exclusive |
| `generatedAt` | string | 아니오 | 보고서 생성 시각. ISO 8601 UTC string |
| `summary` | object | 아니오 | 주간 요약 |
| `days` | array | 아니오 | 7일 날짜별 보고서 |

`summary` fields:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `totalScheduleCount` | number | 아니오 | 주간 일정 수 |
| `totalScheduleEntryCount` | number | 아니오 | 날짜 bucket에 표시되는 일정 row 수. 다일 일정은 여러 day에 표시될 수 있다. |
| `scheduledDayCount` | number | 아니오 | 일정이 1개 이상 있는 날짜 수 |
| `unlinkedScheduleCount` | number | 아니오 | active deal이 연결되지 않은 일정 수 |
| `scheduleDealLinkCount` | number | 아니오 | distinct schedule row 기준 일정-딜 연결 수. 같은 딜이 여러 일정에 연결되면 여러 번 센다. |
| `distinctLinkedDealCount` | number | 아니오 | 중복 제거한 active linked deal 수 |
| `totalDealCost` | number | 아니오 | 중복 제거한 active linked deal의 `dealCost` 합계 |
| `dealStatusCounts` | array | 아니오 | 중복 제거한 active linked deal 기준 status별 count |

`days[]` fields:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `date` | string | 아니오 | 날짜. `YYYY-MM-DD` |
| `weekday` | string | 아니오 | `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY` |
| `weekdayLabel` | string | 아니오 | `월`, `화`, `수`, `목`, `금`, `토`, `일` |
| `scheduleCount` | number | 아니오 | 해당 날짜 일정 수 |
| `linkedDealCount` | number | 아니오 | 해당 날짜에 연결된 active deal 중복 제거 수 |
| `schedules` | array | 아니오 | 해당 날짜 일정 목록 |

`schedules[]` fields:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 일정 ID |
| `scheduleTitle` | string | 아니오 | 일정 제목 |
| `startAt` | string | 아니오 | 시작 시각. ISO 8601 UTC string |
| `endAt` | string | 아니오 | 종료 시각. ISO 8601 UTC string |
| `timeZone` | string | 아니오 | 일정이 저장된 timezone |
| `location` | string | 예 | 장소 |
| `hasMemo` | boolean | 아니오 | 일정 메모 존재 여부. 메모 본문은 반환하지 않음 |
| `deals` | array | 아니오 | 연결 active deal 요약 |

`deals[]` fields:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 딜 ID |
| `dealName` | string | 아니오 | 딜명 |
| `dealCost` | number | 아니오 | 딜 금액 |
| `dealStatus` | string | 아니오 | Deal status code |
| `dealStatusLabel` | string | 아니오 | Deal status label |
| `expectedEndDate` | string | 아니오 | 예상 마감일. `YYYY-MM-DD` |
| `companies` | array | 아니오 | 연결 회사 요약 |
| `contacts` | array | 아니오 | 연결 담당자 요약 |
| `nextFollowingAction` | object | 예 | 대표 미완료 다음 행동 |

`companies[]` fields:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 회사 ID |
| `companyName` | string | 아니오 | 회사명 |

`contacts[]` fields:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 담당자 ID |
| `username` | string | 아니오 | 담당자명 |
| `companyId` | string | 아니오 | 담당자 소속 회사 ID |
| `companyName` | string | 아니오 | 담당자 소속 회사명 |

`nextFollowingAction` fields:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 다음 행동 로그 ID |
| `followingAction` | string | 아니오 | 다음 행동 본문 |
| `checkComplete` | boolean | 아니오 | 항상 `false` |
| `createdAt` | string | 아니오 | 생성 시각. ISO 8601 UTC string |
| `remainingCount` | number | 아니오 | 같은 딜의 나머지 미완료 다음 행동 수 |

### 비즈니스 로직 흐름

1. `AuthGuard`로 현재 사용자를 확인한다.
2. query DTO를 validation한다. unknown query는 global `ValidationPipe`의 whitelist/forbid 기준을 따른다.
3. `timeZone`을 정규화한다.
   - query `timeZone`이 있으면 IANA timezone ID인지 검증한다.
   - 없으면 `currentUser.timeZone`을 사용한다.
   - 둘 다 유효하지 않으면 `Asia/Seoul`을 사용한다.
4. `weekStart`를 `YYYY-MM-DD` date-only로 파싱하고 실제 calendar date인지 검증한다.
5. `weekStart`가 월요일인지 검증한다. 월요일이 아니면 `ValidationError`를 던진다.
6. `weekStart` local 00:00과 `weekStart + 7일` local 00:00을 적용 timezone 기준 UTC instant로 변환한다.
7. `Schedule.userId = currentUser.id`이고 `Schedule.startAt < rangeEndAt`이며 `Schedule.endAt > rangeStartAt`인 일정을 조회한다.
8. 조회 시 active linked deal만 포함한다.
   - `ScheduleDeal.userId = currentUser.id`
   - `Deal.userId = currentUser.id`
   - `Deal.deletedAt IS NULL`
9. linked deal마다 회사, 담당자, 미완료 다음 행동 대표 항목을 조회한다.
   - 회사/담당자는 ID와 표시명만 반환한다.
   - 다음 행동은 `checkComplete = false`, `deletedAt IS NULL`, `createdAt ASC`, `id ASC` 첫 항목이다.
10. 7개 day bucket을 만든다. 일정 없는 날도 빈 `schedules` 배열로 둔다.
11. 각 schedule을 요청 `timeZone` 기준 local day interval과 비교한다.
   - day interval: `[date 00:00, date + 1일 00:00)`
   - schedule interval: `[Schedule.startAt, Schedule.endAt)`
   - 겹침 조건: `scheduleStart < dayEnd` AND `scheduleEnd > dayStart`
   - 겹치는 모든 day bucket에 같은 schedule summary를 넣는다.
12. summary를 계산한다.
   - `totalScheduleCount`: distinct schedule row 수
   - `totalScheduleEntryCount`: day bucket에 들어간 schedule 표시 row 수
   - `scheduledDayCount`: schedule이 1개 이상인 day 수
   - `unlinkedScheduleCount`: active linked deal이 0개인 schedule 수
   - `scheduleDealLinkCount`: distinct schedule row 기준 deal 항목 전체 수
   - `distinctLinkedDealCount`: active deal ID 중복 제거 수
   - `totalDealCost`: distinct active deal 기준 `dealCost` 합계
   - `dealStatusCounts`: distinct active deal 기준 status별 count
13. response DTO로 변환한다.
14. structured log `schedule.week_report.viewed`를 남긴다.
   - 남기는 값: `userId`, `weekStart`, `timeZone`, `scheduleCount`, `scheduledDayCount`, `distinctLinkedDealCount`
   - 남기지 않는 값: 일정 제목, 장소, 메모, 딜명, 딜 금액, 담당자명, 회사명, 다음 행동 본문

### 연결된 DB 스키마

- 생성: 없음
- 조회: `User`, `Schedule`, `ScheduleDeal`, `Deal`, `DealCompany`, `DealContact`, `Company`, `Contact`, `DealFollowingActionLog`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음
- 새 DB 구조: 없음
- DB 관련 repository/projection 구현에는 한글 `// 기능 : ...` 주석을 둔다.

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용 API이며 DB 상태를 변경하지 않는다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `schedule.week_report.viewed`
- audit log: 없음
- request id: 사용
- redaction:
  - schedule title, location, memo 본문 logging 금지
  - deal name, dealCost, companyName, username, followingAction logging 금지
  - response body 전체 logging 금지
- provider error context: 없음

### FE/BE 처리 기준

- FE:
  - `/app/schedules/week` redirect를 해제한다.
  - URL query `weekStart`가 없으면 FE에서 현재 사용자 timezone 기준 이번 주 월요일을 계산한다.
  - API query에는 `weekStart`, `timeZone`만 보낸다.
  - UTC ISO string을 그대로 표시하지 않고 response `timeZone` 기준으로 표시한다.
  - 날짜/시간/금액 표시는 기존 User Web formatter 또는 `Intl` 기반 helper를 우선 사용한다.
  - `Asia/Seoul`을 화면 기본값으로 하드코딩하지 않는다. Backend fallback 또는 사용자/browser timezone을 따른다.
  - 화면 문구는 현재 한국어 UX writing을 따르되, app-wide i18n 체계를 이번 03에서 새로 만들지 않는다.
  - loading, empty, error 상태를 해요체 문구로 처리한다.
  - empty day는 숨기지 않고 `일정을 등록하면 이번 주 계획을 한눈에 볼 수 있어요.` 계열 문구로 표시한다.
  - row/card 클릭은 기존 일정 상세 `/app/schedules/:scheduleId`로 이동할 수 있어야 한다.
  - product analytics event taxonomy를 임의로 만들지 않는다.
- BE:
  - controller route는 `@Get("week")`를 `@Get(":scheduleId")`보다 먼저 선언한다.
  - application service에 `getWeeklyScheduleReport` query use case를 둔다.
  - repository에 weekly report projection 전용 조회 method를 둔다.
  - DealRepository를 import하지 않고 Schedule repository의 read projection으로 필요한 relation만 조회한다.
  - 기존 `GET /api/schedules` response를 변경하지 않는다.
- 검증:
  - 타 사용자 일정과 딜이 섞이지 않는다.
  - 월요일이 아닌 `weekStart`는 400이다.
  - DST가 있는 timezone에서도 range가 local 7일 기준으로 계산된다.
  - 일정 없는 주도 7개 `days[]`와 빈 summary를 반환한다.
  - 딜 금액/다음 행동 본문이 log에 남지 않는다.

## 4. GET /api/schedules/week/export/xlsx

- API 이름: 주간 일정 보고서 Excel 다운로드 API
- API 식별자: `ExportWeeklyScheduleReportXlsx`
- 계약 상태: confirmed
- 소비자: User Web
- 호환성: 신규 API, breaking change 없음
- Method: `GET`
- Path: `/api/schedules/week/export/xlsx`
- 인증: AuthGuard
- 권한: 현재 사용자 본인 데이터
- Request 이름: `ExportWeeklyScheduleReportXlsxQueryDto`
- Response 이름: `ExportedXlsxFileResponse`

### 목적

사용자가 `/app/schedules/week`에서 보고 있는 주간 일정 보고서를 Excel 파일로 내려받는다. 파일은 서버에 저장하지 않고 요청 응답으로 바로 내려준다.

### Request

Header:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `Authorization` | string | 예 | Bearer token | 앱 access token |

Query:

| 필드 | 타입 | 필수 | nullable | validation | 예시 | 설명 |
|---|---|---:|---:|---|---|---|
| `weekStart` | string | 예 | 아니오 | `YYYY-MM-DD`, 실제 날짜, 월요일 | `2026-07-20` | 보고서 시작일 |
| `timeZone` | string | 아니오 | 아니오 | IANA timezone ID | `Asia/Seoul` | 주간 범위 계산과 파일 시간 표시 기준 |

Body: 없음

### Response

Status: `200 OK`

Body: xlsx binary stream

Headers:

| Header | 값 |
|---|---|
| `Content-Type` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `Content-Disposition` | `attachment; filename="weekly_schedules_YYYYMMDD_HHMMSS.xlsx"` |

Response object in application layer:

| 필드 | 타입 | 설명 |
|---|---|---|
| `fileName` | string | 다운로드 파일명 |
| `contentType` | string | xlsx MIME type |
| `content` | Buffer | xlsx file buffer |

### Excel 형식

- sheet name: `Weekly Schedules`
- row 기준:
  - 일정이 있는 날은 해당 day bucket의 일정 표시 row 1개당 1행
  - 일정이 없는 날도 1행을 만든다.
  - 다일 일정이 여러 day bucket에 표시되면 Excel에도 날짜별로 여러 행이 생긴다.
  - 한 일정에 여러 딜이 연결되면 딜 관련 값은 comma-separated text로 합친다.
- 서버 저장: 없음
- 파일 retention: 없음
- 다운로드 재조회 endpoint: 없음
- Excel header는 현재 User Web 기준 한국어 header를 사용한다.
- export localization 체계와 국가별 통화 변환은 이번 03에서 만들지 않는다.

Columns:

| Header | key | 값 |
|---|---|---|
| `날짜` | `date` | `YYYY-MM-DD` |
| `요일` | `weekdayLabel` | `월` ~ `일` |
| `시간` | `timeRange` | 요청 timezone 기준 `HH:mm - HH:mm`, 일정 없으면 빈 값 |
| `일정` | `scheduleTitle` | 일정 제목, 일정 없으면 `일정 없음` |
| `장소` | `location` | 장소 |
| `딜` | `dealNames` | 연결 active deal 이름 목록 |
| `딜단계` | `dealStatusLabels` | 연결 active deal 단계 label 목록 |
| `딜금액합계` | `dealCostTotal` | 해당 일정에 연결된 active deal 금액 합계 |
| `딜마감일` | `expectedEndDates` | 연결 active deal expectedEndDate 목록 |
| `다음행동` | `nextFollowingActions` | 연결 active deal의 대표 다음 행동 목록 |

Excel에 넣지 않는 값:

- schedule ID
- deal ID
- contact ID
- company ID
- 일정 메모 본문
- private memo
- meeting note body
- provider raw response
- 삭제된 딜

### 비즈니스 로직 흐름

1. `AuthGuard`로 현재 사용자를 확인한다.
2. query DTO를 validation한다. validation 규칙은 `GET /api/schedules/week`와 같다.
3. `getWeeklyScheduleReport` application logic을 재사용해 보고서 데이터를 만든다.
4. 보고서 데이터를 Excel row로 변환한다.
   - 일정이 없는 day는 `scheduleTitle = "일정 없음"`인 1행으로 표현한다.
   - 다일 일정은 표시되는 day마다 1행으로 표현한다.
   - 시간은 response `timeZone` 기준으로 변환해 `HH:mm - HH:mm`으로 만든다.
   - 여러 딜명, 단계, 마감일, 다음 행동은 comma-separated text로 합친다.
   - `dealCostTotal`은 해당 schedule row의 active linked deal 금액 합계다.
5. `XlsxWorkbookWriter.writeWorksheet`로 xlsx Buffer를 생성한다.
6. 파일명은 `createTimestampedXlsxFileName("weekly_schedules")`를 사용한다.
7. `createXlsxDownloadResponse`로 `StreamableFile`을 반환한다.
8. structured log `schedule.week_report.exported`를 남긴다.
   - 남기는 값: `userId`, `weekStart`, `timeZone`, `scheduleCount`, `scheduledDayCount`, `distinctLinkedDealCount`, `rowCount`
   - 남기지 않는 값: 일정 제목, 장소, 메모, 딜명, 딜 금액, 담당자명, 회사명, 다음 행동 본문

### 연결된 DB 스키마

- 생성: 없음
- 조회: `User`, `Schedule`, `ScheduleDeal`, `Deal`, `DealCompany`, `DealContact`, `Company`, `Contact`, `DealFollowingActionLog`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음
- 새 DB 구조: 없음
- DB 관련 repository/projection 구현에는 한글 `// 기능 : ...` 주석을 둔다.

### Transaction

- 필요 여부: 없음
- 이유: DB 상태를 변경하지 않고, xlsx는 요청 중 메모리에서 생성해 바로 반환한다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음
- outbox: 없음
- idempotency: 별도 key 없음. 같은 query를 반복 호출하면 같은 범위 데이터로 새 파일을 생성한다.

### Observability

- log event key: `schedule.week_report.exported`
- audit log: 없음
- request id: 사용
- redaction:
  - Excel row 내용 전체 logging 금지
  - schedule title, location, memo 본문 logging 금지
  - deal name, dealCost, companyName, username, followingAction logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | error code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인으로 이동 | warn |
| query validation 실패 | `ValidationError` | 400 | 날짜/timezone을 다시 선택하게 안내 | warn |
| Excel writer 실패 | `ScheduleWeekReportExportFailed` | 500 | `보고서를 다운로드하지 못했어요. 다시 시도해 주세요.` | error |

### FE/BE 처리 기준

- FE:
  - 보고서 화면의 `엑셀 다운로드` 버튼에서 현재 `weekStart`, `timeZone`을 그대로 사용한다.
  - 다운로드 중에는 버튼을 disabled 처리한다.
  - 실패 시 같은 파라미터로 다시 시도할 수 있어야 한다.
  - 민감정보 포함 toggle은 만들지 않는다. 이번 export는 민감 raw data를 포함하지 않는다.
  - `/app/export`를 열지 않는다.
- BE:
  - controller route는 `@Get("week/export/xlsx")`를 `@Get(":scheduleId")`보다 먼저 선언한다.
  - `ScheduleModule`에 `XlsxInfrastructureModule`을 import한다.
  - application service는 `XlsxWorkbookWriter` port를 주입받는다.
  - Excel 생성 실패는 `ScheduleWeekReportExportFailedError` 같은 domain/application error로 변환한다.
  - 기존 company/contact/product/deal export와 같은 `createXlsxDownloadResponse` 패턴을 사용한다.
- 검증:
  - xlsx 응답 header가 기존 domain export와 일관된다.
  - 같은 사용자 소유 일정/딜만 export된다.
  - 일정 없는 주도 7개 날짜 row가 생성된다.
  - Excel row 내용이 structured log에 남지 않는다.
  - `weekStart`가 월요일이 아니면 파일을 만들지 않고 400을 반환한다.

## 5. Backend 구현 메모

권장 파일 추가/수정:

```text
BE/src/modules/schedule/
  domain/
    schedule.errors.ts
  application/
    ports/schedule.repository.ts
    services/schedule-application.service.ts
  infrastructure/
    schedule.module.ts
    persistence/prisma-schedule.repository.ts
  presentation/
    http/schedule.controller.ts
    http/dto/schedule-request.dto.ts
```

권장 application method:

```ts
getWeeklyScheduleReport(
  currentUser: CurrentUserContext,
  query: GetWeeklyScheduleReportQueryInput
): Promise<WeeklyScheduleReportResponse>

exportWeeklyScheduleReportXlsx(
  currentUser: CurrentUserContext,
  query: ExportWeeklyScheduleReportXlsxQueryInput
): Promise<ExportedXlsxFileResponse>
```

권장 repository method:

```ts
listSchedulesForWeeklyReport(
  input: ListSchedulesForWeeklyReportInput
): Promise<WeeklyScheduleReportScheduleRecord[]>
```

주의:

- 기존 `listSchedules` 응답 타입을 억지로 확장하지 않는다.
- report projection은 report response가 필요한 필드만 조회한다.
- `Schedule.memo`는 조회해도 response/export/log에 본문을 넣지 않는다. `hasMemo` 계산에만 쓴다.
- `DealProduct`는 이번 response에 포함하지 않는다.
- Prisma migration은 만들지 않는다.

## 6. User Web 구현 메모

권장 파일 추가/수정:

```text
FE/user-web/src/app/router/router.tsx
FE/user-web/src/pages/schedules/week/index.tsx
FE/user-web/src/features/schedule/index.ts
FE/user-web/src/features/schedule/api/schedule-api.ts
FE/user-web/src/features/schedule/api/schedule-query-keys.ts
FE/user-web/src/features/schedule/hooks/use-schedule-queries.ts
FE/user-web/src/features/schedule/types/schedule.ts
FE/user-web/src/features/schedule/components/schedule-week-report-screen.tsx
```

권장 API client:

```ts
listWeeklyScheduleReport(params: WeeklyScheduleReportParams)
downloadWeeklyScheduleReportXlsx(params: WeeklyScheduleReportParams)
```

UX 기준:

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 따른다.
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`를 따른다.
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`를 따른다.
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`를 따른다.
- Notion식 page/report 구조로 조용하게 구성한다.
- Attio식 linked record 맥락이 보이도록 일정 row 안에 연결 딜, 회사, 담당자, 다음 행동을 보여준다.
- 데스크톱은 날짜별 section + compact schedule rows를 우선한다.
- 모바일 390px/360px에서는 날짜별 card/list로 전환한다.
- 사용자가 딜 요약을 클릭하면 `/app/deals/:dealId`, 일정 row를 클릭하면 `/app/schedules/:scheduleId`로 이동할 수 있어야 한다.
- 화면 문구는 해요체를 쓴다.

권장 사용자 문구:

| 상황 | 문구 |
|---|---|
| loading | `주간 보고서를 불러오고 있어요.` |
| empty week | `일정을 등록하면 이번 주 계획을 한눈에 볼 수 있어요.` |
| error | `보고서를 불러오지 못했어요. 다시 시도해 주세요.` |
| export error | `보고서를 다운로드하지 못했어요. 다시 시도해 주세요.` |
| export button | `엑셀 다운로드` |

## 7. 테스트 기준

Backend:

- `GET /api/schedules/week`
  - 인증 없으면 401
  - invalid `weekStart`는 400
  - 월요일이 아닌 `weekStart`는 400
  - invalid `timeZone`은 400
  - 일정 없는 주는 7개 empty day 반환
  - range overlap 일정 포함
  - 타 사용자 일정/딜 제외
  - deleted deal 제외
  - distinct linked deal summary 중복 제거
  - 다음 행동은 미완료/미삭제 가장 오래된 항목
- `GET /api/schedules/week/export/xlsx`
  - 인증 없으면 401
  - validation 실패 시 파일 생성 안 함
  - xlsx header와 filename 확인
  - row 내용에 ID/private memo/meeting note body 없음
  - xlsx writer 실패 시 `ScheduleWeekReportExportFailed` 반환

Frontend:

- `/app/schedules/week` route가 redirect되지 않는다.
- week 이동 시 query key와 URL `weekStart`가 갱신된다.
- loading/empty/error/export error 문구가 UX writing 기준과 맞다.
- 390px/360px에서 날짜 section과 row/card가 겹치지 않는다.
- `엑셀 다운로드`가 현재 보고서와 같은 `weekStart`, `timeZone`으로 호출된다.

## 8. 별도 사용자 결정/goal 항목

- Generic ExportJob:
  - `/api/exports`
  - `/api/exports/:exportJobId`
  - `/api/exports/:exportJobId/download`
  - `ExportJob`, `ExportJobFile`, `ExportJobFilter`
- 파일 저장, TTL, 다운로드 권한, 삭제 정책
- 민감정보 포함 export confirm/audit 정책
- PDF print/export
- 반복 일정 정식 모델과 occurrence 확장
- AI Weekly Sales Report 전용 요약 생성
