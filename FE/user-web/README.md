# user-web

사용자가 직접 쓰는 Web MVP 앱이다. iOS/Android native app보다 먼저 만드는 첫 MVP client다.

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 런타임 | Node.js 24 LTS |
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 번들러/개발 서버 | Vite 7 |
| 라우터 | React Router DOM 7 |
| 스타일 | Tailwind CSS 3, PostCSS, shadcn/ui, Inter-first multilingual font stack |
| 아이콘 | lucide-react |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | 필요할 때만 Zustand |
| 폼 검증 | React Hook Form, Zod |

## 로컬 실행

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

로컬 URL: `http://localhost:5173`

`.env` 기본값:

```text
VITE_API_URL="http://localhost:3000"
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
VITE_SUPABASE_REDIRECT_URL="http://localhost:5173/auth/callback"
```

환경 변수 정본은 `FE/user-web/.env`와 `../../AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. Vite는 로컬 override 파일을 읽을 수 있지만, 공유 환경 계약은 공통 환경 문서의 `VITE_*` 변수명만 기준으로 한다.

## 운영 배포

Vercel project root: `FE/user-web`

현재 production URL:

- Canonical: `https://www.onehandsales.com`
- Apex: `https://onehandsales.com`
- Vercel default/legacy: `https://onehandsales.vercel.app`

사용자에게 공유하거나 QA 기준으로 삼는 URL은 `https://www.onehandsales.com`이다. `https://onehandsales.com`은 동작해야 하며 가능하면 `www`로 redirect한다. `https://onehandsales.vercel.app`은 Vercel 기본 domain 호환용으로 남길 수 있지만 기준 URL로 쓰지 않는다.

production `.env` 공개 origin 기준:

```text
VITE_API_URL="https://onehandsales-production.up.railway.app"
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
VITE_SUPABASE_REDIRECT_URL="https://www.onehandsales.com/auth/callback"
```

`VITE_API_URL`은 Backend가 `api.onehandsales.com`으로 이전되기 전까지 Railway production API URL을 사용한다. Supabase Auth와 Google Cloud OAuth allowlist는 `BE/SUPABASE_SETUP.md` 기준으로 맞춘다.

## Auth

Public/auth canonical URLs use locale prefixes: `/ko`, `/ko/login`, `/ko/signup`, `/ko/pricing`, `/ko/contact`, `/ko/about`, `/ko/security`, `/ko/terms`, `/ko/privacy`. Current KR/US/CA market focus exposes `ko`, `en-us`, and `en-ca` in the public language selector. `ja`, `en-gb`, `en-sg`, and `en-au` remain future expansion candidates only. Existing `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, and `/privacy` URLs redirect to the preferred locale URL. 로그인 후 실제 앱은 `/app` 아래에서 동작한다.

우선 타겟 국가는 한국, 미국, 캐나다다. 로그인 이후 `/app` 관리 화면은 `ko-KR`, `en` 1차 지원으로 운영한다.

- Supabase OAuth 성공 후 `/auth/callback`으로 돌아온다.
- 로그인/회원가입 provider 버튼은 가능한 경우 브라우저 popup으로 OAuth를 시작한다. popup이 차단되면 기존 전체 페이지 redirect 흐름으로 fallback한다.
- popup OAuth도 `/auth/callback`에서 Supabase session을 Backend app session으로 교환한 뒤 popup을 닫고, 부모 로그인 페이지가 저장된 app session을 복원한다.
- callback에서 Supabase access token을 Backend `POST /api/auth/exchange`로 보내 app access token과 refresh cookie를 받는다.
- 개발용 mock login flow는 제거되어 있다.
- Google OAuth signup/login은 QA 통과 상태다.
- Kakao OAuth는 로그인 기능에서 제거되어 있다.
- LINE/Apple OAuth도 runtime provider로 노출한다. 실제 provider smoke는 Supabase/provider 운영 설정과 secret 준비 상태에 따라 별도 확인하거나 환경 `N/A`로 기록한다.
- 로그인 전 `/app/*` 보호 라우트 접근은 로그인 화면으로 이동한다.
- 로그아웃 후 선호 locale의 login URL로 이동한다. 예: `/ko/login`, `/en-us/login`.
- 현재 device slot은 화면 폭 기준 `mobile` 또는 `personal_laptop`으로 전송한다. 같은 slot의 다른 브라우저/기기 로그인은 기존 active device/session을 교체한다.
- 가입 국가/마지막 로그인 국가는 Backend가 proxy geo header를 받을 때만 저장된다.

## 현재 구현 상태

실제 Backend API 연동 완료:

- Auth/User
- Home dashboard
- Company
- Contact
- BusinessCard OCR/명함 스캔
- Product
- Deal
- Schedule
- Weekly Schedule Report
- Google Calendar Integration
- MeetingNote manual CRUD
- MeetingNote AI/STT draft
- MeetingNote next action/follow-up draft
- MeetingNote deal link
- AI Weekly Sales Report/Follow-up
- Search
- Trash
- Notification/Reminder
- Company/Contact/Product/Deal soft delete UX/API
- DataImport/ImportJob
- Product Analytics
- Account request
- Company/Contact/Product/Deal xlsx export
- Public site: `/{locale}`, `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`

mock/placeholder 경계:

- generic Export job
- Billing/Paddle
- Billing Admin
- B2B tenant/team admin

BusinessCard OCR/명함 스캔은 `/app/business-cards`에서 실제 API와 연결된다. `/business-cards`와 `/contacts/scan`은 legacy redirect다. 목록은 등록일 최신순 고정이며, 상태 다중 필터와 `상태 초기화`를 제공한다. `명함스캔` 모달은 최초에는 이미지 업로드만 보여주고, 요청 중에는 진행 표시를 띄우며, 성공 후 추출 결과 확인/수정 폼을 보여준다.

회사 생성은 목록 맥락을 유지하는 오른쪽 문서형 생성 패널을 사용한다. `/app/companies/new`는 별도 전체 생성 페이지가 아니라 `CompanyListScreen`을 열고 생성 패널을 초기 open 상태로 둔다. 데스크톱에서는 패널이 화면 최상단~최하단에 fixed로 붙고 좌우 resize가 가능하다. 폭은 최소 `420px`, 최대 화면/작업영역의 `70%`이며 마지막 폭은 localStorage에 저장한다. 회사 목록은 패널이 열려도 컬럼을 줄이거나 합치지 않고, 공간이 부족하면 가로 스크롤로 모든 컬럼을 유지한다.

패널에서 확대한 생성 전용 route도 있다. `/app/companies/new/full`, `/app/contacts/new/full`, `/app/products/new/full`, `/app/deals/new/full`, `/app/meeting-notes/new/full`은 각 생성 dialog를 `mode="page"`로 렌더링하고, route state의 draft 값을 초기값으로 복원한 뒤 생성 성공 시 목록으로 돌아간다. `/app/contacts/new`, `/app/products/new`, `/app/deals/new`은 목록 위 생성 패널을 초기 open 상태로 여는 route다. `/app/meeting-notes/new`는 `/app/meeting-notes?create=1`로 redirect한다.

데이터 불러오기는 `/app/import`, `/app/import/review/:importJobId`, `/app/import/:importUserLogId`에서 실제 API와 연결된다. `/import`는 legacy redirect다. 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 누락 셀 단위 validation 메시지, 확정 전 job 재개, 확정 저장, 성공 내역 목록/상세 조회를 제공한다. 현재 코드 기준 딜 import의 누락 회사/담당자/제품 보정값은 FE API 함수가 `dealCompanyResolutions`, `dealContactResolutions`, `dealProductResolutions`로 BE confirm 경로에 전달한다.

알림은 `/app/notifications`와 AppShell 알림 bell에서 실제 Notification API와 연결된다. 알림 목록/읽음, unread count, 알림 설정, browser push public key/subscription 흐름을 제공한다.

## 검증

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

`pnpm run test:e2e`는 Playwright smoke를 실행한다. Backend와 외부 Provider는 route mock으로 대체하며, 테스트용 Vite server는 `http://127.0.0.1:5175`를 사용한다.

2026-07-10 기준 `typecheck`, `lint`, `build`, `test:e2e`, URL locale smoke, 핵심 업무 happy path 수동 QA는 통과했다. 남은 출시 전 품질 범위는 UX/UI 공통 QA, 모바일 브라우저 QA, Chrome/Edge QA다.

Smoke 범위:

- 현재 로그인 UI와 보호 라우트
- Google provider OAuth popup 시작
- 회사 생성: 목록 유지, 오른쪽 문서형 생성 패널, resize, 컬럼 유지
- 담당자 생성
- 제품 생성
- 딜 생성과 단계 변경
- 일정 생성
- 회의록 저장과 딜 연결
- 상단 통합검색 API mock handler는 존재한다. 검색 UI 조작 E2E 케이스는 별도 후속 범위다.

`/app` 라우팅 전환 이후 smoke의 legacy path 기대값은 릴리즈 게이트로 쓰기 전에 현재 라우터 기준으로 재검토한다.
