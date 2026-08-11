# G02 BE Application Presentation Boundary

상태: Draft
영역: BE
우선순위: High

## 0. 필수 준수 원칙

- 이 goal을 구현할 때는 `AGENT/SOFTWARE_AGENT` 하위 관련 문서를 반드시 먼저 확인하고 그대로 따른다.
- goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 우선한다.
- 충돌이나 누락이 발견되면 구현 전에 TODO 문서를 보완하고 근거를 기록한다.

## 1. 목적

Backend application 계층이 presentation mapper/response type에 의존하지 않도록 정리한다.

## 2. 대상 후보

- `BE/src/modules/account-request/application/services/account-request-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-account-request-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-analytics-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-audit-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-domain-record-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-provider-failure-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-system-operation-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-trash-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-user-application.service.ts`

## 3. 포함 범위

- application service에서 `../../presentation/http/*response.mapper` import 제거
- application result type을 application 계층에 정의
- presentation controller에서 application result를 response mapper로 변환
- 기존 response shape 유지
- 관련 테스트 갱신
- 수정한 class/function에 주석 규칙 적용

## 4. 제외 범위

- API response shape 변경
- DB query 변경
- Admin 기능 추가

## 5. 완료 기준

아래 검색이 application source에서 결과를 내지 않는다.

```powershell
rg -n "presentation/http|\\.\\./\\.\\./presentation|@/modules/.*/presentation" BE/src/modules --glob "**/application/**/*.ts" --glob "!**/*.spec.ts"
```

기존 controller 응답은 변경되지 않는다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
```

영향 모듈의 spec이 있으면 함께 실행한다.
