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
| `permanentDeleteAt` | string 또는 null | 시스템 자동 완전 삭제 예정 시각 |

### Log/Memo 공통 기준

- Log는 대상 도메인에 대한 객관적 사실, 변경, 만남, 소식, 이력 기록이다.
- Memo는 대상 도메인에 대한 사용자의 주관적 생각, 판단, 개인 참고 기록이다.
- Log는 회사 `CompanyLog`, 거래처 `ContactLog`, 제품 `ProductLog`, 딜 `DealActivity`로 도메인별 분리한다.
- 사용자 개인 Memo Log는 `PersonalMemo`로 저장하되 `targetType`과 `targetId`로 회사/거래처/제품/딜을 분리한다.
- `Company`, `Contact`, `Product`, `Deal`의 Memo는 단일 `memo` 필드가 아니라 `PersonalMemo` 기록으로 저장한다.
- 목록 response는 Memo 원문을 포함하지 않고 `hasMemo`, `memoCount`, `latestMemoAt` 같은 요약만 반환한다.
- 사용자 본인의 상세 response는 복호화된 `memos:MemoResponse[]`를 포함할 수 있다.
- Admin 기본 response는 Memo 원문을 반환하지 않고, 원문 조회는 사유 필수 민감정보 API와 `AuditLog` transaction을 거친다.

### Memo 공통 request/response

| 타입 | 필드 |
|---|---|
| `MemoResponse` | `id`, `targetType`, `targetId`, `memoDate`, `title`, `content`, `createdAt`, `updatedAt`, `deletedAt`, `permanentDeleteAt` |
| `MemoSummary` | `hasMemo:boolean`, `memoCount:number`, `latestMemoAt?:string` |

### Memo 공통 API

구현은 공통 `PersonalMemo` use case를 사용할 수 있지만, 화면과 API 계약에서는 도메인별 사용자 개인 Memo Log로 분리해 다룬다.

| API 이름 | Method | Path | Request | Response | 설명 |
|---|---|---|---|---|---|
| Memo 목록 API | `GET` | `/api/memos` | `targetType:COMPANY|CONTACT|PRODUCT|DEAL`, `targetId`, `page`, `pageSize` | `MemoListResponse` | 대상 도메인의 Memo 기록을 최신순으로 조회한다. |
| Memo 생성 API | `POST` | `/api/memos` | `targetType`, `targetId`, `memoDate`, `title?`, `content` | `MemoResponse` | 대상 소유권을 확인하고 원문을 암호화해 `PersonalMemo`를 생성한다. |
| Memo 수정 API | `PATCH` | `/api/memos/:memoId` | `memoDate?`, `title?`, `content?` | `MemoResponse` | Memo 소유권을 확인하고 content 변경 시 다시 암호화한다. |
| Memo 삭제 API | `DELETE` | `/api/memos/:memoId` | `memoId` | `DeleteMemoResponse` | Memo를 soft delete한다. |
| 회사 Memo 목록/생성 API | `GET/POST` | `/api/companies/:companyId/memos` | 회사 path 기반 | `MemoListResponse` 또는 `MemoResponse` | 회사 사용자 개인 Memo Log를 조회/생성한다. |
| 거래처 Memo 목록/생성 API | `GET/POST` | `/api/contacts/:contactId/memos` | 거래처 path 기반 | `MemoListResponse` 또는 `MemoResponse` | 거래처 사용자 개인 Memo Log를 조회/생성한다. |
| 제품 Memo 목록/생성 API | `GET/POST` | `/api/products/:productId/memos` | 제품 path 기반 | `MemoListResponse` 또는 `MemoResponse` | 제품 사용자 개인 Memo Log를 조회/생성한다. |
| 딜 Memo 목록/생성 API | `GET/POST` | `/api/deals/:dealId/memos` | 딜 path 기반 | `MemoListResponse` 또는 `MemoResponse` | 딜 사용자 개인 Memo Log를 조회/생성한다. |

## 4. G06 Company API

### 4.1 Company API 목록

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 회사 목록 API | `ListCompanies` | `GET` | `/api/companies` | `ListCompaniesRequest` | `CompanyListResponse` | Company |
| 회사 생성 API | `CreateCompany` | `POST` | `/api/companies` | `CreateCompanyRequest` | `CompanyResponse` | Company, PersonalMemo |
| 회사 상세 API | `GetCompany` | `GET` | `/api/companies/:companyId` | `GetCompanyRequest` | `CompanyDetailResponse` | Company, CompanyLog, PersonalMemo |
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
| `CreateCompanyRequest` | `name:string 필수`, `industry?:string`, `region?:string`, `address?:string`, `website?:string`, `description?:string`, `initialMemo?:string`, `tags?:string[]` |
| `GetCompanyRequest` | `companyId:string path 필수` |
| `UpdateCompanyRequest` | `companyId:string path 필수`, `name?:string`, `industry?:string`, `region?:string`, `address?:string`, `website?:string`, `description?:string`, `tags?:string[]` |
| `DeleteCompanyRequest` | `companyId:string path 필수` |
| `RestoreCompanyRequest` | `companyId:string path 필수` |
| `CreateCompanyLogRequest` | `companyId:string path 필수`, `loggedAt:string 필수`, `title:string 필수`, `content?:string` |
| `UpdateCompanyLogRequest` | `companyId:string path 필수`, `logId:string path 필수`, `loggedAt?:string`, `title?:string`, `content?:string` |

### 4.3 Company response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `CompanyResponse` | `id`, `name`, `industry`, `region`, `address`, `website`, `description`, `tags`, `hasMemo`, `memoCount`, `latestMemoAt`, `createdAt`, `updatedAt`, `deletedAt`, `permanentDeleteAt` |
| `CompanyDetailResponse` | `company:CompanyResponse`, `logs:CompanyLogResponse[]`, `memos:MemoResponse[]`, `contactCount`, `dealCount`, `productCount` |
| `CompanyListResponse` | `items:CompanyResponse[]`, `page`, `pageSize`, `totalCount`, `hasNext` |
| `CompanyLogResponse` | `id`, `companyId`, `loggedAt`, `title`, `content`, `createdAt`, `updatedAt` |

### 4.4 Company 비즈니스 로직 흐름

1. 모든 API는 AuthGuard로 현재 사용자를 확인한다.
2. 모든 조회/수정/삭제는 `userId`와 대상 ID를 함께 조건으로 검증한다.
3. 목록은 `deletedAt = null`을 기본으로 조회하고, 휴지통 화면에서만 `includeDeleted = true`를 허용한다.
4. 생성 시 같은 사용자 안에서 회사명 중복 후보를 검색할 수 있지만, MVP에서는 hard block이 아니라 후보 표시 정책으로 둔다.
5. 삭제는 hard delete가 아니라 `deletedAt`, `permanentDeleteAt`을 기록한다.
6. 복구는 `deletedAt`, `permanentDeleteAt`을 null로 되돌린다.
7. 회사 로그는 회사에 대해 확인된 객관적 사실/변경/소식으로 저장한다.
8. `initialMemo`가 있으면 회사 생성과 같은 transaction에서 `PersonalMemo(targetType=COMPANY)`를 생성한다.
9. 회사에 대한 사용자의 생각은 회사 로그가 아니라 Memo 기록으로 저장한다.

### 4.5 Company 연결 DB 스키마

- 생성: Company, CompanyLog, PersonalMemo
- 조회: Company, CompanyLog, PersonalMemo, TagAssignment
- 수정: Company, CompanyLog
- 삭제: Company.deletedAt/permanentDeleteAt, CompanyLog.deletedAt/permanentDeleteAt. 영속 삭제 대상 리소스는 soft delete 후 30일 보관 정책을 따른다.
- 감사 로그: MVP User API에서는 필수 아님
- transaction: 회사 생성과 태그 연결을 함께 처리할 때 transaction 필요

### 4.6 Company 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 회사명 누락 | `ValidationError` | 400 |
| 회사 없음 | `CompanyNotFound` | 404 |
| 다른 사용자 회사 접근 | `OwnershipViolation` | 403 |
| 삭제된 회사 조회 | `DeletedResource` | 410 |
| 삭제된 회사 수정/재삭제 | `DeletedResource` | 409 |

## 5. G08 Contact API

### 5.1 Contact API 목록

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 거래처 목록 API | `ListContacts` | `GET` | `/api/contacts` | `ListContactsRequest` | `ContactListResponse` | Contact, Company |
| 거래처 생성 API | `CreateContact` | `POST` | `/api/contacts` | `CreateContactRequest` | `ContactResponse` | Contact, Company, PersonalMemo |
| 거래처 상세 API | `GetContact` | `GET` | `/api/contacts/:contactId` | `GetContactRequest` | `ContactDetailResponse` | Contact, Company, PersonalMemo |
| 거래처 수정 API | `UpdateContact` | `PATCH` | `/api/contacts/:contactId` | `UpdateContactRequest` | `ContactResponse` | Contact |
| 거래처 삭제 API | `DeleteContact` | `DELETE` | `/api/contacts/:contactId` | `DeleteContactRequest` | `DeleteContactResponse` | Contact |
| 거래처 복구 API | `RestoreContact` | `POST` | `/api/contacts/:contactId/restore` | `RestoreContactRequest` | `ContactResponse` | Contact |
| 거래처 로그 목록 API | `ListContactLogs` | `GET` | `/api/contacts/:contactId/logs` | `ListContactLogsRequest` | `ContactLogListResponse` | Contact, ContactLog |
| 거래처 로그 생성 API | `CreateContactLog` | `POST` | `/api/contacts/:contactId/logs` | `CreateContactLogRequest` | `ContactLogResponse` | Contact, ContactLog |
| 거래처 로그 수정 API | `UpdateContactLog` | `PATCH` | `/api/contacts/:contactId/logs/:logId` | `UpdateContactLogRequest` | `ContactLogResponse` | ContactLog |
| 거래처 로그 삭제 API | `DeleteContactLog` | `DELETE` | `/api/contacts/:contactId/logs/:logId` | `DeleteContactLogRequest` | `DeleteContactLogResponse` | ContactLog |

### 5.2 Contact request 필드

| Request 이름 | 필드 |
|---|---|
| `ListContactsRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `companyId?:string`, `includeDeleted?:boolean` |
| `CreateContactRequest` | `name:string 필수`, `companyId?:string`, `department?:string`, `position?:string`, `phone?:string`, `email?:string`, `address?:string`, `initialMemo?:string` |
| `UpdateContactRequest` | `contactId:string path 필수`, 생성 필드 중 수정할 필드 |
| `CreateContactLogRequest` | `contactId:string path 필수`, `loggedAt:string 필수`, `title:string 필수`, `content?:string` |
| `UpdateContactLogRequest` | `contactId:string path 필수`, `logId:string path 필수`, `loggedAt?:string`, `title?:string`, `content?:string` |

### 5.3 Contact response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `ContactResponse` | `id`, `name`, `companyId`, `companyName`, `department`, `position`, `phone`, `email`, `address`, `hasMemo`, `memoCount`, `latestMemoAt`, `createdAt`, `updatedAt`, `deletedAt`, `permanentDeleteAt` |
| `ContactDetailResponse` | `contact:ContactResponse`, `company?:CompanyResponse`, `memos:MemoResponse[]`, `relatedDealCount`, `relatedProductCount` |
| `ContactListResponse` | `items:ContactResponse[]`, `page`, `pageSize`, `totalCount`, `hasNext` |
| `ContactLogResponse` | `id`, `contactId`, `loggedAt`, `title`, `content`, `createdAt`, `updatedAt` |

### 5.4 Contact 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `companyId`가 있으면 현재 사용자 소유 Company인지 검증한다.
3. 거래처(담당자)는 회사 없이도 저장 가능하다.
4. 전화번호와 이메일은 User Web에서는 원문을 보여주지만 Admin API에서는 기본 마스킹한다.
5. 거래처 Log는 거래처에 대해 확인된 객관적 만남/변경/소식/이력으로 `ContactLog`에 저장한다.
6. 거래처에 대한 사용자의 생각은 `PersonalMemo(targetType=CONTACT)`에 Memo 기록으로 저장한다.
7. 거래처 상세 API는 `logs[]`를 포함하지 않는다. 거래처 상세 화면의 Log 영역은 `ListContactLogs`를 별도 호출해 페이지네이션으로 조회한다.
8. `initialMemo`가 있으면 거래처 생성과 같은 transaction에서 암호화 저장한다.
9. Memo는 민감정보 후보로 보고 Admin 기본 목록에서는 원문을 내려주지 않는다.
10. 삭제는 soft delete로 처리한다.

### 5.5 Contact 연결 DB 스키마

- 생성: Contact, ContactLog, PersonalMemo. `initialMemo`가 있으면 `PersonalMemo`에 암호화 저장
- 조회: Contact, Company, PersonalMemo. Log 목록은 `ListContactLogs`에서 `ContactLog`를 별도 조회
- 수정: Contact, ContactLog. Memo 수정은 별도 Memo API에서 처리
- 삭제: Contact.deletedAt/permanentDeleteAt, ContactLog.deletedAt/permanentDeleteAt
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
| 제품 생성 API | `CreateProduct` | `POST` | `/api/products` | `CreateProductRequest` | `ProductResponse` | Product, PersonalMemo |
| 제품 상세 API | `GetProduct` | `GET` | `/api/products/:productId` | `GetProductRequest` | `ProductDetailResponse` | Product, ProductConnection, PersonalMemo |
| 제품 수정 API | `UpdateProduct` | `PATCH` | `/api/products/:productId` | `UpdateProductRequest` | `ProductResponse` | Product |
| 제품 삭제 API | `DeleteProduct` | `DELETE` | `/api/products/:productId` | `DeleteProductRequest` | `DeleteProductResponse` | Product |
| 제품 복구 API | `RestoreProduct` | `POST` | `/api/products/:productId/restore` | `RestoreProductRequest` | `ProductResponse` | Product |
| 제품 연결 생성 API | `CreateProductConnection` | `POST` | `/api/products/:productId/connections` | `CreateProductConnectionRequest` | `ProductConnectionResponse` | ProductConnection |
| 제품 연결 삭제 API | `DeleteProductConnection` | `DELETE` | `/api/products/:productId/connections/:connectionId` | `DeleteProductConnectionRequest` | `DeleteProductConnectionResponse` | ProductConnection |
| 제품 로그 목록 API | `ListProductLogs` | `GET` | `/api/products/:productId/logs` | `ListProductLogsRequest` | `ProductLogListResponse` | Product, ProductLog |
| 제품 로그 생성 API | `CreateProductLog` | `POST` | `/api/products/:productId/logs` | `CreateProductLogRequest` | `ProductLogResponse` | Product, ProductLog |
| 제품 로그 수정 API | `UpdateProductLog` | `PATCH` | `/api/products/:productId/logs/:logId` | `UpdateProductLogRequest` | `ProductLogResponse` | ProductLog |
| 제품 로그 삭제 API | `DeleteProductLog` | `DELETE` | `/api/products/:productId/logs/:logId` | `DeleteProductLogRequest` | `DeleteProductLogResponse` | ProductLog |

### 6.2 Product request 필드

| Request 이름 | 필드 |
|---|---|
| `ListProductsRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `category?:string`, `includeDeleted?:boolean` |
| `CreateProductRequest` | `name:string 필수`, `category?:string`, `unitPrice?:number`, `currency?:string 기본 KRW`, `description?:string`, `initialMemo?:string` |
| `UpdateProductRequest` | `productId:string path 필수`, 생성 필드 중 수정할 필드 |
| `CreateProductConnectionRequest` | `productId:string path 필수`, `targetType:COMPANY|CONTACT|DEAL`, `targetId:string`, `connectionType:enum`, `note?:string` |
| `CreateProductLogRequest` | `productId:string path 필수`, `loggedAt:string 필수`, `title:string 필수`, `content?:string` |
| `UpdateProductLogRequest` | `productId:string path 필수`, `logId:string path 필수`, `loggedAt?:string`, `title?:string`, `content?:string` |

### 6.3 Product response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `ProductResponse` | `id`, `name`, `category`, `unitPrice`, `currency`, `description`, `hasMemo`, `memoCount`, `latestMemoAt`, `createdAt`, `updatedAt`, `deletedAt`, `permanentDeleteAt` |
| `ProductDetailResponse` | `product:ProductResponse`, `connections:ProductConnectionResponse[]`, `memos:MemoResponse[]` |
| `ProductConnectionResponse` | `id`, `productId`, `targetType`, `targetId`, `targetName`, `connectionType`, `note`, `deletedAt`, `permanentDeleteAt` |
| `ProductLogResponse` | `id`, `productId`, `loggedAt`, `title`, `content`, `createdAt`, `updatedAt` |
| `ProductListResponse` | `items:ProductResponse[]`, `page`, `pageSize`, `totalCount`, `hasNext` |

### 6.4 Product 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 제품 생성/수정 시 금액은 0 이상 정수로 validation한다.
3. 제품 연결 생성 시 target type별 소유권을 검증한다.
4. 제품 연결은 자유 텍스트 대상에 연결하지 않고 반드시 존재하는 Company/Contact/Deal에 연결한다.
5. 제품 Log는 제품에 대해 확인된 객관적 변경/소식/제안/이력으로 `ProductLog`에 저장한다.
6. 제품에 대한 사용자의 생각은 `PersonalMemo(targetType=PRODUCT)`에 Memo 기록으로 저장한다.
7. 제품 상세 API는 `logs[]`를 포함하지 않는다. 제품 상세 화면의 Log 영역은 `ListProductLogs`를 별도 호출해 페이지네이션으로 조회한다.
8. `initialMemo`가 있으면 제품 생성과 같은 transaction에서 암호화 저장한다.
9. 삭제는 soft delete로 처리한다.

### 6.5 Product 연결 DB 스키마

- 생성: Product, ProductLog, ProductConnection, PersonalMemo
- 조회: Product, ProductConnection, Company, Contact, Deal, PersonalMemo. Log 목록은 `ListProductLogs`에서 `ProductLog`를 별도 조회
- 수정: Product, ProductLog
- 삭제: Product.deletedAt/permanentDeleteAt, ProductLog.deletedAt/permanentDeleteAt, ProductConnection.deletedAt/permanentDeleteAt
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
| 딜 생성 API | `CreateDeal` | `POST` | `/api/deals` | `CreateDealRequest` | `DealResponse` | Deal, ProductConnection, PersonalMemo |
| 딜 상세 API | `GetDeal` | `GET` | `/api/deals/:dealId` | `GetDealRequest` | `DealDetailResponse` | Deal, DealActivity, PersonalMemo |
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
| `CreateDealRequest` | `title:string 필수`, `companyId?:string`, `contactId?:string`, `amount:number 필수`, `stage?:DealStage`, `likelihoodStatus?:enum`, `likelihoodPercent?:number`, `expectedCloseDate?:string`, `nextActionText?:string`, `nextActionDueAt?:string`, `productIds?:string[]`, `initialMemo?:string` |
| `UpdateDealRequest` | `dealId:string path 필수`, 생성 필드 중 수정할 필드 |
| `ChangeDealStageRequest` | `dealId:string path 필수`, `stage:DealStage 필수`, `activityTitle?:string`, `activityContent?:string` |
| `UpdateDealNextActionRequest` | `dealId:string path 필수`, `nextActionText?:string`, `nextActionDueAt?:string`, `nextActionStatus?:NextActionStatus` |
| `CompleteDealNextActionRequest` | `dealId:string path 필수`, `completedAt?:string`, `activityContent?:string` |
| `SnoozeDealNextActionRequest` | `dealId:string path 필수`, `nextActionDueAt:string 필수`, `reason?:string` |
| `CreateDealActivityRequest` | `dealId:string path 필수`, `typeId:string 필수`, `occurredAt:string 필수`, `title:string 필수`, `content?:string` |

### 7.3 Deal response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `DealResponse` | `id`, `title`, `companyId`, `companyName`, `contactId`, `contactName`, `amount`, `currency`, `stage`, `likelihoodStatus`, `likelihoodPercent`, `expectedCloseDate`, `nextActionText`, `nextActionDueAt`, `nextActionStatus`, `hasMemo`, `memoCount`, `latestMemoAt`, `createdAt`, `updatedAt`, `deletedAt`, `permanentDeleteAt` |
| `DealDetailResponse` | `deal:DealResponse`, `products:ProductResponse[]`, `activities:DealActivityResponse[]`, `memos:MemoResponse[]`, `schedulesSummary`, `meetingNotesSummary` |
| `DealActivityResponse` | `id`, `dealId`, `typeName`, `occurredAt`, `title`, `content`, `isAutoGenerated`, `createdAt`, `updatedAt`, `deletedAt`, `permanentDeleteAt` |
| `DealListResponse` | `items:DealResponse[]`, `stageSummary`, `page`, `pageSize`, `totalCount`, `hasNext` |

### 7.4 Deal 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 딜 생성/수정 시 연결된 Company, Contact, Product가 현재 사용자 소유인지 검증한다.
3. 딜 금액은 필수이며 0 이상 정수로 validation한다.
4. 딜 활동 로그는 객관적 사실/상태 변경/행동 이력으로 저장한다.
5. 딜에 대한 사용자의 생각은 `PersonalMemo(targetType=DEAL)`에 Memo 기록으로 저장한다.
6. `initialMemo`가 있으면 딜 생성과 같은 transaction에서 암호화 저장한다.
7. 단계 변경 시 이전 단계와 새 단계를 비교하고 `DealActivity`를 자동 생성한다.
8. 다음 행동 완료/미루기는 Deal을 수정하고 필요 시 `DealActivity`를 자동 생성한다.
9. 활동 로그는 수동 생성과 자동 생성을 `isAutoGenerated`로 구분한다.
10. 삭제는 soft delete로 처리한다.

### 7.5 Deal 연결 DB 스키마

- 생성: Deal, DealActivity, ProductConnection, PersonalMemo
- 조회: Deal, Company, Contact, Product, DealActivityType, DealActivity, PersonalMemo
- 수정: Deal, DealActivity. Memo 수정은 별도 Memo API에서 처리
- 삭제: Deal.deletedAt/permanentDeleteAt, DealActivity.deletedAt/permanentDeleteAt
- 감사 로그: Admin 원문 조회 시 AuditLog
- transaction: 딜 생성에서 ProductConnection 또는 initial Memo를 함께 처리할 때 필요. 단계 변경, 다음 행동 완료/미루기, 회의록 연결 시 Deal/DealActivity 동시 처리 필요

### 7.6 Deal 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 딜명 누락 | `ValidationError` | 400 |
| 금액 누락 또는 음수 | `ValidationError` | 400 |
| 연결 회사/거래처/제품 없음 | `RelatedEntityNotFound` | 404 |
| 다른 사용자 소유 데이터 연결 | `OwnershipViolation` | 403 |
| 딜 없음 | `DealNotFound` | 404 |
| 삭제된 딜 조회 | `DeletedResource` | 410 |
| 삭제된 딜 수정/상태 변경/재삭제 | `DeletedResource` | 409 |

## 8. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P1-G05-G11-CORE-DATA.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
