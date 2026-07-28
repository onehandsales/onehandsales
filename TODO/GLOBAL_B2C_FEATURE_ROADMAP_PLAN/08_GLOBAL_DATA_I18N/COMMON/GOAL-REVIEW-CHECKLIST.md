# Goal Review Checklist

상태: G03 Reviewed / G04 Ready
목적: 각 `/goal` 완료 전 검토자가 반드시 확인할 공통/개별 체크리스트

## 1. 공통 Gate

모든 `/goal`은 완료 처리 전에 아래를 확인한다.

- [ ] goal 파일에 Request 계약이 있거나 영향 없음으로 명시되어 있다.
- [ ] goal 파일에 Response 계약이 있거나 영향 없음으로 명시되어 있다.
- [ ] goal 파일에 Business Logic이 명시되어 있다.
- [ ] goal 파일에 User Flow가 명시되어 있다.
- [ ] goal 파일에 DB/Prisma 영향이 있거나 변경 없음으로 명시되어 있다.
- [ ] `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`에서 실제 수정 후보 파일과 완료 산출물을 확인했다.
- [ ] API가 있으면 계약 상태, 소비자, 호환성, DTO 이름, success status가 명시되어 있다.
- [ ] mutation이면 transaction 필요 여부와 rollback 범위가 명시되어 있다.
- [ ] mutation/provider/batch이면 observability event key, request id, redaction 기준이 명시되어 있다.
- [ ] DB 변경이 있으면 `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/prisma/seed.ts`를 확인했다.
- [ ] 새 table/column/enum/index가 있으면 Prisma schema와 migration SQL에 한글 주석 또는 COMMENT가 있다.
- [ ] Backend 신규/수정 코드에 `// API : ...`, `// 역할 : ...`, `// 기능 : ...` 주석 규칙이 적용됐다.
- [ ] Frontend 신규/수정 코드에 `// 기능 : ...` 주석 규칙이 적용됐다.
- [ ] 실행한 검증 command와 결과를 기록했다.
- [ ] 실행하지 못한 검증은 사유를 기록했다.

## 2. G01 Document Contract Sync

- [ ] API spec request/response가 현재 코드와 충돌하지 않는다.
- [ ] `BE/prisma` 기준과 주석 스타일을 확인했다.
- [ ] 기존 AGENT 문서 갱신 대상이 확정됐다.
- [ ] G02~G10 blocking 질문이 없다.

## 3. G02 User Global Settings

- [ ] profile request/response가 `preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`를 포함한다.
- [ ] User 신규 column이 `BE/prisma` 기준과 한글 주석 규칙을 따른다.
- [ ] 신규 가입 기본값과 기존 사용자 fallback이 문서와 일치한다.
- [ ] `/app/settings` 저장 후 현재 화면 반영 흐름이 동작한다.

## 4. G03 App I18N Foundation

- [x] 신규 Backend request/response 변경 없음이 명시되어 있다.
- [x] app i18n이 public-site i18n과 분리됐다.
- [x] `/app` URL locale prefix가 생기지 않았다.
- [x] `User.preferredLocale` 우선 fallback이 동작한다.

## 5. G04 Currency Product Deal

- [ ] Product/Deal request/response에 `currencyCode`가 포함된다.
- [ ] Product/Deal 신규 column이 `BE/prisma` 기준과 한글 주석 규칙을 따른다.
- [ ] KRW/USD 정수 금액 정책이 지켜졌다.
- [ ] Deal은 Product currency 기본값과 변경 가능 흐름을 모두 지원한다.

## 6. G05 Contact Phone Global

- [ ] Contact request/response에 글로벌 전화번호 필드가 포함된다.
- [ ] Contact 신규 column이 `BE/prisma` 기준과 한글 주석 규칙을 따른다.
- [ ] 기존 `mobile` fallback이 유지된다.
- [ ] 기존 한국 번호 자동 migration과 실패 데이터 보존이 동작한다.

## 7. G06 Company Region Address

- [ ] Company/CompanyRegion request/response에 국가/지역 code가 포함된다.
- [ ] Company/CompanyRegion 신규 field가 `BE/prisma` 기준과 한글 주석 규칙을 따른다.
- [ ] Contact에는 주소/지역 필드를 추가하지 않았다.
- [ ] 기존 custom region 보존과 한국 region 자동 mapping이 동작한다.

## 8. G07 Import Export Localization

- [ ] Import template request에 `locale` 계약이 있다.
- [ ] Export response file의 header/value가 사용자 설정 기준이다.
- [ ] DB 변경 없음 또는 변경 시 `BE/prisma` 기준과 한글 주석 규칙을 따른다.
- [ ] Contact export에 Phone, Phone Country, Phone E.164가 포함된다.

## 9. G08 Auth Google LINE Apple

- [ ] Auth request/response provider 값이 Google, LINE, Apple과 일치한다.
- [ ] `OAuthProvider.LINE` enum 변경이 `BE/prisma` 기준과 한글 주석 규칙을 따른다.
- [ ] verified email linking business logic이 구현됐다.
- [ ] email 없음 차단과 safe provider failure 문구가 동작한다.

## 10. G09 App Screen Translation

- [ ] 신규 Backend request/response 변경 없음이 명시되어 있다.
- [ ] 핵심 `/app` 화면의 문구가 `ko-KR`, `en`으로 동작한다.
- [ ] 긴 영어 문구가 layout을 깨지 않는다.
- [ ] DB/Prisma 변경 없음이 확인됐다.

## 11. G10 QA Document Closeout

- [ ] 08 전체 request/response 계약이 구현 결과와 일치한다.
- [ ] 08 전체 business logic과 user flow가 구현 결과와 일치한다.
- [ ] 08 전체 DB/Prisma 변경에 한글 주석/COMMENT가 있다.
- [ ] BE/FE 검증 command 결과와 미실행 사유가 기록됐다.
- [ ] AGENT 문서의 이전 정책이 갱신됐다.
