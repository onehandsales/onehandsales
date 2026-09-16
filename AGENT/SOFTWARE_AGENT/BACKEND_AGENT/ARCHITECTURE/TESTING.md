# Backend Testing

## 필수 점검

- `pnpm prisma:validate`
- `pnpm prisma:generate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

## 테스트 기준

- Auth/User session flow
- Error Report and Support Request intake
- Public Contact Request intake
- Admin authority check

## 테스트 계층

Backend 테스트는 아래 계층을 구분한다.

| 계층 | 목적 |
| --- | --- |
| Domain unit | 순수 규칙, value, error 판단을 빠르게 검증 |
| Application use case | 권한, orchestration, transaction 호출 여부, idempotency 판단 검증 |
| Repository integration | Prisma mapping, index/unique 제약, transaction rollback 검증 |
| Controller/API contract | route, guard, DTO validation, response/error 계약 검증 |
| Architecture boundary | module 경계, 금지 import, Prisma/Supabase type 누수 방지 검증 |

규칙:

- 새 business rule은 가능하면 domain 또는 application use case test로 먼저 검증한다.
- Prisma repository 동작은 mock만으로 끝내지 않고 중요한 제약은 integration test로 검토한다.
- 다른 module의 repository 구현체를 직접 import하지 않는 boundary test를 검토한다.
- idempotency가 필요한 mutation은 중복 요청 처리 테스트를 둔다.
- outbox 또는 후속 처리 기록이 있는 mutation은 성공 응답과 후속 처리 실패 경계를 분리해 테스트한다.
