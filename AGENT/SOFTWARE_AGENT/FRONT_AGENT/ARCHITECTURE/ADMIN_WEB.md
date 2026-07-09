# Admin Web Frontend Architecture

이 문서는 `FE/admin-web`의 정본 frontend 아키텍처를 정의한다. Admin Web은 후속 단계에서 만들 desktop-first 운영 도구다. 현재는 관리자 권한 확인과 보호 route만 유지한다. 운영 조회 route는 root로 redirect하고 메뉴에서 숨기며, 실제 운영 페이지 구현은 현재 User Web MVP 범위에 포함하지 않는다.

## 1. 기술 기준

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
| 표/대시보드 | TanStack Table, 필요 시 Recharts |
| 입력 검증 | React Hook Form, Zod |
| 빌드 검증 | `tsc -b`, `vite build` |

## 2. 구조 원칙

- User Web과 동일하게 feature-first 구조를 사용한다.
- 관리자 전용 API는 `src/lib/admin-api-client.ts`에서만 호출한다.
- Admin Web은 `/admin/api/*`만 호출한다.
- 운영 작업은 추적 가능해야 하며 위험한 변경 UI는 확인 modal과 감사 로그 요구사항을 고려한다.
- Admin route는 desktop-first로 설계한다. 모바일 최적화는 필수가 아니다.

## 3. 현재 라우트

현재 `FE/admin-web/src/app/router/router.tsx` 기준:

- `/login`
- `/`
- `/users`, `/users/:userId`, `/organizations`, `/subscriptions`, `/analytics`, `/audit-logs`, `/system`, `/support`는 Backend Admin 운영 API 구현 전까지 `/`로 redirect한다.

## 4. 현재 Feature 폴더

현재 `FE/admin-web/src/features` 기준:

- `admin-query`
- `audit-log`
- `auth`
- `organization-management`
- `subscription-management`
- `support`
- `system-config`
- `usage-analytics`
- `user-management`

## 5. 현재 API 연동 상태

실제 Backend API 연동 완료:

- `GET /admin/api/me`

후속 Admin 페이지 구현 시 필요한 API:

- `GET /admin/api/dashboard`
- `GET /admin/api/users`
- `GET /admin/api/companies`
- `GET /admin/api/contacts`
- `GET /admin/api/products`
- `GET /admin/api/deals`
- 감사 로그 조회 API
- 민감 원문 조회 API

`src/features/admin-query/api/admin-query-api.ts`는 위 운영 조회 API 계약을 기대한다. Backend 구현 전까지 해당 화면은 route와 메뉴에서 노출하지 않으며, 현재 제품 구현 우선순위에서는 관리자 페이지를 완성 범위로 보지 않는다.

## 6. Auth 상태

Admin Web은 현재 local mock admin/user token을 사용해 보호 라우트와 non-admin 차단 흐름을 검증한다. Backend는 현재 `/admin/api/me`만 제공한다.

## 6A. 테스트 상태

현재 `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`는 과거 dashboard/users/data/audit 운영 화면 기대값을 포함한다. 하지만 현재 라우터는 `/users`, `/organizations`, `/subscriptions`, `/analytics`, `/audit-logs`, `/system`, `/support`를 모두 `/`로 redirect한다. 따라서 현재 Admin Web release gate는 우선 `typecheck`, `lint`, `build`, admin/non-admin 수동 smoke이며, Playwright E2E는 현재 라우터 기준으로 갱신한 뒤 gate로 사용한다.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
