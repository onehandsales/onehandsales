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
| 스타일 | Tailwind CSS 3, PostCSS, shadcn/ui, Pretendard Font |
| 아이콘 | lucide-react |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | 필요할 때만 Zustand |
| 표/대시보드 | TanStack Table, 필요 시 Recharts |
| 폼 검증 | React Hook Form, Zod |

## 초기 범위

- 사용자 관리
- 조직 관리
- 구독 관리
- 사용량 분석
- 감사 로그
- 시스템 설정
- 운영 지원

Admin API는 `/admin/api/*`를 사용한다.

## 로컬 실행

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
cp .env.example .env
pnpm install
pnpm run dev
```

로컬 URL: `http://localhost:5174`

`.env` 기본값:

```text
VITE_API_URL="http://localhost:3000"
VITE_SUPABASE_REDIRECT_URL="http://localhost:5174/auth/callback"
```

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
pnpm run test:e2e
```

`pnpm run test:e2e`는 Playwright smoke를 실행한다. Backend와 외부 Provider는 route mock으로 대체하며, 테스트용 Vite server는 `http://127.0.0.1:5176`을 사용한다.

Smoke 범위:

- Admin login
- non-admin 접근 차단
- 사용자 목록/상세 조회 화면
- 전체 딜 목록 조회 화면
- 민감 데이터 masking 확인
- 사유 입력 후 원문 조회 UI 확인
- 감사 로그 UI 확인

Vercel project root: `FE/admin-web`
