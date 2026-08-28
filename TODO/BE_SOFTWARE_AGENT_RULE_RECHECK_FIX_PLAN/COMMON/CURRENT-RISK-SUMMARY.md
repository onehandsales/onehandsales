# Current Risk Summary

상태: In Progress / G01-G03 resolved on 2026-08-28

## 1. 결론

기존 BE 검증에서 typecheck, lint, prisma validate, test는 통과했지만 Backend Agent 규칙 기준으로 아래 수정 또는 감사 항목이 남아 있다.

G01은 2026-08-28 완료되었고, `admin-operation/presentation`의 `@prisma/client` import는 0건으로 확인되었다.
G02는 2026-08-28 완료되었고, `sales-report/application`의 schedule repository 직접 의존과 `ScheduleModule` repository token export는 0건으로 확인되었으며 `1e86c06c`로 구현/로그 커밋이 완료되었다.
G03은 2026-08-28 완료되었고, AI Weekly Report 조회 이벤트 `weekViewed`, `detailViewed`, `snapshotSummaryViewed`가 실제 코드와 테스트에 반영되었으며 `c915111f`로 구현/로그 커밋이 완료되었다.

## 2. P1

| 항목 | 리스크 | Goal | 상태 |
| --- | --- | --- | --- |
| admin-operation presentation Prisma enum | presentation DTO/mapper가 `@prisma/client` enum에 직접 의존했다. | G01 | 해결 완료 |
| sales-report schedule repository import | sales-report application service가 schedule repository port를 직접 import/inject했다. | G02 | 해결 완료 |

## 3. P2

| 항목 | 리스크 | Goal | 상태 |
| --- | --- | --- | --- |
| AI Weekly Report observability | API-SPEC의 조회 이벤트가 실제 코드에 일부 없다. | G03 | 해결 완료 |
| AI Weekly Report `summaryPreview` | API-SPEC과 FE 타입에는 있으나 BE response에는 없다. | G04 | 남음 |
| 한글 주석 규칙 | 일부 class/interface/type/method/helper에 한글 역할/기능 주석이 누락되어 있다. | G05 | 남음 |

## 4. P3

| 항목 | 리스크 | Goal |
| --- | --- | --- |
| bootstrap `process.env` | 공통 환경 문서는 bootstrap local env read를 허용하지만 Backend convention은 direct `process.env` 금지를 적고 있어 예외가 명확하지 않다. | G06 |
| API-SPEC template | API-SPEC 문서 다수의 template 필수 항목 누락 여부가 확인되었지만 DONE archive와 활성 TODO를 구분해야 한다. | G07 |
| presentation repository projection type | presentation DTO/mapper가 repository port projection type을 import하는 패턴이 다수 있다. 직접 repository 사용인지, read model type 공유인지 감사가 필요하다. | G08 |

## 5. 기존 검증 결과

2026-08-28 기준 이전 재검토에서 실행된 명령:

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run prisma:validate
pnpm.cmd test -- --runInBand
```

결과:

- `typecheck`: 통과
- `lint`: 통과
- `prisma:validate`: 통과
- `test`: 103 suites / 545 tests 통과

추가 정적 확인 결과:

- Domain forbidden dependency matches: 0
- Application direct Prisma/provider matches: 0
- Presentation Prisma/transaction matches: 0
- Controller repo/prisma/transaction mentions: 0
- Admin controller guard misses: 0
- Missing API comments: 0
- `console.*` matches: 0
- production `any` keyword matches: 0
- Cross-module repository/import persistence violations: 0

## 6. 다음 Goal에서 다시 확인해야 하는 현재 위치

- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- `BE\src\modules\schedule\presentation\http\dto\schedule-request.dto.ts`
- `BE\src\modules\schedule\application\ports\schedule.repository.ts`
- `FE\user-web\src\features\ai-weekly-report\types\ai-weekly-report.ts`

## 7. 해결 완료 위치

- G01: `BE\src\modules\admin-operation\presentation\http\admin-audit-response.mapper.ts`
- G01: `BE\src\modules\admin-operation\presentation\http\dto\admin-audit-request.dto.ts`
- G01: `BE\src\modules\admin-operation\presentation\http\dto\admin-user-request.dto.ts`
- 완료 로그: `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G01_ADMIN_OPERATION_PRESENTATION_PRISMA_ENUM\WORK_LOG.md`
- G02: `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- G02: `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.spec.ts`
- G02: `BE\src\modules\schedule\application\ports\schedule-weekly-report-query.port.ts`
- G02: `BE\src\modules\schedule\application\ports\schedule.repository.ts`
- G02: `BE\src\modules\schedule\application\services\schedule-application.service.ts`
- G02: `BE\src\modules\schedule\application\services\schedule-application.service.spec.ts`
- G02: `BE\src\modules\schedule\infrastructure\schedule.module.ts`
- 완료 로그: `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G02_SALES_REPORT_SCHEDULE_REPOSITORY_BOUNDARY\WORK_LOG.md`
- G03: `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- G03: `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.spec.ts`
- 완료 로그: `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G03_AI_WEEKLY_REPORT_OBSERVABILITY\WORK_LOG.md`
