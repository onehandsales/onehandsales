# Environment Variables

이 저장소의 환경 변수 정본 문서는 이 파일이며, 실제 secret 값은 각 실행 단위의 `.env`에 둔다. `.env.example`, `.env.local`은 정본이 아니다.

실제 secret 값은 문서, 이슈, 로그에 기록하지 않는다. 아래 목록은 현재 `BE`, `FE/user-web`, `FE/admin-web` 코드가 읽는 변수명과 용도만 정리한 것이다.

## 파일 위치

- Backend: `BE/.env`
- User Web: `FE/user-web/.env`
- Admin Web: `FE/admin-web/.env`

루트 `.env`는 정본이 아니다.

구현상 로컬 override 파일을 읽을 수 있는 위치:

- Backend bootstrap은 `BE/.env`를 먼저 읽고, `BE/.env.local`이 있으면 이미 OS 환경 변수로 주입된 값은 보존하면서 로컬 override로 읽는다. `ConfigModule`도 `.env.local`, `.env` 경로를 알고 있다.
- User Web/Admin Web은 Vite `import.meta.env`를 사용하므로 Vite 기본 env 로딩 규칙의 영향을 받는다.

운영/문서 기준 source of truth는 여전히 각 앱의 `.env`와 이 문서다. `.env.local`에만 존재하는 변수는 공유 환경 계약으로 보지 않는다.

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
