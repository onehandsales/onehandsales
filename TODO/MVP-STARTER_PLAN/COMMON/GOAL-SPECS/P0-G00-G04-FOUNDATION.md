# P0 G00-G04 구현 기반 상세 명세

## 1. 목적

P0는 실제 도메인 기능 구현 전에 Backend, User Web, Admin Web, DB 기반을 준비하는 단계다.

이 단계의 목표는 앱을 실행할 수 있는 최소 구조, 공통 인증 흐름을 붙일 준비, Prisma schema 반영 기반을 만드는 것이다.

## G00. 구현 전 운영 결정 정리

### 목적

스캐폴딩 전에 반복 질문이 발생하지 않도록 개발 운영 기본값을 확정한다.

### 산출 문서

- `AGENT/PM_AGENT/DECISIONS`의 운영 결정 문서
- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `.env.example` 변수 목록 초안
- package manager와 Node 버전 기준
- local DB 실행 방식
- 인증 1차 구현 전략
- API/DB 정책 결정 목록

### 확정된 결정

- package manager는 `pnpm`으로 고정한다.
- G01, G02, G03의 의존성 설치와 script 실행은 `pnpm install`, `pnpm run dev`, `pnpm run build`, `pnpm run test` 형식을 우선 사용한다.
- lockfile은 `pnpm-lock.yaml`을 기준으로 둔다.
- Node.js 버전은 `Node.js 24 LTS`로 고정한다.
- `.nvmrc` 또는 동일 역할의 버전 고정 파일에는 `24`를 사용한다.
- `package.json`의 `engines.node`는 `>=24 <25` 기준으로 둔다.
- CI를 만들 경우 Node.js 24를 사용한다.
- local DB 실행 방식은 `Docker PostgreSQL`로 고정한다.
- PostgreSQL Docker image version은 `postgres:17-alpine`으로 고정한다.
- local 개발 DB 이름은 `sales_b2c_dev`, 테스트 DB 이름은 `sales_b2c_test`로 고정한다.
- local DB user/password는 `sales_b2c` / `sales_b2c_password`로 고정한다.
- local PostgreSQL port는 `5432`로 고정한다.
- 개발 DB와 테스트 DB는 분리하고, 환경 변수는 `DATABASE_URL`, `TEST_DATABASE_URL`을 사용한다.
- G04의 Prisma schema validate, migration 또는 db push, seed 실행은 Docker PostgreSQL을 대상으로 한다.
- `.env.example`의 `DATABASE_URL`은 local Docker PostgreSQL 접속 예시를 포함한다.
- Supabase는 MVP 1차에서 `Auth`만 사용한다.
- Supabase Auth 개발 환경은 개발용 `Remote Supabase project`로 고정한다.
- business DB는 Supabase DB가 아니라 Docker PostgreSQL과 Prisma가 관리한다.
- 인증 1차 전략은 `Supabase Auth 중심 + Backend OAuth bridge + httpOnly session cookie + local User 동기화`로 고정한다.
- FE는 Supabase access token을 직접 보관하지 않고 Backend httpOnly session cookie를 사용한다.
- Backend는 Supabase Auth start/callback bridge를 구현하고, callback 처리 후 local User와 AuthSession을 만들며 httpOnly cookie를 발급한다.
- Backend는 cookie와 AuthSession을 검증해 현재 사용자 context를 만든다.
- mutating API는 CSRF token 또는 Origin 검증을 통과해야 한다.
- `.env.example`에는 `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER` 예시를 포함한다.
- `.env.example`에는 `AUTH_SESSION_COOKIE_NAME`, `AUTH_SESSION_SECRET`, `CSRF_COOKIE_NAME`, `CSRF_SECRET` 예시를 포함한다.
- 개발용 Supabase project에는 Backend callback URL을 등록한다.

### 화면 명세

화면 구현 없음.

단, G02와 G03에서 사용할 login placeholder는 다음 전제를 따른다.

- User Web: `/login`, `/`
- Admin Web: `/login`, `/`
- 실제 Supabase Auth provider 버튼은 G05 이후 활성화한다.

### API 연결

- 직접 구현 API 없음
- G01에서 `GET /api/health`를 구현할 준비를 한다.
- G05에서 Supabase Auth callback, httpOnly session cookie, `GET /api/me`, `GET /admin/api/me`를 구현할 준비를 한다.
- G05에서 remote Supabase project의 callback을 처리하고 local AuthSession을 생성할 준비를 한다.

### DB 연결

- local DB는 Docker PostgreSQL을 기준으로 한다.
- PostgreSQL image version은 `postgres:17-alpine`을 사용한다.
- local database name은 `sales_b2c_dev`, test database name은 `sales_b2c_test`를 사용한다.
- local user/password는 `sales_b2c` / `sales_b2c_password`, port는 `5432`를 사용한다.
- 관련 모델 후보: User, UserOAuthAccount, UserSetting
- Supabase Auth user와 local `User`, `AuthSession`은 G05에서 동기화한다.

### 완료 기준

- G01-G05 작업자가 다시 기술 선택을 묻지 않아도 된다.
- 결정이 문서에 남아 있다.
- 미확정 항목은 G00의 보류 항목으로만 남기고 후속 goal에 암묵적으로 넘기지 않는다.

## G01. Backend 프로젝트 스캐폴딩

### 목적

`BE`에 NestJS 서버의 최소 실행 기반을 만든다.

### 화면 명세

화면 없음.

### API 명세

- `GET /api/health`
- 상세 계약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`

### Backend 구현 범위

- NestJS bootstrap
- ConfigModule
- global ValidationPipe
- global exception filter
- structured logger wrapper
- request context middleware
- health controller
- Prisma 설치 준비

### DB 연결

- Prisma client 설치 준비
- local DB는 Docker PostgreSQL을 기준으로 연결한다.
- `.env.example`에는 `DATABASE_URL`, `TEST_DATABASE_URL` 예시를 모두 작성한다.
- migration은 G04에서 수행

### 상태/에러 기준

- validation error response 형식이 고정되어야 한다.
- 예상하지 못한 예외도 공통 error shape로 내려와야 한다.

### 완료 기준

- `BE` 서버가 local에서 실행된다.
- `GET /api/health`가 `status = ok`를 반환한다.
- typecheck 또는 lint가 통과한다.

## G02. User Web 프로젝트 스캐폴딩

### 목적

`FE/user-web`에 사용자 앱의 최소 실행 기반을 만든다.

### 화면 명세

#### `/login`

- 목적: 사용자가 로그인 화면에 진입했을 때 서비스 진입점을 확인한다.
- 주요 UI: 서비스명, 소셜 로그인 placeholder 버튼, disabled 상태 설명 문구
- 상태:
  - loading: provider 목록을 불러오는 중
  - empty: provider가 비활성화된 경우
  - error: provider API 실패
  - success: provider 버튼 표시

#### `/`

- 목적: 로그인 후 홈 shell placeholder를 표시한다.
- 주요 UI: 상단/하단 navigation placeholder, 딜 파이프라인 placeholder
- 인증 연동 전에는 mock user 또는 local guard로 접근을 허용할 수 있다.

### API 연결

- G02에서는 실제 API 연동 대신 API client 뼈대만 만든다.
- G05 이후 Backend auth start/callback flow, `GET /api/me`, `GET /api/auth/providers`를 연결한다.
- Backend API client는 cookie 인증을 위해 `credentials: "include"`를 사용한다.

### 상태/validation

- route guard는 인증 미구현 상태에서 TODO 주석 없이 명확한 mock mode로 분리한다.
- API base URL은 환경 변수에서 읽는다.

### 완료 기준

- User Web dev server가 실행된다.
- `/login`과 `/`가 렌더링된다.
- Tailwind, shadcn/ui, Router, TanStack Query provider가 연결된다.

## G03. Admin Web 프로젝트 스캐폴딩

### 목적

`FE/admin-web`에 Admin 운영 콘솔의 최소 실행 기반을 만든다.

### 화면 명세

#### `/login`

- 목적: Admin 사용자가 운영 콘솔 로그인 진입점을 확인한다.
- 주요 UI: Admin 타이틀, 로그인 placeholder, 권한 필요 안내
- 상태: loading, error, success placeholder

#### `/`

- 목적: 운영 콘솔 shell을 데스크톱 기준으로 표시한다.
- 주요 UI: 좌측 navigation, 상단 header, content placeholder
- 기본 breakpoint: 데스크톱 중심. 모바일 최적화는 MVP Admin 범위가 아니다.

### API 연결

- G03에서는 `adminApiClient` 뼈대만 만든다.
- G05 이후 Backend auth start/callback flow, `GET /admin/api/me`를 연결한다.
- Admin API client는 cookie 인증을 위해 `credentials: "include"`를 사용한다.

### 상태/validation

- Admin route guard는 `role = ADMIN` 전제를 가진다.
- non-admin 접근 차단 UI는 G31/G35에서 구체화한다.

### 완료 기준

- Admin Web dev server가 실행된다.
- Admin shell이 데스크톱 레이아웃으로 보인다.
- TanStack Table을 설치하고 사용할 준비가 되어 있다.

## G04. Prisma schema 1차 반영과 DB 연결

### 목적

MVP 핵심 도메인을 담을 수 있는 DB schema와 Prisma client 기반을 만든다.

### 화면 명세

화면 없음.

### DB 명세

- 구현 기준: `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- 핵심 모델: User, Company, Contact, Product, Deal, DealActivity, Schedule, MeetingNote, Tag, AuditLog, ImportJob, ExportJob, Notification, AiJob

### API 연결

- 직접 도메인 API 구현은 제외
- G01 health API에서 DB 연결 확인을 선택적으로 붙일 수 있다.

### seed 기준

- DealActivityType 시스템 기본값
- ProductConnectionType UI 라벨 기준

### 완료 기준

- Prisma schema validate가 통과한다.
- migration 또는 db push가 `postgres:17-alpine` container 기준으로 성공한다.
- seed 실행이 가능하다.
- integration/E2E test는 `TEST_DATABASE_URL`의 `sales_b2c_test`를 사용할 수 있다.

## 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
