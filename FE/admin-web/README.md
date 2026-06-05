# admin-web

운영자를 위한 Admin Web 앱이다.

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
| 표/대시보드 | TanStack Table, 차트가 필요할 때 Recharts |
| 폼/검증 | React Hook Form, Zod |

## 초기 범위

- 사용자 관리
- 조직 관리
- 구독 관리
- 사용량 분석
- 감사 로그
- 시스템 설정
- 운영 지원

Admin API는 `/admin/api/*`를 사용한다.

## 로컬 실행

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
pnpm install
pnpm run dev
```

로컬 URL: `http://localhost:5174`

Vercel 프로젝트 root: `FE/admin-web`
