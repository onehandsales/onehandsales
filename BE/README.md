# BE

백엔드 앱이다.

## 기술 스택

- NestJS
- Prisma
- Supabase/PostgreSQL
- DDD
- Clean Architecture
- Modular Monolith

## API 분리 기준

- 사용자 API: `/api/*`
- 관리자 확인 API: `GET /admin/api/me`

관리자 확인 API는 반드시 Admin guard로 보호한다.

## 현재 구현 모듈

- `auth`: 외부 인증 토큰 교환, Backend App token refresh/logout, 현재 사용자 조회, 기기/session 관리, 로그인 locale/region 메타데이터 동기화
- `user`: 현재 사용자 profile, 기본 timezone/locale 수정, 등록 기기 조회
- `company`: 사용자 소유 회사, 회사 분야/지역, 일반 메모 로그, 개인 비밀 메모 로그, 연결 담당자/딜 조회, xlsx export
- `contact`: 사용자 소유 담당자, 회사 옵션, 담당자 부서/직급, 일반 메모 로그, 개인 비밀 메모 로그, 연결 딜 조회, xlsx export
- `product`: 사용자 소유 제품, 제품 카테고리/상태, 일반 메모 로그, 개인 비밀 메모 로그, 연결 딜 조회, xlsx export
- `deal`: 사용자 소유 딜, 회사/담당자/제품 연결, `DealActivity`, 다음 행동 로그, 메모 로그, Trash 복구, xlsx export
- `analytics`: 제품 분석 client event 수집, activation/retention snapshot
- `search`: 회사/담당자/제품/딜 통합검색
- `trash`: 회사/담당자/제품/딜과 지원 로그의 휴지통 목록/상세/7일 이내 복구
- `health`: health check


## 로컬 실행

백엔드는 별도 터미널에서 실행한다.

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
pnpm install
# .env를 로컬/배포 환경에 맞게 작성
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run start:dev
```

로컬 URL: `http://localhost:3000`

헬스 체크: `GET /api/health`

환경 변수 정본은 `BE/.env`와 `../AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. 현재 Backend bootstrap은 로컬 편의를 위해 `BE/.env` 다음 `BE/.env.local`을 읽을 수 있지만, 공유 환경 계약은 공통 환경 문서의 변수명만 기준으로 한다. 실제 secret 값은 문서나 로그에 기록하지 않는다.

## 운영 배포

현재 production API origin은 `https://onehandsales-production.up.railway.app`이다. User Web custom domain `https://www.onehandsales.com`은 Frontend Vercel project에 연결된 domain이며, Backend hosting이나 Supabase database region을 자동으로 바꾸지 않는다.

production 공개 origin 기준:

```text
APP_ALLOWED_ORIGINS="https://www.onehandsales.com,https://onehandsales.com,https://onehandsales.vercel.app,https://onehandsales-admin.vercel.app"
USER_WEB_ORIGIN="https://www.onehandsales.com"
ADMIN_WEB_ORIGIN="https://onehandsales-admin.vercel.app"
API_PUBLIC_ORIGIN="https://onehandsales-production.up.railway.app"
```

`APP_REFRESH_COOKIE_DOMAIN`은 API가 Railway 기본 domain에 있는 동안 비워둔다. `https://api.onehandsales.com`으로 이전한 뒤에만 `.onehandsales.com` 설정을 검토한다.

## API 호출 예제

- 회사 도메인: `restdoc/company-domain.http`
- 담당자 도메인: `restdoc/contact-domain.http`
- 제품 도메인: `restdoc/product-domain.http`
- 전체 API 한 줄 설명: `../AGENT/SOFTWARE_AGENT/COMMON/API_SAMPLE.md`

## DB

Docker Compose는 PostgreSQL 17을 `localhost:5432`에 띄우고, init SQL로 `sales_b2c_test`도 만든다.

주요 명령:

```bash
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run db:dev:down
```

CI/배포처럼 이미 migration 파일을 적용해야 하는 환경에서는 `pnpm run prisma:migrate:deploy`를 사용한다.

현재 seed는 local mock Auth 사용자와 session만 만든다.
회사/담당자/제품 개인 비밀 메모 API를 사용하려면 `.env`에 `COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY`, `CONTACT_PRIVATE_MEMO_ENCRYPTION_KEY`, `PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY` 또는 공통 `ENCRYPTION_MASTER_KEY`를 채워야 한다.

## 검증

```bash
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

2026-07-10 기준 위 검증은 모두 통과했다. `pnpm test`는 17 suites / 82 tests passed 상태다.

## 외부 Provider

기본 Backend 테스트는 외부 Provider를 실제 호출하지 않는다. 실제 Supabase Auth smoke가 필요하면 `.env`에 credential을 채운 뒤 별도 smoke로 확인한다.

local에서 최소 서버만 띄울 때도 `DATABASE_URL`, `DIRECT_URL`, token secret 값은 실제 안전한 값으로 채우는 것을 권장한다. `TEST_DATABASE_URL`은 테스트 DB를 별도로 검증할 때 사용한다.

Auth runtime 기준:

- Frontend는 Supabase OAuth로 provider login을 수행하고, Backend `POST /api/auth/exchange`는 Supabase access token을 검증해 내부 `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`을 생성/갱신한다.
- 현재 runtime provider는 Google, LINE, Apple이다. Kakao는 Prisma enum legacy 값으로만 남고 runtime provider로 노출하지 않는다.
- 신규/기존 provider 계정 판단은 `provider + providerUserId`를 먼저 사용한다. provider 계정이 없고 같은 verified email의 기존 `User`가 있으면 새 provider 계정을 기존 사용자에 연결한다.
- provider verified email은 exchange에 필요하며, provider 원문 오류나 token은 응답/로그에 노출하지 않는다.
- 앱 refresh token 원문은 httpOnly cookie로만 내려가며 DB에는 hash만 저장한다.
- 같은 auth device의 재로그인은 새 session row를 만들지 않고 refresh token을 rotation한다.
- User Web은 현재 `mobile`, `personal_laptop` slot을 사용하고, 같은 slot의 다른 기기가 로그인하면 기존 active device/session을 교체한다.
- `preferredLocale`과 `timeZone`은 신규 사용자 생성 시 저장된다. 기존 사용자의 `timeZone`은 로그인 때 덮어쓰지 않고 `lastLoginTimeZone`만 갱신한다.
- `signupCountryCode`, `lastLoginCountryCode`는 `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country` 같은 배포 프록시 헤더가 있을 때만 저장된다. 로컬이나 해당 헤더가 없는 환경에서는 `null`일 수 있다.


## 정본 규칙

- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
