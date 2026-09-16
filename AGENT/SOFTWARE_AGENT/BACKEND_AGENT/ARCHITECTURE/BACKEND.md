# Backend Architecture

## 활성 도메인

- Auth/User
- Error Report
- Support Request
- Public Contact Request
- Health
- Admin authority check

## 후속 CRM Core

후속 CRM Core는 현재 활성 Backend module이 아니다.

구현 방향은 `CRM_CORE_BACKEND.md`를 기준으로 한다.

원칙:

- 고정형 Company/Product/Deal API를 복구하지 않는다.
- Workspace ownership을 CRM Core data의 기본 경계로 둔다.
- Kit 적용, 첫 Record 생성, 기본 List/View 조회를 MVP 우선 흐름으로 본다.
- Object/Attribute/Relationship은 내부 구현 개념이며 사용자-facing API response에서는 Kit의 업무 언어와 함께 제공한다.

## 계층 구조

- `domain`: repository port, domain type, domain error
- `application`: use case service, transaction boundary
- `infrastructure`: Prisma repository, external adapter
- `presentation`: controller, DTO, guard/filter

## Modular Monolith / Future MSA 원칙

현재 Backend는 단일 NestJS 서버다. 단일 서버 안에서도 module 경계는 나중에 service로 분리될 수 있는 경계처럼 다룬다.

원칙:

- 한 module의 Prisma repository 구현체는 해당 module의 `infrastructure` 내부 구현이다.
- 다른 module은 Prisma repository 구현체를 직접 import하거나 주입받지 않는다.
- module 간 협력이 필요하면 owning module의 application port, query port, use case facade를 통해 접근한다.
- 여러 module 소유 데이터를 한 transaction에서 바꿔야 하면 ownership 또는 orchestration owner를 먼저 재검토한다.
- future MSA 분리 가능성이 있는 mutation은 idempotency와 outbox 필요 여부를 API 계약에 남긴다.

상세 기준은 `MODULAR_MONOLITH_AND_MSA.md`를 따른다.

## ORM / DB Adapter 원칙

- 현재 Backend 표준 ORM은 Prisma다.
- TypeORM, Prisma, raw SQL 중 어떤 기술을 쓰는지보다 중요한 기준은 특정 DB 기술 의존성이 `domain`/`application` 계층으로 새지 않는 것이다.
- repository port는 `domain` 또는 `application` 계약으로 정의하고, Prisma 구현체는 `infrastructure` 계층에 둔다.
- `PrismaClient`, Prisma model type, Prisma transaction client type은 controller, application use case, domain type의 공개 계약으로 노출하지 않는다.
- ORM 교체 가능성 자체를 목표로 삼지 않는다. 핵심 목표는 비즈니스 규칙과 DB 접근 구현을 분리해 장기 유지보수 비용을 낮추는 것이다.
- 복잡한 조회 최적화가 필요하면 read repository 또는 raw SQL을 사용할 수 있다. 이 경우 API contract, index 계획, 테스트, observability 기준을 함께 남긴다.

## Application Dependency 원칙

- application layer는 business orchestration, 권한 판단, transaction boundary를 담당한다.
- 새 business logic은 `ConfigService`, concrete logger, Express request/response, Prisma, Supabase SDK에 직접 의존하지 않는다.
- 설정, 시간, token, logger, 외부 provider는 application port 또는 adapter 뒤에 둔다.
- Nest DI를 위한 최소 decorator 사용은 허용하되, command/result/port 공개 계약에는 Nest type을 노출하지 않는다.

## External Provider 독립성 원칙

- Supabase는 현재 외부 인증 provider와 일부 storage adapter로 취급한다. Backend의 `User`, `AuthDevice`, `AuthSession`, refresh token, authorization check는 Backend가 소유한다.
- `domain`/`application` 계층은 Supabase SDK나 Supabase 전용 타입에 직접 의존하지 않고, `ExternalAuthVerifier` 같은 provider port를 통해서만 외부 인증 결과를 사용한다.
- Supabase에서 독립해야 할 때는 `infrastructure`의 Supabase auth/storage adapter를 다른 provider adapter로 교체하고, FE의 OAuth 시작 흐름과 환경 변수를 함께 이전한다.
- 신규 인증/계정 연결 로직은 Supabase user id에 고정하지 말고 `provider + providerUserId` 기준을 우선한다. 기존 Supabase auth id 기반 데이터는 migration 또는 호환 레이어로 다룬다.

## API 정책

- `GET /api/me`는 현재 로그인 사용자를 반환한다.
- `GET /admin/api/me`는 관리자 권한 확인만 수행한다.
- 인증이 필요한 사용자 API는 current user ownership을 필수로 검증한다.
- 공개 문의 API는 비로그인 접수 API로 유지한다.
- 고정형 고객사 관리 API와 검색 API는 현재 제공하지 않는다.
- CRM Core API는 구현 전 `COMMON/API-SPEC` 계약을 먼저 작성한다.

## DB 정책

- 인증이 필요한 접수 row는 `userId`를 갖는다.
- 공개 문의 row는 User FK 없이 독립 원장으로 저장한다.
- schema 변경은 새 migration으로 추가한다.
- 후속 CRM Core schema는 `DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md`를 기준으로 검토하되, draft를 바로 migration으로 보지 않는다.

## 검증 정책

- Prisma validate/generate
- typecheck/lint
- unit/integration test
- build
