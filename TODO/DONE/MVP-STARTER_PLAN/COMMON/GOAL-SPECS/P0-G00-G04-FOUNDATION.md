# P0 G00-G04 구현 기반 상세 명세

## 1. 목적

P0는 실제 도메인 기능 구현 전에 Backend, User Web, Admin Web, DB 기반을 준비하는 단계다.

이 단계의 목표는 앱을 실행할 수 있는 최소 구조, 공통 인증 흐름을 붙일 준비, Prisma schema 반영 기반을 만드는 것이다.

## G00. 구현 전 운영 결정 정리

### 목적

스캐폴딩 전에 반복 질문이 발생하지 않도록 개발 운영 기본값을 확정한다.

### 산출 문서

- `AGENT/PM_AGENT/DECISIONS`의 운영 결정 문서
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
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
- 개발 DB와 테스트 DB는 분리하고, 환경 변수는 `DATABASE_URL`, `DIRECT_URL`, `TEST_DATABASE_URL`을 사용한다.
- G04의 Prisma schema validate, migration 또는 db push, seed 실행은 Docker PostgreSQL을 대상으로 한다.
- `.env.example`의 `DATABASE_URL`은 local Docker PostgreSQL 접속 예시를 포함한다.
- dev/preview/prod 환경의 `DATABASE_URL`과 `DIRECT_URL`은 Supabase Cloud PostgreSQL 접속값을 사용한다.
- Supabase Cloud는 MVP 1차에서 `Auth`, `PostgreSQL`, 파일 저장소 adapter에 사용한다.
- Supabase Cloud 개발 환경은 개발용 `Remote Supabase project`로 고정한다.
- managed business DB는 Supabase Cloud PostgreSQL이고, NestJS Backend가 Prisma로 직접 접속해 application layer에서 transaction을 관리한다.
- local/integration/E2E test DB는 재현성과 안전한 reset을 위해 Docker PostgreSQL을 사용할 수 있다.
- 인증 1차 전략은 `Supabase Auth 외부 Provider + Backend token exchange + Backend 발급 App Bearer Token + local User/AuthDevice/AuthSession`으로 고정한다.
- FE는 Supabase access token을 token exchange API에만 전달한다.
- FE는 business API와 Admin API에 Backend가 발급한 App access token을 `Authorization: Bearer` header로 전달한다.
- Backend는 App access token을 검증하고 local User/AuthDevice/AuthSession과 연결해 현재 사용자 context를 만든다.
- 로그인 성공 후 FE는 `POST /api/auth/exchange`를 호출해 local User/UserOAuthAccount/UserSetting/AuthDevice/AuthSession 동기화와 App token 발급을 완료한다.
- 파일 저장은 `StoragePort` 뒤의 Supabase Storage adapter로 시작하고, 추후 AWS S3 adapter로 교체 가능해야 한다.
- Backend는 Supabase access token 원문, Supabase refresh token, App access token 원문, refresh token 원문을 저장하지 않는다.
- 로그인 유지 정책은 `7일 sliding session`으로 고정한다.
- `.env.example`에는 `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER` 예시를 포함한다.
- `.env.example`에는 `APP_JWT_ISSUER`, `APP_JWT_AUDIENCE`, `APP_JWT_SECRET`, `APP_ACCESS_TOKEN_TTL_MINUTES`, `APP_SESSION_TTL_DAYS` 예시를 포함한다.
- `.env.example`에는 `USER_WEB_ORIGIN`, `ADMIN_WEB_ORIGIN`, `API_PUBLIC_ORIGIN`, `APP_ALLOWED_ORIGINS`, `APP_REFRESH_COOKIE_DOMAIN` 예시를 포함한다.
- `.env.example`에는 실제 OpenAI/OCR/Google Calendar/SMTP/Web Push VAPID 연동에 필요한 `OPENAI_API_KEY`, OpenAI model 변수, `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI`, `GOOGLE_CALENDAR_SCOPES`, SMTP 변수, VAPID 변수 예시를 포함한다.
- 개발용 Supabase project에는 User Web/Admin Web callback URL을 등록한다.
- local/preview는 분리 domain을 허용하고, production은 `app`, `admin`, `api`를 같은 parent domain 아래 subdomain으로 배포한다.
- 모든 영속 삭제 대상 리소스는 soft delete하고, 삭제 시 `deletedAt`과 `permanentDeleteAt = deletedAt + 30일`을 기록한다. `Tag`와 `TagAssignment`는 분류/연결 상태 데이터이므로 hard delete하고 `TagLog`에 이력을 남긴다.
- 30일 휴지통 보관 후 시스템 자동 작업이 완전 삭제하며, MVP 1차에서 사용자 즉시 완전 삭제는 제공하지 않는다.
- `Company`, `Contact`, `Product`, `Deal`의 Log는 객관 기록, Memo는 주관 기록으로 분리한다. Memo는 각 엔티티 단일 `memo` 필드가 아니라 `PersonalMemo` 기록 테이블에 암호화 저장한다.
- 도메인별 Log는 회사 `CompanyLog`, 담당자 `ContactLog`, 제품 `ProductLog`, 딜 `DealActivity`로 구현한다. 각 도메인별 사용자 개인 Memo Log는 `PersonalMemo`로 별도 저장한다.
- Admin 목록/기본 상세는 민감 원문을 마스킹하거나 존재 여부만 반환하고, 원문 조회는 사유 필수 전용 API에서 대상 조회와 `AuditLog` 생성을 같은 transaction으로 처리한다.

### 화면 명세

화면 구현 없음.

단, G02와 G03에서 사용할 login placeholder는 다음 전제를 따른다.

- User Web: `/login`, `/`
- Admin Web: `/login`, `/`
- 실제 Supabase Auth provider 버튼은 G05 이후 활성화한다.

### API 연결

- 직접 구현 API 없음
- G01에서 `GET /api/health`를 구현할 준비를 한다.
- G05에서 external auth token exchange, `POST /api/auth/exchange`, `POST /api/auth/refresh`, `GET /api/me`, `GET /admin/api/me`를 구현할 준비를 한다.
- G05에서 remote Supabase project의 JWT issuer/JWKS를 exchange 단계에서 검증하고 local User/AuthDevice/AuthSession 동기화를 수행할 준비를 한다.

### DB 연결

- local DB는 Docker PostgreSQL을 기준으로 한다.
- PostgreSQL image version은 `postgres:17-alpine`을 사용한다.
- local database name은 `sales_b2c_dev`, test database name은 `sales_b2c_test`를 사용한다.
- local user/password는 `sales_b2c` / `sales_b2c_password`, port는 `5432`를 사용한다.
- 관련 모델 후보: User, UserOAuthAccount, UserSetting, AuthDevice, AuthSession
- Supabase Auth user와 local `User`, `UserOAuthAccount`, `UserSetting`, `AuthDevice`, `AuthSession`은 G05에서 동기화한다.

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
- 상세 계약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`

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
- dev/preview/prod managed DB는 Supabase Cloud PostgreSQL을 기준으로 연결한다.
- `.env.example`에는 `DATABASE_URL`, `DIRECT_URL`, `TEST_DATABASE_URL` 예시를 모두 작성한다.
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
- G05 이후 Supabase Auth client login/callback flow, `POST /api/auth/exchange`, `POST /api/auth/refresh`, `GET /api/me`, `GET /api/auth/providers`를 연결한다.
- Backend API client는 Backend App access token을 `Authorization: Bearer` header로 전달할 수 있게 만든다.

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
- G05 이후 Supabase Auth client login/callback flow, `POST /api/auth/exchange`, `POST /api/auth/refresh`, `GET /admin/api/me`를 연결한다.
- Admin API client는 Backend App access token을 `Authorization: Bearer` header로 전달할 수 있게 만든다.

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

- 구현 기준: `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- 핵심 모델: User, Company, CompanyLog, Contact, ContactLog, Product, ProductLog, Deal, DealActivity, PersonalMemo, Schedule, MeetingNote, Tag, AuditLog, ImportJob, ExportJob, Notification, AiJob

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

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
