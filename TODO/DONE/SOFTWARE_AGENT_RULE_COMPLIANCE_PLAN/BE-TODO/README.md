# BE TODO

상태: Done / Archived

## 1. 목적

Backend 쪽 SOFTWARE_AGENT 규칙 정합성 작업을 관리한다.

## 2. 관련 goal

- G02 Backend application -> presentation 의존 제거: 2026-08-11 구현 및 검증 완료
- G03 Backend Admin Operation Prisma type boundary 정리: 2026-08-11 구현 및 검증 완료
- G04 Backend cross-module repository boundary 정리: 2026-08-11 구현 및 검증 완료
- G05 Backend 주석 커버리지 보완: 2026-08-11 구현 및 검증 완료

2026-08-12 재검토에서 G05 application orchestration numbered step comment 후속 보완 3건을 `TODO_LOG/2026-08-11/G05_BE_COMMENT_COVERAGE/WORK_LOG.md`에 기록했다.

## 3. 우선순위

1. application -> presentation 의존 제거: 완료
2. Admin Operation Prisma type 제거: 완료
3. cross-module repository boundary 정리: 완료
4. 주석 보완: 완료

남은 후속 보완은 완료 보관 폴더를 직접 수정하지 않고 새 활성 계획으로 분리한다.

## 4. 공통 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
```
