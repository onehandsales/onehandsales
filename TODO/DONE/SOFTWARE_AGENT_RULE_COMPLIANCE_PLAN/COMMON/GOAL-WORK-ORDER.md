# Goal Work Order

상태: Done / Archived

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
- G04 Backend cross-module repository boundary는 2026-08-11 구현 및 검증을 완료했다.
- G04 완료 로그는 `TODO_LOG/2026-08-11/G04_BE_CROSS_MODULE_REPOSITORY_BOUNDARY/WORK_LOG.md`다.
- G05 Backend comment coverage는 2026-08-11 구현 및 검증을 완료했고, 2026-08-12 재검토에서 후속 보완 3건을 기록했다.
- G05 완료 로그는 `TODO_LOG/2026-08-11/G05_BE_COMMENT_COVERAGE/WORK_LOG.md`다.
- G06 Frontend feature public API boundary는 2026-08-11 구현 및 검증을 완료했고, 2026-08-12 재검토에서도 후속 코드 보완 항목이 없음을 확인했다.
- G06 완료 로그는 `TODO_LOG/2026-08-11/G06_FE_FEATURE_PUBLIC_API_BOUNDARY/WORK_LOG.md`다.
- G07 Frontend comment coverage는 2026-08-11 구현 및 검증을 완료했고, 2026-08-12 재검토에서 후속 보완 1건을 기록했다.
- G07 완료 로그는 `TODO_LOG/2026-08-11/G07_FE_COMMENT_COVERAGE/WORK_LOG.md`다.
- 현재 모든 goal 구현과 goal별 검증을 완료했다. 2026-08-12 재검토에서 확인한 G05 후속 보완 항목은 G05 완료 로그에 기록했고, G06 재검토 결과는 G06 완료 로그에 기록했다. G07 재검토에서 확인한 후속 보완 항목은 G07 완료 로그에 기록했다.
- 계획 전체는 2026-08-12에 완료 처리되어 `TODO/DONE/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN`으로 보관한다.

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

G04 추가 검증 완료:

```powershell
cd D:\workspace_repository\onehandsales
rg -n "PrismaNotificationRepository|modules/notification/application/ports/notification.repository" BE/src/modules/deal BE/src/modules/schedule --glob "*.ts" --glob "!**/*.spec.ts"
rg -n "PrismaDealActivityRepository|modules/deal/application/services/deal-activity-helper|modules/deal/infrastructure/persistence/prisma-deal-activity.repository" BE/src/modules/schedule BE/src/modules/meeting-note BE/src/modules/follow-up --glob "*.ts" --glob "!**/*.spec.ts"
rg -n "this\\.client\\.(deal|dealActivity|dealFollowingActionLog|notification)\\b" BE/src/modules/schedule BE/src/modules/meeting-note BE/src/modules/follow-up --glob "*.ts" --glob "!**/*.spec.ts"

cd D:\workspace_repository\onehandsales\BE
pnpm.cmd test -- prisma-notification-reminder-writer.spec.ts prisma-deal-boundary.adapter.spec.ts prisma-schedule.repository.spec.ts prisma-google-calendar-sync.repository.spec.ts prisma-google-calendar-connection.repository.spec.ts prisma-meeting-note.repository.spec.ts prisma-follow-up-message.repository.spec.ts notification-reminder-scheduling.use-cases.spec.ts deal-application.service.spec.ts schedule-application.service.spec.ts google-calendar-sync.service.spec.ts google-calendar-connection.service.spec.ts
pnpm.cmd test
```

G05 추가 검증 완료:

```powershell
cd D:\workspace_repository\onehandsales
git diff --check

cd D:\workspace_repository\onehandsales\BE
pnpm.cmd test
```

추가로 우선 대상 controller와 G02-G04 변경 Backend source 66개 파일의 class/interface/function/method/API 주석 누락이 0개임을 AST 기반 수동 감사로 확인했다.

### G06-G07

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

G06 추가 검증 완료:

- `FE/user-web/src/features`와 `FE/admin-web/src/features`의 cross-feature deep import 감사 결과: 0건
- `FE/user-web/src/pages`와 `FE/user-web/src/components/layout`까지 포함한 외부 feature deep import 감사 결과: 0건
- feature 내부에서 자기 feature public `index.ts`를 import하는 순환 위험 후보 감사 결과: 0건
- public `index.ts` export 파일의 runtime broad import 순환 후보 감사 결과: 0건
- 반복 참조되는 query key와 딜 선택/상태/후속 액션 API는 top-level public sub-entry로 분리해 넓은 barrel import를 줄였다.
- `FE/user-web`: `pnpm run typecheck`, `pnpm run lint` 통과
- `FE/admin-web`: `pnpm run typecheck`, `pnpm run lint` 통과

G07 추가 검증 완료:

- G06 수정 파일, G07 수정 파일, `FE/admin-web/src/features/auth/*`, `FE/user-web/src/app/router/route-elements.tsx`, `FE/user-web/src/components/layout/app-shell.tsx` 포함 64개 대상 파일의 component/function/hook/handler 주석 AST 감사 결과 누락 0건
- `console.log`, `console.debug`, `console.info`, `console.warn`, `console.error` 직접 사용 발견 없음
- 변경 diff에 logging sink 추가 없음
- TypeScript/TSX 코드 변경은 `// 기능 : ...` 주석 추가로만 제한했다.
- `FE/user-web`: `pnpm run typecheck`, `pnpm run lint` 통과
- `FE/admin-web`: `pnpm run typecheck`, `pnpm run lint` 통과

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

Closeout 검증 완료:

- 2026-08-11 `BE`: `pnpm run typecheck`, `pnpm run lint` 통과
- 2026-08-11 `FE/user-web`: `pnpm run typecheck`, `pnpm run lint` 통과
- 2026-08-11 `FE/admin-web`: `pnpm run typecheck`, `pnpm run lint` 통과
