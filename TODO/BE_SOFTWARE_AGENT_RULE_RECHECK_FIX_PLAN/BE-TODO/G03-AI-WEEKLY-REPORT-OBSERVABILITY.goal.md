# G03 AI Weekly Report 조회 관측성 계약 보강

상태: Ready for `/goal`
성격: 코드/테스트 수정
우선순위: P2

## 1. 목적

AI Weekly Report API-SPEC에 정의된 관측성 이벤트와 실제 코드 로그를 일치시킨다.

## 2. 선행 문서

- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\OBSERVABILITY.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\COMMENT_AND_LOGGING.md`
- `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\05_AI_WEEKLY_SALES_REPORT\COMMON\API-SPEC\AI_WEEKLY_REPORT_API.md`

## 3. 포함 범위

- `weekViewed`, `detailViewed`, `snapshotSummaryViewed` 이벤트 로깅 추가
- 기존 `generationRequested` 이벤트 유지
- 로그 payload 개인정보/대량 데이터 노출 방지
- 관련 테스트 추가 또는 보강

## 4. 제외 범위

- AI 생성 로직 변경
- 응답 shape 변경
- DB schema 변경
- FE 화면 변경

## 5. 대상 파일

- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`

관련 spec은 아래 명령으로 찾는다.

```powershell
cd D:\workspace_repository\onehandsales
rg --files BE\src\modules\sales-report | rg "\.spec\.ts$"
```

## 6. 현재 확인된 문제

API-SPEC에는 아래 이벤트가 명시되어 있다.

- `ai.weeklyReport.generationRequested`
- `ai.weeklyReport.weekViewed`
- `ai.weeklyReport.detailViewed`
- `ai.weeklyReport.snapshotSummaryViewed`

실제 코드는 `generationRequested`만 확인되었다. `getWeek`, `getDetail`, `getSnapshotSummary`에서 조회 이벤트 로깅이 누락되어 있다.

## 7. 구현 지시

1. 기본 방향은 API-SPEC을 유지하고 코드에 누락 이벤트를 추가하는 것이다.
2. 이벤트명은 API-SPEC과 정확히 일치시킨다.
3. 로그 payload는 userId, weekStart, reportId, status, version 등 식별에 필요한 최소 정보만 포함한다.
4. section 원문, AI provider 원문 응답, snapshot 전체 payload, meeting note 본문은 로그에 포함하지 않는다.
5. 기존 `logEvent` helper를 활용하고 한글 기능 주석을 보강한다.
6. 수정한 조회 method 내부에 한글 단계 주석을 추가한다.

## 8. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand sales-report
rg -n "ai\.weeklyReport\.(generationRequested|weekViewed|detailViewed|snapshotSummaryViewed)" src\modules\sales-report
rg -n "console\." src\modules\sales-report
```

## 9. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\BE_SOFTWARE_AGENT_RULE_RECHECK\G03_AI_WEEKLY_REPORT_OBSERVABILITY\WORK_LOG.md
```

## 10. 완료 기준

- `getWeek` 호출 시 `ai.weeklyReport.weekViewed` 이벤트가 남는다.
- `getDetail` 호출 시 `ai.weeklyReport.detailViewed` 이벤트가 남는다.
- `getSnapshotSummary` 호출 시 `ai.weeklyReport.snapshotSummaryViewed` 이벤트가 남는다.
- 로그 payload에 개인정보/원문 AI 결과/대량 snapshot이 포함되지 않는다.
- typecheck, lint, 관련 테스트가 통과한다.
- 수정한 코드에 한글 주석 규칙이 반영되어 있다.

