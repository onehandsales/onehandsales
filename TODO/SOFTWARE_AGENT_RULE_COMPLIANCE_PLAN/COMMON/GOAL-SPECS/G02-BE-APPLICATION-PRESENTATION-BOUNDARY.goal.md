# G02 BE Application Presentation Boundary

상태: Implemented / Verified
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

## 7. 구현 결과

- Backend application service 9곳에서 `../../presentation/http/*response.mapper` import와 `*Response` 반환 타입을 제거했다.
- `AccountRequestApplicationService`는 `UserDataExportRequestApplicationResult`와 repository record를 반환하도록 분리했다.
- Admin Operation application service는 기존 application port의 page/detail/record 타입을 반환하도록 정리했다.
- `AdminAuditApplicationService`는 민감 원문 조회 결과를 `AdminSensitiveRawAccessApplicationResult`로 반환하고, HTTP response mapper 호출은 controller로 이동했다.
- Account Request와 Admin Operation controller가 application result/page/detail/record를 받은 뒤 같은 presentation 폴더의 response mapper로 API 응답 계약을 생성하도록 변경했다.
- application service spec은 HTTP response shape가 아니라 application record/result 기준으로 갱신했다.
- API route, status code, response mapper shape, DB query는 변경하지 않았다.

## 8. 검증 결과

검증일: 2026-08-11
완료 로그: `TODO_LOG/2026-08-11/G02_BE_APPLICATION_PRESENTATION_BOUNDARY/WORK_LOG.md`

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
