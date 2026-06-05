# User Web 프론트엔드 아키텍처

이 문서는 `FE/user-web`의 기준 아키텍처를 정의한다. 사용자 웹은 개인 영업 담당자가 실제로 딜, 거래처, 제품, 일정, 회의록을 관리하는 화면이며, 도메인 기능 중심으로 확장한다.

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
| 폼/검증 | React Hook Form, Zod |
| 빌드 검증 | `tsc --noEmit`, `vite build` |

참고 구조에서 제안된 Node.js 22.12 이상 기준은 이 프로젝트에서는 Node.js 24 LTS로 상향 고정한다.

## 2. 구조 원칙

- `pages`는 라우트 진입점이며 화면 조립만 담당한다.
- 실제 비즈니스 UI, 훅, API 호출, 타입은 `features/<domain>` 안에 둔다.
- 공통 UI는 `components/ui`, 레이아웃은 `components/layout`에 둔다.
- 도메인과 무관한 훅은 `hooks`, 유틸은 `utils`, 공통 타입은 `types`에 둔다.
- API 클라이언트, 환경 변수 파서, QueryClient 설정은 `lib`에 둔다.
- 라우터와 앱 프로바이더는 앱 셸 책임이므로 `src/app` 아래에 둔다.

## 3. 기준 폴더 구조

```text
FE/user-web/
├── public/
├── src/
│   ├── assets/
│   │
│   ├── app/
│   │   ├── providers/
│   │   │   └── app-providers.tsx
│   │   ├── router/
│   │   │   └── router.tsx
│   │   └── app.tsx
│   │
│   ├── components/
│   │   ├── ui/                  # Button, Input, Modal, Badge, Toast 등
│   │   └── layout/              # Sidebar, Header, PageLayout 등
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── deal/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── contact/
│   │   ├── company/
│   │   ├── product/
│   │   ├── schedule/
│   │   ├── meeting-note/
│   │   ├── business-card/
│   │   ├── tag/
│   │   ├── import-export/
│   │   ├── notification/
│   │   └── trash/
│   │
│   ├── hooks/                   # useDebounce, useModal 등 도메인 없는 공통 훅
│   ├── lib/
│   │   ├── api-client.ts         # API 클라이언트와 인증 헤더 처리
│   │   ├── env.ts                # Vite 환경 변수 파싱
│   │   └── query-client.ts       # TanStack Query 설정
│   ├── pages/                   # 라우트 진입점. 조립만 담당
│   │   ├── home/
│   │   ├── login/
│   │   ├── deals/
│   │   ├── contacts/
│   │   ├── companies/
│   │   ├── products/
│   │   ├── schedules/
│   │   ├── meeting-notes/
│   │   └── settings/
│   ├── store/                   # Zustand 사용 시 전역 UI 상태만 배치
│   ├── types/
│   │   └── common.ts             # ApiResponse, Pagination 등
│   ├── utils/
│   │   └── format.ts
│   ├── styles/
│   │   └── global.css
│   └── main.tsx
│
├── .env.example
├── eslint.config.js
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 4. 참고 구조와 프로젝트 기준 매핑

사용자가 제시한 `saleskit-fe` 구조는 이 프로젝트의 프론트 방향과 대부분 일치한다. 다만 실제 저장소 기준은 아래처럼 정리한다.

| 참고 구조 | 이 프로젝트 기준 |
| --- | --- |
| `src/router/index.tsx` | `src/app/router/router.tsx` |
| `src/lib/axios.ts` | `src/lib/api-client.ts` |
| `src/lib/queryClient.ts` | `src/lib/query-client.ts` |
| `features/deals` | `features/deal` |
| `features/contacts` | `features/contact` |
| `features/companies` | `features/company` |
| `features/products` | `features/product` |
| `features/meetings` | `features/meeting-note` |
| `.eslintrc.cjs` | `eslint.config.js` |

`src/lib/api-client.ts`는 구현 기술을 Axios로 고정하지 않는다. 현재 기준은 API 접근을 한 파일로 모으는 것이며, 내부 구현은 `fetch`, Axios, 또는 별도 클라이언트로 교체할 수 있다.

## 5. 도메인 확장 예시

새 도메인 `company` 기능이 커질 때는 다음처럼 확장한다.

```text
src/features/company/
├── api/
│   ├── company-api.ts
│   └── company-query-keys.ts
├── components/
│   ├── company-form.tsx
│   ├── company-list.tsx
│   └── company-selector.tsx
├── hooks/
│   ├── use-company-list.ts
│   └── use-company-mutation.ts
├── schemas/
│   └── company-schema.ts
├── types/
│   └── company.ts
└── index.ts
```

페이지는 `src/pages/companies`에서 위 feature를 조립한다. 페이지가 직접 API를 호출하거나 Zod 스키마를 소유하지 않는다.

## 6. 상태 관리 기준

- 서버에서 온 데이터는 TanStack Query로 관리한다.
- 폼 입력과 모달 내부 상태는 컴포넌트 로컬 상태 또는 React Hook Form으로 관리한다.
- 여러 페이지가 공유하는 UI 상태가 필요할 때만 `store`에 Zustand 스토어를 둔다.
- 인증 토큰은 API 클라이언트 또는 인증 feature를 통해 접근하며 임의 컴포넌트에서 직접 다루지 않는다.

## 7. UI 기준

- 한국어 UI 기본 폰트는 Pretendard를 기준으로 하고, 시스템 폰트 fallback을 둔다.
- 버튼과 도구성 액션에는 가능한 한 `lucide-react` 아이콘을 사용한다.
- shadcn/ui 컴포넌트를 사용할 때는 `components/ui`에 배치하고 도메인 의미를 넣지 않는다.
- 업무 도구 화면은 조밀하고 스캔하기 쉬운 레이아웃을 우선한다.
