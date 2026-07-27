# Business Logic

상태: Confirmed

## 0. Software Agent 기준

08의 비즈니스 로직은 `AGENT/SOFTWARE_AGENT` 기준을 따른다.

필수 원칙:

- controller에는 비즈니스 로직을 두지 않는다.
- application use case가 인증 후 사용자 소유권, validation 이후 처리, transaction 경계를 책임진다.
- domain/application layer는 Prisma type과 HTTP/provider SDK를 직접 import하지 않는다.
- request/response DTO, DB model 연결, transaction, observability는 `COMMON/API-SPEC`에 명시한다.
- mutation은 user ownership을 먼저 적용한다.
- provider 호출은 DB transaction 밖에서 수행한다.
- phone, email, token, provider raw error, deal amount 원문은 log에 남기지 않는다.
- 모든 신규/수정 Backend 코드에는 `// API : ...`, `// 역할 : ...`, `// 기능 : ...` 한글 주석 규칙을 적용한다.

## 1. App Locale

- `/app` route에는 locale prefix를 붙이지 않는다.
- `/app` 표시 언어는 `User.preferredLocale`을 정본으로 한다.
- 1차 지원 locale은 `ko-KR`, `en`이다.
- public-site i18n과 app i18n은 분리한다.
- `/app/settings`에서 언어를 저장하면 현재 화면에 즉시 반영한다.

Fallback:

```text
User.preferredLocale
-> browser locale
-> ko-KR
```

## 2. User Global Settings

사용자가 직접 관리하는 설정:

- Language
- Time zone
- Country
- Default currency

신규 가입 기본값:

```text
browser locale + proxy geo country + browser timezone
-> 실패 시 ko-KR + KR + Asia/Seoul + KRW
```

기존 사용자는 로그인 시 `timeZone`을 자동으로 덮어쓰지 않는다. 로그인 환경은 last-login metadata로만 기록한다.

Application 흐름:

1. AuthGuard로 현재 사용자를 확인한다.
2. request DTO를 validation한다.
3. locale/country/currency/timezone 허용값을 application layer에서 재검증한다.
4. 현재 사용자 `User` row만 수정한다.
5. 수정된 설정값을 response DTO로 반환한다.

Transaction:

- 단일 User row 수정은 transaction 없음으로 시작한다.
- 향후 설정 변경 audit log가 필요해지면 User update와 audit log를 같은 transaction으로 묶는다.

Observability:

- 성공 event key: `user.globalSettings.updated`
- request id 사용
- email/token/phone 원문 logging 금지

## 3. Date And Time

- DB에는 UTC instant를 저장한다.
- API는 ISO string을 내려준다.
- FE는 사용자 `preferredLocale + timeZone`으로 표시한다.
- 날짜 전용 값은 timezone 변환 없이 날짜로 표시한다.

API 계약:

- 시스템 instant response는 ISO 8601 UTC string이다.
- 사용자 local date-time을 받는 API는 local date-time과 IANA `timeZone`을 함께 명시한다.
- 검색/필터 기간은 어떤 timezone 기준인지 API spec에 적는다.

## 4. Currency

- Product와 Deal은 각각 `currencyCode`를 가진다.
- 1차 허용 통화는 `KRW`, `USD`다.
- 금액은 정수 단위를 유지한다.
- Deal 생성 기본 통화는 Product currency를 우선한다.
- Product가 없거나 currency가 없으면 User default currency를 사용한다.
- Deal에서는 통화를 변경할 수 있다.

Application 흐름:

1. Product/Deal request DTO를 validation한다.
2. `currencyCode`가 없으면 User default currency를 적용한다.
3. Deal 생성에서 Product가 연결되면 Product ownership과 currency를 확인한다.
4. Product currency를 Deal 기본값으로 사용하되 사용자가 명시한 Deal currency는 허용값 안에서 우선한다.
5. 저장/응답/export/report에 `currencyCode`를 포함한다.

Transaction:

- Product 단일 row 수정은 기존 Product use case transaction 정책을 따른다.
- Deal과 연결 row를 함께 생성/수정하면 transaction 필요다.

Observability:

- event key: `product.created`, `product.updated`, `deal.created`, `deal.updated`
- deal amount/product price 원문 logging 금지

## 5. Contact Phone

저장 기준:

```text
mobile legacy fallback
phoneCountryCode
phoneNationalNumber
phoneE164
```

동작 기준:

- 신규 입력은 KR/US 국가 선택 기반이다.
- `phoneE164`는 검색, 중복, 외부 연동 기준이다.
- 표시/Export는 사람이 읽기 쉬운 국가별 format을 우선한다.
- 글로벌 필드가 없으면 기존 `mobile`을 fallback으로 표시한다.
- 기존 한국 `010-1234-5678`은 가능한 경우 자동 migration한다.
- 변환 실패 데이터는 삭제하지 않는다.

Application 흐름:

1. Contact request DTO를 validation한다.
2. 회사/부서/직급 ownership을 확인한다.
3. KR/US 전화번호를 국가별 parser로 정규화한다.
4. `phoneE164`를 생성하고 저장한다.
5. 정규화 실패 시 code/field 중심 validation error를 반환한다.
6. legacy 데이터는 `mobile` fallback으로 표시한다.

Transaction:

- Contact와 초기 memo log를 함께 생성하면 transaction 필요다.
- 기존 phone migration은 실패 row를 삭제하지 않으며 가능한 row만 update한다.

Observability:

- event key: `contact.created`, `contact.updated`, migration은 `contact.phoneMigration.completed`
- phone/email 원문 logging 금지
- migration 결과는 count 중심으로 기록하고 원문 번호를 남기지 않는다.

## 6. Company Region And Address

- Company에만 적용한다.
- Contact에는 주소/지역 필드를 추가하지 않는다.
- 기존 `CompanyRegion`은 유지한다.
- `CompanyRegion.countryCode`, `CompanyRegion.regionCode`를 추가한다.
- DB에는 region display name이 아니라 region code를 기준으로 저장한다.
- 화면에서는 locale별 표시명으로 변환한다.
- Company 상세 주소는 자유 입력 문자열이다.
- 기존 한국 지역명은 가능한 경우 표준 code로 자동 매핑한다.
- 매핑 실패 region은 legacy custom region으로 유지한다.

Application 흐름:

1. Company request DTO를 validation한다.
2. CompanyField와 CompanyRegion ownership을 확인한다.
3. 표준 region 선택이면 `countryCode`, `regionCode`를 검증한다.
4. custom/legacy region이면 기존 `region` 문자열 fallback을 유지한다.
5. Company address는 자유 입력으로 저장한다.

Transaction:

- Company와 초기 memo/private memo 등 부수 row를 함께 생성하면 transaction 필요다.
- CompanyRegion migration은 가능한 row만 update하고 실패 row는 유지한다.

Observability:

- event key: `company.created`, `company.updated`, `companyRegion.updated`, `companyRegion.migration.completed`
- private memo 원문 logging 금지
- migration log는 mapping count 중심으로 기록한다.

## 7. Import/Export

- Export 기본 언어/형식은 사용자 앱 설정값을 따른다.
- Import template은 `ko-KR`, `en` 중 선택할 수 있다.
- Contact export는 표시용 Phone, Phone Country, Phone E.164를 함께 제공한다.
- Product/Deal export는 amount와 currency code가 함께 해석 가능해야 한다.
- 날짜/시간 export는 사용자 timezone 기준 표시값을 사용한다.

Application 흐름:

1. AuthGuard로 현재 사용자를 확인한다.
2. Import template locale query를 validation한다.
3. Export 대상 row는 `userId` ownership으로 조회한다.
4. 사용자 locale/timezone/currency 설정을 조회한다.
5. header/value를 locale-aware formatter로 생성한다.
6. XLSX file response를 반환한다.

Transaction:

- template download와 export는 조회/파일 생성이므로 transaction 없음이다.
- import confirm은 기존 DataImport transaction 정책을 유지한다.

Observability:

- event key: `import.template.downloaded`, `contact.export.downloaded`, `product.export.downloaded`, `deal.export.downloaded`, `company.export.downloaded`
- export row의 phone/email/deal amount 원문을 application log에 남기지 않는다.
- file 생성 실패는 safe error code와 request id로 추적한다.

## 8. Auth Provider

활성 provider:

```text
Google
LINE
Apple
```

버튼 순서:

```text
Google -> LINE -> Apple
```

계정 연결:

1. 기존 `provider + providerUserId`가 있으면 해당 User로 로그인한다.
2. 없으면 provider의 verified email을 lowercase로 정규화한다.
3. 정규화 email과 같은 `User.email`이 있으면 기존 User에 provider 계정을 연결한다.
4. 같은 email User가 없으면 신규 User를 만든다.
5. provider email이 없으면 가입/로그인을 차단한다.

Application 흐름:

1. provider token 검증은 adapter에서 수행하고 transaction 밖에 둔다.
2. provider profile을 내부 normalized profile로 변환한다.
3. `provider + providerUserId` 기존 연결을 조회한다.
4. 기존 연결이 없으면 verified email lowercase로 기존 User를 조회한다.
5. 기존 User가 있으면 `UserOAuthAccount`를 연결한다.
6. 기존 User가 없으면 신규 User를 생성한다.
7. AuthDevice/AuthSession을 기존 정책대로 생성/갱신한다.

Transaction:

- User, UserOAuthAccount, AuthDevice, AuthSession 변경은 하나의 login exchange transaction으로 묶는다.
- provider token 검증과 Supabase 호출은 transaction 밖에서 수행한다.
- rollback 범위는 OAuth 연결 생성과 app session 발급 관련 DB 변경 전체다.

Observability:

- event key: `auth.exchange.succeeded`, `auth.exchange.failed`, `auth.oauthAccount.linked`
- provider context: provider, statusCode, providerErrorType, retryable, category, requestId
- token, authorization header, provider raw error, email 원문 logging 금지

## 9. Error And Copy

- BE는 사용자 문구보다 `code`, `field` 중심으로 에러를 반환한다.
- FE는 사용자 locale에 맞는 문구를 표시한다.
- provider raw error, token, secret, stack trace는 사용자에게 노출하지 않는다.
- 한국어/영어 문구 모두 간결하고 사용자 친화적으로 작성한다.
- 한국어는 해요체를 따른다.

FE/BE 분리:

- BE는 stable error `code`, `field`, safe message를 반환한다.
- FE는 app i18n resource로 사용자 문구를 표시한다.
- validation error와 domain error를 구분한다.
- ownership not found는 다른 사용자 데이터 존재 여부를 노출하지 않는다.
