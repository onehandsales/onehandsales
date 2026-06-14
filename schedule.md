# 일정

## 구현 상태

- 상태: 구현 완료
- 기준일: 2026-06-14
- Backend: `BE/src/modules/schedule`, `BE/prisma/schema.prisma`, `BE/prisma/migrations/20260614020000_add_schedule_domain/migration.sql`
- Frontend: `FE/user-web/src/features/schedule`, `/schedules`, `/schedules/week`
- 완료 계획: `TODO/DONE/SCHEDULE_DOMAIN_PLAN`
- 완료 로그:
  - `TODO_LOG/2026-06-14/G01_BE_SCHEDULE_DOMAIN/WORK_LOG.md`
  - `TODO_LOG/2026-06-14/G02_FE_SCHEDULE_PAGES/WORK_LOG.md`

## 1. 목적

영업 담당자가 미팅, 통화, 방문, 팔로업 같은 일정을 월간/주간 단위로 확인하고, 일정에 관련 딜을 연결할 수 있게 한다.

영업 업무에서는 하나의 일정에서 여러 딜을 함께 논의할 수 있고, 하나의 딜도 여러 일정에 반복해서 연결될 수 있다.

예:

- 2026년 6월 14일 오후 2시 일정에 Deal A, Deal B가 함께 연결될 수 있다.
- 2026년 6월 14일 오후 3시 일정에 Deal A가 다시 연결될 수 있다.

따라서 `Schedule`과 `Deal`은 N:N 관계로 본다.

## 2. DB 테이블

### Schedule 테이블

일정 자체를 저장하는 테이블이다.

- `id`: uuid
- `userId`: uuid FK
- `scheduleTitle`: string
- `startAt`: date-time, UTC instant 저장
- `endAt`: date-time, UTC instant 저장
- `timeZone`: IANA timezone ID
- `location`: string, 선택, null 가능
- `memo`: string, 선택, null 가능
- `createdAt`: date-time
- `updatedAt`: date-time

`Schedule` 테이블에는 `dealId`를 두지 않는다.

권장 인덱스:

- `@@index([userId, startAt])`
- `@@index([userId, createdAt])`

### ScheduleDeal 테이블

일정과 딜의 N:N 연결을 저장하는 테이블이다.

- `id`: uuid
- `userId`: uuid FK
- `scheduleId`: uuid FK
- `dealId`: uuid FK
- `createdAt`: date-time

권장 제약:

- `UNIQUE(scheduleId, dealId)`

권장 인덱스:

- `@@index([userId, scheduleId])`
- `@@index([userId, dealId])`

같은 일정에 같은 딜이 중복 연결되는 것을 막는다.

## 3. 공통 API 규칙

인증:

- 모든 API는 `Authorization: Bearer <app_access_token>`을 사용한다.
- Backend `AuthGuard`로 현재 사용자를 확인한다.

Ownership:

- 모든 조회와 변경은 현재 사용자 `userId` 기준으로 처리한다.
- 일정, 딜, 일정-딜 연결은 모두 현재 사용자 소유 데이터만 다룬다.
- 요청한 딜 ID가 존재하지 않거나 현재 사용자 소유가 아니면 연결할 수 없다.

시간 처리:

- 요청의 `startAt`, `endAt`은 offset이 있는 ISO 8601 문자열로 받는다.
- 요청에는 `timeZone`도 함께 받는다.
- Backend는 `startAt`, `endAt`을 UTC instant로 저장한다.
- 응답의 `startAt`, `endAt`, `createdAt`, `updatedAt`은 ISO 8601 UTC string으로 반환한다.
- `timeZone`은 `Asia/Seoul`, `America/Los_Angeles`, `Asia/Singapore` 같은 IANA timezone ID만 허용한다.

공통 에러 응답:

```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": "Invalid request"
}
```

공통 에러:

- `401 Unauthorized`: 인증 토큰이 없거나 유효하지 않다.
- `400 ValidationError`: 요청 값 형식이 잘못됐다.
- `404 ScheduleNotFound`: 일정이 없거나 현재 사용자 소유가 아니다.
- `404 RelatedDealNotFound`: 연결 요청한 딜이 없거나 현재 사용자 소유가 아니다.

## 4. API

### 4.1. 일정 연결용 딜 전체 목록 조회 API

일정 생성/수정 화면에서 연결할 딜을 선택하기 위한 전체 딜 목록이다.

기존 딜 목록 화면용 페이지네이션 API와 분리한다. 이 API는 일정 도메인 화면에서만 사용하는 옵션 API이며, 일정 form select/search에 필요한 최소 필드만 반환한다.

도메인 경계:

- 일정 생성/수정에서 사용하는 API이므로 `schedules` 도메인 내부 경로에 둔다.
- User Web 일정 화면은 딜 목록 화면용 API를 재사용하지 않는다.
- Backend 구현도 `schedule` 모듈 controller/service/repository 계약 안에서 제공한다.

기본 정보:

- Method: `GET`
- Path: `/api/schedules/deal-options`
- Consumer: User Web 일정 생성/수정 화면
- Transaction: 없음. 조회 전용

Request:

```http
GET /api/schedules/deal-options
Authorization: Bearer <app_access_token>
```

Query:

없음.

Response:

- Status: `200 OK`

```json
{
  "items": [
    {
      "id": "deal-a-id",
      "dealName": "Deal A",
      "createdAt": "2026-06-14T03:00:00.000Z"
    },
    {
      "id": "deal-b-id",
      "dealName": "Deal B",
      "createdAt": "2026-06-13T03:00:00.000Z"
    }
  ]
}
```

Response 필드:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | array | 아니오 | 딜 선택 옵션 목록 |
| `items[].id` | string | 아니오 | 딜 ID |
| `items[].dealName` | string | 아니오 | 딜 제목 |
| `items[].createdAt` | string | 아니오 | 등록일, ISO 8601 UTC string |

내부 비즈니스 로직:

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `Deal` 테이블에서 `userId = currentUser.id` 조건으로 딜을 조회한다.
3. 삭제된 딜 개념이 생기면 삭제된 딜은 제외한다.
4. `createdAt DESC`, `id DESC` 순서로 정렬한다.
5. 페이지네이션 없이 전체 딜을 반환한다.
6. 응답 필드는 `id`, `dealName`, `createdAt`만 포함한다.

구현 주의:

- NestJS controller에서는 `GET /api/schedules/:scheduleId`보다 `GET /api/schedules/deal-options` static route를 먼저 선언한다.

### 4.2. 월간/주간 일정 목록 조회 API

월간 또는 주간 범위에 포함되는 일정을 조회한다.

기본 정보:

- Method: `GET`
- Path: `/api/schedules`
- Consumer: User Web 일정 월간/주간 화면
- Transaction: 없음. 조회 전용

Request:

```http
GET /api/schedules?view=month&baseDate=2026-06-14&timeZone=Asia/Seoul
Authorization: Bearer <app_access_token>
```

Query:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `view` | string | 아니오 | `month`, `week` | 조회 모드. 기본값 `month` |
| `baseDate` | string | 예 | `YYYY-MM-DD` | 조회 기준 날짜 |
| `timeZone` | string | 아니오 | IANA timezone ID | 조회 범위 계산 기준 timezone. 기본값 현재 사용자 timezone |

Response:

- Status: `200 OK`

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
      "memo": "Deal A, Deal B 동시 논의",
      "deals": [
        {
          "id": "deal-a-id",
          "dealName": "Deal A"
        }
      ],
      "createdAt": "2026-06-10T03:00:00.000Z",
      "updatedAt": "2026-06-10T03:00:00.000Z"
    }
  ]
}
```

Response 필드:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | array | 아니오 | 일정 목록 |
| `items[].id` | string | 아니오 | 일정 ID |
| `items[].scheduleTitle` | string | 아니오 | 일정 제목 |
| `items[].startAt` | string | 아니오 | 시작 시각, ISO 8601 UTC string |
| `items[].endAt` | string | 아니오 | 종료 시각, ISO 8601 UTC string |
| `items[].timeZone` | string | 아니오 | 일정 입력 timezone |
| `items[].location` | string | 예 | 장소 |
| `items[].memo` | string | 예 | 메모 |
| `items[].deals` | array | 아니오 | 연결된 딜 요약 |
| `items[].deals[].id` | string | 아니오 | 딜 ID |
| `items[].deals[].dealName` | string | 아니오 | 딜 제목 |
| `items[].createdAt` | string | 아니오 | 등록일 |
| `items[].updatedAt` | string | 아니오 | 수정일 |

내부 비즈니스 로직:

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `view`가 없으면 `month`로 처리한다.
3. `timeZone`이 없으면 현재 사용자 `timeZone`을 사용한다.
4. `baseDate`와 `timeZone` 기준으로 조회 범위를 계산한다.
5. `view=month`이면 해당 월 1일 00:00부터 다음 달 1일 00:00 전까지를 범위로 한다.
6. `view=week`이면 `baseDate`가 속한 주의 월요일 00:00부터 다음 주 월요일 00:00 전까지를 범위로 한다.
7. 계산한 local range를 UTC instant range로 변환한다.
8. `Schedule.userId = currentUser.id` 조건으로 조회한다.
9. 범위 조건은 `startAt < rangeEnd` AND `endAt > rangeStart`로 처리해 범위를 걸치는 일정도 포함한다.
10. `ScheduleDeal`과 연결된 `Deal`을 함께 조회한다.
11. `startAt ASC`, `id ASC` 순서로 정렬한다.
12. 일정 목록과 연결 딜 요약을 응답으로 반환한다.

### 4.3. 일정 단건 상세 조회 API

기본 정보:

- Method: `GET`
- Path: `/api/schedules/:scheduleId`
- Consumer: User Web 일정 상세/수정 화면
- Transaction: 없음. 조회 전용

Request:

```http
GET /api/schedules/schedule-id
Authorization: Bearer <app_access_token>
```

Path Params:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleId` | string | 예 | UUID | 일정 ID |

Response:

- Status: `200 OK`

```json
{
  "id": "schedule-id",
  "scheduleTitle": "제품 데모 미팅",
  "startAt": "2026-06-14T05:00:00.000Z",
  "endAt": "2026-06-14T06:00:00.000Z",
  "timeZone": "Asia/Seoul",
  "location": "강남",
  "memo": "Deal A, Deal B 동시 논의",
  "deals": [
    {
      "id": "deal-a-id",
      "dealName": "Deal A"
    },
    {
      "id": "deal-b-id",
      "dealName": "Deal B"
    }
  ],
  "createdAt": "2026-06-10T03:00:00.000Z",
  "updatedAt": "2026-06-10T03:00:00.000Z"
}
```

내부 비즈니스 로직:

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `scheduleId`가 UUID 형식인지 검증한다.
3. `Schedule.id = scheduleId` AND `Schedule.userId = currentUser.id` 조건으로 단건 조회한다.
4. 일정이 없으면 `ScheduleNotFound`를 반환한다.
5. `ScheduleDeal`과 연결된 `Deal`을 함께 조회한다.
6. 연결 딜은 `ScheduleDeal.createdAt ASC`, `Deal.createdAt DESC` 중 하나로 일관되게 정렬한다. 기본은 `ScheduleDeal.createdAt ASC`로 한다.
7. 일정 상세와 연결 딜 요약을 응답으로 반환한다.

### 4.4. 일정 단건 생성 API

기본 정보:

- Method: `POST`
- Path: `/api/schedules`
- Consumer: User Web 일정 생성 화면
- Transaction: 필요. `Schedule` 생성과 `ScheduleDeal` 생성은 같은 transaction에서 처리한다.

Request:

```http
POST /api/schedules
Authorization: Bearer <app_access_token>
Content-Type: application/json
```

Body:

```json
{
  "scheduleTitle": "제품 데모 미팅",
  "startAt": "2026-06-14T14:00:00+09:00",
  "endAt": "2026-06-14T15:00:00+09:00",
  "timeZone": "Asia/Seoul",
  "location": "강남",
  "memo": "Deal A, Deal B 동시 논의",
  "dealIds": ["deal-a-id", "deal-b-id"]
}
```

Body 필드:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleTitle` | string | 예 | trim 후 1~100자 | 일정 제목 |
| `startAt` | string | 예 | ISO 8601 date-time with offset | 시작 시각 |
| `endAt` | string | 예 | ISO 8601 date-time with offset, `startAt`보다 이후 | 종료 시각 |
| `timeZone` | string | 예 | IANA timezone ID | 사용자가 입력한 일정 timezone |
| `location` | string \| null | 아니오 | 최대 200자 | 장소 |
| `memo` | string \| null | 아니오 | 최대 2000자 | 메모 |
| `dealIds` | string[] | 아니오 | UUID 배열, 중복 불가 | 연결할 딜 ID 목록 |

Response:

- Status: `201 Created`

```json
{
  "id": "schedule-id",
  "scheduleTitle": "제품 데모 미팅",
  "startAt": "2026-06-14T05:00:00.000Z",
  "endAt": "2026-06-14T06:00:00.000Z",
  "timeZone": "Asia/Seoul",
  "location": "강남",
  "memo": "Deal A, Deal B 동시 논의",
  "deals": [
    {
      "id": "deal-a-id",
      "dealName": "Deal A"
    },
    {
      "id": "deal-b-id",
      "dealName": "Deal B"
    }
  ],
  "createdAt": "2026-06-14T03:00:00.000Z",
  "updatedAt": "2026-06-14T03:00:00.000Z"
}
```

내부 비즈니스 로직:

1. `AuthGuard`로 현재 사용자를 확인한다.
2. request body를 검증한다.
3. `scheduleTitle`, `location`, `memo`는 trim한다.
4. 빈 문자열 `location`, `memo`는 `null`로 정규화한다.
5. `startAt`, `endAt`을 UTC instant로 변환한다.
6. `endAt`이 `startAt`보다 이후인지 검증한다.
7. `dealIds`가 있으면 중복 여부와 UUID 형식을 검증한다.
8. `dealIds`가 있으면 모든 딜이 현재 사용자 소유인지 확인한다.
9. 요청한 딜 ID 중 하나라도 없거나 현재 사용자 소유가 아니면 `RelatedDealNotFound`를 반환한다.
10. transaction을 시작한다.
11. `Schedule` row를 생성한다.
12. `dealIds`가 있으면 각 딜 ID에 대해 `ScheduleDeal` row를 생성한다.
13. transaction을 commit한다.
14. 생성된 일정 상세를 연결 딜 요약과 함께 반환한다.

### 4.5. 일정 단건 수정 API

일정 기본 정보와 연결 딜 목록을 수정한다.

`dealIds`가 요청에 포함되면 요청 배열을 수정 후 최종 연결 딜 목록으로 본다.

기본 정보:

- Method: `PATCH`
- Path: `/api/schedules/:scheduleId`
- Consumer: User Web 일정 수정 화면
- Transaction: 필요. `Schedule` 수정과 `ScheduleDeal` 추가/삭제는 같은 transaction에서 처리한다.

Request:

```http
PATCH /api/schedules/schedule-id
Authorization: Bearer <app_access_token>
Content-Type: application/json
```

Path Params:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleId` | string | 예 | UUID | 일정 ID |

Body:

```json
{
  "scheduleTitle": "제품 데모 미팅 변경",
  "startAt": "2026-06-14T14:30:00+09:00",
  "endAt": "2026-06-14T15:30:00+09:00",
  "timeZone": "Asia/Seoul",
  "location": "강남",
  "memo": "Deal A, Deal C 논의",
  "dealIds": ["deal-a-id", "deal-c-id"]
}
```

Body 필드:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleTitle` | string | 아니오 | trim 후 1~100자 | 일정 제목 |
| `startAt` | string | 아니오 | ISO 8601 date-time with offset | 시작 시각 |
| `endAt` | string | 아니오 | ISO 8601 date-time with offset | 종료 시각 |
| `timeZone` | string | 아니오 | IANA timezone ID | 일정 timezone |
| `location` | string \| null | 아니오 | 최대 200자 | 장소. `null`이면 제거 |
| `memo` | string \| null | 아니오 | 최대 2000자 | 메모. `null`이면 제거 |
| `dealIds` | string[] | 아니오 | UUID 배열, 중복 불가 | 수정 후 최종 연결 딜 ID 목록 |

Response:

- Status: `200 OK`

```json
{
  "id": "schedule-id",
  "scheduleTitle": "제품 데모 미팅 변경",
  "startAt": "2026-06-14T05:30:00.000Z",
  "endAt": "2026-06-14T06:30:00.000Z",
  "timeZone": "Asia/Seoul",
  "location": "강남",
  "memo": "Deal A, Deal C 논의",
  "deals": [
    {
      "id": "deal-a-id",
      "dealName": "Deal A"
    },
    {
      "id": "deal-c-id",
      "dealName": "Deal C"
    }
  ],
  "createdAt": "2026-06-10T03:00:00.000Z",
  "updatedAt": "2026-06-14T04:00:00.000Z"
}
```

내부 비즈니스 로직:

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `scheduleId`가 UUID 형식인지 검증한다.
3. request body에 수정 가능한 필드가 최소 1개 이상 있는지 검증한다.
4. `Schedule.id = scheduleId` AND `Schedule.userId = currentUser.id` 조건으로 기존 일정을 조회한다.
5. 일정이 없으면 `ScheduleNotFound`를 반환한다.
6. 요청된 기본 정보 필드를 정규화한다.
7. `startAt`, `endAt`, `timeZone`은 요청에 없는 값은 기존 일정 값을 사용해 최종 값을 만든다.
8. 최종 `startAt`, `endAt` 기준으로 `endAt`이 `startAt`보다 이후인지 검증한다.
9. `dealIds`가 요청에 없으면 기존 `ScheduleDeal` 연결은 유지한다.
10. `dealIds`가 요청에 있으면 중복 여부와 UUID 형식을 검증한다.
11. `dealIds`가 빈 배열이면 해당 일정의 모든 딜 연결을 제거 대상으로 본다.
12. `dealIds`가 요청에 있으면 모든 딜이 현재 사용자 소유인지 확인한다.
13. 요청한 딜 ID 중 하나라도 없거나 현재 사용자 소유가 아니면 `RelatedDealNotFound`를 반환한다.
14. transaction을 시작한다.
15. `Schedule` 기본 정보를 수정한다.
16. `dealIds`가 요청에 있으면 현재 `ScheduleDeal` 목록과 요청 `dealIds`를 비교한다.
17. 요청에는 있지만 현재 연결에 없는 딜 ID는 `ScheduleDeal`에 추가한다.
18. 현재 연결에는 있지만 요청에서 빠진 딜 ID는 `ScheduleDeal`에서 삭제한다.
19. 현재 연결에도 있고 요청에도 있는 딜 ID는 유지한다.
20. transaction을 commit한다.
21. 수정된 일정 상세를 연결 딜 요약과 함께 반환한다.

예시:

- 기존 연결: `["deal-a-id", "deal-b-id"]`
- 수정 요청: `["deal-a-id", "deal-c-id"]`
- 처리 결과:
  - `deal-a-id` 연결 유지
  - `deal-b-id` 연결 삭제
  - `deal-c-id` 연결 추가

### 4.6. 일정 단건 삭제 API

일정을 실제 DB row에서 삭제한다. 휴지통이나 soft delete가 아니다.

기본 정보:

- Method: `DELETE`
- Path: `/api/schedules/:scheduleId`
- Consumer: User Web 일정 삭제 액션
- Transaction: 필요. `ScheduleDeal` 삭제와 `Schedule` 삭제를 같은 transaction에서 처리한다.

Request:

```http
DELETE /api/schedules/schedule-id
Authorization: Bearer <app_access_token>
```

Path Params:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `scheduleId` | string | 예 | UUID | 일정 ID |

Response:

- Status: `204 No Content`
- Body: 없음

내부 비즈니스 로직:

1. `AuthGuard`로 현재 사용자를 확인한다.
2. `scheduleId`가 UUID 형식인지 검증한다.
3. `Schedule.id = scheduleId` AND `Schedule.userId = currentUser.id` 조건으로 기존 일정을 조회한다.
4. 일정이 없으면 `ScheduleNotFound`를 반환한다.
5. transaction을 시작한다.
6. `ScheduleDeal.scheduleId = scheduleId` AND `ScheduleDeal.userId = currentUser.id` 조건으로 연결 row를 삭제한다.
7. `Schedule.id = scheduleId` AND `Schedule.userId = currentUser.id` 조건으로 `Schedule` row를 실제 삭제한다.
8. transaction을 commit한다.
9. `204 No Content`를 반환한다.

구현 방식:

- FK cascade를 쓰는 경우에도 ownership 검증은 삭제 전에 반드시 수행한다.
- FK cascade를 쓰지 않는 경우 `ScheduleDeal`을 먼저 삭제한 뒤 `Schedule`을 삭제한다.

## 5. 현재 범위 밖

- Google Calendar 실연동
- 일정 알림
- 반복 일정
- 참석자 관리
- 일정 휴지통
- 딜 연결 개별 추가/삭제 API
- 일정별 활동 로그 자동 생성
