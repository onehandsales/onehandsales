# Sales B2C Monorepo

이 저장소는 `한손에 영업 / onehand.sales`의 모노레포 루트다.

루트에는 package manager workspace를 두지 않는다. Frontend와 Backend는 각각 독립적으로 설치, 실행, 검증한다.

2026-08-24 기준 우선 타겟 국가는 한국, 미국, 캐나다다. 공개/인증 화면의 언어 선택 UI는 `ko`, `en-us`, `en-ca`만 노출한다. `ja`, `en-gb`, `en-sg`, `en-au` locale과 일본/영국/싱가포르/호주 시장은 추후 확장 후보로만 보류한다. 로그인 이후 `/app` 관리 화면은 `ko-KR`, `en` 1차 지원으로 운영한다.

2026-09-03 기준 모바일 앱은 Expo/React Native 기반으로 문서화한다. 현재 모바일 1차 범위는 전체 CRM 구현이 아니라 로그인/회원가입, Backend 모바일 인증 세션, 앱 시작 시 세션 복구, `/api/me`, 최소 `HomeScreen`, 로그아웃이다.

## Production Origins

2026-08-25 기준 production 공개 URL:

- User Web canonical: `https://www.onehandsales.com`
- User Web apex: `https://onehandsales.com`
- User Web Vercel default/legacy: `https://onehandsales.vercel.app`
- Admin Web: `https://onehandsales-admin.vercel.app`
- Backend API: `https://onehandsales-production.up.railway.app`
- Mobile App: App Store, Play Store, EAS Build, production deep link 정책은 아직 확정하지 않는다.

`onehandsales.com`은 Vercel에서 구매/관리하며 User Web에 연결되어 있다. Frontend domain 변경은 Railway Backend, Supabase project/database region, provider secret을 자동으로 바꾸지 않는다. 상세 환경 변수 기준은 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`, Supabase/Auth provider 설정은 `BE/SUPABASE_SETUP.md`를 따른다.

## Structure

```text
AGENT/
  PM_AGENT/
  UXUI_AGENT/
  SOFTWARE_AGENT/
    FRONT_AGENT/
    MOBILE_AGENT/
    BACKEND_AGENT/
    DB_SCHEMA/
FE/
  user-web/
  admin-web/
  mobile-app/
BE/
TODO/
TODO_LOG/
IMAGE_SAMPLE/
UX Design/
```

## Quick Start

전제 조건:

- Node.js 24 LTS
- pnpm 8.x
- Docker Desktop 또는 호환 Docker runtime

### 1. Backend

```bash
cd BE
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run start:dev
```

Backend URL: `http://localhost:3000`

Health check:

```bash
curl http://localhost:3000/api/health
```

현재 Backend는 Auth/User, Company, Contact, BusinessCard OCR, Product, Deal, Schedule, MeetingNote, Search, Trash, DataImport 모듈을 구현한다. Company/Contact/Product/Deal은 각 도메인별 xlsx export API를 제공하고, Company/Contact/Product 상세에서는 연결 딜 조회 API를 사용한다. DataImport는 회사/담당자/제품/딜 CSV/XLSX 업로드, AI 컬럼 매핑, 사용자 보정, 셀 단위 validation 메시지, 확정 저장, 성공 내역 조회를 제공한다. Admin API는 11 Admin Operation foundation 기준으로 `/admin/api/me`, 사용자 조회, 사용자 도메인/휴지통 조회, provider failure, analytics, account request, Trash recovery request, audit log, system operation check 계열을 제공한다.

### 2. User Web

```bash
cd FE/user-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

User Web URL: `http://localhost:5173`

User Web의 공개/인증 canonical URL은 locale prefix를 사용한다. 예: `/ko`, `/ko/login`, `/ko/pricing`, `/en-us/login`. 기존 `/`, `/login`, `/pricing` 등은 선호 locale URL로 redirect하고, 로그인 후 실제 앱 홈은 `/app`이다. User Web은 Supabase OAuth provider login, 공유 `/auth/callback`, Backend `POST /api/auth/exchange`, refresh cookie 기반 access token 재발급 흐름을 사용한다. 개발용 mock login 경로는 제거되어 있으며, 현재 노출 provider는 Google, LINE, Apple이다.

명함 스캔은 `/app/business-cards`에서 실제 API와 연결되어 있다. 사용자는 이미지를 업로드한 뒤 `명함스캔` 진행 표시를 보고, 추출 결과를 확인/수정한 후 회사/담당자로 저장한다.

데이터 불러오기는 `/app/import`에서 실제 API와 연결되어 있다. 사용자는 회사/담당자/제품/딜 양식을 내려받고, CSV/XLSX 파일을 업로드한 뒤 AI 매핑과 row 검증 결과를 확인/수정하고 확정 저장할 수 있다. 필수값 누락 메시지는 누락된 셀에만 표시한다. `/app/export`의 범용 Export 화면은 현재 Backend 방향이 아니므로 숨긴다. `/app/notifications`는 실제 Notification API와 연결되어 있다. 회사/담당자/제품/딜/회의록 생성은 목록 맥락의 `/new` 라우트와 패널에서 확대한 `/new/full` 라우트를 함께 가진다.

### 3. Admin Web

```bash
cd FE/admin-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

Admin Web URL: `http://localhost:5174`

Admin Web은 11 Admin Operation foundation 기준의 운영 route를 제공한다. 활성 route는 `/users`, `/users/:userId`, `/users/:userId/domain`, `/users/:userId/trash`, `/provider-failures`, `/account-requests`, `/trash/recovery-requests`, `/analytics`, `/audit-logs`, `/system`이다. `/organizations`, `/subscriptions`, `/support`는 Billing Admin, B2B tenant/team admin, support console 확정 전까지 `/`로 redirect한다.

### 4. Mobile App

```bash
cd FE/mobile-app
# 현재 코드는 문서 확정 이후 재생성할 수 있다.
pnpm install
pnpm run start
```

Mobile App은 Expo/React Native 기반이다. 공식 인증 세션은 Supabase session이 아니라 Backend `AuthSession`이며, 모바일 인증 API는 `/api/auth/mobile/exchange`, `/api/auth/mobile/refresh`, `/api/auth/mobile/logout`, `/api/me` 계약을 기준으로 한다. `mobileRefreshToken`은 secure storage의 `onehand.mobile.auth.mobileRefreshToken` key에만 저장하고, access token은 메모리에만 보관한다.

모바일 로그인/회원가입 UX는 user-web의 브라우저 모바일 auth 화면을 기준으로 React Native + NativeWind로 재구현한다. CRM 전체 화면은 1차 범위에 포함하지 않는다. 정본 문서는 `AGENT/SOFTWARE_AGENT/MOBILE_AGENT`다.

## Verification

각 앱은 독립적으로 검증한다.

Backend:

```bash
cd BE
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

User Web:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Admin Web:

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

Mobile App:

```bash
cd FE/mobile-app
pnpm run typecheck
```

Playwright smoke E2E는 기본적으로 Backend와 외부 Provider를 route mock으로 대체한다. User Web E2E는 5175 포트의 Vite dev server를 테스트용으로 사용한다. Admin Web의 `test:e2e` 스크립트와 파일은 남아 있지만 과거 운영 화면 기대값을 포함하므로, 현재 라우터 기준으로 갱신하기 전까지 Admin release gate는 `typecheck`, `lint`, `build`와 관리자 인증 수동 smoke다.

2026-07-10 기준 BE `typecheck`, `lint`, `test`, `build`, FE/user-web `typecheck`, `lint`, `build`, `test:e2e`, FE/admin-web 선택 점검 `typecheck`, `lint`, `build`가 통과했다. 핵심 업무 happy path, URL locale smoke, API/security smoke도 통과했다. 출시 전 남은 품질 범위는 UX/UI 공통 QA, 모바일 브라우저 QA, Mobile App 인증 foundation QA, Chrome/Edge QA, 다중 계정 보안 QA, DB/운영 환경 정합성 확인이다.

## External Providers

기본 local smoke와 unit test는 OpenAI, OCR, Supabase Auth를 실제 호출하지 않는다. 실제 provider 검증이 필요할 때는 각 앱의 `.env`를 채우고 별도 smoke로 확인한다. 현재 Supabase OAuth runtime provider는 Google, LINE, Apple이며, Kakao login은 제품 로그인 기능에서 제거되어 legacy enum/과거 데이터 호환용으로만 유지한다.

환경 변수 정본은 각 실행 단위의 `.env`와 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. Backend와 Vite가 로컬 override 파일을 읽을 수 있더라도, 공유 환경 계약은 공통 환경 문서에 기록된 변수명만 기준으로 한다.
외부 provider 에러 처리와 후속 개선 항목은 `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`에 기록한다.

- Backend Auth/DB: `DATABASE_URL`, `DIRECT_URL`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`
- Frontend Supabase/Auth: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_REDIRECT_URL`
- OpenAI/OCR/AI mapping: `OPENAI_API_KEY`, `OPENAI_MEETING_NOTE_DRAFT_MODEL`, `OPENAI_MEETING_NOTE_STT_MODEL`, `OPENAI_BUSINESS_CARD_OCR_MODEL`, `OPENAI_IMPORT_MAPPING_MODEL`
- Encryption/session: `ENCRYPTION_MASTER_KEY`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`

로그인 국가 메타데이터는 Google/Supabase 계정 정보가 아니라 배포 프록시가 전달하는 `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country` 헤더에서 저장한다. 로컬 또는 해당 헤더가 없는 배포 환경에서는 `signupCountryCode`, `lastLoginCountryCode`가 `null`이며 화면에는 `기록 없음`으로 표시될 수 있다.

MeetingNote AI 초안 생성과 STT는 Backend에서 별도 provider port로 분리되어 있다. AI 초안 생성은 OpenAI를 기본으로 사용하고, STT는 현재 OpenAI adapter를 쓰되 provider 교체 시 STT adapter만 바꾸는 구조다.

BusinessCard OCR도 별도 provider port 뒤에 있으며, 현재 OpenAI Responses API와 strict JSON schema 응답을 사용한다. prompt와 응답 schema는 `BE/src/modules/business-card/infrastructure/providers/openai-business-card-ocr.provider.ts`에 있다.

DataImport 컬럼 자동 매핑도 별도 provider port 뒤에 있으며, 현재 OpenAI Responses API를 사용한다. `OPENAI_IMPORT_MAPPING_MODEL`이 비어 있으면 `OPENAI_MEETING_NOTE_DRAFT_MODEL`, 그다음 기본 모델 순서로 fallback한다.

## Rules

- 루트에는 `package.json`을 두지 않는다.
- `FE`와 `BE`는 package dependency를 공유하지 않는다.
- `FE/user-web`, `FE/admin-web`, `FE/mobile-app`은 별도 Frontend 앱이다.
- `BE`는 `/api/*`와 `/admin/api/*`를 제공하는 단일 NestJS 서버다.
- 모바일 앱의 구현 기준은 `AGENT/SOFTWARE_AGENT/MOBILE_AGENT`를 따른다.
- 모바일 앱은 Backend User API인 `/api/*`만 호출하고 `/admin/api/*`를 호출하지 않는다.
- 모바일 앱은 Supabase DB/Storage에 직접 접근하지 않는다.
- `AGENT`는 PM, UX/UI, Software 역할별 정본 문서 공간이다.
- `TODO`, `TODO_LOG`, `IMAGE_SAMPLE`, `UX Design`은 작업/참고 자료이며 `AGENT`를 override하지 않는다.
