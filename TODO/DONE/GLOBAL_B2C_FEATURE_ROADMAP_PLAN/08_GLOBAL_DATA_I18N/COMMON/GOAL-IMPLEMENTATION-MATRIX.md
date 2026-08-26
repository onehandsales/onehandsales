# Goal Implementation Matrix

상태: Confirmed

목적: 08의 각 `/goal`을 바로 구현할 수 있도록 실제 수정 후보 파일, 생성 후보 파일, API/DB 산출물, 검증 기준을 고정한다. 이 문서는 추상 원칙이 아니라 구현자가 먼저 열어야 하는 작업 지도다.

## 0. 공통 실행 규칙

각 `/goal` 시작 시 먼저 실행한다.

```powershell
git status --short
rg -n "TODO|FIXME|preferredLocale|timeZone|countryCode|defaultCurrencyCode|currencyCode|mobile|CompanyRegion|OAuthProvider|UserOAuthAccount" BE FE AGENT TODO
```

DB 변경 goal은 구현 전 반드시 아래 파일을 연다.

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`

코드 주석은 아래 기준을 지킨다.

- BE controller method: `// API : ...`
- BE class/interface: `// 역할 : ...`
- BE use case/service/repository/helper: `// 기능 : ...`
- FE component/hook/function/event/API client: `// 기능 : ...`

## G01 Document Contract Sync

목표: 08 구현 전에 기존 AGENT/BE/FE 문서와 현재 코드가 08 확정 정책과 충돌하지 않게 정리한다.

반드시 확인할 기존 문서:

- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/PM_AGENT/DECISIONS/027_auth_session_and_provider_qa_policy.md`
- `AGENT/PM_AGENT/DECISIONS/028_auth_provider_google_only_and_future_local_providers.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`

수정해야 하는 정책:

- Google only는 “08 완료 전 현재 상태”로만 남기고, 08 목표는 Google/LINE/Apple 실제 provider로 갱신한다.
- Apple/LINE future 후보 문구는 제거하거나 “08 구현 대상”으로 바꾼다.
- 신규/기존 사용자 판정이 `provider + providerUserId`만이라는 문구는 “먼저 provider 연결을 찾고, 없으면 verified email lowercase로 기존 User에 연결”로 바꾼다.
- `/app` locale prefix를 붙이지 않는 정책을 문서에 남긴다.

완료 산출물:

- 위 문서에서 08 정책과 충돌하는 문구가 제거됐다.
- `COMMON/DECISION-LOG.md`와 AGENT 문서가 같은 결정을 말한다.
- 변경한 AGENT 문서에는 “08_GLOBAL_DATA_I18N 기준”이라는 근거가 남아 있다.

검증 명령:

```powershell
rg -n "Google only|APPLE.*future|LINE.*future|provider \+ providerUserId|이메일이 아니라|locale prefix|/ko|/en" AGENT TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\08_GLOBAL_DATA_I18N
```

## G02 User Global Settings

목표: `User`에 국가/기본 통화를 추가하고 `/api/users/me/profile`, `/app/settings`, auth signup default에 연결한다.

현재 코드 기준 수정 후보:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/{신규}_add_user_global_settings/migration.sql`
- `BE/prisma/seed.ts`
- `BE/src/modules/user/presentation/http/user-me.controller.ts`
- `BE/src/modules/user/presentation/http/dto/update-my-profile.dto.ts`
- `BE/src/modules/user/application/use-cases/get-my-profile.use-case.ts`
- `BE/src/modules/user/application/use-cases/update-my-profile.use-case.ts`
- `BE/src/modules/user/application/ports/user.repository.ts`
- `BE/src/modules/user/infrastructure/persistence/prisma-user.repository.ts`
- `BE/src/modules/auth/application/use-cases/exchange-external-auth-token.use-case.ts`
- `BE/src/modules/auth/application/ports/auth.repository.ts`
- `BE/src/modules/auth/infrastructure/persistence/prisma-auth.repository.ts`
- `FE/user-web/src/features/auth/types/auth.ts`
- `FE/user-web/src/features/auth/api/auth-api.ts`
- `FE/user-web/src/features/auth/hooks/use-user-settings.ts`
- `FE/user-web/src/pages/settings/index.tsx`

DB 변경:

- `User.countryCode String @default("KR")`
- `User.defaultCurrencyCode String @default("KRW")`
- 새 column에는 `/// 기능 : ...` 주석을 둔다.
- migration에는 `COMMENT ON COLUMN "User"."countryCode"`와 `COMMENT ON COLUMN "User"."defaultCurrencyCode"`를 추가한다.

API 계약:

- `GET /api/users/me/profile` response에 `countryCode`, `defaultCurrencyCode`를 추가한다.
- `PATCH /api/users/me/profile` body에 `countryCode`, `defaultCurrencyCode`를 허용한다.
- 허용값은 `preferredLocale: ko-KR | en`, `countryCode: KR | US`, `defaultCurrencyCode: KRW | USD`, `timeZone: IANA timezone`.
- 당시 Settings 화면의 `en-US`, `en-GB`, `ja-JP` 옵션은 08 1차 범위와 충돌하므로 G02/G03에서 `ko-KR`, `en`만 남긴다.
- 당시 `UpdateMyProfileUseCase.normalizePreferredLocale`는 `en-*`, `ja-JP`까지 저장할 수 있었으므로 08 1차 범위에 맞게 `ko-KR | en`만 반환하도록 좁힌다.
- `ExchangeExternalAuthTokenUseCase.normalizeTimeZone`은 현재 fallback이 `UTC`다. 신규 signup 기본값은 `Asia/Seoul`이어야 하므로 fallback을 08 정책에 맞춘다.
- `ExchangeExternalAuthTokenUseCase.normalizeCountryCode`는 현재 국가가 없으면 `null`을 반환한다. 신규 signup 기본값은 `KR`이어야 하므로 signup/default setting에는 `KR` fallback을 적용한다.

비즈니스 로직:

- 기존 사용자는 DB default로 `KR/KRW`를 갖는다.
- 신규 가입은 browser locale, proxy geo country, browser timezone을 쓰되 실패하면 `ko-KR/KR/Asia/Seoul/KRW`로 저장한다.
- 로그인 때 들어온 `timeZone`은 `lastLoginTimeZone`에는 기록하지만 기존 `User.timeZone`을 자동 덮어쓰지 않는다.
- User profile update는 현재 사용자 row만 변경한다.

테스트 후보:

- `BE/src/modules/user/application/use-cases/update-my-profile.use-case.spec.ts`
- `BE/src/modules/auth/application/use-cases/exchange-external-auth-token.use-case.spec.ts`
- FE는 설정 저장 flow를 `FE/user-web/tests/e2e/user-web-smoke.spec.ts` 또는 신규 `global-settings.spec.ts`에 추가한다.

완료 산출물:

- Settings에서 Language, Time zone, Country, Default currency를 저장할 수 있다.
- 저장 후 profile query cache와 앱 locale/format state가 갱신된다.
- response type과 FE type이 같은 필드를 가진다.

## G03 App I18N Foundation

목표: `/app` route prefix 없이 User Web 앱 내부 i18n 기반을 만든다.

현재 코드 기준 수정/생성 후보:

- `FE/user-web/src/app/app.tsx`
- `FE/user-web/src/app/providers/app-providers.tsx`
- `FE/user-web/src/features/auth/auth-provider.tsx`
- `FE/user-web/src/features/auth/hooks/use-user-settings.ts`
- `FE/user-web/src/utils/format.ts`
- 신규 `FE/user-web/src/features/app-i18n/i18n-provider.tsx`
- 신규 `FE/user-web/src/features/app-i18n/use-app-i18n.ts`
- 신규 `FE/user-web/src/features/app-i18n/resources/ko-KR.ts`
- 신규 `FE/user-web/src/features/app-i18n/resources/en.ts`
- 신규 `FE/user-web/src/features/app-i18n/formatters.ts`
- 신규 `FE/user-web/src/features/app-i18n/constants.ts`

구현 규칙:

- `/app`, `/app/companies`, `/app/deals` 같은 기존 route path는 유지한다.
- public-site i18n 파일 `FE/user-web/src/features/public-site/i18n/*`는 앱 i18n으로 재사용하지 않는다.
- app i18n은 `User.preferredLocale`을 1순위로 사용한다.
- 인증 전 또는 profile load 전 fallback은 browser locale -> `ko-KR`이다.
- 허용 locale은 `ko-KR`, `en`만 둔다.

필수 API 영향:

- API 변경은 없다.
- G02의 profile response에서 `preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`를 읽는다.

테스트 후보:

- `FE/user-web/tests/e2e/user-web-smoke.spec.ts`
- 신규 `FE/user-web/tests/e2e/app-i18n.spec.ts`
- `FE/user-web/src/utils/format.ts`를 직접 바꾸면 formatter 단위 검증 또는 E2E 표시 검증을 추가한다.

완료 산출물:

- `t("common.save")` 같은 key 기반 API가 있다.
- `formatDate`, `formatDateTime`, `formatCurrency`, `formatPhoneDisplay`가 locale/timeZone/currency를 받거나 i18n context를 쓴다.
- 기존 `utils/format.ts`의 한국 고정 표시가 새 formatter와 충돌하지 않는다.

## G04 Currency Product Deal

목표: Product/Deal 금액에 `currencyCode`를 추가하고 생성/수정/목록/상세/export까지 연결한다.

현재 코드 기준 수정 후보:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/{신규}_add_product_deal_currency/migration.sql`
- `BE/src/modules/product/presentation/http/dto/product-request.dto.ts`
- `BE/src/modules/product/presentation/http/product.controller.ts`
- `BE/src/modules/product/application/services/product-application.service.ts`
- `BE/src/modules/product/application/ports/product.repository.ts`
- `BE/src/modules/product/infrastructure/persistence/prisma-product.repository.ts`
- `BE/src/modules/deal/presentation/http/dto/deal-request.dto.ts`
- `BE/src/modules/deal/presentation/http/deal.controller.ts`
- `BE/src/modules/deal/application/services/deal-application.service.ts`
- `BE/src/modules/deal/application/ports/deal.repository.ts`
- `BE/src/modules/deal/infrastructure/persistence/prisma-deal.repository.ts`
- `FE/user-web/src/features/product/types/product.ts`
- `FE/user-web/src/features/product/schemas/product-schema.ts`
- `FE/user-web/src/features/product/components/product-create-dialog.tsx`
- `FE/user-web/src/features/product/components/product-edit-form.tsx`
- `FE/user-web/src/features/product/components/product-list-screen.tsx`
- `FE/user-web/src/features/product/components/product-detail-screen.tsx`
- `FE/user-web/src/features/deal/types/deal.ts`
- `FE/user-web/src/features/deal/schemas/deal-schema.ts`
- `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
- `FE/user-web/src/features/deal/components/deal-edit-dialog.tsx`
- `FE/user-web/src/features/deal/components/deal-list-screen.tsx`
- `FE/user-web/src/features/deal/components/deal-detail-screen.tsx`
- `FE/user-web/src/features/deal/utils/deal-display.ts`

DB 변경:

- `Product.currencyCode String @default("KRW")`
- `Deal.currencyCode String @default("KRW")`
- migration COMMENT를 추가한다.
- 기존 `productPrice`, `dealCost`는 정수 그대로 둔다.

비즈니스 로직:

- 허용 통화는 `KRW`, `USD`만이다.
- Product 생성/수정에서 `currencyCode`가 없으면 `User.defaultCurrencyCode`를 쓴다.
- Deal 생성에서 Product가 연결되면 Product `currencyCode`를 기본값으로 쓴다.
- 사용자가 Deal `currencyCode`를 명시하면 허용값 안에서 우선한다.
- Product/Deal response와 export에는 amount와 `currencyCode`가 같이 나간다.

테스트 후보:

- `BE/src/modules/product/application/services/product-application.service.spec.ts`
- `BE/src/modules/deal/application/services/deal-application.service.spec.ts`
- `BE/src/modules/deal/presentation/http/deal.controller.spec.ts`

완료 산출물:

- Product/Deal 생성, 수정, 목록, 상세에서 currency가 보존된다.
- FE 금액 표시는 사용자 locale + currencyCode 기준으로 표시된다.

## G05 Contact Phone Global

목표: Contact 전화번호를 KR/US 입력, E.164 저장, legacy fallback 표시로 전환한다.

현재 코드 기준 수정/생성 후보:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/{신규}_add_contact_global_phone/migration.sql`
- `BE/src/modules/contact/presentation/http/dto/contact-request.dto.ts`
- `BE/src/modules/contact/presentation/http/contact.controller.ts`
- `BE/src/modules/contact/application/services/contact-application.service.ts`
- `BE/src/modules/contact/application/ports/contact.repository.ts`
- `BE/src/modules/contact/infrastructure/persistence/prisma-contact.repository.ts`
- `BE/src/modules/contact/domain/contact.errors.ts`
- 신규 `BE/src/modules/contact/application/services/contact-phone-normalizer.ts`
- `FE/user-web/src/features/contact/types/contact.ts`
- `FE/user-web/src/features/contact/schemas/contact-schema.ts`
- `FE/user-web/src/features/contact/components/contact-create-dialog.tsx`
- `FE/user-web/src/features/contact/components/contact-edit-form.tsx`
- `FE/user-web/src/features/contact/components/contact-list-screen.tsx`
- `FE/user-web/src/features/contact/components/contact-detail-screen.tsx`
- `FE/user-web/src/features/deal/types/deal.ts`
- `FE/user-web/src/features/company/types/company.ts`

DB 변경:

- 기존 `Contact.mobile`은 유지한다.
- `Contact.phoneCountryCode String?`
- `Contact.phoneNationalNumber String?`
- `Contact.phoneE164 String?`
- `phoneE164` 검색용 index를 추가한다.
- 기존 한국 `010-1234-5678`, `01012345678`은 가능한 경우 `KR`, national number, `+82...`로 migration한다.
- 변환 실패 row는 삭제하지 않고 `mobile` fallback으로 남긴다.

API 계약:

- create/update request는 `mobile` legacy와 함께 `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`를 받을 수 있다.
- response는 display용 `mobile` 또는 `phoneDisplay`와 code 필드를 같이 내려준다.
- validation error는 `CONTACT_PHONE_INVALID`, field는 `phoneNationalNumber` 또는 `phoneE164`로 둔다.

테스트 후보:

- `BE/src/modules/contact/application/services/contact-application.service.spec.ts`
- `BE/src/modules/contact/infrastructure/persistence/prisma-contact.repository.spec.ts`
- 신규 `BE/src/modules/contact/application/services/contact-phone-normalizer.spec.ts`
- Contact create/edit/export flow는 `FE/user-web/tests/e2e/user-web-smoke.spec.ts` 또는 신규 `contact-phone-global.spec.ts`에 추가한다.

완료 산출물:

- Contact create/edit에서 Country KR/US 선택과 national number 입력이 가능하다.
- 기존 `mobile`만 있는 contact도 목록/상세/export에서 깨지지 않는다.
- Export에는 `Phone`, `Phone Country`, `Phone E.164`가 포함된다.

## G06 Company Region Address

목표: Company에 국가/표준 지역 코드와 상세 주소를 추가하고 Contact에는 주소를 추가하지 않는다.

현재 코드 기준 수정 후보:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/{신규}_add_company_global_region_address/migration.sql`
- `BE/prisma/seed.ts`
- `BE/src/modules/company/presentation/http/dto/company-request.dto.ts`
- `BE/src/modules/company/presentation/http/company.controller.ts`
- `BE/src/modules/company/application/services/company-application.service.ts`
- `BE/src/modules/company/application/ports/company.repository.ts`
- `BE/src/modules/company/infrastructure/persistence/prisma-company.repository.ts`
- `FE/user-web/src/features/company/types/company.ts`
- `FE/user-web/src/features/company/schemas/company-schema.ts`
- `FE/user-web/src/features/company/components/company-create-dialog.tsx`
- `FE/user-web/src/features/company/components/company-edit-form.tsx`
- `FE/user-web/src/features/company/components/company-list-screen.tsx`
- `FE/user-web/src/features/company/components/company-detail-screen.tsx`
- `FE/user-web/src/features/deal/types/deal.ts`
- `FE/user-web/src/features/deal/components/deal-entity-search-field.tsx`

DB 변경:

- `Company.countryCode String @default("KR")`
- `Company.regionCode String?` 또는 기존 `companyRegionId`와 같이 조회 가능한 code 필드
- `Company.addressLine String?`
- `CompanyRegion.countryCode String @default("KR")`
- `CompanyRegion.regionCode String?`
- 기존 `CompanyRegion.region`은 legacy/custom label fallback으로 유지한다.

비즈니스 로직:

- 1차 허용 국가는 `KR`, `US`다.
- KR region은 시/도 code, US region은 state code를 쓴다.
- 기존 한국 지역명은 가능한 경우 `KR-*` code로 migration한다.
- 실패 row는 legacy custom region으로 유지한다.
- Contact 주소 필드는 만들지 않는다.

테스트 후보:

- `BE/src/modules/company/application/services/company-application.service.spec.ts`
- 신규 또는 기존 Company controller/repository spec
- Company create/edit/detail flow는 `FE/user-web/tests/e2e/user-web-smoke.spec.ts` 또는 신규 `company-region-address.spec.ts`에 추가한다.

완료 산출물:

- Company create/edit에서 Country, Region, Address를 입력할 수 있다.
- locale에 따라 region label이 표시된다.
- Deal/Company related option에서 region 표시가 깨지지 않는다.

## G07 Import Export Localization

목표: Import template과 Export header/value를 사용자 locale/timeZone/currency/phone 기준으로 현지화한다.

현재 코드 기준 수정 후보:

- `BE/src/modules/data-import/presentation/http/import-template.controller.ts`
- `BE/src/modules/data-import/presentation/http/dto/import-template-request.dto.ts`
- `BE/src/modules/data-import/application/services/data-import-application.service.ts`
- `BE/src/modules/data-import/application/ports/import-template.repository.ts`
- `BE/src/modules/data-import/infrastructure/persistence/prisma-import-template.repository.ts`
- `BE/src/modules/company/application/services/company-application.service.ts`
- `BE/src/modules/contact/application/services/contact-application.service.ts`
- `BE/src/modules/product/application/services/product-application.service.ts`
- `BE/src/modules/deal/application/services/deal-application.service.ts`
- `BE/src/shared/application/export/xlsx-export-file.ts`
- `FE/user-web/src/features/import-export/types/import-template.ts`
- `FE/user-web/src/features/import-export/api/import-template-api.ts`
- `FE/user-web/src/features/import-export/components/import-screen.tsx`
- `FE/user-web/src/features/import-export/components/export-screen.tsx`

API 계약:

- `GET /api/import-templates/active`는 기존 활성 template 목록 조회 계약을 유지한다.
- `GET /api/import-templates/:templateId/download?locale=ko-KR|en`
- `GET /api/*/export/xlsx?locale=ko-KR|en&timeZone=...`
- locale query가 없으면 User settings를 쓴다.

비즈니스 로직:

- Contact export는 `Phone`, `Phone Country`, `Phone E.164`를 포함한다.
- Product/Deal export는 amount와 currency code를 같이 내보낸다.
- 날짜/시간 export는 사용자 timezone 표시값을 쓴다.
- export row 원문 phone/email/deal amount는 log에 남기지 않는다.

테스트 후보:

- `BE/src/modules/data-import/application/services/data-import-application.service.spec.ts`
- `BE/src/modules/data-import/infrastructure/persistence/prisma-import-template.repository.spec.ts`
- `BE/src/modules/data-import/presentation/http/import-job.controller.spec.ts`
- `FE/user-web/tests/e2e/import-resume-ux.spec.ts`
- 신규 `FE/user-web/tests/e2e/import-export-localization.spec.ts`

완료 산출물:

- Import template 선택에서 한국어/English template을 받을 수 있다.
- Export 파일 header와 값이 locale에 맞게 나온다.

## G08 Auth Google LINE Apple

목표: 로그인/회원가입 provider를 Google, LINE, Apple 3개로 구현하고 같은 verified email은 기존 User에 연결한다.

현재 코드 기준 수정 후보:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/{신규}_add_line_oauth_provider/migration.sql`
- `BE/src/modules/auth/application/use-cases/list-auth-providers.use-case.ts`
- `BE/src/modules/auth/application/use-cases/exchange-external-auth-token.use-case.ts`
- `BE/src/modules/auth/application/use-cases/exchange-external-auth-token.use-case.spec.ts`
- `BE/src/modules/auth/application/ports/auth.repository.ts`
- `BE/src/modules/auth/infrastructure/persistence/prisma-auth.repository.ts`
- `BE/src/modules/auth/presentation/http/dto/exchange-external-auth-token.dto.ts`
- `BE/src/modules/auth/presentation/http/auth.controller.ts`
- `BE/src/modules/auth/domain/auth.errors.ts`
- `BE/src/shared/application/ports/external-auth-verifier.port.ts`
- `BE/src/shared/infrastructure/supabase/*`
- `FE/user-web/src/features/auth/types/auth.ts`
- `FE/user-web/src/features/auth/api/auth-api.ts`
- `FE/user-web/src/features/auth/auth-service.ts`
- `FE/user-web/src/features/auth/components/auth-login-page.tsx`
- `FE/user-web/src/features/auth/components/auth-login-modal.tsx`
- `FE/user-web/src/features/auth/components/auth-social-login-modal.tsx`
- `FE/user-web/src/features/auth/components/auth-provider-modal-copy.ts`
- `FE/user-web/public/auth/google-logo.svg`
- 신규 `FE/user-web/public/auth/line-logo.svg`
- 신규 `FE/user-web/public/auth/apple-logo.svg` 또는 lucide/텍스트 기반 카드 버튼

현재 코드에서 반드시 바꿀 점:

- `AuthProviderId = "google"`를 `"google" | "line" | "apple"`로 확장한다.
- `ListAuthProvidersUseCase` response type과 반환값을 Google -> LINE -> Apple 순서로 바꾼다.
- `exchangeSupabaseAccessToken`은 기존처럼 Authorization Bearer에 Supabase access token을 싣는다. provider token 원문을 body에 넣지 않는다.
- `ExchangeExternalAuthTokenDto`는 provider를 body로 받지 않는 현재 구조를 유지한다. provider는 Supabase token 검증 결과에서 확정하고, `ExternalAuthProvider`/`SupabaseJwtVerifierAdapter`/Prisma mapper를 `google | line | apple`로 확장한다.
- `ExchangeExternalAuthTokenUseCase.normalizeLocale`은 08 1차 범위에 맞춰 `ko-KR`, `en`만 저장하게 조정한다.
- `syncUser`는 현재 provider 계정이 없으면 바로 신규 User를 만들고 있으므로, verified email lowercase로 기존 User 조회 후 `UserOAuthAccount` 연결 단계를 추가한다.
- `AuthRepository`에 기존 User email 조회와 기존 User에 OAuth 계정만 추가하는 계약을 추가한다. 후보 method는 `findUserByEmail(email)`과 `createOAuthAccountForExistingUser(input, now)`다.
- `PrismaUserRepository.fromPrismaProvider`는 현재 `APPLE`을 `legacy_oauth`로 반환하고 `LINE`을 처리하지 않는다. G08에서 `google | line | apple`을 그대로 profile response에 노출하고 `KAKAO`만 legacy로 유지하도록 갱신한다.

DB 변경:

- `enum OAuthProvider { KAKAO GOOGLE APPLE LINE }`
- migration SQL에는 LINE enum 추가 의도 주석을 남긴다.
- `UserOAuthAccount` unique 제약이 `provider + providerUserId` 조회에 충분한지 확인한다.

비즈니스 로직:

- provider token 검증은 DB transaction 밖에서 수행한다.
- transaction 안에서는 User, UserOAuthAccount, AuthDevice, AuthSession 변경을 묶는다.
- email 없음은 `AUTH_PROVIDER_EMAIL_REQUIRED`로 차단한다.
- 같은 verified email User가 있으면 신규 User를 만들지 않고 OAuth account를 연결한다.
- provider raw error/token/secret/email 원문은 log에 남기지 않는다.

테스트 후보:

- `BE/src/modules/auth/application/use-cases/exchange-external-auth-token.use-case.spec.ts`
- `BE/src/modules/auth/application/use-cases/list-auth-providers.use-case.ts` 신규 spec 또는 controller route spec
- `BE/src/modules/auth/infrastructure/persistence/prisma-auth.repository.ts` mapper 검증
- `FE/user-web/tests/e2e/user-web-smoke.spec.ts`
- 신규 `FE/user-web/tests/e2e/auth-provider-buttons.spec.ts`

완료 산출물:

- 로그인/회원가입 UI에는 Google, LINE, Apple 카드형 버튼 3개만 이 순서로 보인다.
- 이메일 로그인 UI나 Microsoft/Kakao 버튼은 추가하지 않는다.
- Apple/LINE smoke는 G10 당시 env가 없으면 “미실행 사유”를 남기는 항목이었다. 2026-07-29 사용자 확인 기준 운영 환경에서는 LINE/Apple OAuth 동작이 완료됐다.

## G09 App Screen Translation

목표: 핵심 `/app` 화면 copy를 G03 i18n resource로 이동하고 ko-KR/en을 채운다.

현재 코드 기준 수정 후보:

- `FE/user-web/src/components/navigation/sidebar-nav.tsx`
- `FE/user-web/src/components/navigation/bottom-tab-bar.tsx`
- `FE/user-web/src/components/navigation/mobile-app-header.tsx`
- `FE/user-web/src/components/shell/desktop-app-shell.tsx`
- `FE/user-web/src/components/shell/mobile-app-shell.tsx`
- `FE/user-web/src/pages/home/index.tsx`
- `FE/user-web/src/pages/settings/index.tsx`
- `FE/user-web/src/features/company/components/*`
- `FE/user-web/src/features/contact/components/*`
- `FE/user-web/src/features/product/components/*`
- `FE/user-web/src/features/deal/components/*`
- `FE/user-web/src/features/schedule/components/*`
- `FE/user-web/src/features/meeting-note/components/*`
- `FE/user-web/src/features/notification/components/*`
- `FE/user-web/src/features/import-export/components/*`
- `FE/user-web/src/features/app-i18n/resources/ko-KR.ts`
- `FE/user-web/src/features/app-i18n/resources/en.ts`

구현 규칙:

- visible copy만 resource로 이동한다. API field 이름, enum 저장값, route path는 번역하지 않는다.
- public-site i18n과 app i18n을 섞지 않는다.
- 한국어는 간결한 해요체, 영어는 짧고 자연스러운 B2C 업무 도구 톤으로 쓴다.
- 긴 영어 label은 줄바꿈/ellipsis로 UI가 깨지지 않게 한다.

테스트 후보:

- `FE/user-web/tests/e2e/user-web-smoke.spec.ts`
- `FE/user-web/tests/e2e/mobile-browser-qa.spec.ts`
- 신규 `FE/user-web/tests/e2e/app-screen-translation.spec.ts`
- 필요 시 Playwright screenshot을 desktop/mobile에서 비교한다.

완료 산출물:

- Home, Company, Contact, Product, Deal, Schedule, MeetingNote, Notification, Settings, Import/Export의 주요 nav/button/empty/error/validation/toast copy가 ko-KR/en resource에 있다.
- 화면에서 하드코딩 한국어를 `rg -n "[가-힣]" FE/user-web/src/features FE/user-web/src/pages FE/user-web/src/components`로 점검하고 예외를 기록한다.

## G10 QA Document Closeout

목표: G01~G09 구현 결과를 검증하고 08 문서를 implemented 상태로 닫는다.

확인 후보:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/GOAL-REVIEW-CHECKLIST.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/*`
- `BE/package.json`
- `FE/user-web/package.json`
- `FE/user-web/tests/e2e`

반드시 실행할 검증:

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
pnpm run test:e2e:mobile
```

수동 QA 시나리오:

- 신규 signup default: browser locale/timezone/geo fallback 확인
- Settings 저장: language/timezone/country/currency 저장과 즉시 반영 확인
- Product/Deal: KRW/USD 생성, 수정, 목록, 상세, export 확인
- Contact: KR/US phone 입력, legacy mobile fallback, export 확인
- Company: KR/US country/region/address 입력과 legacy region fallback 확인
- Import template: ko-KR/en 다운로드 확인
- Export: header/value locale, phone, currency, timezone 확인
- Auth: Google/LINE/Apple 버튼 순서와 provider exchange 확인
- Auth linking: 같은 verified email이면 기존 User에 연결 확인
- Auth email 없음: 안전한 실패 메시지 확인

문서 closeout:

- `README.md` 상태를 구현 결과에 맞게 갱신한다.
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`의 G01~G10 상태와 검증 결과를 갱신한다.
- 외부 env 부족으로 실행하지 못한 smoke는 실패가 아니라 `N/A - 사유`로 기록한다.
- AGENT 문서의 auth/provider 정책이 구현 결과와 동기화됐는지 다시 확인한다.
