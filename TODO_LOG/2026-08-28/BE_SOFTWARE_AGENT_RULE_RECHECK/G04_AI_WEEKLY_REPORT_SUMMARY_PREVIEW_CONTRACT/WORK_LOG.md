# G04 AI Weekly Report summaryPreview 응답 계약 정합화 작업 로그

상태: Completed
작업일: 2026-08-28
대상 Goal: `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G04-AI-WEEKLY-REPORT-SUMMARY-PREVIEW-CONTRACT.goal.md`
완료 커밋: `21841c62`

## 1. 수행 범위

- FE에서 `summaryPreview` 타입과 화면 사용 여부를 확인했다.
- API-SPEC, FE type, BE response interface/mapper의 `summaryPreview` 계약을 정합화했다.
- 재검토에서 발견한 주차 조회 실패 summary의 safe error 계약 불일치를 함께 정합화했다.
- BE application service와 관련 단위 테스트를 보강했다.
- FE User Web 타입과 E2E API mock을 보강했다.
- 관련 진행 문서를 G04 완료 / G05 다음 실행 상태로 갱신했다.

## 2. 제외 범위

- AI 생성 프롬프트 품질 개선은 수행하지 않았다.
- 신규 DB field 추가와 Prisma schema 변경은 수행하지 않았다.
- unrelated FE UI 개선은 수행하지 않았다.
- 화면에 `summaryPreview`를 새로 노출하는 작업은 수행하지 않았다.

## 3. 읽은 Agent/계약 문서

- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G04-AI-WEEKLY-REPORT-SUMMARY-PREVIEW-CONTRACT.goal.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\FE-TODO\USER-WEB-CONTRACT-CHECK.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\SOFTWARE_AGENT\DB_SCHEMA\TIME_AND_TIMEZONE_POLICY.md`
- `AGENT\SOFTWARE_AGENT\FRONT_AGENT\README.md`
- `AGENT\SOFTWARE_AGENT\FRONT_AGENT\ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\05_AI_WEEKLY_SALES_REPORT\COMMON\API-SPEC\AI_WEEKLY_REPORT_API.md`

## 4. FE 사용 확인

실행 명령:

```powershell
cd D:\workspace_repository\onehandsales
rg -n "summaryPreview|AiWeeklyReportSummary|weeklyReport" FE\user-web\src FE\user-web\tests
```

확인 결과:

- `summaryPreview` 직접 선언 위치는 `FE\user-web\src\features\ai-weekly-report\types\ai-weekly-report.ts`였다.
- 화면 컴포넌트는 `AiWeeklyReportSummary`를 전달/정렬/선택 용도로 사용하지만 `summaryPreview`를 직접 표시하지 않는다.
- E2E API mock의 `toAiWeeklyReportSummary`는 요약 응답을 생성하므로 BE 계약과 맞출 필요가 있었다.

## 5. 정본 결정

- API-SPEC의 `summaryPreview` 의도를 유지한다.
- BE `AiWeeklySalesReportSummaryResponse`와 `toReportSummary`를 정본 응답 계약에 맞춘다.
- FE `AiWeeklyReportSummary`는 optional이 아닌 required nullable field로 맞춘다.
- FE가 실패 상태 메시지 fallback으로 `selectedSummary.safeErrorMessage`를 참조하므로, summary 응답의 `safeErrorCode`, `safeErrorMessage`도 required nullable field로 맞춘다.
- 목표 문서의 `BE\src\modules\sales-report\application\dto\ai-weekly-sales-report.response.ts`는 현재 존재하지 않아, 실제 응답 interface가 있는 application service 파일을 수정했다.
- `summaryPreview`는 `status=READY` 리포트에서만 `outputJson.executiveSummary.narrative`를 우선 사용하고, 없으면 `outputJson.executiveSummary.headline`을 사용한다.
- 생성 중, 실패, output 없음, executive summary 없음의 경우 `summaryPreview`는 `null`이다.
- BE/FE mock 모두 160자 초과 시 `...` suffix로 축약한다.

## 6. 수정 파일

- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
  - `AiWeeklySalesReportSummaryResponse.summaryPreview` 추가
  - `AiWeeklySalesReportSummaryResponse.safeErrorCode/safeErrorMessage` 추가
  - `toReportSummary`에서 READY 리포트의 summary preview 파생
  - `toReportSummary`에서 safe error nullable field 반환
  - `createSummaryPreview` helper 추가
  - 수정 method/helper에 한글 기능 주석 추가
- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.spec.ts`
  - 생성 중 리포트는 `summaryPreview: null` 검증
  - 주차 조회와 상세 조회에서 READY 리포트의 summary preview 검증
  - READY 리포트의 headline fallback, 생성 중/실패 리포트의 `null` 처리 검증
  - 실패 summary의 `safeErrorCode/safeErrorMessage` 반환 검증
  - 조회 로그에 AI summary preview 문자열이 포함되지 않음을 검증
- `FE\user-web\src\features\ai-weekly-report\types\ai-weekly-report.ts`
  - `AiWeeklyReportSummary.summaryPreview`를 required nullable field로 변경
  - `AiWeeklyReportSummary.safeErrorCode/safeErrorMessage`를 required nullable field로 변경
- `FE\user-web\tests\e2e\support\user-web-api-mocks.ts`
  - E2E mock summary 응답에 BE와 같은 `summaryPreview` 파생 규칙 추가
- `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\05_AI_WEEKLY_SALES_REPORT\COMMON\API-SPEC\AI_WEEKLY_REPORT_API.md`
  - 생성/주차/상세 응답 예시에 `summaryPreview` 추가
  - 주차 조회 summary 예시를 BE/FE 공통 summary field 전체와 safe error field 기준으로 정리
  - READY 전용 산출 규칙과 null 조건 문서화
  - week/detail 조회 log payload에 summary preview 문자열을 포함하지 않는 redaction 정책 명확화
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\README.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\README.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G04-AI-WEEKLY-REPORT-SUMMARY-PREVIEW-CONTRACT.goal.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\CURRENT-RISK-SUMMARY.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\GOAL-WORK-ORDER.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\FE-TODO\USER-WEB-CONTRACT-CHECK.md`

## 7. 검증 명령

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand sales-report

cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck

cd D:\workspace_repository\onehandsales
rg -n "summaryPreview" TODO BE FE
rg -n "summaryPreview?:|safeErrorCode?:|safeErrorMessage?:" BE\src\modules\sales-report FE\user-web\src\features\ai-weekly-report FE\user-web\tests\e2e\support\user-web-api-mocks.ts
git diff --check
```

## 8. 검증 결과

- BE `pnpm.cmd run typecheck`: 통과
- BE `pnpm.cmd run lint`: 통과
- BE `pnpm.cmd test -- --runInBand sales-report`: 통과, 4 suites / 14 tests
- FE User Web `pnpm.cmd run typecheck`: 통과
- `git diff --check`: 통과. CRLF 변환 경고만 출력되었고 whitespace error는 없었다.
- `rg -n "summaryPreview" TODO BE FE`: 의도된 잔존 위치만 확인했다.
- G04 관련 범위 `rg -n "summaryPreview?:|safeErrorCode?:|safeErrorMessage?:" ...`: 출력 없음. AI Weekly Report 관련 summary 계약에 optional field 잔존은 없다.

## 9. `summaryPreview` 잔존 위치와 의도

- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`: 응답 interface, mapper, helper
- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.spec.ts`: 응답 계약과 로그 비노출 테스트
- `FE\user-web\src\features\ai-weekly-report\types\ai-weekly-report.ts`: User Web 응답 타입 계약
- `FE\user-web\tests\e2e\support\user-web-api-mocks.ts`: E2E API mock 응답 계약
- `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\05_AI_WEEKLY_SALES_REPORT\COMMON\API-SPEC\AI_WEEKLY_REPORT_API.md`: API-SPEC 예시와 산출 규칙
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN` 하위 문서: Goal 상태와 참조/리스크 기록
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\FE-TODO\USER-WEB-CONTRACT-CHECK.md`: User Web 확인 결과와 FE typecheck 결과 기록

## 10. 자체 검토 결과

- API-SPEC, BE DTO 역할 interface, mapper, FE 타입, FE mock이 `summaryPreview: string | null` 계약으로 정합화되었다.
- API-SPEC, BE DTO 역할 interface, mapper, FE 타입, FE mock이 `safeErrorCode/safeErrorMessage: string | null` 계약으로 정합화되었다.
- FE 화면 직접 표시 위치는 없으므로 UI 변경은 하지 않았다.
- BE 코드 수정부에는 한글 기능 주석을 추가했다.
- 조회 로그에는 AI output 기반 preview 문자열을 포함하지 않는다.
- DB schema 변경은 필요 없었다.

## 11. 잔여 리스크

- G04 범위의 잔여 리스크는 없다.
- G05 한글 주석 규칙 전수 보강은 다음 Goal로 남아 있다.

## 12. 추가 TODO 필요 여부

- 추가 TODO 없음.

## 13. 관련 진행 문서 갱신 여부

- 개별 G04 goal 문서 갱신 완료
- 상위 README 갱신 완료
- BE-TODO README 갱신 완료
- `COMMON\GOAL-WORK-ORDER.md` 갱신 완료
- `COMMON\CURRENT-RISK-SUMMARY.md` 갱신 완료
- `FE-TODO\USER-WEB-CONTRACT-CHECK.md` 갱신 완료
- 상위 단일 진입 문서 `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md` 갱신 완료
