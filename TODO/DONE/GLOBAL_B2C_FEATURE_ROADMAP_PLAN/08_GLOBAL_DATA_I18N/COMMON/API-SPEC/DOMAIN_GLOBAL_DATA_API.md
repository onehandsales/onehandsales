# Domain Global Data API

상태: Implemented / G10 Reviewed / G06 template normalized

## 1. Product Currency

계약 상태: implemented
소비자: User Web
호환성: 기존 Product/Deal API response 확장. 기존 금액 필드는 유지하고 `currencyCode`를 추가한다. 기존 데이터는 `KRW` fallback을 가진다.
인증: User AuthGuard
권한: 현재 사용자 소유 domain row만 조회/수정

Product request/response에 `currencyCode`를 포함한다.

API 이름:

- Product 생성/수정/조회 currency 확장
- API 식별자: ProductCurrencyContract

요청 후보:

```json
{
  "productName": "Starter Package",
  "productPrice": 99,
  "currencyCode": "USD"
}
```

정책:

- 허용값은 `KRW`, `USD`다.
- `currencyCode`가 없으면 `User.defaultCurrencyCode` 또는 `KRW` fallback을 사용한다.
- 금액은 정수만 허용한다.

Product Business Logic:

1. AuthGuard로 현재 사용자를 확인한다.
2. Product create/update request를 validation한다.
3. `currencyCode`가 없으면 `User.defaultCurrencyCode`, 없으면 `KRW`를 적용한다.
4. `currencyCode`는 `KRW`, `USD`만 허용한다.
5. Product 저장/응답에 `currencyCode`를 포함한다.

Product DB / Transaction:

- 조회: User, Product, ProductCategory, ProductStatus
- 생성/수정: Product
- transaction 필요 여부: 기존 Product 생성/수정 정책을 따른다. 단일 Product row만 변경하면 없음, 초기 memo 등 부수 row가 함께 있으면 필요.
- rollback 범위: 기존 Product use case와 동일
- audit log: 없음
- observability event: `product.created`, `product.updated`, 실패는 exception filter 기준
- redaction: deal amount/product price 원문을 log에 남기지 않는다.

## 2. Deal Currency

Deal request/response에 `currencyCode`를 포함한다.

API 이름:

- Deal 생성/수정/조회 currency 확장
- API 식별자: DealCurrencyContract

요청 후보:

```json
{
  "dealName": "Q3 Renewal",
  "dealCost": 1200,
  "currencyCode": "USD"
}
```

정책:

- Product가 연결된 Deal 생성은 Product `currencyCode`를 기본값으로 사용한다.
- Product가 없거나 currency가 없으면 `User.defaultCurrencyCode`를 사용한다.
- 사용자는 Deal currency를 변경할 수 있다.
- 주간 일정 리포트와 AI 주간 리포트 snapshot의 개별 Deal 금액은 `currencyCode`를 함께 포함한다.
- 주간 일정 리포트 summary는 기존 `totalDealCost`를 유지하고 `totalDealCostByCurrency`를 추가한다.

Deal Business Logic:

1. AuthGuard로 현재 사용자를 확인한다.
2. Deal create/update request를 validation한다.
3. 연결 Product가 있으면 Product ownership과 currency를 확인한다.
4. Deal 생성 기본 currency는 Product currency를 우선한다.
5. Product currency가 없으면 `User.defaultCurrencyCode`, 없으면 `KRW`를 사용한다.
6. 사용자가 명시한 Deal `currencyCode`는 `KRW`, `USD` 안에서 Product 기본값을 덮어쓸 수 있다.
7. Deal 저장/응답/export/report에 `currencyCode`를 포함한다.

Deal DB / Transaction:

- 조회: User, Deal, Product, DealProduct, Company/Contact 연결 row
- 생성/수정: Deal, 필요 시 연결 row
- transaction 필요 여부: Deal과 연결 row를 함께 변경하면 필요
- rollback 범위: Deal 본 데이터와 같은 사용자 행동으로 생성/수정되는 연결 row 전체
- audit log: 없음
- observability event: `deal.created`, `deal.updated`
- redaction: deal amount 원문을 log에 남기지 않는다.

## 3. Contact Phone

Contact request/response에 글로벌 전화번호 필드를 포함한다.

API 이름:

- Contact 생성/수정/조회 글로벌 전화번호 확장
- API 식별자: ContactGlobalPhoneContract

요청 후보:

```json
{
  "username": "John",
  "phoneCountryCode": "US",
  "phoneNationalNumber": "4155551234",
  "phoneE164": "+14155551234"
}
```

Legacy response 후보:

```json
{
  "username": "홍길동",
  "mobile": "010-1234-5678",
  "phoneDisplay": "010-1234-5678",
  "phoneCountryCode": "KR",
  "phoneNationalNumber": "01012345678",
  "phoneE164": "+821012345678"
}
```

정책:

- 기존 `mobile`은 유지한다.
- 목록/상세 응답에는 표시용 `phoneDisplay`를 포함한다.
- 신규 글로벌 필드는 가능한 경우 항상 채운다.
- 1차 지원 국가는 `KR`, `US`다.
- 글로벌 필드가 없으면 `mobile` fallback을 사용한다.

Contact Business Logic:

1. AuthGuard로 현재 사용자를 확인한다.
2. Contact create/update request를 validation한다.
3. 회사, 부서, 직급 ownership을 확인한다.
4. KR/US 전화번호를 `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`로 정규화한다.
5. 신규 로직은 `phoneE164` 우선, 기존 데이터는 `mobile` fallback을 사용한다.
6. 기존 한국 `mobile` migration 실패 데이터는 삭제하지 않는다.

Contact DB / Transaction:

- 조회: User, Company, Contact, ContactDepartment, ContactJobGrade
- 생성/수정: Contact, 필요 시 ContactMemoLog
- transaction 필요 여부: Contact와 초기 memo log를 함께 만들면 필요
- rollback 범위: Contact 생성과 같은 사용자 행동의 부수 row 전체
- audit log: 없음
- observability event: `contact.created`, `contact.updated`
- redaction: phone/email 원문을 log에 남기지 않는다.

## 4. Company Region / Address

Company/CompanyRegion request/response에 국가/지역 code와 주소를 포함한다.

API 이름:

- Company 지역/주소 글로벌 데이터 확장
- API 식별자: CompanyRegionAddressContract

CompanyRegion 후보:

```json
{
  "id": "region-id",
  "region": "서울",
  "countryCode": "KR",
  "regionCode": "KR-11"
}
```

Company 후보:

```json
{
  "companyName": "OneHand",
  "companyRegionId": "region-id",
  "address": "강남구 테헤란로 123"
}
```

정책:

- Company에만 적용한다.
- Contact에는 주소/지역 필드를 추가하지 않는다.
- `CompanyRegion`은 기존 사용자 커스텀 구조를 유지한다.
- 표준 지역은 `countryCode`, `regionCode`로 식별한다.

Company Business Logic:

1. AuthGuard로 현재 사용자를 확인한다.
2. Company create/update request를 validation한다.
3. CompanyField와 CompanyRegion ownership을 확인한다.
4. CompanyRegion 생성 API에서 표준 region은 `countryCode`, `regionCode`로 저장한다.
5. 기존 custom region은 code가 없어도 `region` 문자열 fallback으로 표시한다.
6. Company address는 자유 입력으로 저장하고 국가별 상세 검증은 하지 않는다.

Company DB / Transaction:

- 조회: User, Company, CompanyField, CompanyRegion
- 생성/수정: Company, CompanyRegion
- transaction 필요 여부: Company와 초기 memo log를 함께 만들면 필요
- rollback 범위: Company 본 데이터와 같은 사용자 행동의 부수 row 전체
- audit log: 없음
- observability event: current 구현 기준 회사 목록/연결 딜/연결 담당자/export/delete 일부 흐름은 `company.*` event를 남긴다. `createCompany`, `updateCompany`, `createRegion`은 별도 application log event가 없다.
- redaction: private memo 원문 logging 금지

## 5. Error Response / FE 처리 기준

도메인 글로벌 데이터 API는 사용자 문구보다 `code`, `field` 중심의 응답을 우선한다. FE는 `code`와 `field`를 app i18n resource에 매핑해 locale별 field error/toast를 표시한다.

공통 field validation error 형태:

```json
{
  "statusCode": 400,
  "error": "CURRENCY_UNSUPPORTED",
  "code": "CURRENCY_UNSUPPORTED",
  "field": "currencyCode",
  "message": "currencyCode must be KRW or USD"
}
```

예상 에러:

| 상황 | error code | field | HTTP status | FE 처리 |
|---|---|---|---:|---|
| Product/Deal 통화가 `KRW`, `USD`가 아님 | `CURRENCY_UNSUPPORTED` | `currencyCode` | 400 | 통화 선택 field error 표시 |
| Product/Deal 금액이 정수가 아님 | `AMOUNT_INTEGER_REQUIRED` | `productPrice` 또는 `dealCost` | 400 | 금액 입력 field error 표시 |
| Product/Deal 연결 resource가 현재 사용자 소유가 아님 | `ProductNotFound`, `RelatedResourceNotFound` | 없음 | 404 | 선택값 초기화 후 일반 안내 toast 표시 |
| Contact 전화번호 국가 코드가 KR/US가 아님 | `CONTACT_PHONE_COUNTRY_UNSUPPORTED` | `phoneCountryCode` | 400 | 전화번호 국가 선택 field error 표시 |
| Contact 전화번호 정규화 실패 | `CONTACT_PHONE_INVALID` | `phoneNationalNumber` 또는 `phoneE164` | 400 | 전화번호 field error 표시 |
| CompanyRegion 국가/지역 코드가 KR/US 표준 목록과 맞지 않음 | `COMPANY_REGION_UNSUPPORTED` | `countryCode` 또는 `regionCode` | 400 | 지역 선택 field error 표시 |
| CompanyField/CompanyRegion이 현재 사용자 소유가 아님 | `CompanyFieldNotFound`, `CompanyRegionNotFound` | 없음 | 404 | 선택값 초기화 후 일반 안내 toast 표시 |

정책:

- 기존 ownership/not found 응답은 대상 존재 여부를 과도하게 노출하지 않는다.
- `message`는 개발/기본 fallback용이며 사용자 노출 문구 정본이 아니다.
- FE는 G03 app i18n foundation 이후 `code`와 `field`를 기준으로 `ko-KR`, `en` 문구를 렌더링한다.
- 서버 로그에는 phone/email, private memo, deal amount/product price 원문을 남기지 않는다.

## 6. 구현 체크리스트

- [x] Product/Deal/Contact/Company DTO와 FE type이 일치한다.
- [x] 기존 한국 데이터 fallback이 있다.
- [x] KR/US 외 값은 1차에서 거부하거나 fallback 정책을 따른다.
- [x] API response는 FE가 locale별 표시를 만들 수 있는 code를 포함한다.
- [x] 각 domain mutation의 transaction 필요 여부가 기존 use case와 일치한다.
- [x] 각 domain observability event와 redaction 기준을 G06 current 구현 결과와 대조했다.
- [x] G06은 문서 정규화 작업이며 Backend 신규/수정 코드는 없다.

## 7. API_SPEC_TEMPLATE_NORMALIZATION G03 수동 판단

판단: 이 문서는 Product, Deal, Contact, Company response/request 확장을 한 파일에 묶은 복합 계약이다. G03의 Core/User 후보 9개에 직접 흡수하지 않고 별도 `G06-DONE-DOMAIN-GLOBAL-DATA-API-SPEC-NORMALIZATION.goal.md`로 분리한다.

분리 이유:

- 현재 구현은 `ProductController`, `DealController`, `ContactController`, `CompanyController`와 각 User Web API client/type에 분산되어 있다.
- Company Region/Address까지 포함하므로 G03의 포함 범위인 BusinessCard, Contact, Product, Deal, Import Template, Meeting Note AI/STT 후보 9개를 넘어선다.
- 한 번에 core domain 문서에 흡수하면 보관 문서 대량 수정과 의미 변경 오해가 생길 수 있다.
- API 계약 의미 변경 없이 current 구현 기준 matrix를 별도 goal에서 확인하는 편이 안전하다.

G06 처리 기준:

- 계약 상태: `implemented` 유지 여부를 current BE/FE 구현 기준으로 재확인한다.
- 소비자: User Web
- 호환성: 기존 Product/Deal/Contact/Company API response/request 확장 유지, breaking change 없음
- 인증/권한: User `AuthGuard`, 현재 사용자 소유 domain row만 조회/수정
- Request 이름/Response 이름: Product/Deal/Contact/Company current DTO와 FE type을 per-domain matrix로 대조한다.
- Transaction: 각 domain mutation의 기존 transaction 기준을 따른다.
- Observability: `product.*`, `deal.*`, `contact.*`, `company.*` event와 CompanyRegion create의 current logging 여부, redaction 기준을 current 구현과 대조한다.
- Error FE 처리/log level: currency/phone/region validation은 field error, ownership/not found는 일반 안내 toast, unknown server error는 error level로 정리한다.
- FE/BE 처리 기준: FE는 locale/currency/phone/region 표시와 request body 구성을 domain별 client 기준으로 확인하고, BE는 DTO validation과 application normalization 기준을 확인한다.

## 8. API_SPEC_TEMPLATE_NORMALIZATION G06 보강

판단: 이 문서는 Product, Deal, Contact, Company의 글로벌 데이터 확장 필드를 한 문서에 묶은 복합 API 계약이다. G06에서는 current BE controller/DTO/application service, User Web API client/type, Prisma schema 기준으로 matrix를 보강한다. 기존 API path, method, request/response 의미, error code, transaction, observability 동작은 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 기존 Product/Deal/Contact/Company API의 `currencyCode`, `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`, `phoneDisplay`, `countryCode`, `regionCode`, `address` 필드 계약 유지. breaking change 없음
- 인증: User `AuthGuard`
- 권한: User `AuthGuard`, 현재 사용자 소유 domain row와 taxonomy row만 조회/수정
- FE 호출 경계: User Web의 `product-api.ts`, `deal-api.ts`, `contact-api.ts`, `company-api.ts`만 사용한다. Admin Web API와 섞지 않는다.

### 8.1 Product Currency Matrix

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | G06 필드 |
|---|---|---|---|---|---|---|
| Product 목록 currency 조회 API | `ListProductsWithCurrency` | `GET` | `/api/products` | `ListProductsQueryDto` / FE `ProductListParams` | `ProductPageResponse` / FE `ProductListResponse` | item `productPrice`, `currencyCode` |
| Product 상세 currency 조회 API | `GetProductWithCurrency` | `GET` | `/api/products/:productId` | path param `productId` | `ProductDetailResponse` / FE `ProductDetail` | `productPrice`, `currencyCode` |
| Product 생성 currency API | `CreateProductWithCurrency` | `POST` | `/api/products` | `CreateProductDto` / FE `CreateProductInput` | Body 없음, `201 Created` | request `productPrice`, optional `currencyCode` |
| Product 수정 currency API | `UpdateProductCurrency` | `PATCH` | `/api/products/:productId` | path param `productId` + `UpdateProductDto` / FE `UpdateProductInput` | Body 없음, `201 Created` | request optional `productPrice`, optional `currencyCode` |
| Product 연결 Deal currency 조회 API | `ListProductDealsWithCurrency` | `GET` | `/api/products/:productId/deals` | path param `productId` | `ProductDealListResponse` / FE `ProductDealListResponse` | item `dealCost`, `currencyCode` |
| Product xlsx currency export API | `ExportProductsXlsxWithCurrency` | `GET` | `/api/products/export/xlsx` | `ExportProductsQueryDto` | xlsx stream | `productPrice` formatted with `currencyCode`, `currencyCode` column |

Request/Response 필드:

| 필드 | BE DTO/Response | FE type | validation/nullable | 기준 |
|---|---|---|---|---|
| `productPrice` | `CreateProductDto.productPrice`, `UpdateProductDto.productPrice`, `ProductListItemResponse.productPrice`, `ProductDetailResponse.productPrice` | `CreateProductInput.productPrice`, `UpdateProductInput.productPrice`, `Product.productPrice`, `ProductDetail.productPrice` | integer, `>= 0`, response number | `AMOUNT_INTEGER_REQUIRED` field error |
| `currencyCode` | `CreateProductDto.currencyCode?`, `UpdateProductDto.currencyCode?`, response string | `AppCurrencyCode` optional in request, required in response | `KRW` 또는 `USD`; create 누락 시 `currentUser.defaultCurrencyCode`, 없으면 `KRW` | `CURRENCY_UNSUPPORTED` field error |

Transaction:

- `POST /api/products`: 필요. 현재 구현은 Product 생성, category/status ownership 검증, optional `ProductMemoLog` 생성을 `productRepository.runInTransaction`으로 묶는다.
- `PATCH /api/products/:productId`: 필요 여부 없음. 현재 구현은 ownership/taxonomy 검증 후 Product 단일 row update를 수행한다.
- 조회/export API: 필요 여부 없음. ownership scope 조회만 수행하고 DB 변경은 없다.
- audit log: 없음.
- 외부 Provider: 없음. xlsx export는 workbook writer와 best-effort server analytics event를 사용한다.

Observability:

- log event key: `product.listed`, `product.viewed`, `product.dealsListed`, `product.created`, `product.updated`, `product.exported`
- request id: export server analytics event에 controller의 request id를 전달한다. 일반 create/update는 current 구현상 application log에 request id를 직접 전달하지 않는다.
- redaction: `productName`, `productMemo`, product private memo 원문, `productPrice` 원문을 log context에 넣지 않는다.

### 8.2 Deal Currency Matrix

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | G06 필드 |
|---|---|---|---|---|---|---|
| Deal 목록 currency 조회 API | `ListDealsWithCurrency` | `GET` | `/api/deals` | `ListDealsQueryDto` / FE `DealListParams` | `DealListResponse` / FE `DealListResponse` | item `dealCost`, `currencyCode`; product summary는 가격/통화 제외 |
| Deal 상세 currency 조회 API | `GetDealWithCurrency` | `GET` | `/api/deals/:dealId` | path param `dealId` | `DealDetailResponse` / FE `DealDetail` | `dealCost`, `currencyCode`, detail `products[].productPrice`, `products[].currencyCode` |
| Deal 생성 currency API | `CreateDealWithCurrency` | `POST` | `/api/deals` | `CreateDealDto` / FE `CreateDealInput` | `DealDetailResponse` / FE `DealDetail`, `201 Created` | request/response `dealCost`, `currencyCode` |
| Deal 수정 currency API | `UpdateDealCurrency` | `PATCH` | `/api/deals/:dealId` | path param `dealId` + `UpdateDealDto` / FE `UpdateDealInput` | `DealDetailResponse` / FE `DealDetail`, `200 OK` | request optional `dealCost`, optional `currencyCode` |
| Deal product option currency API | `ListDealProductOptionsWithCurrency` | `GET` | `/api/deals/product-options` | 없음 | `DealProductOptionResponse` / FE `DealProductOptionsResponse` | product option `productPrice`, `currencyCode` |
| Company 연결 Deal currency 조회 API | `ListCompanyDealsWithCurrency` | `GET` | `/api/companies/:companyId/deals` | path param `companyId` | `CompanyDealListResponse` / FE `CompanyDealListResponse` | item `dealCost`, `currencyCode` |
| Contact 연결 Deal currency 조회 API | `ListContactDealsWithCurrency` | `GET` | `/api/contacts/:contactId/deals` | path param `contactId` | `ContactDealListResponse` / FE `ContactDealListResponse` | item `dealCost`, `currencyCode` |
| Deal xlsx currency export API | `ExportDealsXlsxWithCurrency` | `GET` | `/api/deals/export/xlsx` | `ExportDealsQueryDto` | xlsx stream | `dealCost` formatted with `currencyCode`, `currencyCode` column |

Request/Response 필드:

| 필드 | BE DTO/Response | FE type | validation/nullable | 기준 |
|---|---|---|---|---|
| `dealCost` | `CreateDealDto.dealCost`, `UpdateDealDto.dealCost`, `DealListItemResponse.dealCost`, `DealDetailResponse.dealCost` | `CreateDealInput.dealCost`, `UpdateDealInput.dealCost`, `DealListItem.dealCost`, `DealDetail.dealCost` | integer, `>= 0`, response number | `AMOUNT_INTEGER_REQUIRED` field error |
| `currencyCode` | `CreateDealDto.currencyCode?`, `UpdateDealDto.currencyCode?`, response string | `AppCurrencyCode` optional in request, required in response | `KRW` 또는 `USD`; create 명시값, 첫 선택 Product currency, `currentUser.defaultCurrencyCode`, `KRW` 순서 | `CURRENCY_UNSUPPORTED` field error |

Transaction:

- `POST /api/deals`: 필요. Deal, DealCompany, DealContact, DealProduct, initial `DealFollowingActionLog`, 자동 activity, due reminder를 같은 `dealRepository.runInTransaction` 범위로 묶는다.
- `PATCH /api/deals/:dealId`: 필요. Deal 기본 field와 company/contact/product relation 교체, due reminder 갱신, stage change activity를 같은 transaction으로 묶는다.
- 조회/export/option API: 필요 여부 없음. ownership scope 조회만 수행한다.
- audit log: 없음.
- 외부 Provider: 없음. export와 create 성공 후 server analytics event는 best-effort로 기록한다.

Observability:

- log event key: `deal.listed`, `deal.viewed`, `deal.created`, `deal.updated`, `deal.product_options_listed`, `deal.exported`, 관련 조회의 `company.dealsListed`, `contact.dealsListed`, `product.dealsListed`
- request id: `POST /api/deals`와 `GET /api/deals/export/xlsx`는 controller에서 application으로 request id를 전달해 server analytics event에 사용한다.
- redaction: `dealName`, `followingAction`, `dealMemo`, activity body, `dealCost` 원문을 log context에 넣지 않는다.

### 8.3 Contact Global Phone Matrix

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | G06 필드 |
|---|---|---|---|---|---|---|
| Contact 목록 phone 조회 API | `ListContactsWithGlobalPhone` | `GET` | `/api/contacts` | `ListContactsQueryDto` / FE `ContactListParams` | `ContactPageResponse` / FE `ContactPageResponse` | item `mobile`, `phoneDisplay`, `phoneCountryCode`, `phoneNationalNumber`, `phoneE164` |
| Contact 상세 phone 조회 API | `GetContactWithGlobalPhone` | `GET` | `/api/contacts/:contactId` | path param `contactId` | `ContactDetailResponse` / FE `ContactDetail` | `mobile`, `phoneDisplay`, `phoneCountryCode`, `phoneNationalNumber`, `phoneE164` |
| Contact 생성 phone API | `CreateContactWithGlobalPhone` | `POST` | `/api/contacts` | `CreateContactDto` / FE `CreateContactInput` | Body 없음, `201 Created` | request `mobile?`, `phoneCountryCode`, `phoneNationalNumber`, optional `phoneE164` |
| Contact 수정 phone API | `UpdateContactGlobalPhone` | `PATCH` | `/api/contacts/:contactId` | path param `contactId` + `UpdateContactDto` / FE `UpdateContactInput` | Body 없음, `201 Created` | request optional `mobile`, optional `phoneCountryCode`, optional `phoneNationalNumber`, optional `phoneE164` |
| Contact xlsx phone export API | `ExportContactsXlsxWithGlobalPhone` | `GET` | `/api/contacts/export/xlsx` | `ExportContactsQueryDto` | xlsx stream | `phone`, `phoneCountry`, `phoneE164` columns |

Request/Response 필드:

| 필드 | BE DTO/Response | FE type | validation/nullable | 기준 |
|---|---|---|---|---|
| `mobile` | `CreateContactDto.mobile?`, `UpdateContactDto.mobile?`, response string | optional request, response string | legacy fallback 입력. create에서 global phone이 없으면 legacy mobile을 KR/US 후보로 정규화 | 기존 표시 호환 |
| `phoneCountryCode` | `phoneCountryCode?: string | null`, response `string | null` | `AppPhoneCountryCode`, response nullable | `KR` 또는 `US`; create는 정규화 결과 필수, legacy row는 null 가능 | `CONTACT_PHONE_COUNTRY_UNSUPPORTED` |
| `phoneNationalNumber` | `phoneNationalNumber?: string | null`, response `string | null` | string, response nullable | KR `010########`, US 10 digit national number | `CONTACT_PHONE_INVALID` |
| `phoneE164` | `phoneE164?: string | null`, response `string | null` | optional string, response nullable | `+82...` 또는 `+1...`; national과 함께 오면 서로 일치해야 함 | `CONTACT_PHONE_INVALID` |
| `phoneDisplay` | response only | response string | 저장된 global phone 우선, 불완전하면 legacy `mobile` fallback | FE 표시용 |

Transaction:

- `POST /api/contacts`: 필요. Contact 생성, company/department/jobGrade ownership 검증, optional `ContactMemoLog` 생성을 `contactRepository.runInTransaction`으로 묶는다.
- `PATCH /api/contacts/:contactId`: 필요 여부 없음. phone 변경이 있으면 application에서 정규화한 뒤 Contact 단일 row update를 수행한다.
- 조회/export API: 필요 여부 없음. ownership scope 조회만 수행한다.
- audit log: 없음.
- 외부 Provider: 없음. export는 workbook writer와 best-effort server analytics event를 사용한다.

Observability:

- log event key: `contact.listed`, `contact.viewed`, `contact.dealsListed`, `contact.created`, `contact.updated`, `contact.exported`
- request id: export server analytics event에 controller의 request id를 전달한다. 일반 create/update는 current 구현상 application log에 request id를 직접 전달하지 않는다.
- redaction: `username`, `mobile`, `phoneNationalNumber`, `phoneE164`, `email`, `contactMemo`, contact private memo 원문을 log context에 넣지 않는다.

### 8.4 Company Region / Address Matrix

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | G06 필드 |
|---|---|---|---|---|---|---|
| Company 목록 region/address 조회 API | `ListCompaniesWithRegionAddress` | `GET` | `/api/companies` | `ListCompaniesQueryDto` / FE `CompanyListParams` | `CompanyPageResponse` / FE `CompanyListResponse` | item `companyRegion.countryCode`, `companyRegion.regionCode`, `address` |
| Company 상세 region/address 조회 API | `GetCompanyWithRegionAddress` | `GET` | `/api/companies/:companyId` | path param `companyId` | `CompanyDetailResponse` / FE `CompanyDetail` | `companyRegion.countryCode`, `companyRegion.regionCode`, `address` |
| Company 생성 address API | `CreateCompanyWithAddress` | `POST` | `/api/companies` | `CreateCompanyDto` / FE `CreateCompanyInput` | Body 없음, `201 Created` | request `companyRegionId`, optional `address` |
| Company 수정 address API | `UpdateCompanyAddress` | `PATCH` | `/api/companies/:companyId` | path param `companyId` + `UpdateCompanyDto` / FE `UpdateCompanyInput` | Body 없음, `201 Created` | request optional `companyRegionId`, optional `address` |
| Company region 목록 API | `ListCompanyRegionsWithCode` | `GET` | `/api/company-regions` | 없음 | `CompanyRegionListResponse` / FE `CompanyRegionListResponse` | item `region`, `countryCode`, `regionCode` |
| Company region 생성 API | `CreateCompanyRegionWithCode` | `POST` | `/api/company-regions` | `CreateCompanyRegionDto` / FE `CreateCompanyRegionInput` | Body 없음, `201 Created` | request `region`, optional `countryCode`, optional `regionCode` |
| Deal company option region API | `ListDealCompanyOptionsWithRegionCode` | `GET` | `/api/deals/company-options` | 없음 | `DealCompanyOptionResponse` / FE `DealCompanyOptionsResponse` | option `companyRegion.countryCode`, `companyRegion.regionCode` |
| Company xlsx region/address export API | `ExportCompaniesXlsxWithRegionAddress` | `GET` | `/api/companies/export/xlsx` | `ExportCompaniesQueryDto` | xlsx stream | `companyRegionCountryCode`, `companyRegionCode`, `address` columns |

Request/Response 필드:

| 필드 | BE DTO/Response | FE type | validation/nullable | 기준 |
|---|---|---|---|---|
| `address` | `CreateCompanyDto.address?`, `UpdateCompanyDto.address?`, response `string | null` | optional string, response nullable | trim 후 빈 값은 null. 국가별 상세 주소 검증 없음 | field validation 없음 |
| `companyRegionId` | `CreateCompanyDto.companyRegionId`, `UpdateCompanyDto.companyRegionId?` | required/optional string | UUID, 현재 사용자 소유 region만 허용 | `CompanyRegionNotFound` |
| `countryCode` | `CreateCompanyRegionDto.countryCode?`, region response `string | null` | optional `string | null`, response nullable | `KR` 또는 `US`; custom region은 null 가능 | `COMPANY_REGION_UNSUPPORTED` |
| `regionCode` | `CreateCompanyRegionDto.regionCode?`, region response `string | null` | optional `string | null`, response nullable | `COMPANY_REGION_CODE_DEFINITIONS`에 있는 KR 시/도 또는 US state code | `COMPANY_REGION_UNSUPPORTED` |
| `region` | `CreateCompanyRegionDto.region`, region response string | string | 표준 code가 있으면 정의된 표준 region명으로 저장, code가 없으면 custom region 문자열 저장 | duplicate는 `DuplicateCompanyRegion` |

Transaction:

- `POST /api/companies`: 필요. Company 생성, companyField/companyRegion ownership 검증, optional `CompanyMemoLog` 생성을 `companyRepository.runInTransaction`으로 묶는다.
- `PATCH /api/companies/:companyId`: 필요 여부 없음. ownership/taxonomy 검증 후 Company 단일 row update를 수행한다.
- `POST /api/company-regions`: 필요 여부 없음. region/code 중복 검증 후 `CompanyRegion` 단일 row를 생성한다.
- 조회/export API: 필요 여부 없음. ownership scope 조회만 수행한다.
- audit log: 없음.
- 외부 Provider: 없음. export는 workbook writer와 best-effort server analytics event를 사용한다.

Observability:

- log event key: current 구현은 `company.listed`, `company.contactsListed`, `company.dealsListed`, `company.exported`, `company.deleted`를 남긴다.
- current 구현상 `createCompany`, `updateCompany`, `createRegion`에는 별도 application log event가 없다. G06은 현 상태를 문서화할 뿐 새 log를 추가하지 않는다.
- request id: export server analytics event에 controller의 request id를 전달한다. 일반 create/update/region create는 current 구현상 application log에 request id를 직접 전달하지 않는다.
- redaction: `companyName`, `address`, `companyMemo`, company private memo 원문을 log context에 넣지 않는다.

### 8.5 공통 Error / FE 처리 / Log Level

| 상황 | error code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인/토큰 갱신 흐름 | warn |
| path param UUID 형식 오류 | pipe validation | 400 | 잘못된 상세 경로 또는 선택값 초기화 | warn |
| Product/Deal 통화 미지원 | `CURRENCY_UNSUPPORTED` | 400 | currency select field error | warn |
| Product/Deal 금액 정수/범위 오류 | `AMOUNT_INTEGER_REQUIRED` 또는 DTO validation | 400 | amount input field error | warn |
| Product category/status 또는 product ownership 실패 | `ProductCategoryNotFound`, `ProductStatusNotFound`, `ProductNotFound` | 404 | 선택값 초기화 후 일반 안내 toast | warn |
| Deal company/contact/product 연결 resource 오류 | `RelatedResourceNotFound` | 404 | form 선택값 재조회와 일반 안내 toast | warn |
| Contact phone 국가 미지원 | `CONTACT_PHONE_COUNTRY_UNSUPPORTED` | 400 | phone country field error | warn |
| Contact phone 정규화 실패 | `CONTACT_PHONE_INVALID` | 400 | phone number 또는 E.164 field error | warn |
| Contact company/department/jobGrade ownership 실패 | `ContactNotFound`, `ContactDepartmentNotFound`, `ContactJobGradeNotFound` | 404 | 선택값 초기화 후 일반 안내 toast | warn |
| Company field/region/company ownership 실패 | `CompanyFieldNotFound`, `CompanyRegionNotFound`, `CompanyNotFound` | 404 | 선택값 초기화 후 일반 안내 toast | warn |
| Company region code 미지원 또는 region 누락 | `COMPANY_REGION_UNSUPPORTED` | 400 | region/country field error | warn |
| Company region 중복 | `DuplicateCompanyRegion` | 409 | region 생성 dialog inline 오류 또는 기존 option 선택 안내 | warn |
| xlsx 생성 실패 | `ProductExportFailed`, `DealExportFailed`, `ContactExportFailed`, `CompanyExportFailed` | 500 | export 실패 toast와 재시도 제공 | error |
| unknown server error | `InternalServerError` | 500 | 공통 오류 toast와 재시도 제공 | error |

FE/BE 처리 기준:

- FE는 currency request에 `AppCurrencyCode`(`KRW`, `USD`)만 보낸다. Product create dialog는 user default currency를 기본값으로 쓰고, Deal create dialog는 선택 Product currency를 우선 반영하되 사용자가 수동 변경할 수 있다.
- BE는 `normalizeCurrencyCode`와 `resolveCurrencyCodeWithDefault`로 Product/Deal currency를 저장 전에 검증하거나 fallback한다.
- FE는 Contact create에서 `phoneCountryCode`, `phoneNationalNumber`를 기본 입력으로 보내고 `phoneE164`는 선택적으로 보낸다. BE는 global phone 필드가 없으면 legacy `mobile`을 fallback 후보로 정규화한다.
- FE는 Contact 목록/상세에서 `phoneDisplay`를 표시용으로 사용하고, edit form에는 저장된 `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`를 사용한다.
- FE는 Company create/update에서 region code를 직접 보내지 않고 `companyRegionId`와 `address`를 보낸다. Region code는 `/api/company-regions` 생성과 조회 계약에서만 다룬다.
- BE는 Company address를 trim하고 빈 문자열은 null로 저장한다. `countryCode`/`regionCode`가 모두 없으면 custom region으로 저장하고, 둘 중 하나라도 있으면 표준 code 정의와 일치해야 한다.
- Admin Web은 이 User Web API를 호출하지 않는다. Admin cross-user 조회는 Admin Operation API-SPEC과 별도 계약이다.
