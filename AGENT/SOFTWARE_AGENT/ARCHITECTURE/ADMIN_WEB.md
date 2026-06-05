# Admin Web 프론트엔드 아키텍처

이 문서는 `FE/admin-web`의 기준 아키텍처를 정의한다. 관리자 웹은 운영자가 전체 사용자, 조직, 구독, 사용량, 시스템 이벤트를 확인하고 관리하는 내부 운영 도구다.

## 1. 기술 기준

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
| 클라이언트 상태 | 기본은 컴포넌트 로컬 상태, 전역 UI 상태가 필요할 때만 Zustand |
| 표/대시보드 | TanStack Table, 차트가 필요할 때 Recharts |
| 폼/검증 | React Hook Form, Zod |
| 빌드 검증 | `tsc --noEmit`, `vite build` |

## 2. 구조 원칙

- 사용자 웹과 동일하게 feature-first 구조를 사용한다.
- 관리자 전용 API는 `/admin/api/*`만 호출한다.
- 관리자 화면은 데스크톱 운영 도구를 우선한다. 모바일 최적화는 필수가 아니다.
- 운영 작업은 추적 가능해야 하며, 위험한 변경은 확인 UI와 감사 로그를 고려한다.

## 3. 기준 폴더 구조

```text
FE/admin-web/
├── public/
├── src/
│   ├── assets/
│   ├── app/
│   │   ├── providers/
│   │   │   └── app-providers.tsx
│   │   ├── router/
│   │   │   └── router.tsx
│   │   └── app.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── features/
│   │   ├── auth/
│   │   ├── user-management/
│   │   ├── organization-management/
│   │   ├── subscription-management/
│   │   ├── usage-analytics/
│   │   ├── audit-log/
│   │   ├── system-config/
│   │   └── support/
│   ├── hooks/
│   ├── lib/
│   │   ├── admin-api-client.ts
│   │   ├── env.ts
│   │   └── query-client.ts
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── organizations/
│   │   ├── subscriptions/
│   │   ├── analytics/
│   │   ├── audit-logs/
│   │   ├── system/
│   │   └── support/
│   ├── store/
│   ├── types/
│   ├── utils/
│   ├── styles/
│   │   └── global.css
│   └── main.tsx
├── .env.example
├── eslint.config.js
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 4. 관리자 도메인 예시

```text
src/features/user-management/
├── api/
│   ├── admin-user-api.ts
│   └── admin-user-query-keys.ts
├── components/
│   ├── user-filter-bar.tsx
│   ├── user-table.tsx
│   └── user-status-dialog.tsx
├── hooks/
│   ├── use-admin-user-list.ts
│   └── use-admin-user-mutation.ts
├── schemas/
│   └── admin-user-schema.ts
├── types/
│   └── admin-user.ts
└── index.ts
```

## 5. 관리자 API 경계

- 관리자 웹의 API 클라이언트는 `src/lib/admin-api-client.ts`에 둔다.
- 일반 사용자 API 클라이언트와 공유하지 않는다.
- 관리자 Query Key는 `['admin', ...]`으로 시작한다.
- 관리자 기능은 사용자 앱의 feature 폴더를 직접 import하지 않는다.

## 6. UI 기준

- 리스트 화면은 필터, 검색, 정렬, 페이지네이션, 빈 상태, 오류 상태를 기본으로 고려한다.
- 표가 필요한 기능은 TanStack Table을 기준으로 한다.
- 수치 대시보드와 추세 차트는 필요할 때만 Recharts를 추가한다.
- 위험한 운영 작업은 확인 모달과 명확한 버튼 라벨을 사용한다.
