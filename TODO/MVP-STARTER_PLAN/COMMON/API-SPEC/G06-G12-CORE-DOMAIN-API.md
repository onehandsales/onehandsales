# G06-G12 핵심 도메인 API 명세

## 1. 목적

이 문서는 MVP 핵심 기준 데이터와 딜 중심 루프의 Backend API 계약을 정의한다.

대상 goal은 Company, Contact, Product, Deal Backend vertical slice이며, User Web 화면은 이 API 계약을 기준으로 구현한다.

## 2. 포함 goal

- G06. Company Backend vertical slice
- G08. Contact Backend vertical slice
- G10. Product Backend vertical slice
- G12. Deal Backend vertical slice

G07, G09, G11, G13-G16의 화면 명세는 `COMMON/GOAL-SPECS`에서 이 API를 참조한다.

구현 시 API별 request 필드, 비즈니스 로직 흐름, response 필드, 연결 DB, transaction, 에러 기준은 `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`를 상세 계약 정본으로 본다.

## 3. 공통 query와 response

### 목록 query 공통 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `page` | number | 선택 | 기본 1 |
| `pageSize` | number | 선택 | 기본 20, 최대 100 |
| `search` | string | 선택 | 이름, 회사명, 연락처 등 키워드 |
| `includeDeleted` | boolean | 선택 | 휴지통 포함 여부. 기본 false |

### 공통 타임스탬프 필드

| 필드 | 타입 | 설명 |
|---|---|---|
| `createdAt` | string | 생성일 |
| `updatedAt` | string | 수정일 |
| `deletedAt` | string 또는 null | soft delete 시각 |

## 4. G06 Company API

### 4.1 Company API 목록

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 회사 목록 API | `ListCompanies` | `GET` | `/api/companies` | `ListCompaniesRequest` | `CompanyListResponse` | Company |
| 회사 생성 API | `CreateCompany` | `POST` | `/api/companies` | `CreateCompanyRequest` | `CompanyResponse` | Company |
| 회사 상세 API | `GetCompany` | `GET` | `/api/companies/:companyId` | `GetCompanyRequest` | `CompanyDetailResponse` | Company, CompanyLog |
| 회사 수정 API | `UpdateCompany` | `PATCH` | `/api/companies/:companyId` | `UpdateCompanyRequest` | `CompanyResponse` | Company |
| 회사 삭제 API | `DeleteCompany` | `DELETE` | `/api/companies/:companyId` | `DeleteCompanyRequest` | `DeleteCompanyResponse` | Company |
| 회사 복구 API | `RestoreCompany` | `POST` | `/api/companies/:companyId/restore` | `RestoreCompanyRequest` | `CompanyResponse` | Company |
| 회사 로그 목록 API | `ListCompanyLogs` | `GET` | `/api/companies/:companyId/logs` | `ListCompanyLogsRequest` | `CompanyLogListResponse` | Company, CompanyLog |
| 회사 로그 생성 API | `CreateCompanyLog` | `POST` | `/api/companies/:companyId/logs` | `CreateCompanyLogRequest` | `CompanyLogResponse` | Company, CompanyLog |
| 회사 로그 수정 API | `UpdateCompanyLog` | `PATCH` | `/api/companies/:companyId/logs/:logId` | `UpdateCompanyLogRequest` | `CompanyLogResponse` | CompanyLog |
| 회사 로그 삭제 API | `DeleteCompanyLog` | `DELETE` | `/api/companies/:companyId/logs/:logId` | `DeleteCompanyLogRequest` | `DeleteCompanyLogResponse` | CompanyLog |

### 4.2 Company request 필드

| Request 이름 | 필드 |
|---|---|
| `ListCompaniesRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `includeDeleted?:boolean` |
| `CreateCompanyRequest` | `name:string 필수`, `industry?:string`, `region?:string`, `address?:string`, `website?:string`, `memo?:string`, `tags?:string[]` |
| `GetCompanyRequest` | `companyId:string path 필수` |
| `UpdateCompanyRequest` | `companyId:string path 필수`, `name?:string`, `industry?:string`, `region?:string`, `address?:string`, `website?:string`, `memo?:string`, `tags?:string[]` |
| `DeleteCompanyRequest` | `companyId:string path 필수` |
| `RestoreCompanyRequest` | `companyId:string path 필수` |
| `CreateCompanyLogRequest` | `companyId:string path 필수`, `loggedAt:string 필수`, `title:string 필수`, `content?:string` |
| `UpdateCompanyLogRequest` | `companyId:string path 필수`, `logId:string path 필수`, `loggedAt?:string`, `title?:string`, `content?:string` |

### 4.3 Company response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `CompanyResponse` | `id`, `name`, `industry`, `region`, `address`, `website`, `memo`, `tags`, `createdAt`, `updatedAt`, `deletedAt` |
| `CompanyDetailResponse` | `company:CompanyResponse`, `logs:CompanyLogResponse[]`, `contactCount`, `dealCount`, `productCount` |
| `CompanyListResponse` | `items:CompanyResponse[]`, `page`, `pageSize`, `totalCount`, `hasNext` |
| `CompanyLogResponse` | `id`, `companyId`, `loggedAt`, `title`, `content`, `createdAt`, `updatedAt` |

### 4.4 Company 비즈니스 로직 흐름

1. 모든 API는 AuthGuard로 현재 사용자를 확인한다.
2. 모든 조회/수정/삭제는 `userId`와 대상 ID를 함께 조건으로 검증한다.
3. 목록은 `deletedAt = null`을 기본으로 조회하고, 휴지통 화면에서만 `includeDeleted = true`를 허용한다.
4. 생성 시 같은 사용자 안에서 회사명 중복 후보를 검색할 수 있지만, MVP에서는 hard block이 아니라 후보 표시 정책으로 둔다.
5. 삭제는 hard delete가 아니라 `deletedAt`을 기록한다.
6. 복구는 `deletedAt`을 null로 되돌린다.
7. 회사 로그는 영업 접촉 이력이 아니라 회사 자체 히스토리로 저장한다.

### 4.5 Company 연결 DB 스키마

- 생성: Company, CompanyLog
- 조회: Company, CompanyLog, TagAssignment
- 수정: Company, CompanyLog
- 삭제: Company.deletedAt, CompanyLog.deletedAt 또는 CompanyLog hard delete 정책 중 구현 시 결정
- 감사 로그: MVP User API에서는 필수 아님
- transaction: 회사 생성과 태그 연결을 함께 처리할 때 transaction 필요

### 4.6 Company 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 회사명 누락 | `ValidationError` | 400 |
| 회사 없음 | `CompanyNotFound` | 404 |
| 다른 사용자 회사 접근 | `OwnershipViolation` | 403 |
| 삭제된 회사 수정 | `DeletedResource` | 409 |

## 5. G08 Contact API

### 5.1 Contact API 목록

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 거래처 목록 API | `ListContacts` | `GET` | `/api/contacts` | `ListContactsRequest` | `ContactListResponse` | Contact, Company |
| 거래처 생성 API | `CreateContact` | `POST` | `/api/contacts` | `CreateContactRequest` | `ContactResponse` | Contact, Company |
| 거래처 상세 API | `GetContact` | `GET` | `/api/contacts/:contactId` | `GetContactRequest` | `ContactDetailResponse` | Contact, Company |
| 거래처 수정 API | `UpdateContact` | `PATCH` | `/api/contacts/:contactId` | `UpdateContactRequest` | `ContactResponse` | Contact |
| 거래처 삭제 API | `DeleteContact` | `DELETE` | `/api/contacts/:contactId` | `DeleteContactRequest` | `DeleteContactResponse` | Contact |
| 거래처 복구 API | `RestoreContact` | `POST` | `/api/contacts/:contactId/restore` | `RestoreContactRequest` | `ContactResponse` | Contact |

### 5.2 Contact request 필드

| Request 이름 | 필드 |
|---|---|
| `ListContactsRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `companyId?:string`, `includeDeleted?:boolean` |
| `CreateContactRequest` | `name:string 필수`, `companyId?:string`, `department?:string`, `position?:string`, `phone?:string`, `email?:string`, `address?:string`, `memo?:string`, `privateMemo?:string` |
| `UpdateContactRequest` | `contactId:string path 필수`, 생성 필드 중 수정할 필드 |

### 5.3 Contact response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `ContactResponse` | `id`, `name`, `companyId`, `companyName`, `department`, `position`, `phone`, `email`, `address`, `memo`, `hasPrivateMemo`, `createdAt`, `updatedAt`, `deletedAt` |
| `ContactDetailResponse` | `contact:ContactResponse`, `company?:CompanyResponse`, `relatedDealCount`, `relatedProductCount` |
| `ContactListResponse` | `items:ContactResponse[]`, `page`, `pageSize`, `totalCount`, `hasNext` |

### 5.4 Contact 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `companyId`가 있으면 현재 사용자 소유 Company인지 검증한다.
3. 거래처(담당자)는 회사 없이도 저장 가능하다.
4. 전화번호와 이메일은 User Web에서는 원문을 보여주지만 Admin API에서는 기본 마스킹한다.
5. 개인 메모는 민감정보 후보로 보고 Admin 기본 목록에서는 원문을 내려주지 않는다.
6. 삭제는 soft delete로 처리한다.

### 5.5 Contact 연결 DB 스키마

- 생성: Contact, PersonalMemo. 개인 메모를 별도 테이블로 구현할 경우
- 조회: Contact, Company
- 수정: Contact, PersonalMemo
- 삭제: Contact.deletedAt
- 감사 로그: Admin 원문 조회 시 AuditLog
- transaction: Contact와 PersonalMemo 동시 저장 시 transaction 필요

### 5.6 Contact 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 이름 누락 | `ValidationError` | 400 |
| 연결 회사 없음 | `CompanyNotFound` | 404 |
| 다른 사용자 회사 연결 | `OwnershipViolation` | 403 |
| 거래처 없음 | `ContactNotFound` | 404 |

## 6. G10 Product API

### 6.1 Product API 목록

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 제품 목록 API | `ListProducts` | `GET` | `/api/products` | `ListProductsRequest` | `ProductListResponse` | Product |
| 제품 생성 API | `CreateProduct` | `POST` | `/api/products` | `CreateProductRequest` | `ProductResponse` | Product |
| 제품 상세 API | `GetProduct` | `GET` | `/api/products/:productId` | `GetProductRequest` | `ProductDetailResponse` | Product, ProductConnection |
| 제품 수정 API | `UpdateProduct` | `PATCH` | `/api/products/:productId` | `UpdateProductRequest` | `ProductResponse` | Product |
| 제품 삭제 API | `DeleteProduct` | `DELETE` | `/api/products/:productId` | `DeleteProductRequest` | `DeleteProductResponse` | Product |
| 제품 복구 API | `RestoreProduct` | `POST` | `/api/products/:productId/restore` | `RestoreProductRequest` | `ProductResponse` | Product |
| 제품 연결 생성 API | `CreateProductConnection` | `POST` | `/api/products/:productId/connections` | `CreateProductConnectionRequest` | `ProductConnectionResponse` | ProductConnection |
| 제품 연결 삭제 API | `DeleteProductConnection` | `DELETE` | `/api/products/:productId/connections/:connectionId` | `DeleteProductConnectionRequest` | `DeleteProductConnectionResponse` | ProductConnection |

### 6.2 Product request 필드

| Request 이름 | 필드 |
|---|---|
| `ListProductsRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `category?:string`, `includeDeleted?:boolean` |
| `CreateProductRequest` | `name:string 필수`, `category?:string`, `unitPrice?:number`, `currency?:string 기본 KRW`, `description?:string`, `memo?:string` |
| `UpdateProductRequest` | `productId:string path 필수`, 생성 필드 중 수정할 필드 |
| `CreateProductConnectionRequest` | `productId:string path 필수`, `targetType:COMPANY|CONTACT|DEAL`, `targetId:string`, `connectionType:enum`, `memo?:string` |

### 6.3 Product response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `ProductResponse` | `id`, `name`, `category`, `unitPrice`, `currency`, `description`, `memo`, `createdAt`, `updatedAt`, `deletedAt` |
| `ProductDetailResponse` | `product:ProductResponse`, `connections:ProductConnectionResponse[]` |
| `ProductConnectionResponse` | `id`, `productId`, `targetType`, `targetId`, `targetName`, `connectionType`, `memo` |
| `ProductListResponse` | `items:ProductResponse[]`, `page`, `pageSize`, `totalCount`, `hasNext` |

### 6.4 Product 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 제품 생성/수정 시 금액은 0 이상 정수로 validation한다.
3. 제품 연결 생성 시 target type별 소유권을 검증한다.
4. 제품 연결은 자유 텍스트 대상에 연결하지 않고 반드시 존재하는 Company/Contact/Deal에 연결한다.
5. 삭제는 soft delete로 처리한다.

### 6.5 Product 연결 DB 스키마

- 생성: Product, ProductConnection
- 조회: Product, ProductConnection, Company, Contact, Deal
- 수정: Product
- 삭제: Product.deletedAt, ProductConnection
- 감사 로그: MVP User API에서는 필수 아님
- transaction: 연결 생성 시 Product와 target ownership 조회 후 insert

### 6.6 Product 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 제품명 누락 | `ValidationError` | 400 |
| 단가 음수 | `ValidationError` | 400 |
| 연결 대상 없음 | `ProductConnectionTargetNotFound` | 404 |
| 다른 사용자 대상 연결 | `OwnershipViolation` | 403 |

## 7. G12 Deal API

### 7.1 Deal API 목록

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 딜 목록 API | `ListDeals` | `GET` | `/api/deals` | `ListDealsRequest` | `DealListResponse` | Deal, Company, Contact |
| 딜 생성 API | `CreateDeal` | `POST` | `/api/deals` | `CreateDealRequest` | `DealResponse` | Deal, ProductConnection |
| 딜 상세 API | `GetDeal` | `GET` | `/api/deals/:dealId` | `GetDealRequest` | `DealDetailResponse` | Deal, DealActivity |
| 딜 수정 API | `UpdateDeal` | `PATCH` | `/api/deals/:dealId` | `UpdateDealRequest` | `DealResponse` | Deal |
| 딜 단계 변경 API | `ChangeDealStage` | `PATCH` | `/api/deals/:dealId/stage` | `ChangeDealStageRequest` | `DealResponse` | Deal, DealActivity |
| 다음 행동 수정 API | `UpdateDealNextAction` | `PATCH` | `/api/deals/:dealId/next-action` | `UpdateDealNextActionRequest` | `DealResponse` | Deal |
| 다음 행동 완료 API | `CompleteDealNextAction` | `POST` | `/api/deals/:dealId/next-action/complete` | `CompleteDealNextActionRequest` | `DealResponse` | Deal, DealActivity |
| 다음 행동 미루기 API | `SnoozeDealNextAction` | `POST` | `/api/deals/:dealId/next-action/snooze` | `SnoozeDealNextActionRequest` | `DealResponse` | Deal, DealActivity |
| 딜 삭제 API | `DeleteDeal` | `DELETE` | `/api/deals/:dealId` | `DeleteDealRequest` | `DeleteDealResponse` | Deal |
| 딜 복구 API | `RestoreDeal` | `POST` | `/api/deals/:dealId/restore` | `RestoreDealRequest` | `DealResponse` | Deal |
| 활동 로그 목록 API | `ListDealActivities` | `GET` | `/api/deals/:dealId/activities` | `ListDealActivitiesRequest` | `DealActivityListResponse` | DealActivity |
| 활동 로그 생성 API | `CreateDealActivity` | `POST` | `/api/deals/:dealId/activities` | `CreateDealActivityRequest` | `DealActivityResponse` | DealActivity |
| 활동 로그 수정 API | `UpdateDealActivity` | `PATCH` | `/api/deals/:dealId/activities/:activityId` | `UpdateDealActivityRequest` | `DealActivityResponse` | DealActivity |
| 활동 로그 삭제 API | `DeleteDealActivity` | `DELETE` | `/api/deals/:dealId/activities/:activityId` | `DeleteDealActivityRequest` | `DeleteDealActivityResponse` | DealActivity |

### 7.2 Deal request 필드

| Request 이름 | 필드 |
|---|---|
| `ListDealsRequest` | `page?:number`, `pageSize?:number`, `stage?:DealStage`, `likelihood?:DealLikelihoodStatus`, `companyId?:string`, `contactId?:string`, `search?:string`, `nextActionStatus?:NextActionStatus` |
| `CreateDealRequest` | `title:string 필수`, `companyId?:string`, `contactId?:string`, `amount:number 필수`, `stage?:DealStage`, `likelihoodStatus?:enum`, `likelihoodPercent?:number`, `expectedCloseDate?:string`, `nextActionText?:string`, `nextActionDueAt?:string`, `productIds?:string[]`, `memo?:string` |
| `UpdateDealRequest` | `dealId:string path 필수`, 생성 필드 중 수정할 필드 |
| `ChangeDealStageRequest` | `dealId:string path 필수`, `stage:DealStage 필수`, `activityTitle?:string`, `activityContent?:string` |
| `UpdateDealNextActionRequest` | `dealId:string path 필수`, `nextActionText?:string`, `nextActionDueAt?:string`, `nextActionStatus?:NextActionStatus` |
| `CompleteDealNextActionRequest` | `dealId:string path 필수`, `completedAt?:string`, `activityContent?:string` |
| `SnoozeDealNextActionRequest` | `dealId:string path 필수`, `nextActionDueAt:string 필수`, `reason?:string` |
| `CreateDealActivityRequest` | `dealId:string path 필수`, `typeId:string 필수`, `occurredAt:string 필수`, `title:string 필수`, `content?:string` |

### 7.3 Deal response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `DealResponse` | `id`, `title`, `companyId`, `companyName`, `contactId`, `contactName`, `amount`, `currency`, `stage`, `likelihoodStatus`, `likelihoodPercent`, `expectedCloseDate`, `nextActionText`, `nextActionDueAt`, `nextActionStatus`, `createdAt`, `updatedAt`, `deletedAt` |
| `DealDetailResponse` | `deal:DealResponse`, `products:ProductResponse[]`, `activities:DealActivityResponse[]`, `schedulesSummary`, `meetingNotesSummary`, `privateMemoSummary` |
| `DealActivityResponse` | `id`, `dealId`, `typeName`, `occurredAt`, `title`, `content`, `isAutoGenerated`, `createdAt`, `updatedAt` |
| `DealListResponse` | `items:DealResponse[]`, `stageSummary`, `page`, `pageSize`, `totalCount`, `hasNext` |

### 7.4 Deal 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 딜 생성/수정 시 연결된 Company, Contact, Product가 현재 사용자 소유인지 검증한다.
3. 딜 금액은 필수이며 0 이상 정수로 validation한다.
4. 단계 변경 시 이전 단계와 새 단계를 비교하고 `DealActivity`를 자동 생성한다.
5. 다음 행동 완료/미루기는 Deal을 수정하고 필요 시 `DealActivity`를 자동 생성한다.
6. 활동 로그는 수동 생성과 자동 생성을 `isAutoGenerated`로 구분한다.
7. 삭제는 soft delete로 처리한다.

### 7.5 Deal 연결 DB 스키마

- 생성: Deal, DealActivity, ProductConnection
- 조회: Deal, Company, Contact, Product, DealActivityType, DealActivity
- 수정: Deal, DealActivity
- 삭제: Deal.deletedAt, DealActivity
- 감사 로그: Admin 원문 조회 시 AuditLog
- transaction: 단계 변경, 다음 행동 완료/미루기, 회의록 연결 시 Deal/DealActivity 동시 처리 필요

### 7.6 Deal 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 딜명 누락 | `ValidationError` | 400 |
| 금액 누락 또는 음수 | `ValidationError` | 400 |
| 연결 회사/거래처/제품 없음 | `RelatedEntityNotFound` | 404 |
| 다른 사용자 소유 데이터 연결 | `OwnershipViolation` | 403 |
| 딜 없음 | `DealNotFound` | 404 |
| 삭제된 딜 수정 | `DeletedResource` | 409 |

## 8. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P1-G05-G11-CORE-DATA.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
