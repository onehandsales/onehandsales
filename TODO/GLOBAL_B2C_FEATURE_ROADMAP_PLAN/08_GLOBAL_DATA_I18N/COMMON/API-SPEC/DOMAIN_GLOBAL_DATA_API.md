# Domain Global Data API

상태: Ready for Goal Execution

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
  "phoneCountryCode": "KR",
  "phoneNationalNumber": "01012345678",
  "phoneE164": "+821012345678"
}
```

정책:

- 기존 `mobile`은 유지한다.
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
  "companyName": "Onehand",
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

## 5. 구현 체크리스트

- [ ] Product/Deal/Contact/Company DTO와 FE type이 일치한다.
- [ ] 기존 한국 데이터 fallback이 있다.
- [ ] KR/US 외 값은 1차에서 거부하거나 fallback 정책을 따른다.
- [ ] API response는 FE가 locale별 표시를 만들 수 있는 code를 포함한다.
- [ ] 각 domain mutation의 transaction 필요 여부가 기존 use case와 일치한다.
- [ ] 각 domain observability event와 redaction 기준이 구현 결과와 일치한다.
- [ ] Backend 신규/수정 코드에 한글 주석 규칙이 적용된다.
