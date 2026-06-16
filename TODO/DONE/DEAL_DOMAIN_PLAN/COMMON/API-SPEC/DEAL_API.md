# Deal API

## 1. 계약 상태

- Contract status: `implemented`
- Consumer: `FE/user-web`
- Provider: `BE` NestJS User API
- Base path: `/api`
- Auth: `Authorization: Bearer <appAccessToken>`
- Page size: 10
- 기준일: 2026-06-16

## 2. 공통 원칙

- 모든 API는 access token의 `userId`를 기준으로 ownership을 제한한다.
- User Web은 `/api/*`만 호출한다.
- FK로 조회한 회사, 담당자, 제품, 다음 행동은 flat field가 아니라 nested object 또는 object array로 응답한다.
- DB의 Deal 상태는 string이다. DB enum을 사용하지 않는다.
- API request/response의 Deal 상태 값은 영어 code를 사용한다.
- UI는 Backend가 함께 내려주는 label 또는 Frontend enum mapper로 한국어 label을 표시한다.
- `expectedEndDate`는 `YYYY-MM-DD`만 허용한다.
- 목록과 export의 딜 검색은 `dealName`만 대상으로 한다.
- 목록과 export의 필터는 `companyId`, `contactId`, `dealStatus`를 대상으로 한다.
- stage counts는 `search`, `companyId`, `contactId`를 반영한다. `dealStatus`는 stage tab 선택값이므로 stage counts query에는 포함하지 않는다.
- export는 목록 조건 중 검색/필터/정렬을 반영하되 page는 반영하지 않는다.
- export에는 id, 제품, 최근수정일을 포함하지 않는다.

## 3. DealStatus

| API code | UI label |
|---|---|
| `INITIAL_CONTACT` | 초기 접촉 |
| `NEEDS_CHECK` | 니즈 확인 |
| `PROPOSAL_QUOTE` | 제안/견적 |
| `NEGOTIATION` | 협상 |
| `WON` | 성사 |
| `LOST` | 실패 |

## 4. Endpoint 요약

| No | Method | Path | 목적 | 상태 |
|---:|---|---|---|---|
| 1 | GET | `/api/deals/stage-counts` | 딜 단계별 개수 조회 | implemented |
| 2 | GET | `/api/deals` | 딜 목록 페이지네이션 조회 | implemented |
| 3 | GET | `/api/deals/:dealId` | 딜 단건 상세 조회 | implemented |
| 4 | POST | `/api/deals` | 딜 단건 생성 | implemented |
| 5 | PATCH | `/api/deals/:dealId` | 딜 단건 수정 | implemented |
| 6 | GET | `/api/deals/company-options` | 회사 전체 목록 조회 | implemented |
| 7 | GET | `/api/deals/contact-options` | 담당자 전체 목록 조회 | implemented |
| 8 | GET | `/api/deals/product-options` | 제품 전체 목록 조회 | implemented |
| 9 | GET | `/api/deals/export/xlsx` | 딜 목록 xlsx export | implemented |
| 10 | GET | `/api/deals/:dealId/following-action-logs` | 딜 다음 행동 로그 전체 목록 조회 | implemented |
| 11 | POST | `/api/deals/:dealId/following-action-logs` | 딜 다음 행동 로그 단건 생성 | implemented |
| 12 | PATCH | `/api/deals/:dealId/following-action-logs/:followingActionLogId` | 딜 다음 행동 로그 단건 수정 | implemented |
| 13 | GET | `/api/deals/:dealId/memo-logs` | 딜 메모 로그 전체 목록 조회 | implemented |
| 14 | POST | `/api/deals/:dealId/memo-logs` | 딜 메모 로그 단건 생성 | implemented |
| 15 | PATCH | `/api/deals/:dealId/memo-logs/:memoLogId` | 딜 메모 로그 단건 수정 | implemented |

## 5. 공통 객체

### 5.1 CompanyObject

```json
{
  "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0211",
  "companyName": "A회사"
}
```

### 5.2 ContactObject

```json
{
  "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0212",
  "username": "송재근",
  "companyId": "018f1c59-7f32-7b44-b2d2-2d4b589c0211",
  "contactDepartment": {
    "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0213",
    "departmentName": "부장"
  }
}
```

### 5.3 ProductObject

```json
{
  "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0214",
  "productName": "프리미엄 상품"
}
```

### 5.4 ProductsObjectArray

```json
[
  {
    "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0214",
    "productName": "프리미엄 상품"
  },
  {
    "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0217",
    "productName": "추가 상품"
  }
]
```

### 5.5 LatestFollowingActionObject

```json
{
  "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0215",
  "followingAction": "제안서 발송",
  "checkComplete": false,
  "createdAt": "2026-06-12T10:00:00.000Z"
}
```

## 6. API 계약

### 6.1 GET `/api/deals/stage-counts`

딜 상태별 개수를 조회한다.

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `search` | string | 아니오 | `dealName` 검색 |
| `companyId` | uuid | 아니오 | 회사 필터 |
| `contactId` | uuid | 아니오 | 담당자 필터 |

Response `200`:

```json
{
  "items": [
    { "dealStatus": "INITIAL_CONTACT", "dealStatusLabel": "초기 접촉", "count": 3 },
    { "dealStatus": "NEEDS_CHECK", "dealStatusLabel": "니즈 확인", "count": 1 },
    { "dealStatus": "PROPOSAL_QUOTE", "dealStatusLabel": "제안/견적", "count": 0 },
    { "dealStatus": "NEGOTIATION", "dealStatusLabel": "협상", "count": 0 },
    { "dealStatus": "WON", "dealStatusLabel": "성사", "count": 0 },
    { "dealStatus": "LOST", "dealStatusLabel": "실패", "count": 0 }
  ]
}
```

### 6.2 GET `/api/deals`

딜 목록을 10개씩 페이지네이션 조회한다. 제품은 응답하지 않는다.

Query:

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---:|---|---|
| `page` | number | 아니오 | `1` | 1 이상 integer |
| `search` | string | 아니오 |  | `dealName` 검색 |
| `companyId` | uuid | 아니오 |  | 회사 필터 |
| `contactId` | uuid | 아니오 |  | 담당자 필터 |
| `dealStatus` | DealStatus | 아니오 |  | 상태 필터 |
| `sort` | string | 아니오 | `createdAtDesc` | `createdAtDesc`, `dealCostDesc`, `dealCostAsc`, `expectedEndDateAsc` |

Response `200`:

```json
{
  "items": [
    {
      "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0201",
      "dealName": "A회사 신규 도입",
      "dealCost": 3000000,
      "dealStatus": "INITIAL_CONTACT",
      "dealStatusLabel": "초기 접촉",
      "expectedEndDate": "2026-01-05",
      "company": {
        "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0211",
        "companyName": "A회사"
      },
      "contact": {
        "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0212",
        "username": "송재근",
        "contactDepartment": {
          "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0213",
          "departmentName": "부장"
        }
      },
      "latestFollowingAction": {
        "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0215",
        "followingAction": "제안서 발송",
        "checkComplete": false,
        "createdAt": "2026-06-12T10:00:00.000Z"
      },
      "createdAt": "2026-06-12T10:00:00.000Z",
      "updatedAt": "2026-06-12T10:20:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

### 6.3 GET `/api/deals/:dealId`

딜 상세를 조회한다. 상세에는 제품 객체 배열을 포함한다.

Path:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `dealId` | uuid | 예 | Deal id |

Response `200`:

```json
{
  "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0201",
  "dealName": "A회사 신규 도입",
  "dealCost": 3000000,
  "dealStatus": "INITIAL_CONTACT",
  "dealStatusLabel": "초기 접촉",
  "expectedEndDate": "2026-01-05",
  "company": {
    "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0211",
    "companyName": "A회사"
  },
  "contact": {
    "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0212",
    "username": "송재근",
    "contactDepartment": {
      "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0213",
      "departmentName": "부장"
    }
  },
  "products": [
    {
      "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0214",
      "productName": "프리미엄 상품"
    },
    {
      "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0217",
      "productName": "추가 상품"
    }
  ],
  "createdAt": "2026-06-12T10:00:00.000Z",
  "updatedAt": "2026-06-12T10:20:00.000Z"
}
```

### 6.4 POST `/api/deals`

딜을 생성하고 최초 다음 행동 로그를 함께 생성한다.

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `dealName` | string | 예 | 1자 이상 |
| `dealCost` | number | 예 | 0 이상 integer |
| `companyId` | uuid | 예 | 본인 소유 회사 |
| `contactId` | uuid | 예 | 본인 소유 담당자 |
| `productIds` | uuid[] | 예 | 본인 소유 제품 ID 배열, 1개 이상 |
| `dealStatus` | DealStatus | 예 | 영어 code |
| `followingAction` | string | 예 | 최초 다음 행동 |
| `expectedEndDate` | string | 예 | `YYYY-MM-DD` |

Response `201`: `DealDetailResponse`

### 6.5 PATCH `/api/deals/:dealId`

딜 기본 정보와 연결 제품 목록을 수정한다. `productIds`가 전달되면 기존 딜-제품 연결을 새 배열로 교체한다.

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `dealName` | string | 아니오 | 1자 이상 |
| `dealCost` | number | 아니오 | 0 이상 integer |
| `companyId` | uuid | 아니오 | 본인 소유 회사 |
| `contactId` | uuid | 아니오 | 본인 소유 담당자 |
| `productIds` | uuid[] | 아니오 | 본인 소유 제품 ID 배열, 1개 이상 |
| `expectedEndDate` | string | 아니오 | `YYYY-MM-DD` |
| `dealStatus` | DealStatus | 아니오 | 영어 code |

Response `200`: `DealDetailResponse`

### 6.6 GET `/api/deals/company-options`

딜 form에서 사용할 회사 전체 목록을 `createdAt DESC`로 조회한다.

Response `200`:

```json
{
  "items": [
    { "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0211", "companyName": "A회사" }
  ]
}
```

### 6.7 GET `/api/deals/contact-options`

딜 form에서 사용할 담당자 전체 목록을 `createdAt DESC`로 조회한다.

Response `200`:

```json
{
  "items": [
    {
      "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0212",
      "username": "송재근",
      "companyId": "018f1c59-7f32-7b44-b2d2-2d4b589c0211",
      "contactDepartment": {
        "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0213",
        "departmentName": "부장"
      },
      "label": "송재근 부장"
    }
  ]
}
```

### 6.8 GET `/api/deals/product-options`

딜 form에서 사용할 제품 전체 목록을 `createdAt DESC`로 조회한다.

Response `200`:

```json
{
  "items": [
    { "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0214", "productName": "프리미엄 상품" }
  ]
}
```

### 6.9 GET `/api/deals/export/xlsx`

딜 목록 조건을 반영해 xlsx 파일을 내려준다. 제품, id, 최근수정일은 제외한다.

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `search` | string | 아니오 | `dealName` 검색 |
| `companyId` | uuid | 아니오 | 회사 필터 |
| `contactId` | uuid | 아니오 | 담당자 필터 |
| `dealStatus` | DealStatus | 아니오 | 상태 필터 |
| `sort` | string | 아니오 | 목록 API와 동일 |

Response `200`:

- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="deals_YYYYMMDD_HHmmss.xlsx"`

컬럼:

| 순서 | 컬럼명 | 값 |
|---:|---|---|
| 1 | 딜이름 | `dealName` |
| 2 | 회사이름 | `company.companyName` |
| 3 | 담당자 | `contact.username + " " + contact.contactDepartment.departmentName` |
| 4 | 딜단계 | `dealStatusLabel` |
| 5 | 딜금액 | `dealCost` |
| 6 | 마감일 | `expectedEndDate` |
| 7 | 다음행동 | 최신 `followingAction` |
| 8 | 등록일 | `createdAt` |

### 6.10 GET `/api/deals/:dealId/following-action-logs`

딜 다음 행동 로그를 `createdAt DESC`로 조회한다.

Response `200`:

```json
{
  "items": [
    {
      "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0215",
      "followingAction": "제안서 발송",
      "checkComplete": false,
      "createdAt": "2026-06-12T10:00:00.000Z"
    }
  ]
}
```

### 6.11 POST `/api/deals/:dealId/following-action-logs`

딜 다음 행동 로그를 생성한다.

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `followingAction` | string | 예 | 다음에 해야 할 행동 |

Response `201`:

```json
{
  "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0215",
  "followingAction": "제안서 발송",
  "checkComplete": false,
  "createdAt": "2026-06-12T10:00:00.000Z",
  "updatedAt": "2026-06-12T10:00:00.000Z"
}
```

### 6.12 PATCH `/api/deals/:dealId/following-action-logs/:followingActionLogId`

딜 다음 행동 로그를 수정한다.

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `followingAction` | string | 아니오 | 다음에 해야 할 행동 |
| `checkComplete` | boolean | 아니오 | 완료 여부 |

Response `200`: `DealFollowingActionLogResponse`

### 6.13 GET `/api/deals/:dealId/memo-logs`

딜 메모 로그를 `createdAt DESC`로 조회한다.

Response `200`:

```json
{
  "items": [
    {
      "id": "018f1c59-7f32-7b44-b2d2-2d4b589c0216",
      "memoType": "일반",
      "memo": "도입 예산 확인 필요",
      "createdAt": "2026-06-12T10:00:00.000Z"
    }
  ]
}
```

### 6.14 POST `/api/deals/:dealId/memo-logs`

딜 메모 로그를 생성한다.

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `memoType` | string | 예 | 메모 타입 |
| `memo` | string | 예 | 메모 내용 |

Response `201`: `DealMemoLogResponse`

### 6.15 PATCH `/api/deals/:dealId/memo-logs/:memoLogId`

딜 메모 로그를 수정한다.

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `memoType` | string | 아니오 | 메모 타입 |
| `memo` | string | 아니오 | 메모 내용 |

Response `200`: `DealMemoLogResponse`

## 7. 공통 에러

| Status | 코드 | 조건 |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | uuid, enum, date, integer, 필수값 검증 실패 |
| 401 | `UNAUTHORIZED` | access token 없음 또는 만료 |
| 404 | `DEAL_NOT_FOUND` | 본인 소유 딜이 없거나 접근 불가 |
| 404 | `RELATED_RESOURCE_NOT_FOUND` | 본인 소유 company/contact/product가 아니거나 contact가 company에 속하지 않음 |
| 404 | `DEAL_LOG_NOT_FOUND` | 본인 소유 로그가 없거나 해당 deal에 속하지 않음 |
| 500 | `INTERNAL_SERVER_ERROR` | 처리 중 예외 |
