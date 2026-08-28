# Validation Checklist

상태: Ready

## 1. 기본 검증

코드 수정 Goal은 기본적으로 아래 명령을 실행한다.

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
```

DB schema 또는 Prisma repository 변경이 없어도 최종 검토에서는 아래를 실행한다.

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run prisma:validate
```

테스트는 Goal 문서의 대상 모듈 테스트를 우선 실행하고, `G99`에서 전체 테스트를 실행한다.

## 2. 최종 검토 명령

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run prisma:validate
pnpm.cmd test -- --runInBand
pnpm.cmd run build
```

## 3. 정적 점검 명령

아래 `rg` 위반 검색 명령은 매치가 0건이면 통과로 본다. `rg`는 매치가 없을 때 exit code 1을 반환할 수 있으므로, 출력이 없는 명령은 실패가 아니라 "위반 없음"으로 기록한다.

### 3.1 strict 위반 검색

```powershell
cd D:\workspace_repository\onehandsales\BE
rg -n "@nestjs|@prisma/client|openai|@supabase|axios|fetch|Logger|console\." src\modules src\shared -g "*.ts" -g "!*.spec.ts" | rg "\\domain\\"
rg -n "@prisma/client|PrismaClient|PrismaService|\$transaction|openai|@supabase|axios|fetch" src\modules src\shared -g "*.ts" -g "!*.spec.ts" | rg "\\application\\"
rg -n "@prisma/client|PrismaClient|PrismaService|\$transaction|prisma\." src\modules src\shared -g "*.ts" -g "!*.spec.ts" | rg "\\presentation\\"
rg -n "Repository|PrismaService|prisma\.|runInTransaction|\$transaction" src\modules -g "*controller*.ts" -g "!*.spec.ts"
rg -n "schedule\.repository|SCHEDULE_REPOSITORY|ScheduleRepository" src\modules\sales-report\application
rg -n "console\." src -g "*.ts" -g "!*.spec.ts"
rg -n "\bany\b" src -g "*.ts" -g "!*.spec.ts"
git diff --check
git status --short
```

### 3.2 수동 판정 또는 감사 출력

아래 명령은 출력이 있을 수 있다. 출력 자체를 실패로 보지 말고, 각 Goal의 완료 기준과 TODO_LOG 기록 여부로 판정한다.

```powershell
cd D:\workspace_repository\onehandsales\BE
rg -n "process\.env" src -g "*.ts" -g "!*.spec.ts"
rg -n "application/ports/.+repository|application\\ports\\.+repository" src\modules -g "*.ts" -g "!*.spec.ts" | rg "\\presentation\\"
```

## 4. 최종 리뷰 기준

- presentation 계층에서 Prisma 직접 의존이 없다.
- sales-report application에서 schedule repository 직접 의존이 없다.
- controller에서 repository, Prisma, transaction을 직접 사용하지 않는다.
- application 계층의 트랜잭션 경계가 규칙과 일치한다.
- 수정된 class/interface/type/method/helper에 한글 주석이 있다.
- AI Weekly Report observability 이벤트가 API-SPEC과 일치한다.
- API-SPEC, DTO, mapper, FE API client/type이 서로 모순되지 않는다.
- presentation의 repository port import 감사 결과가 기록되어 있다.
- 직접 repository token/interface 사용이 presentation에 남아 있지 않다.
- 검증 명령과 결과가 각 `TODO_LOG`에 기록되어 있다.
- 완료된 Goal 상태가 개별 Goal 문서, 상위 README, 작업 순서표, 리스크 요약에 반영되어 있다.
