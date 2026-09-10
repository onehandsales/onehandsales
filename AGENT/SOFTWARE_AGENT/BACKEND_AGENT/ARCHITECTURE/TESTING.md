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
- Company/Contact/Product/Deal CRUD
- 딜 다음 행동, 메모, 활동 로그
- Search ownership and target mapping
- Trash list/detail/restore
- Product Analytics event capture
- Error Report and Support Request intake
- Admin authority check
