# FE

Frontend 앱은 제품 사용 면에 따라 분리한다.

## 앱

- `user-web`: 사용자가 직접 쓰는 Web MVP
- `admin-web`: 운영자를 위한 Admin Web 앱

각 앱은 자기 package dependency를 가진다. monorepo root에는 공유 frontend package를 두지 않는다.

## 로컬 실행

각 앱은 별도 터미널에서 실행한다.

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다. 각 앱은 `.nvmrc`와 `engines` 기준을 Node 24로 맞춘다.

User Web 실행:

```bash
cd FE/user-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

Admin Web 실행:

```bash
cd FE/admin-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

로컬 포트:

- User Web: `http://localhost:5173` (`/{locale}` 공개 진입, `/app` 보호 앱)
- Admin Web: `http://localhost:5174`

두 frontend 앱은 Vercel에서 별도 프로젝트로 배포한다.

환경 파일은 각 앱의 `.env` 하나만 사용한다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. `VITE_*` 변수명은 `../ENVIRONMENT.md`를 기준으로 확인한다.

## 검증

User Web:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Admin Web:

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Playwright smoke E2E는 Backend와 외부 Provider를 route mock으로 대체한다.

- User Web E2E: login, company, contact, product, deal, schedule, meeting note core flow
- Admin Web E2E: admin login, non-admin block, `/admin/api/me` 보호 라우트 smoke

E2E 전용 Vite port:

- User Web: `http://127.0.0.1:5175`
- Admin Web: `http://127.0.0.1:5176`

## Auth 상태

User Web은 URL locale 기반 public/auth route, Supabase OAuth provider login, `/auth/callback`, Backend `POST /api/auth/exchange`, refresh cookie 기반 access token 재발급 흐름을 사용한다. 개발용 mock login 경로는 제거되어 있으며 로그인 화면은 Kakao/Google provider 버튼을 기준으로 한다.

Admin Web은 현재 local mock admin/user token으로 `/admin/api/me` 보호 라우트를 검증한다.

User Web app access token은 localStorage와 API client memory에 저장하고, refresh token은 Backend가 httpOnly cookie로 설정한다. 로그아웃은 Backend app session 폐기, Supabase `signOut`, localStorage token 삭제 후 선호 locale의 login URL로 이동한다. 예: `/ko/login`, `/en-us/login`. 실제 provider credential 검증은 별도 smoke에서 다룬다.

Provider 현황:

- Google OAuth 가입/로그인: QA 통과.
- Kakao OAuth: Kakao Developers 앱에서 `account_email` 동의항목 설정이 필요하다. 설정 전에는 Kakao hosted error `KOE205`가 발생할 수 있다.

현재 User Web device slot 정책:

- 화면 폭 `767px 이하`: `mobile`
- 그 외: `personal_laptop`
- `replaceExistingDevice=true`로 exchange하므로 같은 slot의 다른 브라우저/기기 로그인은 기존 slot 기기와 활성 session을 교체한다.

## 현재 구현 상태

User Web:

- 실제 API 연동 완료: Auth/User, Home(`/app`), Company, Contact, BusinessCard OCR/명함 스캔, Product, Deal, Schedule, MeetingNote 수동 CRUD, MeetingNote AI/STT draft, MeetingNote deal link, Search, Trash, DataImport, Company/Contact/Product/Deal 도메인별 xlsx export.
- 공개/인증 페이지: `/{locale}`, `/{locale}/login`, `/{locale}/signup`, `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`. 지원 locale은 `ko`, `ja`, `zh-tw`, `en-us`, `en-gb`, `en-sg`, `en-au`, `en-ca`다. 기존 `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy`는 선호 locale URL로 redirect한다.
- Backend 구현 전까지 숨기는 기능: `/api/exports` 기반 범용 Export route/API, Notification.
- 현재 Export 정본 흐름은 각 도메인 목록의 엑셀 다운로드다. `FE/user-web/src/features/import-export`의 범용 Export 화면은 현재 Backend 방향이 아니므로 route에서 숨긴다.
- 데이터 불러오기는 `/app/import`에서 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 누락 셀 단위 validation 메시지, 확정 저장, 성공 내역 목록/상세 조회를 실제 Backend API와 연결한다.
- 딜 import의 누락 회사/담당자/제품 보정값은 현재 FE API에서 `dealCompanyResolutions`, `dealContactResolutions`, `dealProductResolutions`로 전달하고, BE confirm 경로에서 처리한다.
- 명함 스캔은 `/app/business-cards`에서 이미지 업로드, `명함스캔` 진행 표시, 추출 결과 확인/수정, 회사/담당자 저장 흐름으로 동작한다.

Admin Web:

- 실제 Backend 연동 완료: `/admin/api/me`.
- Backend 미구현/후속 경계: admin pages, dashboard, users, companies, contacts, products, deals, audit logs, sensitive raw access. 현재 운영 route는 root로 redirect한다.

## 정본 규칙

User Web 정본:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

Admin Web 정본:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`

공통 주석/로깅:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
