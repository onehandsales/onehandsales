# /goal G01 BE Company List Contact Count

## /goal 입력문

아래 문서를 먼저 읽고, 회사 목록 페이지네이션 API 응답에 회사별 거래처 수 `contactCount`를 추가해줘.

필수 참고 문서:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`
- `TODO/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_LIST_CONTACT_COUNT_API.md`

## 목표

`GET /api/companies` 응답의 `items[]`에 `contactCount: number`를 추가한다.

## 구현 범위

- `BE/src/modules/company/application/ports/company.repository.ts`
- `BE/src/modules/company/application/services/company-application.service.ts`
- `BE/src/modules/company/infrastructure/persistence/prisma-company.repository.ts`
- 필요 시 Company 응답 타입 또는 mapper
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`

## 비즈니스 규칙

- 기존 `GET /api/companies` 요청값은 변경하지 않는다.
- `totalCount`는 기존처럼 검색/필터 조건에 맞는 회사 전체 개수다.
- `contactCount`는 각 회사에 연결된 거래처 수다.
- 회사별 거래처 수는 현재 사용자 ownership 기준을 벗어나면 안 된다.
- 회사 목록 정렬, page size, 검색, 필터 동작은 변경하지 않는다.

## 구현 제한

- `GET /api/companies/:companyId` 단건 응답은 변경하지 않는다.
- Contact API는 변경하지 않는다.
- Product API는 변경하지 않는다.
- Frontend 화면은 이 goal에서 변경하지 않는다.
- N+1 count 쿼리를 만들지 않는다.

## 권장 구현 방향

Prisma `Company` 조회에서 relation `_count`를 포함해 `contacts` 개수를 함께 조회하는 방식을 우선 검토한다.

## 검증

필수 검증:

```bash
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

동작 검증:

- 거래처가 없는 회사는 `contactCount: 0`을 반환한다.
- 거래처가 있는 회사는 실제 연결 수를 반환한다.
- 검색/필터 적용 시 `totalCount`는 회사 개수 기준으로 유지된다.
- 다른 사용자의 거래처 수가 섞이지 않는다.

## 완료 보고

- 변경한 파일
- 응답 shape 변경 내용
- 실행한 검증 명령과 결과
- 남은 리스크 또는 후속 작업
