# User Web Contract Check

상태: G04 참조 문서

## 1. 목적

G04에서 AI Weekly Report `summaryPreview` 응답 계약을 정리할 때 User Web 타입과 화면 사용 여부를 확인한다.

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

