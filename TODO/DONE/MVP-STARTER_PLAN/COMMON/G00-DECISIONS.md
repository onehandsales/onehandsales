# G00 구현 전 결정 기록

## 1. 목적

이 문서는 `MVP-STARTER_PLAN`의 첫 번째 `/goal`인 G00에서 확정해야 하는 운영, API, DB, 보안, 외부 연동 정책을 기록한다.

G00의 목적은 G01 이후 구현자가 기술 선택이나 정책 선택을 다시 질문하지 않고 바로 구현할 수 있게 하는 것이다.

## 2. 확정된 결정

### D01. G00 범위

결정:

- G00은 package manager, Node 버전, local DB 같은 기술 결정만 다루지 않는다.
- G00은 API/DB 정책, 인증/session, 삭제/복구, 민감정보, Admin masking, Import/Export, 외부 provider 실제 연동 범위까지 함께 확정한다.

이유:

- TODO 문서는 바로 실행 가능한 계획서여야 한다.
- API/DB 정책이 비어 있으면 G01 이후 구현자가 임의로 선택하게 된다.
- 구현자가 임의로 선택하면 FE/BE 계약, DB schema, 테스트 기준이 서로 달라질 수 있다.

### D02. Package Manager

결정:

- MVP Starter의 Node.js 기반 프로젝트는 package manager를 `pnpm`으로 고정한다.

package manager 의미:

- Node.js 프로젝트에서 library 설치, dependency version 고정, lockfile 관리, script 실행을 담당하는 도구다.
- 예시는 `npm`, `yarn`, `pnpm`이다.

`pnpm` 사용 예시:

```bash
pnpm install
pnpm add react
pnpm run dev
pnpm run build
pnpm run test
```

`pnpm`을 선택한 이유:

- `BE`, `FE/user-web`, `FE/admin-web`처럼 여러 Node.js 프로젝트가 함께 있을 때 설치 방식과 lockfile 기준을 통일하기 좋다.
- 디스크 사용량이 적고 설치 속도가 빠르다.
- 의존성을 엄격하게 관리해 숨은 dependency에 기대는 실수를 줄인다.

구현 영향:

- G01, G02, G03에서 생성되는 Node.js 프로젝트는 `pnpm` 기준으로 dependency를 설치한다.
- 문서와 완료 기준의 실행 명령은 `pnpm install`, `pnpm run dev`, `pnpm run build`, `pnpm run test` 형식을 우선 사용한다.
- repository에는 `pnpm-lock.yaml`을 기준 lockfile로 둔다.

### D03. Node.js Version

결정:

- MVP Starter의 Node.js 버전은 `Node.js 24 LTS`로 고정한다.

Node.js 의미:

- Node.js는 TypeScript/JavaScript 기반 Backend와 Frontend 개발 도구를 실행하는 runtime이다.
- 이 프로젝트에서는 NestJS Backend, Vite React, Prisma, pnpm script가 모두 Node.js 위에서 실행된다.

`Node.js 24 LTS`를 선택한 이유:

- 2026-06-04 기준 Node.js 24.x는 Active LTS 상태다.
- 새 프로젝트이므로 오래된 LTS보다 현재 LTS를 기준으로 시작하는 편이 dependency, tooling, CI 기준을 맞추기 쉽다.
- Node 버전을 고정하면 개발자 PC, local 실행, CI, 배포 환경의 설치/빌드 차이를 줄일 수 있다.

구현 영향:

- repository 루트와 Node.js 앱에는 `.nvmrc` 또는 동일 역할의 버전 고정 파일을 둘 때 `24`를 사용한다.
- `package.json`의 `engines.node`는 `>=24 <25` 기준으로 둔다.
- CI를 만들 경우 Node.js 24를 사용한다.
- 문서와 설치 안내는 Node.js 24 LTS를 전제로 작성한다.

참고:

- Node.js Release Working Group: `https://github.com/nodejs/release`

### D04. Local DB 실행 방식

결정:

- MVP Starter의 local DB 실행 방식은 `Docker PostgreSQL`로 고정한다.

local DB 의미:

- local DB는 개발자 PC에서 개발, Prisma migration, seed, API 테스트, E2E 테스트를 수행하기 위한 개발용 데이터베이스다.
- 운영 DB가 아니며, 개발 중 schema 변경과 test data reset을 안전하게 반복하기 위한 환경이다. 실제 dev/preview/prod managed business DB는 Supabase Cloud PostgreSQL을 사용한다.

`Docker PostgreSQL` 의미:

- PostgreSQL을 개발자 PC에 직접 설치하지 않고 Docker container로 실행한다.
- Backend와 Prisma는 local Docker container의 PostgreSQL에 접속한다.
- 기본 실행 형태는 `docker compose up -d db` 같은 명령으로 DB container를 띄우는 방식이다.

`Docker PostgreSQL`을 선택한 이유:

- Prisma migration, relation, index, transaction을 실제 PostgreSQL 기준으로 검증할 수 있다.
- 개발자가 운영/원격 DB를 건드리지 않고 schema 변경과 seed를 반복할 수 있다.
- local 환경이 Docker Compose 기준으로 재현되어 개발자 PC 차이를 줄인다.
- Supabase Cloud PostgreSQL 같은 managed PostgreSQL 운영 DB로 옮길 때 DB 구조 전환 비용이 낮다.
- local 개발 중 원격 Supabase Cloud DB를 실수로 변경하는 위험을 줄인다.

구현 영향:

- G01-G04에서는 local PostgreSQL container를 기준으로 Backend DB 연결과 Prisma 설정을 작성한다.
- G04의 Prisma schema validate, migration 또는 db push, seed 실행은 Docker PostgreSQL을 대상으로 한다.
- `.env.example`의 `DATABASE_URL`은 local Docker PostgreSQL 접속 예시를 포함한다.
- dev/preview/prod 환경의 `DATABASE_URL`과 `DIRECT_URL`은 Supabase Cloud PostgreSQL 접속값을 사용한다.
- `docker-compose.yml` 또는 동일 역할의 compose 파일은 DB service를 포함해야 한다.
- 개발/테스트 데이터는 local DB에서 reset 가능해야 한다.

### D05. PostgreSQL Docker Image Version

결정:

- MVP Starter의 PostgreSQL Docker image version은 `postgres:17-alpine`으로 고정한다.

PostgreSQL Docker image version 의미:

- Docker Compose에서 local PostgreSQL container를 실행할 때 사용할 image tag다.
- 예시는 `postgres:16-alpine`, `postgres:17-alpine`, `postgres:18-alpine`이다.

설정 예시:

```yaml
services:
  db:
    image: postgres:17-alpine
```

`postgres:17-alpine`을 선택한 이유:

- PostgreSQL 17은 현재 지원 중인 안정적인 major version이다.
- PostgreSQL 18보다 managed DB, extension, tooling 호환성 확인 부담이 낮다.
- PostgreSQL 16보다 새 프로젝트 기준으로 오래 사용할 수 있는 기간이 길다.
- `alpine` 이미지는 local 개발용 container image 크기를 줄이는 데 유리하다.

구현 영향:

- `docker-compose.yml` 또는 동일 역할의 compose 파일에서 DB image는 `postgres:17-alpine`을 사용한다.
- Prisma migration, seed, local API 테스트는 PostgreSQL 17 기준으로 검증한다.
- 운영 DB인 Supabase Cloud PostgreSQL과도 PostgreSQL 17 이상 호환성을 기준으로 본다.

참고:

- PostgreSQL Versioning Policy: `https://www.postgresql.org/support/versioning/`

### D06. Local DB 세부값

결정:

- local 개발 DB 이름은 `sales_b2c_dev`로 고정한다.
- local 테스트 DB 이름은 `sales_b2c_test`로 고정한다.
- local DB user는 `sales_b2c`로 고정한다.
- local DB password는 `sales_b2c_password`로 고정한다.
- local PostgreSQL port는 `5432`로 고정한다.
- 개발 DB와 테스트 DB는 분리한다.
- 환경 변수는 `DATABASE_URL`, `DIRECT_URL`, `TEST_DATABASE_URL`을 사용한다.

local DB 세부값 의미:

- local DB 세부값은 Docker PostgreSQL container를 실행하고 Prisma가 접속하기 위한 개발용 접속 기준이다.
- 운영 비밀번호가 아니며, local 개발 환경 재현성을 위한 값이다.

환경 변수 예시:

```env
DATABASE_URL="postgresql://sales_b2c:sales_b2c_password@localhost:5432/sales_b2c_dev"
DIRECT_URL="postgresql://sales_b2c:sales_b2c_password@localhost:5432/sales_b2c_dev"
TEST_DATABASE_URL="postgresql://sales_b2c:sales_b2c_password@localhost:5432/sales_b2c_test"
```

Docker Compose 예시:

```yaml
services:
  db:
    image: postgres:17-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: sales_b2c
      POSTGRES_PASSWORD: sales_b2c_password
      POSTGRES_DB: sales_b2c_dev
```

개발 DB와 테스트 DB를 분리하는 이유:

- 개발 중 수동으로 넣은 데이터와 자동 테스트 데이터가 섞이지 않게 한다.
- 테스트 실행이 개발 데이터를 삭제하거나 변경하는 위험을 줄인다.
- E2E, integration test에서 DB reset을 안전하게 수행할 수 있다.

구현 영향:

- `.env.example`에는 `DATABASE_URL`, `DIRECT_URL`, `TEST_DATABASE_URL`을 모두 작성한다.
- Prisma migration과 seed 기본 대상은 `DATABASE_URL`의 `sales_b2c_dev`다.
- test command와 integration/E2E test는 `TEST_DATABASE_URL`의 `sales_b2c_test`를 사용한다.
- Docker Compose에서 `sales_b2c_test` database 생성이 필요하면 init script 또는 setup script를 둔다.

### D07. Supabase 사용 범위와 인증/DB 1차 전략

결정:

- MVP 1차에서는 Supabase Cloud를 `Auth`, `PostgreSQL`, D15의 파일 저장소 adapter에 사용한다.
- MVP 1차의 managed business DB는 Supabase Cloud PostgreSQL이다.
- NestJS Backend는 Prisma로 Supabase Cloud PostgreSQL에 직접 접속하고, 여러 table write의 transaction boundary는 application layer에서 관리한다.
- local/integration/E2E test DB는 재현성과 안전한 reset을 위해 Docker PostgreSQL을 사용할 수 있다.
- Supabase Realtime, Edge Functions, FE Supabase DB direct access, PostgREST 기반 business write는 MVP 1차 구현 범위에서 제외한다.
- Supabase Storage는 파일 저장소 구현체로만 예외 사용하고, domain/application 계층은 `StoragePort`에만 의존한다.
- 인증 1차 전략은 `Supabase Auth 외부 Provider + Backend token exchange + Backend 발급 App Bearer Token + local User/AuthDevice/AuthSession`으로 고정한다.

Supabase Cloud 사용 의미:

- 소셜 로그인 provider 연동, OAuth 인증 화면, Supabase session 발급은 Supabase Auth가 담당한다.
- User Web과 Admin Web은 Supabase Auth client를 통해 provider 로그인과 callback 처리를 수행한다.
- FE는 Supabase Auth session에서 access token을 얻고 Backend의 token exchange API에만 전달한다.
- Backend는 token exchange 단계에서 Supabase JWKS/JWT issuer 기준으로 외부 token을 검증하고, `supabaseUserId`, `email`, `provider`를 기준으로 local `User`, `UserOAuthAccount`, `UserSetting`, `AuthDevice`, `AuthSession`을 조회하거나 생성한다.
- Backend는 exchange 성공 시 서비스 자체 `App access token`과 refresh 수단을 발급한다.
- 이후 모든 business API와 Admin API는 Supabase access token이 아니라 Backend가 발급한 `App access token`을 `Authorization: Bearer <app_access_token>` header로 받는다.
- 서비스의 회사, 담당자, 제품, 딜, 일정, 회의록, 추후 구독/결제 같은 business data는 Supabase Cloud PostgreSQL과 Prisma schema가 관리한다.
- FE는 business data를 Supabase client로 직접 읽거나 쓰지 않고, 항상 NestJS API를 호출한다.
- NestJS application layer는 Prisma transaction 또는 `TransactionManager` port로 결제/구독, 감사 로그, outbox 같은 다중 write를 같은 transaction에서 처리한다.
- 명함 이미지, Import 원본 파일, Export 생성 파일은 D15의 `StoragePort` 뒤에서 Supabase Storage에 저장할 수 있다.
- DB에는 Supabase Storage public URL에 직접 묶이는 값이 아니라 bucket, object key, content type, file size 같은 중립 metadata를 저장한다.

선택 이유:

- OAuth와 소셜 로그인 provider 처리는 Supabase Auth에 맡겨 구현 속도를 높일 수 있다.
- Supabase Cloud PostgreSQL은 managed PostgreSQL이므로 별도 DB 운영 부담을 줄이면서 Prisma transaction을 사용할 수 있다.
- business data는 NestJS/Prisma/Clean Architecture 기준으로 통제할 수 있다.
- 추후 구독/결제가 붙어도 결제 상태, 구독 상태, audit/outbox 기록을 Backend application transaction으로 묶을 수 있다.
- Backend의 domain/application/infrastructure 경계를 유지하면서 Auth, DB, Storage를 각각 adapter와 repository 뒤에 둘 수 있다.
- FE/BE가 분리된 배포 구조에서도 cookie sameSite, cross-site cookie, CSRF token 흐름에 덜 묶인다.
- Backend API 인증이 Supabase token shape에 직접 묶이지 않으므로, 나중에 Supabase Auth를 자체 Auth 또는 다른 OAuth/OIDC provider로 교체하기 쉽다.
- local `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`이 서비스 인증의 중심이 되므로 business data 소유권과 운영 정책을 Backend가 통제할 수 있다.

구현 영향:

- FE는 Supabase Auth client를 초기화하고, 로그인 callback 이후 `POST /api/auth/exchange`를 호출해 Backend App token을 발급받는다.
- Backend `ExternalAuthVerifier` port는 Supabase token을 검증한다. 이 port 뒤의 구현을 바꾸면 다른 provider 또는 자체 Auth로 이전할 수 있어야 한다.
- Backend `AppTokenIssuer`는 서비스 자체 access token을 발급한다.
- Backend `AuthGuard`는 `Authorization: Bearer` header의 App access token을 검증해 현재 사용자 context를 만든다.
- `POST /api/auth/exchange`는 외부 provider token의 user 정보와 FE가 보낸 기기 정보를 기준으로 local `User`, `UserOAuthAccount`, `UserSetting`, `AuthDevice`, `AuthSession`을 생성하거나 갱신한다.
- Admin API는 App Bearer Token 검증 후 local `User.role = ADMIN`을 `AdminGuard`에서 확인한다.
- Prisma datasource는 PostgreSQL provider를 사용하고, local/test에서는 Docker PostgreSQL, dev/preview/prod에서는 Supabase Cloud PostgreSQL의 `DATABASE_URL`/`DIRECT_URL`을 사용한다.
- Application layer에는 transaction boundary를 명시하고, infrastructure layer의 Prisma repository가 같은 transaction client를 공유할 수 있게 만든다.
- `UserOAuthAccount`는 Supabase user id와 provider account 정보를 local user와 연결하기 위한 매핑 용도로 사용한다.
- Backend는 Supabase access token 원문과 Supabase refresh token을 DB에 저장하지 않는다.
- Backend refresh token 또는 session token은 원문을 저장하지 않고 hash만 저장한다.
- `.env.example`에는 Supabase Auth, Supabase Cloud PostgreSQL, Supabase Storage 연결에 필요한 환경 변수를 포함한다.
- App access token은 FE memory에만 저장한다.
- refresh token은 httpOnly refresh cookie로 보관하고, DB에는 `AuthSession.refreshTokenHash`만 저장한다.
- API client가 401을 받으면 `POST /api/auth/refresh`를 1회 호출해 새 App access token을 받은 뒤 원래 요청을 1회 재시도한다.
- 파일 저장은 Backend `StoragePort`가 담당하며, Supabase Storage SDK는 infrastructure adapter 내부에서만 사용한다.

환경 변수 후보:

```env
DATABASE_URL=""
DIRECT_URL=""
TEST_DATABASE_URL=""
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
SUPABASE_JWT_ISSUER=""
SUPABASE_JWKS_URL=""
APP_JWT_ISSUER=""
APP_JWT_AUDIENCE=""
APP_JWT_SECRET=""
APP_ACCESS_TOKEN_TTL_MINUTES=""
APP_SESSION_TTL_DAYS="7"
APP_REFRESH_COOKIE_NAME="sales_b2c_refresh"
APP_REFRESH_TOKEN_SECRET=""
INITIAL_ADMIN_EMAILS=""
STORAGE_PROVIDER="supabase"
SUPABASE_SERVICE_ROLE_KEY=""
# Current BusinessCard OCR implementation does not store uploaded images.
SUPABASE_STORAGE_BUCKET_IMPORTS="imports"
SUPABASE_STORAGE_BUCKET_EXPORTS="exports"
ENCRYPTION_MASTER_KEY=""
ENCRYPTION_KEY_VERSION="v1"
```

### D08. FE token 전달/보관 방식

결정:

- FE는 Backend API 호출 시 Backend가 발급한 App access token을 `Authorization: Bearer <token>` header로 전달한다.
- User Web API client와 Admin Web API client는 Supabase access token을 business API에 전달하지 않는다.
- Supabase access token은 `POST /api/auth/exchange`에서 App token을 발급받기 위한 외부 인증 증명으로만 사용한다.
- Backend API 호출은 cookie 인증용 `credentials: "include"`를 기본 전제로 하지 않는다.
- App Bearer Token은 browser가 자동 전송하지 않으므로 cookie 기반 CSRF 방어는 MVP 1차 API 인증의 필수 전제가 아니다.
- App access token은 FE memory에만 저장한다.
- refresh token은 httpOnly refresh cookie로 보관하고, DB에는 `AuthSession.refreshTokenHash`만 저장한다.
- refresh cookie는 `HttpOnly`, `SameSite=Lax`, `Path=/api/auth/refresh` 기준으로 발급한다.
- HTTPS 환경에서는 refresh cookie에 `Secure=true`를 적용한다.
- refresh endpoint는 cookie 자동 전송을 사용하므로 허용된 User Web/Admin Web origin만 통과시키는 Origin 검증을 적용한다.
- API client가 401을 받으면 `POST /api/auth/refresh`를 1회 호출해 새 App access token을 받은 뒤 원래 요청을 1회 재시도한다.
- refresh 실패 시 FE는 App access token을 memory에서 제거하고 로그인 화면으로 이동한다.

App Bearer Token 방식 의미:

- Backend는 `Authorization` header가 없거나 App access token 검증에 실패하면 `Unauthorized`를 반환한다.
- Backend는 App token의 `sub`를 local user id로 보고 local `User`와 연결한다.
- FE는 App access token과 Supabase access token을 URL, query string, client log, analytics payload에 남기지 않는다.
- API client는 401을 받으면 App token refresh를 1회 시도한다.

CSRF 기준:

- Backend API 인증이 `Authorization: Bearer` header를 기준으로 동작하므로 cookie 자동 전송 기반 CSRF 위험은 기본 인증 경로에 적용되지 않는다.
- CORS 허용 origin은 User Web/Admin Web 배포 origin으로 제한한다.
- Origin 검증은 보조 방어로 둘 수 있지만, `X-CSRF-Token` header는 MVP 1차 기본 요구사항으로 두지 않는다.

### D09. Supabase Cloud 개발 환경

결정:

- MVP 1차의 Supabase Cloud 개발 환경은 `Remote Supabase project`를 사용한다.
- 개발자는 local FE/BE를 실행하되, Auth/Storage와 managed PostgreSQL 검증은 개발용 원격 Supabase project에 연결할 수 있다.
- local schema 검증, seed, integration/E2E reset은 Docker PostgreSQL을 사용할 수 있다.
- Supabase local stack은 MVP 1차 기본 개발 환경에서 사용하지 않는다.

Remote Supabase project 의미:

- Supabase 웹 콘솔에서 개발용 project를 만들고, 그 project의 Auth, PostgreSQL, Storage 설정을 local FE/BE에서 사용한다.
- NestJS Backend는 Prisma를 통해 Supabase Cloud PostgreSQL에 접속할 수 있고, FE는 Supabase DB에 직접 접근하지 않는다.
- local Docker PostgreSQL과 Supabase Cloud PostgreSQL은 같은 Prisma schema/migration 기준을 따른다.

환경 변수 예시:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_ANON_KEY=""
SUPABASE_JWKS_URL="https://xxxx.supabase.co/auth/v1/.well-known/jwks.json"
SUPABASE_JWT_ISSUER="https://xxxx.supabase.co/auth/v1"
```

선택 이유:

- 초기 MVP 개발 속도가 빠르다.
- 실제 Supabase Auth provider 설정과 redirect URL을 빨리 검증할 수 있다.
- Supabase local Auth를 띄우기 위한 추가 CLI/Docker 설정 부담을 줄인다.
- Supabase Cloud에서 Auth, PostgreSQL, Storage를 함께 관리하면 MVP 운영 환경 구성이 단순하다.
- NestJS/Prisma가 DB write를 전담하므로 Supabase Cloud PostgreSQL을 사용해도 코드단 transaction 관리를 유지할 수 있다.

구현 영향:

- `.env.example`에는 remote Supabase project 연결용 환경 변수를 포함한다.
- User Web과 Admin Web은 Supabase client를 초기화하고 Supabase Auth provider login/callback을 처리한다.
- Backend는 remote Supabase project의 JWKS와 issuer 정보를 token exchange 단계에서만 사용한다.
- Backend Prisma는 환경별 `DATABASE_URL`/`DIRECT_URL`로 PostgreSQL에 접속한다.
- 로그인 callback 이후 FE는 `POST /api/auth/exchange`를 호출해 Backend App token 발급과 local User 동기화를 완료한다.
- 개발용 Supabase project의 redirect URL에는 User Web/Admin Web callback URL을 등록해야 한다.
- 실제 운영 배포 시에는 개발용 Supabase project와 운영용 Supabase project를 분리한다.

### D10. App Bearer Token session 만료와 갱신 정책

결정:

- MVP 1차의 로그인 유지 정책은 `7일 sliding session`으로 고정한다.
- 사용자가 활동 중이면 Backend `AuthSession`의 만료 시간을 갱신해 로그인 상태를 연장한다.
- 마지막 활동 이후 7일이 지나면 FE는 사용자를 로그아웃 상태로 보고 다시 로그인하도록 보낸다.
- Backend는 자체 `AuthSession`을 만들고, App access token의 서명, issuer, audience, 만료 시간, session id를 검증한다.

선택 이유:

- 개인 영업 도구는 매일 여는 업무 앱에 가까우므로 24시간 고정 session은 초기 UX에 불리하다.
- 30일 이상 장기 session은 token 탈취 시 노출 기간이 길어 MVP 1차 보안 기준으로는 과하다.
- 7일 sliding은 사용성과 보안의 균형이 가장 좋다.

구현 영향:

- FE는 사용자의 활동과 App token 상태를 기준으로 refresh 또는 로그아웃 처리를 수행한다.
- Backend는 App access token이 만료되었거나 검증에 실패하면 `Unauthorized`를 반환한다.
- local DB에는 Supabase access token 원문, App access token 원문, refresh token 원문을 저장하지 않는다.
- `AuthSession` 모델은 MVP 1차 Prisma schema에 포함한다.
- `AuthSession.refreshTokenHash`는 refresh cookie의 token 원문을 단방향 hash한 값만 저장한다.
- sliding session 갱신은 refresh 성공 시점에 수행한다.

### D11. OAuth provider 초기 구현 순서

결정:

- MVP 초기 실제 로그인 provider는 `Kakao`, `Naver`, `Google`로 고정한다.
- `Apple` 로그인은 MVP Web 초기 구현 범위에서 제외하고, iOS 앱을 만들 때 후속으로 구현한다.
- User Web과 Admin Web의 로그인 provider 목록 API는 `kakao`, `naver`, `google`을 `enabled=true`로 반환한다.
- `apple`은 API 응답에 포함할 수 있지만 `enabled=false`, `status=planned` 또는 동일 의미의 상태로 표시한다.

선택 이유:

- 국내 B2C 사용자 기준으로 Kakao와 Naver는 초기 로그인 접근성에 중요하다.
- Google은 개발/테스트와 범용 계정 사용성이 좋아 초기 검증에 필요하다.
- Apple 로그인은 iOS 앱에서 Apple 정책상 필요해질 수 있지만, Web MVP 초기에는 구현 비용 대비 우선순위가 낮다.
- Apple을 후속으로 분리해도 Backend App token 구조는 외부 provider adapter 뒤에 있으므로 business API 인증 구조는 바뀌지 않는다.

구현 영향:

- Supabase Auth 개발 project에는 MVP 초기 provider로 Kakao, Naver, Google을 설정한다.
- `GET /api/auth/providers`는 Kakao, Naver, Google을 활성 provider로 반환한다.
- Apple 로그인 버튼을 화면에 노출한다면 disabled 또는 준비 중 상태로만 표시한다.
- Apple 실제 로그인, Apple provider 설정, Apple callback 검증은 iOS 앱 준비 시 별도 goal로 진행한다.

### D12. 같은 이메일의 다른 provider 계정 처리

결정:

- 같은 이메일이라도 provider account id가 다르면 같은 local `User`로 자동 연결하지 않는다.
- `POST /api/auth/exchange`는 `UserOAuthAccount.provider + providerUserId` 매핑을 기준으로 local `User`를 찾는다.
- provider 매핑이 없으면 같은 이메일의 기존 local `User`가 있더라도 자동으로 연결하지 않고 새 local `User`, `UserOAuthAccount`, `UserSetting`, `AuthDevice`, `AuthSession`을 생성한다.
- `User.email`은 MVP 1차에서 unique 제약을 두지 않는다.
- 사용자가 직접 여러 provider를 하나의 계정으로 묶는 계정 연결 기능은 MVP 이후 후속 작업으로 분리한다.

선택 이유:

- provider별 이메일 검증 수준과 계정 탈취 리스크가 다를 수 있다.
- 이메일만으로 자동 연결하면 사용자가 의도하지 않은 계정 병합이 발생할 수 있다.
- 보수적으로 provider account id 기준으로 시작하면 보안 사고 가능성을 줄일 수 있다.
- 중복 계정 문제는 나중에 사용자가 현재 로그인 상태에서 직접 추가 provider를 연결하는 화면과 검증 절차로 해결한다.

후속 작업:

- 설정 화면에 소셜 계정 연결 관리 기능을 추가한다.
- 사용자가 로그인된 상태에서 추가 provider 인증을 완료하면 해당 provider account를 현재 local `User`에 연결한다.
- 이미 다른 local `User`에 연결된 provider account는 연결하지 않고 충돌 안내를 표시한다.
- 계정 연결, 연결 해제, 충돌 처리는 별도 API와 감사/보안 검토를 거쳐 구현한다.

### D13. 초기 Admin 계정 생성 방식

결정:

- 초기 Admin 계정은 `.env`의 `INITIAL_ADMIN_EMAILS` 값으로 지정한다.
- `INITIAL_ADMIN_EMAILS`는 comma-separated email 목록으로 관리한다.
- `POST /api/auth/exchange`에서 외부 Auth email이 `INITIAL_ADMIN_EMAILS`에 포함되어 있으면 해당 local `User.role`을 `ADMIN`으로 설정한다.
- 첫 로그인 시 새 local `User`를 만들 때 email이 `INITIAL_ADMIN_EMAILS`에 포함되어 있으면 `role = ADMIN`으로 생성한다.
- 이미 존재하는 local `User`가 `INITIAL_ADMIN_EMAILS`에 포함되어 있고 아직 `role = USER`이면 exchange 시 `role = ADMIN`으로 승격한다.
- `INITIAL_ADMIN_EMAILS`에 없는 사용자는 기본 `role = USER`로 생성한다.

선택 이유:

- seed script가 Supabase/외부 provider user 생성 시점에 의존하지 않아도 된다.
- local 개발, 초기 운영, E2E에서 Admin 계정 생성 기준을 재현할 수 있다.
- DB를 직접 수정하는 방식보다 실수 위험이 낮다.

구현 영향:

- `.env.example`에는 `INITIAL_ADMIN_EMAILS` 예시를 포함한다.
- Admin 승격은 token exchange use case에서 처리한다.
- email 비교는 trim/lowercase normalize 후 수행한다.
- Admin 승격은 로그인 흐름에서만 자동 처리하고, 이후 Admin 권한 관리 UI는 별도 Admin 기능으로 다룬다.
- 운영에서 `INITIAL_ADMIN_EMAILS` 값을 제거해도 이미 승격된 Admin을 자동 강등하지 않는다.

### D14. 동시 로그인 session 수와 기기 슬롯 정책

결정:

- 사용자별 active 등록 기기 `AuthDevice`는 최대 3개까지 허용한다.
- 허용 슬롯은 `MOBILE`, `PERSONAL_LAPTOP`, `WORK_LAPTOP` 세 가지다.
- 각 슬롯별 active `AuthDevice`는 1개만 허용한다.
- 같은 `AuthDevice` 안에서는 여러 active `AuthSession`을 허용한다.
- 같은 등록 기기에서 새로 로그인하거나 새 탭/session을 만들 때 기존 session을 강제로 revoke하지 않는다.
- 다른 기기가 이미 사용 중인 슬롯으로 로그인하려면 기존 등록 기기 교체 확인이 필요하다.
- 사용자가 교체를 확인하면 기존 `AuthDevice`를 `REPLACED`로 바꾸고 그 기기 아래 active `AuthSession`을 모두 revoke한 뒤 새 `AuthDevice`를 만든다.
- 다른 슬롯의 active `AuthDevice`와 `AuthSession`은 유지한다.
- token exchange 요청에는 `deviceSlot`, `deviceId`, 선택적 `deviceLabel`, 선택적 `replaceExistingDevice`를 포함해야 한다.

선택 이유:

- 개인 영업자는 모바일, 개인 노트북, 회사용 노트북을 함께 사용할 가능성이 높다.
- 무제한 등록 기기는 분실 기기나 오래된 브라우저 profile 관리가 어려워진다.
- 사용자당 1개 session만 허용하면 모바일, 개인 노트북, 회사용 노트북을 오가는 실제 업무 흐름에 맞지 않는다.
- 같은 등록 기기의 여러 탭이나 브라우저 session을 끊지 않는 편이 사용자 경험이 자연스럽다.
- 3개 등록 기기 슬롯 제한은 사용성과 보안의 균형이 좋고, 운영자가 이해하기 쉬운 정책이다.

구현 영향:

- `AuthDevice`는 `userId`, `deviceSlot`, `deviceIdHash`, `label`, `status`를 가진다.
- `AuthSession`은 `authDeviceId`로 등록 기기에 연결된다.
- `deviceSlot` 값은 `MOBILE`, `PERSONAL_LAPTOP`, `WORK_LAPTOP` 중 하나다.
- FE는 브라우저 profile 단위의 비밀이 아닌 stable local `deviceId`를 만들고 token exchange 때 전달한다.
- `POST /api/auth/exchange`는 `deviceSlot`, `deviceId`를 필수 body 값으로 받는다.
- 같은 슬롯의 active `AuthDevice`가 없으면 새 `AuthDevice`를 만든다.
- 같은 슬롯의 active `AuthDevice.deviceIdHash`가 요청의 `deviceId` hash와 같으면 기존 `AuthDevice`를 재사용하고 새 `AuthSession`을 만든다.
- 같은 슬롯의 active `AuthDevice.deviceIdHash`가 다르고 `replaceExistingDevice`가 `true`가 아니면 `DeviceSlotAlreadyRegistered`를 반환한다.
- `replaceExistingDevice=true`이면 기존 `AuthDevice`와 그 하위 active `AuthSession`을 폐기한 뒤 새 `AuthDevice`와 `AuthSession`을 만든다.
- FE 로그인 흐름은 사용자가 현재 기기 슬롯을 선택하거나 확인할 수 있어야 하며, 슬롯 충돌 시 기존 기기를 교체할지 확인해야 한다.
- 모바일 앱을 만들 때는 기본 슬롯을 `MOBILE`로 사용할 수 있다.
- Admin 강제 logout 기능은 MVP 이후 운영 기능으로 분리한다.

### D15. 파일 저장소 1차 전략

결정:

- MVP 1차 파일 저장소는 `Supabase Storage adapter`로 시작한다.
- Backend는 `StoragePort`를 정의하고, application/domain 계층은 Supabase Storage SDK나 Supabase URL 형식에 직접 의존하지 않는다.
- 이후 서비스 규모가 커지면 `StoragePort` 구현체를 `AwsS3StorageAdapter`로 교체할 수 있게 만든다.
- 현재 BusinessCard OCR 구현은 업로드 이미지를 저장하지 않는다. Import 원본 파일과 Export 생성 파일 저장이 필요해질 때는 별도 계획에서 파일 저장 port를 확정한다.
- FE는 MVP 1차에서 파일을 Backend API로 업로드하고, Backend가 파일 검증 후 Supabase Storage에 저장한다.
- DB에는 provider 전용 public URL을 정본으로 저장하지 않는다.
- DB에는 `storageProvider`, `bucket`, `objectKey`, `contentType`, `sizeBytes`, `fileName` 같은 중립 metadata를 저장한다.
- 파일 조회/다운로드 시 Backend가 `StoragePort`를 통해 stream 또는 짧은 만료 시간의 signed URL을 만든다.
- Supabase `service role key`는 Backend 환경 변수로만 관리하고 FE에 노출하지 않는다.

선택 이유:

- 초기에는 Supabase Cloud를 이미 Auth에 사용하므로 파일 저장 설정과 운영 부담이 작다.
- local filesystem으로 시작하면 운영 전 별도 migration이 필요하고, 사용자 업로드 파일을 local server disk에 두는 구조가 배포 환경과 맞지 않을 수 있다.
- 처음부터 AWS S3로 가면 장기적으로는 좋지만 초기 버킷, IAM, CORS, signed URL 설정 부담이 커진다.
- `StoragePort`와 중립 metadata를 먼저 강제하면 나중에 Supabase Storage에서 AWS S3로 옮겨도 API와 domain logic 변경을 줄일 수 있다.

구현 영향:

- Backend shared/infrastructure 계층에 `StoragePort`와 `SupabaseStorageAdapter`를 만든다.
- 추후 AWS 이전 시 `AwsS3StorageAdapter`를 추가하고 `STORAGE_PROVIDER` 값으로 구현체를 전환한다.
- BusinessCard OCR은 `BusinessCardScanLog`에 성공/실패/확정 로그와 추출/보정값, provider 사용량을 저장하며 업로드 이미지는 저장하지 않는다.
- `ImportJob`은 업로드 원본 파일의 `bucket`, `objectKey`, `contentType`, `sizeBytes`, `fileName`을 저장한다.
- `ExportJob`은 생성된 파일의 `bucket`, `objectKey`, `contentType`, `sizeBytes`, `fileName`, `expiresAt`을 저장한다.
- `POST /api/business-card-scans`는 이미지 파일을 OCR provider에 전달하지만 이미지를 저장하지 않는다. `POST /api/imports`, Export 생성 API는 파일 저장 정책 확정 후 DB 상태를 갱신한다.
- Export 다운로드 API는 DB의 object metadata를 기준으로 `StoragePort`에서 stream 또는 signed URL을 얻어 반환한다.
- Supabase Storage bucket 예시는 현재 Import/Export 후보 기준으로 `imports`, `exports`를 둔다.

### D16. 민감정보 암호화 적용 범위

결정:

- MVP 1차 application-level encryption 대상은 `PersonalMemo.content`, `MeetingNote.rawText`, `BrowserPushSubscription.endpoint/p256dh/auth`로 고정한다.
- 전화번호, 이메일, 명함 OCR 추출 결과, 회의록 구조화 요약 필드(`details`, `nextPlan`, `requiredAction` 등)는 MVP 1차에서 암호화하지 않는다.
- 암호화하지 않는 민감 후보 필드도 Admin 목록/상세에서는 기본 마스킹 또는 존재 여부만 반환한다.
- Backend는 `EncryptionPort`를 정의하고, application/domain 계층은 구체 암호화 library에 직접 의존하지 않는다.
- DB에는 Memo 원문, 회의록 원문, browser push subscription endpoint/key를 평문으로 저장하지 않고 ciphertext와 key version을 저장한다.
- Admin 민감정보 원문 조회 API는 사유 검증과 `AuditLog` 기록을 통과한 뒤 `EncryptionPort`로 복호화한 값을 반환한다.
- application log, client log, server error log에는 암호화 전 원문, 복호화 원문, 암호화 key, reason 전문을 남기지 않는다.

선택 이유:

- Memo 원문과 회의록 원문은 사용자가 자유롭게 입력하는 텍스트라 민감정보가 섞일 가능성이 가장 높다.
- browser push subscription endpoint/key는 외부 발송 credential에 가까우므로 실제 browser push 구현 범위에 포함되면 암호화 저장이 필요하다.
- 전화번호, 이메일, OCR 전체까지 MVP 1차부터 암호화하면 검색, 중복 검사, 목록 필터, 후보 추천이 복잡해진다.
- 암호화 adapter를 먼저 도입하면 이후 전화번호, 이메일, OCR 결과까지 암호화 대상을 넓히기 쉽다.
- DB 유출 시 가장 민감한 자유 입력 원문부터 보호할 수 있다.

구현 영향:

- `PersonalMemo.content`는 `contentCiphertext`, `contentKeyVersion`으로 저장한다.
- `MeetingNote.rawText`는 `rawTextCiphertext`, `rawTextKeyVersion`으로 저장한다.
- `BrowserPushSubscription`은 `endpointHash`, `endpointCiphertext`, `p256dhCiphertext`, `authCiphertext`, `contentKeyVersion`으로 저장한다.
- `CreateMeetingNote`, `UpdateMeetingNote`, Memo 생성/수정, browser push subscription 등록 use case는 저장 전 `EncryptionPort.encrypt`를 호출한다.
- 사용자 본인이 조회하는 회의록 상세/Memo 상세는 Backend application layer에서 복호화해 반환할 수 있다.
- Admin 목록/상세 API는 복호화하지 않고 마스킹 또는 `hasMemo`, `memoCount`, `latestMemoAt` 같은 요약/존재 여부만 반환한다.
- Admin 원문 조회 API는 허용 field 검증, reason 검증, AuditLog 기록을 거친 후 복호화한다.
- `.env.example`에는 `ENCRYPTION_MASTER_KEY`, `ENCRYPTION_KEY_VERSION` 예시를 포함한다.
- 암호화 key rotation은 key version 필드로 확장 가능하게 두고, 실제 rotation 운영은 MVP 이후 별도 작업으로 분리한다.

### D17. Import 미리보기와 확정 실행 rollback 정책

결정:

- Excel/CSV bulk import는 바로 DB에 반영하지 않는다.
- 사용자가 파일을 업로드하면 Backend는 파일을 파싱하고 row별 preview 데이터를 만든다.
- preview 단계에서 필수값 누락, 형식 오류, 매핑 실패, row count 초과 같은 오류를 row 단위로 표시한다.
- User Web은 확정 실행 전에 사용자가 preview table에서 데이터가 잘 세팅되었는지, 오류 row가 있는지 확인할 수 있게 한다.
- preview에 오류 row가 있으면 확정 실행을 막는다.
- 사용자가 preview와 mapping을 확인한 뒤에만 `POST /api/imports/:importJobId/confirm`을 호출한다.
- 확정 실행은 all-or-nothing transaction으로 처리한다.
- 확정 실행 중 한 row라도 도메인 생성/수정에 실패하면 해당 Import로 생성/수정하려던 도메인 데이터는 전체 rollback한다.
- 실행 실패 시 Backend는 실패한 row number와 error reason을 `ImportJobRow`와 `ImportJob.resultSummary`에 남긴다.
- 실행 실패 후에도 성공 row를 부분 저장하지 않는다.

선택 이유:

- 사용자가 실제 반영 전에 Excel/CSV 내용과 매핑 결과를 눈으로 확인할 수 있어야 한다.
- preview 단계에서 대부분의 오류를 미리 잡으면 잘못된 bulk 생성으로 데이터를 오염시킬 위험이 줄어든다.
- 부분 성공은 사용자 입장에서 어떤 데이터가 실제 저장되었는지 추적하기 어렵다.
- all-or-nothing rollback은 데이터 정합성이 명확하고, 실패 행 번호를 보여주면 사용자가 원본 파일을 고쳐 재시도하기 쉽다.

구현 영향:

- `POST /api/imports`는 파일 저장, parsing, preview row 생성, 1차 validation을 수행한다.
- `POST /api/imports/:importJobId/map`와 `PATCH /api/imports/:importJobId/mapping` 이후에도 row별 mapped preview와 validation 결과를 갱신한다.
- `ImportJobStatus`에는 preview와 validation 실패 상태를 표현할 수 있어야 한다.
- `ImportJobRow`에는 Excel/CSV의 실제 행 번호 `rowNumber`, 원본 row, mapped row, row status, error message를 저장한다.
- `POST /api/imports/:importJobId/confirm`은 validation error가 남아 있으면 실행하지 않고 `ImportValidationFailed`를 반환한다.
- confirm use case는 target model insert/update를 단일 transaction으로 실행한다.
- transaction 실패 시 도메인 데이터 변경은 rollback하고, rollback 이후 별도 상태 갱신으로 `ImportJob.status = FAILED`, 실패 row/error summary를 저장한다.
- `ImportJobResultResponse`는 `successCount`, `failedCount`, `errors[].rowNumber`, `errors[].message`를 포함한다.

### D18. 외부 연동 실제 호출 범위

결정:

- MVP 기능 구현은 Google Calendar, OCR, OpenAI를 처음부터 실제 provider로 연동한다.
- `Google Calendar`는 실제 Google OAuth 연결과 Calendar event 조회를 구현한다.
- 명함 OCR은 실제 OpenAI/OCR provider 호출을 통해 추출 결과를 만든다.
- AI 회의록 생성은 실제 OpenAI 호출을 통해 9개 회의록 항목을 생성한다.
- Import AI 컬럼 매핑은 실제 OpenAI 호출을 통해 매핑 제안을 만든다.
- domain/application 계층은 여전히 Google/OpenAI SDK와 HTTP client에 직접 의존하지 않고 port/interface 뒤에 둔다.
- mock/stub adapter는 제품 기능의 기본 동작이 아니라 자동 테스트, 로컬 실패 재현, provider 장애 대체 검증 용도로만 둔다.
- 실제 provider 호출에 필요한 API key, OAuth client id/secret, redirect URL은 `.env`와 provider console 설정으로 관리한다.

선택 이유:

- MVP에서 실제 사용성을 검증하려면 AI/OCR/Calendar 결과 품질과 provider 인증 흐름을 초기에 확인해야 한다.
- mock 우선으로 진행하면 가장 중요한 자동화 기능의 품질, 비용, quota, timeout, 오류 형태를 너무 늦게 발견한다.
- port/adapter 경계를 유지하면 실제 연동을 먼저 하더라도 나중에 provider 변경, 테스트 stub, 장애 대체 구현이 가능하다.

구현 영향:

- `GoogleCalendarPort`의 기본 infrastructure 구현은 실제 Google Calendar API adapter다.
- `AiMeetingNotePort`, `BusinessCardOcrPort`, `ImportMappingPort`의 기본 infrastructure 구현은 실제 OpenAI adapter다.
- 각 실제 adapter는 timeout, retry 기준, provider error mapping, request/response logging redaction을 가진다.
- BusinessCard OCR은 별도 `AiJob` 없이 `BusinessCardScanLog`에 provider model, prompt snapshot, token/cost metric, 처리 시간을 저장한다.
- User Web은 실제 provider 처리 중 loading, 실패, 재시도, provider 연결 필요 상태를 표시한다.
- 자동 테스트는 실제 provider를 항상 호출하지 않고 stub/mock adapter를 사용할 수 있다. 단, 별도 provider smoke test는 실제 개발용 credential로 실행할 수 있어야 한다.
- `.env.example`에는 아래 예시를 포함한다.

```env
OPENAI_API_KEY=""
OPENAI_MODEL_MEETING_NOTE=""
OPENAI_BUSINESS_CARD_OCR_MODEL=""
OPENAI_MODEL_IMPORT_MAPPING=""

GOOGLE_CALENDAR_CLIENT_ID=""
GOOGLE_CALENDAR_CLIENT_SECRET=""
GOOGLE_CALENDAR_REDIRECT_URI=""
GOOGLE_CALENDAR_SCOPES="https://www.googleapis.com/auth/calendar.readonly"

EXTERNAL_PROVIDER_TIMEOUT_MS="30000"
EXTERNAL_PROVIDER_RETRY_COUNT="1"
```

### D19. FE/BE 배포 도메인 전략

결정:

- local과 preview 환경은 배포 서비스별 임시 domain을 허용한다.
- production 환경은 User Web, Admin Web, Backend API를 같은 parent domain 아래의 subdomain으로 고정한다.
- production 예시는 아래와 같다.

```text
User Web  = https://app.salesb2c.com
Admin Web = https://admin.salesb2c.com
Backend   = https://api.salesb2c.com
```

- local 예시는 아래와 같다.

```text
User Web  = http://localhost:5173
Admin Web = http://localhost:5174
Backend   = http://localhost:3000
```

- preview는 Vercel, Netlify, Railway, Render 같은 배포 서비스의 임시 URL을 허용할 수 있다.
- production CORS 허용 origin은 `https://app.<service-domain>`, `https://admin.<service-domain>`만 둔다.
- local/preview CORS 허용 origin은 환경 변수로 명시한 값만 허용한다.
- Supabase Auth redirect URL은 local, preview, production의 User Web/Admin Web callback URL을 환경별로 명시 등록한다.
- Backend API base URL은 FE 환경 변수에서 환경별로 분리한다.
- refresh cookie는 Backend API domain에서 발급하고, FE는 token exchange/refresh/logout처럼 refresh cookie가 필요한 auth 요청에 한해 credential 포함 요청을 사용할 수 있다.
- business API 인증은 계속 `Authorization: Bearer <app_access_token>` 기준이며 cookie 인증으로 바꾸지 않는다.

선택 이유:

- local/preview는 배포와 검증 속도를 위해 임시 URL을 허용하는 편이 현실적이다.
- production은 같은 parent domain 아래에 두면 CORS, Supabase redirect URL, refresh cookie, Origin 검증을 단순하게 관리할 수 있다.
- 운영에서 FE와 BE를 완전히 다른 domain으로 분리하면 인증과 보안 설정 실수 가능성이 커진다.

구현 영향:

- Backend `.env.example`에는 아래 예시를 포함한다.

```env
USER_WEB_ORIGIN="http://localhost:5173"
ADMIN_WEB_ORIGIN="http://localhost:5174"
API_PUBLIC_ORIGIN="http://localhost:3000"
APP_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
APP_REFRESH_COOKIE_DOMAIN=""
```

- production `.env` 예시는 아래 기준으로 둔다.

```env
USER_WEB_ORIGIN="https://app.salesb2c.com"
ADMIN_WEB_ORIGIN="https://admin.salesb2c.com"
API_PUBLIC_ORIGIN="https://api.salesb2c.com"
APP_ALLOWED_ORIGINS="https://app.salesb2c.com,https://admin.salesb2c.com"
APP_REFRESH_COOKIE_DOMAIN=""
```

- User Web `.env.example`에는 `VITE_API_URL`, `VITE_SUPABASE_REDIRECT_URL`을 포함한다.
- Admin Web `.env.example`에는 `VITE_API_URL`, `VITE_SUPABASE_REDIRECT_URL`을 포함한다.
- CORS middleware는 `APP_ALLOWED_ORIGINS`에 없는 origin을 거부한다.
- auth exchange/refresh/logout처럼 refresh cookie를 설정하거나 전송하는 요청은 허용된 origin에 한해 credential 포함 CORS를 허용한다.
- `POST /api/auth/refresh`는 `Origin` header가 `APP_ALLOWED_ORIGINS`에 포함된 경우만 처리한다.
- Supabase provider console에는 local/preview/production callback URL을 환경별로 등록한다.

### D20. 삭제된 리소스 조회/수정 응답 정책

결정:

- soft delete된 리소스는 일반 목록 API에서 기본 제외한다.
- 소유자가 기존 상세 URL로 soft delete된 리소스를 조회하면 `410 DeletedResource`를 반환한다.
- 다른 사용자 리소스는 삭제 여부와 관계없이 `OwnershipViolation` 403 또는 NotFound 계열 정책을 우선 적용하고, 삭제 상태를 노출하지 않는다.
- soft delete된 리소스에 대한 수정, 단계 변경, 다음 행동 변경, 연결 변경, 재삭제 같은 일반 변경 요청은 `409 DeletedResource`로 막는다.
- 복구는 일반 수정 API가 아니라 restore API 또는 휴지통 restore API로만 처리한다.
- 휴지통과 명시된 복구 화면에서만 삭제된 리소스 목록을 조회한다.
- 일반 상세 API에서 `includeDeleted=true`로 삭제 리소스를 직접 반환하는 정책은 MVP 1차에서 사용하지 않는다.

선택 이유:

- 사용자가 북마크, 알림, 브라우저 히스토리로 삭제된 상세 URL에 접근했을 때 단순 404보다 원인을 명확히 알 수 있다.
- 삭제된 데이터 수정을 막으면 복구 전 데이터 변경으로 생길 수 있는 정합성 문제를 줄일 수 있다.
- 복구 경로를 휴지통/restore API로 고정하면 FE UX와 Backend transaction 기준이 명확하다.

구현 영향:

- 공통 error mapper는 `DeletedResource`를 조회 context에서는 410, 변경 context에서는 409로 매핑할 수 있어야 한다.
- 단건 상세 use case는 `deletedAt != null`이면 소유자에게 `DeletedResource` 410을 반환한다.
- 수정/삭제/상태 변경 use case는 `deletedAt != null`이면 `DeletedResource` 409를 반환한다.
- FE 상세 화면은 410 응답을 받으면 "삭제된 항목" 상태와 휴지통/복구 CTA를 표시한다.
- FE 수정 form은 409 `DeletedResource` 응답을 받으면 저장 실패 메시지와 복구 안내를 표시한다.

### D21. soft delete 보관 기간, restore, hard delete 정책

결정:

- 사용자 또는 Admin이 삭제 API로 지우는 영속 삭제 대상 리소스는 즉시 hard delete하지 않고 soft delete한다.
- 삭제 시 `deletedAt`을 기록하고, `permanentDeleteAt`은 `deletedAt + 30일`로 기록한다.
- 삭제된 리소스는 30일 동안 휴지통에 보관한다.
- 30일이 지나면 시스템 자동 작업이 해당 리소스를 완전 삭제한다.
- MVP 1차에서 사용자가 직접 즉시 완전 삭제하는 API와 UI는 제공하지 않는다.
- 복구는 `permanentDeleteAt` 이전에만 가능하다.
- 시스템 자동 완전 삭제는 일반 사용자 액션이 아니므로 별도 확인 dialog 대상이 아니다.
- 사용자 계정 삭제는 회원 본인의 탈퇴와 Admin 강제 삭제를 모두 제공한다.
- 회원 탈퇴와 Admin 강제 삭제는 모두 `User.status = DELETED`, `User.deletedAt = now`, `User.permanentDeleteAt = now + 30일`로 처리한다.
- 삭제된 계정의 active `AuthSession`은 revoke하고, 로그인, token refresh, 일반 business API 접근을 차단한다.
- 삭제된 계정 복구는 `permanentDeleteAt` 이전에만 Admin이 수행할 수 있으며, 복구 시 `User.status = ACTIVE`, `deletedAt = null`, `permanentDeleteAt = null`로 되돌린다.
- 30일 경과 후 시스템 계정 삭제 job은 `User`와 계정에 종속된 데이터를 의존성 순서에 맞춰 완전 삭제한다.

선택 이유:

- 사용자가 실수로 삭제한 데이터를 30일 동안 복구할 수 있어야 한다.
- 영속 리소스 삭제를 soft delete로 통일하면 API, DB, UX의 삭제 상태 처리가 단순해진다.
- 사용자의 즉시 완전 삭제를 막으면 MVP 1차에서 위험한 irreversible action을 줄일 수 있다.
- 자동 완전 삭제 시점을 `permanentDeleteAt`으로 고정하면 휴지통 UI, 배치 작업, 알림 기준이 명확해진다.

구현 영향:

- soft delete 대상 모델은 `deletedAt`과 `permanentDeleteAt`을 함께 가진다.
- `Tag`와 `TagAssignment`는 soft delete 대상에서 제외한다. 태그 삭제와 태그 연결 해제는 휴지통 이동이 아니라 hard delete로 처리한다.
- `Tag` 생성/수정/삭제와 `TagAssignment` 연결/해제는 모두 `TagLog`에 append-only로 남긴다.
- `Tag` 삭제 시 active `TagAssignment`가 있으면 각 연결에 대해 `TagLog(TAG_UNASSIGNED)`를 먼저 남기고, 이어서 `TagLog(TAG_DELETED)`를 남긴 뒤 `TagAssignment`와 `Tag`를 hard delete한다.
- `TagLog`는 `tagId`, `assignmentId`, 태그명/색상 스냅샷, 대상 type/id/title 스냅샷을 저장하고, hard delete된 `Tag`와 `TagAssignment` 이후에도 남아야 하므로 두 모델에 FK를 걸지 않는다.
- soft delete 대상의 일반 삭제 API는 `deletedAt`과 `permanentDeleteAt`만 갱신한다.
- 휴지통 목록은 `permanentDeleteAt`을 반환해 완전 삭제 예정일을 표시한다.
- 휴지통 복구 API는 `deletedAt`과 `permanentDeleteAt`을 `null`로 되돌린다.
- 사용자 즉시 완전 삭제 API가 호출되면 MVP 1차에서는 `PermanentDeleteNotAllowed` 409를 반환한다.
- 30일 경과 리소스를 hard delete하는 시스템 job은 사용자 API와 분리한다.
- 회원 탈퇴 API는 현재 사용자의 `User`를 soft delete하고 active session을 revoke한다.
- Admin 사용자 상태 변경 API에서 `status = DELETED`는 강제 계정 삭제로 해석하며, 사유 필수와 `AuditLog` 기록을 요구한다.
- Admin이 삭제 계정을 30일 이내 `ACTIVE`로 변경하면 계정 복구로 처리하고, 복구 사유와 `AuditLog`를 남긴다.

### D22. 도메인별 Memo 기록과 민감정보 저장 위치

결정:

- MVP의 핵심 도메인인 `Company`, `Contact`, `Product`, `Deal`은 각각 Log와 Memo 기록을 가질 수 있다.
- Log는 대상 도메인에 대한 객관적 사실, 변경, 만남, 소식, 이력 기록이다.
- Memo는 대상 도메인에 대한 사용자의 주관적 생각, 판단, 개인 참고 기록이다.
- Memo는 각 엔티티의 단일 `memo` 필드에 저장하지 않고, Log처럼 여러 건 누적되는 기록형 데이터로 저장한다.
- `PersonalMemo`는 회사 Memo, 담당자 Memo, 제품 Memo, 딜 Memo를 담는 기록 테이블로 사용한다.
- `PersonalMemo`는 `targetType`, `targetId`로 `Company`, `Contact`, `Product`, `Deal` 중 하나에 연결한다.
- `PersonalMemo`는 `memoDate`, 선택적 `title`, `contentCiphertext`, `contentKeyVersion`을 가진다.
- `PersonalMemo.content` 원문은 DB에 평문 저장하지 않고 `contentCiphertext`, `contentKeyVersion`으로 저장한다.
- 일반 목록 API와 Admin 목록/상세 API는 메모 원문을 반환하지 않고 `memoCount`, `latestMemoAt`, `hasMemo` 같은 요약 또는 존재 여부만 반환한다.
- 사용자 본인의 상세 화면은 Backend application layer에서 복호화한 Memo 기록 목록을 반환할 수 있다.
- Admin 원문 조회는 별도 민감정보 원문 조회 API에서만 허용하며, 사유 입력과 `AuditLog` 기록을 전제로 한다.

선택 이유:

- Log와 Memo의 의미를 분리하면 객관적 이력과 사용자의 생각이 섞이지 않는다.
- 메모가 여러 건 누적되므로 시간순 맥락을 남길 수 있다.
- 회사/담당자/제품/딜마다 같은 메모 구조를 쓰면 UI와 API가 일관된다.
- 민감 가능성이 높은 주관적 자유 입력 텍스트는 `PersonalMemo`에 모아 암호화, 마스킹, 감사 정책을 일관되게 적용할 수 있다.

구현 영향:

- 회사/담당자/제품/딜의 단일 `memo` 필드는 메모 기능의 정본 저장소로 사용하지 않는다.
- 메모 생성/수정 use case는 `PersonalMemo` 저장 전 `EncryptionPort.encrypt`를 호출한다.
- 상세 화면은 Log 섹션과 Memo 섹션을 분리한다.
- User Web 상세 API는 `PersonalMemo`를 복호화해 Memo 기록 목록으로 표시할 수 있다.
- Admin 목록과 상세는 `PersonalMemo`를 복호화하지 않고 요약 또는 존재 여부만 반환한다.
- Admin 원문 조회 API는 `PersonalMemo.contentCiphertext` 복호화와 `AuditLog` 생성을 같은 transaction으로 처리한다.

### D23. Admin masking, 원문 조회, AuditLog transaction 정책

결정:

- Admin 목록과 기본 상세 API는 민감 데이터 원문을 기본 마스킹하거나 존재 여부만 반환한다.
- Admin 원문 조회는 전용 민감정보 원문 조회 API에서만 허용한다.
- 원문 조회 요청에는 사유 `reason`이 필수다.
- Backend는 `AuthGuard`와 `AdminGuard`를 통과한 뒤 사유를 검증한다.
- 민감 원문 조회는 대상 데이터 조회와 `AuditLog` 생성을 같은 transaction으로 처리한다.
- transaction이 실패하면 원문을 반환하지 않는다.
- `AuditLog`에는 actor, action, targetType, targetId, reason 요약, metadata를 기록하되 원문 PII와 복호화된 값은 저장하지 않는다.
- client log와 Sentry에는 원문 값과 reason 전문을 남기지 않는다.

선택 이유:

- 운영자는 CS와 장애 대응을 위해 필요한 경우 원문을 볼 수 있어야 한다.
- 기본 화면에서 원문을 노출하지 않으면 불필요한 민감정보 접근을 줄일 수 있다.
- 원문 조회와 감사 로그를 같은 transaction으로 묶어 감사 누락을 막는다.
- DB 직접 조회 같은 운영 우회를 줄이고, 제품 안의 안전한 절차로 통제한다.

구현 영향:

- Admin list/detail response는 `amountMasked`, `phoneMasked`, `emailMasked`, `hasMemo`, `memoCount`, `latestMemoAt`, `hasRawText` 같은 마스킹/요약/존재 여부 필드를 사용한다.
- `ViewSensitiveRawData`, `ViewDealSensitiveRawData`, `ViewMeetingNoteSensitiveRawData` 계열 API는 `reason`을 필수로 검증한다.
- 원문 조회 use case는 transaction 안에서 대상 접근 가능 여부 확인과 `AuditLog` 생성을 완료해야 한다.
- 복호화는 허용 field 검증과 감사 로그 기록이 성공한 뒤 수행한다.
- Admin Web은 원문 보기 버튼, 사유 입력 dialog, 원문 표시 상태, 감사 로그 확인 flow를 제공한다.

### D24. 도메인별 Log와 사용자 개인 Memo Log 구현 단위

결정:

- 객관 기록인 Log는 도메인별 별도 모델로 둔다.
- 회사 Log는 `CompanyLog`를 사용한다.
- 담당자 Log는 `ContactLog`를 추가한다.
- 제품 Log는 `ProductLog`를 추가한다.
- 딜 Log는 기존 딜 활동 기록 모델인 `DealActivity`를 사용한다.
- `CompanyLog`, `ContactLog`, `ProductLog`, `DealActivity`는 객관적 사실, 변경, 만남, 소식, 이력, 자동 상태 변경 기록을 저장한다.
- 사용자 개인 Memo Log는 객관 Log와 별도로 둔다.
- 사용자 개인 Memo Log는 `PersonalMemo`를 사용하되 `targetType`, `targetId`로 `Company`, `Contact`, `Product`, `Deal` 중 하나에 연결한다.
- 화면은 각 도메인 상세에서 `Log` 섹션과 `Memo` 섹션을 별도로 보여준다.
- API는 각 도메인별 Log endpoint를 제공하고, Memo는 도메인별 Memo endpoint 또는 공통 Memo use case를 통해 처리하되 response에서는 도메인별 Memo Log로 분리해 반환한다.

선택 이유:

- 도메인별 Log 모델을 두면 각 Log가 명확한 FK와 도메인 규칙을 가진다.
- 회사/담당자/제품/딜마다 객관 기록과 사용자 생각 기록이 섞이지 않는다.
- 딜은 단계 변경, 다음 행동 완료, 회의록 연결 같은 자동 기록이 많으므로 기존 `DealActivity`의 특수 규칙을 유지하는 편이 낫다.
- Memo는 사용자 주관 기록이고 민감 가능성이 높으므로 `PersonalMemo`로 암호화, 마스킹, 원문 조회 감사를 일관되게 적용한다.

구현 영향:

- Prisma schema에 `ContactLog`, `ProductLog`를 추가한다.
- `User`, `Contact`, `Product` relation에 각 Log 배열을 추가한다.
- `ContactDetailResponse`, `ProductDetailResponse`는 `logs`와 `memos`를 모두 포함한다.
- Contact/Product User API에 Log 목록/생성/수정/삭제 endpoint를 추가한다.
- User Web 상세 화면은 회사/담당자/제품/딜 모두 `Log`와 `Memo` 섹션을 분리한다.
- Admin 기본 목록/상세는 Memo 원문을 반환하지 않고 Log 원문도 운영상 민감 가능성을 고려해 필요한 경우 마스킹/요약 정책을 따른다.

### D25. 일정 기본 조회 기간

결정:

- 일정 목록/캘린더의 기본 조회 기간은 사용자 timezone 기준 `이번 달 1일 00:00:00`부터 `이번 달 말일 23:59:59`까지다.
- `GET /api/schedules`에서 `from`, `to` query가 없으면 Backend가 이번 달 범위를 계산한다.
- User Web `/schedules`는 Google Calendar처럼 월간 캘린더를 기본 화면으로 보여준다.
- User Web `/schedules`에는 월간/주간 view mode 전환을 제공한다.
- 사용자가 월 이동 또는 주 이동을 하면 User Web은 선택된 기간의 `from`, `to`를 명시해서 `GET /api/schedules`를 호출한다.
- 주간 보고서와 파일 export는 일정 화면의 주간 보기와 구분해 `/api/schedules/week`, `/api/schedules/week/export`를 사용한다.
- 홈의 오늘 일정 영역은 월간 기본 범위와 별개로 오늘 또는 가까운 일정만 조회하는 별도 summary query/API를 사용할 수 있다.

선택 이유:

- 사용자는 일정 화면에서 월 단위로 전체 영업 일정을 관리하는 것이 자연스럽다.
- 사용자는 Google Calendar처럼 월간/주간 보기 전환을 기대할 수 있다.
- 주간 보고서는 별도 기능으로 유지하면서도 기본 일정 화면은 월간/주간 운영 보기를 모두 제공할 수 있다.
- 월간 기본 범위를 고정하면 캘린더 UI, 서버 기본 query, empty state 기준이 명확해진다.

구현 영향:

- `ListSchedulesRequest`의 `from`, `to`는 optional이고, 누락 시 이번 달 범위를 적용한다.
- User Web `/schedules` 기본 화면은 월간 캘린더 UI를 우선한다.
- User Web `/schedules`에는 월간/주간 segmented control 또는 동일 수준의 view mode 전환 UI를 둔다.
- `/schedules`의 주간 보기에서는 선택된 주의 `from`, `to`를 명시해 `GET /api/schedules`를 호출한다.
- `/schedules/week`는 주간 보고서/Export 화면으로 유지한다.
- `GetWeeklySchedules`와 `CreateWeeklyScheduleExport`는 주간 보고서/Export용으로 `weekStart` 기준 7일 범위를 사용한다.

### D26. 통합검색 기본 정책

결정:

- 통합검색은 회사, 담당자, 제품, 딜, 일정, 회의록을 기본 검색 대상으로 한다.
- 삭제된 데이터는 통합검색 기본 결과에서 제외한다. 휴지통 데이터는 휴지통 화면/API에서만 조회한다.
- 검색어는 trim 후 2자 이상부터 실행한다. 1자 이하는 검색 대신 최근 항목 또는 빈 상태를 표시한다.
- 검색 결과는 type별 group으로 묶고, 기본 limit은 type별 최대 5개로 둔다.
- Memo 원문, `MeetingNote.rawText`, Admin 민감 원문은 통합검색 결과의 title/subtitle에 노출하지 않는다.

선택 이유:

- 기존 UX 정본이 이미 상단 통합검색에서 회사/담당자/제품/딜/일정/회의록을 함께 찾는 흐름을 전제로 한다.
- 삭제 데이터와 민감 원문을 기본 검색 결과에서 제외하면 사용자 탐색성은 유지하면서 개인정보 노출 위험을 줄일 수 있다.
- 2자 이상, type별 5개 제한은 MVP에서 DB `ILIKE` 기반 검색의 비용과 화면 복잡도를 적절히 제한한다.

구현 영향:

- `SearchAllRequest.types`는 `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`, `SCHEDULE`, `MEETING_NOTE` 중 선택 필터로 둔다.
- `SearchAllRequest.limit`은 type별 limit으로 해석하고 기본값 5를 사용한다.
- 검색 query는 모든 대상에서 `deletedAt IS NULL`을 기본 조건으로 둔다.
- `SearchAllResponse.groups[]`는 type별 결과를 반환하고, 각 item은 `title`, `subtitle`, `targetId`, 필요 시 `targetPath`를 포함한다.

### D27. Notification 실제 발송 범위

결정:

- MVP 1차에서 앱 내부 알림 데이터 생성뿐 아니라 이메일 발송과 브라우저 푸시 발송을 모두 실제 구현한다.
- 이메일 발송은 `EmailDeliveryPort` 뒤의 SMTP adapter를 기본 실제 구현으로 둔다.
- 브라우저 푸시는 `BrowserPushPort` 뒤의 Web Push VAPID adapter를 기본 실제 구현으로 둔다.
- User Web은 service worker, push permission 요청, browser push subscription 등록/해제를 구현한다.
- Backend는 browser push subscription endpoint/key를 `BrowserPushSubscription`에 저장한다.
- `BrowserPushSubscription.endpoint`, `p256dh`, `auth` 값은 민감 가능 데이터이므로 endpoint hash와 암호화된 ciphertext로 저장한다.
- 자동 테스트는 email/web push 실제 provider를 항상 호출하지 않고 stub adapter를 사용할 수 있다. 단, 별도 provider smoke test는 개발용 SMTP/VAPID credential로 실제 발송 또는 delivery request 성공을 확인한다.
- 알림 발송 실패는 `Notification.status = FAILED`와 metadata에 provider error summary를 저장하고, 원문 민감정보는 log에 남기지 않는다.

선택 이유:

- 일정/딜/다음 행동 알림은 실제 도달성이 중요하므로 MVP에서 email/browser push까지 검증해야 한다.
- SMTP와 Web Push VAPID는 특정 SaaS vendor에 강하게 묶이지 않으면서 실제 발송을 구현할 수 있다.
- port/adapter 경계를 유지하면 운영 전 provider 교체와 테스트 stub 주입이 가능하다.

구현 영향:

- `.env.example`에는 SMTP와 VAPID 설정을 포함한다.
- `Notification` 생성 job과 발송 job은 분리할 수 있으며, 발송 job은 `PENDING`이고 `scheduledAt <= now`인 알림을 channel별 adapter로 전달한다.
- email 비활성 사용자는 email channel 알림을 만들지 않거나 `CANCELED` 처리한다.
- browser push 비활성 또는 active subscription이 없는 사용자는 browser push channel 알림을 만들지 않거나 `CANCELED` 처리한다.
- browser push subscription 해제는 subscription을 hard delete하지 않고 `REVOKED`로 바꿔 중복 등록과 장애 추적을 제어한다.
- provider error, timeout, retry 기준, request/response logging redaction을 adapter별로 정의한다.

```env
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM_EMAIL=""
SMTP_FROM_NAME=""

WEB_PUSH_VAPID_PUBLIC_KEY=""
WEB_PUSH_VAPID_PRIVATE_KEY=""
WEB_PUSH_VAPID_SUBJECT="mailto:admin@example.com"

NOTIFICATION_DELIVERY_BATCH_SIZE="100"
NOTIFICATION_DELIVERY_RETRY_COUNT="2"
NOTIFICATION_DELIVERY_TIMEOUT_MS="10000"
```

## 3. 아직 확정되지 않은 결정

현재 남은 미확정 결정은 없다. 새 미확정 항목이 생기면 `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-PENDING-QUESTIONS.md`에 질문 형식으로 추가하고 하나씩 확정한다.

## 4. 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P0-G00-G04-FOUNDATION.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
