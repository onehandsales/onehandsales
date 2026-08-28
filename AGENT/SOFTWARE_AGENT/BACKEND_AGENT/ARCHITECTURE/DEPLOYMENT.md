# Backend Deployment Architecture

## 1. 환경 정책

MVP Backend 배포 환경은 두 단계만 둔다.

- `local`
- `production`

MVP에는 `staging` 환경을 두지 않는다.

## 2. Local

`local`은 다음에 사용한다.

- Backend 개발
- local debugging
- local API 검증
- mocked external provider 테스트
- 개발 credential을 사용한 실제 provider 수동 검증

Local Backend API 기본 origin:

- `http://localhost:3000`

Local Backend는 `AppModule`과 `ConfigModule` 생성 전 bootstrap 단계에서 `BE/.env`를 먼저 읽고, `BE/.env.local`을 로컬 override로 읽을 수 있다. 이때 OS나 hosting이 먼저 주입한 환경 변수 값은 보존한다. direct `process.env` 접근은 이 bootstrap env loader 예외에만 허용하고, 이후 runtime 설정 접근은 `ConfigService`를 사용한다.

## 3. Production

`production`은 실제 사용자와 실제 데이터를 다루는 유일한 live 환경이다.

Backend API는 Frontend Vercel hosting과 분리된 별도 hosting을 사용한다.

현재 production API origin:

- `https://onehandsales-production.up.railway.app`

향후 권장 custom API domain:

- `https://api.onehandsales.com`

현재 `onehandsales.com` 도메인은 Vercel에서 구매/관리하며 User Web에 연결되어 있다. 도메인 구매나 Frontend domain 연결은 Backend hosting, Railway region, Supabase project/database region을 자동으로 변경하지 않는다. 현재 API가 Railway 기본 domain에 있으므로 Frontend `VITE_API_URL`, Backend `API_PUBLIC_ORIGIN`, Google OAuth callback은 Railway URL을 기준으로 둔다.

`api.onehandsales.com`을 연결할 때 함께 바꿔야 하는 값:

- Backend `API_PUBLIC_ORIGIN`
- Frontend `VITE_API_URL`
- Google Calendar OAuth redirect URI
- Follow-up Gmail OAuth redirect URI
- Supabase/Auth 관련 provider allowlist 중 Backend callback을 참조하는 항목
- `APP_REFRESH_COOKIE_DOMAIN`

`APP_REFRESH_COOKIE_DOMAIN`은 API가 `onehandsales-production.up.railway.app`에 있는 동안 비워둔다. Railway 기본 domain에서 내려주는 cookie를 `.onehandsales.com`으로 scope 지정할 수 없기 때문이다. API를 `api.onehandsales.com`으로 전환한 뒤에만 `.onehandsales.com` 설정을 검토한다.

현재 Supabase project/database region은 Seoul 계열로 운영 중이다. DB region 이전은 domain/DNS 변경과 별개의 migration/운영 작업으로 다룬다.

운영 규칙:

- production secret은 local `.env`에 넣지 않는다.
- Admin access는 제한하고 감사 가능해야 한다.
- 민감 데이터는 기본 마스킹한다.
- 원문 조회는 명시적 액션, 사유 입력, 감사 로그가 필요하다.

## 4. External Provider Checks

자동 테스트는 기본적으로 외부 Provider를 mock/stub 처리한다.

실제 Provider 확인은 명시적인 smoke job 또는 수동 production-safe 체크로만 수행한다.

`staging` 환경이 없으므로 실제 Provider 체크는 실제 사용자 데이터를 예기치 않게 변경하지 않아야 한다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
