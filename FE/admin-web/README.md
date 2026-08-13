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

## 현재 범위

- 현재 노출 범위: 관리자 로그인, non-admin 차단, 사용자 목록/상세, 사용자 도메인 read-only, 사용자 Trash, provider failure, account/data request queue, Trash recovery request queue, analytics overview, audit logs, system operation gate
- 후속 범위: Billing Admin, subscription/payment/refund/invoice 운영, B2B tenant/team admin, 운영 mutation 확대, 유료 복구/영구 삭제 정책

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

환경 변수 정본은 `FE/admin-web/.env`와 `../../AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. Vite는 로컬 override 파일을 읽을 수 있지만, 공유 환경 계약은 공통 환경 문서의 `VITE_*` 변수명만 기준으로 한다.

## Auth

Admin Web은 입력받은 Backend App access token으로 `GET /admin/api/me`를 호출해 관리자 권한을 확인한다. 운영 코드는 로컬 가짜 관리자/일반 사용자 token이나 역할 대체값을 사용하지 않는다.

관리자 보호 route는 `ProtectedAdminRoute`와 `AdminShell` 아래에서 렌더링된다. 일반 사용자 token은 Backend AdminGuard에서 403 또는 접근 차단으로 처리되어야 한다.

## 현재 구현 상태

실제 Backend API 연동 완료:

- `GET /admin/api/me`
- `GET /admin/api/users`
- `GET /admin/api/users/:userId`
- `GET /admin/api/users/:userId/activity-timeline`
- `GET /admin/api/users/:userId/domain-records`
- `GET /admin/api/users/:userId/trash-summary`
- `GET /admin/api/users/:userId/trash-records`
- `GET /admin/api/audit-logs`
- `POST /admin/api/sensitive/raw-access`
- `GET /admin/api/provider-failures`
- `GET /admin/api/provider-failures/:failureId`
- `GET /admin/api/analytics/overview`
- `GET /admin/api/account-deletion-requests`
- `GET /admin/api/data-export-requests`
- `GET /admin/api/trash/recovery-requests`
- `GET /admin/api/system/operation-checks/latest`
- `POST /admin/api/system/operation-checks`

현재 active route:

- `/users`
- `/users/:userId`
- `/users/:userId/domain`
- `/users/:userId/trash`
- `/provider-failures`
- `/account-requests`
- `/trash/recovery-requests`
- `/analytics`
- `/audit-logs`
- `/system`

코드에 존재하지만 현재 노출하지 않는 준비/비활성 범위:

- `src/features/admin-query`: legacy dashboard/global domain/raw access path 기대 코드. 현재 active route/menu 계약이 아니므로 연결하지 않는다.
- `/organizations`, `/subscriptions`, `/support` route는 `/`로 redirect한다.
- `organization-management`, `subscription-management`, `support` feature는 scaffold이며 현재 열지 않는다.

## 검증

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

`pnpm run test:e2e`는 현재 Admin Operation route smoke를 기준으로 유지한다. Backend와 외부 Provider는 Playwright mock으로 대체한다.

현재 수동 smoke 범위:

- Admin login
- non-admin 접근 차단
- `/admin/api/me` 보호 라우트 검증
- 사용자 overview, 도메인 탭, 민감 원문 조회 사유 validation
- provider failure, analytics, account request, Trash recovery request, system gate smoke
- `/organizations`, `/subscriptions`, `/support` redirect 경계 확인

2026-08-09 G05 closeout 기준 `typecheck`, `lint`, `test:e2e` 통과 상태로 기록되어 있다. 최신 실행 결과는 `TODO/SERVICE_QA_PLAN/COMMON/QA-RESULTS.md`에 별도 기록한다.

Vercel project root: `FE/admin-web`
