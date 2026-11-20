# Front Deployment Architecture

문서 보완일: 2026-11-20 KST. package script를 대조했으며 아래 도메인·호스팅·외부 allowlist의 현재 운영 상태를 재조회한 것은 아니다.

## 1. 환경 정책

MVP Frontend 배포 환경은 두 단계만 둔다.

- `local`
- `production`

MVP에는 `staging` 환경을 두지 않는다.

## 2. Local

Local Frontend 개발 서버 기본 origin:

- User Web: `http://localhost:5173`
- Admin Web: `http://localhost:5174`

추가 preview origin은 환경 allowlist에 등록된 경우에만 허용한다.

현재 package script 기준:

- User Web dev: `pnpm run dev` -> `vite --host 0.0.0.0 --port 5173`
- Admin Web dev: `pnpm run dev` -> `vite --host 0.0.0.0 --port 5174`
- User Web preview: `pnpm run preview` -> port `4173`
- Admin Web preview: `pnpm run preview` -> port `4174`
- User Web build는 `tsc -b && vite build && node scripts/generate-static-seo-pages.mjs`다.
- Admin Web build는 `tsc -b && vite build`다. 최종 명령은 각 package.json을 따른다.

## 3. Production

User Web과 Admin Web은 Vercel에서 별도 프로젝트로 배포한다.

| Surface | Provider | Project root | 기록된 Production domain |
|---|---|---|---|
| User Web | Vercel | `FE/user-web` | 기본 도메인 기록: `https://www.onehandsales.com` |
| Admin Web | Vercel | `FE/admin-web` | 운영 도메인 기록: `https://onehandsales-admin.vercel.app` |

User Web domain policy:

- `https://www.onehandsales.com`을 production canonical domain으로 사용한다.
- `https://onehandsales.com`은 동작해야 하며, 가능하면 canonical `www` domain으로 redirect한다.
- `https://onehandsales.vercel.app`은 Vercel default/legacy URL로 유지할 수 있지만 QA 기준 URL이나 사용자 공유 URL로 쓰지 않는다.
- `onehandsales.com`은 Vercel에서 구매했고 Vercel nameserver와 CDN을 사용한다.

Admin Web domain policy:

- 기존 운영 기록의 Admin Web production URL은 `https://onehandsales-admin.vercel.app`이다.
- 기존 기록에서 `https://admin.onehandsales.com`은 미활성 domain이다. 연결 작업 시 현재 상태를 확인하고 Vercel domain, Backend CORS, Supabase redirect URL, Google Cloud OAuth origin을 함께 검토한다.

Vercel 기준:

- build command: `pnpm install && pnpm run build`
- output directory: `dist`
- `vercel.json`은 SPA fallback을 위해 모든 경로를 `/index.html`로 rewrite한다.

Frontend domain 변경은 Backend hosting, Supabase project/database region, Railway API origin을 자동으로 변경하지 않는다. User Web production 환경 변수와 외부 provider allowlist는 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`, Supabase/Auth provider 설정은 `BE/SUPABASE_SETUP.md`를 따른다.

## 4. Release Gate

Frontend production 배포 전에는 User Web 전체 E2E와 Admin auth/role smoke를 실행한다.

배포 전 전체 E2E가 실패하면 배포하지 않는다.

## 5. mock과 release 구분

- local/production은 배포 환경이고 mock/live는 데이터 공급 방식이다. mock 작업을 위해 새 staging 환경을 자동으로 추가하지 않는다.
- [Mock 개발](MOCK_FIRST_DEVELOPMENT.md)의 데이터 선택과 인증 경계를 build·실행 구성에서 명시한다. mode 누락이나 mock 실패 시 실제 API로 자동 fallback하지 않는다.
- mock 검증 통과는 실제 서버 저장·권한·발송·결제 검증 통과와 별도로 기록한다.
- mock 미리보기를 실제 서비스 운영 검증 완료로 표시하지 않는다. 운영 진입점에서 개발 reset·fake session이 무단 활성화되지 않는지 확인한다.
- 릴리스 기록에는 commit, 실행 모드, 설정 범위, build·E2E 결과, 남은 검증을 남긴다. 새로고침 딥링크·정적 리소스·캐시와 이전 버전 복귀 경로도 확인한다.
- 이 문서 개정만으로 ENV·서버·외부 provider 설정을 수정하거나 배포하지 않는다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
