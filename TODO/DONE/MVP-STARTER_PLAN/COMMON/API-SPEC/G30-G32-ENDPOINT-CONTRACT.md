# 현재 Admin 엔드포인트 구현 계약

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 1. 목적

이 문서는 현재 활성화된 Admin 권한 확인 엔드포인트를 구현자가 바로 대조할 수 있도록 정리한다.

Admin dashboard, 도메인 목록, 민감정보 원문 조회, 감사 로그 API는 현재 Backend 런타임과 Prisma schema에 없으므로 이 문서의 구현 계약에 포함하지 않는다.

## 2. Admin 권한 확인 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 관리자 권한 확인 | `GetAdminMe` | Authorization bearer token | `AuthGuard`로 access token을 검증하고 `AdminGuard`로 `ADMIN` role을 확인한다. | `AdminMeResponse`: `id`, `email`, `name`, `role` | `User` 조회. transaction 없음. | `Unauthorized` 401, `Forbidden` 403 |

## 3. FE 처리 기준

- `FE/admin-web`은 로그인 화면에서 사용자가 입력한 Backend App access token으로 `GET /admin/api/me`를 호출한다.
- 성공하면 보호 route의 최소 Admin 확인 화면을 렌더링한다.
- 401/403 또는 기타 실패는 접근 불가 상태로 표시한다.
- 이 앱은 현재 Admin business CRUD 화면을 제공하지 않는다.

## 4. 관련 문서

- `BE/src/modules/auth/presentation/http/me.controller.ts`
- `FE/admin-web/README.md`
- `FE/admin-web/ARCHITECTURE.md`
- `FE/admin-web/src/features/auth/api/admin-auth-api.ts`
- `FE/admin-web/src/pages/home/index.tsx`
