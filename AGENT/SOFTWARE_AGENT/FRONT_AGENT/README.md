# Front Agent

Frontend Agent는 User Web과 Admin Web의 현재 활성 범위를 기준으로 구현/검증한다.

## User Web 활성 범위

- Auth/User
- Home(`/app`)
- Company
- Search
- Trash
- Help Error Report
- Help Support Request
- Public Contact Request
- Company xlsx export

## Admin Web 활성 범위

- access token 입력
- `GET /admin/api/me` 권한 확인
- 최소 보호 화면

## 검증

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- 필요한 Playwright smoke
