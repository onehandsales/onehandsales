# G08 Presentation Repository Projection Audit 작업 로그

- 날짜: 2026-08-29
- 작업 범위: `BE` presentation 계층의 `application/ports/*repository*` 타입/값 import 전수 감사
- Goal: `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/BE-TODO/G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md`

## 1. 기준 문서 확인

- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/BE-TODO/G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/README.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/COMMON/REFERENCES.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/COMMON/SCOPE.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/COMMON/EXECUTION-GATES.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/COMMON/CURRENT-RISK-SUMMARY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

## 2. 전수 감사 명령

```bash
cd BE
rg -n 'application/ports/.+repository|application\\ports\\.+repository' src/modules -g '*.ts' -g '!*.spec.ts' | rg 'presentation'
```

직접 repository 토큰/인터페이스 사용 확인:

```bash
cd BE
rg -n 'Repository|REPOSITORY' src/modules -g '*.ts' -g '!*.spec.ts' | rg 'presentation'
```

## 3. 진행 메모

- 작업 시작 시점에 G08 범위 밖의 FE 변경 파일 5개가 이미 존재했다. 해당 변경은 본 작업에서 수정하지 않는다.
- presentation의 repository port import는 22 line, 20 file로 확인했다.
- `@Inject`, `REPOSITORY`, `Repository` 패턴으로 presentation 직접 repository token/interface 사용을 확인했으나 출력은 0건이었다.
- 즉시 제거해야 할 high-risk 위반은 없어 BE 코드는 수정하지 않았다.
- DTO validation enum/const/type과 response mapper projection record 분리는 3개 파일을 초과하므로 별도 후속 계획으로 분리했다.

## 4. 전수 감사 결과

### 4.1 import 목록

```text
src/modules/account-request/presentation/http/account-request-response.mapper.ts:5:} from "@/modules/account-request/application/ports/account-request.repository";
src/modules/schedule/presentation/http/dto/google-calendar-request.dto.ts:9:import type { GoogleCalendarDisconnectScheduleAction } from "@/modules/schedule/application/ports/google-calendar-connection.repository";
src/modules/schedule/presentation/http/dto/google-calendar-request.dto.ts:10:import type { GoogleCalendarSyncTrigger } from "@/modules/schedule/application/ports/google-calendar-sync.repository";
src/modules/schedule/presentation/http/dto/schedule-request.dto.ts:15:} from "@/modules/schedule/application/ports/schedule.repository";
src/modules/trash/presentation/http/dto/trash-request.dto.ts:19:} from "@/modules/trash/application/ports/trash.repository";
src/modules/meeting-note/presentation/http/dto/meeting-note-request.dto.ts:19:} from "@/modules/meeting-note/application/ports/meeting-note.repository";
src/modules/business-card/presentation/http/dto/business-card-request.dto.ts:3:import { BusinessCardScanStatusValue } from "@/modules/business-card/application/ports/business-card-scan-log.repository";
src/modules/product/presentation/http/dto/product-request.dto.ts:12:import { ProductListSort } from "@/modules/product/application/ports/product.repository";
src/modules/admin-operation/presentation/http/admin-system-operation-response.mapper.ts:4:} from "@/modules/admin-operation/application/ports/admin-system-operation.repository";
src/modules/admin-operation/presentation/http/admin-provider-failure-response.mapper.ts:6:} from "@/modules/admin-operation/application/ports/admin-provider-failure.repository";
src/modules/admin-operation/presentation/http/admin-account-request-response.mapper.ts:4:} from "@/modules/admin-operation/application/ports/admin-account-request.repository";
src/modules/admin-operation/presentation/http/admin-user-response.mapper.ts:13:} from "@/modules/admin-operation/application/ports/admin-user.repository";
src/modules/admin-operation/presentation/http/dto/admin-user-request.dto.ts:13:import { AdminUserListSort } from "@/modules/admin-operation/application/ports/admin-user.repository";
src/modules/admin-operation/presentation/http/admin-domain-record-response.mapper.ts:8:} from "@/modules/admin-operation/application/ports/admin-domain-record.repository";
src/modules/admin-operation/presentation/http/admin-trash-response.mapper.ts:5:} from "@/modules/admin-operation/application/ports/admin-trash.repository";
src/modules/admin-operation/presentation/http/admin-analytics-response.mapper.ts:10:} from "@/modules/admin-operation/application/ports/admin-analytics.repository";
src/modules/admin-operation/presentation/http/admin-audit-response.mapper.ts:12:} from "@/modules/admin-operation/application/ports/admin-audit.repository";
src/modules/company/presentation/http/dto/company-request.dto.ts:11:import { CompanyListSort } from "@/modules/company/application/ports/company.repository";
src/modules/contact/presentation/http/dto/contact-request.dto.ts:11:import { ContactListSort } from "@/modules/contact/application/ports/contact.repository";
src/modules/data-import/presentation/http/dto/import-job-request.dto.ts:15:import type { ImportTemplateType } from "@/modules/data-import/application/ports/import-template.repository";
src/modules/deal/presentation/http/dto/deal-request.dto.ts:23:} from "@/modules/deal/application/ports/deal-activity.repository";
src/modules/deal/presentation/http/dto/deal-request.dto.ts:24:import { DealListSort } from "@/modules/deal/application/ports/deal.repository";
```

### 4.2 DTO validation 경계 대상

| 파일 | import | 판단 |
| --- | --- | --- |
| `schedule/presentation/http/dto/schedule-request.dto.ts` | `ScheduleViewMode`, `ScheduleSourceTypeFilter`, `ScheduleVisibility` | `ScheduleViewMode`는 런타임 `@IsEnum`, 나머지는 local `@IsIn` 배열의 타입 검증에 사용한다. HTTP query contract 성격이 강하다. |
| `schedule/presentation/http/dto/google-calendar-request.dto.ts` | `GoogleCalendarDisconnectScheduleAction`, `GoogleCalendarSyncTrigger` | type-only import이나 HTTP body/query 허용값 배열의 `satisfies` 타입으로 사용한다. |
| `company/presentation/http/dto/company-request.dto.ts` | `CompanyListSort` | 런타임 `@IsEnum` query validation에 사용한다. |
| `contact/presentation/http/dto/contact-request.dto.ts` | `ContactListSort` | 런타임 `@IsEnum` query validation에 사용한다. |
| `product/presentation/http/dto/product-request.dto.ts` | `ProductListSort` | 런타임 `@IsEnum` query validation에 사용한다. |
| `deal/presentation/http/dto/deal-request.dto.ts` | `DealListSort`, `DEAL_ACTIVITY_TYPES`, `MANUAL_DEAL_ACTIVITY_TYPES`, activity code types | 런타임 `@IsEnum`/`@IsIn` validation에 사용한다. |
| `meeting-note/presentation/http/dto/meeting-note-request.dto.ts` | `MeetingNoteSort`, `MeetingNoteSourceTypeValue` | 런타임 `@IsEnum` query/body validation에 사용한다. |
| `trash/presentation/http/dto/trash-request.dto.ts` | `Trash*` filter/sort/target types | type-only import이나 HTTP query/path 허용값 배열과 type guard에 사용한다. |
| `data-import/presentation/http/dto/import-job-request.dto.ts` | `ImportTemplateType` | type-only import이나 HTTP body/query 허용값 배열에 사용한다. |
| `business-card/presentation/http/dto/business-card-request.dto.ts` | `BusinessCardScanStatusValue` | 런타임 `@IsEnum` query validation에 사용한다. |
| `admin-operation/presentation/http/dto/admin-user-request.dto.ts` | `AdminUserListSort` | 런타임 `@IsEnum` query validation에 사용한다. |

### 4.3 response mapper projection 경계 대상

| 파일 | import | 판단 |
| --- | --- | --- |
| `account-request/presentation/http/account-request-response.mapper.ts` | account deletion/data export request record/status | type-only mapper input/response type이다. |
| `admin-operation/presentation/http/admin-system-operation-response.mapper.ts` | operation check records | type-only mapper input/response alias다. |
| `admin-operation/presentation/http/admin-provider-failure-response.mapper.ts` | provider failure records/context | type-only mapper input/response type이다. |
| `admin-operation/presentation/http/admin-account-request-response.mapper.ts` | account/data export page records | type-only mapper input type이다. |
| `admin-operation/presentation/http/admin-user-response.mapper.ts` | admin user list/overview/timeline records | type-only mapper input/response type이다. |
| `admin-operation/presentation/http/admin-domain-record-response.mapper.ts` | domain record/page/status/summary types | type-only mapper input/response type이다. |
| `admin-operation/presentation/http/admin-trash-response.mapper.ts` | admin trash records/page/summary | type-only mapper input/response type이다. |
| `admin-operation/presentation/http/admin-analytics-response.mapper.ts` | analytics records | type-only response alias와 mapper input type이다. |
| `admin-operation/presentation/http/admin-audit-response.mapper.ts` | audit/access/raw data records | type-only mapper input type이다. |

## 5. 후속 계획

아래 후속 계획을 생성했다.

- `TODO/DONE/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/README.md`
- `TODO/DONE/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/COMMON/PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`
- `TODO/DONE/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/COMMON/G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md`
- `TODO/DONE/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/COMMON/G02-RESPONSE-MAPPER-READ-MODEL-BOUNDARY.goal.md`
- `TODO/DONE/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/COMMON/G99-FINAL-REVIEW.goal.md`
- `TODO/DONE/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/BE-TODO/README.md`
- `TODO/DONE/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/FE-TODO/README.md`

## 6. 관련 문서 갱신

G08 완료 상태와 후속 계획을 아래 문서에 반영했다.

- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/README.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/BE-TODO/README.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/BE-TODO/G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/COMMON/CURRENT-RISK-SUMMARY.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/COMMON/G99-FINAL-REVIEW.goal.md`
- `TODO/DONE/BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN/COMMON/VALIDATION-CHECKLIST.md`
- `TODO/README.md`

## 7. 검증

- 문서/감사만 수행했으므로 `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd test -- --runInBand`는 실행하지 않았다.
- `cd BE`
- `rg -n 'application/ports/.+repository|application\\ports\\.+repository' src/modules -g '*.ts' -g '!*.spec.ts' | rg 'presentation'`
  - 결과: 22 line 출력. `4.1 import 목록`과 동일한 범위다.
- `rg -n '@Inject\(|REPOSITORY|Repository' src/modules/*/presentation -g '*.ts' -g '!*.spec.ts'`
  - 결과: 출력 없음. presentation 직접 repository token/interface 사용 0건.
- `git diff --check`
  - 결과: 통과.
- 구 상태 문구 검색
  - 결과: 출력 없음. G08 완료/G99 다음 상태로 정리됨.
- `git diff --name-only -- BE`
  - 결과: 출력 없음. BE 코드 변경 없음.
- `git diff --name-only -- FE`
  - 결과: 기존/범위 밖 FE 변경이 남아 있다. 본 G08에서는 수정하지 않았다.

## 8. 완료 판단

- G08 완료 기준의 import 목록 기록을 충족했다.
- repository token/interface 직접 사용은 0건으로 즉시 제거 대상이 없다.
- projection type 대량 분리는 별도 TODO 문서로 분리했다.
- BE/FE 코드는 수정하지 않았다.
- 다음 실행 대상은 `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G99-FINAL-REVIEW.goal.md`다.
- 추가 검토에서 `PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`의 DTO validation 대상 요약 숫자가 실제 감사 표와 달랐던 것을 확인했고, 11 files로 정정했다.
