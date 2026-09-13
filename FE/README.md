# FE

Frontend 앱은 제품 사용 면에 따라 분리한다.

## 앱

- `user-web`: 사용자가 직접 쓰는 Web MVP
- `admin-web`: 운영자를 위한 Admin Web 앱

각 앱은 자기 package dependency를 가진다. monorepo root에는 공유 frontend package를 두지 않는다.

## 로컬 실행

각 앱은 별도 터미널에서 실행한다.

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다. 각 앱은 `package.json`의 `engines` 기준을 Node 24로 맞춘다.

User Web 실행:

```bash
cd FE/user-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

Admin Web 실행:

```bash
cd FE/admin-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

로컬 포트:

- User Web: `http://localhost:5173` (`/{locale}` 공개 진입, `/app` 보호 앱)
- Admin Web: `http://localhost:5174`

User Web과 Admin Web은 Vercel에서 별도 프로젝트로 배포한다.

환경 변수 정본은 각 앱의 `.env`와 `../AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. User Web/Admin Web의 `VITE_*` 변수명은 공통 환경 문서를 기준으로 확인한다.

## 검증

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

Playwright smoke E2E는 Backend와 외부 Provider를 route mock으로 대체한다.

- User Web E2E: login, `/app` home, `/app/more`, account/help, session boundary smoke
- Admin Web E2E: 관리자 token 통과, non-admin 차단, `GET /admin/api/me` 호출을 확인한다.

E2E 전용 Vite port:

- User Web: `http://127.0.0.1:5175`
- Admin Web: `http://127.0.0.1:5176`

## Auth 상태

User Web은 URL locale 기반 public/auth route, Supabase OAuth provider login, `/auth/callback`, Backend `POST /api/auth/exchange`, refresh cookie 기반 access token 재발급 흐름을 사용한다. 로그인/회원가입 provider 버튼은 가능한 경우 browser popup으로 OAuth를 시작하고, popup이 차단되면 기존 full-page redirect로 fallback한다. 개발용 mock login 경로는 제거되어 있으며 로그인 화면은 Google, LINE, Apple provider 버튼을 노출한다.

Admin Web은 입력받은 Backend App access token으로 `GET /admin/api/me`를 호출해 관리자 권한을 확인한다. 로컬 가짜 관리자/일반 사용자 토큰이나 역할 대체값은 운영 코드에서 사용하지 않는다.

User Web app access token은 localStorage와 API client memory에 저장하고, refresh token은 Backend가 httpOnly cookie로 설정한다. 로그아웃은 Backend app session 폐기, Supabase `signOut`, localStorage token 삭제 후 선호 locale의 login URL로 이동한다. 예: `/ko/login`, `/en-us/login`. 실제 provider credential 검증은 별도 smoke에서 다룬다.

Provider 현황:

- Google OAuth 가입/로그인: QA 통과.
- LINE/Apple OAuth: runtime provider로 노출한다. 실제 provider smoke는 Supabase/provider 운영 설정과 secret 준비 상태에 따라 별도 확인하거나 환경 `N/A`로 기록한다.
- Kakao OAuth: 로그인 기능에서 제거됨. 과거 DB enum 값은 legacy 호환용으로만 남긴다.

현재 User Web device slot 정책:

- 화면 폭 `767px 이하`: `mobile`
- 그 외: `personal_laptop`
- `replaceExistingDevice=true`로 exchange하므로 같은 slot의 다른 브라우저/기기 로그인은 기존 slot 기기와 활성 session을 교체한다.

## 현재 구현 상태

User Web:

- 실제 API 연동 완료: Auth/User, Home(`/app`), More(`/app/more`), account settings, Help Error Report, Help Support Request, Public Contact Request.
- 공개/인증 페이지: `/{locale}`, `/{locale}/login`, `/{locale}/signup`, `/{locale}/product`, `/{locale}/features`, `/{locale}/features/customers`, `/{locale}/features/pipeline`, `/{locale}/features/schedules-follow-up`, `/{locale}/features/activity-records`, `/{locale}/features/ai-sales-assistant`, `/{locale}/features/reports`, `/{locale}/pricing`, `/{locale}/solutions`, `/{locale}/solutions/personal`, `/{locale}/solutions/real-estate`, `/{locale}/solutions/insurance-auto`, `/{locale}/solutions/b2b-field`, `/{locale}/download`, `/{locale}/help`, `/{locale}/faq`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`. 현재 언어 선택 UI에 노출하는 locale은 KR/US/CA 우선 전략 기준 `ko`, `en-us`, `en-ca`다. `ja`, `en-gb`, `en-sg`, `en-au`는 추후 확장 후보로만 보류한다. 기존 locale 없는 공개 URL은 선호 locale URL로 redirect하고, `/auth/callback`은 locale prefix 없이 유지한다.
- 보호 앱 route는 `/app/*` 아래에 있으며 현재 활성 route는 `/app`, `/app/more`다. `/app/contacts/*`, `/app/products/*`, `/app/deals/*`, `/app/export`는 `/app`으로 redirect한다. legacy top-level `/contacts/*`, `/products/*`, `/deals/*`, `/more`도 현재 보호 앱 route로 redirect한다.
- 고정형 `Company`/`Search`/`Company xlsx export` 화면과 API는 OneHand CRM 방향 전환에 맞춰 제거했다. 다음 CRM core는 Workspace/Kit/Object/Attribute/Relationship/Record/List/View 기반으로 새로 설계한다.

Admin Web:

- 실제 Backend 연동 완료: `GET /admin/api/me`.
- 현재 route는 `/login`과 보호 route `/`이다. 그 외 route는 `/`로 redirect한다.

## 정본 규칙

User Web 정본:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

Admin Web 정본:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`

공통 주석/로깅:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
