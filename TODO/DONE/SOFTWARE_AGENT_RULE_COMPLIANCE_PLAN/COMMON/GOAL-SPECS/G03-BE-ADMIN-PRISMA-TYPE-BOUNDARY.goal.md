# G03 BE Admin Prisma Type Boundary

상태: Implemented / Verified
영역: BE
우선순위: High

## 0. 필수 준수 원칙

- 이 goal을 구현할 때는 `AGENT/SOFTWARE_AGENT` 하위 관련 문서를 반드시 먼저 확인하고 그대로 따른다.
- goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 우선한다.
- 충돌이나 누락이 발견되면 구현 전에 TODO 문서를 보완하고 근거를 기록한다.

## 1. 목적

Admin Operation application/port 계층에서 `@prisma/client` enum/type import를 제거한다. Prisma enum과 DB row 매핑은 infrastructure에서 처리한다.

## 2. 대상 후보

- `BE/src/modules/admin-operation/application/ports/*.repository.ts`
- `BE/src/modules/admin-operation/application/services/*application.service.ts`

## 3. 포함 범위

- application 전용 enum 또는 string union 정의
- repository port의 Prisma enum type 제거
- Prisma row -> application record mapping을 infrastructure에 격리
- application service의 `@prisma/client` import 제거
- 테스트 fixture의 Prisma enum 직접 의존 정리

## 4. 제외 범위

- Prisma schema 변경
- migration 작성
- Admin API response field 변경

## 5. 완료 기준

아래 검색에서 application source 결과가 없어야 한다.

```powershell
rg -n "@prisma/client" BE/src/modules/admin-operation/application --glob "!**/*.spec.ts"
```

spec에서 Prisma enum을 써야 하는 경우에도 application 계약 검증과 Prisma mapping 검증을 분리한다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
```

## 7. 구현 결과

- `BE/src/modules/admin-operation/application/ports/admin-operation.types.ts`를 추가해 Admin Operation application 전용 enum-like const object와 union type을 정의했다.
- Admin Operation application repository port 8곳에서 `@prisma/client` enum/type import를 제거하고 application 전용 타입을 사용하도록 변경했다.
- Admin Operation application service 8곳에서 `@prisma/client` import를 제거하고 application 전용 타입/값을 사용하도록 변경했다.
- application service spec 8곳의 Prisma enum fixture 의존을 application 전용 타입 fixture로 정리했다.
- Prisma schema, migration, Admin API response field는 변경하지 않았다.
- Prisma repository와 presentation DTO/response mapper는 기존 DB/API edge 역할을 유지한다.

## 8. 검증 결과

검증일: 2026-08-11
완료 로그: `TODO_LOG/2026-08-11/G03_BE_ADMIN_PRISMA_TYPE_BOUNDARY/WORK_LOG.md`

```powershell
cd D:\workspace_repository\onehandsales
rg -n "@prisma/client" BE/src/modules/admin-operation/application --glob "!**/*.spec.ts"

cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- admin-account-request-application.service.spec.ts admin-analytics-application.service.spec.ts admin-audit-application.service.spec.ts admin-domain-record-application.service.spec.ts admin-provider-failure-application.service.spec.ts admin-system-operation-application.service.spec.ts admin-trash-application.service.spec.ts admin-user-application.service.spec.ts prisma-admin-account-request.repository.spec.ts prisma-admin-analytics.repository.spec.ts prisma-admin-audit.repository.spec.ts prisma-admin-domain-record.repository.spec.ts prisma-admin-provider-failure.repository.spec.ts prisma-admin-system-operation.repository.spec.ts prisma-admin-trash.repository.spec.ts prisma-admin-user.repository.spec.ts
pnpm.cmd test
```

결과:

- application source의 `@prisma/client` 검색 결과 없음
- Backend `typecheck` 통과
- Backend `lint` 통과
- Admin Operation application/infrastructure 관련 spec 15개 suite / 52개 test 통과
- Backend 전체 Jest 96개 suite / 518개 test 통과
- 추가 재검토에서 spec 포함 Admin Operation application 영역의 `@prisma/client` 검색 결과도 없음
