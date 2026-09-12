# OneHand CRM Monorepo

이 저장소는 `OneHand CRM`의 모노레포 루트다.

브랜드 표기는 아래를 기준으로 한다.

- 제품명: `OneHand CRM`
- 붙여 쓰는 브랜드 표기: `OneHandCRM`
- 도메인/slug/code 표기: `onehandcrm`

현재 제품 방향 초안은 [new-guide.md](./new-guide.md)를 기준으로 한다.

핵심 문장:

> CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비된다.

OneHand CRM은 고정된 영업 CRM도, 빈 CRM builder도 아니다. 사용자가 어떤 일을 하는지 알려주면 그 일에 맞는 CRM 구조가 먼저 준비되고, 필요해지는 순간 업무 언어로 자연스럽게 확장되는 No Setup CRM을 목표로 한다.

## Product Direction

OneHand CRM의 핵심 포지션은 아래 세 가지다.

### Zero Setup

사용자는 처음부터 CRM 구조를 만들지 않는다. 회원가입 후 자기 일을 선택하면 제품이 시작 구조를 먼저 결정한다.

사용자-facing 메시지:

- CRM을 설정하지 마세요. 하는 일을 알려주세요.
- 내 일에 맞는 CRM이 바로 준비됩니다.
- 빈 화면에서 시작하지 않아도 됩니다.

### Work-aware

직업별 Kit은 단순 템플릿이 아니라 실제 업무에서 다루는 대상, 관계, 상태, 기본 화면을 포함해야 한다.

예시:

| Kit | 시작 구조 예시 |
| --- | --- |
| 부동산 중개 | 고객, 매물, 소유자, 방문, 상담, 계약 |
| 헤드헌팅/채용 | 후보자, 회사, 채용공고, 인터뷰, 추천, Offer |
| B2B 기술영업 | 회사, 담당자, 기회, 제품, Sample, Technical Issue, Quote |
| 보험/재무상담 | 고객, 상담, 보장/상품, 계약, 갱신, Follow-up |
| 교육/코칭 | 수강생, 상담, 과정, 등록, 출석, 진도, 재등록 |
| 프리랜서/컨설팅 | 고객, 프로젝트, 미팅, 제안, 계약, 청구, 산출물 |

`회사`, `제품`, `딜` 같은 단어는 특정 Kit 안에서는 사용할 수 있다. 다만 OneHand CRM 전체의 고정 기본 도메인처럼 설명하지 않는다.

### Infinite Expansion

처음 구조는 제품이 준비하지만, 사용자가 그 구조에 갇히면 안 된다. 업무가 바뀌거나 반복 패턴이 보이면 새로운 관리 항목, 정보, 연결, 보기, 자동 처리를 추가할 수 있어야 한다.

중요한 점은 사용자가 `Object`, `Attribute`, `Relationship`, `Workflow` 같은 내부 용어를 배울 필요가 없어야 한다는 것이다.

예시:

```text
제품별로 고객을 관리하고 있는 것 같아요.
제품 관리를 추가할까요?

[제품 관리 추가]
```

내부적으로는 Object/Attribute/Relationship/View가 생성되더라도, 사용자에게는 업무 언어로 보여준다.

## Product Rules

- 사용자-facing 문서와 화면에서는 `OneHand CRM`을 우선한다.
- 공백 없는 표기가 필요한 곳에서는 `OneHandCRM` 또는 `onehandcrm`을 사용한다.
- 과거 영업 CRM 카피를 새 사용자-facing 문구에 남기지 않는다.
- `Company`, `Product`, `Deal`을 전체 기본 도메인처럼 설명하지 않는다.
- 문의자가 입력하는 회사명과 회사 규모는 공개 문의 원문 필드이므로 유지한다.
- DB migration history처럼 삭제하면 안 되는 이력은 보존한다.
- 내부 설계 문서에서는 `Workspace`, `Object`, `Attribute`, `Relationship`, `Record`, `View` 같은 용어를 사용할 수 있다.
- 사용자-facing UX에서는 내부 모델 용어를 업무 언어로 바꿔 보여준다.

## Current Implementation

현재 구현은 새 CRM 코어를 만들기 전 foundation 상태다.

Backend:

- Auth/User
- PublicContactRequest
- ErrorReport
- SupportRequest
- Health
- `GET /admin/api/me`

User Web:

- locale 기반 공개/인증 페이지
- `/app` 홈
- `/app/more`
- 계정 설정 모달
- 오류 신고와 지원 문의
- 공개 문의

Admin Web:

- `/login`
- `/`
- 관리자 access token 확인

Prisma:

- `User`
- `ErrorReport`
- `SupportRequest`
- `PublicContactRequest`
- `UserOAuthAccount`
- `AuthDevice`
- `AuthSession`

다음 CRM 코어는 고정형 도메인을 되살리지 않고, `Workspace`, `Kit`, `Object`, `Attribute`, `Relationship`, `Record`, `View` 계열의 유연한 데이터 모델로 별도 설계한다.

## Domain Direction

외부 노출 도메인과 배포 이름은 `onehandcrm` 기준으로 전환한다.

전환 기준:

- User Web canonical domain: `onehandcrm` 계열 신규 도메인
- Admin Web deployment name: `onehandcrm` 계열 이름
- Backend API deployment name: `onehandcrm` 계열 이름
- OAuth redirect URL, CORS origin, cookie domain, SEO canonical URL도 같은 기준으로 갱신

실제 구매/연결된 도메인과 배포 URL은 환경 문서와 배포 플랫폼 설정을 기준으로 관리한다. Frontend domain 변경은 Railway Backend, Supabase project/database region, provider secret을 자동으로 바꾸지 않는다.

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

### 2. User Web

```bash
cd FE/user-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

User Web URL: `http://localhost:5173`

User Web은 locale 기반 공개/인증 URL과 로그인 후 `/app` 영역을 제공한다. 인증은 Supabase OAuth provider login, 공유 `/auth/callback`, Backend `POST /api/auth/exchange`, refresh cookie 기반 access token 재발급 흐름을 사용한다.

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
pnpm run test:e2e
```

Playwright smoke E2E는 기본적으로 Backend와 외부 Provider를 route mock으로 대체한다. User Web E2E는 5175 포트의 Vite dev server를 테스트용으로 사용한다. Admin Web E2E는 관리자 token 통과, non-admin 차단, `GET /admin/api/me` 호출만 확인한다.

문서와 코드 변경 후에는 관련 실행 단위를 다시 검증한다.

## External Providers

환경 변수 정본은 각 실행 단위의 `.env`와 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. Backend와 Vite가 로컬 override 파일을 읽을 수 있더라도, 공유 환경 계약은 공통 환경 문서에 기록된 변수명만 기준으로 한다.

외부 provider 에러 처리와 후속 개선 항목은 `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`에 기록한다.

- Backend Auth/DB: `DATABASE_URL`, `DIRECT_URL`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`
- Frontend Supabase/Auth: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_REDIRECT_URL`

로그인 국가 메타데이터는 Google/Supabase 계정 정보가 아니라 배포 프록시가 전달하는 `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country` 헤더에서 저장한다. 로컬 또는 해당 헤더가 없는 배포 환경에서는 `signupCountryCode`, `lastLoginCountryCode`가 `null`이며 화면에는 `기록 없음`으로 표시될 수 있다.

## Rules

- 루트에는 `package.json`을 두지 않는다.
- `FE`와 `BE`는 package dependency를 공유하지 않는다.
- `FE/user-web`, `FE/admin-web`은 별도 Frontend 앱이다.
- `BE`는 `/api/*`와 `GET /admin/api/me`를 제공하는 단일 NestJS 서버다.
- `AGENT`는 PM, UX/UI, Software 역할별 정본 문서 공간이다.
- `TODO`, `TODO_LOG`, `IMAGE_SAMPLE`, `UX Design`은 작업/참고 자료이며 `AGENT`를 override하지 않는다.
