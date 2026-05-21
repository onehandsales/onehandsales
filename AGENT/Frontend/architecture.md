# Frontend (User Web) Architecture Rules

> React + Vite 웹 프론트엔드의 소프트웨어 아키텍처 규칙
> **이 문서는 User 웹(영업사원용) 전용**. Admin 웹은 [Admin/architecture.md](../Admin/architecture.md) 참고.

---

## 0. User 웹 vs Admin 웹

| 항목 | User 웹 (이 문서) | Admin 웹 |
|------|------------------|---------|
| 대상 | 영업사원 | 관리자 |
| 호스트 | app.yourdomain.com | admin.yourdomain.com |
| 레포 | sales-frontend | sales-admin |
| API 호출 | /api/* | /admin/api/* |
| 모바일 대응 | 필요 (반응형) | 불필요 (데스크탑 전용) |
| 데이터 테이블 | 자체 컴포넌트 | TanStack Table |
| 차트 | 없음 | Recharts |
| 무거운 라이브러리 | 최소화 | OK |

**User 웹 코드를 Admin 웹에 복사하지 않음**: 의도적 분리.

---

## 1. 핵심 원칙

### 1.1 Feature-Sliced Design (FSD) 기반
백엔드의 Modular Monolith와 호응. 기능(feature) 단위로 폴더 분리.

### 1.2 5대 원칙
1. **기능 단위 분리**: customer, deal 같은 도메인별 폴더
2. **단방향 의존**: 상위 레이어가 하위 레이어를 참조 (역방향 금지)
3. **서버 상태 vs 클라이언트 상태 분리**: TanStack Query vs Zustand/useState
4. **컴포넌트는 작게**: 한 컴포넌트 = 한 책임
5. **타입은 백엔드 기준**: API 타입은 OpenAPI에서 자동 생성

---

## 2. 디렉토리 구조

```
src/
├── app/                            # 앱 진입점, 글로벌 설정
│   ├── providers/                  # QueryClient, Router, Theme
│   ├── routes/                     # 라우트 정의
│   ├── styles/                     # 글로벌 CSS
│   └── App.tsx
│
├── pages/                          # 라우트 페이지 (얇음)
│   ├── customer-list/
│   │   └── customer-list.page.tsx
│   ├── customer-detail/
│   ├── deal-list/
│   └── login/
│
├── features/                       # 비즈니스 기능 단위
│   ├── customer/
│   │   ├── api/                    # API 호출 (TanStack Query)
│   │   ├── hooks/                  # 비즈니스 로직 훅
│   │   ├── components/             # 기능 전용 컴포넌트
│   │   ├── types/                  # 타입 정의
│   │   └── index.ts                # public API (re-export)
│   ├── deal/
│   ├── filter/
│   ├── excel-import/
│   └── auth/
│
├── shared/                         # 모든 곳에서 쓰는 공통
│   ├── ui/                         # shadcn/ui 컴포넌트
│   ├── lib/                        # 유틸 (date, format 등)
│   ├── api/                        # API client (axios 인스턴스)
│   ├── config/                     # 환경변수, 상수
│   ├── hooks/                      # 범용 훅 (useDebounce 등)
│   └── types/                      # 공통 타입 (API 자동 생성 포함)
│
└── main.tsx
```

### 2.1 의존성 규칙
```
app ← pages ← features ← shared
```
- `shared`는 다른 어느 것도 import 안 함
- `features`는 다른 `features`를 import할 때 `features/X/index.ts`만 사용
- `pages`는 `features`를 조합만 함, 비즈니스 로직 X

---

## 3. Feature 내부 구조 (예시: customer)

```
features/customer/
├── api/
│   ├── customer.api.ts             # axios 호출 함수
│   ├── use-customers.ts            # useQuery 훅
│   ├── use-create-customer.ts      # useMutation 훅
│   ├── use-update-customer.ts
│   └── use-delete-customer.ts
│
├── hooks/                          # 비즈니스 로직 훅
│   └── use-customer-filter.ts
│
├── components/                     # 이 feature에서만 쓰는 컴포넌트
│   ├── customer-list-item.tsx
│   ├── customer-form.tsx
│   ├── customer-filter.tsx
│   └── customer-card.tsx
│
├── types/
│   └── customer.types.ts           # Feature 내부 타입
│
└── index.ts                        # public API
```

### 3.1 index.ts (public API)
```typescript
// features/customer/index.ts
export { CustomerList } from './components/customer-list';
export { CustomerForm } from './components/customer-form';
export { useCustomers, useCreateCustomer } from './api';
export type { Customer } from './types/customer.types';
```

다른 feature/page는 위만 사용. 내부 파일 직접 import 금지.

---

## 4. 상태 관리

### 4.1 서버 상태: TanStack Query
**원칙**: 서버에서 오는 모든 데이터는 TanStack Query로

```typescript
// features/customer/api/use-customers.ts
export function useCustomers(filter: CustomerFilter) {
  return useQuery({
    queryKey: ['customers', filter],
    queryFn: () => customerApi.list(filter),
    staleTime: 1000 * 60 * 5,  // 5분
  });
}
```

**금지**:
- ❌ useEffect + useState로 서버 데이터 fetching
- ❌ Redux/Zustand에 서버 데이터 저장

### 4.2 클라이언트 상태: useState 또는 Zustand
- 로컬 UI 상태 (모달 열림, 폼 입력): `useState`
- 글로벌 클라이언트 상태 (사이드바 열림, 테마): `Zustand`

```typescript
// shared/stores/ui.store.ts
export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));
```

### 4.3 폼 상태: React Hook Form + Zod
```typescript
const schema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^01[0-9]{8,9}$/).optional(),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});
```

### 4.4 URL 상태: React Router params + searchParams
- 필터/페이지/정렬은 URL에 (북마크/공유 가능)
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const region = searchParams.get('region');
```

---

## 5. API 통신

### 5.1 axios 인스턴스 (shared/api/client.ts)
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken();
      return apiClient.request(error.config);
    }
    return Promise.reject(error);
  },
);
```

### 5.2 API 함수는 Feature 내부에
```typescript
// features/customer/api/customer.api.ts
export const customerApi = {
  list: (filter: CustomerFilter) =>
    apiClient.get<Customer[]>('/customers', { params: filter }).then((r) => r.data),
  
  create: (data: CreateCustomerRequest) =>
    apiClient.post<Customer>('/customers', data).then((r) => r.data),
  
  // ...
};
```

### 5.3 타입은 자동 생성
- 백엔드 OpenAPI → `openapi-typescript`로 생성
- `shared/types/api-schema.ts`에 위치
- 직접 손으로 정의 금지 (Feature 내부 추가 타입은 OK)

---

## 6. 컴포넌트 규칙

### 6.1 컴포넌트 분류
| 종류 | 위치 | 책임 |
|------|------|------|
| Page | `pages/` | 라우트 진입점, 데이터 fetching 트리거 |
| Feature Component | `features/X/components/` | 비즈니스 로직 + UI |
| UI Component | `shared/ui/` | 디자인 시스템 (shadcn/ui) |

### 6.2 컴포넌트 작성 규칙
```typescript
// ✅ 함수형, named export
export function CustomerListItem({ customer }: Props) {
  return <div>...</div>;
}

interface Props {
  customer: Customer;
}
```

- 함수형 컴포넌트만 (Class 금지)
- named export (default export 금지)
- Props 인터페이스는 같은 파일 안에

### 6.3 컴포넌트 크기 규칙
- **150줄 넘으면 분리 검토**
- 한 컴포넌트 = 한 책임
- JSX가 깊어지면 sub-component로 추출

### 6.4 조건부 렌더링
```typescript
// ✅
{isLoading && <Spinner />}
{!isLoading && data && <CustomerList data={data} />}

// ❌ 삼항 연산자 중첩 금지
{isLoading ? <Spinner /> : data ? <CustomerList /> : <Empty />}
```

조건이 복잡하면 early return:
```typescript
if (isLoading) return <Spinner />;
if (error) return <ErrorView error={error} />;
if (!data) return <EmptyView />;
return <CustomerList data={data} />;
```

---

## 7. 라우팅

### 7.1 React Router v6+ 사용
```typescript
// app/routes/index.tsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'customers', element: <CustomerListPage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },
      { path: 'deals', element: <DealListPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
]);
```

### 7.2 인증 보호
```typescript
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

### 7.3 코드 스플리팅 (지연 로딩)
```typescript
const CustomerListPage = lazy(() => import('@/pages/customer-list'));
```

---

## 8. 스타일링

### 8.1 Tailwind CSS만 사용
- 인라인 클래스
- CSS 모듈/styled-components 금지
- 글로벌 스타일은 `app/styles/global.css`에 최소화

### 8.2 디자인 토큰은 `tailwind.config.ts`에서
```typescript
// 색상, 폰트는 토큰으로
theme: {
  extend: {
    colors: {
      primary: { ... },
    },
  },
}
```

### 8.3 자주 쓰는 조합은 컴포넌트로
```typescript
// ❌ 같은 className 반복
<div className="rounded border border-gray-300 p-4 shadow">...</div>
<div className="rounded border border-gray-300 p-4 shadow">...</div>

// ✅ Card 컴포넌트로
<Card>...</Card>
```

---

## 9. 오류 처리

### 9.1 ErrorBoundary
```typescript
// app/providers/error-boundary.tsx
<ErrorBoundary fallback={<ErrorView />}>
  <App />
</ErrorBoundary>
```

### 9.2 API 에러 표시
- TanStack Query의 `error`로 핸들링
- Toast로 사용자에게 알림 (`sonner` 또는 `react-hot-toast`)

```typescript
const { data, error } = useCustomers(filter);

if (error) {
  return <ErrorView error={error} />;
}
```

### 9.3 Sentry 연동
- production에서만 활성화
- 401/403 같은 정상 에러는 제외 (필터링)

---

## 10. 성능

### 10.1 메모이제이션
- 기본은 안 함 (React 19부터 컴파일러가 처리)
- 명백히 느린 부분만 `useMemo`/`useCallback`
- 측정 후 최적화

### 10.2 가상 스크롤
- 거래처/영업건 리스트가 1000개+ 가능 → `react-virtual` 또는 `react-virtuoso`

### 10.3 이미지 최적화
- 명함 이미지: Supabase Storage의 transform URL (resize)
- lazy loading: `loading="lazy"`

---

## 11. 접근성 (a11y)

### 11.1 의미적 HTML 사용
```typescript
// ❌
<div onClick={...}>버튼</div>

// ✅
<button onClick={...}>버튼</button>
```

### 11.2 폼 라벨
```typescript
<label htmlFor="phone">전화번호</label>
<input id="phone" type="tel" />
```

### 11.3 키보드 네비게이션
- 모든 인터랙티브 요소는 Tab으로 접근 가능
- 모달은 Esc로 닫힘

---

## 12. 환경변수

### 12.1 `VITE_` 접두사
```bash
# .env.example
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SENTRY_DSN=
```

### 12.2 접근
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### 12.3 타입 정의
```typescript
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // ...
}
```

---

## 13. 안티 패턴 (Don't)

### 13.1 ❌ Prop Drilling
```typescript
// ❌ 4단계 prop 전달
<A user={user}>
  <B user={user}>
    <C user={user}>
      <D user={user} />
    </C>
  </B>
</A>
```
→ Context 또는 Zustand로

### 13.2 ❌ useEffect로 fetch
```typescript
// ❌
useEffect(() => {
  fetch('/api/customers').then(setData);
}, []);

// ✅
const { data } = useCustomers();
```

### 13.3 ❌ any
```typescript
const data: any = ...;  // ❌
```

### 13.4 ❌ Feature 간 직접 import (내부 파일)
```typescript
// ❌
import { CustomerCard } from '@/features/customer/components/customer-card';

// ✅
import { CustomerCard } from '@/features/customer';
```

### 13.5 ❌ index.ts 남용
- `shared/ui` 같은 큰 폴더에 index.ts 만들면 tree-shaking 안 됨
- Feature의 public API용으로만 사용

---

## 14. 새 Feature 만들 때 체크리스트

```
☐ features/<name>/ 폴더 생성
☐ api/ - API 호출 함수 + TanStack Query 훅
☐ components/ - feature 전용 컴포넌트
☐ hooks/ - 비즈니스 로직 훅 (필요 시)
☐ types/ - 추가 타입 (필요 시)
☐ index.ts - public API
☐ pages/ 또는 다른 features에서 사용 시 index.ts만 import
```

---

## 15. AI에게 작업 시킬 때 강조할 것

1. "서버 데이터는 무조건 TanStack Query 사용, useEffect+fetch 금지"
2. "feature 간 import는 index.ts public API만 사용"
3. "컴포넌트는 함수형 + named export"
4. "Tailwind만 사용, CSS 모듈 금지"
5. "any 사용 금지, OpenAPI 자동 생성 타입 우선"
