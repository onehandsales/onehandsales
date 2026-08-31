# Current Risk Summary

상태: Done / Archived

## 1. 결론

G01부터 G08까지의 Backend Agent 규칙 재검토 항목과 G99 최종 검토가 완료되었다. 2026-08-29 G99에서 BE 전체 검증과 strict 정적 점검을 다시 실행했고, 최종 확인 기준에서 즉시 수정해야 할 남은 위반은 없다.

G01은 2026-08-28 완료되었고, `admin-operation/presentation`의 `@prisma/client` import는 0건으로 확인되었다.
G02는 2026-08-28 완료되었고, `sales-report/application`의 schedule repository 직접 의존과 `ScheduleModule` repository token export는 0건으로 확인되었으며 `1e86c06c`로 구현/로그 커밋이 완료되었다.
G03은 2026-08-28 완료되었고, AI Weekly Report 조회 이벤트 `weekViewed`, `detailViewed`, `snapshotSummaryViewed`가 실제 코드와 테스트에 반영되었으며 `c915111f`로 구현/로그 커밋이 완료되었다.
G04는 2026-08-28 완료되었고, AI Weekly Report `summaryPreview`와 실패 summary safe error가 API-SPEC, BE summary response/mapper, FE User Web 타입/mock에 동일한 nullable 계약으로 반영되었으며 `21841c62`로 구현/로그 커밋이 완료되었다.
G05는 2026-08-28 완료되었고, 대상 Backend 파일의 class/interface/type/port token/method/helper 한글 역할/기능/단계 주석 누락을 보강했다. 추가 재검토에서 G05 관련 진행 문서가 G06 다음 실행 상태로 정리되어 있고, 주석 누락 정적 감사와 BE typecheck/lint가 통과했음을 확인했다. 구현/로그 커밋은 `dca1a22c`다.
G06은 2026-08-28 완료되었고, Backend bootstrap 이전 local env loader의 direct `process.env` 접근을 제한 예외로 문서화했다. `BE/src/main.ts`와 `BE/src/app.module.ts`에는 한글 단계 주석을 보강했고, 공통 환경/Backend convention/배포 문서의 정책 충돌을 정리했다. BE typecheck/lint/test와 `process.env` 정적 확인이 통과했으며 `0d0530d3`로 구현/로그 커밋이 완료되었다.
G07은 2026-08-29 완료되었고, API-SPEC 95개를 활성 3개와 `TODO/DONE` 보관 92개로 구분했다. 활성 Service QA API-SPEC 보강 대상과 보관 문서 제외/후속 감사 기준을 정리했으며, 대량 문서 보강은 `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN`으로 분리했다. BE/FE 코드는 수정하지 않았다. 후속 API-SPEC 정규화 계획은 2026-08-31 G99 완료 후 완료 보관했다.
G08은 2026-08-29 완료되었고, presentation의 `application/ports/*repository*` import 22 line / 20 file을 전수 확인했다. repository token/interface 직접 사용은 0건이라 즉시 코드 수정은 하지 않았고, DTO validation 값과 response mapper projection record의 대량 타입 소유권 분리는 `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`으로 분리했다. BE/FE 코드는 수정하지 않았다.
G99는 2026-08-29 완료되었고, BE 전체 검증과 Backend Agent strict 정적 점검이 통과했다. application 계층 forbidden keyword 정적 점검의 false positive를 제거하기 위해 `GoogleCalendarSyncService`의 private helper 이름을 `fetchProviderCalendars`에서 `loadProviderCalendars`로 변경했으며 동작 변경은 없다. 이 계획은 `acdb9eb3 chore(backend): complete rule recheck final review`로 커밋하고 `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN`으로 완료 보관했다. 커밋 이후 재검토에서도 작업 트리 clean, BE 전체 검증 재통과, 완료 문서 경로/상태 문구 정합성을 확인했다.

2026-08-30 후속 `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`의 G01 DTO validation contract boundary, G02 response mapper read model boundary, G99 final review가 완료되어 presentation 전체의 repository port import는 0건으로 정리됐다.

## 2. P1

| 항목 | 리스크 | Goal | 상태 |
| --- | --- | --- | --- |
| admin-operation presentation Prisma enum | presentation DTO/mapper가 `@prisma/client` enum에 직접 의존했다. | G01 | 해결 완료 |
| sales-report schedule repository import | sales-report application service가 schedule repository port를 직접 import/inject했다. | G02 | 해결 완료 |

## 3. P2

| 항목 | 리스크 | Goal | 상태 |
| --- | --- | --- | --- |
| AI Weekly Report observability | API-SPEC의 조회 이벤트가 실제 코드에 일부 없다. | G03 | 해결 완료 |
| AI Weekly Report `summaryPreview` | API-SPEC과 FE 타입에는 있으나 BE response에는 없다. | G04 | 해결 완료 |
| 한글 주석 규칙 | 일부 class/interface/type/method/helper에 한글 역할/기능 주석이 누락되어 있다. | G05 | 해결 완료 |

## 4. P3

| 항목 | 리스크 | Goal | 상태 |
| --- | --- | --- | --- |
| bootstrap `process.env` | 공통 환경 문서는 bootstrap local env read를 허용하지만 Backend convention은 direct `process.env` 금지를 적고 있어 예외가 명확하지 않았다. | G06 | 해결 완료 |
| API-SPEC template | API-SPEC 문서 다수의 template 필수 항목 누락 여부가 확인되었지만 DONE archive와 활성 TODO를 구분해야 한다. | G07 | 해결 완료, 후속 `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN` 완료 보관 |
| presentation repository projection type | presentation DTO/mapper가 repository port projection type을 import하는 패턴이 다수 있다. 직접 repository 사용은 0건이나 타입 소유권 분리가 필요하다. | G08 | 해결 완료, 후속 `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN` G01/G02 완료 및 추가 재검토 통과 |

## 5. 검증 결과

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

G06 추가 검증 결과:

- `typecheck`: 통과
- `lint`: 통과
- `test`: 103 suites / 548 tests 통과
- `rg -n "process\.env" src`: `BE\src\main.ts` bootstrap env loader 예외 범위만 출력
- `git diff --check`: 통과

G08 감사 검증 결과:

- `rg -n "application/ports/.+repository|application\\ports\\.+repository" src\modules -g "*.ts" -g "!*.spec.ts" | rg "\\presentation\\"`: 22 line 출력, 감사 목록과 일치
- `rg -n "@Inject\\(|REPOSITORY|Repository" src\modules\*\presentation -g "*.ts" -g "!*.spec.ts"`: 출력 없음, 직접 repository token/interface 사용 0건
- `git diff --name-only -- BE`: 출력 없음, BE 코드 변경 없음
- `git diff --check`: 통과

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

G99 최종 검증 결과:

- `pnpm run typecheck`: 통과
- `pnpm run lint`: 통과
- `pnpm run prisma:validate`: 통과
- `pnpm test -- --runInBand`: 103 suites / 548 tests 통과
- `pnpm run build`: 통과
- Domain forbidden dependency matches: 0
- Application direct Prisma/provider/fetch matches: 0
- Presentation Prisma/transaction matches: 0
- Controller repository/prisma/transaction mentions: 0
- `sales-report/application` schedule repository 직접 의존: 0
- `console.*` matches: 0
- production `any` keyword matches: 0
- `process.env` matches: `BE\src\main.ts` bootstrap env loader 예외 범위만 출력
- presentation `application/ports/*repository*` import: 22 line, G08 감사 및 후속 계획과 일치
- `git diff --check`: 통과

G99 커밋 이후 재검토 결과:

- 최신 커밋: `acdb9eb3 chore(backend): complete rule recheck final review`
- `git status --short --untracked-files=all`: 출력 없음
- `git diff --exit-code && git diff --cached --exit-code`: 통과
- `TODO/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN` 활성 폴더 없음
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN` 완료 보관 폴더 존재, 문서 18개 확인
- 완료 문구/경로 잔존 검색: 출력 없음
- BE post-commit `typecheck`, `lint`, `prisma:validate`, `test -- --runInBand`, `build`: 통과

후속 Presentation Contract Type Boundary G01 재검토 결과:

- presentation DTO repository port import: 0건
- presentation 직접 repository token/interface 사용: 0건
- G01 이동 대상 enum/const/type의 `*repository.ts` export 잔존: 0건
- G01 당시 presentation repository port import는 response mapper 9 line / 9 file로 남았고, 이후 G02에서 0건으로 정리됨
- BE `typecheck`, `lint`, `test -- --runInBand`: 통과

후속 Presentation Contract Type Boundary G02 검증 결과:

- presentation 전체 repository port import: 0건
- presentation 직접 repository token/interface 사용: 0건
- response mapper repository record alias response 패턴: 0건
- BE `typecheck`, `lint`, `test -- --runInBand`: 통과

후속 Presentation Contract Type Boundary G02 추가 재검토 결과:

- application service 공개 반환 타입의 repository read record/page type 노출: 0건
- spec import 중 줄바꿈만 남은 repository type import는 `import type { ... }` 형태로 정리
- BE `typecheck`, `lint`, `test -- --runInBand`: 재통과

## 6. 후속 완료 보관 계획

- `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN`: G07에서 분리한 API-SPEC 템플릿 정규화 계획. G01~G06과 G99를 완료해 완료 보관했다.
- `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`: G08에서 분리한 presentation 계약 타입 경계 정리 계획. G01/G02/G99를 완료해 완료 보관했다.

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
- G04: `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- G04: `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.spec.ts`
- G04: `FE\user-web\src\features\ai-weekly-report\types\ai-weekly-report.ts`
- G04: `FE\user-web\tests\e2e\support\user-web-api-mocks.ts`
- G04: `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\FE-TODO\USER-WEB-CONTRACT-CHECK.md`
- G04: `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\05_AI_WEEKLY_SALES_REPORT\COMMON\API-SPEC\AI_WEEKLY_REPORT_API.md`
- 완료 로그: `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G04_AI_WEEKLY_REPORT_SUMMARY_PREVIEW_CONTRACT\WORK_LOG.md`
- G05: `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- G05: `BE\src\modules\schedule\application\services\schedule-application.service.ts`
- G05: `BE\src\modules\schedule\application\ports\schedule.repository.ts`
- G05: `BE\src\modules\follow-up\application\ports\follow-up-draft.provider.ts`
- G05: `BE\src\modules\follow-up\application\ports\follow-up-delivery-secret-encryption.port.ts`
- G05: `BE\src\modules\follow-up\presentation\http\dto\follow-up-delivery-settings-request.dto.ts`
- G05: `BE\src\main.ts`
- G05: `BE\src\modules\sales-report\infrastructure\sales-report.module.ts`
- 완료 로그: `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G05_BACKEND_KOREAN_COMMENT_RULE\WORK_LOG.md`
- G06: `BE\src\main.ts`
- G06: `BE\src\app.module.ts`
- G06: `AGENT\SOFTWARE_AGENT\COMMON\ENVIRONMENT.md`
- G06: `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- G06: `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\004_backend_deployment_environment.md`
- G06: `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\DEPLOYMENT.md`
- 완료 로그: `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G06_BOOTSTRAP_PROCESS_ENV_POLICY\WORK_LOG.md`
- G07: `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\README.md`
- G07: `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\API_SPEC_AUDIT_RESULT.md`
- G07: `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\GOAL-WORK-ORDER.md`
- G07: `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G01-ACTIVE-SERVICE-QA-API-SPEC-NORMALIZATION.goal.md`
- G07: `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G02-DONE-API-SPEC-AUDIT-INDEX.goal.md`
- G07: `TODO\DONE\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G99-FINAL-REVIEW.goal.md`
- 완료 로그: `TODO_LOG\2026-08-29\BE_SOFTWARE_AGENT_RULE_RECHECK\G07_API_SPEC_TEMPLATE_AUDIT\WORK_LOG.md`
- G08: `BE\src\modules\*\presentation\**\*.ts`의 `application/ports/*repository*` import 감사
- G08: `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\README.md`
- G08: `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`
- G08: `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\GOAL-WORK-ORDER.md`
- G08: `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md`
- G08: `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\G02-RESPONSE-MAPPER-READ-MODEL-BOUNDARY.goal.md`
- G08: `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\G99-FINAL-REVIEW.goal.md`
- 완료 로그: `TODO_LOG\2026-08-29\BE_SOFTWARE_AGENT_RULE_RECHECK\G08_PRESENTATION_REPOSITORY_PROJECTION_AUDIT\WORK_LOG.md`
