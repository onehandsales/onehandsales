# G03 BE Admin Prisma Type Boundary

상태: Draft
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
