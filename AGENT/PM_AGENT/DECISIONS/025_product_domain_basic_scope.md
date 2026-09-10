# 제품 도메인 기본 기능 구현 범위 확정

현재 비활성 결정 기록이다.

2026-09-10 기준 현재 활성 코드와 schema에는 Product 도메인이 없다.

- `BE/prisma/schema.prisma`에 `Product`, `ProductCategory`, `ProductStatus`, `ProductMemoLog`, `ProductUserPrivateMemoLog` 모델이 없다.
- `BE/src/modules/product`에는 런타임 TypeScript 코드가 없고 `AppModule`에 연결되어 있지 않다.
- `FE/user-web`의 `/app/products/*` route는 `/app`으로 redirect한다.

이 파일은 과거 Product 도메인 계획이 있었다는 기록만 남긴다. Product를 다시 활성화하려면 PM 결정, Prisma migration, Backend module, User Web route/API, QA 문서를 새 기준으로 다시 작성해야 한다.
