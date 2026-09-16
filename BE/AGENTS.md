# Backend Agent Instructions

이 디렉터리(`BE`)에서 작업하는 에이전트는 백엔드 전용 규칙을 반드시 따른다.

## 먼저 읽을 문서

백엔드 작업 전 아래 문서를 우선 확인한다.

- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/`
- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/`
- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/`
- DB/API 관련 작업이면 `../AGENT/SOFTWARE_AGENT/DB_SCHEMA/`

## 현재 Backend 구조

- 실제 MSA가 아니다.
- 단일 NestJS 서버 기반의 modular monolith다.
- 단, module boundary는 미래 MSA service boundary처럼 엄격하게 다룬다.
- 각 module은 Clean Architecture 스타일의 계층을 가진다.

```text
module/
  domain/
  application/
  infrastructure/
  presentation/
```

## 계층 규칙

- `domain` / `application`은 Prisma, Supabase SDK, Nest `ConfigService`, Express request/response, 구체 logger 구현체에 직접 의존하지 않는다.
- `application`은 use case orchestration, 권한 판단, transaction boundary 결정을 담당한다.
- `infrastructure`는 Prisma repository, 외부 provider adapter, config adapter, logger adapter를 담당한다.
- `presentation`은 controller, DTO, HTTP request/response 변환을 담당한다.
- Nest DI를 위한 `@Injectable()` / `@Inject()` 사용은 가능하지만, 공개 port/result/command 계약에 Nest/Prisma/Supabase 타입을 노출하지 않는다.

## Module boundary 규칙

- 다른 module의 `infrastructure/persistence/prisma-*.repository.ts`를 직접 import하거나 provider로 주입받지 않는다.
- 다른 module 데이터가 필요하면 owning module의 공개 application port, query port, use case facade를 사용한다.
- User 조회가 필요하면 User module의 공개 query port를 사용한다.
- Workspace 온보딩 책임은 Workspace module의 onboarding port를 사용한다.
- 도메인 제약은 문서/사용자 확인 없이 임의로 확정하지 않는다. 예: “사용자당 개인 OWNER Workspace 1개” 같은 제약을 마음대로 만들지 않는다.

## Transaction 규칙

- transaction 시작과 orchestration owner는 application layer가 정한다.
- application layer는 Prisma `$transaction`을 직접 호출하지 않는다.
- 여러 repository/module 작업을 하나의 원자적 작업으로 묶어야 하면 `TransactionManager` port와 `TransactionContext`를 사용한다.
- infrastructure adapter만 `TransactionContext`를 실제 Prisma transaction client로 해석한다.
- 외부 provider 호출은 장시간 DB transaction 안에 넣지 않는다.
- 미래 MSA 분리 가능성이 있는 mutation은 idempotency/outbox 필요성을 검토한다.

## API / DB 변경 규칙

- HTTP endpoint, request/response DTO, error code, status, validation 규칙을 바꾸면 먼저 API contract 영향을 확인한다.
- DB schema나 migration을 바꾸면 DB schema 문서, transaction 범위, rollback 영향, 기존 데이터 migration 필요성을 확인한다.
- API/DB 계약 변경 없이 내부 port/adapter만 바꾸는 리팩터링은 기존 계약을 유지해야 한다.

## Naming 규칙

- 단어만 봐도 책임이 드러나게 직관적인 이름을 쓴다.
- 도메인 의미를 과하게 확정하는 이름을 피한다.
- 예: 온보딩에서 OWNER Workspace를 보장하는 책임은 `WorkspaceOnboarding`, `ensureOwnerWorkspaceForOnboarding`처럼 표현한다.
- `PersonalOwner`처럼 잘못된 도메인 제약으로 읽힐 수 있는 표현은 요구사항이 확정된 경우가 아니면 쓰지 않는다.

## Comment / logging 규칙

- class/interface에는 `// 역할 : ...` 주석을 둔다.
- controller API method에는 `// API : ...` 주석을 둔다.
- 내부 method/function에는 `// 기능 : ...` 주석을 둔다.
- 중요한 처리 흐름에는 `// 1. ...`, `// 2. ...` 형태의 numbered step comment를 둔다.
- token, 개인정보 원문, provider 원문 오류, 민감 입력값을 로그에 남기지 않는다.

## 검증

백엔드 변경 후 가능한 범위에서 아래를 실행한다.

- `pnpm -C BE typecheck`
- `pnpm -C BE lint`
- `pnpm -C BE test -- --runInBand`
- Prisma schema 변경 또는 DB 관련 변경 시 `pnpm -C BE prisma:validate`
- 배포/컴파일 영향이 있으면 `pnpm -C BE build`

`prisma:generate`는 Windows에서 실행 중인 BE watch/runtime 프로세스가 Prisma DLL을 잠그면 실패할 수 있다. 이 경우 임의로 프로세스를 종료하지 말고 사용자에게 상황을 보고한다.
