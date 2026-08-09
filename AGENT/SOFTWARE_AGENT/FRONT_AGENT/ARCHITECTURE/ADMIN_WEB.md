# Admin Web Frontend Architecture

이 문서는 `FE/admin-web`의 정본 frontend 아키텍처를 정의한다. Admin Web은 11 Admin Operation 기준으로 내부 운영자가 사용하는 desktop-first 운영 도구다.

스냅샷 기준일: 2026-08-09 G05 Admin Web architecture legacy closeout

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
- Admin Web은 `/admin/api/*`만 호출하고 일반 User API인 `/api/*`를 호출하지 않는다.
- 운영 작업은 추적 가능해야 하며 위험한 변경 UI는 확인 modal과 감사 로그 요구사항을 고려한다.
- Admin route는 desktop-first로 설계한다. 모바일 최적화는 필수가 아니다.

## 3. 현재 route 기준

현재 `FE/admin-web/src/app/router/router.tsx` 기준이다.

| 상태 | Route | 화면 |
| --- | --- | --- |
| 공개 | `/login` | Admin login |
| 보호 active | `/` | Admin root placeholder |
| 보호 active | `/users` | 사용자 목록 |
| 보호 active | `/users/:userId` | 사용자 상세 overview |
| 보호 active | `/users/:userId/domain` | 사용자 도메인 read-only 탭 |
| 보호 active | `/users/:userId/trash` | 사용자 Trash |
| 보호 active | `/provider-failures` | Provider failure 운영 |
| 보호 active | `/account-requests` | 계정/데이터 요청 queue |
| 보호 active | `/trash/recovery-requests` | Trash 복구 요청 queue |
| 보호 active | `/analytics` | 운영 분석 요약 |
| 보호 active | `/audit-logs` | 감사 로그 |
| 보호 active | `/system` | 운영 gate |
| redirect | `/organizations` | `/`로 이동한다. Customer/B2B tenant admin route가 아니다. |
| redirect | `/subscriptions` | `/`로 이동한다. Billing Admin route가 아니다. |
| redirect | `/support` | `/`로 이동한다. 운영 지원 화면을 열지 않는다. |

## 4. 현재 Feature 폴더

현재 active route/API 계약에 연결된 feature:

- `account-request-management`
- `audit-log`
- `auth`
- `provider-failure-management`
- `system-config`
- `trash-management`
- `usage-analytics`
- `user-management`

현재 legacy 또는 inactive 경계:

- `admin-query`는 과거 dashboard, 전역 domain list/detail, legacy raw access path를 기대하는 준비 코드다. 현재 주력 route/API 계약이 아니며 router와 menu에 연결하지 않는다.
- `organization-management`, `subscription-management`, `support`는 빈 scaffold다. 현재 route를 열지 않는다.

## 5. 현재 API 연동 상태

현재 active feature가 사용하는 Backend Admin API:

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

`src/features/admin-query/api/admin-query-api.ts`가 기대하는 `/dashboard`, 전역 `/:domain`, legacy sensitive raw path는 현재 active Admin Web 계약이 아니다. 이 코드는 route/menu 미연결 legacy boundary로 문서화하고, G05에서는 새 route/API를 열지 않는다.

## 6. Auth 상태

Admin Web은 `GET /admin/api/me`로 관리자 권한을 확인한다. 보호 route는 `ProtectedAdminRoute`와 `AdminShell` 아래에서 렌더링된다.

## 7. 테스트 상태

`FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`는 현재 Admin route, non-admin 차단, 사용자 overview, 도메인 탭 reason modal validation, provider failure, analytics, account request, Trash recovery request, system gate smoke를 확인한다.

G05 closeout의 필수 검증 gate는 `pnpm run typecheck`, `pnpm run lint`, Admin Web `/api/*` 정적 검색, `git diff --check`다. Playwright E2E 설명은 현재 test 상태와 충돌하지 않아야 한다.

## 8. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
