# G04 AI Weekly Report summaryPreview 응답 계약 정합화

상태: Ready for `/goal`
성격: 코드 또는 문서 수정
우선순위: P2

## 1. 목적

API-SPEC과 FE 타입에 있는 `summaryPreview`와 실제 BE 응답 DTO/mapper의 불일치를 정리한다.

## 2. 선행 문서

- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\REFERENCES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\SCOPE.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\EXECUTION-GATES.md`
- `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\FE-TODO\USER-WEB-CONTRACT-CHECK.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\SOFTWARE_AGENT\DB_SCHEMA\TIME_AND_TIMEZONE_POLICY.md`
- `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\05_AI_WEEKLY_SALES_REPORT\COMMON\API-SPEC\AI_WEEKLY_REPORT_API.md`

## 3. 포함 범위

- FE 사용 여부 확인
- API-SPEC, FE 타입, BE DTO/mapper 중 정본 결정
- 결정에 따른 코드 또는 문서 수정
- 관련 테스트 보강

## 4. 제외 범위

- AI 생성 품질 개선
- 신규 필드 대량 추가
- DB schema 변경
- unrelated FE UI 개선

## 5. 대상 파일

- `BE\src\modules\sales-report\application\dto\ai-weekly-sales-report.response.ts`
- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- `FE\user-web\src\features\ai-weekly-report\types\ai-weekly-report.ts`
- `FE\user-web\src\features\ai-weekly-report\api\ai-weekly-report-api.ts`
- `FE\user-web\src\features\ai-weekly-report\components\ai-weekly-report-section.tsx`
- `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\05_AI_WEEKLY_SALES_REPORT\COMMON\API-SPEC\AI_WEEKLY_REPORT_API.md`

## 6. 현재 확인된 문제

- API-SPEC 예시에는 `summaryPreview`가 있다.
- FE User Web 타입 `AiWeeklyReportSummary`에도 `summaryPreview?: string | null`가 있다.
- 실제 `AiWeeklySalesReportSummaryResponse`와 `toReportSummary`에는 `summaryPreview`가 없다.

## 7. 구현 지시

1. 먼저 아래 명령으로 FE 사용 여부를 확인한다.

```powershell
cd D:\workspace_repository\onehandsales
rg -n "summaryPreview|AiWeeklyReportSummary|weeklyReport" FE\user-web\src FE\user-web\tests
```

2. FE 타입 또는 화면이 `summaryPreview`를 기대하면 BE response DTO와 mapper에 필드를 추가한다.
3. FE 타입만 있고 화면에서 표시하지 않는 경우에도 API-SPEC, FE type, BE DTO 중 정본을 하나로 맞춘다.
4. API-SPEC 예시만 잘못된 것으로 판단하려면 FE 타입에서 해당 필드를 제거하거나 deprecated 의도를 문서화한다.
5. BE 코드를 수정하는 경우 관련 class/interface/type/method/helper에 한글 역할/기능 주석을 작성한다.
6. 문서만 수정하는 경우에도 변경 이유와 검증 결과를 TODO_LOG에 남긴다.

## 8. 검증

코드 수정 시:

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand sales-report
```

FE 타입 수정 시:

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
```

공통 확인:

```powershell
cd D:\workspace_repository\onehandsales
rg -n "summaryPreview" TODO BE FE
```

## 9. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\BE_SOFTWARE_AGENT_RULE_RECHECK\G04_AI_WEEKLY_REPORT_SUMMARY_PREVIEW_CONTRACT\WORK_LOG.md
```

## 10. 완료 기준

- API-SPEC, DTO, mapper, FE 사용 코드가 서로 일치한다.
- 코드 수정 시 typecheck, lint, 관련 테스트가 통과한다.
- FE 타입 수정 시 FE typecheck가 통과하거나 실행 불가 사유가 기록되어 있다.
- 문서 수정 시 `summaryPreview` 잔존 위치와 의도가 TODO_LOG에 기록되어 있다.
- 수정한 코드가 있다면 한글 주석 규칙이 반영되어 있다.

