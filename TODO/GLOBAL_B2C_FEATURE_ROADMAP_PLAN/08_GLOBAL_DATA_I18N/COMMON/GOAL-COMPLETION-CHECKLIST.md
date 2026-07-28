# Goal Completion Checklist

상태: G01 Done / G02 Ready
최종 업데이트: 2026-07-28

## 1. 목적

08 Global Data I18N의 `/goal` 실행 완료 여부를 확인한다.

구현 goal은 타입/테스트/build 결과 없이 완료로 체크하지 않는다. 실제 실행하지 못한 검증이 있으면 체크하지 않고 사유를 남긴다.

## 2. Goal 완료 현황

| 완료 | Goal | 상태 | 완료일 | 완료 기준 | 증거 | 비고 |
|---|---|---|---|---|---|---|
| [x] | G01 Document Contract Sync | Done | 2026-07-28 | 현재 코드와 계약 대조, AGENT 갱신 대상 확정 | `COMMON/PLANNING-REVIEW.md`, G01 spec, `pnpm.cmd run prisma:validate` | G02 착수 가능 |
| [ ] | G02 User Global Settings | Not Started |  | User 설정 DB/API 구현 |  | migration 필요 |
| [ ] | G03 App I18N Foundation | Not Started |  | app i18n provider/resource 구현 |  | public-site와 분리 |
| [ ] | G04 Currency Product Deal | Not Started |  | Product/Deal currency 구현 |  | KRW/USD |
| [ ] | G05 Contact Phone Global | Not Started |  | Contact phone 글로벌 필드와 migration 구현 |  | KR/US |
| [ ] | G06 Company Region Address | Not Started |  | CompanyRegion code/address 구현 |  | Company만 적용 |
| [ ] | G07 Import Export Localization | Not Started |  | Export/Import template 현지화 구현 |  | ko-KR/en |
| [ ] | G08 Auth Google LINE Apple | Not Started |  | Google/LINE/Apple auth 구현 |  | provider env 수동 검증 필요 |
| [ ] | G09 App Screen Translation | Not Started |  | 핵심 `/app` 화면 번역 적용 |  | layout QA 필요 |
| [ ] | G10 QA Document Closeout | Not Started |  | 최종 QA와 문서 동기화 |  | closeout |

## 3. Goal별 체크 조건

### 공통 Contract Gate

- [ ] 각 goal은 request 계약을 명시했거나 영향 없음으로 기록했다.
- [ ] 각 goal은 response 계약을 명시했거나 영향 없음으로 기록했다.
- [ ] 각 goal은 business logic을 명시했다.
- [ ] 각 goal은 user flow를 명시했다.
- [ ] 각 goal은 DB/Prisma 영향을 명시했거나 변경 없음으로 기록했다.
- [ ] 각 goal은 `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`의 실제 수정 후보 파일과 완료 산출물을 확인했다.
- [ ] API가 있는 goal은 계약 상태, 소비자, 호환성, DTO 이름, success status를 기록했다.
- [ ] mutation이 있는 goal은 transaction 필요 여부와 rollback 범위를 기록했다.
- [ ] mutation/provider/batch가 있는 goal은 observability event key, request id, redaction 기준을 기록했다.
- [ ] DB 변경 goal은 `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/prisma/seed.ts`를 확인했다.
- [ ] 새 table/column/enum/index에는 Prisma schema 한글 주석과 migration SQL COMMENT가 있다.
- [ ] 각 goal별 검토는 `COMMON/GOAL-REVIEW-CHECKLIST.md`를 따른다.

### G01 Document Contract Sync

- [x] 현재 코드의 User/Auth/Company/Contact/Product/Deal/DataImport 구조를 확인했다.
- [x] 현재 `FE/user-web/src/app/router/router.tsx`에서 `/app` locale prefix가 없음을 확인했다.
- [x] 현재 public-site i18n과 app i18n 분리 지점을 확인했다.
- [x] 기존 AGENT 문서의 Google only, Apple/LINE future, provider-only 계정 판정 정책 갱신 대상을 목록화했다.
- [x] `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN` 반영 범위를 `SOURCE-PLAN-COVERAGE.md`에 기록했다.
- [x] G02~G10 착수 blocking 질문이 없다.

### G02 User Global Settings

- [ ] `User.countryCode`가 추가됐다.
- [ ] `User.defaultCurrencyCode`가 추가됐다.
- [ ] 기존 사용자는 `KR`, `KRW` fallback을 가진다.
- [ ] `PATCH /api/users/me/profile`이 `preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`를 검증/저장한다.
- [ ] 신규 가입 기본값 추론이 브라우저 locale, proxy geo country, 브라우저 timezone, fallback 순서를 따른다.
- [ ] 기존 사용자의 `timeZone`은 로그인 때 브라우저 timezone으로 덮어쓰지 않는다.
- [ ] Backend 신규/수정 코드에 한글 주석 규칙이 적용됐다.

### G03 App I18N Foundation

- [ ] public-site i18n과 분리된 app i18n provider가 있다.
- [ ] locale 지원값은 `ko-KR`, `en`으로 제한된다.
- [ ] `/app` route에 locale prefix가 붙지 않는다.
- [ ] `User.preferredLocale` 로딩 후 앱 문구가 설정값을 따른다.
- [ ] `/app/settings` 저장 직후 locale이 즉시 반영된다.
- [ ] Frontend 신규 component/hook/function에 `// 기능 : ...` 주석이 있다.

### G04 Currency Product Deal

- [ ] `Product.currencyCode`가 추가됐다.
- [ ] `Deal.currencyCode`가 추가됐다.
- [ ] 기존 Product/Deal 데이터는 `KRW` 의미를 유지한다.
- [ ] 허용 통화는 `KRW`, `USD`다.
- [ ] 금액 입력은 정수만 허용한다.
- [ ] Deal 생성 기본값은 Product currency 우선, User default currency fallback이다.
- [ ] Product/Deal 목록/상세/form/report/export 표시가 currency-aware하다.

### G05 Contact Phone Global

- [ ] `Contact.phoneCountryCode`가 추가됐다.
- [ ] `Contact.phoneNationalNumber`가 추가됐다.
- [ ] `Contact.phoneE164`가 추가됐다.
- [ ] 기존 `mobile`은 유지된다.
- [ ] KR/US 전화번호 입력/검증/표시가 동작한다.
- [ ] 기존 `010-1234-5678` 데이터가 가능한 경우 자동 migration된다.
- [ ] 변환 실패 데이터는 삭제/수정되지 않고 `mobile` fallback으로 표시된다.
- [ ] Contact export/search/중복 기준이 `phoneE164` 우선이다.

### G06 Company Region Address

- [ ] Company에 주소 자유 입력 필드가 추가됐거나 기존 구조와 연결됐다.
- [ ] Contact에는 주소/지역 필드를 추가하지 않았다.
- [ ] 기존 `CompanyRegion` 구조를 유지한다.
- [ ] `CompanyRegion.countryCode`가 추가됐다.
- [ ] `CompanyRegion.regionCode`가 추가됐다.
- [ ] KR 시/도와 US State 선택 목록이 제공된다.
- [ ] 기존 한국 region은 가능한 경우 자동 매핑된다.
- [ ] 매핑 실패 region은 legacy custom region으로 유지된다.

### G07 Import Export Localization

- [ ] Export header가 사용자 `preferredLocale` 기준으로 표시된다.
- [ ] Export 날짜/시간이 사용자 `timeZone` 기준으로 표시된다.
- [ ] Export 통화가 `currencyCode` 기준으로 표시된다.
- [ ] Contact export에 Phone, Phone Country, Phone E.164가 포함된다.
- [ ] Import template download가 `locale=ko-KR|en`을 지원한다.
- [ ] Import template 기본값은 사용자 `preferredLocale`이다.
- [ ] 지원하지 않는 locale fallback이 있다.

### G08 Auth Google LINE Apple

- [ ] `OAuthProvider.LINE`이 추가됐다.
- [ ] Google, LINE, Apple이 `/api/auth/providers`에 이 순서로 반환된다.
- [ ] `/api/auth/exchange`가 Google, LINE, Apple을 허용한다.
- [ ] Kakao는 runtime provider로 노출되지 않는다.
- [ ] 같은 verified email은 기존 User에 provider 계정으로 연결된다.
- [ ] email 없음은 가입/로그인을 차단한다.
- [ ] email 비교는 lowercase 기준이다.
- [ ] 로그인/회원가입 화면에 Google, LINE, Apple 카드형 버튼이 이 순서로 보인다.
- [ ] 이메일 로그인 UI를 추가하지 않았다.
- [ ] 실패 메시지는 provider 이름만 포함한 일반 문구다.

### G09 App Screen Translation

- [ ] Home 화면이 `ko-KR`, `en`으로 표시된다.
- [ ] Company 화면이 `ko-KR`, `en`으로 표시된다.
- [ ] Contact 화면이 `ko-KR`, `en`으로 표시된다.
- [ ] Product 화면이 `ko-KR`, `en`으로 표시된다.
- [ ] Deal 화면이 `ko-KR`, `en`으로 표시된다.
- [ ] Schedule 화면이 `ko-KR`, `en`으로 표시된다.
- [ ] MeetingNote 화면이 `ko-KR`, `en`으로 표시된다.
- [ ] Notification 화면이 `ko-KR`, `en`으로 표시된다.
- [ ] Settings 화면이 `ko-KR`, `en`으로 표시된다.
- [ ] Import/Export 화면과 문구가 `ko-KR`, `en`으로 표시된다.
- [ ] validation/error/empty/toast 문구가 locale별로 표시된다.
- [ ] 긴 영어 문구가 버튼/표/사이드바를 깨지 않는다.

### G10 QA Document Closeout

- [ ] Backend `pnpm run prisma:validate` 통과
- [ ] Backend `pnpm run prisma:generate` 통과
- [ ] Backend `pnpm run typecheck` 통과
- [ ] Backend `pnpm run lint` 통과
- [ ] Backend 관련 test 통과
- [ ] Backend `pnpm run build` 통과
- [ ] User Web `pnpm run typecheck` 통과
- [ ] User Web `pnpm run lint` 통과
- [ ] User Web `pnpm run build` 통과
- [ ] E2E 또는 수동 QA 결과 기록
- [ ] AGENT 문서의 이전 auth/i18n 정책이 구현 결과와 일치한다.
- [ ] README, BE-TODO, FE-TODO, DB-SCHEMA, API-SPEC이 구현 결과와 일치한다.

## 4. 현재 기록

- 2026-07-27: 08 구현 전 정책 결정과 goal 단위 실행 문서 작성.
- 2026-07-28: G01 Document Contract Sync 완료. AGENT/TODO 계약 문서의 current baseline과 08 target delta를 분리했고, `DOMAIN_GLOBAL_DATA_API.md` Error Response / FE 처리 기준과 `COMMON/PLANNING-REVIEW.md`를 추가했다. `cd BE; pnpm.cmd run prisma:validate` 통과.
