# Sales B2C Monorepo

이 저장소는 `한손에 영업 / onehand.sales`의 모노레포 루트다.

루트에는 package manager workspace를 두지 않는다. Frontend와 Backend는 각각 독립적으로 설치, 실행, 검증한다.

2026-08-24 기준 우선 타겟 국가는 한국, 미국, 캐나다다. 공개/인증 화면의 언어 선택 UI는 `ko`, `en-us`, `en-ca`만 노출한다. `ja`, `en-gb`, `en-sg`, `en-au` locale과 일본/영국/싱가포르/호주 시장은 추후 확장 후보로만 보류한다. 로그인 이후 `/app` 관리 화면은 `ko-KR`, `en` 1차 지원으로 운영한다.

## Production Origins

2026-08-25 기준 production 공개 URL:

- User Web canonical: `https://www.onehandsales.com`
- User Web apex: `https://onehandsales.com`
- User Web Vercel default/legacy: `https://onehandsales.vercel.app`
- Admin Web: `https://onehandsales-admin.vercel.app`
- Backend API: `https://onehandsales-production.up.railway.app`

`onehandsales.com`은 Vercel에서 구매/관리하며 User Web에 연결되어 있다. Frontend domain 변경은 Railway Backend, Supabase project/database region, provider secret을 자동으로 바꾸지 않는다. 상세 환경 변수 기준은 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`, Supabase/Auth provider 설정은 `BE/SUPABASE_SETUP.md`를 따른다.

## Structure

```text
AGENT/
  PM_AGENT/
  UXUI_AGENT/
  SOFTWARE_AGENT/
    FRONT_AGENT/
    BACKEND_AGENT/
    DB_SCHEMA/
FE/
  user-web/
  admin-web/
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

현재 Backend는 Auth/User, Company, Search, Trash, PublicContactRequest, ErrorReport, SupportRequest, Health 모듈을 구현한다. Company는 회사/분야/지역/메모/개인 비밀 메모와 xlsx export API를 제공한다. Search와 Trash의 현재 대상은 Company와 Company 메모 로그 범위다. 관리자 확인 API는 `GET /admin/api/me`만 제공한다.

### 2. User Web

```bash
cd FE/user-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

User Web URL: `http://localhost:5173`

User Web의 공개/인증 canonical URL은 locale prefix를 사용한다. 예: `/ko`, `/ko/login`, `/ko/pricing`, `/en-us/login`. 기존 `/`, `/login`, `/pricing` 등은 선호 locale URL로 redirect하고, 로그인 후 실제 앱 홈은 `/app`이다. User Web은 Supabase OAuth provider login, 공유 `/auth/callback`, Backend `POST /api/auth/exchange`, refresh cookie 기반 access token 재발급 흐름을 사용한다. 개발용 mock login 경로는 제거되어 있으며, 현재 노출 provider는 Google, LINE, Apple이다.


### 3. Admin Web

```bash
cd FE/admin-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

Admin Web URL: `http://localhost:5174`

Admin Web은 입력받은 Backend App access token이 관리자인지 확인한다. 현재 route는 `/login`과 보호 route `/`이며, Backend 연동은 `GET /admin/api/me`만 사용한다.

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

Playwright smoke E2E는 기본적으로 Backend와 외부 Provider를 route mock으로 대체한다. User Web E2E는 5175 포트의 Vite dev server를 테스트용으로 사용한다. Admin Web E2E는 관리자 token 통과, non-admin 차단, `GET /admin/api/me` 호출만 확인한다.

문서와 코드 변경 후에는 위 명령으로 각 실행 단위를 다시 검증한다. 출시 전 남은 품질 범위는 UX/UI 공통 QA, 모바일 브라우저 QA, Chrome/Edge QA, 다중 계정 보안 QA, DB/운영 환경 정합성 확인이다.

## External Providers


환경 변수 정본은 각 실행 단위의 `.env`와 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. Backend와 Vite가 로컬 override 파일을 읽을 수 있더라도, 공유 환경 계약은 공통 환경 문서에 기록된 변수명만 기준으로 한다.
외부 provider 에러 처리와 후속 개선 항목은 `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`에 기록한다.

- Backend Auth/DB: `DATABASE_URL`, `DIRECT_URL`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`
- Frontend Supabase/Auth: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_REDIRECT_URL`
- Encryption/session: `ENCRYPTION_MASTER_KEY`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`

로그인 국가 메타데이터는 Google/Supabase 계정 정보가 아니라 배포 프록시가 전달하는 `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country` 헤더에서 저장한다. 로컬 또는 해당 헤더가 없는 배포 환경에서는 `signupCountryCode`, `lastLoginCountryCode`가 `null`이며 화면에는 `기록 없음`으로 표시될 수 있다.


## Rules

- 루트에는 `package.json`을 두지 않는다.
- `FE`와 `BE`는 package dependency를 공유하지 않는다.
- `FE/user-web`, `FE/admin-web`은 별도 Frontend 앱이다.
- `BE`는 `/api/*`와 `GET /admin/api/me`를 제공하는 단일 NestJS 서버다.
- `AGENT`는 PM, UX/UI, Software 역할별 정본 문서 공간이다.
- `TODO`, `TODO_LOG`, `IMAGE_SAMPLE`, `UX Design`은 작업/참고 자료이며 `AGENT`를 override하지 않는다.
