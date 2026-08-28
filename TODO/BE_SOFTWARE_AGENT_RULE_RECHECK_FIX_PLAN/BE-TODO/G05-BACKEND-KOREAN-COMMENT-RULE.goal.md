# G05 백엔드 한글 주석 규칙 누락 보강

상태: Ready for `/goal`
성격: 코드 주석 수정
우선순위: P2

## 1. 목적

Backend Agent의 유지보수 규칙에 맞게 누락된 한글 역할/기능 주석을 보강한다.

## 2. 선행 문서

- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\COMMENT_AND_LOGGING.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\005_backend_api_function_comment_rule.md`

## 3. 포함 범위

- 기존 동작을 바꾸지 않는 주석 보강
- 누락된 class/interface/type/method/helper의 역할/기능 주석 추가
- 복잡한 흐름의 한글 단계 주석 보강

## 4. 제외 범위

- 비즈니스 로직 변경
- 테스트 기대값 변경
- API/DB 계약 변경
- import 구조 변경

## 5. 대상 파일

- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- `BE\src\modules\schedule\application\services\schedule-application.service.ts`
- `BE\src\modules\schedule\application\ports\schedule.repository.ts`
- `BE\src\modules\follow-up\application\ports\follow-up-draft.provider.ts`
- `BE\src\modules\follow-up\application\ports\follow-up-delivery-secret-encryption.port.ts`
- `BE\src\modules\follow-up\presentation\http\dto\follow-up-delivery-settings-request.dto.ts`
- `BE\src\main.ts`
- `BE\src\modules\sales-report\infrastructure\sales-report.module.ts`

## 6. 현재 확인된 문제 후보

- `ai-weekly-sales-report-application.service.ts`
  - interface/class/method/helper 주석 누락 구간 존재
- `schedule-application.service.ts`
  - `ScheduleGoogleCalendarResponse`, 내부 날짜/timezone type, 일부 helper method 주석 누락 구간 존재
- `schedule.repository.ts`
  - repository token, enum, type alias 일부에 한글 역할 주석 누락 구간 존재
- `follow-up-draft.provider.ts`
  - interface/type/class 역할 주석 누락 구간 존재
- `follow-up-delivery-secret-encryption.port.ts`
  - interface 역할 주석 누락 구간 존재
- `follow-up-delivery-settings-request.dto.ts`
  - DTO class 역할 주석 누락 구간 존재
- `main.ts`
  - bootstrap helper 기능 주석 누락 구간 존재
- `sales-report.module.ts`
  - module class 역할 주석 누락 구간 존재

## 7. 구현 지시

1. 동작을 바꾸지 않고 주석만 보강한다.
2. class에는 `// 역할 : ...` 형식의 한글 역할 주석을 둔다.
3. interface/type/port에는 `// 역할 : ...` 형식의 한글 역할 주석을 둔다.
4. method/helper에는 `// 기능 : ...` 형식의 한글 기능 주석을 둔다.
5. 코드 흐름이 긴 method에는 필요한 위치에 한글 단계 주석을 추가한다.
6. 주석이 실제 코드와 다르게 과장되거나 미래 동작을 약속하지 않게 작성한다.

## 8. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
git diff -- src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts src\modules\schedule\application\services\schedule-application.service.ts src\modules\schedule\application\ports\schedule.repository.ts src\modules\follow-up\application\ports\follow-up-draft.provider.ts src\modules\follow-up\application\ports\follow-up-delivery-secret-encryption.port.ts src\modules\follow-up\presentation\http\dto\follow-up-delivery-settings-request.dto.ts src\main.ts src\modules\sales-report\infrastructure\sales-report.module.ts
```

## 9. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\BE_SOFTWARE_AGENT_RULE_RECHECK\G05_BACKEND_KOREAN_COMMENT_RULE\WORK_LOG.md
```

## 10. 완료 기준

- 대상 파일의 수정 범위에 class/interface/type/method/helper 한글 주석 누락이 없다.
- typecheck, lint가 통과한다.
- 비즈니스 로직 diff가 없다.

