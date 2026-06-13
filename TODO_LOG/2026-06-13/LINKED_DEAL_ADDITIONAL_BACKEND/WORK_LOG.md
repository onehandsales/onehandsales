# Linked Deal Additional Backend Work Log

## Status

- Started: 2026-06-13
- Updated: 2026-06-13
- Scope: `TODO/ADDITIONAL_WORK_PLAN` G06-G12 backend implementation
- Target: `BE`
- Status: completed

## Related Plans And Goals

- `TODO/ADDITIONAL_WORK_PLAN/BE-TODO/G06-BE-COMPANY-LIST-DEAL-COUNT.goal.md`
- `TODO/ADDITIONAL_WORK_PLAN/BE-TODO/G07-BE-COMPANY-EXPORT-DEAL-COUNT.goal.md`
- `TODO/ADDITIONAL_WORK_PLAN/BE-TODO/G08-BE-COMPANY-DEAL-LIST.goal.md`
- `TODO/ADDITIONAL_WORK_PLAN/BE-TODO/G09-BE-CONTACT-DEAL-LIST.goal.md`
- `TODO/ADDITIONAL_WORK_PLAN/BE-TODO/G10-BE-PRODUCT-LIST-DEAL-COUNT-SORT.goal.md`
- `TODO/ADDITIONAL_WORK_PLAN/BE-TODO/G11-BE-PRODUCT-EXPORT-DEAL-COUNT.goal.md`
- `TODO/ADDITIONAL_WORK_PLAN/BE-TODO/G12-BE-PRODUCT-DEAL-LIST.goal.md`

## Work Items

1. Add `dealCount` to company list response and company xlsx export.
2. Add company linked Deal list API.
3. Add contact linked Deal list API.
4. Add `dealCount` and `sort=dealCountDesc` to product list response.
5. Add `dealCount` to product xlsx export.
6. Add product linked Deal list API.
7. Update Additional Work API specs, TODO status docs, active review docs, and backend architecture snapshot.

## Progress

- Implemented `GET /api/companies` `items[].dealCount`.
- Implemented `GET /api/companies/export/xlsx` `딜 수` column.
- Implemented `GET /api/companies/:companyId/deals`.
- Implemented `GET /api/contacts/:contactId/deals`.
- Implemented `GET /api/products` `items[].dealCount`.
- Implemented `GET /api/products?sort=dealCountDesc`.
- Implemented `GET /api/products/export/xlsx` `딜 수` column and product list sort query.
- Implemented `GET /api/products/:productId/deals`.
- Updated repository ports, Prisma repositories, application services, controllers, and product request DTOs.

## Changed Files

- `BE/src/modules/company/application/ports/company.repository.ts`
- `BE/src/modules/company/application/services/company-application.service.ts`
- `BE/src/modules/company/infrastructure/persistence/prisma-company.repository.ts`
- `BE/src/modules/company/presentation/http/company.controller.ts`
- `BE/src/modules/contact/application/ports/contact.repository.ts`
- `BE/src/modules/contact/application/services/contact-application.service.ts`
- `BE/src/modules/contact/infrastructure/persistence/prisma-contact.repository.ts`
- `BE/src/modules/contact/presentation/http/contact.controller.ts`
- `BE/src/modules/product/application/ports/product.repository.ts`
- `BE/src/modules/product/application/services/product-application.service.ts`
- `BE/src/modules/product/infrastructure/persistence/prisma-product.repository.ts`
- `BE/src/modules/product/presentation/http/dto/product-request.dto.ts`
- `BE/src/modules/product/presentation/http/product.controller.ts`

## Verification

- `pnpm --dir BE run typecheck`: passed.
- `pnpm --dir BE run prisma:validate`: passed.
- `pnpm --dir BE run prisma:generate`: passed.
- `pnpm --dir BE run lint`: passed.
- `pnpm --dir BE run build`: passed.
- `pnpm --dir BE exec jest --runInBand`: passed, 6 suites and 17 tests.
- `git diff --check -- BE`: passed.

## Review Notes

- Company and Contact linked Deal list APIs filter by current `userId` and the target entity id.
- Product linked Deal list API filters through `DealProduct` with current `userId` and target `productId`.
- Linked Deal list APIs are intentionally not paginated and use `createdAt DESC`, `id DESC`.
- Company/Product `dealCount` counts only the current user's linked deals.

## Remaining Work

- User Web still needs to display the new count fields, linked Deal lists, and product `딜 많은 순` sort.
- FE work is tracked by `TODO/ADDITIONAL_WORK_PLAN/FE-TODO/G01-FE-DEAL-COUNT-LINKED-DEAL-LISTS.goal.md`.
