# G99 final review

상태: Ready after G01-G02
성격: 최종 검토
우선순위: P3

## 1. 목적

`PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`의 DTO validation contract 분리와 response mapper read model contract 분리가 Backend Agent 계층 규칙, API 계약 보존, 검증 기준을 만족했는지 최종 확인한다.

## 2. 선행 문서

- `TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\README.md`
- `TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`
- `TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\GOAL-WORK-ORDER.md`
- `TODO_LOG\<YYYY-MM-DD>\PRESENTATION_CONTRACT_TYPE_BOUNDARY\G01_DTO_VALIDATION_CONTRACT_BOUNDARY\WORK_LOG.md`
- `TODO_LOG\<YYYY-MM-DD>\PRESENTATION_CONTRACT_TYPE_BOUNDARY\G02_RESPONSE_MAPPER_READ_MODEL_BOUNDARY\WORK_LOG.md`

## 3. 포함 범위

- presentation의 repository port import 잔존 여부 확인
- repository token/interface 직접 사용 0건 확인
- API request/response shape 변경 여부 확인
- Backend typecheck/lint/test 결과 확인
- 상위 TODO 문서 상태 갱신

## 4. 제외 범위

- 신규 코드 기능 추가
- API 계약 의미 변경
- FE 코드 변경
- 완료된 unrelated TODO 문서 수정

## 5. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand
rg -n "application/ports/.+repository|application\\ports\\.+repository" src\modules -g "*.ts" -g "!*.spec.ts" | rg "\\presentation\\"
rg -n "@Inject\\(|REPOSITORY|Repository" src\modules\*\presentation -g "*.ts" -g "!*.spec.ts"
```

## 6. 완료 기준

- G01, G02 완료 로그가 존재한다.
- 남은 예외가 있으면 사유와 후속 계획이 문서화되어 있다.
- 계획 README와 `TODO/README.md`의 상태가 최신이다.
- Backend 검증이 통과한다.
