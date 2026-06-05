# 백엔드 아키텍처

`BE`는 사용자 API와 Admin API를 함께 제공하는 단일 NestJS 백엔드다.

경로 규칙:

- 사용자 API: `/api/*`
- Admin API: `/admin/api/*`

모듈 규칙:

- `domain`: 엔티티, 값 객체, 도메인 에러를 둔다. NestJS, Prisma, HTTP SDK, OpenAI, Supabase, logger 구현체를 import하지 않는다.
- `application`: use case, port, repository interface, transaction orchestration, permission check를 둔다.
- `infrastructure`: Prisma repository와 외부 adapter를 둔다.
- `presentation`: controller, DTO, guard, filter, decorator, response mapping을 둔다.

기능 모듈은 다음 구조를 따른다.

```text
src/modules/<feature>/
  domain/
  application/
    ports/
    use-cases/
  infrastructure/
    persistence/
    adapters/
  presentation/
    http/
      dto/
  <feature>.module.ts
```

작은 모듈은 실제 구현 전까지 사용하지 않는 폴더를 만들지 않아도 된다. 다만 계층 간 의존 방향은 항상 유지한다.

`company` 기능이 확장될 때의 예시는 다음과 같다.

```text
src/modules/company/
  domain/
    company.entity.ts
    company-log.entity.ts
    company.errors.ts
  application/
    ports/
      company.repository.ts
    use-cases/
      create-company.use-case.ts
      list-companies.use-case.ts
      get-company.use-case.ts
  infrastructure/
    persistence/
      prisma-company.repository.ts
      company.prisma-mapper.ts
  presentation/
    http/
      dto/
        create-company.dto.ts
        company-response.dto.ts
      company.controller.ts
  company.module.ts
```

공유 기술 요소는 `src/shared` 아래에 둔다. domain/application 코드는 shared domain/application 요소에 의존할 수 있지만, shared infrastructure나 presentation에는 의존하지 않는다.
