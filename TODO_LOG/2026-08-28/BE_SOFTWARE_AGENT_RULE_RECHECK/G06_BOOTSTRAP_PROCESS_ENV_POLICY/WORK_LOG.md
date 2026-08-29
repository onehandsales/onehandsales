# G06 Bootstrap Process Env Policy Work Log

상태: Completed
작업일: 2026-08-28
Goal 문서: `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G06-BOOTSTRAP-PROCESS-ENV-POLICY.goal.md`
구현/로그 커밋: `0d0530d3 docs(backend): document bootstrap env policy`

## 1. 수행 범위

- `BE\src\main.ts` bootstrap `process.env` 사용 위치 재검토
- `BE\src\app.module.ts` `ConfigModule` env 파일 순서 주석 보강
- Backend 환경 변수 규칙 문서의 bootstrap 예외 명확화
- 배포/의사결정 문서의 local env loading 정책 명확화
- G06 완료 후 관련 진행 문서 갱신

## 2. 제외 범위

- 환경 변수명 변경
- 배포 설정 변경
- runtime config 구조 개편
- production secret 값 문서화
- 신규 API 또는 DB schema 변경

## 3. 읽은 Agent/진행 문서

- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G06-BOOTSTRAP-PROCESS-ENV-POLICY.goal.md`
- `AGENT\SOFTWARE_AGENT\COMMON\ENVIRONMENT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\004_backend_deployment_environment.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\DEPLOYMENT.md`

## 4. 현재 판단

- `ConfigService`는 `AppModule` 생성 이후 접근 가능하므로 `AppModule` import 및 `ConfigModule` 초기화 이전의 local env 파일 로딩은 `ConfigService`로 대체할 수 없다.
- `process.env` 직접 접근은 `BE\src\main.ts` bootstrap env loader에만 제한한다.
- bootstrap 이후 controller/service/module/provider/repository 계층은 `ConfigService`를 사용해야 한다.

## 5. 수정 파일

- `BE\src\main.ts`
- `BE\src\app.module.ts`
- `AGENT\SOFTWARE_AGENT\COMMON\ENVIRONMENT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\004_backend_deployment_environment.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\DEPLOYMENT.md`

## 6. 검증 명령

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand
rg -n "process\.env" src
```

## 7. 검증 결과

- `pnpm.cmd run typecheck`: 통과
- `pnpm.cmd run lint`: 통과
- `pnpm.cmd test -- --runInBand`: 통과, 103 suites / 548 tests
- `rg -n "process\.env" src`: `src\main.ts` bootstrap env loader 범위 4건만 확인
- `git diff --check`: 통과

## 8. 자체 검토 결과

- `ConfigService`가 생성되기 전 단계는 `ConfigService`로 대체할 수 없어 bootstrap env loader 예외로 유지했다.
- `BE\src\main.ts`의 수정 범위에는 한글 기능/단계 주석을 보강했다.
- `BE\src\app.module.ts`의 `ConfigModule` env file path는 bootstrap env loader와 같은 로컬 우선순위를 설명하는 한글 주석을 추가했다.
- Backend convention의 direct `process.env` 금지 문구는 bootstrap env loader 예외 외 금지로 정리했다.
- 공통 환경/배포/의사결정 문서가 같은 예외 범위를 가리키도록 맞췄다.

## 9. 남은 리스크

- G06 범위 안의 남은 리스크 없음.
- API-SPEC template 감사는 G07에서 별도로 진행한다.

## 10. 추가 TODO 필요 여부

- 추가 TODO 없음.
- 다음 실행 대상은 `COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md`다.

## 11. 관련 진행 문서 갱신 여부

- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`: 갱신
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\README.md`: 갱신
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\README.md`: 갱신
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G06-BOOTSTRAP-PROCESS-ENV-POLICY.goal.md`: 갱신
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\GOAL-WORK-ORDER.md`: 갱신
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\CURRENT-RISK-SUMMARY.md`: 갱신
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\VALIDATION-CHECKLIST.md`: G06 사후 재검토에서 bootstrap `process.env` 예외 판정 기준 보강
