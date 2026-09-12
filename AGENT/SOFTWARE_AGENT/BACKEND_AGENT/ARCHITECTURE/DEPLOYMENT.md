# Backend Deployment

## 필수 환경 변수

- `DATABASE_URL`
- `DIRECT_URL`
- `APP_JWT_SECRET`
- `APP_REFRESH_TOKEN_SECRET`
- `SUPABASE_JWKS_URL`
- `SUPABASE_JWT_ISSUER`
- `INITIAL_ADMIN_EMAILS`

환경별 선택:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_STORAGE_ERROR_REPORT_BUCKET`
- `SUPABASE_JWT_AUDIENCE`

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
