# Schedule API

## 1. 계약 상태

- 계약 상태: implemented
- 소비자: User Web
- 호환성: 신규 API로 구현 완료. 기존 Backend Schedule API가 없었으므로 breaking change 없음.
- 인증: `Authorization: Bearer <app_access_token>`
- 권한: 현재 사용자 본인 데이터만 접근 가능

## 2. 공통 DB 연결

- 생성: `Schedule`, `ScheduleDeal`
- 조회: `Schedule`, `ScheduleDeal`, `Deal`
- 수정: `Schedule`, `ScheduleDeal`
- 삭제: `Schedule`, `ScheduleDeal`
- soft delete: 사용하지 않음
- audit log: 없음

## 3. 공통 시간 계약

- `startAt`, `endAt`: 사용자가 입력한 local date-time과 IANA `timeZone`을 Backend가 해석해 DB에는 UTC instant로 저장한다.
- API request의 `startAt`, `endAt`: offset 포함 ISO 8601 date-time string 또는 `YYYY-MM-DDTHH:mm` local date-time string. offset이 없는 값은 함께 전달한 `timeZone` 기준 local date-time으로 해석한다.
- API response의 `startAt`, `endAt`, `createdAt`, `updatedAt`: ISO 8601 UTC string.
- `timeZone`: IANA timezone ID.

## 4. 공통 에러

| 상황 | error code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인으로 이동 | warn |
| 요청 validation 실패 | `ValidationError` | 400 | form 또는 toast로 표시 | warn |
| 일정 없음 또는 타 사용자 일정 | `ScheduleNotFound` | 404 | 목록으로 이동 또는 삭제된 항목 안내 | warn |
| 연결 딜 없음 또는 타 사용자 딜 | `RelatedDealNotFound` | 404 | 딜 선택값 갱신 안내 | warn |

## 5. GET /api/schedules/deal-options

- API 이름: 일정 연결용 딜 전체 목록 조회 API
- API 식별자: `ListScheduleDealOptions`
- Method: `GET`
- Path: `/api/schedules/deal-options`
- Request 이름: `ListScheduleDealOptionsRequest`
- Response 이름: `ScheduleDealOptionListResponse`
- Transaction: 없음. 조회 전용.
- Observability: `schedule.deal_options.listed`, audit log 없음, request id 사용, PII redaction.

### Request

Header:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `Authorization` | string | 예 | Bearer token | 앱 access token |

Query:

없음.

### Response

Status: `200 OK`

```json
{
  "items": [
    {
      "id": "deal-a-id",
      "dealName": "Deal A",
      "createdAt": "2026-06-14T03:00:00.000Z"
    }
  ]
}
```

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | array | 아니오 | 일정 연결용 딜 옵션 목록 |
| `items[].id` | string | 아니오 | 딜 ID |
| `items[].dealName` | string | 아니오 | 딜 제목 |
| `items[].createdAt` | string | 아니오 | 등록일, ISO 8601 UTC string |

### 내부 비즈니스 로직

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `Deal.userId = currentUser.id` 조건으로 딜을 조회한다.
3. 삭제된 딜 개념이 생기면 삭제된 딜은 제외한다.
4. `createdAt DESC`, `id DESC`로 정렬한다.
5. 페이지네이션 없이 전체 딜을 반환한다.
6. 응답 필드는 `id`, `dealName`, `createdAt`만 포함한다.

### FE/BE 처리 기준

- FE는 일정 생성/수정 form의 딜 선택 옵션으로만 사용한다.
- FE는 딜 목록 화면 API를 재사용하지 않는다.
- BE는 `schedule` 모듈 controller/service/repository 계약 안에서 구현한다.
- Controller에서는 `GET /api/schedules/:scheduleId`보다 먼저 선언한다.

## 6. GET /api/schedules

- API 이름: 월간/주간 일정 목록 조회 API
- API 식별자: `ListSchedules`
- Method: `GET`
- Path: `/api/schedules`
- Request 이름: `ListSchedulesRequest`
- Response 이름: `ScheduleListResponse`
- Transaction: 없음. 조회 전용.
- Observability: `schedule.listed`, audit log 없음, request id 사용, PII redaction.

### Request

Query:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `view` | string | 아니오 | `month`, `week` | 조회 모드. 기본값 `month` |
| `baseDate` | string | 예 | `YYYY-MM-DD` | 조회 기준 날짜 |
| `timeZone` | string | 아니오 | IANA timezone ID | 범위 계산 기준. 기본값 현재 사용자 timezone |

### Response

Status: `200 OK`

```json
{
  "items": [
    {
      "id": "schedule-id",
      "scheduleTitle": "제품 데모 미팅",
      "startAt": "2026-06-14T05:00:00.000Z",
      "endAt": "2026-06-14T06:00:00.000Z",
      "timeZone": "Asia/Seoul",
      "location": "강남",
      "memo": "Deal A 논의",
      "deals": [{ "id": "deal-a-id", "dealName": "Deal A" }],
      "createdAt": "2026-06-10T03:00:00.000Z",
      "updatedAt": "2026-06-10T03:00:00.000Z"
    }
  ]
}
```

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | array | 아니오 | 일정 목록 |
| `items[].id` | string | 아니오 | 일정 ID |
| `items[].scheduleTitle` | string | 아니오 | 일정 제목 |
| `items[].startAt` | string | 아니오 | 시작 시각, ISO 8601 UTC string |
| `items[].endAt` | string | 아니오 | 종료 시각, ISO 8601 UTC string |
| `items[].timeZone` | string | 아니오 | 일정 timezone |
| `items[].location` | string | 예 | 장소 |
| `items[].memo` | string | 예 | 메모 |
| `items[].deals` | array | 아니오 | 연결 딜 요약 |
| `items[].createdAt` | string | 아니오 | 등록일 |
| `items[].updatedAt` | string | 아니오 | 수정일 |

### 내부 비즈니스 로직

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `view` 기본값을 `month`로 정한다.
3. `timeZone`이 없으면 현재 사용자 `timeZone`을 사용한다.
4. `baseDate`와 `timeZone` 기준으로 월간 또는 주간 local range를 계산한다.
5. local range를 UTC instant range로 변환한다.
6. `Schedule.userId = currentUser.id` 조건으로 조회한다.
7. 범위 조건은 `startAt < rangeEnd` AND `endAt > rangeStart`로 처리한다.
8. `ScheduleDeal`과 연결된 `Deal`을 함께 조회한다.
9. `startAt ASC`, `id ASC`로 정렬한다.
10. 일정 목록과 연결 딜 요약을 반환한다.

## 7. GET /api/schedules/:scheduleId

- API 이름: 일정 단건 상세 조회 API
- API 식별자: `GetSchedule`
- Method: `GET`
- Path: `/api/schedules/:scheduleId`
- Request 이름: `GetScheduleRequest`
- Response 이름: `ScheduleDetailResponse`
- Transaction: 없음. 조회 전용.
- Observability: `schedule.viewed`, audit log 없음, request id 사용, PII redaction.

### Request

Path param:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleId` | string | 예 | UUID | 일정 ID |

### Response

Status: `200 OK`

Body는 `ScheduleDetailResponse`이며 `ScheduleListResponse.items[]`와 같은 기본 필드를 가진다.

### 내부 비즈니스 로직

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `scheduleId`가 UUID인지 검증한다.
3. `Schedule.id = scheduleId` AND `Schedule.userId = currentUser.id` 조건으로 조회한다.
4. 없으면 `ScheduleNotFound`를 반환한다.
5. 연결 딜을 함께 조회한다.
6. 연결 딜은 `ScheduleDeal.createdAt ASC`로 정렬한다.
7. 일정 상세를 반환한다.

## 8. POST /api/schedules

- API 이름: 일정 단건 생성 API
- API 식별자: `CreateSchedule`
- Method: `POST`
- Path: `/api/schedules`
- Request 이름: `CreateScheduleRequest`
- Response 이름: `ScheduleDetailResponse`
- Transaction: 필요. `Schedule`, `ScheduleDeal` 생성 전체 rollback.
- Observability: `schedule.created`, audit log 없음, request id 사용, memo 원문 logging 금지.

### Request

Body:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleTitle` | string | 예 | trim 후 1~100자 | 일정 제목 |
| `startAt` | string | 예 | ISO 8601 date-time with offset | 시작 시각 |
| `endAt` | string | 예 | ISO 8601 date-time with offset, `startAt`보다 이후 | 종료 시각 |
| `timeZone` | string | 예 | IANA timezone ID | 일정 timezone |
| `location` | string \| null | 아니오 | 최대 200자 | 장소 |
| `memo` | string \| null | 아니오 | 최대 2000자 | 메모 |
| `dealIds` | string[] | 아니오 | UUID 배열, 중복 불가 | 연결할 딜 ID 목록 |

### Response

Status: `201 Created`

Body: `ScheduleDetailResponse`

### 내부 비즈니스 로직

1. `AuthGuard`로 현재 사용자를 확인한다.
2. request body를 검증한다.
3. 문자열 필드를 trim하고 빈 `location`, `memo`는 `null`로 정규화한다.
4. `startAt`, `endAt`, `timeZone`을 검증하고 UTC instant로 변환한다.
5. `endAt`이 `startAt`보다 이후인지 검증한다.
6. `dealIds` 중복 여부와 UUID 형식을 검증한다.
7. `dealIds`의 모든 딜이 현재 사용자 소유인지 확인한다.
8. transaction을 시작한다.
9. `Schedule`을 생성한다.
10. `dealIds`가 있으면 각 딜 ID에 대해 `ScheduleDeal`을 생성한다.
11. transaction을 commit한다.
12. 생성된 일정 상세를 반환한다.

## 9. PATCH /api/schedules/:scheduleId

- API 이름: 일정 단건 수정 API
- API 식별자: `UpdateSchedule`
- Method: `PATCH`
- Path: `/api/schedules/:scheduleId`
- Request 이름: `UpdateScheduleRequest`
- Response 이름: `ScheduleDetailResponse`
- Transaction: 필요. `Schedule` 수정과 `ScheduleDeal` 추가/삭제 전체 rollback.
- Observability: `schedule.updated`, audit log 없음, request id 사용, memo 원문 logging 금지.

### Request

Path param:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleId` | string | 예 | UUID | 일정 ID |

Body:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleTitle` | string | 아니오 | trim 후 1~100자 | 일정 제목 |
| `startAt` | string | 아니오 | ISO 8601 date-time with offset | 시작 시각 |
| `endAt` | string | 아니오 | ISO 8601 date-time with offset | 종료 시각 |
| `timeZone` | string | 아니오 | IANA timezone ID | 일정 timezone |
| `location` | string \| null | 아니오 | 최대 200자 | 장소. `null`이면 제거 |
| `memo` | string \| null | 아니오 | 최대 2000자 | 메모. `null`이면 제거 |
| `dealIds` | string[] | 아니오 | UUID 배열, 중복 불가 | 수정 후 최종 연결 딜 ID 목록 |

### Response

Status: `200 OK`

Body: `ScheduleDetailResponse`

### 내부 비즈니스 로직

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `scheduleId`가 UUID인지 검증한다.
3. request body에 수정 가능한 필드가 최소 1개 이상 있는지 검증한다.
4. 현재 사용자 소유 일정을 조회한다.
5. 없으면 `ScheduleNotFound`를 반환한다.
6. 요청된 기본 정보 필드를 정규화한다.
7. 요청에 없는 `startAt`, `endAt`, `timeZone`은 기존 값으로 최종 값을 만든다.
8. 최종 `endAt`이 최종 `startAt`보다 이후인지 검증한다.
9. `dealIds`가 요청에 없으면 기존 연결을 유지한다.
10. `dealIds`가 요청에 있으면 중복과 UUID 형식을 검증한다.
11. `dealIds`가 빈 배열이면 모든 연결을 제거 대상으로 본다.
12. `dealIds`의 모든 딜이 현재 사용자 소유인지 확인한다.
13. transaction을 시작한다.
14. `Schedule` 기본 정보를 수정한다.
15. `dealIds`가 요청에 있으면 기존 연결과 요청 배열을 비교한다.
16. 요청에는 있지만 현재 연결에 없는 딜 ID는 `ScheduleDeal`에 추가한다.
17. 현재 연결에는 있지만 요청에서 빠진 딜 ID는 `ScheduleDeal`에서 삭제한다.
18. 현재 연결에도 있고 요청에도 있는 딜 ID는 유지한다.
19. transaction을 commit한다.
20. 수정된 일정 상세를 반환한다.

## 10. DELETE /api/schedules/:scheduleId

- API 이름: 일정 단건 삭제 API
- API 식별자: `DeleteSchedule`
- Method: `DELETE`
- Path: `/api/schedules/:scheduleId`
- Request 이름: `DeleteScheduleRequest`
- Response 이름: 없음
- Transaction: 필요. `ScheduleDeal`, `Schedule` hard delete 전체 rollback.
- Observability: `schedule.deleted`, audit log 없음, request id 사용.

### Request

Path param:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleId` | string | 예 | UUID | 일정 ID |

### Response

Status: `204 No Content`

Body: 없음

### 내부 비즈니스 로직

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `scheduleId`가 UUID인지 검증한다.
3. 현재 사용자 소유 일정을 조회한다.
4. 없으면 `ScheduleNotFound`를 반환한다.
5. transaction을 시작한다.
6. 해당 일정의 `ScheduleDeal` 연결 row를 삭제한다.
7. `Schedule` row를 실제 삭제한다.
8. transaction을 commit한다.
9. `204 No Content`를 반환한다.

### FE/BE 처리 기준

- FE는 성공 후 월간/주간 일정 목록과 해당 상세 query를 invalidate한다.
- BE는 FK cascade 여부와 무관하게 삭제 전 ownership을 확인한다.
