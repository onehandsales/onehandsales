# 모듈 템플릿

새 백엔드 모듈은 다음 구조를 따른다.

```text
<module>/
  domain/
    *.entity.ts
    *.value-object.ts
    *.errors.ts
  application/
    ports/
      *.repository.ts
      *.port.ts
    use-cases/
      *.use-case.ts
  infrastructure/
    persistence/
      prisma-*.repository.ts
      *.prisma-mapper.ts
    adapters/
      *.adapter.ts
  presentation/
    http/
      dto/
        *.dto.ts
      *.controller.ts
  <module>.module.ts
```

의존 방향:

```text
presentation -> application -> domain
infrastructure -> application/domain
```

`domain`과 `application`은 Prisma, NestJS controller, HTTP client, OpenAI/Supabase SDK, 프론트엔드 응답 DTO를 import하지 않는다.
