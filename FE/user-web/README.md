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
pnpm install
pnpm run dev
```

로컬 URL: `http://localhost:5173`

Vercel 프로젝트 root: `FE/user-web`
