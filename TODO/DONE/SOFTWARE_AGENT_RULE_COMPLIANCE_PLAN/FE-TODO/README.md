# FE TODO

상태: Done / Archived

## 1. 목적

Frontend 쪽 SOFTWARE_AGENT 규칙 정합성 작업을 관리한다.

## 2. 관련 goal

- G01 Admin Web mock 로그인 제거
- G06 Frontend feature public API boundary 정리
- G07 Frontend 주석 커버리지 보완

## 3. 우선순위

1. Admin Web mock 로그인 제거 - 완료 / 검증 완료
2. feature public API boundary 정리 - 완료 / 검증 완료
3. 주석 보완 - 완료 / 검증 완료

## 3.1 진행 현황

- G01 Admin Web mock 로그인 제거는 2026-08-11 완료했다.
- G01에서 수정한 Admin Web auth 파일은 주석 규칙을 보강했고, typecheck/lint/Admin Web smoke E2E를 통과했다.
- G06 Frontend feature public API boundary 정리는 2026-08-11 완료했다.
- User Web feature/page/layout의 외부 feature deep import를 public index import로 정리했고, User Web/Admin Web typecheck/lint를 통과했다.
- G07 Frontend 주석 커버리지 보완은 2026-08-11 완료했다.
- G06/G07 수정 파일과 Admin Web auth 우선 범위의 `// 기능 : ...` 주석 감사를 통과했고, User Web/Admin Web typecheck/lint를 통과했다.
- 2026-08-12 재검토에서 G06은 후속 코드 보완 항목이 없음을 확인했다.
- 2026-08-12 재검토에서 G07 event handler `// 기능 : ...` 후속 보완 1건을 `TODO_LOG/2026-08-11/G07_FE_COMMENT_COVERAGE/WORK_LOG.md`에 기록했다.
- 남은 후속 보완은 완료 보관 폴더를 직접 수정하지 않고 새 활성 계획으로 분리한다.

## 4. 공통 검증

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```
