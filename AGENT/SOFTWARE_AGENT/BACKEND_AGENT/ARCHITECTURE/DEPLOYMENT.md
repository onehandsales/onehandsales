# Backend Deployment

## 필수 환경 변수

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_ACCESS_SECRET`
- `INITIAL_ADMIN_EMAILS`

## 배포 전 확인

- Prisma migration 적용 상태
- `pnpm prisma:validate`
- `pnpm prisma:generate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `/api/health` 응답
- `/admin/api/me` 관리자 권한 확인
