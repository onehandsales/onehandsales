# G06-G12 엔드포인트별 구현 계약

## 1. 목적

이 문서는 `G06-G12-CORE-DOMAIN-API.md`를 구현자가 바로 따라갈 수 있도록 API별 request, 비즈니스 로직, response, 연결 DB, transaction, 에러 기준으로 확장한 구현 계약이다.

Frontend는 화면 상태와 API 호출 조건을 이 문서 기준으로 맞추고, Backend는 controller, service, repository, validation, transaction 기준을 이 문서 기준으로 맞춘다.

## 2. 공통 처리 기준

- 모든 User API는 `AuthGuard`로 현재 사용자 context를 확보한다.
- 모든 단건 조회, 수정, 삭제, 복구는 `id`와 `userId`를 함께 조건으로 검증한다.
- 목록 API는 기본적으로 `deletedAt = null`만 조회한다.
- `includeDeleted = true`는 휴지통 또는 명시된 복구 화면에서만 사용한다.
- soft delete된 리소스를 소유자가 기존 상세 URL로 조회하면 `410 DeletedResource`를 반환한다.
- soft delete된 리소스에 대한 수정, 상태 변경, 연결 변경, 재삭제 같은 변경 요청은 `409 DeletedResource`로 막는다.
- 복구는 일반 수정 API가 아니라 restore API 또는 휴지통 restore API로만 처리한다.
- 생성/수정 API는 빈 문자열을 trim한 뒤 validation한다.
- 다른 사용자 소유 데이터 연결은 `OwnershipViolation` 403으로 처리한다.
- soft delete 모델은 hard delete하지 않고 `deletedAt`과 `permanentDeleteAt = deletedAt + 30일`을 기록한다.
- `Tag`와 `TagAssignment`는 분류/연결 상태 데이터이므로 hard delete하고 휴지통에 넣지 않는다.
- `Tag` 생성/수정/삭제와 `TagAssignment` 연결/해제는 모두 `TagLog`에 append-only로 남긴다. 삭제 후에도 로그가 남아야 하므로 로그에는 태그명/색상/대상 스냅샷을 저장한다.
- `Tag` 삭제 시 active assignment마다 `TagLog(TAG_UNASSIGNED)`를 남기고, `TagLog(TAG_DELETED)`를 남긴 뒤 `TagAssignment`와 `Tag`를 hard delete한다.
- `Company`, `Contact`, `Product`, `Deal`의 Log는 객관 기록, Memo는 주관 기록으로 분리한다.
- Log는 회사 `CompanyLog`, 거래처 `ContactLog`, 제품 `ProductLog`, 딜 `DealActivity`로 도메인별 분리한다.
- 사용자 개인 Memo Log는 `PersonalMemo`로 저장하되 `targetType`과 `targetId`로 회사/거래처/제품/딜을 분리한다.
- Memo는 단일 엔티티 필드가 아니라 `PersonalMemo` 기록으로 저장하며, 목록에는 원문 대신 `hasMemo`, `memoCount`, `latestMemoAt` 요약만 반환한다.
- Memo 생성/수정은 `EncryptionPort`로 원문을 암호화하고, User 상세 화면에서만 복호화된 Memo 기록 목록을 반환할 수 있다.
- 상세 request/response 타입은 `G06-G12-CORE-DOMAIN-API.md`의 request/response 필드 정의와 이 문서의 엔드포인트별 계약을 함께 따른다.

## 3. 공통 Memo 엔드포인트 계약

구현은 공통 `PersonalMemo` use case를 사용할 수 있지만, 화면과 API 계약에서는 도메인별 사용자 개인 Memo Log로 분리한다. 도메인 path 기반 endpoint는 내부적으로 `targetType`과 `targetId`를 확정해 같은 use case를 호출할 수 있다.

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| Memo 목록 API | `ListMemos` | `ListMemosRequest`: `targetType`, `targetId`, `page`, `pageSize` | targetType별 대상 모델 소유권을 확인한다. 삭제되지 않은 Memo를 `memoDate` 최신순으로 조회한다. | `MemoListResponse`: `items:MemoResponse[]`, pagination | target 모델, `PersonalMemo` 조회. transaction 없음. | `MemoTargetNotFound` 404, `OwnershipViolation` 403 |
| Memo 생성 API | `CreateMemo` | `CreateMemoRequest`: `targetType`, `targetId`, `memoDate`, `title`, `content` | 대상 소유권을 확인한다. content를 trim/검증하고 `EncryptionPort`로 암호화해 저장한다. | `MemoResponse`: 복호화된 Memo 기록 | target 모델 조회, `PersonalMemo` insert. transaction 필요 | `ValidationError` 400, `MemoTargetNotFound` 404 |
| Memo 수정 API | `UpdateMemo` | `UpdateMemoRequest`: `memoId`, `memoDate`, `title`, `content` | Memo 소유권과 삭제 여부를 확인한다. content 변경 시 다시 암호화한다. | `MemoResponse`: 수정된 Memo 기록 | `PersonalMemo` update. content 변경 시 encryption 필요 | `MemoNotFound` 404, `DeletedResource` 409 |
| Memo 삭제 API | `DeleteMemo` | `DeleteMemoRequest`: `memoId` | Memo 소유권을 확인한다. `deletedAt`, `permanentDeleteAt`을 기록해 soft delete한다. | `DeleteMemoResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `PersonalMemo` update. transaction 없음 | `MemoNotFound` 404, `DeletedResource` 409 |
| 도메인별 Memo 목록 API | `ListTargetMemos` | path: `companyId`/`contactId`/`productId`/`dealId`, `page`, `pageSize` | path의 대상 소유권을 확인하고 해당 target의 Memo를 최신순으로 조회한다. | `MemoListResponse` | target 모델, `PersonalMemo` 조회. transaction 없음 | `MemoTargetNotFound` 404 |
| 도메인별 Memo 생성 API | `CreateTargetMemo` | path 대상 ID, `memoDate`, `title`, `content` | path 대상 소유권을 확인하고 해당 targetType/targetId로 Memo를 암호화 저장한다. | `MemoResponse` | target 모델 조회, `PersonalMemo` insert. transaction 필요 | `ValidationError` 400, `MemoTargetNotFound` 404 |

## 4. G06 Company 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 회사 목록 API | `ListCompanies` | `ListCompaniesRequest`: `page`, `pageSize`, `search`, `includeDeleted` | 인증 사용자의 회사만 조회한다. `search`는 회사명, 업종, 지역에 적용한다. 기본은 삭제되지 않은 회사만 반환한다. 최신 수정순으로 정렬한다. | `CompanyListResponse`: `items:CompanyResponse[]`, `page`, `pageSize`, `totalCount`, `hasNext` | `Company` 조회와 count. transaction 없음. | `Unauthorized` 401, `ValidationError` 400 |
| 회사 생성 API | `CreateCompany` | `CreateCompanyRequest`: `name` 필수, `industry`, `region`, `address`, `website`, `description`, `initialMemo`, `tags` | 회사명을 trim하고 필수값을 검증한다. 같은 사용자 안의 유사 회사명은 후보로만 판단하고 MVP에서는 저장을 막지 않는다. Company를 생성하고 태그가 있으면 연결한다. 태그 연결 시 `TagLog(TAG_ASSIGNED)`를 남긴다. `initialMemo`가 있으면 `PersonalMemo(targetType=COMPANY)`를 암호화 저장한다. | `CompanyResponse`: `id`, `name`, `industry`, `region`, `address`, `website`, `description`, `tags`, `hasMemo`, `memoCount`, `latestMemoAt`, timestamps | `Company` insert, `Tag`, `TagAssignment`, `TagLog`, `PersonalMemo` 선택 insert. 태그 또는 initial Memo 처리 시 transaction 필요. | `ValidationError` 400 |
| 회사 상세 API | `GetCompany` | `GetCompanyRequest`: `companyId` path 필수 | 대상 회사의 소유권을 확인한다. 삭제된 회사면 `410 DeletedResource`를 반환한다. 회사 기본 정보, 회사 로그, Memo 기록, 관련 거래처/딜/제품 수를 조회한다. | `CompanyDetailResponse`: `company`, `logs`, `memos`, `contactCount`, `dealCount`, `productCount` | `Company`, `CompanyLog`, `PersonalMemo`, `Contact`, `Deal`, `ProductConnection` 조회. transaction 없음. | `CompanyNotFound` 404, `OwnershipViolation` 403, `DeletedResource` 410 |
| 회사 수정 API | `UpdateCompany` | `UpdateCompanyRequest`: `companyId`, 수정 필드 | 소유권과 삭제 여부를 확인한다. 전달된 필드만 갱신한다. 태그를 수정하는 경우 기존 연결과 신규 연결을 재계산한다. 추가된 연결은 `TagAssignment` insert와 `TagLog(TAG_ASSIGNED)`, 제거된 연결은 `TagLog(TAG_UNASSIGNED)` insert 후 `TagAssignment` hard delete로 처리한다. | `CompanyResponse`: 수정된 회사 정보 | `Company` update, `TagAssignment` insert/delete, `TagLog` insert 선택. 태그 수정 시 transaction 필요. | `CompanyNotFound` 404, `DeletedResource` 409, `ValidationError` 400 |
| 회사 삭제 API | `DeleteCompany` | `DeleteCompanyRequest`: `companyId` path 필수 | 소유권을 확인한다. 이미 삭제된 경우 `409 DeletedResource`를 반환한다. 삭제되지 않은 회사는 `deletedAt`, `permanentDeleteAt`을 기록한다. | `DeleteCompanyResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `Company.deletedAt`, `Company.permanentDeleteAt` update. transaction 없음. | `CompanyNotFound` 404, `OwnershipViolation` 403, `DeletedResource` 409 |
| 회사 복구 API | `RestoreCompany` | `RestoreCompanyRequest`: `companyId` path 필수 | 소유권을 확인한다. 삭제된 회사의 `deletedAt`, `permanentDeleteAt`을 null로 되돌린다. 삭제되지 않은 회사는 그대로 반환한다. | `CompanyResponse`: 복구된 회사 정보 | `Company.deletedAt`, `Company.permanentDeleteAt` update. transaction 없음. | `CompanyNotFound` 404, `OwnershipViolation` 403 |
| 회사 로그 목록 API | `ListCompanyLogs` | `ListCompanyLogsRequest`: `companyId`, `page`, `pageSize` | 회사 소유권을 먼저 확인한다. 해당 회사의 로그를 최신 `loggedAt` 기준으로 조회한다. | `CompanyLogListResponse`: `items:CompanyLogResponse[]`, pagination | `Company`, `CompanyLog` 조회. transaction 없음. | `CompanyNotFound` 404, `OwnershipViolation` 403 |
| 회사 로그 생성 API | `CreateCompanyLog` | `CreateCompanyLogRequest`: `companyId`, `loggedAt`, `title`, `content` | 회사 소유권을 확인한다. `title`과 `loggedAt`을 검증한 뒤 회사 히스토리를 생성한다. | `CompanyLogResponse`: `id`, `companyId`, `loggedAt`, `title`, `content`, timestamps | `Company` 조회, `CompanyLog` insert. transaction 없음. | `CompanyNotFound` 404, `ValidationError` 400 |
| 회사 로그 수정 API | `UpdateCompanyLog` | `UpdateCompanyLogRequest`: `companyId`, `logId`, 수정 필드 | 회사와 로그가 같은 사용자/회사에 속하는지 확인한다. 전달된 필드만 수정한다. | `CompanyLogResponse`: 수정된 로그 정보 | `CompanyLog` update. transaction 없음. | `CompanyLogNotFound` 404, `OwnershipViolation` 403 |
| 회사 로그 삭제 API | `DeleteCompanyLog` | `DeleteCompanyLogRequest`: `companyId`, `logId` | 회사와 로그 소유권을 확인한다. 로그는 soft delete하고 `deletedAt`, `permanentDeleteAt`을 기록한다. | `DeleteCompanyLogResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `CompanyLog` update. transaction 없음. | `CompanyLogNotFound` 404, `OwnershipViolation` 403 |

## 5. G08 Contact 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 거래처 목록 API | `ListContacts` | `ListContactsRequest`: `page`, `pageSize`, `search`, `companyId`, `includeDeleted` | 인증 사용자의 거래처만 조회한다. `companyId`가 있으면 회사 소유권을 먼저 확인한다. Memo 원문은 목록에 포함하지 않고 `hasMemo`, `memoCount`, `latestMemoAt`만 반환한다. | `ContactListResponse`: `items:ContactResponse[]`, pagination | `Contact`, `Company`, `PersonalMemo` 요약 조회. transaction 없음. | `CompanyNotFound` 404, `OwnershipViolation` 403 |
| 거래처 생성 API | `CreateContact` | `CreateContactRequest`: `name` 필수, `companyId`, `department`, `position`, `phone`, `email`, `address`, `initialMemo` | 이름을 검증한다. 회사가 있으면 사용자 소유 회사인지 확인한다. `initialMemo`가 있으면 `EncryptionPort`로 암호화해 `PersonalMemo(targetType=CONTACT)`에 저장한다. | `ContactResponse`: `id`, `name`, `companyId`, `companyName`, 연락처 필드, `hasMemo`, `memoCount`, `latestMemoAt`, timestamps | `Contact` insert, `Company` 조회, `PersonalMemo` 선택 insert. initial Memo가 있으면 transaction 필요. | `ValidationError` 400, `CompanyNotFound` 404, `OwnershipViolation` 403 |
| 거래처 상세 API | `GetContact` | `GetContactRequest`: `contactId` path 필수 | 거래처 소유권을 확인한다. 삭제된 거래처면 `410 DeletedResource`를 반환한다. 연결 회사, Memo 기록, 관련 딜/제품 수를 함께 조회한다. | `ContactDetailResponse`: `contact`, `company`, `memos`, `relatedDealCount`, `relatedProductCount` | `Contact`, `Company`, `Deal`, `ProductConnection`, `PersonalMemo` 조회. transaction 없음. | `ContactNotFound` 404, `OwnershipViolation` 403, `DeletedResource` 410 |
| 거래처 수정 API | `UpdateContact` | `UpdateContactRequest`: `contactId`, 수정 필드 | 거래처 소유권과 삭제 여부를 확인한다. 변경 companyId가 있으면 회사 소유권도 확인한다. Memo 기록은 이 API에서 덮어쓰지 않고 별도 Memo API로 처리한다. | `ContactResponse`: 수정된 거래처 정보 | `Contact` update, `Company` 조회. transaction 없음. | `ContactNotFound` 404, `CompanyNotFound` 404, `OwnershipViolation` 403, `DeletedResource` 409 |
| 거래처 삭제 API | `DeleteContact` | `DeleteContactRequest`: `contactId` path 필수 | 소유권을 확인한다. 이미 삭제된 경우 `409 DeletedResource`를 반환한다. 삭제되지 않은 거래처는 `deletedAt`, `permanentDeleteAt`을 기록한다. 연결 딜은 자동 삭제하지 않는다. | `DeleteContactResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `Contact.deletedAt`, `Contact.permanentDeleteAt` update. transaction 없음. | `ContactNotFound` 404, `OwnershipViolation` 403, `DeletedResource` 409 |
| 거래처 복구 API | `RestoreContact` | `RestoreContactRequest`: `contactId` path 필수 | 소유권을 확인하고 `deletedAt`, `permanentDeleteAt`을 null로 되돌린다. 연결 회사가 삭제된 상태여도 거래처 자체 복구는 허용하되 UI에서 회사 상태를 표시한다. | `ContactResponse`: 복구된 거래처 정보 | `Contact.deletedAt`, `Contact.permanentDeleteAt` update, `Company` 선택 조회. transaction 없음. | `ContactNotFound` 404, `OwnershipViolation` 403 |
| 거래처 로그 목록 API | `ListContactLogs` | `ListContactLogsRequest`: `contactId`, `page`, `pageSize` | 거래처 소유권을 먼저 확인한다. 해당 거래처의 객관 Log를 최신 `loggedAt` 기준으로 조회한다. | `ContactLogListResponse`: `items:ContactLogResponse[]`, pagination | `Contact`, `ContactLog` 조회. transaction 없음. | `ContactNotFound` 404, `OwnershipViolation` 403 |
| 거래처 로그 생성 API | `CreateContactLog` | `CreateContactLogRequest`: `contactId`, `loggedAt`, `title`, `content` | 거래처 소유권을 확인한다. `title`과 `loggedAt`을 검증한 뒤 거래처 객관 기록을 생성한다. 사용자의 생각은 Memo API로 저장한다. | `ContactLogResponse`: `id`, `contactId`, `loggedAt`, `title`, `content`, timestamps | `Contact` 조회, `ContactLog` insert. transaction 없음. | `ContactNotFound` 404, `ValidationError` 400 |
| 거래처 로그 수정 API | `UpdateContactLog` | `UpdateContactLogRequest`: `contactId`, `logId`, 수정 필드 | 거래처와 Log가 같은 사용자/거래처에 속하는지 확인한다. 전달된 필드만 수정한다. | `ContactLogResponse`: 수정된 로그 정보 | `ContactLog` update. transaction 없음. | `ContactLogNotFound` 404, `OwnershipViolation` 403 |
| 거래처 로그 삭제 API | `DeleteContactLog` | `DeleteContactLogRequest`: `contactId`, `logId` | 거래처와 Log 소유권을 확인한다. Log는 soft delete하고 `deletedAt`, `permanentDeleteAt`을 기록한다. | `DeleteContactLogResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `ContactLog` update. transaction 없음. | `ContactLogNotFound` 404, `OwnershipViolation` 403 |

## 6. G10 Product 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 제품 목록 API | `ListProducts` | `ListProductsRequest`: `page`, `pageSize`, `search`, `category`, `includeDeleted` | 사용자 소유 제품만 조회한다. 제품명/카테고리 검색과 카테고리 필터를 적용한다. | `ProductListResponse`: `items:ProductResponse[]`, pagination | `Product` 조회와 count. transaction 없음. | `ValidationError` 400 |
| 제품 생성 API | `CreateProduct` | `CreateProductRequest`: `name` 필수, `category`, `unitPrice`, `currency`, `description`, `initialMemo` | 제품명과 단가를 검증한다. 통화가 없으면 `KRW`를 기본으로 저장한다. `initialMemo`가 있으면 `PersonalMemo(targetType=PRODUCT)`를 암호화 저장한다. | `ProductResponse`: `id`, `name`, `category`, `unitPrice`, `currency`, `description`, `hasMemo`, `memoCount`, `latestMemoAt`, timestamps | `Product` insert, `PersonalMemo` 선택 insert. initial Memo가 있으면 transaction 필요. | `ValidationError` 400 |
| 제품 상세 API | `GetProduct` | `GetProductRequest`: `productId` path 필수 | 제품 소유권을 확인한다. 삭제된 제품이면 `410 DeletedResource`를 반환한다. 연결된 회사/거래처/딜 정보와 Memo 기록을 함께 조회한다. | `ProductDetailResponse`: `product`, `connections`, `memos` | `Product`, `ProductConnection`, `Company`, `Contact`, `Deal`, `PersonalMemo` 조회. transaction 없음. | `ProductNotFound` 404, `OwnershipViolation` 403, `DeletedResource` 410 |
| 제품 수정 API | `UpdateProduct` | `UpdateProductRequest`: `productId`, 수정 필드 | 소유권과 삭제 여부를 확인한다. 전달된 필드만 갱신하고 단가는 0 이상으로 검증한다. | `ProductResponse`: 수정된 제품 정보 | `Product` update. transaction 없음. | `ProductNotFound` 404, `DeletedResource` 409, `ValidationError` 400 |
| 제품 삭제 API | `DeleteProduct` | `DeleteProductRequest`: `productId` path 필수 | 소유권을 확인한다. 이미 삭제된 경우 `409 DeletedResource`를 반환한다. 삭제되지 않은 제품은 `deletedAt`, `permanentDeleteAt`을 기록한다. 기존 딜 연결은 유지하되 삭제 상태 제품으로 표시한다. | `DeleteProductResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `Product.deletedAt`, `Product.permanentDeleteAt` update. transaction 없음. | `ProductNotFound` 404, `OwnershipViolation` 403, `DeletedResource` 409 |
| 제품 복구 API | `RestoreProduct` | `RestoreProductRequest`: `productId` path 필수 | 소유권을 확인하고 `deletedAt`, `permanentDeleteAt`을 null로 되돌린다. | `ProductResponse`: 복구된 제품 정보 | `Product.deletedAt`, `Product.permanentDeleteAt` update. transaction 없음. | `ProductNotFound` 404, `OwnershipViolation` 403 |
| 제품 연결 생성 API | `CreateProductConnection` | `CreateProductConnectionRequest`: `productId`, `targetType`, `targetId`, `connectionType`, `note` | 제품 소유권을 확인한다. targetType별 대상 모델이 현재 사용자 소유인지 검증한다. 동일 제품-대상 중복 연결은 409로 막는다. `note`는 연결 관계에 대한 짧은 설명이며 도메인 Memo 기록으로 보지 않는다. | `ProductConnectionResponse`: `id`, `productId`, `targetType`, `targetId`, `targetName`, `connectionType`, `note` | `Product`, target 모델 조회, `ProductConnection` insert. transaction 필요. | `ProductConnectionTargetNotFound` 404, `OwnershipViolation` 403, `DuplicateProductConnection` 409 |
| 제품 연결 삭제 API | `DeleteProductConnection` | `DeleteProductConnectionRequest`: `productId`, `connectionId` | 제품과 연결 레코드가 같은 사용자 소유인지 확인한다. 연결만 soft delete하고 대상 데이터는 삭제하지 않는다. | `DeleteProductConnectionResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `ProductConnection.deletedAt`, `ProductConnection.permanentDeleteAt` update. transaction 없음. | `ProductConnectionNotFound` 404, `OwnershipViolation` 403 |
| 제품 로그 목록 API | `ListProductLogs` | `ListProductLogsRequest`: `productId`, `page`, `pageSize` | 제품 소유권을 먼저 확인한다. 해당 제품의 객관 Log를 최신 `loggedAt` 기준으로 조회한다. | `ProductLogListResponse`: `items:ProductLogResponse[]`, pagination | `Product`, `ProductLog` 조회. transaction 없음. | `ProductNotFound` 404, `OwnershipViolation` 403 |
| 제품 로그 생성 API | `CreateProductLog` | `CreateProductLogRequest`: `productId`, `loggedAt`, `title`, `content` | 제품 소유권을 확인한다. `title`과 `loggedAt`을 검증한 뒤 제품 객관 기록을 생성한다. 사용자의 생각은 Memo API로 저장한다. | `ProductLogResponse`: `id`, `productId`, `loggedAt`, `title`, `content`, timestamps | `Product` 조회, `ProductLog` insert. transaction 없음. | `ProductNotFound` 404, `ValidationError` 400 |
| 제품 로그 수정 API | `UpdateProductLog` | `UpdateProductLogRequest`: `productId`, `logId`, 수정 필드 | 제품과 Log가 같은 사용자/제품에 속하는지 확인한다. 전달된 필드만 수정한다. | `ProductLogResponse`: 수정된 로그 정보 | `ProductLog` update. transaction 없음. | `ProductLogNotFound` 404, `OwnershipViolation` 403 |
| 제품 로그 삭제 API | `DeleteProductLog` | `DeleteProductLogRequest`: `productId`, `logId` | 제품과 Log 소유권을 확인한다. Log는 soft delete하고 `deletedAt`, `permanentDeleteAt`을 기록한다. | `DeleteProductLogResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `ProductLog` update. transaction 없음. | `ProductLogNotFound` 404, `OwnershipViolation` 403 |

## 7. G12 Deal 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 딜 목록 API | `ListDeals` | `ListDealsRequest`: `page`, `pageSize`, `stage`, `likelihood`, `companyId`, `contactId`, `search`, `nextActionStatus` | 사용자 소유 딜만 조회한다. 단계/가능성/다음 행동 필터와 검색을 적용한다. 목록 상단 요약을 위해 stage별 count를 함께 계산한다. | `DealListResponse`: `items:DealResponse[]`, `stageSummary`, pagination | `Deal`, `Company`, `Contact` 조회와 count. transaction 없음. | `ValidationError` 400 |
| 딜 생성 API | `CreateDeal` | `CreateDealRequest`: `title`, `amount`, `companyId`, `contactId`, `stage`, `likelihoodStatus`, `likelihoodPercent`, `expectedCloseDate`, `nextActionText`, `nextActionDueAt`, `productIds`, `initialMemo` | 딜명과 금액을 검증한다. 연결 회사/거래처/제품 소유권을 확인한다. Deal을 만들고 제품 연결과 최초 활동 로그를 선택 생성한다. `initialMemo`가 있으면 `EncryptionPort`로 암호화해 `PersonalMemo(targetType=DEAL)`에 저장한다. | `DealResponse`: `id`, `title`, 연결명, `amount`, `stage`, 가능성, 다음 행동, `hasMemo`, `memoCount`, `latestMemoAt`, timestamps | `Deal` insert, `Company`, `Contact`, `Product`, `ProductConnection`, `DealActivity` 선택 insert, `PersonalMemo` 선택 insert. transaction 필요. | `ValidationError` 400, `RelatedEntityNotFound` 404, `OwnershipViolation` 403 |
| 딜 상세 API | `GetDeal` | `GetDealRequest`: `dealId` path 필수 | 딜 소유권을 확인한다. 삭제된 딜이면 `410 DeletedResource`를 반환한다. 연결 제품, 활동 로그, Memo 기록, 일정 요약, 회의록 요약을 함께 조회한다. | `DealDetailResponse`: `deal`, `products`, `activities`, `memos`, `schedulesSummary`, `meetingNotesSummary` | `Deal`, `Product`, `ProductConnection`, `DealActivity`, `Schedule`, `MeetingNote`, `PersonalMemo` 조회. transaction 없음. | `DealNotFound` 404, `OwnershipViolation` 403, `DeletedResource` 410 |
| 딜 수정 API | `UpdateDeal` | `UpdateDealRequest`: `dealId`, 수정 필드 | 딜 소유권과 삭제 여부를 확인한다. 연결 데이터 변경 시 각 대상 소유권을 다시 검증한다. 제품 목록이 바뀌면 연결을 재계산한다. Memo 기록은 이 API에서 덮어쓰지 않고 별도 Memo API로 처리한다. | `DealResponse`: 수정된 딜 정보 | `Deal` update, `ProductConnection` 재구성 선택. 제품 연결 변경 시 transaction 필요. | `DealNotFound` 404, `DeletedResource` 409, `RelatedEntityNotFound` 404 |
| 딜 단계 변경 API | `ChangeDealStage` | `ChangeDealStageRequest`: `dealId`, `stage`, `activityTitle`, `activityContent` | 이전 단계와 새 단계를 비교한다. 단계가 실제로 바뀌면 Deal을 갱신하고 자동 `DealActivity`를 생성한다. | `DealResponse`: 단계가 변경된 딜 정보 | `Deal` update, `DealActivity` insert. transaction 필요. | `DealNotFound` 404, `ValidationError` 400, `DeletedResource` 409 |
| 다음 행동 수정 API | `UpdateDealNextAction` | `UpdateDealNextActionRequest`: `dealId`, `nextActionText`, `nextActionDueAt`, `nextActionStatus` | 딜 소유권과 삭제 여부를 확인한다. 다음 행동 텍스트, 기한, 상태를 부분 수정한다. 기한이 과거여도 저장은 허용하되 UI에서 지연 상태를 표시한다. | `DealResponse`: 다음 행동이 변경된 딜 정보 | `Deal` update. transaction 없음. | `DealNotFound` 404, `ValidationError` 400, `DeletedResource` 409 |
| 다음 행동 완료 API | `CompleteDealNextAction` | `CompleteDealNextActionRequest`: `dealId`, `completedAt`, `activityContent` | 딜 소유권과 삭제 여부를 확인한다. 다음 행동 상태를 완료로 바꾸고 완료 활동 로그를 자동 생성한다. | `DealResponse`: 완료 상태 딜 정보 | `Deal` update, `DealActivity` insert. transaction 필요. | `DealNotFound` 404, `NextActionNotFound` 409, `DeletedResource` 409 |
| 다음 행동 미루기 API | `SnoozeDealNextAction` | `SnoozeDealNextActionRequest`: `dealId`, `nextActionDueAt`, `reason` | 딜 소유권과 삭제 여부를 확인한다. 새 기한을 저장하고 미루기 활동 로그를 자동 생성한다. | `DealResponse`: 새 기한이 반영된 딜 정보 | `Deal` update, `DealActivity` insert. transaction 필요. | `DealNotFound` 404, `ValidationError` 400, `DeletedResource` 409 |
| 딜 삭제 API | `DeleteDeal` | `DeleteDealRequest`: `dealId` path 필수 | 딜 소유권을 확인한다. 이미 삭제된 경우 `409 DeletedResource`를 반환한다. 삭제되지 않은 딜은 `deletedAt`, `permanentDeleteAt`을 기록한다. 관련 활동과 일정은 자동 삭제하지 않는다. | `DeleteDealResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `Deal.deletedAt`, `Deal.permanentDeleteAt` update. transaction 없음. | `DealNotFound` 404, `OwnershipViolation` 403, `DeletedResource` 409 |
| 딜 복구 API | `RestoreDeal` | `RestoreDealRequest`: `dealId` path 필수 | 딜 소유권을 확인하고 `deletedAt`, `permanentDeleteAt`을 null로 되돌린다. | `DealResponse`: 복구된 딜 정보 | `Deal.deletedAt`, `Deal.permanentDeleteAt` update. transaction 없음. | `DealNotFound` 404, `OwnershipViolation` 403 |
| 활동 로그 목록 API | `ListDealActivities` | `ListDealActivitiesRequest`: `dealId`, `page`, `pageSize` | 딜 소유권을 확인한다. 활동을 `occurredAt` 최신순으로 조회한다. | `DealActivityListResponse`: `items:DealActivityResponse[]`, pagination | `Deal`, `DealActivity`, `DealActivityType` 조회. transaction 없음. | `DealNotFound` 404, `OwnershipViolation` 403 |
| 활동 로그 생성 API | `CreateDealActivity` | `CreateDealActivityRequest`: `dealId`, `typeId`, `occurredAt`, `title`, `content` | 딜 소유권과 활동 유형을 확인한다. 수동 활동 로그를 생성하고 `isAutoGenerated=false`로 저장한다. | `DealActivityResponse`: 생성된 활동 정보 | `Deal`, `DealActivityType` 조회, `DealActivity` insert. transaction 없음. | `DealNotFound` 404, `DealActivityTypeNotFound` 404, `ValidationError` 400 |
| 활동 로그 수정 API | `UpdateDealActivity` | `UpdateDealActivityRequest`: `dealId`, `activityId`, 수정 필드 | 딜과 활동 소유권을 확인한다. 자동 생성 활동도 사용자가 보정할 수 있게 허용하되 `isAutoGenerated` 값은 유지한다. | `DealActivityResponse`: 수정된 활동 정보 | `DealActivity` update. transaction 없음. | `DealActivityNotFound` 404, `OwnershipViolation` 403 |
| 활동 로그 삭제 API | `DeleteDealActivity` | `DeleteDealActivityRequest`: `dealId`, `activityId` | 딜과 활동 소유권을 확인한다. 활동만 soft delete하고 딜 상태는 되돌리지 않는다. | `DeleteDealActivityResponse`: `id`, `deletedAt`, `permanentDeleteAt` | `DealActivity.deletedAt`, `DealActivity.permanentDeleteAt` update. transaction 없음. | `DealActivityNotFound` 404, `OwnershipViolation` 403 |

## 8. 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P1-G05-G11-CORE-DATA.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
