# Goal Completion Checklist

상태: G01 Done / G02 Done / G03 Done / G04 Done / G05 Done / G06 Done / G07 Done / G08 Done / G09 Done / G10 Done
최종 업데이트: 2026-07-29

## 1. 목적

08 Global Data I18N의 `/goal` 실행 완료 여부를 확인한다.

구현 goal은 타입/테스트/build 결과 없이 완료로 체크하지 않는다. 실제 실행하지 못한 검증이 있으면 체크하지 않고 사유를 남긴다.

## 2. Goal 완료 현황

| 완료 | Goal | 상태 | 완료일 | 완료 기준 | 증거 | 비고 |
|---|---|---|---|---|---|---|
| [x] | G01 Document Contract Sync | Done | 2026-07-28 | 현재 코드와 계약 대조, AGENT 갱신 대상 확정 | `COMMON/PLANNING-REVIEW.md`, G01 spec, `pnpm.cmd run prisma:validate` | G02 착수 가능 |
| [x] | G02 User Global Settings | Done | 2026-07-28 | User 설정 DB/API/Settings 구현 | `COMMON/GOAL-SPECS/G02_USER_GLOBAL_SETTINGS.md`, `BE/prisma/migrations/20260728010000_add_user_global_settings`, BE/FE 검증 명령 | G03 착수 가능 |
| [x] | G03 App I18N Foundation | Done | 2026-07-28 | app i18n provider/resource 구현 | `COMMON/GOAL-SPECS/G03_APP_I18N_FOUNDATION.md`, `FE/user-web/src/features/app-i18n`, User Web 검증 명령 | G04 착수 가능 |
| [x] | G04 Currency Product Deal | Done | 2026-07-28 | Product/Deal currency 구현 | G04 spec, BE/FE 검증 명령 | KRW/USD |
| [x] | G05 Contact Phone Global | Done | 2026-07-28 | Contact phone 글로벌 필드와 migration 구현 | G05 spec, `BE/prisma/migrations/20260728030000_add_contact_global_phone`, BE/FE 검증 명령 | KR/US |
| [x] | G06 Company Region Address | Done | 2026-07-28 | CompanyRegion code/address 구현 | BE/FE 검증 통과 | Company만 적용 |
| [x] | G07 Import Export Localization | Done | 2026-07-28 | Export/Import template 현지화 구현 | G07 spec, BE/FE 검증 명령 | ko-KR/en |
| [x] | G08 Auth Google LINE Apple | Done | 2026-07-28 | Google/LINE/Apple auth 구현 | G08 spec, Auth Provider API, BE/FE 검증 명령 | 2026-07-29 사용자 확인 기준 LINE/Apple 실제 provider smoke 완료 |
| [x] | G09 App Screen Translation | Done | 2026-07-28 | 핵심 `/app` 화면 번역 적용 | G09 spec, User Web `typecheck`/`lint`/`build` | legacy static text fallback은 후속 직접 keying 개선 후보 |
| [x] | G10 QA Document Closeout | Done | 2026-07-28 | 최종 QA와 문서 동기화 | G10 spec, BE/FE 검증 명령, E2E/mobile E2E | DB 최신 상태는 2026-07-29 재확인 완료, LINE/Apple 운영 smoke도 2026-07-29 사용자 확인 기준 완료 |

## 3. Goal별 체크 조건

### 공통 Contract Gate

- [x] 각 goal은 request 계약을 명시했거나 영향 없음으로 기록했다.
- [x] 각 goal은 response 계약을 명시했거나 영향 없음으로 기록했다.
- [x] 각 goal은 business logic을 명시했다.
- [x] 각 goal은 user flow를 명시했다.
- [x] 각 goal은 DB/Prisma 영향을 명시했거나 변경 없음으로 기록했다.
- [x] 각 goal은 `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`의 실제 수정 후보 파일과 완료 산출물을 확인했다.
- [x] API가 있는 goal은 계약 상태, 소비자, 호환성, DTO 이름, success status를 기록했다.
- [x] mutation이 있는 goal은 transaction 필요 여부와 rollback 범위를 기록했다.
- [x] mutation/provider/batch가 있는 goal은 observability event key, request id, redaction 기준을 기록했다.
- [x] DB 변경 goal은 `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/prisma/seed.ts`를 확인했다.
- [x] 새 table/column/enum/index에는 Prisma schema 한글 주석과 migration SQL COMMENT가 있다.
- [x] 각 goal별 검토는 `COMMON/GOAL-REVIEW-CHECKLIST.md`를 따른다.

### G01 Document Contract Sync

- [x] 현재 코드의 User/Auth/Company/Contact/Product/Deal/DataImport 구조를 확인했다.
- [x] 현재 `FE/user-web/src/app/router/router.tsx`에서 `/app` locale prefix가 없음을 확인했다.
- [x] 현재 public-site i18n과 app i18n 분리 지점을 확인했다.
- [x] 기존 AGENT 문서의 Google only, Apple/LINE future, provider-only 계정 판정 정책 갱신 대상을 목록화했다.
- [x] `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN` 반영 범위를 `SOURCE-PLAN-COVERAGE.md`에 기록했다.
- [x] G02~G10 착수 blocking 질문이 없다.

### G02 User Global Settings

- [x] `User.countryCode`가 추가됐다.
- [x] `User.defaultCurrencyCode`가 추가됐다.
- [x] 기존 사용자는 `KR`, `KRW` fallback을 가진다.
- [x] `PATCH /api/users/me/profile`이 `preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`를 검증/저장한다.
- [x] 신규 가입 기본값 추론이 브라우저 locale, proxy geo country, 브라우저 timezone, fallback 순서를 따른다.
- [x] 기존 사용자의 `timeZone`은 로그인 때 브라우저 timezone으로 덮어쓰지 않는다.
- [x] Backend 신규/수정 코드에 한글 주석 규칙이 적용됐다.

### G03 App I18N Foundation

- [x] public-site i18n과 분리된 app i18n provider가 있다.
- [x] locale 지원값은 `ko-KR`, `en`으로 제한된다.
- [x] `/app` route에 locale prefix가 붙지 않는다.
- [x] `User.preferredLocale` 로딩 후 앱 문구가 설정값을 따른다.
- [x] `/app/settings` 저장 직후 locale이 즉시 반영된다.
- [x] Frontend 신규 component/hook/function에 `// 기능 : ...` 주석이 있다.

### G04 Currency Product Deal

- [x] `Product.currencyCode`가 추가됐다.
- [x] `Deal.currencyCode`가 추가됐다.
- [x] 기존 Product/Deal 데이터는 `KRW` 의미를 유지한다.
- [x] 허용 통화는 `KRW`, `USD`다.
- [x] 금액 입력은 정수만 허용한다.
- [x] Deal 생성 기본값은 Product currency 우선, User default currency fallback이다.
- [x] Product/Deal 목록/상세/form/report/export 표시가 currency-aware하다.

### G05 Contact Phone Global

- [x] `Contact.phoneCountryCode`가 추가됐다.
- [x] `Contact.phoneNationalNumber`가 추가됐다.
- [x] `Contact.phoneE164`가 추가됐다.
- [x] 기존 `mobile`은 유지된다.
- [x] KR/US 전화번호 입력/검증/표시가 동작한다.
- [x] 기존 `010-1234-5678` 데이터가 가능한 경우 자동 migration된다.
- [x] 변환 실패 데이터는 삭제/수정되지 않고 `mobile` fallback으로 표시된다.
- [x] Contact export/search/중복 기준이 `phoneE164` 우선이다.

### G06 Company Region Address

- [x] Company에 주소 자유 입력 필드가 추가됐거나 기존 구조와 연결됐다.
- [x] Contact에는 주소/지역 필드를 추가하지 않았다.
- [x] 기존 `CompanyRegion` 구조를 유지한다.
- [x] `CompanyRegion.countryCode`가 추가됐다.
- [x] `CompanyRegion.regionCode`가 추가됐다.
- [x] KR 시/도와 US State 선택 목록이 제공된다.
- [x] 기존 한국 region은 가능한 경우 자동 매핑된다.
- [x] 매핑 실패 region은 legacy custom region으로 유지된다.

### G07 Import Export Localization

- [x] Export header가 사용자 `preferredLocale` 기준으로 표시된다.
- [x] Export 날짜/시간이 사용자 `timeZone` 기준으로 표시된다.
- [x] Export 통화가 `currencyCode` 기준으로 표시된다.
- [x] Contact export에 Phone, Phone Country, Phone E.164가 포함된다.
- [x] Import template download가 `locale=ko-KR|en`을 지원한다.
- [x] Import template 기본값은 사용자 `preferredLocale`이다.
- [x] 지원하지 않는 locale fallback이 있다.

### G08 Auth Google LINE Apple

- [x] `OAuthProvider.LINE`이 추가됐다.
- [x] Google, LINE, Apple이 `/api/auth/providers`에 이 순서로 반환된다.
- [x] `/api/auth/exchange`가 Google, LINE, Apple을 허용한다.
- [x] Kakao는 runtime provider로 노출되지 않는다.
- [x] 같은 verified email은 기존 User에 provider 계정으로 연결된다.
- [x] email 없음은 가입/로그인을 차단한다.
- [x] email 비교는 lowercase 기준이다.
- [x] 로그인/회원가입 화면에 Google, LINE, Apple 카드형 버튼이 이 순서로 보인다.
- [x] 이메일 로그인 UI를 추가하지 않았다.
- [x] 실패 메시지는 provider raw error 없이 일반 문구다.

### G09 App Screen Translation

- [x] Home 화면이 `ko-KR`, `en`으로 표시된다.
- [x] Company 화면이 `ko-KR`, `en`으로 표시된다.
- [x] Contact 화면이 `ko-KR`, `en`으로 표시된다.
- [x] Product 화면이 `ko-KR`, `en`으로 표시된다.
- [x] Deal 화면이 `ko-KR`, `en`으로 표시된다.
- [x] Schedule 화면이 `ko-KR`, `en`으로 표시된다.
- [x] MeetingNote 화면이 `ko-KR`, `en`으로 표시된다.
- [x] Notification 화면이 `ko-KR`, `en`으로 표시된다.
- [x] Settings 화면이 `ko-KR`, `en`으로 표시된다.
- [x] Import/Export 화면과 문구가 `ko-KR`, `en`으로 표시된다.
- [x] validation/error/empty/toast 문구가 locale별로 표시된다.
- [x] 긴 영어 문구가 버튼/표/사이드바를 깨지 않는다.

### G10 QA Document Closeout

- [x] Backend `pnpm run prisma:validate` 통과
- [x] Backend `pnpm run prisma:generate` 통과
- [x] Backend `pnpm run typecheck` 통과
- [x] Backend `pnpm run lint` 통과
- [x] Backend 관련 test 통과
- [x] Backend `pnpm run build` 통과
- [x] User Web `pnpm run typecheck` 통과
- [x] User Web `pnpm run lint` 통과
- [x] User Web `pnpm run build` 통과
- [x] E2E 또는 수동 QA 결과 기록
- [x] AGENT 문서의 이전 auth/i18n 정책이 구현 결과와 일치한다.
- [x] README, BE-TODO, FE-TODO, DB-SCHEMA, API-SPEC이 구현 결과와 일치한다.

## 4. 현재 기록

- 2026-07-27: 08 구현 전 정책 결정과 goal 단위 실행 문서 작성.
- 2026-07-28: G01 Document Contract Sync 완료. AGENT/TODO 계약 문서의 current baseline과 08 target delta를 분리했고, `DOMAIN_GLOBAL_DATA_API.md` Error Response / FE 처리 기준과 `COMMON/PLANNING-REVIEW.md`를 추가했다. `cd BE; pnpm.cmd run prisma:validate` 통과.
- 2026-07-28: G02 User Global Settings 완료. `User.countryCode`, `User.defaultCurrencyCode`, profile GET/PATCH, auth signup default, `/app/settings`와 계정 설정 모달을 연결했다. 검증은 BE `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test -- auth user`, FE user-web `typecheck`, `lint`, `build` 통과.
- 2026-07-28: G03 App I18N Foundation 완료. `FE/user-web/src/features/app-i18n`에 app 전용 provider/resource/formatter를 추가하고 Settings 저장 후 `User.preferredLocale` 기반 문구와 날짜/시간 formatter가 즉시 반영되도록 연결했다. 검증은 FE user-web `typecheck`, `lint`, `build` 통과. `features/app-i18n` 내부 public-site 참조 없음과 `/app` route prefix 유지 확인.
- 2026-07-28: G04 Currency Product Deal 완료. Product/Deal `currencyCode`, KRW/USD 정수 금액 정책, Deal Product currency 기본값, currency-aware 표시/export/report를 구현했다. 검증은 BE `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test -- product deal schedule sales-report`, `build`, FE user-web `typecheck`, `lint`, `build` 통과.
- 2026-07-28: G05 Contact Phone Global 완료. `Contact.phoneCountryCode`, `phoneNationalNumber`, `phoneE164`와 KR legacy migration을 추가하고 Contact create/update/list/detail/export/search/business-card/import 경로를 KR/US 정규화와 E.164 우선 기준으로 맞췄다. 명함 보정과 import validation도 KR/US 전화번호를 허용한다. 검증은 BE `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test -- contact data-import business-card search`, `build`, FE user-web `typecheck`, `lint`, `build` 통과.
- 2026-07-28: G07 Import Export Localization 완료. import template `locale=ko-KR|en` 다운로드, 도메인별 export header/date-time/currency 현지화, Contact export 전화번호 세분 컬럼, FE template language selector와 validation locale 표시를 구현했다. DB 변경과 신규 Generic ExportJob은 없다. 검증은 BE `typecheck`, `lint`, 관련 service test, 전체 `test`, `build`, FE user-web `typecheck`, `lint`, `build` 통과.
- 2026-07-28: G08 Auth Google LINE Apple 완료. `OAuthProvider.LINE`과 migration을 추가하고 Google/LINE/Apple provider list, Supabase provider normalization, Apple/LINE runtime mapping, verified email 기존 User linking, provider email required/safe exchange failure 오류를 구현했다. 로그인/회원가입 provider 버튼은 Google, LINE, Apple 순서로 확장했고 이메일 로그인 UI는 추가하지 않았다. 검증은 BE `prisma:generate`, `prisma:validate`, `typecheck`, `lint`, 전체 `test`, `build`, FE user-web `typecheck`, `lint`, `build`, Playwright `/ko/login` 390x844 screenshot 확인 통과. G08 당시 LINE/Apple 실제 provider smoke는 운영 설정 의존 항목으로 남겼고, 2026-07-29 사용자 확인 기준 운영 환경에서 완료됐다.
- 2026-07-28: G09 App Screen Translation 완료. 핵심 `/app` 화면의 nav/button/empty/error/validation/toast copy를 app i18n resource와 legacy static fallback으로 `ko-KR`, `en`에서 동작하도록 적용했다. 검증은 User Web `typecheck`, `lint`, `build` 통과. 후속으로 fallback 의존 문구의 직접 keying 축소를 남긴다.
- 2026-07-28: G10 QA Document Closeout 완료. Backend `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test` 64 suites / 333 tests, `build` 통과. User Web `typecheck`, `lint`, `build`, `test:e2e` 27 passed, `test:e2e:mobile` 12 passed. 당시 원격 DB 변경은 실행하지 않았고 provider smoke 미실행 사유를 기록했다.
- 2026-07-29: `cd BE; pnpm.cmd exec prisma migrate status` 재확인 결과 현재 `BE/.env` 연결 DB는 최신 상태다. 같은 날 사용자 확인 기준 LINE/Apple provider 설정값 연결과 실제 OAuth 동작도 운영 환경에서 완료됐다.
