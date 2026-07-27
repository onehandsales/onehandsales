# Backend API TODO

상태: Ready for Goal Execution

## 1. API 변경 범위

| Method | Path | 목적 |
|---|---|---|
| `GET` | `/api/users/me/profile` | `preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`, 연결 OAuth provider 목록을 반환한다. |
| `PATCH` | `/api/users/me/profile` | Language, Time zone, Country, Default currency 설정을 저장한다. |
| `GET` | `/api/auth/providers` | Google, LINE, Apple provider를 이 순서로 반환한다. |
| `POST` | `/api/auth/exchange` | Google/LINE/Apple token exchange를 처리한다. |
| 기존 domain API | Product | `currencyCode` request/response를 추가한다. |
| 기존 domain API | Deal | `currencyCode` request/response를 추가한다. |
| 기존 domain API | Contact | `phoneCountryCode`, `phoneNationalNumber`, `phoneE164` request/response를 추가한다. |
| 기존 domain API | Company/CompanyRegion | `countryCode`, `regionCode`, `address` 또는 기존 구조 보강 field를 추가한다. |
| 기존 export API | Company/Contact/Product/Deal export | 사용자 app 설정 기준 header/value 현지화를 적용한다. |
| 기존 template API | Import template download | `locale=ko-KR|en` 선택 파라미터를 지원한다. |

## 2. Auth 계약

Provider 순서:

```text
google -> line -> apple
```

Account linking:

1. `provider + providerUserId`가 이미 있으면 해당 User로 로그인한다.
2. 기존 provider 계정이 없고 verified email이 있으면 lowercase로 정규화한다.
3. 정규화 email이 기존 `User.email`과 같으면 기존 User에 `UserOAuthAccount`를 연결한다.
4. 정규화 email과 일치하는 User가 없으면 신규 User를 생성한다.
5. provider email이 없으면 가입/로그인을 차단한다.

사용자 노출 실패 메시지는 provider 이름만 포함한다.

```text
LINE 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.
```

서버 로그에는 provider, error type, request id 같은 안전한 context만 남기고 token, secret, email 원문, raw provider error 전문은 남기지 않는다.

## 3. User Global Settings 계약

`PATCH /api/users/me/profile` 입력 후보:

```json
{
  "preferredLocale": "en",
  "timeZone": "America/New_York",
  "countryCode": "US",
  "defaultCurrencyCode": "USD"
}
```

허용값:

- `preferredLocale`: `ko-KR`, `en`
- `countryCode`: `KR`, `US`
- `defaultCurrencyCode`: `KRW`, `USD`
- `timeZone`: 유효한 IANA timezone ID

기본값:

- locale/country/timezone/currency는 신규 가입 시 브라우저 locale, proxy geo country, 브라우저 timezone으로 추론한다.
- 추론 실패 시 `ko-KR`, `KR`, `Asia/Seoul`, `KRW`를 사용한다.

## 4. Domain API 계약

Product:

- `currencyCode`를 생성/수정/상세/목록/export에 포함한다.
- 1차 허용 통화는 `KRW`, `USD`다.
- 금액은 기존 정수 입력을 유지한다.

Deal:

- `currencyCode`를 생성/수정/상세/목록/report/export에 포함한다.
- Deal 생성 기본값은 Product `currencyCode`를 우선 사용하고, 없으면 `User.defaultCurrencyCode`를 사용한다.
- Deal에서는 통화를 변경할 수 있다.

Contact:

- 기존 `mobile`은 유지한다.
- 신규 글로벌 필드는 `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`를 사용한다.
- 1차 지원 국가는 `KR`, `US`다.
- 검색/중복/외부 연동 기준은 `phoneE164`를 우선한다.
- 글로벌 필드가 없으면 기존 `mobile` fallback을 사용한다.

Company/CompanyRegion:

- Company에만 주소/지역 글로벌화를 적용한다.
- Contact에는 주소/지역 필드를 추가하지 않는다.
- 기존 `CompanyRegion`은 유지하고 `countryCode`, `regionCode`를 추가한다.
- 신규 표준 지역은 code 기반으로 저장하고 locale별 표시명은 FE 또는 shared dictionary에서 변환한다.
- Company 상세 주소는 자유 입력 문자열로 둔다.

## 5. Error 계약

- BE validation은 사용자 문구보다 `code`, `field`를 우선한다.
- FE가 `User.preferredLocale` 기준으로 사용자 문구를 표시한다.
- 기존 raw validation message를 사용자에게 직접 노출하지 않는다.

예시:

```json
{
  "code": "CONTACT_PHONE_INVALID",
  "field": "phone"
}
```

## 6. Import/Export 계약

- Export header/value는 사용자 앱 설정값을 기본으로 사용한다.
- Import template download는 `locale=ko-KR|en`을 받는다.
- 지원하지 않는 locale 요청은 `en` 또는 사용자 locale fallback으로 처리한다.
- Contact export는 표시용 Phone, Phone Country, Phone E.164를 함께 제공한다.
- 날짜/시간은 API/DB 원본이 아니라 사용자 timezone/locale 기준 표시값으로 export한다.

## 7. Backend 검증

- 모든 mutation은 AuthGuard와 user ownership을 유지한다.
- 신규 migration은 기존 migration을 수정하지 않고 추가 migration으로 작성한다.
- 기존 한국 데이터 migration은 실패 데이터 때문에 전체 배포를 중단하지 않는다.
- Prisma schema와 migration SQL에는 의도를 설명하는 한글 주석/COMMENT를 남긴다.
- Backend controller/use case/repository/helper에는 `AGENT/SOFTWARE_AGENT`의 한국어 주석 규칙을 적용한다.
