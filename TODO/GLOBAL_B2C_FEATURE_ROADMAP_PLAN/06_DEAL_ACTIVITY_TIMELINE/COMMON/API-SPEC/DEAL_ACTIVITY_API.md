# Deal Activity API

계약 상태: implemented
확정일: 2026-07-25
Backend 구현일: 2026-07-26
User Web 구현일: 2026-07-26
소비자: User Web
호환성: 신규 API. 기존 Deal API와 following-action/memo API는 즉시 제거하지 않는다.

## 1. 공통 DTO

### DealActivityType

```text
DEAL_CREATED
STAGE_CHANGED
NEXT_ACTION_CREATED
NEXT_ACTION_COMPLETION_CHANGED
SCHEDULE_LINKED
SCHEDULE_UNLINKED
MEETING_NOTE_LINKED
MEETING_NOTE_UNLINKED
FOLLOW_UP_SENT
FOLLOW_UP_FAILED
CALL
MEETING
EMAIL
VISIT
NOTE
```

### DealActivitySourceType

```text
SYSTEM
USER
NEXT_ACTION
SCHEDULE
MEETING_NOTE
FOLLOW_UP
```

### DealActivityLinkedRecord

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `targetType` | string | 필수 | `DEAL`, `SCHEDULE`, `MEETING_NOTE`, `CONTACT`, `COMPANY`, `PRODUCT`, `FOLLOW_UP_MESSAGE` 중 하나 |
| `targetId` | string | 필수 | target UUID |
| `targetPath` | string | 필수 | User Web route |
| `targetLabel` | string \| null | 필수 | 화면 표시 label |

### DealActivityResponse

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | activity ID |
| `dealId` | string | 딜 ID |
| `activityType` | DealActivityType | activity 유형 |
| `sourceType` | DealActivitySourceType | 생성 출처 |
| `sourceId` | string \| null | 원본 event/source record ID. follow-up 발송 성공/실패는 `FollowUpDeliveryAttempt.id` |
| `title` | string | timeline 제목 |
| `summary` | string \| null | 안전한 짧은 요약 |
| `body` | string \| null | 수동 activity 본문. 자동 activity는 null을 기본으로 한다. 목록 summary에는 포함하지 않는다. |
| `occurredAt` | string | ISO 8601 UTC instant |
| `isEditable` | boolean | 수동 activity 수정 가능 여부 |
| `linkedRecords` | DealActivityLinkedRecord[] | 연결 record |
| `createdAt` | string | ISO 8601 UTC instant |
| `updatedAt` | string | ISO 8601 UTC instant |

## 2. 딜 활동 목록 조회

- API 이름: 딜 활동 목록 조회 API
- API 식별자: ListDealActivities
- 계약 상태: implemented
- Method: GET
- Path: `/api/deals/:dealId/activities`
- 인증: AuthGuard

### Request

Request 이름: `ListDealActivitiesRequest`

Path param:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `dealId` | string | 필수 | UUID |

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `cursor` | string | 선택 | 이전 응답의 `nextCursor`. FE가 파싱하지 않는 opaque cursor |
| `type` | DealActivityType | 선택 | 특정 유형 filter. 1차 FE에서는 optional |

Paging:

- page size: 10
- `take` 기준: 11개 조회 후 10개 반환
- cursor payload 기준: `occurredAt`, `id`
- cursor 문자열은 서버가 발급하고 FE는 그대로 다시 전달한다.
- cursor는 같은 filter 조건 안에서만 유효하다. `type` filter가 바뀌면 FE는 cursor를 버리고 첫 페이지부터 다시 조회한다.

Request 예시:

```http
GET /api/deals/8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111/activities?cursor=eyJvY2N1cnJlZEF0IjoiMjAyNi0wNy0yNVQwNTowMDowMC4wMDBaIiwiaWQiOiIxZjljMGNmOC0zNDdmLTQzOTQtYjdiMS01ZWViMWE2YTAyYTAifQ
Authorization: Bearer <access-token>
```

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `dealId`가 현재 사용자 소유 active 딜인지 확인한다.
3. cursor가 있으면 cursor를 `occurredAt`, `id` 기준으로 해석한다.
4. `DealActivity`를 `occurredAt desc, id desc`로 page size + 1개 조회한다.
5. source record가 삭제됐거나 접근 불가이면 activity row는 반환하되 해당 linked record/detail은 포함하지 않는다.
6. private memo 원문, provider raw detail, follow-up body 전체는 포함하지 않는다.
7. `linkedRecordsJson`이 null이면 `linkedRecords=[]`로 변환한다.
8. response DTO로 변환한다.

### Response

Response 이름: `DealActivityListResponse`
Status: 200

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | DealActivityResponse[] | timeline item |
| `nextCursor` | string \| null | 다음 cursor |
| `hasNext` | boolean | 다음 page 여부 |

Response 예시:

```json
{
  "items": [
    {
      "id": "1f9c0cf8-347f-4394-b7b1-5eeb1a6a02a0",
      "dealId": "8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
      "activityType": "FOLLOW_UP_SENT",
      "sourceType": "FOLLOW_UP",
      "sourceId": "2dcf6d3f-2e6e-4c4d-b7df-52b8f24e6333",
      "title": "이메일 follow-up을 보냈어요.",
      "summary": "김민수 담당자에게 발송됨",
      "body": null,
      "occurredAt": "2026-07-25T05:00:00.000Z",
      "isEditable": false,
      "linkedRecords": [
        {
          "targetType": "DEAL",
          "targetId": "8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
          "targetPath": "/app/deals/8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
          "targetLabel": "7월 신규 도입 상담"
        }
      ],
      "createdAt": "2026-07-25T05:00:02.000Z",
      "updatedAt": "2026-07-25T05:00:02.000Z"
    }
  ],
  "nextCursor": "eyJvY2N1cnJlZEF0IjoiMjAyNi0wNy0yNVQwNTowMDowMC4wMDBaIiwiaWQiOiIxZjljMGNmOC0zNDdmLTQzOTQtYjdiMS01ZWViMWE2YTAyYTAifQ",
  "hasNext": true
}
```

### 연결된 DB 스키마

- 조회: `Deal`, `DealActivity`
- 참조: source type에 따라 `Schedule`, `MeetingNote`, `FollowUpMessage`, `FollowUpDeliveryAttempt`, `DealFollowingActionLog`

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `deal.activity.listed`
- request id: 사용
- redaction: activity body/title 원문 logging 금지. count/type/cursor 여부만 log

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | Unauthorized | 401 |
| 딜 없음 또는 타 사용자 딜 | DealNotFound | 404 |
| cursor 형식 오류 | ValidationError | 400 |
| type enum 오류 | ValidationError | 400 |

### FE/BE 처리 기준

- FE: 딜 상세 timeline query key는 `deal.activities(dealId)`로 둔다.
- FE: empty/loading/error/success 상태를 가진다.
- BE: repository는 userId/dealId 조건을 항상 포함한다.

## 3. 수동 딜 활동 생성

- API 이름: 수동 딜 활동 생성 API
- API 식별자: CreateManualDealActivity
- 계약 상태: implemented
- Method: POST
- Path: `/api/deals/:dealId/activities`
- 인증: AuthGuard

### Request

Request 이름: `CreateManualDealActivityRequest`

Path param:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `dealId` | string | 필수 | UUID |

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `activityType` | `CALL` \| `MEETING` \| `EMAIL` \| `VISIT` \| `NOTE` | 필수 | 수동 activity type |
| `title` | string | 필수 | trim 후 1~120자 |
| `body` | string \| null | 선택 | trim 후 0~2000자. 빈 문자열은 null 저장. 원문 logging 금지 |
| `occurredAt` | string | 선택 | ISO 8601 UTC instant. 없으면 now. 서버 현재 시각보다 5분 이상 미래면 거부 |

Request body 예시:

```json
{
  "activityType": "CALL",
  "title": "도입 일정 확인 통화",
  "body": "다음 주 화요일까지 내부 검토 후 회신받기로 함",
  "occurredAt": "2026-07-25T04:30:00.000Z"
}
```

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 딜이 현재 사용자 소유 active 딜인지 확인한다.
3. manual type만 허용한다.
4. title/body/occurredAt을 validation한다.
5. transaction 안에서 `DealActivity(sourceType=USER)`를 생성한다.
6. response DTO를 반환한다.

### Response

Response 이름: `DealActivityResponse`
Status: 201

Response 예시:

```json
{
  "id": "4e0c8fdc-91c3-4f96-9698-2aa32e8c5f77",
  "dealId": "8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
  "activityType": "CALL",
  "sourceType": "USER",
  "sourceId": null,
  "title": "도입 일정 확인 통화",
  "summary": null,
  "body": "다음 주 화요일까지 내부 검토 후 회신받기로 함",
  "occurredAt": "2026-07-25T04:30:00.000Z",
  "isEditable": true,
  "linkedRecords": [
    {
      "targetType": "DEAL",
      "targetId": "8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
      "targetPath": "/app/deals/8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
      "targetLabel": "7월 신규 도입 상담"
    }
  ],
  "createdAt": "2026-07-25T04:31:00.000Z",
  "updatedAt": "2026-07-25T04:31:00.000Z"
}
```

### 연결된 DB 스키마

- 조회: `Deal`
- 생성: `DealActivity`
- transaction: `DealActivity`

### Transaction

- 필요 여부: 필요
- 이유: 사용자 활동 생성은 activity 정본을 쓰는 mutation이다.
- rollback 범위: `DealActivity` 생성 전체
- 외부 Provider: 없음
- audit log: 없음

### Observability

- log event key: `deal.activity.manual_created`
- redaction: title/body 원문 logging 금지

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | Unauthorized | 401 |
| 딜 없음 또는 타 사용자 딜 | DealNotFound | 404 |
| 자동 type 요청 | ValidationError | 400 |
| title 누락/길이 초과 | ValidationError | 400 |
| body 길이 초과 | ValidationError | 400 |
| occurredAt 형식 오류 또는 과도한 미래 시각 | ValidationError | 400 |

### FE/BE 처리 기준

- FE: 성공 후 `deal.activities(dealId)`를 invalidate한다.
- FE: toast는 `활동을 남겼어요.`를 사용한다.
- BE: sourceType은 `USER`, isEditable은 true로 계산한다.

## 4. 수동 딜 활동 수정

- API 이름: 수동 딜 활동 수정 API
- API 식별자: UpdateManualDealActivity
- 계약 상태: implemented
- Method: PATCH
- Path: `/api/deals/:dealId/activities/:activityId`
- 인증: AuthGuard

### Request

Request 이름: `UpdateManualDealActivityRequest`

Path param:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `dealId` | string | 필수 | UUID |
| `activityId` | string | 필수 | UUID |

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `activityType` | `CALL` \| `MEETING` \| `EMAIL` \| `VISIT` \| `NOTE` | 선택 | 수동 type만 허용 |
| `title` | string | 선택 | trim 후 1~120자 |
| `body` | string \| null | 선택 | null 또는 trim 후 빈 문자열이면 본문 비움 |
| `occurredAt` | string | 선택 | ISO 8601 UTC instant. 서버 현재 시각보다 5분 이상 미래면 거부 |

Request body 예시:

```json
{
  "activityType": "MEETING",
  "title": "도입 범위 재확인 미팅",
  "body": "의사결정자는 대표와 영업팀장으로 확인됨",
  "occurredAt": "2026-07-25T06:00:00.000Z"
}
```

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 딜과 activity가 현재 사용자 소유인지 확인한다.
3. `sourceType=USER` activity만 수정할 수 있다.
4. 요청 body에 최소 한 필드가 있어야 한다.
5. transaction 안에서 activity를 수정한다.
6. response DTO를 반환한다.

### Response

Response 이름: `DealActivityResponse`
Status: 200

Response 예시:

```json
{
  "id": "4e0c8fdc-91c3-4f96-9698-2aa32e8c5f77",
  "dealId": "8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
  "activityType": "MEETING",
  "sourceType": "USER",
  "sourceId": null,
  "title": "도입 범위 재확인 미팅",
  "summary": null,
  "body": "의사결정자는 대표와 영업팀장으로 확인됨",
  "occurredAt": "2026-07-25T06:00:00.000Z",
  "isEditable": true,
  "linkedRecords": [
    {
      "targetType": "DEAL",
      "targetId": "8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
      "targetPath": "/app/deals/8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
      "targetLabel": "7월 신규 도입 상담"
    }
  ],
  "createdAt": "2026-07-25T04:31:00.000Z",
  "updatedAt": "2026-07-25T06:05:00.000Z"
}
```

### 연결된 DB 스키마

- 조회: `Deal`, `DealActivity`
- 수정: `DealActivity`

### Transaction

- 필요 여부: 필요
- 이유: 수동 activity 정본 변경이다.
- rollback 범위: `DealActivity` 수정 전체
- 외부 Provider: 없음

### Observability

- log event key: `deal.activity.manual_updated`
- redaction: title/body 원문 logging 금지

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | Unauthorized | 401 |
| 딜/activity 없음 또는 타 사용자 리소스 | DealActivityNotFound | 404 |
| 자동 activity 수정 시도 | DealActivityNotEditable | 409 |
| 수정 필드 없음 | ValidationError | 400 |
| occurredAt 형식 오류 또는 과도한 미래 시각 | ValidationError | 400 |

### FE/BE 처리 기준

- FE: 성공 후 `deal.activities(dealId)`를 invalidate한다.
- FE: toast는 `활동을 저장했어요.`를 사용한다.
- BE: 자동 activity는 수정하지 않는다.

## 5. 자동 activity 생성 내부 계약

자동 activity는 별도 public endpoint가 아니라 각 mutation use case 안에서 생성한다.

| Trigger | Activity type | Transaction |
|---|---|---|
| 딜 생성 | `DEAL_CREATED` | Deal 생성 transaction |
| 딜 단계 변경 | `STAGE_CHANGED` | Deal update transaction |
| 다음 행동 생성 | `NEXT_ACTION_CREATED` | FollowingActionLog 생성 transaction |
| 다음 행동 완료 변경 | `NEXT_ACTION_COMPLETION_CHANGED` | FollowingActionLog update transaction |
| 일정 연결 | `SCHEDULE_LINKED` | ScheduleDeal 변경 transaction |
| 일정 연결 해제 | `SCHEDULE_UNLINKED` | ScheduleDeal 변경 transaction |
| 회의록 연결 | `MEETING_NOTE_LINKED` | MeetingNoteDeal 변경 transaction |
| 회의록 연결 해제 | `MEETING_NOTE_UNLINKED` | MeetingNoteDeal 변경 transaction. delete/recreate 구현이면 삭제 전 diff 계산 |
| follow-up 발송 성공 | `FOLLOW_UP_SENT` | FollowUpMessage/FollowUpDeliveryAttempt 상태 변경 transaction. `DEAL` target이 있는 메시지만. sourceId는 `FollowUpDeliveryAttempt.id` |
| follow-up 발송 실패 | `FOLLOW_UP_FAILED` | FollowUpMessage/FollowUpDeliveryAttempt 상태 변경 transaction. `DEAL` target이 있는 메시지만. sourceId는 `FollowUpDeliveryAttempt.id` |

자동 생성 시 title/summary는 Backend에서 안전한 문구로 만든다. source 원문 전문을 그대로 복사하지 않는다.
딜 생성 API가 초기 `DealFollowingActionLog`를 함께 만들면 `DEAL_CREATED`와 `NEXT_ACTION_CREATED`를 같은 transaction에서 모두 생성한다.
follow-up은 `FollowUpMessage.id`를 `metadataJson.messageId`에 남기고, 전송 시도별 이력은 `FollowUpDeliveryAttempt.id`를 `sourceId`로 구분한다.
기존 mutation이 이미 `DealFollowingActionLog`를 만들고 있으면 G01에서 중복 노출 여부를 확인하고, 06의 정본은 `DealActivity`로 둔다.
회의록 연결에서 기존 `DealFollowingActionLog.followingAction` 문구를 activity summary로 재사용하지 않는다.
