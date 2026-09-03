# BACKEND_AGENT

## 1. 목적

`BACKEND_AGENT`는 Backend 구현 방향과 엔지니어링 기준을 책임지는 문서 영역이다.

Backend 아키텍처, API 명세 작성 규칙, API 계약, transaction, observability, DB 접근 기준, 계층 구조, 테스트, 배포, 보안, 주석/로깅 규칙은 이 폴더를 기준으로 판단한다.

## 2. 관리 범위

- NestJS Backend 아키텍처
- User API와 Admin API 분리
- Clean Architecture와 DDD 계층 규칙
- API 명세와 API 계약 작성 기준
- Transaction 경계와 rollback 기준
- Structured log와 audit log 기준
- Backend 코드 컨벤션
- Backend 주석/로깅 규칙
- Backend 테스트 전략
- Backend 배포 환경
- Backend 기술 결정 기록

## 3. 폴더 구조

```text
BACKEND_AGENT/
  README.md
  ENGINEERING_REVIEW_CHECKLIST.md
  ARCHITECTURE/
  CONVENTION/
  DECISIONS/
```

## 4. 우선 확인 문서

1. `ARCHITECTURE/OVERVIEW.md`
2. `ARCHITECTURE/BACKEND.md`
3. `ARCHITECTURE/TESTING.md`
4. `ARCHITECTURE/DEPLOYMENT.md`
5. `CONVENTION/BACKEND.md`
6. `CONVENTION/API_SPEC.md`
7. `CONVENTION/API_CONTRACT.md`
8. `CONVENTION/TRANSACTION.md`
9. `CONVENTION/OBSERVABILITY.md`
10. `CONVENTION/COMMENT_AND_LOGGING.md`
11. `ENGINEERING_REVIEW_CHECKLIST.md`

## 5. 작업 원칙

- PM 범위와 UX 흐름을 먼저 확인한 뒤 Backend 구현 구조를 정한다.
- User API와 Admin API는 반드시 분리한다.
- 사용자 소유 데이터는 항상 `userId`로 필터링한다.
- Domain layer는 NestJS, Prisma, OpenAI, HTTP SDK를 몰라야 한다.
- 외부 Provider는 Backend port/interface 뒤에 둔다.
- transaction 경계는 application layer에 둔다.
- 새 API를 구현하기 전 `COMMON/API-SPEC`의 API 계약, transaction, observability 항목을 확인한다.
- mutation, Admin API, 민감정보, 외부 Provider가 포함되면 audit log와 structured log 필요 여부를 명시한다.

## 6. 현재 구현 완료/참조 Backend TODO

Snapshot date: 2026-08-24

- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/G01-BE-MEETING-NOTE-DOMAIN.goal.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/BE-TODO/G01-G12`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/BE-TODO/G01-BE-MEETING-NOTE-AI-STT-DRAFT.goal.md`
- `TODO/DONE/BUSINESS_CARD_OCR_PLAN`
- `TODO/DONE/IMPORT_TEMPLATE_PLAN`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`

Current additional backend scope:

- User Web 도움말 모달은 에러 신고 `POST /api/error-reports`와 지원 요청 `POST /api/support-requests`를 제공한다. 지원 요청은 문의 유형과 1000자 이하 본문을 `SupportRequest`에 저장한다.
- Company/Contact/Product/Deal 본문 삭제 API는 soft delete로 구현되어 있다. 삭제 시 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정하고 실제 row는 삭제하지 않는다.
- Trash API는 Company/Contact/Product/Deal 본문 데이터와 지원 로그의 목록, 상세, 7일 이내 복구를 제공한다.
- BusinessCard OCR API는 이미지 원본을 저장하지 않고 성공/실패/확정 로그와 provider 사용량을 `BusinessCardScanLog`에 기록한다. `GET /api/business-card-scans`는 반복 query 또는 comma-separated query로 상태 다중 필터를 지원하며, 목록은 등록일 최신순으로 반환한다.
- BusinessCard OCR OpenAI adapter는 Responses API와 strict JSON schema를 사용한다. prompt와 schema는 `BE/src/modules/business-card/infrastructure/providers/openai-business-card-ocr.provider.ts`에 둔다.
- DataImport API는 `ImportJob` 기반 회사/담당자/제품/딜 CSV/XLSX 업로드, AI 컬럼 매핑, 사용자 보정/검증, 셀 단위 validation 메시지, 확정 전 job 재개, confirm/cancel/expire, 확정 저장, 성공 내역 조회를 제공한다.
- DataImport 확정 전 job은 DB에 저장한다. 확정 성공 시 도메인 row와 `ImportUserLog`/`ImportUserLogRow` snapshot을 같은 transaction에서 저장한다.
- User에는 기본 timezone/preferredLocale, 사용자 기본 국가/통화인 `User.countryCode`, `User.defaultCurrencyCode`, signup/last-login locale, country code, timezone 메타데이터가 반영되어 있다.
- Auth runtime은 Supabase OAuth token exchange 이후 Backend app session을 별도로 발급하는 구조다. app access token은 `userId`/`sessionId`를 담고, refresh token 원문은 httpOnly cookie로만 내려가며 DB에는 hash만 저장한다.
- Mobile App 인증 foundation은 같은 Backend `AuthSession`을 공식 세션으로 사용한다. 단, 모바일 refresh token 원문은 httpOnly cookie가 아니라 모바일 보안 저장소에만 저장하며, Backend는 hash만 저장한다.
- Mobile App 인증 API는 웹 cookie 기반 API와 분리해 `/api/auth/mobile/exchange`, `/api/auth/mobile/refresh`, `/api/auth/mobile/logout` 계약으로 설계한다.
- Mobile App의 `deviceSlot`은 `mobile`이며, 새 모바일 기기 로그인은 기존 active mobile device/session을 교체한다.
- 신규/기존 사용자 판정은 `provider + providerUserId`를 먼저 사용한다. provider email은 Backend exchange에서 필수다.
- 현재 Auth runtime provider는 Google/LINE/Apple이다. 기존 provider 계정이 없고 같은 verified email의 기존 `User`가 있으면 새 provider 계정을 기존 User에 연결한다. Kakao는 legacy enum으로만 유지하고 runtime provider로 노출하지 않는다.
- 같은 active device 재로그인은 session row를 새로 만들지 않고 refresh token을 회전한다. 같은 slot의 다른 device login은 기존 device/session을 교체한다.
- 국가 코드 메타데이터는 배포 프록시 geo header가 있을 때만 저장되므로 local/dev에서는 `null`일 수 있다.
- 딜 import 누락 회사/담당자/제품 보정 배열은 현재 FE API와 HTTP controller/application/repository confirm 경로에 연결되어 있다.
- 08 Global Data I18N 구현 시 Backend 신규/수정 코드에는 기존 주석 규칙에 맞춰 한글 `// 기능 : ...` 또는 Prisma/migration 한글 주석을 남긴다.
- 2026-08-11 기준 Global B2C 01~11 Backend foundation은 완료 archive다. 세부 검증 이력은 각 `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/*` closeout 문서를 따른다.

## 7. 현재 주요 미구현 Backend 범위

- Paddle/Billing, subscription, payment, tax, invoice, refund, entitlement, paywall
- Billing Admin과 B2B tenant/team admin
- native CRM/PWA packaging, native push/contact/calendar
- 7일 이후 유료 복구 API와 영구 삭제 운영 mutation
- 민감 데이터 포함 export
- Series A급 AI/리텐션 고도화 기능

범용 ExportJob은 현재 제품 방향에서 사용하지 않는다. Company/Contact/Product/Deal xlsx export는 각 도메인 Backend 모듈 안에서 구현되어 있다.

## 8. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/PM_AGENT/DECISIONS/030_global_b2c_closeout_and_paddle_defer.md`
- `TODO/PADDLE_PLAN/README.md`
