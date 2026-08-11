# FE TODO

상태: Draft

## 1. 목적

Frontend 쪽 SOFTWARE_AGENT 규칙 정합성 작업을 관리한다.

## 2. 관련 goal

- G01 Admin Web mock 로그인 제거
- G06 Frontend feature public API boundary 정리
- G07 Frontend 주석 커버리지 보완

## 3. 우선순위

1. Admin Web mock 로그인 제거
2. feature public API boundary 정리
3. 주석 보완

## 4. 공통 검증

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

