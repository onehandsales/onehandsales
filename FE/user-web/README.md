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

환경 파일은 `FE/user-web/.env` 하나만 사용한다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. 변수명 목록은 `../../ENVIRONMENT.md`를 기준으로 확인한다.

## Auth

Public/auth canonical URLs use locale prefixes: `/ko`, `/ko/login`, `/ko/signup`, `/ko/pricing`, `/ko/contact`, `/ko/about`, `/ko/security`, `/ko/terms`, `/ko/privacy`. The same pattern is supported for `ja`, `zh-tw`, `en-us`, `en-gb`, `en-sg`, `en-au`, and `en-ca`. Existing `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, and `/privacy` URLs redirect to the preferred locale URL. 로그인 후 실제 앱은 `/app` 아래에서 동작한다.

초기 판매/검토 국가는 한국, 일본, 대만, 미국, 영국, 싱가포르, 호주, 캐나다다. 로그인 이후 `/app` 관리 화면은 한국어 우선으로 운영한다.

- Supabase OAuth 성공 후 `/auth/callback`으로 돌아온다.
- callback에서 Supabase access token을 Backend `POST /api/auth/exchange`로 보내 app access token과 refresh cookie를 받는다.
- 개발용 mock login flow는 제거되어 있다.
- Google OAuth signup/login은 QA 통과 상태다.
- Kakao OAuth는 Kakao Developers 앱의 `account_email` 동의항목 설정 후 QA한다. 설정 전 `KOE205`는 provider 설정 이슈로 본다.
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
- MeetingNote manual CRUD
- MeetingNote AI/STT draft
- MeetingNote deal link
- Search
- Trash
- Company/Contact/Product/Deal soft delete UX/API
- DataImport
- Company/Contact/Product/Deal xlsx export
- Public site: `/{locale}`, `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`

mock/placeholder 경계:

- generic Export job
- Notification

BusinessCard OCR/명함 스캔은 `/app/business-cards`에서 실제 API와 연결된다. `/business-cards`와 `/contacts/scan`은 legacy redirect다. 목록은 등록일 최신순 고정이며, 상태 다중 필터와 `상태 초기화`를 제공한다. `명함스캔` 모달은 최초에는 이미지 업로드만 보여주고, 요청 중에는 진행 표시를 띄우며, 성공 후 추출 결과 확인/수정 폼을 보여준다.

데이터 불러오기는 `/app/import`와 `/app/import/:importUserLogId`에서 실제 API와 연결된다. `/import`는 legacy redirect다. 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 누락 셀 단위 validation 메시지, 확정 저장, 성공 내역 목록/상세 조회를 제공한다. 현재 코드 기준 딜 import의 누락 회사/담당자/제품 보정값은 FE API 함수가 `dealCompanyResolutions`, `dealContactResolutions`, `dealProductResolutions`로 BE confirm 경로에 전달한다.

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
- 회사 생성
- 담당자 생성
- 제품 생성
- 딜 생성과 단계 변경
- 일정 생성
- 회의록 저장과 딜 연결
- 상단 통합검색 API mock handler는 존재한다. 검색 UI 조작 E2E 케이스는 별도 후속 범위다.

`/app` 라우팅 전환 이후 smoke의 legacy path 기대값은 릴리즈 게이트로 쓰기 전에 현재 라우터 기준으로 재검토한다.

Vercel project root: `FE/user-web`
