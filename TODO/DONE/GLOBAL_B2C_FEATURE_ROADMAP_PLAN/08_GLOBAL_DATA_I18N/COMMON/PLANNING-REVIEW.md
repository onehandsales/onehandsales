# Planning Review

상태: 통과
검토일: 2026-07-28
검토 범위: G01 Document Contract Sync, G02 완료 후 current baseline 갱신

## 1. 판정

08 Global Data I18N은 G01 문서/계약 동기화 후 G02부터 순차 진행 가능한 수준이다.

G01에서 확인한 충돌은 문서 보정으로 해결했다. 현재 구현 코드와 08 목표가 서로 다른 상태인 항목은 “현재 runtime baseline”과 “08 목표 delta”로 분리해 기록했다.

## 2. 확인한 기준 문서

- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/UXUI_AGENT/DECISIONS/018_uxui_multilingual_font_stack.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`

## 3. G01에서 해결한 사항

- `COMMON/PLANNING-REVIEW.md`가 없던 구조 누락을 보완했다.
- `DOMAIN_GLOBAL_DATA_API.md`에 `code`, `field`, HTTP status, FE 처리 기준 중심의 Error Response 섹션을 추가했다.
- AGENT 문서의 Google-only, Apple/LINE future, provider-only 계정 판정 문구를 현재 구현 baseline과 08 목표 delta로 분리했다.
- 과거 QA/테스트 문서의 Apple/LINE future 표현은 pre-08 QA 결과로 범위를 명시하고, 08 G08에서 재검증해야 한다고 기록했다.
- `/app` route에는 locale prefix를 붙이지 않고, public-site i18n과 app i18n을 분리한다는 기준을 Frontend 기준 문서에 기록했다.
- `GOAL-IMPLEMENTATION-MATRIX.md`의 잘못된 Frontend 문서 경로를 실제 파일명인 `FRONTEND_USER_WEB.md`로 수정했다.

## 4. 현재 코드와 08 목표 차이

현재 코드 기준:

- Auth runtime provider는 Google-only다.
- `OAuthProvider.LINE`은 아직 Prisma enum에 없다.
- `User.countryCode`, `User.defaultCurrencyCode`는 G02 완료로 현재 User schema에 있다.
- Product/Deal `currencyCode`, Contact 글로벌 전화번호 필드, Company 주소/CompanyRegion code 필드는 아직 없다.
- `/app` protected route에는 locale prefix가 없다.
- public/auth URL locale i18n은 `FE/user-web/src/features/public-site/i18n` 기준이다.

08 목표 기준:

- G02에서 사용자 기본 국가/통화 설정을 추가했다.
- G03에서 `/app` 내부 app i18n을 public-site i18n과 분리한다.
- G04~G06에서 통화/전화번호/회사 지역 글로벌 필드를 순차 추가한다.
- G08에서 Google, LINE, Apple provider와 verified email linking을 구현한다.
- G10에서 AGENT/TODO 문서를 구현 결과와 다시 동기화한다.

## 5. Blocking 질문

현재 G03~G10 착수를 막는 blocking 질문은 없다.

주의 사항:

- G08의 LINE/Apple 수동 QA는 Supabase/provider 환경 설정이 필요했다. 2026-07-29 사용자 확인 기준 운영 환경 설정과 실제 OAuth 동작이 완료됐다.
- G02 이후 DB 변경 goal은 `BE/prisma/schema.prisma`, migration SQL COMMENT, seed를 함께 확인하고 한글 주석 기준을 적용해야 한다.
- G09 화면 번역은 UXUI_AGENT의 한국어 해요체와 짧은 영어 업무툴 톤을 기준으로 검토해야 한다.

## 6. 검증 기록

- `rg -n "preferredLocale|timeZone|countryCode|defaultCurrencyCode|OAuthProvider|UserOAuthAccount|currencyCode|mobile|CompanyRegion|ImportTemplate" BE FE AGENT TODO` 실행 완료.
- `cd BE; pnpm.cmd run prisma:validate` 통과.
- `git diff --check` 통과. LF/CRLF 변환 경고만 있고 whitespace error는 없다.
- 충돌 문구 재검색 결과는 과거 QA 기록, current baseline 설명, 08 목표 문구로 분류 가능하며 G02 착수 blocker가 아니다.
- G02 완료 검증으로 BE `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test -- auth user`와 FE user-web `typecheck`, `lint`, `build`가 통과했다.
