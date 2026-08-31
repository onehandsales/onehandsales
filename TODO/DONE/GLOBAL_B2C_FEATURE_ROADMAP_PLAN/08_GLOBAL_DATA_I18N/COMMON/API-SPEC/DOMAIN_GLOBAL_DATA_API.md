# Domain Global Data API

상태: Implemented / G10 Reviewed

## 1. Product Currency

계약 상태: confirmed
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
4. 표준 region은 `countryCode`, `regionCode`로 저장한다.
5. 기존 custom region은 code가 없어도 `region` 문자열 fallback으로 표시한다.
6. Company address는 자유 입력으로 저장하고 국가별 상세 검증은 하지 않는다.

Company DB / Transaction:

- 조회: User, Company, CompanyField, CompanyRegion
- 생성/수정: Company, CompanyRegion
- transaction 필요 여부: Company와 초기 memo/private memo 등 부수 row를 함께 만들면 필요
- rollback 범위: Company 본 데이터와 같은 사용자 행동의 부수 row 전체
- audit log: 없음
- observability event: `company.created`, `company.updated`, `companyRegion.updated`
- redaction: private memo 원문 logging 금지

## 5. Error Response / FE 처리 기준

도메인 글로벌 데이터 API는 사용자 문구보다 `code`, `field` 중심의 응답을 우선한다. FE는 `code`와 `field`를 app i18n resource에 매핑해 locale별 field error/toast를 표시한다.

공통 validation error 형태:

```json
{
  "code": "CURRENCY_UNSUPPORTED",
  "field": "currencyCode",
  "message": "Unsupported currency code."
}
```

예상 에러:

| 상황 | error code | field | HTTP status | FE 처리 |
|---|---|---|---:|---|
| Product/Deal 통화가 `KRW`, `USD`가 아님 | `CURRENCY_UNSUPPORTED` | `currencyCode` | 400 | 통화 선택 field error 표시 |
| Product/Deal 금액이 정수가 아님 | `AMOUNT_INTEGER_REQUIRED` | `productPrice` 또는 `dealCost` | 400 | 금액 입력 field error 표시 |
| 연결 Product가 현재 사용자 소유가 아님 | `PRODUCT_NOT_FOUND` | `productId` | 404 | 선택값 초기화 후 일반 안내 toast 표시 |
| Contact 전화번호 국가 코드가 KR/US가 아님 | `CONTACT_PHONE_COUNTRY_UNSUPPORTED` | `phoneCountryCode` | 400 | 전화번호 국가 선택 field error 표시 |
| Contact 전화번호 정규화 실패 | `CONTACT_PHONE_INVALID` | `phoneNationalNumber` 또는 `phoneE164` | 400 | 전화번호 field error 표시 |
| CompanyRegion 국가/지역 코드가 KR/US 표준 목록과 맞지 않음 | `COMPANY_REGION_UNSUPPORTED` | `countryCode` 또는 `regionCode` | 400 | 지역 선택 field error 표시 |
| CompanyRegion이 현재 사용자 소유가 아님 | `COMPANY_REGION_NOT_FOUND` | `companyRegionId` | 404 | 선택값 초기화 후 일반 안내 toast 표시 |

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
- [x] 각 domain observability event와 redaction 기준이 구현 결과와 일치한다.
- [x] Backend 신규/수정 코드에 한글 주석 규칙이 적용된다.

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
- Observability: `product.*`, `deal.*`, `contact.*`, `company.*`, `companyRegion.*` event와 redaction 기준을 current 구현과 대조한다.
- Error FE 처리/log level: currency/phone/region validation은 field error, ownership/not found는 일반 안내 toast, unknown server error는 error level로 정리한다.
- FE/BE 처리 기준: FE는 locale/currency/phone/region 표시와 request body 구성을 domain별 client 기준으로 확인하고, BE는 DTO validation과 application normalization 기준을 확인한다.
