# Deal Schema

## 1. 현재 상태

이 문서는 딜(Deal) 도메인의 현재 구현 데이터베이스 구조를 설명한다.

현재 Deal 도메인은 `BE/prisma/schema.prisma`와 아래 migration에 반영되어 있다.

- `BE/prisma/migrations/20260612000000_add_deal_domain/migration.sql`
- `BE/prisma/migrations/20260612010000_add_deal_product_join/migration.sql`
- `BE/prisma/migrations/20260614020000_add_schedule_domain/migration.sql`

구현 기준 문서:

- `TODO/DONE/DEAL_DOMAIN_PLAN/README.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260612000000_add_deal_domain/migration.sql`
- `BE/prisma/migrations/20260612010000_add_deal_product_join/migration.sql`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/README.md`
- `BE/prisma/migrations/20260614020000_add_schedule_domain/migration.sql`

## 2. 테이블 목록

Deal 기본 도메인 1차 구현 범위는 다음 테이블만 포함한다.

- `Deal`
- `DealProduct`
- `DealFollowingActionLog`
- `DealMemoLog`

## 3. Deal

사용자의 영업 딜 기본 정보를 저장한다.

| 컬럼 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | uuid | 아니오 | 딜 ID |
| `userId` | uuid | 아니오 | 딜을 소유한 사용자 ID |
| `dealName` | string | 아니오 | 딜 이름 |
| `dealCost` | int | 아니오 | 딜 금액. 정수, 0 이상 |
| `companyId` | uuid | 아니오 | 연결 회사 ID |
| `contactId` | uuid | 아니오 | 연결 거래처 ID |
| `dealStatus` | string | 아니오 | 코드 레벨 enum의 English code |
| `expectedEndDate` | date | 아니오 | 예상 마감일. API에서는 `YYYY-MM-DD` |
| `createdAt` | datetime | 아니오 | 생성일 |
| `updatedAt` | datetime | 아니오 | 수정일 |

관계:

- `Deal.userId` -> `User.id`
- `Deal.companyId` -> `Company.id`
- `Deal.contactId` -> `Contact.id`
- `Deal` 1:N `DealProduct`
- `Deal` 1:N `DealFollowingActionLog`
- `Deal` 1:N `DealMemoLog`
- `Deal` 1:N `ScheduleDeal`

정책:

- 상태는 DB enum이 아니라 Backend 코드 레벨 enum으로 관리한다.
- DB에는 English code 문자열만 저장한다.
- API 응답은 code와 label을 함께 제공한다.
- 외부 FK 응답은 flat field가 아니라 `company`, `contact`, `products` 같은 객체/배열로 제공한다.
- 딜 하나는 회사 하나, 거래처 하나에 연결된다.
- 딜 하나는 `DealProduct`를 통해 여러 제품에 연결될 수 있다.
- 제품 하나는 `DealProduct`를 통해 여러 딜에 포함될 수 있다.
- 딜 하나는 `ScheduleDeal`을 통해 여러 일정에 연결될 수 있다.
- 딜 생성/수정 시 `contact.companyId`가 요청 `companyId`와 같은지 검증한다.
- 목록 API는 20개 페이지네이션이다.
- 목록 기본 정렬은 `createdAt DESC`다.
- 목록 정렬은 `createdAtDesc`, `dealCostDesc`, `dealCostAsc`, `expectedEndDateAsc`를 지원한다.
- 검색은 `dealName`만 대상으로 한다.
- 필터는 `dealStatus`만 제공한다.
- 목록/export 응답에는 Product와 최근수정일을 포함하지 않는다.

## 4. DealProduct

딜과 제품의 N:M 관계를 저장한다.

| 컬럼 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | uuid | 아니오 | 딜-제품 연결 ID |
| `userId` | uuid | 아니오 | 연결을 소유한 사용자 ID |
| `dealId` | uuid | 아니오 | 딜 ID |
| `productId` | uuid | 아니오 | 제품 ID |
| `createdAt` | datetime | 아니오 | 생성일 |
| `updatedAt` | datetime | 아니오 | 수정일 |

관계:

- `DealProduct.userId` -> `User.id`
- `DealProduct.dealId` -> `Deal.id`
- `DealProduct.productId` -> `Product.id`
- `DealProduct` N:1 `Deal`
- `DealProduct` N:1 `Product`

정책:

- 같은 딜에 같은 제품을 중복 연결하지 않는다.
- `DealProduct.dealId + DealProduct.productId`는 unique다.
- 딜 생성 요청은 `productIds` 배열을 필수로 받으며 최소 1개 이상이어야 한다.
- 딜 수정 요청은 `productIds` 배열을 선택적으로 받을 수 있고, 전달되면 기존 연결을 새 목록으로 교체한다.

## 5. DealFollowingActionLog

딜의 다음 행동 로그를 저장한다.

| 컬럼 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | uuid | 아니오 | 다음 행동 로그 ID |
| `userId` | uuid | 아니오 | 작성자 사용자 ID |
| `dealId` | uuid | 아니오 | 딜 ID |
| `followingAction` | string | 아니오 | 다음에 해야 할 행동 |
| `checkComplete` | boolean | 아니오 | 완료 여부. 기본값 `false` |
| `createdAt` | datetime | 아니오 | 생성일 |
| `updatedAt` | datetime | 아니오 | 수정일 |

정책:

- 딜 생성 요청의 `followingAction`은 같은 transaction 안에서 첫 `DealFollowingActionLog`로 저장한다.
- 첫 로그의 `checkComplete`는 항상 `false`다.
- 단건 생성 API는 `followingAction`만 받는다.
- 단건 수정 API는 `followingAction`, `checkComplete`를 수정할 수 있다.
- 목록 조회는 `createdAt DESC`로 제공한다.
- 딜 목록의 다음 행동은 가장 최근에 생성된 로그 1개만 표시한다.

## 6. DealMemoLog

딜의 일반 메모 로그를 저장한다.

| 컬럼 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | uuid | 아니오 | 딜 메모 로그 ID |
| `userId` | uuid | 아니오 | 작성자 사용자 ID |
| `dealId` | uuid | 아니오 | 딜 ID |
| `memoType` | string | 아니오 | 메모 설명/유형 |
| `memo` | string | 아니오 | 메모 본문 |
| `createdAt` | datetime | 아니오 | 생성일 |
| `updatedAt` | datetime | 아니오 | 수정일 |

정책:

- 단건 생성 API는 `memoType`, `memo`를 필수로 받는다.
- 단건 수정 API는 `memoType`, `memo`를 수정할 수 있다.
- 목록 조회는 `createdAt DESC`로 제공한다.

## 7. DealStatus

DB에는 아래 string code만 저장한다.

| code | label |
|---|---|
| `INITIAL_CONTACT` | 초기 접촉 |
| `NEEDS_CHECK` | 니즈 확인 |
| `PROPOSAL_QUOTE` | 제안/견적 |
| `NEGOTIATION` | 협상 |
| `WON` | 성사 |
| `LOST` | 실패 |

## 8. 권장 인덱스

- `Deal.userId + Deal.createdAt`
- `Deal.userId + Deal.dealName`
- `Deal.userId + Deal.dealStatus`
- `Deal.userId + Deal.expectedEndDate`
- `Deal.userId + Deal.dealCost`
- `Deal.companyId`
- `Deal.contactId`
- `DealProduct.dealId + DealProduct.productId` unique
- `DealProduct.userId + DealProduct.dealId`
- `DealProduct.userId + DealProduct.productId`
- `DealProduct.productId`
- `DealFollowingActionLog.dealId + DealFollowingActionLog.createdAt`
- `DealFollowingActionLog.userId + DealFollowingActionLog.dealId`
- `DealFollowingActionLog.userId + DealFollowingActionLog.checkComplete`
- `DealMemoLog.dealId + DealMemoLog.createdAt`
- `DealMemoLog.userId + DealMemoLog.dealId`

## 9. 현재 제외 범위

다음 테이블과 필드는 Deal 기본 도메인 1차 구현에 포함하지 않는다.

- `DealActivity`
- `DealActivityType`
- `ProductConnection`
- `PersonalMemo(targetType=DEAL)`
- `deletedAt`
- `permanentDeleteAt`
- `currency`
- `likelihoodStatus`
- `likelihoodPercent`
- `metadata`
- `nextActionDueAt`

## 10. 관련 문서

- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
