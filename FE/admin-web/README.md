# admin-web

관리자 권한 확인만 남긴 Admin Web 앱이다.

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 런타임 | Node.js 24 LTS |
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 번들러/개발 서버 | Vite 7 |
| 라우터 | React Router DOM 7 |
| 스타일 | Tailwind CSS 3, PostCSS |

## 현재 범위

- 공개 route: `/login`
- 보호 route: `/`
- 관리자 확인 API: `GET /admin/api/me`
- 그 외 route는 `/`로 이동한다.

Admin Web은 현재 입력받은 Backend App access token이 관리자인지만 확인한다.

## 로컬 실행

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
pnpm install
pnpm run dev
```

로컬 URL: `http://localhost:5174`

`.env` 기본값:

```text
VITE_API_URL="http://localhost:3000"
```

환경 변수 정본은 `FE/admin-web/.env`와 `../../AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. Vite는 로컬 override 파일을 읽을 수 있지만, 공유 환경 계약은 공통 환경 문서의 `VITE_*` 변수명만 기준으로 한다.

## 운영 배포

Vercel project root: `FE/admin-web`

현재 Admin Web production URL은 `https://onehandsales-admin.vercel.app`이다. `https://admin.onehandsales.com`은 아직 활성 domain이 아니므로 운영/QA 기준으로 쓰지 않는다.

production `.env` 공개 origin 기준:

```text
VITE_API_URL="https://onehandsales-production.up.railway.app"
```

Admin custom domain을 연결할 때는 Vercel domain 연결만으로 끝내지 않고 Backend `ADMIN_WEB_ORIGIN`, `APP_ALLOWED_ORIGINS`, Google Cloud OAuth origin을 함께 갱신한다.

## Auth

Admin Web은 입력받은 Backend App access token으로 `GET /admin/api/me`를 호출해 관리자 권한을 확인한다. 운영 코드는 로컬 가짜 관리자/일반 사용자 token이나 역할 대체값을 사용하지 않는다.

관리자 보호 route는 `ProtectedAdminRoute`가 감싼 `HomePage`에서 렌더링된다. 일반 사용자 token은 Backend `AdminGuard`에서 403 또는 접근 차단으로 처리되어야 한다.

## 검증

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

`pnpm run test:e2e`는 관리자 token 통과, non-admin 차단, `GET /admin/api/me` 호출만 smoke 범위로 둔다. Backend는 Playwright mock으로 대체한다.
