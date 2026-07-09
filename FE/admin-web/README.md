# admin-web

운영자를 위한 Admin Web 앱이다.

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 런타임 | Node.js 24 LTS |
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 번들러/개발 서버 | Vite 7 |
| 라우터 | React Router DOM 7 |
| 스타일 | Tailwind CSS 3, PostCSS, shadcn/ui, Inter-first multilingual font stack |
| 아이콘 | lucide-react |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | 필요할 때만 Zustand |
| 표/대시보드 | TanStack Table, 필요 시 Recharts |
| 폼 검증 | React Hook Form, Zod |

## 초기 범위

- 현재 노출 범위: 관리자 로그인, non-admin 접근 차단, `/admin/api/me` 보호 라우트 확인, root placeholder
- 후속 범위: 사용자 관리, 조직 관리, 구독 관리, 사용량 분석, 감사 로그, 시스템 설정, 운영 지원

Admin API는 `/admin/api/*`를 사용한다.

## 로컬 실행

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

로컬 URL: `http://localhost:5174`

`.env` 기본값:

```text
VITE_API_URL="http://localhost:3000"
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
VITE_SUPABASE_REDIRECT_URL="http://localhost:5174/auth/callback"
```

환경 파일은 `FE/admin-web/.env` 하나만 사용한다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. 변수명 목록은 `../../ENVIRONMENT.md`를 기준으로 확인한다.

## Auth

현재 local에서는 memory 기반 mock admin/user token을 사용한다.

- `관리자로 계속`: Admin role로 운영 콘솔 진입
- `일반 사용자로 계속`: non-admin 접근 차단 화면 확인

Backend는 현재 `GET /admin/api/me`만 구현되어 있다.

## 현재 구현 상태

실제 Backend API 연동 완료:

- `GET /admin/api/me`

Backend 미구현 경계:

- `/admin/api/dashboard`
- `/admin/api/users`
- `/admin/api/companies`
- `/admin/api/contacts`
- `/admin/api/products`
- `/admin/api/deals`
- 감사 로그 조회 API
- 민감 원문 조회 API

## 검증

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
```

`pnpm run test:e2e` 파일은 남아 있지만, 현재 라우터가 운영 화면을 root로 redirect하는 상태와 달리 과거 dashboard/users/data/audit 화면 기대값을 포함한다. 현재 Admin Web 품질 게이트는 우선 `typecheck`, `lint`, `build`와 관리자 인증 수동 smoke로 본다. E2E를 릴리즈 게이트로 쓰려면 현재 라우터 기준으로 먼저 갱신한다.

현재 수동 smoke 범위:

- Admin login
- non-admin 접근 차단
- `/admin/api/me` 보호 라우트 검증
- Backend 미구현 운영 화면의 route 숨김/redirect 경계 확인

Vercel project root: `FE/admin-web`
