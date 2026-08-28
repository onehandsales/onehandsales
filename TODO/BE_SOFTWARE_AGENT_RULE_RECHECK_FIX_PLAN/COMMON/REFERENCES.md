# References

상태: Ready

## 1. 필수 선행 확인

모든 `/goal`은 작업 전에 실제 파일 목록을 먼저 확인한다.

```powershell
cd D:\workspace_repository\onehandsales
rg --files AGENT\SOFTWARE_AGENT\BACKEND_AGENT
```

## 2. Backend Agent 필수 문서

- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\README.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ENGINEERING_REVIEW_CHECKLIST.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\README.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\OVERVIEW.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\BACKEND.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\TESTING.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\DEPLOYMENT.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\README.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\TRANSACTION.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\OBSERVABILITY.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\COMMENT_AND_LOGGING.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\README.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\002_backend_rules_absorption.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\003_backend_testing.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\004_backend_deployment_environment.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\005_backend_api_function_comment_rule.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\BACKEND_AGENT\DECISIONS\006_backend_transaction_observability_api_contract.md`

## 3. 공통 DB/시간 정책

- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\DB_SCHEMA\README.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\DB_SCHEMA\TIME_AND_TIMEZONE_POLICY.md`

## 4. 실행 관리 문서

- `D:\workspace_repository\onehandsales\AGENT\AGENT_USAGE_RULES.md`
- `D:\workspace_repository\onehandsales\AGENT\PM_AGENT\DECISIONS\018_todo_common_contract_structure.md`
- `D:\workspace_repository\onehandsales\AGENT\PM_AGENT\DECISIONS\020_todo_execution_plan_standard.md`
- `D:\workspace_repository\onehandsales\AGENT\PM_AGENT\DECISIONS\022_goal_completion_review_todo_log.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\COMMON\ENVIRONMENT.md`

## 5. API/FE 계약 변경 시 추가 문서

- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\FRONT_AGENT\README.md`
- `D:\workspace_repository\onehandsales\AGENT\SOFTWARE_AGENT\FRONT_AGENT\ENGINEERING_REVIEW_CHECKLIST.md`
- 해당 기능의 `TODO\...\COMMON\API-SPEC\*.md`
- 해당 기능을 사용하는 `FE` API client와 화면 코드

## 6. 주요 코드 참조

- `BE\src\modules\admin-operation\application\ports\admin-operation.types.ts`
- `BE\src\modules\admin-operation\presentation\http\admin-audit-response.mapper.ts`
- `BE\src\modules\admin-operation\presentation\http\dto\admin-audit-request.dto.ts`
- `BE\src\modules\admin-operation\presentation\http\dto\admin-user-request.dto.ts`
- `BE\src\modules\sales-report\application\services\ai-weekly-sales-report-application.service.ts`
- `BE\src\modules\sales-report\infrastructure\sales-report.module.ts`
- `BE\src\modules\schedule\application\services\schedule-application.service.ts`
- `BE\src\modules\schedule\application\ports\schedule.repository.ts`
- `BE\src\modules\schedule\infrastructure\schedule.module.ts`
- `BE\src\modules\follow-up\application\ports\follow-up-draft.provider.ts`
- `BE\src\modules\follow-up\application\ports\follow-up-delivery-secret-encryption.port.ts`
- `BE\src\modules\follow-up\presentation\http\dto\follow-up-delivery-settings-request.dto.ts`
- `BE\src\main.ts`

## 7. AI Weekly Report 계약 참조

- `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\05_AI_WEEKLY_SALES_REPORT\COMMON\API-SPEC\AI_WEEKLY_REPORT_API.md`
- `FE\user-web\src\features\ai-weekly-report\types\ai-weekly-report.ts`
- `FE\user-web\src\features\ai-weekly-report\api\ai-weekly-report-api.ts`
- `FE\user-web\src\features\ai-weekly-report\components\ai-weekly-report-section.tsx`
