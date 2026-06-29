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
| 스타일 | Tailwind CSS 3, PostCSS, shadcn/ui, Pretendard Font |
| 아이콘 | lucide-react |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | 필요할 때만 Zustand |
| 폼 검증 | React Hook Form, Zod |

## 로컬 실행

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
cp .env.example .env
pnpm install
pnpm run dev
```

로컬 URL: `http://localhost:5173`

`.env` 기본값:

```text
VITE_API_URL="http://localhost:3000"
VITE_SUPABASE_REDIRECT_URL="http://localhost:5173/auth/callback"
```

## Auth

`/login`은 Supabase provider login과 개발용 mock login을 제공한다.

- Supabase OAuth 성공 후 `/auth/callback`으로 돌아온다.
- callback에서 Supabase access token을 Backend `POST /api/auth/exchange`로 보내 app access token과 refresh cookie를 받는다.
- local에서 Supabase env가 없거나 provider 연결이 준비되지 않은 경우에는 mock login을 사용할 수 있다.

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
- Company/Contact/Product/Deal xlsx export

mock/placeholder 경계:

- generic Import/Export job
- Notification

BusinessCard OCR/명함 스캔은 `/business-cards`에서 실제 API와 연결된다. 목록은 등록일 최신순 고정이며, 상태 다중 필터와 `상태 초기화`를 제공한다. `명함등록` 모달은 최초에는 이미지 업로드만 보여주고, 요청 중에는 진행 표시를 띄우며, 성공 후 추출 결과 확인/수정 폼을 보여준다.

## 검증

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

`pnpm run test:e2e`는 Playwright smoke를 실행한다. Backend와 외부 Provider는 route mock으로 대체하며, 테스트용 Vite server는 `http://127.0.0.1:5175`를 사용한다.

Smoke 범위:

- login/mock login과 보호 라우트
- 회사 생성
- 담당자 생성
- 제품 생성
- 딜 생성과 단계 변경
- 일정 생성
- 회의록 저장과 딜 연결
- 상단 통합검색 API mock handler는 존재한다. 검색 UI 조작 E2E 케이스는 별도 후속 범위다.

Vercel project root: `FE/user-web`
