# G00 구현 전 결정 기록

## 1. 목적

이 문서는 `MVP-STARTER_PLAN`의 첫 번째 `/goal`인 G00에서 확정해야 하는 운영, API, DB, 보안, 외부 연동 정책을 기록한다.

G00의 목적은 G01 이후 구현자가 기술 선택이나 정책 선택을 다시 질문하지 않고 바로 구현할 수 있게 하는 것이다.

## 2. 확정된 결정

### D01. G00 범위

결정:

- G00은 package manager, Node 버전, local DB 같은 기술 결정만 다루지 않는다.
- G00은 API/DB 정책, 인증/session, 삭제/복구, 민감정보, Admin masking, Import/Export, 외부 provider mock 범위까지 함께 확정한다.

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
- 운영 DB가 아니며, 개발 중 schema 변경과 test data reset을 안전하게 반복하기 위한 환경이다.

`Docker PostgreSQL` 의미:

- PostgreSQL을 개발자 PC에 직접 설치하지 않고 Docker container로 실행한다.
- Backend와 Prisma는 local Docker container의 PostgreSQL에 접속한다.
- 기본 실행 형태는 `docker compose up -d db` 같은 명령으로 DB container를 띄우는 방식이다.

`Docker PostgreSQL`을 선택한 이유:

- Prisma migration, relation, index, transaction을 실제 PostgreSQL 기준으로 검증할 수 있다.
- 개발자가 운영/원격 DB를 건드리지 않고 schema 변경과 seed를 반복할 수 있다.
- local 환경이 Docker Compose 기준으로 재현되어 개발자 PC 차이를 줄인다.
- Supabase PostgreSQL, RDS, Railway, Render 같은 PostgreSQL 기반 운영 DB로 옮길 때 DB 구조 전환 비용이 낮다.
- Supabase local보다 초기 설정이 가볍고, 원격 Supabase DB 직접 연결보다 migration 실수 위험이 낮다.

구현 영향:

- G01-G04에서는 local PostgreSQL container를 기준으로 Backend DB 연결과 Prisma 설정을 작성한다.
- G04의 Prisma schema validate, migration 또는 db push, seed 실행은 Docker PostgreSQL을 대상으로 한다.
- `.env.example`의 `DATABASE_URL`은 local Docker PostgreSQL 접속 예시를 포함한다.
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
- 운영 DB를 Supabase PostgreSQL, RDS, Railway, Render 등으로 옮길 때도 PostgreSQL 17 이상 호환성을 기준으로 본다.

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
- 환경 변수는 `DATABASE_URL`, `TEST_DATABASE_URL`을 사용한다.

local DB 세부값 의미:

- local DB 세부값은 Docker PostgreSQL container를 실행하고 Prisma가 접속하기 위한 개발용 접속 기준이다.
- 운영 비밀번호가 아니며, local 개발 환경 재현성을 위한 값이다.

환경 변수 예시:

```env
DATABASE_URL="postgresql://sales_b2c:sales_b2c_password@localhost:5432/sales_b2c_dev"
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

- `.env.example`에는 `DATABASE_URL`, `TEST_DATABASE_URL`을 모두 작성한다.
- Prisma migration과 seed 기본 대상은 `DATABASE_URL`의 `sales_b2c_dev`다.
- test command와 integration/E2E test는 `TEST_DATABASE_URL`의 `sales_b2c_test`를 사용한다.
- Docker Compose에서 `sales_b2c_test` database 생성이 필요하면 init script 또는 setup script를 둔다.

### D07. Supabase 사용 범위와 인증 1차 전략

결정:

- MVP 1차에서는 Supabase를 `Auth`에만 사용한다.
- MVP 1차의 business DB는 Supabase DB가 아니라 `Docker PostgreSQL`과 Prisma가 관리한다.
- Supabase Storage, Realtime, Edge Functions, Supabase DB direct access는 MVP 1차 구현 범위에서 제외한다.
- 인증 1차 전략은 `Supabase Auth 중심 + Backend OAuth bridge + httpOnly session cookie + local User 동기화`로 고정한다.

Supabase Auth만 사용한다는 의미:

- 소셜 로그인 provider 연동, OAuth 인증 화면, Supabase session 발급은 Supabase Auth가 담당한다.
- User Web과 Admin Web은 Backend의 auth 시작 API를 통해 Supabase Auth provider 화면으로 이동한다.
- Backend는 Supabase Auth callback을 받아 Supabase session/user 정보를 확인하고, `supabaseUserId`, `email`, `provider`를 기준으로 local `User`, `UserOAuthAccount`, `UserSetting`을 조회하거나 생성한다.
- Backend는 local `AuthSession`을 만들고 httpOnly cookie로 session token을 내려준다.
- 서비스의 회사, 거래처, 제품, 딜, 일정, 회의록 같은 business data는 local PostgreSQL과 Prisma schema가 관리한다.

선택 이유:

- OAuth와 소셜 로그인 provider 처리는 Supabase Auth에 맡겨 구현 속도를 높일 수 있다.
- business data는 NestJS/Prisma/Clean Architecture 기준으로 통제할 수 있다.
- Supabase DB에 직접 의존하지 않으므로 나중에 RDS, Railway, Render 같은 PostgreSQL 운영 DB로 이전하기 쉽다.
- Backend의 domain/application/infrastructure 경계를 유지하면서 인증 provider만 Supabase Auth adapter 뒤에 둘 수 있다.
- FE가 access token을 직접 보관하지 않으므로 XSS로 token이 탈취될 위험을 줄일 수 있다.
- cookie 기반 인증을 쓰므로 mutating API에는 CSRF 방어 기준을 함께 둔다.

구현 영향:

- Backend는 Supabase Auth provider redirect를 시작하는 API와 Supabase Auth callback을 처리하는 API를 구현한다.
- Backend `AuthGuard`는 httpOnly session cookie와 local `AuthSession`을 검증해 현재 사용자 context를 만든다.
- Supabase Auth callback 처리 시 local `User`, `UserOAuthAccount`, `UserSetting`, `AuthSession`을 같은 흐름에서 생성하거나 갱신한다.
- Admin API는 session cookie 검증 후 local `User.role = ADMIN`을 `AdminGuard`에서 확인한다.
- `UserOAuthAccount`는 Supabase user id와 provider account 정보를 local user와 연결하기 위한 매핑 용도로 사용한다.
- Backend는 refresh token을 local DB에 저장하지 않는다.
- Backend는 opaque session token을 httpOnly cookie로 내려주고, DB에는 session token hash만 저장한다.
- `.env.example`에는 Supabase Auth 연결에 필요한 환경 변수를 포함한다.
- mutating API는 `SameSite=Lax` cookie만 믿지 않고 CSRF token 또는 Origin 검증을 함께 사용한다.

환경 변수 후보:

```env
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
SUPABASE_JWT_ISSUER=""
SUPABASE_JWKS_URL=""
AUTH_SESSION_COOKIE_NAME="sales_b2c_session"
AUTH_SESSION_SECRET=""
CSRF_COOKIE_NAME="sales_b2c_csrf"
CSRF_SECRET=""
```

### D08. FE token 전달/보관 방식

결정:

- FE는 Supabase access token을 직접 보관하지 않는다.
- FE는 Backend가 발급한 httpOnly session cookie로 Backend API 인증을 처리한다.
- Backend API 호출은 `credentials: "include"` 기준으로 수행한다.
- POST, PATCH, PUT, DELETE 같은 mutating API는 CSRF token 또는 Origin 검증을 통과해야 한다.

httpOnly cookie 방식 의미:

- browser JavaScript가 session cookie 값을 직접 읽을 수 없다.
- Backend가 cookie를 읽어 session을 검증하고 current user context를 만든다.
- FE는 token 문자열을 localStorage, sessionStorage, memory에 직접 보관하지 않는다.

Cookie 기준:

- cookie 이름: `sales_b2c_session`
- local 개발: `httpOnly=true`, `sameSite=Lax`, `path=/`
- HTTPS 환경: `httpOnly=true`, `secure=true`, `sameSite=Lax`, `path=/`
- 운영 환경에서는 `__Host-` prefix 사용을 검토한다.

Session 저장 기준:

- cookie에는 opaque session token을 담는다.
- DB에는 session token 원문이 아니라 hash를 저장한다.
- session은 `AuthSession` 모델로 관리한다.
- logout 시 `AuthSession.revokedAt`을 기록하고 cookie를 삭제한다.

CSRF 기준:

- cookie 인증을 사용하므로 mutating API에는 CSRF 방어가 필요하다.
- MVP 1차에서는 `SameSite=Lax` + Origin 검증 + CSRF token header를 기본 기준으로 둔다.
- FE는 mutating API 호출 시 `X-CSRF-Token` header를 포함한다.

### D09. Supabase Auth 개발 환경

결정:

- MVP 1차의 Supabase Auth 개발 환경은 `Remote Supabase project`를 사용한다.
- 개발자는 local FE/BE를 실행하되, 인증은 개발용 원격 Supabase project에 연결한다.
- Supabase local Auth는 MVP 1차 기본 개발 환경에서 사용하지 않는다.

Remote Supabase project 의미:

- Supabase 웹 콘솔에서 개발용 project를 만들고, 그 project의 Auth 설정을 local FE/BE에서 사용한다.
- business DB는 계속 Docker PostgreSQL과 Prisma가 관리하며, Supabase project의 DB는 MVP 1차 business data 저장소로 사용하지 않는다.

환경 변수 예시:

```env
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_ANON_KEY=""
SUPABASE_JWKS_URL="https://xxxx.supabase.co/auth/v1/.well-known/jwks.json"
SUPABASE_JWT_ISSUER="https://xxxx.supabase.co/auth/v1"
```

선택 이유:

- 초기 MVP 개발 속도가 빠르다.
- 실제 Supabase Auth provider 설정과 redirect URL을 빨리 검증할 수 있다.
- Supabase local Auth를 띄우기 위한 추가 CLI/Docker 설정 부담을 줄인다.
- 이미 business DB는 Docker PostgreSQL로 고정했기 때문에 Auth만 원격 Supabase project에 붙이는 편이 구조가 단순하다.

구현 영향:

- `.env.example`에는 remote Supabase project 연결용 환경 변수를 포함한다.
- User Web과 Admin Web은 Supabase client를 직접 초기화하지 않고 Backend auth 시작 API로 이동한다.
- Backend는 remote Supabase project 정보를 사용해 provider redirect URL 생성과 callback code 교환을 수행한다.
- Backend는 callback 처리 후 local `AuthSession`을 생성하고 httpOnly cookie를 발급한다.
- 개발용 Supabase project의 redirect URL에는 Backend auth callback URL을 등록해야 한다.
- 실제 운영 배포 시에는 개발용 Supabase project와 운영용 Supabase project를 분리한다.

## 3. 아직 확정되지 않은 결정

다음 항목은 이후 `TODO/MVP-STARTER_PLAN/COMMON/G00-PENDING-QUESTIONS.md`의 질문을 통해 하나씩 확정한다.

- 삭제된 리소스 조회/수정 응답 정책
- soft delete, restore, hard delete, 휴지통 완전 삭제 정책
- 개인 메모와 민감정보 저장 위치
- 민감정보 암호화 adapter 적용 범위
- Admin masking, 원문 조회, AuditLog transaction 정책
- Import/Export 처리 방식과 부분 성공 정책
- Google Calendar, OCR, OpenAI 실연동 또는 mock adapter 범위
- 일정 기본 조회 기간
- 통합검색 기본 정책

## 4. 관련 문서

- `TODO/MVP-STARTER_PLAN/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P0-G00-G04-FOUNDATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
