# Backend Convention

## Module Structure

```
<module>/
  domain/
  application/
  infrastructure/
  presentation/
```

## Naming

- controller: `<domain>.controller.ts`
- service: `<domain>-application.service.ts`
- repository port: `<domain>.repository.ts`
- Prisma repository: `prisma-<domain>.repository.ts`
- error file: `<domain>.errors.ts`

## API

- 모든 사용자 업무 API는 current user ownership을 검증한다.
- pagination은 page/pageSize 또는 cursor 중 도메인 기존 방식을 따른다.
- DTO는 class-validator로 외부 입력을 검증한다.
- mutation은 application service에서 transaction boundary를 잡는다.

## Module Boundary

- Backend는 현재 단일 NestJS 서버지만 module 경계는 미래 MSA service 경계처럼 다룬다.
- 각 module은 자기 `domain/application/infrastructure/presentation` 경계 안에서 책임을 닫는다.
- 다른 module의 `infrastructure/persistence/prisma-*.repository.ts`를 직접 import하지 않는다.
- 다른 module의 Prisma repository instance를 provider로 주입받지 않는다.
- 다른 module 데이터가 필요하면 owning module이 공개한 application port, query port, use case facade를 사용한다.
- module 간 mutation이 필요하면 API 계약에서 orchestration owner, transaction 범위, idempotency 기준을 먼저 정한다.
- 아직 정식 owning module이 없는 foundation table은 임시 소유자를 문서에 명시한다.

## Application Layer Dependency

- application layer는 business orchestration, 권한 판단, transaction boundary를 담당한다.
- 새 business logic은 Prisma, Supabase SDK, Express request/response, Nest `ConfigService`, concrete logger에 직접 의존하지 않는다.
- 설정, 시간, token 발급, logger, 외부 provider는 application port 뒤에 둔다.
- Nest DI를 위한 `@Injectable()`과 `@Inject()` 사용은 허용하지만, command/result/port 공개 계약에는 Nest type을 노출하지 않는다.
- 기존 use case는 기능 변경 시 점진적으로 이 규칙에 맞춘다.

## ORM / Provider Boundary

- Prisma import는 `infrastructure` 계층으로 제한한다.
- `domain`/`application` 계층의 type, port, use case, DTO는 Prisma model type이나 Prisma transaction client type을 노출하지 않는다.
- repository port는 비즈니스 계약을 표현하고, Prisma repository는 해당 계약을 구현하는 adapter로 둔다.
- application use case가 여러 저장소를 하나의 작업으로 묶어야 하면 transaction port 또는 wrapper를 사용하고, Prisma `$transaction` API를 직접 호출하지 않는다.
- Supabase import는 Backend에서는 `infrastructure` adapter로 제한한다.
- `domain`/`application` 계층은 Supabase SDK, Supabase JWT payload, Supabase user id에 직접 의존하지 않는다.
- 인증 계정 연결은 신규 코드에서 `provider + providerUserId` 기준을 우선한다. Supabase auth id는 현재 adapter/legacy 호환 정보로만 다룬다.
- 복잡한 read query, raw SQL, materialized read model이 필요하면 API contract, index 계획, 테스트, observability event를 함께 기록한다.

## Time

- `createdAt`, `updatedAt`, `deletedAt`은 UTC instant로 저장한다. 현재 `deletedAt`은 User 계정 상태 필드에만 남는다.
- 사용자 표시 timezone은 `User.timeZone`을 따른다.

## Environment

- `DATABASE_URL`
- `DIRECT_URL`
- `APP_JWT_SECRET`
- `APP_REFRESH_TOKEN_SECRET`
- `SUPABASE_JWKS_URL`
- `SUPABASE_JWT_ISSUER`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `INITIAL_ADMIN_EMAILS`
