# Review Checklist

상태: In Progress - G08 Done
목적: 08 구현 후 검토자가 확인할 체크리스트

## 1. Product Scope

- [x] `/app` URL에 locale prefix가 붙지 않았다.
- [x] 1차 앱 언어가 `ko-KR`, `en`으로 제한됐다.
- [ ] `ja`, `zh-TW`, `zh-CN`이 08 범위에 섞이지 않았다.
- [x] KR/US, KRW/USD 범위를 넘는 국가/통화/전화번호가 과하게 열리지 않았다.
- [ ] 결제/세금, Admin 운영, Analytics, Backup/Restore가 08에 섞이지 않았다.
- [ ] 기존 한국 사용자 데이터가 깨지지 않았다.
- [x] public-site i18n과 app i18n이 섞이지 않았다.

## 2. UX/UI

- [ ] `AGENT/UXUI_AGENT` 기준을 따랐다.
- [ ] Notion식 workspace/page/database/detail 구조가 유지됐다.
- [ ] Attio식 CRM record/linked record 맥락이 유지됐다.
- [x] 로그인/회원가입 화면은 provider 버튼 영역만 바뀌었다.
- [x] Google, LINE, Apple 버튼이 카드형으로 보이고 순서가 맞다.
- [x] 이메일 로그인 UI가 추가되지 않았다.
- [ ] 한국어 문구는 해요체다.
- [ ] 영어 문구는 짧고 자연스럽다.
- [ ] 긴 영어 문구가 버튼/표/사이드바/모바일 화면을 깨지 않는다.

## 3. Backend API

- [ ] API spec에 계약 상태, 소비자, 호환성, request DTO, response DTO, success status가 있다.
- [ ] mutation API에 transaction 필요 여부와 rollback 범위가 있다.
- [ ] mutation/provider/batch API에 observability event key, request id, redaction 기준이 있다.
- [x] `GET /api/auth/providers`가 Google, LINE, Apple을 순서대로 반환한다.
- [x] `POST /api/auth/exchange`가 Google, LINE, Apple을 처리한다.
- [x] 같은 verified email provider 계정이 기존 User에 연결된다.
- [x] email 없는 provider 응답은 가입/로그인을 차단한다.
- [x] `PATCH /api/users/me/profile`이 글로벌 설정을 저장한다.
- [x] Product/Deal API가 `currencyCode`를 포함한다.
- [x] Contact API가 글로벌 전화번호 필드를 포함한다.
- [ ] Company/CompanyRegion API가 국가/지역 code를 포함한다.
- [x] validation error는 code/field 중심이다.
- [ ] 모든 사용자 데이터 API에 ownership 조건이 있다.

## 4. DB / Migration

- [x] 기존 migration 파일을 수정하지 않았다.
- [x] `OAuthProvider.LINE`이 추가됐다.
- [x] `User.countryCode`가 추가됐다.
- [x] `User.defaultCurrencyCode`가 추가됐다.
- [x] `Product.currencyCode`가 추가됐다.
- [x] `Deal.currencyCode`가 추가됐다.
- [x] Contact 글로벌 전화번호 필드가 추가됐다.
- [ ] `CompanyRegion.countryCode`가 추가됐다.
- [ ] `CompanyRegion.regionCode`가 추가됐다.
- [ ] Company 주소 필드가 결정된 방식대로 반영됐다.
- [ ] 기존 한국 Contact/CompanyRegion 데이터 migration이 보존 중심으로 작성됐다.
- [x] Prisma schema와 migration SQL에 한글 주석/COMMENT가 있다.

## 5. Import/Export

- [ ] Export header가 locale별로 바뀐다.
- [ ] Export 날짜/시간이 사용자 timezone 기준이다.
- [x] Export 통화 표시가 `currencyCode` 기준이다.
- [x] Contact export에 Phone, Phone Country, Phone E.164가 있다.
- [ ] Import template locale 선택이 `ko-KR`, `en`만 제공한다.
- [ ] 지원하지 않는 template locale fallback이 있다.

## 6. User Web

- [x] app i18n provider가 public-site i18n과 분리됐다.
- [x] `/app/settings` 저장 즉시 locale이 반영된다.
- [x] 날짜/시간/통화/전화번호 format utility가 중복 하드코딩을 줄인다.
- [ ] `₩`, `원`, `ko-KR`, `KRW` 하드코딩이 필요한 곳 외에는 제거됐다.
- [x] `010-0000-0000` 전용 validation copy가 KR/US 정책에 맞게 바뀌었다.
- [ ] User Web이 `/admin/api/*`를 호출하지 않는다.
- [ ] 신규/수정 FE 함수와 컴포넌트에 `// 기능 : ...` 주석이 있다.

## 7. Backend Code Quality

- [ ] 신규/수정 Backend controller 메소드에 `// API : ...` 주석이 있다.
- [ ] 신규/수정 Backend class/interface에 `// 역할 : ...` 주석이 있다.
- [ ] 신규/수정 Backend 내부 메소드에 `// 기능 : ...` 주석이 있다.
- [ ] 긴 use case에는 numbered step comment가 있다.
- [x] provider raw error, token, secret, email 원문이 log에 남지 않는다.
- [x] transaction 경계가 명확하다.

## 8. Verification

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
- [x] 모바일 390px에서 auth login provider 버튼이 깨지지 않는다.
- [ ] 모바일 360px/390px에서 settings/domain form이 깨지지 않는다.

## 9. Documentation Closeout

- [ ] README 상태가 구현 결과와 일치한다.
- [ ] API-SPEC이 구현 결과와 일치한다.
- [ ] BE-TODO/DB-SCHEMA가 구현 결과와 일치한다.
- [ ] FE-TODO/USER-WEB-TODO가 구현 결과와 일치한다.
- [ ] AGENT 문서의 이전 auth/i18n 정책이 갱신됐다.
- [x] `COMMON/GOAL-COMPLETION-CHECKLIST.md`가 갱신됐다.
- [ ] 실행하지 못한 검증은 미실행 사유를 기록했다.
