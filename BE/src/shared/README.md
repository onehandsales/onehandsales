# 백엔드 공용 코드

백엔드 공통 코드는 계층별로 나눈다.

```text
shared/
  domain/
  application/
  infrastructure/
  presentation/
```

규칙:

- `shared/domain`: domain error와 도메인 계층에서 사용할 수 있는 primitive.
- `shared/application`: port, transaction abstraction, 현재 사용자 context type.
- `shared/infrastructure`: Prisma, logger, encryption/storage/external provider adapter.
- `shared/presentation`: filter, guard, decorator, DTO helper.

비즈니스 기능 로직은 이곳에 두지 않는다. 코드가 Company, Contact, Product, Deal, Admin workflow를 알고 있다면 해당 기능 모듈에 둔다.
