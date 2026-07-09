# Environment Variables

이 저장소는 환경 파일을 `.env` 하나로 관리한다. `.env.example`, `.env.local`을 정본으로 두지 않는다.

실제 secret 값은 문서, 이슈, 로그에 기록하지 않는다. 아래 목록은 현재 `BE`, `FE/user-web`, `FE/admin-web` 코드가 읽는 변수명과 용도만 정리한 것이다.

## 파일 위치

- Backend: `BE/.env`
- User Web: `FE/user-web/.env`
- Admin Web: `FE/admin-web/.env`

각 앱은 자기 디렉터리의 `.env`만 읽는다. 루트 `.env`는 정본이 아니다.

## Backend

필수:

```text
DATABASE_URL
DIRECT_URL
APP_JWT_SECRET
APP_REFRESH_TOKEN_SECRET
SUPABASE_JWKS_URL
SUPABASE_JWT_ISSUER
```

권장 또는 환경별 선택:

```text
NODE_ENV
PORT
TEST_DATABASE_URL
APP_JWT_ISSUER
APP_JWT_AUDIENCE
APP_ACCESS_TOKEN_TTL_MINUTES
APP_SESSION_TTL_DAYS
APP_REFRESH_COOKIE_NAME
APP_REFRESH_COOKIE_DOMAIN
APP_ALLOWED_ORIGINS
API_PUBLIC_ORIGIN
USER_WEB_ORIGIN
ADMIN_WEB_ORIGIN
INITIAL_ADMIN_EMAILS
SUPABASE_JWT_AUDIENCE
ENCRYPTION_MASTER_KEY
ENCRYPTION_KEY_VERSION
COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY
COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION
CONTACT_PRIVATE_MEMO_ENCRYPTION_KEY
CONTACT_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION
PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY
PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION
OPENAI_API_KEY
OPENAI_BASE_URL
OPENAI_MEETING_NOTE_DRAFT_MODEL
OPENAI_MEETING_NOTE_STT_MODEL
OPENAI_BUSINESS_CARD_OCR_MODEL
OPENAI_IMPORT_MAPPING_MODEL
```

메모:

- Prisma는 `DATABASE_URL`, `DIRECT_URL`을 사용한다.
- Auth 교환은 `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`, 앱 JWT/refresh token secret을 사용한다.
- `OPENAI_API_KEY`는 MeetingNote AI/STT, BusinessCard OCR, DataImport AI mapping을 실제 호출할 때 필요하다.
- private memo 암호화는 도메인별 key가 없으면 `ENCRYPTION_MASTER_KEY`를 fallback으로 사용한다.
- 로그인 국가 코드는 환경 변수가 아니라 배포 프록시 header(`cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`)에서 온다.

## User Web

```text
VITE_API_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_REDIRECT_URL
```

기본 local 기준:

- `VITE_API_URL`: `http://localhost:3000`
- `VITE_SUPABASE_REDIRECT_URL`: `http://localhost:5173/auth/callback`

## Admin Web

```text
VITE_API_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_REDIRECT_URL
```

기본 local 기준:

- `VITE_API_URL`: `http://localhost:3000`
- `VITE_SUPABASE_REDIRECT_URL`: `http://localhost:5174/auth/callback`

현재 Admin Web은 local mock admin/user token과 `GET /admin/api/me` smoke를 중심으로 검증한다.
