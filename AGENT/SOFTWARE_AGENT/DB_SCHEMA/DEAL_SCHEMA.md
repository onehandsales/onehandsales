# Deal Schema

## 1. 현재 상태

이 문서는 딜(Deal) 도메인의 현재 구현 데이터베이스 구조를 설명한다.

현재 Deal 도메인은 `BE/prisma/schema.prisma`와 아래 migration에 반영되어 있다.

- `BE/prisma/migrations/20260612000000_add_deal_domain/migration.sql`
- `BE/prisma/migrations/20260612010000_add_deal_product_join/migration.sql`
- `BE/prisma/migrations/20260623010000_add_deal_company_contact_joins/migration.sql`
- `BE/prisma/migrations/20260614020000_add_schedule_domain/migration.sql`
- `BE/prisma/migrations/20260615000000_add_meeting_note_domain/migration.sql`
- `BE/prisma/migrations/20260625010000_add_log_soft_delete_columns/migration.sql`
- `BE/prisma/migrations/20260625020000_add_core_entity_soft_delete_columns/migration.sql`

구현 기준 문서:

- `TODO/DONE/DEAL_DOMAIN_PLAN/README.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260612000000_add_deal_domain/migration.sql`
- `BE/prisma/migrations/20260612010000_add_deal_product_join/migration.sql`
- `BE/prisma/migrations/20260623010000_add_deal_company_contact_joins/migration.sql`
- `BE/prisma/migrations/20260625010000_add_log_soft_delete_columns/migration.sql`
- `BE/prisma/migrations/20260625020000_add_core_entity_soft_delete_columns/migration.sql`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/README.md`
- `BE/prisma/migrations/20260614020000_add_schedule_domain/migration.sql`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/README.md`
- `BE/prisma/migrations/20260615000000_add_meeting_note_domain/migration.sql`

## 2. 테이블 목록

Deal 기본 도메인 1차 구현 범위는 다음 테이블만 포함한다.

- `Deal`
- `DealCompany`
- `DealContact`
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
| `dealStatus` | string | 아니오 | 코드 레벨 enum의 English code |
| `expectedEndDate` | date | 아니오 | 예상 마감일. API에서는 `YYYY-MM-DD` |
| `createdAt` | datetime | 아니오 | 생성일 |
| `updatedAt` | datetime | 아니오 | 수정일 |
| `deletedAt` | timestamptz | 예 | 삭제 버튼을 누른 UTC 시각. `null`이면 활성 딜 |
| `deletedByUserId` | uuid | 예 | 삭제를 수행한 `User.id` |
| `trashExpiresAt` | timestamptz | 예 | 무료 복구 가능 기간 종료 시각. 현재 정책은 `deletedAt + 7일` |

관계:

- `Deal.userId` -> `User.id`
- `Deal` 1:N `DealCompany`
- `Deal` 1:N `DealContact`
- `Deal` 1:N `DealProduct`
- `Deal` 1:N `DealFollowingActionLog`
- `Deal` 1:N `DealMemoLog`
- `Deal` 1:N `ScheduleDeal`
- `Deal` 1:N `MeetingNoteDeal`

정책:

- 상태는 DB enum이 아니라 Backend 코드 레벨 enum으로 관리한다.
- DB에는 English code 문자열만 저장한다.
- API 응답은 code와 label을 함께 제공한다.
- 외부 FK 응답은 flat field가 아니라 `companies`, `contacts`, `products` 같은 배열로 제공한다.
- 딜 하나는 여러 회사, 여러 담당자에 연결될 수 있다.
- 딜 하나는 `DealProduct`를 통해 여러 제품에 연결될 수 있다.
- 제품 하나는 `DealProduct`를 통해 여러 딜에 포함될 수 있다.
- 딜 하나는 `ScheduleDeal`을 통해 여러 일정에 연결될 수 있다.
- 딜 하나는 `MeetingNoteDeal`을 통해 여러 회의록 snapshot에 연결될 수 있다.
- 딜 생성/수정 시 모든 `contactIds[]`가 선택된 `companyIds[]` 중 하나에 소속되는지 검증한다.
- 목록 API는 15개 단위 page-number pagination이며 `totalCount`, `totalPages`를 반환한다.
- 목록 기본 정렬은 `createdAt DESC`다.
- 목록 정렬은 `createdAtDesc`, `dealCostDesc`, `dealCostAsc`, `expectedEndDateAsc`를 지원한다.
- User Web 정렬 select label은 각각 `최신순`, `금액 높은순`, `금액 낮은 순`, `마감일순`이다.
- 검색은 `dealName`만 대상으로 한다.
- 목록 필터는 `dealStatus`, `companyIds`, `contactIds`를 제공한다.
- stage count 필터는 `search`, `companyIds`, `contactIds`를 제공한다.
- export 필터는 목록과 같은 `search`, `companyIds`, `contactIds`, `dealStatus`, `sort`를 제공하되 `page`는 받지 않는다.
- 목록/export 응답에는 Product와 최근수정일을 포함하지 않는다.
- 딜 삭제 API는 row를 실제 삭제하지 않고 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
- 일반 목록/상세/검색/export와 일정/회의록 딜 옵션은 `deletedAt IS NULL` 딜만 대상으로 한다.
- 딜 기존 연결 응답은 삭제된 회사/담당자/제품 이력을 유지할 수 있도록 연결 대상에 `isDeleted`를 포함한다. 신규 선택 옵션에는 삭제된 대상이 나오지 않는다.

## 4. DealCompany / DealContact

딜과 회사, 딜과 담당자의 N:M 관계를 저장한다.

| 테이블 | 주요 컬럼 | unique | 설명 |
|---|---|---|---|
| `DealCompany` | `id`, `userId`, `dealId`, `companyId`, `createdAt`, `updatedAt` | `dealId + companyId` | 딜-회사 연결 |
| `DealContact` | `id`, `userId`, `dealId`, `contactId`, `createdAt`, `updatedAt` | `dealId + contactId` | 딜-담당자 연결 |

관계:

- `DealCompany.userId` -> `User.id`
- `DealCompany.dealId` -> `Deal.id`
- `DealCompany.companyId` -> `Company.id`
- `DealContact.userId` -> `User.id`
- `DealContact.dealId` -> `Deal.id`
- `DealContact.contactId` -> `Contact.id`

정책:

- 딜 하나는 여러 회사와 연결될 수 있다.
- 딜 하나는 여러 담당자와 연결될 수 있다.
- 딜 생성/수정 시 모든 `contactIds[]`는 선택된 `companyIds[]` 중 하나에 소속되어야 한다.
- 현재 대표 회사/대표 담당자 컬럼은 두지 않는다.

## 5. DealProduct

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

## 6. DealFollowingActionLog

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
| `deletedAt` | timestamptz | 예 | 삭제 버튼을 누른 UTC 시각. `null`이면 일반 화면에 노출되는 활성 로그 |
| `deletedByUserId` | uuid | 예 | 삭제를 실행한 내부 `User.id` |
| `trashExpiresAt` | timestamptz | 예 | 무료 복구 가능 기간 종료 시각. 현재 정책은 `deletedAt + 7일` |

정책:

- 딜 생성 요청의 `followingAction`은 같은 transaction 안에서 첫 `DealFollowingActionLog`로 저장한다.
- 첫 로그의 `checkComplete`는 항상 `false`다.
- 단건 생성 API는 `followingAction`만 받는다.
- 단건 수정 API는 `followingAction`, `checkComplete`를 수정할 수 있다.
- 목록 조회는 10개 단위 `createdAt DESC, id DESC` cursor 기반 incremental loading으로 제공한다.
- 딜 목록의 최근/다음 행동 계산과 로그 목록/수정은 `deletedAt IS NULL`인 로그만 대상으로 한다.
- 삭제 API는 row를 실제 삭제하지 않고 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.

## 7. DealMemoLog

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
| `deletedAt` | timestamptz | 예 | 삭제 버튼을 누른 UTC 시각. `null`이면 일반 화면에 노출되는 활성 로그 |
| `deletedByUserId` | uuid | 예 | 삭제를 실행한 내부 `User.id` |
| `trashExpiresAt` | timestamptz | 예 | 무료 복구 가능 기간 종료 시각. 현재 정책은 `deletedAt + 7일` |

정책:

- 단건 생성 API는 `memoType`, `memo`를 필수로 받는다.
- 단건 수정 API는 `memoType`, `memo`를 수정할 수 있다.
- 목록 조회는 10개 단위 `createdAt DESC, id DESC` cursor 기반 incremental loading으로 제공한다.
- 삭제 API는 row를 실제 삭제하지 않고 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
- 일반 조회와 수정은 `deletedAt IS NULL`인 로그만 대상으로 한다.

## 8. DealStatus

DB에는 아래 string code만 저장한다.

| code | label |
|---|---|
| `INITIAL_CONTACT` | 초기 접촉 |
| `NEEDS_CHECK` | 니즈 확인 |
| `PROPOSAL_QUOTE` | 제안/견적 |
| `NEGOTIATION` | 협상 |
| `WON` | 성사 |
| `LOST` | 실패 |

## 9. 권장 인덱스

- `Deal.userId + Deal.createdAt`
- `Deal.userId + Deal.dealName`
- `Deal.userId + Deal.dealStatus`
- `Deal.userId + Deal.expectedEndDate`
- `Deal.userId + Deal.dealCost`
- `Deal.userId + Deal.deletedAt`
- `Deal.userId + Deal.trashExpiresAt`
- `DealCompany.dealId + DealCompany.companyId` unique
- `DealCompany.userId + DealCompany.dealId`
- `DealCompany.userId + DealCompany.companyId`
- `DealCompany.companyId`
- `DealContact.dealId + DealContact.contactId` unique
- `DealContact.userId + DealContact.dealId`
- `DealContact.userId + DealContact.contactId`
- `DealContact.contactId`
- `DealProduct.dealId + DealProduct.productId` unique
- `DealProduct.userId + DealProduct.dealId`
- `DealProduct.userId + DealProduct.productId`
- `DealProduct.productId`
- `DealFollowingActionLog.dealId + DealFollowingActionLog.createdAt`
- `DealFollowingActionLog.userId + DealFollowingActionLog.dealId`
- `DealFollowingActionLog.userId + DealFollowingActionLog.checkComplete`
- `DealFollowingActionLog.userId + DealFollowingActionLog.deletedAt`
- `DealFollowingActionLog.userId + DealFollowingActionLog.trashExpiresAt`
- `DealMemoLog.dealId + DealMemoLog.createdAt`
- `DealMemoLog.userId + DealMemoLog.dealId`
- `DealMemoLog.userId + DealMemoLog.deletedAt`
- `DealMemoLog.userId + DealMemoLog.trashExpiresAt`

## 10. 현재 제외 범위

다음 테이블과 필드는 Deal 기본 도메인 1차 구현에 포함하지 않는다.

- `DealActivity`
- `DealActivityType`
- `ProductConnection`
- `PersonalMemo(targetType=DEAL)`
- 딜 본문 row의 복구/영구삭제 API와 `permanentDeleteAt`
- `currency`
- `likelihoodStatus`
- `likelihoodPercent`
- `metadata`
- `nextActionDueAt`

## 11. 관련 문서

- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
