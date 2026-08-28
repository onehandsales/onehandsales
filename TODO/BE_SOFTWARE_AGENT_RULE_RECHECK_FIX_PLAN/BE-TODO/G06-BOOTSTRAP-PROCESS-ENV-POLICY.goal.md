# G06 bootstrap process.env 정책 충돌 정리

상태: Completed
성격: 문서/소폭 코드 수정
우선순위: P3
완료일: 2026-08-28
완료 커밋: `0d0530d3 docs(backend): document bootstrap env policy`

## 1. 목적

`main.ts` bootstrap의 직접 `process.env` 사용과 환경 변수 규칙 문서 간 충돌을 정리한다.

## 2. 선행 문서

- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `AGENT\SOFTWARE_AGENT\COMMON\ENVIRONMENT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\004_backend_deployment_environment.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\DEPLOYMENT.md`

## 3. 포함 범위

- 현재 Backend Agent 환경 변수 규칙 확인
- bootstrap 예외를 문서화할지, ConfigService 기반으로 정리할지 결정
- 기본 방향은 bootstrap 초기화 단계의 제한적 예외를 명문화하고 `main.ts` 주석을 보강하는 것이다.

## 4. 제외 범위

- 환경 변수 이름 변경
- 배포 설정 변경
- runtime config 구조 전면 개편
- production secret 값 문서화

## 5. 대상 파일

- `BE\src\main.ts`
- `BE\src\app.module.ts`
- `AGENT\SOFTWARE_AGENT\COMMON\ENVIRONMENT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- 필요 시 Backend decision 문서

config/env 관련 파일은 아래 명령으로 찾는다.

```powershell
cd D:\workspace_repository\onehandsales\BE
rg -n "ConfigModule|ConfigService|process\.env|envFilePath|NODE_ENV|PORT" src -g "*.ts" -g "!*.spec.ts"
```

## 6. 현재 확인된 문제

- `BE\src\main.ts` bootstrap 이전 또는 초기화 구간에서 `process.env`를 직접 참조한다.
- 공통 환경 규칙은 bootstrap 단계에서 로컬 env read를 허용하는 것으로 보인다.
- 백엔드 일반 규칙은 `ConfigService` 사용을 요구한다.

## 7. 구현 지시

1. 먼저 실제 규칙 문서를 재확인한다.
2. bootstrap 이전에 `ConfigService`를 사용할 수 없는 구간이면 Backend Agent 문서에 제한적 예외를 명시한다.
3. `main.ts`에는 왜 bootstrap 초기화 단계에서만 직접 env를 읽는지 한글 주석을 보강한다.
4. bootstrap 이후 application/service/controller 계층에서 직접 `process.env`를 읽는 코드는 허용하지 않는다.
5. ConfigService로 안전하게 치환 가능한 코드라면 치환하되, 동작 변경 위험을 TODO_LOG에 기록한다.

## 8. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand
rg -n "process\.env" src
```

`process.env` 검색 결과는 `main.ts` bootstrap 예외와 그 문서화 여부를 기준으로 판정한다.

## 9. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\BE_SOFTWARE_AGENT_RULE_RECHECK\G06_BOOTSTRAP_PROCESS_ENV_POLICY\WORK_LOG.md
```

## 10. 완료 기준

- bootstrap env 정책이 문서와 코드에서 모순되지 않는다.
- `main.ts` 수정 범위에 한글 기능/단계 주석이 있다.
- bootstrap 이후 계층에서 직접 `process.env` 사용이 추가되지 않았다.
- typecheck, lint, 테스트가 통과한다.

## 11. 완료 결과

- `ConfigService` 생성 전 local env file loading은 `BE/src/main.ts` bootstrap env loader의 제한 예외로 문서화했다.
- `main.ts`와 `app.module.ts`에는 bootstrap env loading 순서와 `ConfigService` 사용 경계를 한글 주석으로 보강했다.
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`, Backend convention, deployment architecture, deployment decision 문서에 동일한 예외 범위를 반영했다.
- `rg -n "process\.env" src` 결과 direct `process.env`는 `src\main.ts` bootstrap loader에만 남아 있음을 확인했다.
- 검증 결과:
  - `pnpm.cmd run typecheck`: 통과
  - `pnpm.cmd run lint`: 통과
  - `pnpm.cmd test -- --runInBand`: 통과, 103 suites / 548 tests
  - `git diff --check`: 통과
- TODO_LOG: `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G06_BOOTSTRAP_PROCESS_ENV_POLICY\WORK_LOG.md`
