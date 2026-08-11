# Goal Work Order

상태: Draft

## 1. 원칙

각 goal은 독립적으로 review, 구현, 검증할 수 있어야 한다. 단, 앞 goal에서 정리한 구조를 뒤 goal의 기준으로 사용한다.

모든 goal은 구현 전에 `AGENT/SOFTWARE_AGENT` 관련 문서를 반드시 확인하고 그대로 따른다. goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`가 우선이다.

이번 작업은 기능 소프트웨어 아키텍처 정합성 개선이다. `AGENT/UXUI_AGENT` 기준의 UX/UI 개선이나 화면 재설계는 작업 범위에 넣지 않는다.

## 2. 권장 순서

| 순서 | Goal | 영역 | 이유 |
| --- | --- | --- | --- |
| 1 | G01 Admin Web mock 로그인 제거 | FE Admin | 운영 콘솔 접근 신뢰성 문제라 가장 먼저 처리한다. |
| 2 | G02 BE application -> presentation 의존 제거 | BE | 이후 Prisma type 정리와 주석 정리의 기준이 되는 계층 방향을 먼저 바로잡는다. |
| 3 | G03 BE Admin Operation Prisma type boundary | BE | G02 이후 application result/mapper 구조가 안정된 상태에서 Prisma enum/type을 제거한다. |
| 4 | G04 BE cross-module repository boundary | BE | transaction과 module boundary가 얽혀 있어 별도 설계/검증이 필요하다. |
| 5 | G05 BE comment coverage | BE | 구조 변경 이후 남은 class/method/API 주석을 보완한다. |
| 6 | G06 FE feature public API boundary | FE User/Admin | deep import 정리로 파일 이동/공개 API 경계를 안정화한다. |
| 7 | G07 FE comment coverage | FE User/Admin | FE 파일 구조가 안정된 뒤 대량 주석 보완을 한다. |

## 2.1 진행 현황

- G01 Admin Web mock 로그인 제거는 2026-08-11 구현 및 검증을 완료했다.
- G01 완료 로그는 `TODO_LOG/2026-08-11/G01_ADMIN_WEB_AUTH_MOCK_REMOVAL/WORK_LOG.md`다.
- G02 Backend application -> presentation 의존 제거는 2026-08-11 구현 및 검증을 완료했다.
- G02 완료 로그는 `TODO_LOG/2026-08-11/G02_BE_APPLICATION_PRESENTATION_BOUNDARY/WORK_LOG.md`다.
- G03 Backend Admin Operation Prisma type boundary는 2026-08-11 구현 및 검증을 완료했다.
- G03 완료 로그는 `TODO_LOG/2026-08-11/G03_BE_ADMIN_PRISMA_TYPE_BOUNDARY/WORK_LOG.md`다.
- 현재 다음 순서는 G04 Backend cross-module repository boundary다.

## 3. Goal별 최소 검증

### G01

```powershell
cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

G01 추가 검증 완료:

```powershell
cd D:\workspace_repository\onehandsales
rg -n "mock-.*token|loginAsAdmin|loginAsUser|fallbackRole|관리자로 계속|일반 사용자로 계속" FE/admin-web/src

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run test:e2e -- admin-web-smoke.spec.ts
```

### G02-G05

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
```

필요 시 영향 모듈 테스트를 추가한다.

G02 추가 검증 완료:

```powershell
cd D:\workspace_repository\onehandsales
rg -n "presentation/http|\\.\\./\\.\\./presentation|@/modules/.*/presentation" BE/src/modules --glob "**/application/**/*.ts" --glob "!**/*.spec.ts"
git diff --check

cd D:\workspace_repository\onehandsales\BE
pnpm.cmd test -- account-request-application.service.spec.ts admin-audit-application.service.spec.ts admin-provider-failure-application.service.spec.ts admin-user-application.service.spec.ts admin-account-request-application.service.spec.ts admin-analytics-application.service.spec.ts admin-domain-record-application.service.spec.ts admin-system-operation-application.service.spec.ts admin-trash-application.service.spec.ts
pnpm.cmd test
```

G03 추가 검증 완료:

```powershell
cd D:\workspace_repository\onehandsales
rg -n "@prisma/client" BE/src/modules/admin-operation/application --glob "!**/*.spec.ts"

cd D:\workspace_repository\onehandsales\BE
pnpm.cmd test -- admin-account-request-application.service.spec.ts admin-analytics-application.service.spec.ts admin-audit-application.service.spec.ts admin-domain-record-application.service.spec.ts admin-provider-failure-application.service.spec.ts admin-system-operation-application.service.spec.ts admin-trash-application.service.spec.ts admin-user-application.service.spec.ts prisma-admin-account-request.repository.spec.ts prisma-admin-analytics.repository.spec.ts prisma-admin-audit.repository.spec.ts prisma-admin-domain-record.repository.spec.ts prisma-admin-provider-failure.repository.spec.ts prisma-admin-system-operation.repository.spec.ts prisma-admin-trash.repository.spec.ts prisma-admin-user.repository.spec.ts
pnpm.cmd test
```

### G06-G07

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

## 4. Closeout 검증

모든 goal 완료 후 전체 검증을 다시 실행한다.

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```
