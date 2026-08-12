# G01 Admin Web Auth Mock Removal

상태: Implemented / Verified
영역: FE Admin
우선순위: Critical

## 0. 필수 준수 원칙

- 이 goal을 구현할 때는 `AGENT/SOFTWARE_AGENT` 하위 관련 문서를 반드시 먼저 확인하고 그대로 따른다.
- goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 우선한다.
- 충돌이나 누락이 발견되면 구현 전에 TODO 문서를 보완하고 근거를 기록한다.

## 1. 목적

Admin Web에서 mock token 로그인과 fallback role 우회를 제거한다. Admin Web 접근은 실제 Backend `/admin/api/me` 검증 결과만 신뢰한다.

현재 Backend의 초기 관리자 승격 기준은 `INITIAL_ADMIN_EMAILS` 환경 변수 allowlist다. Admin Web은 이 서버 기준과 `AdminGuard` 판정을 우회하지 않고, BE가 반환한 사용자 role만 관리자 접근 기준으로 사용한다.

## 2. 대상 파일

- `FE/admin-web/src/features/auth/auth-provider.tsx`
- `FE/admin-web/src/features/auth/auth-context.ts`
- `FE/admin-web/src/features/auth/protected-admin-route.tsx`
- `FE/admin-web/src/pages/login/index.tsx`
- 필요 시 `FE/admin-web/src/features/auth/api/admin-auth-api.ts`

## 3. 포함 범위

- `adminMockAccessToken`, `userMockAccessToken` 제거
- `fallbackRole` 기반 role 세팅 제거
- `loginAsAdmin`, `loginAsUser` 제거 또는 개발 전용이 아닌 production code에서 제거
- 로그인 화면의 “관리자로 계속”, “일반 사용자로 계속” 버튼 제거
- token 입력 기반 `/admin/api/me` 검증 성공 시에만 authenticated 처리
- `INITIAL_ADMIN_EMAILS` 기반 초기 관리자 승격과 `AdminGuard` 판정을 Admin Web의 최종 관리자 권한 기준으로 유지
- 실패 시 token clear, user/role clear, error 표시
- 관련 함수/handler에 `// 기능 : ...` 주석 추가

## 4. 제외 범위

- Admin Web OAuth 로그인 신규 구현
- Backend auth API 변경
- Admin role 정책 변경
- `INITIAL_ADMIN_EMAILS` 동작 변경
- 로그인 화면의 UX/UI 재설계, 레이아웃 변경, 스타일 변경
- `AGENT/UXUI_AGENT` 기준의 화면 개선 작업

## 5. 완료 기준

- Admin Web UI에서 mock login 버튼이 보이지 않는다.
- mock login 버튼 제거 외의 화면 디자인과 레이아웃은 유지한다.
- `/admin/api/me` 검증 실패 시 role이 세팅되지 않는다.
- `ProtectedAdminRoute`는 실제 `role === "ADMIN"`일 때만 접근을 허용한다.
- Admin Web은 FE 자체 role 주입 없이 `/admin/api/me`가 반환한 `ADMIN` role만 신뢰한다.
- `INITIAL_ADMIN_EMAILS`에 없는 이메일이 프론트 fallback으로 관리자 화면을 통과할 수 없다.
- `rg -n "mock-.*token|loginAsAdmin|loginAsUser|fallbackRole|관리자로 계속|일반 사용자로 계속" FE/admin-web/src` 결과가 의도된 문서/테스트 외에는 없다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

## 7. 구현 결과

- `FE/admin-web/src/features/auth/auth-provider.tsx`에서 mock access token 상수와 fallback role 처리를 제거했다.
- `FE/admin-web/src/features/auth/auth-context.ts`에서 `loginAsAdmin`, `loginAsUser` 계약을 제거했다.
- `FE/admin-web/src/pages/login/index.tsx`에서 mock login 버튼과 관련 handler를 제거하고 token 입력 기반 검증만 유지했다.
- `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`를 token 입력 흐름 기준으로 갱신했다.
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`의 Admin Web 인증 설명을 mock token 기준에서 `/admin/api/me` 서버 검증 기준으로 갱신했다.

## 8. 검증 결과

검증일: 2026-08-11
완료 로그: `TODO_LOG/2026-08-11/G01_ADMIN_WEB_AUTH_MOCK_REMOVAL/WORK_LOG.md`

```powershell
cd D:\workspace_repository\onehandsales
rg -n "mock-.*token|loginAsAdmin|loginAsUser|fallbackRole|관리자로 계속|일반 사용자로 계속" FE/admin-web/src

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test:e2e -- admin-web-smoke.spec.ts
```

결과:

- 금지 문자열 검색 결과 없음
- `typecheck` 통과
- `lint` 통과
- Admin Web smoke E2E 1 test 통과
