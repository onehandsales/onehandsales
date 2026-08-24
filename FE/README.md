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

환경 변수 정본은 각 앱의 `.env`와 `../AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. `VITE_*` 변수명은 공통 환경 문서를 기준으로 확인한다.

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
- Admin Web E2E: 현재 11 Admin Operation route smoke 기준으로 non-admin 차단, 사용자 overview, 도메인 탭 reason modal, provider failure, analytics, account request, Trash recovery request, system gate를 확인한다.

E2E 전용 Vite port:

- User Web: `http://127.0.0.1:5175`
- Admin Web: `http://127.0.0.1:5176`

## Auth 상태

User Web은 URL locale 기반 public/auth route, Supabase OAuth provider login, `/auth/callback`, Backend `POST /api/auth/exchange`, refresh cookie 기반 access token 재발급 흐름을 사용한다. 로그인/회원가입 provider 버튼은 가능한 경우 browser popup으로 OAuth를 시작하고, popup이 차단되면 기존 full-page redirect로 fallback한다. 개발용 mock login 경로는 제거되어 있으며 로그인 화면은 Google, LINE, Apple provider 버튼을 노출한다.

Admin Web은 입력받은 Backend App access token으로 `GET /admin/api/me`를 호출해 관리자 권한을 확인한다. 로컬 가짜 관리자/일반 사용자 토큰이나 역할 대체값은 운영 코드에서 사용하지 않는다.

User Web app access token은 localStorage와 API client memory에 저장하고, refresh token은 Backend가 httpOnly cookie로 설정한다. 로그아웃은 Backend app session 폐기, Supabase `signOut`, localStorage token 삭제 후 선호 locale의 login URL로 이동한다. 예: `/ko/login`, `/en-us/login`. 실제 provider credential 검증은 별도 smoke에서 다룬다.

Provider 현황:

- Google OAuth 가입/로그인: QA 통과.
- LINE/Apple OAuth: runtime provider로 노출한다. 실제 provider smoke는 Supabase/provider 운영 설정과 secret 준비 상태에 따라 별도 확인하거나 환경 `N/A`로 기록한다.
- Kakao OAuth: 로그인 기능에서 제거됨. 과거 DB enum 값은 legacy 호환용으로만 남긴다.

현재 User Web device slot 정책:

- 화면 폭 `767px 이하`: `mobile`
- 그 외: `personal_laptop`
- `replaceExistingDevice=true`로 exchange하므로 같은 slot의 다른 브라우저/기기 로그인은 기존 slot 기기와 활성 session을 교체한다.

## 현재 구현 상태

User Web:

- 실제 API 연동 완료: Auth/User, Home(`/app`), Company, Contact, BusinessCard OCR/명함 스캔, Product, Deal, Schedule, Weekly Schedule Report, Google Calendar Integration, MeetingNote 수동 CRUD, MeetingNote AI/STT draft, MeetingNote next action/follow-up draft, MeetingNote deal link, AI Weekly Sales Report/Follow-up, Search, Trash, Notification/Reminder, DataImport/ImportJob, Product Analytics, Account request, Company/Contact/Product/Deal 도메인별 xlsx export.
- 공개/인증 페이지: `/{locale}`, `/{locale}/login`, `/{locale}/signup`, `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`. 현재 언어 선택 UI에 노출하는 locale은 KR/US/CA 우선 전략 기준 `ko`, `en-us`, `en-ca`다. `ja`, `zh-tw`, `en-gb`, `en-sg`, `en-au`는 추후 확장 후보로 보류한다. 기존 `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy`는 선호 locale URL로 redirect한다.
- 보호 앱 route는 `/app/*` 아래에 있으며 회사/담당자/제품/딜 생성은 목록 맥락의 `/new`와 패널 확장용 `/new/full`을 모두 지원한다. 회의록도 `/app/meeting-notes/new/full` page-mode 작성 route를 가지며 `/app/meeting-notes/new`는 `?create=1`로 redirect한다.
- Backend 구현 전까지 숨기는 기능: `/api/exports` 기반 범용 Export route/API, Billing/Paddle, Billing Admin, B2B tenant/team admin.
- 현재 Export 정본 흐름은 각 도메인 목록의 엑셀 다운로드다. `FE/user-web/src/features/import-export`의 범용 Export 화면은 현재 Backend 방향이 아니므로 route에서 숨긴다.
- 회사 생성 UX는 `/app/companies` 목록 맥락을 유지한 채 오른쪽 문서형 생성 패널을 여는 방식을 사용한다. `/app/companies/new`도 별도 전체 생성 페이지가 아니라 회사 목록을 렌더링하고 생성 패널을 초기 open 상태로 연다. 데스크톱 패널은 화면 최상단~최하단에 고정되고 좌우 resize가 가능하며, 폭은 최소 `420px`, 최대 화면/작업영역의 `70%`다. 목록 컬럼은 줄이지 않고 공간이 부족하면 가로 스크롤로 처리한다.
- 데이터 불러오기는 `/app/import`에서 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 누락 셀 단위 validation 메시지, 확정 저장, 성공 내역 목록/상세 조회를 실제 Backend API와 연결한다.
- 딜 import의 누락 회사/담당자/제품 보정값은 현재 FE API에서 `dealCompanyResolutions`, `dealContactResolutions`, `dealProductResolutions`로 전달하고, BE confirm 경로에서 처리한다.
- 명함 스캔은 `/app/business-cards`에서 이미지 업로드, `명함스캔` 진행 표시, 추출 결과 확인/수정, 회사/담당자 저장 흐름으로 동작한다.
- 알림은 `/app/notifications`와 AppShell 알림 bell에서 실제 Notification API와 연결한다.

Admin Web:

- 실제 Backend 연동 완료: 11 Admin Operation foundation. 활성 route는 `/users`, `/users/:userId`, `/users/:userId/domain`, `/users/:userId/trash`, `/provider-failures`, `/account-requests`, `/trash/recovery-requests`, `/analytics`, `/audit-logs`, `/system`이다.
- 후속 경계: `/organizations`, `/subscriptions`, `/support`는 `/`로 redirect한다. Billing Admin, subscription/payment/refund/invoice, B2B tenant/team admin은 `TODO/PADDLE_PLAN` 또는 별도 전략 확정 전까지 열지 않는다.

## 정본 규칙

User Web 정본:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

Admin Web 정본:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`

공통 주석/로깅:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
