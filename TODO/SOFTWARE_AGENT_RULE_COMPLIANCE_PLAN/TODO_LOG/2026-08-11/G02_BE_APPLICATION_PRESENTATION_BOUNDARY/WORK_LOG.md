# G02 BE Application Presentation Boundary Work Log

상태: 완료 / 검증 완료
작업일: 2026-08-11
대상 goal: `COMMON/GOAL-SPECS/G02-BE-APPLICATION-PRESENTATION-BOUNDARY.goal.md`

## 1. 작업 범위

- Backend application service 9곳에서 presentation response mapper import를 제거했다.
- application service 반환 타입을 presentation `*Response`가 아닌 application port record/page/detail 타입으로 변경했다.
- 데이터 export 요청은 response 계산 기준 시각이 필요하므로 `UserDataExportRequestApplicationResult`를 application service에 정의했다.
- 민감 원문 조회는 access log와 raw data를 함께 controller에 넘기기 위해 `AdminSensitiveRawAccessApplicationResult`를 application service에 정의했다.
- Account Request와 Admin Operation controller가 application result를 받아 같은 presentation 폴더의 response mapper로 API 응답을 생성하도록 변경했다.
- application service spec은 HTTP response shape 검증이 아니라 application result/record와 audit orchestration 검증 기준으로 갱신했다.
- API route, status code, response field, DB query, UX/UI는 변경하지 않았다.

## 2. 수정 파일

- `BE/src/modules/account-request/application/services/account-request-application.service.ts`
- `BE/src/modules/account-request/application/services/account-request-application.service.spec.ts`
- `BE/src/modules/account-request/presentation/http/account-request.controller.ts`
- `BE/src/modules/admin-operation/application/services/admin-account-request-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-account-request-application.service.spec.ts`
- `BE/src/modules/admin-operation/application/services/admin-analytics-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-audit-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-audit-application.service.spec.ts`
- `BE/src/modules/admin-operation/application/services/admin-domain-record-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-provider-failure-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-provider-failure-application.service.spec.ts`
- `BE/src/modules/admin-operation/application/services/admin-system-operation-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-trash-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-user-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-user-application.service.spec.ts`
- `BE/src/modules/admin-operation/presentation/http/admin-account-request.controller.ts`
- `BE/src/modules/admin-operation/presentation/http/admin-analytics.controller.ts`
- `BE/src/modules/admin-operation/presentation/http/admin-audit.controller.ts`
- `BE/src/modules/admin-operation/presentation/http/admin-domain-record.controller.ts`
- `BE/src/modules/admin-operation/presentation/http/admin-provider-failure.controller.ts`
- `BE/src/modules/admin-operation/presentation/http/admin-system-operation.controller.ts`
- `BE/src/modules/admin-operation/presentation/http/admin-trash.controller.ts`
- `BE/src/modules/admin-operation/presentation/http/admin-user.controller.ts`
- `TODO/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN/*`
- `TODO/README.md`

## 3. 검증 결과

```powershell
cd D:\workspace_repository\onehandsales
rg -n "presentation/http|\\.\\./\\.\\./presentation|@/modules/.*/presentation" BE/src/modules --glob "**/application/**/*.ts" --glob "!**/*.spec.ts"
git diff --check

cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- account-request-application.service.spec.ts admin-audit-application.service.spec.ts admin-provider-failure-application.service.spec.ts admin-user-application.service.spec.ts admin-account-request-application.service.spec.ts admin-analytics-application.service.spec.ts admin-domain-record-application.service.spec.ts admin-system-operation-application.service.spec.ts admin-trash-application.service.spec.ts
pnpm.cmd test
```

결과:

- application source의 presentation 의존 검색 결과 없음
- `git diff --check` 통과
- Backend `typecheck` 통과
- Backend `lint` 통과
- 영향 application service spec 9개 suite / 38개 test 통과
- Backend 전체 Jest 96개 suite / 518개 test 통과

## 4. 남은 후속 작업

- 다음 권장 goal은 `G03-BE-ADMIN-PRISMA-TYPE-BOUNDARY.goal.md`다.
