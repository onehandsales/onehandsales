# User Web Contract Check

상태: G04 확인 완료

## 1. 목적

G04에서 AI Weekly Report `summaryPreview` 응답 계약을 정리할 때 User Web 타입과 화면 사용 여부를 확인한다.

2026-08-28 G04 확인 결과:

- `summaryPreview`는 User Web 화면에서 직접 렌더링하지 않는다.
- `AiWeeklyReportSummary` 타입과 E2E API mock은 BE 응답 계약과 맞춰야 하는 참조 지점이다.
- G04에서 FE 타입은 `summaryPreview: string | null` required nullable field로 정리했다.
- G04에서 E2E API mock은 READY 리포트에만 `outputJson.executiveSummary.narrative` 우선, 없으면 `headline`, 그 외 `null` 규칙으로 정리했다.
- 재검토에서 User Web 화면이 실패 상태 메시지 fallback으로 `selectedSummary.safeErrorMessage`를 참조하는 것을 확인했고, FE 타입과 BE summary 응답을 `safeErrorCode/safeErrorMessage: string | null` required nullable field로 정리했다.

## 2. 확인 대상

- `FE\user-web\src\features\ai-weekly-report\types\ai-weekly-report.ts`
- `FE\user-web\src\features\ai-weekly-report\api\ai-weekly-report-api.ts`
- `FE\user-web\src\features\ai-weekly-report\components\ai-weekly-report-section.tsx`
- `FE\user-web\tests\e2e\support\user-web-api-mocks.ts`

## 3. 확인 명령

```powershell
cd D:\workspace_repository\onehandsales
rg -n "summaryPreview|AiWeeklyReportSummary|weeklyReport" FE\user-web\src FE\user-web\tests
```

## 4. 판단 기준

- FE 타입 또는 화면이 `summaryPreview`를 기대하면 BE response에 맞춘다.
- FE 타입만 있고 화면에서 쓰지 않는다면 API-SPEC, FE type, BE DTO 중 정본을 결정한다.
- FE 타입을 바꾸면 User Web typecheck 또는 관련 테스트 실행을 검토한다.

## 5. G04 검증 결과

- `cd D:\workspace_repository\onehandsales\FE\user-web`
- `pnpm.cmd run typecheck`: 통과
- 상세 결과는 `TODO_LOG\2026-08-28\BE_SOFTWARE_AGENT_RULE_RECHECK\G04_AI_WEEKLY_REPORT_SUMMARY_PREVIEW_CONTRACT\WORK_LOG.md`에 기록했다.
