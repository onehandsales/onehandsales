# user-web

사용자가 직접 쓰는 Web 앱이다. iOS/Android native app보다 먼저 만드는 첫 MVP 클라이언트다.

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 런타임 | Node.js 24 LTS |
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 번들러/개발 서버 | Vite 7 |
| 라우팅 | React Router DOM 7 |
| 스타일 | Tailwind CSS 3, PostCSS, shadcn/ui, Pretendard Font |
| 아이콘 | lucide-react |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | 필요할 때만 Zustand |
| 폼/검증 | React Hook Form, Zod |

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

## Local Login

`/login`은 비로그인 랜딩 페이지 위에 로그인 모달이 뜨는 구조다. 기본 진입은 provider 기반 소셜 로그인이며, Supabase access token을 받은 뒤 `/api/auth/exchange`로 앱 access token을 교환한다.

로컬에서 Supabase env가 없거나 provider 연결이 준비되지 않은 경우에는 개발용 mock login을 사용할 수 있다. mock login은 memory/localStorage 기반 세션을 설정하고 보호 라우트로 진입한다.

`/auth/callback`은 Supabase OAuth redirect 후 exchange가 수행되는 진입점이다.

## 검증

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

`pnpm run test:e2e`는 Playwright smoke를 실행한다. Backend와 외부 Provider는 route mock으로 대체하며, 테스트용 Vite server는 `http://127.0.0.1:5175`를 사용한다.

Smoke 범위:

- mock login과 보호 라우트
- 회사 생성
- 담당자 생성
- 제품 생성
- 딜 생성과 단계 변경
- 일정 생성
- 회의록 저장과 딜 연결

Vercel 프로젝트 root: `FE/user-web`
