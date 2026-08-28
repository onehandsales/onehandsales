# G01 admin-operation presentation Prisma enum 의존 제거

상태: Completed
성격: 코드 수정
우선순위: P1
완료일: 2026-08-28
완료 커밋: `2f5647a2`
TODO_LOG: `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G01_ADMIN_OPERATION_PRESENTATION_PRISMA_ENUM\WORK_LOG.md`

## 1. 목적

`admin-operation` presentation 계층이 `@prisma/client` enum에 직접 의존하는 문제를 제거한다.

## 2. 선행 문서

- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\COMMENT_AND_LOGGING.md`

## 3. 포함 범위

- `admin-operation` HTTP DTO와 mapper의 Prisma enum import 제거
- application 계층 타입 또는 presentation 전용 enum/const로 변경
- 관련 테스트 및 타입 오류 수정

## 4. 제외 범위

- DB schema 변경
- API path 변경
- 관리자 권한 정책 변경
- admin-operation repository 구현 리팩터링

## 5. 대상 파일

- `BE\src\modules\admin-operation\application\ports\admin-operation.types.ts`
- `BE\src\modules\admin-operation\presentation\http\admin-audit-response.mapper.ts`
- `BE\src\modules\admin-operation\presentation\http\dto\admin-audit-request.dto.ts`
- `BE\src\modules\admin-operation\presentation\http\dto\admin-user-request.dto.ts`

관련 spec은 아래 명령으로 찾는다.

```powershell
cd D:\workspace_repository\onehandsales
rg --files BE\src\modules\admin-operation | rg "\.spec\.ts$"
```

## 6. 작업 전 확인된 문제 위치

2026-08-28 G01 완료 후 아래 위치의 `@prisma/client` 직접 import는 제거되었다.

- `BE\src\modules\admin-operation\presentation\http\admin-audit-response.mapper.ts`
  - 1-6행 근처에서 `@prisma/client` enum import
- `BE\src\modules\admin-operation\presentation\http\dto\admin-audit-request.dto.ts`
  - 12-17행 근처에서 `@prisma/client` enum import
  - 41, 45, 62, 68행 근처에서 Prisma enum 기반 `@IsEnum`
- `BE\src\modules\admin-operation\presentation\http\dto\admin-user-request.dto.ts`
  - 12행 근처에서 `@prisma/client` enum import
  - 23-24행 근처에서 Prisma enum 기반 `@IsEnum`

## 7. 구현 지시

1. `application/ports/admin-operation.types.ts`에 이미 존재하는 application 타입과 const를 우선 사용한다.
2. 필요한 enum 값 목록이 application 계층에 없다면 presentation이 Prisma를 직접 import하지 않도록 application contract에 const/type을 추가한다.
3. DTO의 `@IsEnum`은 Prisma enum이 아닌 application contract 또는 presentation-local contract를 바라보게 한다.
4. mapper는 Prisma enum 타입을 외부 응답 타입으로 직접 노출하지 않는다.
5. 수정한 class/interface/type/method/helper에는 한글 역할/기능 주석을 보강한다.

## 8. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand admin-operation
rg -n "@prisma/client" src\modules\admin-operation\presentation
```

`rg -n "@prisma/client"` 출력이 없으면 통과다.

## 9. TODO_LOG

작업 시작과 완료 시 아래 파일을 작성하거나 갱신한다.

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\BE_SOFTWARE_AGENT_RULE_RECHECK\G01_ADMIN_OPERATION_PRESENTATION_PRISMA_ENUM\WORK_LOG.md
```

## 10. 완료 기준

- `admin-operation/presentation` 아래에서 `@prisma/client` import가 0건이다.
- typecheck, lint, 관련 테스트가 통과한다.
- API 응답 값이 기존과 호환된다.
- 수정한 코드에 한글 주석 규칙이 반영되어 있다.
