# Front Deployment Architecture

## 1. 환경 정책

MVP Frontend 배포 환경은 두 단계만 둔다.

- `local`
- `production`

MVP에는 `staging` 환경을 두지 않는다.

## 2. Local

Local Frontend 개발 서버 기본 origin:

- User Web: `http://localhost:5173`
- Admin Web: `http://localhost:5174`

추가 preview origin은 환경 allowlist에 등록된 경우에만 허용한다.

현재 package script 기준:

- User Web dev: `pnpm run dev` -> `vite --host 0.0.0.0 --port 5173`
- Admin Web dev: `pnpm run dev` -> `vite --host 0.0.0.0 --port 5174`
- User Web preview: `pnpm run preview` -> port `4173`
- Admin Web preview: `pnpm run preview` -> port `4174`
- 두 앱 모두 build는 `tsc -b && vite build`를 실행한다.

## 3. Production

User Web과 Admin Web은 Vercel에서 별도 프로젝트로 배포한다.

| Surface | Provider | Project root | Domain |
|---|---|---|---|
| User Web | Vercel | `FE/user-web` | `https://app.<service-domain>` |
| Admin Web | Vercel | `FE/admin-web` | `https://admin.<service-domain>` |

Vercel 기준:

- build command: `pnpm install && pnpm run build`
- output directory: `dist`
- `vercel.json`은 SPA fallback을 위해 모든 경로를 `/index.html`로 rewrite한다.

## 4. Release Gate

Frontend production 배포 전에는 User Web 전체 E2E와 Admin auth smoke E2E를 실행한다. Admin 전체 E2E는 관리자 페이지 본 구현 후 release gate에 추가한다.

배포 전 전체 E2E가 실패하면 배포하지 않는다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
