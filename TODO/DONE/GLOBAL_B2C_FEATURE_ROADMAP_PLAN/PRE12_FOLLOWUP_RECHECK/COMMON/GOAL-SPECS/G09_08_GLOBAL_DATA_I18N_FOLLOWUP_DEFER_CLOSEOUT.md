# G09 08 Global Data I18N Follow-up Defer Closeout

상태: Completed / 문서 closeout 완료 / 구현 금지
작성일: 2026-08-06
검토일: 2026-08-06

## 1. 목표

`08_GLOBAL_DATA_I18N`에서 완료한 Global Data I18N 범위를 재오픈하지 않고, 08 밖으로 남은 후속 후보를 PRE12 후보로 분류한다.

이 goal은 구현 goal이 아니다. `BE`, `FE` 코드 변경, API 계약 확정, Prisma migration 생성은 하지 않는다.

2026-08-06 재대조 결과, `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`에는 있으나 08 또는 PRE12에 누락된 추가 후속 후보는 발견되지 않았다. 확인된 후속 후보는 `PRE12-F17`~`PRE12-F25` 또는 기존 `PRE12-F09`, `PRE12-F11`, `PRE12-F12`, `PRE12-F13`으로 이미 분류되어 있다.

2026-08-07 2차 재대조 결과, 신규 후속 후보 ID는 추가하지 않고 source plan의 first sale country, billing, tax, subscription, payment, refund, invoice, failed payment gap을 기존 `PRE12-F12`/`PRE12-F21` 경계에 명시 보강했다.

## 2. 판단 근거

대조 기준:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- 실제 코드: `BE`, `FE/user-web`

확인한 완료 사실:

| 범위 | 현재 사실 |
| --- | --- |
| `/app` i18n | `ko-KR`, `en` app i18n provider/resource/formatter와 legacy static fallback이 있다. `/app` route에는 locale prefix가 없다. |
| User global settings | `preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`가 User profile API와 Settings UX에 연결됐다. |
| Currency | Product/Deal은 `Int` amount와 `currencyCode`를 사용하고 1차 통화는 `KRW`, `USD`다. |
| Contact phone | `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`가 있고 KR/US phone normalization과 legacy mobile fallback이 있다. |
| Company region/address | Company free address와 `CompanyRegion.countryCode`, `regionCode`가 있고 1차 region은 KR/US다. |
| Import/Export localization | Import template은 `locale=ko-KR|en`, domain export는 사용자 locale/timezone/currency 기준을 사용한다. |
| Auth provider | Runtime provider는 Google, LINE, Apple이다. Kakao는 legacy enum/data 호환으로만 남는다. |
| 운영 확인 | 2026-07-29 기준 DB migration 최신 상태와 LINE/Apple 운영 provider smoke가 완료로 기록됐다. |

## 3. PRE12 후보 분류

| 후보 | PRE12 ID | 분류 | 판단 |
| --- | --- | --- | --- |
| `/app` `ja`, `zh-TW` 번역과 시장별 UX writing | `PRE12-F17` | 후속 seed | public/auth locale과 다르다. `/app`은 `ko-KR/en`만 완료다. |
| `zh-CN` 중국 본토 지원 | `PRE12-F18` | defer / 시장 진입 결정 필요 | 08 결정 로그에서 현재 후보가 아니라고 분리했다. |
| 전 세계 국가/통화/전화번호 확장 | `PRE12-F19` | 후속 seed | 현재 구현은 KR/US, KRW/USD로 제한되어 있다. |
| USD cent/minor unit과 금액 정밀도 | `PRE12-F20` | billing-blocked / amount-precision 후속 | Product/Deal amount model과 Paddle Billing money model을 함께 정해야 한다. |
| 국가별 상세 주소 검증 | `PRE12-F21` | billing-blocked / 후속 seed | Company address는 자유 입력이다. 세금/청구/약관 정책이 먼저 필요하다. |
| Contact 개인 주소 | `PRE12-F22` | 후속 seed / CRM 확장 | 08은 Contact address를 명시적으로 제외했다. |
| Auth strategy 확장 | `PRE12-F23` | defer / auth strategy 필요 | email/password, Microsoft login, Kakao runtime 복구, 신규 provider는 08 대상이 아니다. |
| `/app` locale route prefix | `PRE12-F24` | defer / guardrail | 08은 `/app/*` 고정 route를 확정했다. 새 라우팅 계약 없이는 금지한다. |
| app i18n 직접 keying, Settings OAuth 계정 라벨, bundle 최적화 polish | `PRE12-F25` | 후속 seed / UXUI quality | 08 blocker가 아니라 제품화 유지보수 후보로 둔다. |

## 4. 기존 PRE12 후보로 연결할 항목

아래 항목은 08 재대조에서도 보이지만 새 후보로 중복 생성하지 않는다.

| 항목 | 기존 후보 | 판단 |
| --- | --- | --- |
| generic ExportJob/PDF/bulk export | `PRE12-F09` | 08 G07은 기존 domain export localization만 완료했고 Generic ExportJob은 만들지 않았다. |
| backup/restore runbook/drill | `PRE12-F11` | 08 migration 최신 상태 확인은 완료다. 실제 backup/restore 운영 drill은 data reliability 후보로 둔다. |
| billing/subscription/tax/paywall/churn/paid conversion | `PRE12-F12` | plan/payment/subscription/tax/refund/invoice/failed payment와 paid conversion은 `TODO/PADDLE_PLAN` 범위와 연결한다. country tax/terms/pricing policy는 `PRE12-F21`과 함께 본다. |
| Import scale/source/Admin 확장 | `PRE12-F13` | 01은 import persistence/retention/volume limit로 완료됐고, 08은 기존 import/export localization만 다뤘다. |

## 5. 구현 금지

이 goal에서는 아래를 하지 않는다.

- `APP_SUPPORTED_LOCALES`에 `ja`, `zh-TW`, `zh-CN` 추가
- `SUPPORTED_COUNTRY_CODES`, phone country, company region, currency list 확장
- Product/Deal amount schema 또는 DTO를 minor unit으로 변경
- 국가별 tax/terms/pricing/address validation API 추가
- Contact address field 추가
- email/password, Microsoft, Kakao runtime login 구현
- `/app` route에 locale prefix 추가
- generic ExportJob, backup/restore, plan/payment/subscription/tax/refund/invoice/failed payment billing API를 08 후속으로 우회 구현

## 6. 코드 재대조 기준

확인한 주요 코드 기준:

- `BE/prisma/schema.prisma`에는 User global settings, Product/Deal `currencyCode`, Contact global phone, Company/CompanyRegion country/region/address, `OAuthProvider.LINE`이 있다.
- `BE/src/modules/user`와 `BE/src/shared/application`은 profile locale/country/currency와 xlsx locale을 `ko-KR/en`, `KR/US`, `KRW/USD` 기준으로 제한한다.
- `BE/src/modules/contact`와 `BE/src/modules/company`는 Contact phone과 Company region/address를 KR/US 1차 범위로 정규화한다.
- `FE/user-web/src/features/app-i18n/constants.ts`는 `/app` locale을 `ko-KR/en`, 통화를 `KRW/USD`로 제한한다.
- `FE/user-web/src/features/public-site`에는 public/auth용 `ja`, `zh-TW`가 있지만 `/app` i18n 지원 locale은 아니다.
- `BE/src/modules/auth`와 `FE/user-web/src/features/auth`는 runtime login provider를 Google, LINE, Apple로 노출한다. Kakao는 legacy enum/data 호환이고 email/password, Microsoft runtime login은 08 범위가 아니다.
- Contact personal address, Product/Deal minor unit 또는 amount precision schema/API/UX 구현은 확인되지 않았다. `addressbook#contacts@group.v.calendar.google.com` 검색 결과는 Google Calendar contacts group 상수이며 Contact address 구현 근거가 아니다.

```powershell
rg -n "SUPPORTED_LOCALES|SUPPORTED_COUNTRY_CODES|SUPPORTED_CURRENCY_CODES|SUPPORTED_CONTACT_PHONE_COUNTRY_CODES|COMPANY_REGION_COUNTRY_CODES|KRW|USD|ko-KR|zh-CN|zh-TW|ja" BE\src FE\user-web\src -g "*.ts" -g "*.tsx"
rg -n "OAuthProvider|normalizeProvider|GOOGLE|LINE|APPLE|MICROSOFT|KAKAO|password|email/password|auth/providers|auth/exchange" BE\src\modules\auth FE\user-web\src -g "*.ts" -g "*.tsx"
rg -n "phoneCountryCode|phoneNationalNumber|phoneE164|currencyCode|CompanyRegion" BE\prisma\schema.prisma
rg -n "contact.*address|address.*contact|ContactAddress|personalAddress|minorUnit|amountPrecision|cents|Decimal.*amount" BE\src FE\user-web\src BE\prisma\schema.prisma -g "*.ts" -g "*.tsx" -g "*.prisma"
```

## 7. 완료 기준

- [x] 08 완료 범위를 재오픈하지 않는다고 기록했다.
- [x] 08 후속 후보를 `PRE12-F17`~`PRE12-F25`로 분류했다.
- [x] `PRE12-F09`, `PRE12-F11`, `PRE12-F12`, `PRE12-F13`과 중복되는 항목을 cross-reference로 분리했다.
- [x] `TODO/PADDLE_PLAN` 결정 없이는 money/tax/pricing/address policy를 구현하지 않는다고 기록했다.
- [x] 2026-08-07 2차 재대조에서 source plan의 subscription/payment/tax/refund/invoice/failed payment gap을 `PRE12-F12` 경계로 보강했다.
- [x] `/app` locale prefix와 신규 auth provider를 guardrail로 고정했다.
