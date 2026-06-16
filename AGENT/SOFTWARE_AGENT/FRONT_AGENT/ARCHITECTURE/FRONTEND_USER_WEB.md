# User Web 프론트엔드 아키텍처

이 문서는 `FE/user-web`의 기준 아키텍처를 정의한다. 사용자 웹은 개인 영업 담당자가 실제로 딜, 담당자, 제품, 일정, 회의록을 관리하는 화면이며, 도메인 기능 중심으로 확장한다.

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
| 빌드 검증 | `tsc -b`, `vite build` |

참고 구조에서 제안된 Node.js 22.12 이상 기준은 이 프로젝트에서는 Node.js 24 LTS로 상향 고정한다.

## 2. 구조 원칙

- `pages`는 라우트 진입점이며 화면 조립만 담당한다.
- 실제 비즈니스 UI, 훅, API 호출, 타입은 `features/<domain>` 안에 둔다.
- 공통 UI는 `components/ui`, 레이아웃은 `components/layout`에 둔다.
- 도메인과 무관한 훅은 `hooks`, 유틸은 `utils`, 공통 타입은 `types`에 둔다.
- API 클라이언트, 환경 변수 파서, QueryClient 설정은 `lib`에 둔다.
- 라우터와 앱 프로바이더는 앱 셸 책임이므로 `src/app` 아래에 둔다.
- 새 도메인 화면을 늘리기 전에 공용 토큰, shell, 상태 UI, 공용 데이터 표시 컴포넌트를 먼저 정리한다.
- desktop/mobile은 레이아웃을 분리하되, 공통 데이터 로직과 작은 UI 컴포넌트는 공유할 수 있다.
- 도메인별 화면 수를 늘리는 속도보다 공용 컴포넌트 품질을 먼저 고정한다.

## 2A. Shared-First 구현 순서

User Web 리디자인은 route 순서나 도메인 이름 순서대로 구현하지 않는다.

권장 구현 순서:

1. 디자인 토큰
2. 공용 Shell
3. 공용 상태 UI
4. 공용 데이터 표시 컴포넌트
5. 딜 기준 화면
6. 로그인/랜딩
7. company
8. contact
9. product
10. schedule
11. 부가 기능군

이 순서를 쓰는 이유:

- 로그인 후 첫 핵심 화면은 딜 파이프라인 홈이다.
- company/contact/product/schedule은 이후에도 같은 shell, modal, card, filter, detail panel, state UI 문법을 재사용한다.
- 공용 기반이 먼저 고정되지 않으면 도메인마다 다른 visual grammar가 생긴다.

먼저 정리할 공용 레이어:

- global tokens
- desktop sidebar
- desktop top bar
- mobile header
- bottom tab bar
- modal shell
- toast
- loading / empty / error states
- base card
- section header
- primary button
- filter chip
- badge family

딜 화면에서 먼저 기준을 잡을 것:

- desktop deal pipeline home
- mobile deal pipeline home
- desktop detail panel
- mobile deal detail
- deal quick create modal

그 이후 도메인 확장 순서:

- company
- contact
- product
- schedule
- meeting note / business card / import-export / trash / notifications / search

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

## 8. 현재 코드 라우트 상태

현재 `FE/user-web/src/app/router/router.tsx` 기준 라우트:

- `/login`
- `/`
- `/companies`
- `/companies/:companyId`
- `/contacts`
- `/contacts/scan`
- `/contacts/:contactId`
- `/products`
- `/products/:productId`
- `/deals`
- `/deals/:dealId`
- `/schedules`
- `/schedules/week`
- `/meeting-notes`
- `/meeting-notes/new`
- `/meeting-notes/:meetingNoteId`
- `/business-cards`
- `/notifications`
- `/import`
- `/export`
- `/trash`
- `/settings`

현재 feature 폴더:

- `auth`
- `business-card`
- `company`
- `contact`
- `deal`
- `import-export`
- `meeting-note`
- `notification`
- `product`
- `schedule`
- `search`
- `tag`
- `trash`

현재 코드 차이:

- 기획 화면 목록의 `/meetings`, `/meetings/new`, `/meetings/:id`는 현재 코드에서 `/meeting-notes`, `/meeting-notes/new`, `/meeting-notes/:meetingNoteId`로 구현되어 있다.
- 기획 화면 목록의 `/imports`, `/exports`는 현재 코드에서 `/import`, `/export`로 구현되어 있다.
- 기획 화면 목록의 `/search` 전용 라우트는 현재 router에 없다. `search` feature는 존재하지만 상단 검색/내부 기능으로 연결될 수 있다.
- 현재 `/` 홈은 딜 파이프라인이 아니라 `화면 준비중입니다` 준비 상태를 렌더링한다. 실제 딜 파이프라인 화면은 `/deals`에서 운영한다.
- `IMPORT`, `휴지통`은 라우트와 feature가 남아 있어도 핵심 기능 UX 안정화 전까지 sidebar에서 숨긴다.
- `src/lib/api-client.ts`는 User Web에서 `/admin/api/*` 호출을 차단한다.
- Backend는 현재 Auth/User, Company, Contact, Product, Deal, Schedule, MeetingNote 수동 API와 Additional Work G01-G12 API가 구현되어 있다. `business-card`, `import-export`, `notification`, `search`, `trash` feature/API client는 실제 Backend API가 구현되기 전까지 mock/placeholder 경계를 명확히 둔다.
- `src/features/meeting-note`는 `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`의 수동 회의록 계약을 따른다. 단일 `dealId`, `stageText`, `hasNext`, request `timeZone`, request `rawText`, AI/STT 생성, 삭제/복구 계약은 현재 User Web 기준이 아니다.
- Page-number list pagination은 `pageSize=10`, `totalPages`, `totalCount`를 기준으로 한다. 공용 `Pagination`에 `hasNext`를 넘기지 않는다.
- Company/Contact/Product/Deal/MeetingNote 목록은 10개 단위로 페이지를 나누며, User Web은 서버 응답의 `pageSize`를 표시/계산 기준으로 사용한다.
- `hasNext`는 회사/담당자/제품 상세 메모 로그처럼 cursor 기반 infinite loading에서만 사용한다.
- Company list는 `useCompanyFields`, `useCompanyRegions` 전체 조회 결과를 `분야 ▾`, `지역 ▾` select 옵션으로 사용한다. 목록 페이지에서 회사 분야/지역 생성/삭제 UI를 노출하지 않는다.
- Contact list는 `useContactDepartments`, `useContactJobGrades` 전체 조회 결과를 `부서 ▾`, `직급 ▾` select 옵션으로 사용한다. 목록 페이지에서 부서/직급 생성/삭제 UI를 노출하지 않는다.
- Company/Contact/Product list는 제품형 `Controls Bar + Table Card + Pagination` 문법을 기준으로 맞춘다.
- `src/features/company/api/company-api.ts`는 구현 완료된 Backend Company API 계약과 맞춰야 한다. Company UI/API 통합 작업 때 `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`와 `COMPANY_API_DETAIL.md`의 `companyName`, `companyFieldId`, `companyRegionId`, memo/private memo contract를 기준으로 오래된 필드와 삭제/복구 경로를 정리한다.
- Company 화면은 `TODO/DONE/ADDITIONAL_WORK_PLAN` 기준으로 목록 `contactCount`/`dealCount`, 회사 상세 연결 Contact 목록, 회사 상세 연결 Deal 목록, 현재 필터 기준 xlsx export를 반영해야 한다.
- `src/features/contact/api`는 구현 완료된 Backend Contact API 계약과 맞춰야 한다. Contact UI/API 통합 작업 때 `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`와 `CONTACT_API_DETAIL.md`의 `username`, `mobile`, `email`, `companyId`, `contactDepartmentId`, `contactJobGradeId`, `contactMemo`, memo/private memo contract를 기준으로 오래된 `name`, `phone`, `department`, `position`, `initialMemo`, 삭제/복구 경로를 정리한다.
- Contact 화면은 `TODO/DONE/ADDITIONAL_WORK_PLAN` 기준으로 담당자 상세 연결 Deal 목록과 현재 필터 기준 xlsx export를 반영해야 한다.
- `src/features/product` 또는 `src/features/products`는 구현 완료된 Backend Product API 계약과 맞춰야 한다. Product UI/API 통합 작업 때 `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`와 `PRODUCT_API_DETAIL.md`의 `productName`, `productPrice`, `productCategoryId`, `productStatusId`, `productMemo`, memo/private memo contract를 기준으로 오래된 `unitPrice`, `currency`, `description`, `initialMemo`, 삭제/복구 경로를 정리한다.
- Product 화면은 `TODO/DONE/ADDITIONAL_WORK_PLAN` 기준으로 목록 `dealCount`, `sort=dealCountDesc`, 제품 상세 연결 Deal 목록, 현재 필터 기준 xlsx export를 반영해야 한다.
- `src/features/deal/api`는 구현 완료된 Backend Deal API 계약과 맞춰야 한다. Deal UI/API 통합 작업 때 `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`와 `DEAL_API_DETAIL.md`의 6단계 상태, `dealName`, `dealCost`, `companyId`, `contactId`, `productIds`, `expectedEndDate`, `followingAction`, 메모 로그 contract를 기준으로 오래된 단계명과 필드를 정리한다.

## 9. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
