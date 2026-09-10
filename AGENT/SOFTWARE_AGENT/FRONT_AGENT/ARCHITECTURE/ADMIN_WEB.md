# Admin Web Frontend Architecture

이 문서는 `FE/admin-web`의 정본 frontend 아키텍처를 정의한다. 현재 Admin Web은 관리자 권한 확인 전용 앱이다.

스냅샷 기준일: 2026-09-10 관리자 권한 확인 범위 반영

## 1. 기술 기준

| 구분 | 기술 |
| --- | --- |
| 런타임 | Node.js 24 LTS |
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 번들러/개발 서버 | Vite 7 |
| 라우터 | React Router DOM 7 |
| 스타일 | Tailwind CSS 3, PostCSS |
| 빌드 검증 | `tsc -b`, `vite build` |

## 2. 구조 원칙

- User Web의 도메인 feature를 직접 재사용하지 않는다.
- 관리자 확인 API는 `src/lib/admin-api-client.ts`에서만 호출한다.
- Admin Web은 일반 User API인 `/api/*`를 호출하지 않는다.
- 관리자 권한 판단은 Backend 응답을 신뢰 기준으로 둔다.

## 3. 현재 route 기준

현재 `FE/admin-web/src/app/router/router.tsx` 기준이다.

| 상태 | Route | 화면 |
| --- | --- | --- |
| 공개 | `/login` | Admin login |
| 보호 active | `/` | Admin auth 확인 화면 |
| redirect | `*` | `/`로 이동 |

## 4. 현재 Feature 폴더

현재 active route/API 계약에 연결된 feature:

- `auth`

## 5. 현재 API 연동 상태

현재 Admin Web이 사용하는 Backend API:

- `GET /admin/api/me`

## 6. Auth 상태

Admin Web은 `GET /admin/api/me`로 관리자 권한을 확인한다. 보호 route는 `ProtectedAdminRoute`가 감싼 `HomePage`에서 렌더링된다.

## 7. 테스트 상태

`FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`는 관리자 token 통과, non-admin 차단, `GET /admin/api/me` 호출만 확인한다.

필수 검증 gate는 `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e`다.

## 8. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
