# Admin Web TODO

상태: Draft

## 1. G01 Admin Web mock 로그인 제거

상태: 완료 / 검증 완료

대상:

- `FE/admin-web/src/features/auth/auth-provider.tsx`
- `FE/admin-web/src/features/auth/auth-context.ts`
- `FE/admin-web/src/features/auth/protected-admin-route.tsx`
- `FE/admin-web/src/pages/login/index.tsx`

작업:

- mock token 상수 제거
- fallback role 제거
- `loginAsAdmin`, `loginAsUser` 제거
- mock login 버튼 제거
- mock login 버튼 제거 외의 로그인 화면 디자인, 레이아웃, 스타일은 유지
- token 기반 `/admin/api/me` 검증만 허용
- BE의 `INITIAL_ADMIN_EMAILS` 기반 초기 관리자 승격과 `AdminGuard` 판정을 Admin Web의 최종 관리자 권한 기준으로 유지
- 검증 실패 시 token/user/role clear
- 수정 함수에 `// 기능 : ...` 주석 추가

검증:

```powershell
cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
rg -n "mock-.*token|loginAsAdmin|loginAsUser|fallbackRole|관리자로 계속|일반 사용자로 계속" src
```

## 2. G06 Admin Web feature boundary

대상:

- `FE/admin-web/src/features/admin-query/*`
- `FE/admin-web/src/features/auth/*`
- 신규 Admin feature export 경계

작업:

- legacy/inactive `admin-query` 사용 여부 확인
- 활성 route에서 쓰지 않는 내부 feature는 새 작업에서 확장하지 않는다.
- 필요한 공개 API는 feature `index.ts`로 노출한다.

## 3. G07 Admin Web 주석 보완

대상:

- auth provider/context/protected route/login page
- Admin API client 함수
- 수정한 screen/helper

작업:

- component/function/hook/API client/handler에 `// 기능 : ...` 추가
- client log에 token, reason text, PII를 남기지 않는다.
