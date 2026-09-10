# Backend Convention

## Module Structure

```
<module>/
  domain/
  application/
  infrastructure/
  presentation/
```

## Naming

- controller: `<domain>.controller.ts`
- service: `<domain>-application.service.ts`
- repository port: `<domain>.repository.ts`
- Prisma repository: `prisma-<domain>.repository.ts`
- error file: `<domain>.errors.ts`

## API

- 모든 사용자 업무 API는 current user ownership을 검증한다.
- pagination은 page/pageSize 또는 cursor 중 도메인 기존 방식을 따른다.
- DTO는 class-validator로 외부 입력을 검증한다.
- mutation은 application service에서 transaction boundary를 잡는다.

## Time

- `createdAt`, `updatedAt`, `deletedAt`, `trashExpiresAt`은 UTC instant로 저장한다.
- 사용자 표시 timezone은 `User.timeZone`을 따른다.

## Environment

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_ACCESS_SECRET`
- `INITIAL_ADMIN_EMAILS`
