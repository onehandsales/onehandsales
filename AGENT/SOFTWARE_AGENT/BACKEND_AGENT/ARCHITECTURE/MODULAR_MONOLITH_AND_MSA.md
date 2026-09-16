# Modular Monolith and Future MSA Architecture

Status: Backend Architecture Rule
Date: 2026-09-16

## 1. 목적

현재 Backend는 하나의 NestJS 서버와 하나의 Prisma schema를 사용하는 단일 서버다.

이 문서의 목적은 지금 바로 MSA를 도입하는 것이 아니라, 단일 서버 안에서도 module boundary를 엄격히 지켜 나중에 필요할 때 서비스 단위로 분리할 수 있는 구조를 유지하는 것이다.

기준 문장:

> 지금은 modular monolith로 빠르게 만든다. 단, module 경계는 미래의 service 경계처럼 다룬다.

## 2. 현재 실행 구조

- Runtime은 단일 NestJS application이다.
- DB 접근은 Prisma를 표준 adapter로 사용한다.
- 배포 단위는 하나의 Backend server다.
- module 간 호출은 같은 process 안에서 일어날 수 있다.

단일 process라는 이유로 다른 module의 infrastructure나 repository 구현체를 직접 가져다 쓰면 안 된다.

## 3. Module Ownership

각 backend module은 자기 책임을 아래 계층 안에 둔다.

```text
<module>/
  domain/
  application/
  infrastructure/
  presentation/
```

소유권 규칙:

- 한 module의 Prisma repository는 그 module의 `infrastructure` 내부 구현체다.
- 다른 module은 해당 Prisma repository를 import하지 않는다.
- 다른 module의 DB table을 직접 수정해야 하는 흐름이 생기면 module ownership을 먼저 재검토한다.
- 다른 module의 정보가 필요하면 그 module이 공개한 application port, query port, use case facade를 통해 접근한다.
- 아직 소유 module이 없는 foundation table은 임시 소유자를 문서에 명시하고, 정식 module이 생기면 ownership을 이전한다.

허용되는 공유 범위:

- `shared/domain`: 공통 domain error, 공통 value 기준
- `shared/application`: current user context, time/currency 같은 순수 application helper, 공통 port
- `shared/infrastructure`: PrismaService, 외부 provider adapter module, logger 등 cross-cutting adapter
- `shared/presentation`: guard, filter, middleware, decorator

금지되는 공유 범위:

- 다른 module의 `infrastructure/persistence/prisma-*.repository.ts` 직접 import
- 다른 module의 Prisma repository instance 주입
- application/domain 공개 계약에 Prisma model type, Prisma transaction client type, Supabase SDK type 노출
- 편의를 위해 한 use case에서 여러 module의 repository 구현체를 섞어 transaction을 구성하는 방식

## 4. Cross-Module Access

다른 module의 기능이 필요하면 아래 순서로 판단한다.

1. 단순 current user 정보면 `CurrentUserContext`를 사용한다.
2. 다른 module의 조회가 필요하면 owning module에 read/query port를 만든다.
3. 다른 module의 mutation이 필요하면 API 계약과 transaction 책임자를 먼저 정한다.
4. 여러 module의 상태 변경이 하나의 사용자 행동에 묶이면 orchestration owner를 정한다.
5. 나중에 service 분리가 가능한 호출인지 검토한다.

in-process port 구현은 허용한다. 단, 호출자는 구현체가 같은 process에 있는지, 나중에 HTTP/gRPC/event adapter가 되는지 알면 안 된다.

## 5. Transaction Boundary and Future Service Split

현재는 같은 DB 안에서 transaction을 사용할 수 있다. 그러나 미래 MSA 분리를 고려해 아래 원칙을 지킨다.

- transaction은 기본적으로 한 module ownership 안에서 끝나야 한다.
- 여러 module 소유 데이터를 한 transaction으로 묶어야 하면 ownership이 잘못 나뉜 것은 아닌지 먼저 검토한다.
- 미래에 service가 분리될 가능성이 큰 흐름은 idempotency key, outbox, 후속 작업 상태 기록을 검토한다.
- distributed transaction을 전제로 설계하지 않는다.
- 외부 provider 호출은 DB transaction 안에 오래 붙잡지 않는다.

예시:

- 인증 token 교환처럼 user, device, session을 함께 바꾸는 흐름은 `auth` ownership 안에서 transaction을 관리한다.
- 공개 문의 저장처럼 독립 원장에 쓰는 흐름은 해당 module에서 끝낸다.
- 향후 Kit 적용처럼 여러 definition row를 만드는 흐름은 owning module과 idempotency 기준을 먼저 정한다.

## 6. Supabase Independence

Supabase는 Backend core가 아니라 infrastructure adapter다.

Backend가 소유하는 것:

- `User`
- `AuthDevice`
- `AuthSession`
- refresh token 저장/회전 정책
- app access token 발급
- authorization check

Supabase adapter가 맡는 것:

- 외부 인증 token 검증
- 필요한 경우 storage upload 같은 외부 provider 작업

규칙:

- `domain`/`application` 계층은 Supabase SDK를 import하지 않는다.
- 신규 인증 연결은 `provider + providerUserId` 기준을 우선한다.
- Supabase auth id는 adapter 또는 legacy 호환 정보로만 다룬다.
- Supabase storage를 쓰는 기능은 storage port 뒤에 둔다.
- Supabase를 다른 provider로 바꿀 때는 infrastructure adapter, FE OAuth 시작 흐름, 환경 변수를 함께 이전한다.

## 7. Application Dependency Rule

application layer는 business orchestration을 담당한다.

허용:

- application port
- domain error
- current user context
- 순수 helper
- command/result type

주의:

- Nest DI를 위해 `@Injectable()`이나 `@Inject()`를 쓰는 현재 구조는 허용한다.
- 새 business logic은 Nest `ConfigService`, concrete logger, Express request/response, Prisma, Supabase SDK에 직접 의존하지 않는다.
- 설정, 시간, token, logger, 외부 provider는 application port 뒤에 둔다.
- 기존 use case는 기능 변경 시 점진적으로 이 규칙에 맞춘다.

## 8. Review Checklist

- 새 module이 `domain/application/infrastructure/presentation` 경계를 갖는가?
- 다른 module의 Prisma repository를 직접 import하지 않는가?
- 다른 module 데이터 접근이 공개 application/query port로 표현되는가?
- application/domain 공개 계약에 Prisma/Supabase/Nest HTTP type이 새지 않는가?
- transaction이 module ownership 안에서 끝나는가?
- service 분리 가능성이 있는 mutation에 idempotency 또는 outbox 판단이 남아 있는가?
- Supabase 의존성이 infrastructure adapter 안에 머무르는가?

## 9. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
