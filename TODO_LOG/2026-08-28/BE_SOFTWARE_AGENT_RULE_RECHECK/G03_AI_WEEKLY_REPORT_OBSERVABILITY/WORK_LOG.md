# G03 AI Weekly Report 조회 관측성 계약 보강 작업 로그

상태: Completed
작업일: 2026-08-28
대상 Goal: `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G03-AI-WEEKLY-REPORT-OBSERVABILITY.goal.md`

## 1. 수행 범위

- `getWeek` 조회 성공 시 `ai.weeklyReport.weekViewed` 구조화 로그를 추가했습니다.
- `getDetail` 조회 성공 시 `ai.weeklyReport.detailViewed` 구조화 로그를 추가했습니다.
- `getSnapshotSummary` 조회 성공 시 `ai.weeklyReport.snapshotSummaryViewed` 구조화 로그를 추가했습니다.
- 기존 `ai.weeklyReport.generationRequested` 이벤트를 유지하고 테스트로 확인했습니다.
- 로그 payload는 `userId`, `reportId`, `weekStart`, `weekEnd`, `timeZone`, `status`, `version`, aggregate count 등 최소 식별 정보로 제한했습니다.
- 조회 메서드와 신규 helper에 한글 `// 기능 : ...`, `// 1. ...` 단계 주석을 반영했습니다.

## 2. 제외 범위

- AI 생성 로직은 변경하지 않았습니다.
- API request/response shape는 변경하지 않았습니다.
- DB schema와 Prisma migration은 변경하지 않았습니다.
- FE 화면과 FE API client는 변경하지 않았습니다.

## 3. 읽은 Agent/계약 문서

- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\README.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\OBSERVABILITY.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\COMMENT_AND_LOGGING.md`
- `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\05_AI_WEEKLY_SALES_REPORT\COMMON\API-SPEC\AI_WEEKLY_REPORT_API.md`

## 4. 수정 파일

- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.spec.ts`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\README.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\README.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G03-AI-WEEKLY-REPORT-OBSERVABILITY.goal.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\CURRENT-RISK-SUMMARY.md`
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\GOAL-WORK-ORDER.md`
- `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G03_AI_WEEKLY_REPORT_OBSERVABILITY\WORK_LOG.md`

## 5. 검증 명령

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand sales-report
rg -n "ai\.weeklyReport\.(generationRequested|weekViewed|detailViewed|snapshotSummaryViewed)" src\modules\sales-report
rg -n "console\." src\modules\sales-report
```

추가 확인:

```powershell
cd D:\workspace_repository\onehandsales
rg --files BE\src\modules\sales-report | rg "spec\.ts"
git diff --check
```

## 6. 검증 결과

- `pnpm.cmd run typecheck`: 통과
- `pnpm.cmd run lint`: 통과
- `pnpm.cmd test -- --runInBand sales-report`: 통과, 4 suites / 13 tests
- `rg -n "ai\.weeklyReport\.(generationRequested|weekViewed|detailViewed|snapshotSummaryViewed)" src\modules\sales-report`: 4개 이벤트 모두 코드와 테스트에서 확인
- `rg -n "console\." src\modules\sales-report`: 출력 없음, 0건
- `rg --files BE\src\modules\sales-report | rg "spec\.ts"`: sales-report 관련 spec 4개 확인
- `git diff --check`: 통과
- 구현/로그 커밋: `c915111f fix(sales-report): log weekly report view events`

## 7. 자체 검토 결과

- `getWeek`는 주차 조회 결과를 만든 뒤 `weekViewed`를 기록합니다.
- `getDetail`은 report 상세 응답을 만든 뒤 `detailViewed`를 기록합니다.
- `getSnapshotSummary`는 snapshot 요약 응답을 만든 뒤 `snapshotSummaryViewed`를 기록합니다.
- 조회 로그에는 section 원문, AI provider 원문 응답, snapshot 전체 payload, meeting note 본문을 포함하지 않습니다.
- 테스트는 generation/week/detail/snapshotSummary 이벤트 payload와 원문 미포함을 검증합니다.
- G03 커밋 대상은 sales-report 코드와 관련 TODO/TODO_LOG 문서로 제한했습니다.

## 8. 잔여 리스크

- 없음

## 9. 추가 TODO 필요 여부

- 없음

## 10. 관련 진행 문서 갱신 여부

- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`: G03 완료와 G04 next 상태를 반영했습니다.
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\README.md`: G03 완료와 G04 next 상태를 반영했습니다.
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\README.md`: G03 완료와 G04 next 상태를 반영했습니다.
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\GOAL-WORK-ORDER.md`: G03 완료와 G04 next 상태를 반영했습니다.
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\CURRENT-RISK-SUMMARY.md`: G03 리스크 해결과 확인 위치를 반영했습니다.
- `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G03-AI-WEEKLY-REPORT-OBSERVABILITY.goal.md`: 상태를 Completed로 갱신했습니다.
