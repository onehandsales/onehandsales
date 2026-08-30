# G08 presentation의 repository projection type 의존 감사

상태: Completed
성격: 감사/후속 분리
우선순위: P3
완료일: 2026-08-29
완료 로그: `TODO_LOG\2026-08-29\BE_SOFTWARE_AGENT_RULE_RECHECK\G08_PRESENTATION_REPOSITORY_PROJECTION_AUDIT\WORK_LOG.md`

## 1. 목적

`presentation` 계층이 repository port의 projection type이나 enum에 기대는 패턴을 감사하고, 즉시 수정할 것과 별도 후속 계획으로 분리할 것을 명확히 한다.

## 2. 선행 문서

- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\COMMENT_AND_LOGGING.md`

## 3. 포함 범위

- `presentation` 아래의 `application/ports/*repository*` import 전수 확인
- repository token/interface 직접 사용 여부 확인
- DTO validation enum, response mapper input type, read model projection type의 소유 위치 판단
- 즉시 위험이 큰 항목은 수정하고, 대량 구조 변경은 별도 TODO로 분리

## 4. 제외 범위

- 모든 presentation mapper의 대량 타입 이동
- API 응답 shape 변경
- repository 구현체 변경

## 5. 대상 파일

- `BE\src\modules\schedule\presentation\http\dto\schedule-request.dto.ts`
- `BE\src\modules\schedule\application\ports\schedule.repository.ts`
- `BE\src\modules\admin-operation\presentation\http\*.ts`
- `BE\src\modules\*\presentation\http\dto\*.ts`

## 6. 현재 확인된 문제 후보

아래 명령에서 다수의 presentation 파일이 repository port의 projection type 또는 enum을 import하는 것으로 확인되었다.

```powershell
cd D:\workspace_repository\onehandsales\BE
rg -n "application/ports/.+repository|application\\ports\\.+repository" src\modules -g "*.ts" -g "!*.spec.ts" | rg "\\presentation\\"
```

대표 후보:

- `BE\src\modules\schedule\presentation\http\dto\schedule-request.dto.ts`
  - `ScheduleViewMode`, `ScheduleVisibility`, `ScheduleSourceTypeFilter`를 `schedule.repository.ts`에서 import한다.
- `BE\src\modules\company\presentation\http\dto\company-request.dto.ts`
  - `CompanyListSort`를 repository port에서 import한다.
- `BE\src\modules\contact\presentation\http\dto\contact-request.dto.ts`
  - `ContactListSort`를 repository port에서 import한다.
- `BE\src\modules\product\presentation\http\dto\product-request.dto.ts`
  - `ProductListSort`를 repository port에서 import한다.
- 여러 response mapper가 repository projection type을 mapper input type으로 직접 사용한다.

## 7. 완료 결과

- presentation의 `application/ports/*repository*` import는 22 line, 20 file로 확인했다.
- presentation에서 repository token 또는 repository interface를 직접 주입/사용한 항목은 0건이다.
- 즉시 수정해야 할 high-risk 위반은 없어 Backend 코드는 수정하지 않았다.
- DTO validation enum/const/type과 response mapper projection record 분리는 3개 파일을 초과하고 API contract 검증이 필요한 구조 변경이므로 `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`으로 분리했다.
- 상세 감사 목록은 `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`에 기록했다.

## 8. 실행 지시

1. 실제 import 목록을 전수 확인하고 TODO_LOG에 기록한다.
2. presentation에서 repository token 또는 repository interface를 직접 사용하면 즉시 수정한다.
3. DTO validation enum처럼 HTTP 계약에 가까운 값은 application query contract 또는 presentation contract로 분리하는 방향을 우선 검토한다.
4. response mapper가 repository projection type을 받는 기존 패턴은 대량 변경이므로, 현재 Goal에서는 위험도와 범위를 판단한다.
5. 수정 대상이 3개 파일을 넘거나 API contract 갱신이 필요하면 별도 TODO 문서를 만든다.
6. 즉시 수정한 코드가 있다면 class/interface/type/helper 한글 주석 규칙을 적용한다.

## 9. 검증

코드 수정 시:

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand
```

문서/감사만 수행 시:

```powershell
cd D:\workspace_repository\onehandsales\BE
rg -n "application/ports/.+repository|application\\ports\\.+repository" src\modules -g "*.ts" -g "!*.spec.ts" | rg "\\presentation\\"
```

## 10. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\BE_SOFTWARE_AGENT_RULE_RECHECK\G08_PRESENTATION_REPOSITORY_PROJECTION_AUDIT\WORK_LOG.md
```

## 11. 완료 기준

- presentation의 repository port import 목록이 최신 코드 기준으로 기록되어 있다.
- repository token/interface 직접 사용이 있으면 제거되어 있다.
- projection type 대량 분리가 필요한 경우 별도 TODO 문서가 생성되어 있다.
- 코드 수정 시 typecheck, lint, 테스트가 통과한다.
- 수정한 코드가 있다면 한글 주석 규칙이 반영되어 있다.
