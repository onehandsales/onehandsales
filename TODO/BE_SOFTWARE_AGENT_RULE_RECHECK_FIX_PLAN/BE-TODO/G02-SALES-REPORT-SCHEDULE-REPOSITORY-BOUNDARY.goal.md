# G02 sales-report의 schedule repository 직접 의존 제거

상태: Ready for `/goal`
성격: 코드 수정
우선순위: P1

## 1. 목적

`sales-report` application service가 `schedule` 모듈의 repository port를 직접 import/inject하는 계층 위반을 제거한다.

## 2. 선행 문서

- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\COMMENT_AND_LOGGING.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\TRANSACTION.md`

## 3. 포함 범위

- `sales-report` application에서 `SCHEDULE_REPOSITORY`, `ScheduleRepository` 직접 의존 제거
- `schedule` 모듈 application service를 통한 조회 경계 구성
- Nest module provider/export 정리
- 관련 테스트 수정

## 4. 제외 범위

- Weekly report 비즈니스 로직 변경
- schedule DB 모델 변경
- AI 프롬프트 변경
- 신규 API 추가

## 5. 대상 파일

- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- `BE\src\modules\sales-report\infrastructure\sales-report.module.ts`
- `BE\src\modules\schedule\application\services\schedule-application.service.ts`
- `BE\src\modules\schedule\application\ports\schedule.repository.ts`
- `BE\src\modules\schedule\infrastructure\schedule.module.ts`

관련 spec은 아래 명령으로 찾는다.

```powershell
cd D:\workspace_repository\onehandsales
rg --files BE\src\modules\sales-report BE\src\modules\schedule | rg "\.spec\.ts$"
```

## 6. 현재 확인된 문제 위치

- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
  - 3-8행 근처에서 schedule repository port import
  - 141-142행 근처에서 `SCHEDULE_REPOSITORY` inject
  - 349-354행 근처에서 `this.scheduleRepository.listSchedulesForWeeklyReport(...)` 호출
- `BE\src\modules\schedule\infrastructure\schedule.module.ts`
  - `exports: [ScheduleApplicationService, SCHEDULE_REPOSITORY]`

## 7. 구현 지시

1. 기본 방향은 `ScheduleApplicationService`에 Weekly Report용 조회 메서드를 추가하고 `sales-report`가 이 application service를 사용하게 하는 것이다.
2. `sales-report` application service에서 schedule repository token import와 constructor injection을 제거한다.
3. `ScheduleModule`은 외부 모듈에 repository token을 export하지 않는다. 다른 사용처가 있으면 먼저 확인하고 application service export로 대체한다.
4. `WeeklyReportScheduleRecord` 등 필요한 반환 타입은 `schedule.repository.ts`에서 sales-report로 직접 가져오지 않는다.
5. sales-report가 필요로 하는 schedule snapshot 타입은 schedule application contract 또는 sales-report 전용 input type으로 명시한다.
6. 모듈 간 순환 의존이 생기면 repository 공유로 되돌리지 말고 anti-corruption port를 별도로 둔다.
7. `ScheduleApplicationService`를 수정하면 해당 파일의 누락된 class/interface/type/helper 한글 주석도 함께 보강한다.
8. 수정한 class/interface/type/method/helper에는 한글 역할/기능 주석을 작성한다.

## 8. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand sales-report
pnpm.cmd test -- --runInBand schedule
rg -n "schedule\.repository|SCHEDULE_REPOSITORY|ScheduleRepository" src\modules\sales-report\application
rg -n "exports:\s*\[[^\]]*SCHEDULE_REPOSITORY" src\modules\schedule\infrastructure\schedule.module.ts
```

두 `rg` 명령은 출력이 없으면 통과다. `SCHEDULE_REPOSITORY` provider 등록 import는 schedule 모듈 내부에 남을 수 있으나 `exports`에 남으면 실패다.

## 9. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\BE_SOFTWARE_AGENT_RULE_RECHECK\G02_SALES_REPORT_SCHEDULE_REPOSITORY_BOUNDARY\WORK_LOG.md
```

## 10. 완료 기준

- `sales-report/application` 아래에서 `schedule.repository` import가 0건이다.
- `sales-report/application` 아래에서 `SCHEDULE_REPOSITORY` 사용이 0건이다.
- `schedule.module.ts`가 repository token을 외부 모듈에 export하지 않는다.
- typecheck, lint, 관련 테스트가 통과한다.
- 수정한 코드에 한글 주석 규칙이 반영되어 있다.
