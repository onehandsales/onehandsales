# BE TODO

상태: Draft

## 1. 목적

Backend 쪽 SOFTWARE_AGENT 규칙 정합성 작업을 관리한다.

## 2. 관련 goal

- G02 Backend application -> presentation 의존 제거: 2026-08-11 구현 및 검증 완료
- G03 Backend Admin Operation Prisma type boundary 정리
- G04 Backend cross-module repository boundary 정리
- G05 Backend 주석 커버리지 보완

## 3. 우선순위

1. application -> presentation 의존 제거: 완료
2. Admin Operation Prisma type 제거: 다음 권장 작업
3. cross-module repository boundary 정리
4. 주석 보완

## 4. 공통 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
```
