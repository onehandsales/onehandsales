# Deal API Detail

## 1. 구현 경계

- Backend module: `BE/src/modules/deal`
- User API prefix: `/api`
- Admin API: 범위 제외
- DB access: infrastructure repository에서만 Prisma 사용
- Business orchestration: application service에서 처리
- Controller: DTO validation, auth guard, response mapping

## 2. DB 연결 모델

| API | 주요 모델 |
|---|---|
| stage-counts | `Deal` |
| list/detail/create/update/export | `Deal`, `DealProduct`, `Company`, `Contact`, `ContactDepartment`, `Product`, `DealFollowingActionLog` |
| company-options | `Company` |
| contact-options | `Contact`, `ContactDepartment` |
| product-options | `Product` |
| following-action-logs | `Deal`, `DealFollowingActionLog` |
| memo-logs | `Deal`, `DealMemoLog` |

## 3. DTO 이름

| 이름 | 용도 |
|---|---|
| `DealStatusCode` | 코드 단 enum |
| `DealStageCountsQueryDto` | 단계별 개수 query |
| `DealStageCountResponseDto` | 단계별 개수 응답 |
| `ListDealsQueryDto` | 목록 query |
| `DealListResponseDto` | 목록 페이지 응답 |
| `DealListItemResponseDto` | 목록 item 응답 |
| `DealDetailResponseDto` | 상세 응답 |
| `CreateDealRequestDto` | 생성 body |
| `UpdateDealRequestDto` | 수정 body |
| `DealCompanyOptionResponseDto` | 회사 옵션 응답 |
| `DealContactOptionResponseDto` | 담당자 옵션 응답 |
| `DealProductOptionResponseDto` | 제품 옵션 응답 |
| `DealExportQueryDto` | export query |
| `DealFollowingActionLogResponseDto` | 다음 행동 로그 응답 |
| `CreateDealFollowingActionLogRequestDto` | 다음 행동 생성 body |
| `UpdateDealFollowingActionLogRequestDto` | 다음 행동 수정 body |
| `DealMemoLogResponseDto` | 메모 로그 응답 |
| `CreateDealMemoLogRequestDto` | 메모 생성 body |
| `UpdateDealMemoLogRequestDto` | 메모 수정 body |

## 4. Validation

### 4.1 공통

- `dealId`, `companyId`, `contactId`, `productIds[]`, `followingActionLogId`, `memoLogId`는 uuid string이어야 한다.
- `productIds`는 배열이며 생성 시 필수, 수정 시 선택이다. 전달되면 1개 이상이어야 하고 중복이 없어야 한다.
- `dealName`, `followingAction`, `memoType`, `memo`는 trim 후 빈 문자열이면 실패한다.
- `dealCost`는 integer이고 0 이상이어야 한다.
- `dealStatus`는 `DealStatusCode`에 포함되어야 한다.
- `expectedEndDate`는 정규식 `^\d{4}-\d{2}-\d{2}$`를 통과해야 하고 실제 calendar date여야 한다.
- update body는 적어도 하나 이상의 수정 필드를 가져야 한다.

### 4.2 날짜 처리

- API request와 response는 `YYYY-MM-DD` string을 사용한다.
- DB는 날짜 전용 semantics를 위해 `DateTime @db.Date` 사용을 권장한다.
- Backend는 저장 전 UTC timestamp로 변환된 날짜가 하루 밀리지 않도록 date-only parser를 별도로 둔다.

## 5. Business Logic

### 5.1 단계별 개수

1. 인증된 `userId`를 얻는다.
2. query를 검증한다.
3. 조건을 구성한다.
   - `userId`
   - `dealName contains search`
   - `companyId equals`
   - `contactId equals`
4. `Deal`을 위 조건으로 group by `dealStatus` 한다.
5. count가 없는 상태도 0으로 채워 전체 enum 순서대로 반환한다.

### 5.2 목록

1. 인증된 `userId`를 얻는다.
2. query를 검증한다.
3. 조건을 구성한다.
   - `userId`
   - `dealName contains search`
   - `companyId equals`
   - `contactId equals`
   - `dealStatus equals`
4. 정렬을 적용한다.
   - `createdAtDesc`: `createdAt DESC`
   - `dealCostDesc`: `dealCost DESC`, `createdAt DESC`
   - `dealCostAsc`: `dealCost ASC`, `createdAt DESC`
   - `expectedEndDateAsc`: `expectedEndDate ASC`, `createdAt DESC`
5. 10개 단위 pagination을 적용한다.
6. 각 Deal에 회사, 담당자 부서, 최신 다음 행동 1개를 포함한다.
7. 제품은 include하지 않고 응답에도 넣지 않는다.
8. `totalCount`, `totalPages`를 함께 반환한다.

### 5.3 상세

1. `dealId`와 `userId`로 Deal을 조회한다.
2. 회사, 담당자 부서, 제품 배열을 nested object로 포함한다.
3. 없으면 `DEAL_NOT_FOUND`를 반환한다.

### 5.4 생성

1. body를 검증한다.
2. company/contact/products가 모두 같은 `userId` 소유인지 확인한다.
3. contact가 company에 속하는지 `contact.companyId === companyId`로 확인한다.
4. transaction을 시작한다.
5. Deal을 생성한다.
6. DealProduct를 `productIds` 개수만큼 생성한다.
7. DealFollowingActionLog를 생성한다.
   - `followingAction`: request body
   - `checkComplete`: `false`
8. transaction을 commit한다.
9. 상세 응답을 반환한다.

Rollback:

- Deal 생성, DealProduct 생성, following action 생성 중 하나라도 실패하면 모두 rollback한다.

### 5.5 수정

1. `dealId`와 `userId`로 Deal 존재 여부를 확인한다.
2. body에 companyId/contactId/productIds가 있으면 최종 company/contact/products ownership을 확인한다.
3. 최종 contact가 최종 company에 속하는지 `contact.companyId === companyId`로 확인한다.
4. 전달된 Deal 필드만 update한다.
5. `productIds`가 전달되면 기존 DealProduct 연결을 삭제하고 새 목록으로 교체한다.
6. 상세 응답을 반환한다.

### 5.6 옵션 조회

1. 인증된 `userId`를 얻는다.
2. 각 모델을 `userId` 조건으로 조회한다.
3. `createdAt DESC` 정렬을 적용한다.
4. 담당자 옵션은 `companyId`를 함께 반환한다.
5. 페이지네이션 없이 전체 목록을 반환한다.

### 5.7 Export

1. 목록 API와 동일한 `search`, `companyId`, `contactId`, `dealStatus`, `sort`를 적용한다.
2. page는 받지 않는다.
3. 회사, 담당자 부서, 최신 다음 행동 1개를 조회한다.
4. 제품은 조회하지 않는다.
5. xlsx 컬럼을 고정 순서로 생성한다.
6. id, 제품, 최근수정일은 제외한다.
7. 파일명은 기존 export 공통 helper와 동일하게 `deals_YYYYMMDD_HHmmss.xlsx` 형식을 사용한다.

### 5.8 다음 행동 로그

목록:

1. deal ownership을 검증한다.
2. `DealFollowingActionLog`를 `dealId`, `userId` 조건으로 `createdAt DESC, id DESC` cursor 방식으로 10개씩 조회한다.
3. 응답은 `items`, `nextCursor`, `hasNext`를 반환한다.

생성:

1. deal ownership을 검증한다.
2. `followingAction`만 받는다.
3. `checkComplete=false`로 생성한다.
4. 생성된 로그를 반환한다.

수정:

1. deal ownership을 검증한다.
2. log가 해당 deal과 user에 속하는지 검증한다.
3. 전달된 `followingAction`, `checkComplete`만 수정한다.

### 5.9 메모 로그

목록:

1. deal ownership을 검증한다.
2. `DealMemoLog`를 `dealId`, `userId` 조건으로 `createdAt DESC, id DESC` cursor 방식으로 10개씩 조회한다.
3. 응답은 `items`, `nextCursor`, `hasNext`를 반환한다.

생성:

1. deal ownership을 검증한다.
2. `memoType`, `memo`로 로그를 생성한다.
3. 생성된 로그를 반환한다.

수정:

1. deal ownership을 검증한다.
2. log가 해당 deal과 user에 속하는지 검증한다.
3. 전달된 `memoType`, `memo`만 수정한다.

## 6. Transaction

필수 transaction:

- `POST /api/deals`
  - Deal 생성
  - DealProduct 생성
  - 최초 DealFollowingActionLog 생성
- `PATCH /api/deals/:dealId`
  - Deal 기본 정보 수정
  - productIds 전달 시 DealProduct 연결 교체

단일 row update라 transaction 필수는 아니지만 ownership 검증과 update 사이 race를 고려할 API:

- `PATCH /api/deals/:dealId/following-action-logs/:followingActionLogId`
- `PATCH /api/deals/:dealId/memo-logs/:memoLogId`

외부 Provider 호출:

- 없음

## 7. Observability

Event name은 영어 dot notation을 사용한다.

| API | Event |
|---|---|
| `POST /api/deals` | `deal.created` |
| `PATCH /api/deals/:dealId` | `deal.updated` |
| `GET /api/deals/export/xlsx` | `deal.exported` |
| `POST /api/deals/:dealId/following-action-logs` | `deal.following_action.created` |
| `PATCH /api/deals/:dealId/following-action-logs/:followingActionLogId` | `deal.following_action.updated` |
| `POST /api/deals/:dealId/memo-logs` | `deal.memo.created` |
| `PATCH /api/deals/:dealId/memo-logs/:memoLogId` | `deal.memo.updated` |

Log context:

- `requestId`
- `userId`
- `dealId`
- `companyId`, `contactId`, `productIds` when applicable
- `dealStatus`
- `sort`
- `hasSearch`

Redaction:

- `memo`
- `followingAction`
- `dealCost`
- access token
- refresh token

## 8. Error Response

공통 에러 body:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "요청값이 올바르지 않습니다.",
  "requestId": "req_01J..."
}
```

| Status | Code | Message 원칙 |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | 어떤 필드가 실패했는지 알 수 있게 한다. |
| 401 | `UNAUTHORIZED` | 인증이 필요하다는 수준만 노출한다. |
| 404 | `DEAL_NOT_FOUND` | 없는 딜과 타 사용자 딜을 구분하지 않는다. |
| 404 | `RELATED_RESOURCE_NOT_FOUND` | 없는 FK, 타 사용자 FK, 회사에 속하지 않은 담당자를 구분하지 않는다. |
| 404 | `DEAL_LOG_NOT_FOUND` | 없는 로그와 타 사용자 로그를 구분하지 않는다. |
| 500 | `INTERNAL_SERVER_ERROR` | 내부 예외 상세를 노출하지 않는다. |

## 9. Frontend 처리 기준

- `DealStatusCode`와 label mapper는 API enum과 동일해야 한다.
- 목록 query key는 `page`, `search`, `companyId`, `contactId`, `dealStatus`, `sort`를 포함한다.
- 검색/필터/정렬 변경 시 page는 1로 초기화한다.
- 목록의 제품 필드는 사용하지 않는다.
- 상세에서만 `products` 객체 배열을 표시한다.
- 다음 행동 생성 후 목록의 `latestFollowingAction`, 상세 로그 목록을 invalidate한다.
- 메모 생성/수정 후 메모 로그 목록을 invalidate한다.
- export는 blob 응답으로 처리하고 파일명은 `Content-Disposition`을 우선 사용한다.

## 10. Backend 검증 기준

- 모든 API는 인증 없을 때 401을 반환한다.
- 타 사용자 Deal/FK/Log 접근은 404를 반환한다.
- Deal 생성 시 DealProduct와 following action이 함께 생성된다.
- Deal 생성 중 DealProduct 또는 following action 생성 실패 시 Deal도 rollback된다.
- 목록은 제품을 응답하지 않는다.
- 상세는 `products` 배열을 응답한다.
- 옵션 3개는 `createdAt DESC`다.
- following action과 memo 목록은 `createdAt DESC`다.
- export는 검색/필터/정렬을 반영하고 id, 제품, 최근수정일을 제외한다.
