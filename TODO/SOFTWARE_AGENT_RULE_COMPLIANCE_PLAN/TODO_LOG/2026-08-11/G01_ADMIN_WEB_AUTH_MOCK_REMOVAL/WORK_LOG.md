# G01 Admin Web Auth Mock Removal Work Log

상태: 완료 / 검증 완료
작업일: 2026-08-11
대상 goal: `COMMON/GOAL-SPECS/G01-ADMIN-WEB-AUTH-MOCK-REMOVAL.goal.md`

## 1. 작업 범위

- Admin Web production source에서 mock admin/user access token 상수를 제거했다.
- `fallbackRole` 기반 role 세팅을 제거했다.
- `loginAsAdmin`, `loginAsUser` 인증 컨텍스트 계약과 로그인 화면 handler를 제거했다.
- 로그인 화면은 기존 token 입력 form을 유지하고 `/admin/api/me` 검증 성공 시에만 관리자 인증 상태를 세팅하도록 정리했다.
- mock login 버튼 제거 외의 로그인 화면 디자인, 레이아웃, 스타일은 변경하지 않았다.
- 변경된 auth 함수, 컴포넌트, API 함수, 타입에 `// 기능 : ...` 또는 `// 역할 : ...` 한글 주석을 보강했다.
- Admin Web smoke E2E는 버튼 기반 로그인이 아니라 token 입력 기반 검증 흐름으로 갱신했다.

## 2. 수정 파일

- `FE/admin-web/src/features/auth/auth-provider.tsx`
- `FE/admin-web/src/features/auth/auth-context.ts`
- `FE/admin-web/src/features/auth/types/admin-auth.ts`
- `FE/admin-web/src/features/auth/protected-admin-route.tsx`
- `FE/admin-web/src/features/auth/api/admin-auth-api.ts`
- `FE/admin-web/src/pages/login/index.tsx`
- `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`
- `TODO/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN/*`
- `TODO/README.md`

## 3. 검증 결과

```powershell
cd D:\workspace_repository\onehandsales
rg -n "mock-.*token|loginAsAdmin|loginAsUser|fallbackRole|관리자로 계속|일반 사용자로 계속" FE/admin-web/src
git diff --check

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test:e2e -- admin-web-smoke.spec.ts
```

결과:

- 금지 문자열 검색 결과 없음
- `git diff --check` 통과
- Admin Web `typecheck` 통과
- Admin Web `lint` 통과
- Admin Web smoke E2E 1 test 통과

## 4. 남은 후속 작업

- 다음 권장 goal은 `G02-BE-APPLICATION-PRESENTATION-BOUNDARY.goal.md`다.
