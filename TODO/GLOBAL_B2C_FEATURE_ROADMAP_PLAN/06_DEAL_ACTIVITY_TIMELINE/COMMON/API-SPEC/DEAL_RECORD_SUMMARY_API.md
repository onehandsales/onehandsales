# Deal Record Summary API

계약 상태: implemented
확정일: 2026-07-25
Backend 구현일: 2026-07-26
소비자: User Web
호환성: 기존 list response field 추가. 기존 필드는 제거하지 않는다.

## 1. 목적

`NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-001`, `NBA-002`, `NBA-008`과 `NBA-003` 중 Deal latest activity subset을 DealActivity 정본 위에 반영한다.

원본 `NBA-003`의 Company/Contact/Product latest summary, latest memo summary, next action summary, generic summary endpoint는 06 범위가 아니다. 이 제외 기준은 `COMMON/SOURCE-PLAN-COVERAGE.md`를 따른다.

G05/G06에서 구현하며, G02~G04의 DealActivity timeline 구현이 선행된다.

## 2. `GET /api/deals` response 확장

- API 이름: 딜 목록 summary 확장 API
- API 식별자: ListDealsWithRecordSummary
- 계약 상태: confirmed
- Method: GET
- Path: `/api/deals`
- 인증: AuthGuard

### Request

기존 `GET /api/deals` query를 유지한다.

Request 예시:

```http
GET /api/deals?page=1&search=%EB%8F%84%EC%9E%85&dealStatus=PROPOSAL_QUOTE
Authorization: Bearer <access-token>
```

### Response 변경

기존 `DealListItemResponse`에 아래 필드를 추가한다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `products` | DealProductSummary[] | 딜에 연결된 제품 summary. 삭제 상태는 `isDeleted`로 표시 |
| `latestActivity` | DealLatestActivitySummary \| null | 최신 activity summary |

### DealProductSummary

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 제품 ID |
| `productName` | string | 제품명 |
| `isDeleted` | boolean | 제품 삭제 여부 |
| `productCategory` | `{ id: string; categoryName: string }` \| null | 카테고리 summary |
| `productStatus` | `{ id: string; statusName: string }` \| null | 판매 상태 summary |

### DealLatestActivitySummary

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | activity ID |
| `activityType` | DealActivityType | activity type |
| `title` | string | 안전한 제목 |
| `summary` | string \| null | 안전한 짧은 요약 |
| `occurredAt` | string | ISO 8601 UTC instant |

Response item 예시:

기존 list wrapper와 기존 필드는 유지한다. 아래는 G05에서 item에 추가되는 필드 모양이다.

```json
{
  "id": "8f9d5b4c-7c6b-4d30-8a70-2a9f8b62c111",
  "dealName": "7월 신규 도입 상담",
  "products": [
    {
      "id": "9d140f31-5a9b-42d8-9b7e-d62ed81e9120",
      "productName": "Sales Starter",
      "isDeleted": false,
      "productCategory": {
        "id": "3a0bbd83-f401-4f06-8934-577626632aa0",
        "categoryName": "SaaS"
      },
      "productStatus": {
        "id": "11e79f79-3132-497f-b5c4-c770ffb48d21",
        "statusName": "판매중"
      }
    }
  ],
  "latestActivity": {
    "id": "1f9c0cf8-347f-4394-b7b1-5eeb1a6a02a0",
    "activityType": "FOLLOW_UP_SENT",
    "title": "이메일 follow-up을 보냈어요.",
    "summary": "김민수 담당자에게 발송됨",
    "occurredAt": "2026-07-25T05:00:00.000Z"
  }
}
```

### 비즈니스 로직 흐름

1. 기존 list query validation, search, filter, sort를 유지한다.
2. user ownership과 soft delete 제외 조건을 유지한다.
3. 현재 page의 deal IDs에 대해서만 products와 latest activity를 aggregation 조회한다.
4. products summary는 기존 `DealProduct` 관계를 사용한다.
5. latest activity는 현재 사용자 active deal에 속한 `DealActivity`의 최신 row를 사용한다.
6. private memo/provider raw/follow-up body/meeting note raw text는 latest summary에 포함하지 않는다.

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: 기존 `deal.listed` 유지 또는 `deal.listed` metadata 확장
- redaction: products name은 response에는 포함하지만 log에는 row count만 남긴다.

### FE 처리

- 딜 목록 row/card에서 연결 제품과 최신 activity를 표시한다.
- API 응답이 null이면 FE에서 임의 summary를 만들지 않는다.
- 모바일은 card/list 안에 짧게 표시한다.

## 3. `GET /api/contacts` response 확장

- API 이름: 담당자 목록 dealCount 확장 API
- API 식별자: ListContactsWithDealCount
- 계약 상태: confirmed
- Method: GET
- Path: `/api/contacts`
- 인증: AuthGuard

### Request

기존 `GET /api/contacts` query를 유지한다.

Request 예시:

```http
GET /api/contacts?page=1&username=%EA%B9%80%EB%AF%BC%EC%88%98
Authorization: Bearer <access-token>
```

### Response 변경

기존 contact list item에 아래 필드를 추가한다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `dealCount` | number | 현재 사용자 소유 active deal 중 이 담당자와 연결된 deal 수 |

Response item 예시:

기존 list wrapper와 기존 필드는 유지한다. 아래는 G05에서 item에 추가되는 필드 모양이다.

```json
{
  "id": "1ec35fb8-6a55-4f55-8208-d5fda00f2364",
  "username": "김민수",
  "dealCount": 3
}
```

### 비즈니스 로직 흐름

1. 기존 contact list query를 유지한다.
2. 현재 page의 contact IDs에 대해서만 `DealContact` aggregation을 수행한다.
3. soft-deleted deal은 제외한다.
4. 타 사용자 deal은 제외한다.

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: 기존 contact list event 유지
- redaction: contact email/phone 원문 logging 금지

### FE 처리

- 담당자 목록에 연결 딜 수를 표시한다.
- API 응답에 `dealCount`가 없으면 표시하지 않는다. FE 추정 금지.

## 4. Page size 15 계약

06에서 page size 15를 바꿀지 여부를 다시 정하지 않는다. 현재 계약을 유지하고 문서/테스트 불일치를 정리한다.

필수 확인:

- Backend list service constant가 15인지 확인한다.
- Response `pageSize`가 실제 take와 일치한다.
- FE Pagination이 response `pageSize`, `totalCount`, `totalPages`를 기준으로 동작한다.
- FE에서 page size 숫자만 단독 변경하지 않는다.
- E2E/mock data도 15개 기준과 충돌하지 않는다.

## 5. 에러 응답

기존 list API 에러 계약을 유지한다.

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | Unauthorized | 401 |
| query validation 실패 | ValidationError | 400 |

## 6. 검증 기준

- Deal list products summary는 다른 사용자 제품/딜을 포함하지 않는다.
- latest activity summary는 private memo/provider raw/follow-up body 전체를 포함하지 않는다.
- Contact dealCount는 soft-deleted deal을 제외한다.
- Page size 15가 FE/BE/test에서 일치한다.
