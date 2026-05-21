# Admin Web Architecture Rules

> React + Vite Admin 웹 (관리자 전용)의 소프트웨어 아키텍처 규칙
> User 웹과 별도 레포로 운영. 동일한 백엔드를 사용하되 `/admin/api/*` 라우트 호출.

---

## 1. 핵심 원칙

### 1.1 User 웹과의 관계
- **별도 레포** (`sales-admin`)
- **별도 호스트** (`admin.yourdomain.com`)
- **백엔드는 공유** (`api.yourdomain.com/admin/api/*` 호출)
- **JWT 토큰은 공유** (User 테이블의 role === 'ADMIN'만 로그인 허용)

### 1.2 5대 원칙
1. **데이터 테이블 중심 UI**: 영업 앱과 달리 관리자는 큰 데이터 셋을 다룸
2. **읽기 위주**: 80% 조회, 20% 변경 (사용자 정지 등)
3. **데스크탑 우선**: 모바일 대응 안 함 (관리자는 PC에서만 사용)
4. **권한 강제**: 모든 라우트에 AdminGuard
5. **분리 용이성 유지**: User 웹/모바일과 코드 공유 안 함 (의도적 분리)

---

## 2. 디렉토리 구조 (User 웹과 동일 FSD 기반)

```
src/
├── app/
│   ├── providers/
│   ├── routes/
│   ├── styles/
│   └── App.tsx
│
├── pages/
│   ├── login/
│   ├── dashboard/                  # 메인 대시보드 (지표/차트)
│   ├── users/                      # 사용자 관리
│   │   ├── user-list.page.tsx
│   │   └── user-detail.page.tsx
│   ├── customers/                  # 전체 거래처 조회 (모든 사용자)
│   ├── deals/                      # 전체 영업건 조회
│   ├── metrics/                    # 시스템 통계
│   └── settings/                   # 시스템 설정
│
├── features/
│   ├── auth/                       # Admin 로그인 (role 체크)
│   ├── user-management/            # ★ Admin 전용
│   │   ├── api/
│   │   ├── components/
│   │   └── index.ts
│   ├── metrics/                    # ★ Admin 전용 (통계/차트)
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── user-growth-chart.tsx
│   │   │   └── ...
│   │   └── index.ts
│   ├── customer-management/        # Admin이 보는 전체 거래처
│   ├── deal-management/            # Admin이 보는 전체 영업건
│   └── audit-log/                  # 감사 로그
│
└── shared/
    ├── ui/                         # shadcn/ui + 데이터 테이블
    ├── lib/
    ├── api/                        # /admin/api/* 호출
    ├── config/
    ├── hooks/
    └── types/                      # OpenAPI 자동 생성
```

---

## 3. User 웹과의 차이점

### 3.1 Tech Stack 추가
| 항목 | User 웹 | Admin 웹 |
|------|---------|---------|
| 데이터 테이블 | 자체 컴포넌트 | **TanStack Table** (정렬/필터/페이지/가상화) |
| 차트 | 없음 | **Recharts** 또는 **Tremor** |
| 폼 | React Hook Form | React Hook Form (동일) |
| 인증 | JWT | JWT + role === 'ADMIN' 검증 |
| 라우팅 | React Router | React Router (동일) |
| 모바일 대응 | 필요 | **불필요** (PC만) |

### 3.2 사용 가능한 무거운 라이브러리
- TanStack Table (데이터 그리드)
- Recharts / Tremor (차트)
- React PDF (관리자용 리포트)
- xlsx (대량 엑셀 내보내기)
- monaco-editor (필요 시 JSON 편집)

User 웹/모바일에는 들어가면 안 되는 무거운 라이브러리들도 Admin에선 OK.

---

## 4. API 통신

### 4.1 baseURL은 `/admin/api/*`
```typescript
// shared/api/client.ts
export const adminApiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/api`,
  timeout: 30_000,  // 무거운 쿼리 대비 30초
});
```

### 4.2 인증 토큰 추가
```typescript
adminApiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      router.navigate('/login');
    }
    if (error.response?.status === 403) {
      router.navigate('/forbidden');  // role !== ADMIN
    }
    return Promise.reject(error);
  },
);
```

### 4.3 API 호출 예시
```typescript
// features/user-management/api/use-all-users.ts
export function useAllUsers(filter: UserFilter) {
  return useQuery({
    queryKey: adminUserKeys.list(filter),
    queryFn: () => adminApiClient.get('/users', { params: filter }).then((r) => r.data),
    staleTime: 1000 * 60,  // 1분 (Admin은 최신 정보 중요)
  });
}
```

---

## 5. 인증 흐름

### 5.1 로그인
```
[Admin 웹]
  │ /login에서 email + password 입력
  ▼
[Backend: /api/auth/login]
  │ JWT 발급 (role 포함)
  ▼
[Admin 웹]
  │ JWT 디코드해서 role 확인
  │ role !== 'ADMIN' 이면 즉시 로그아웃 + 에러 메시지
  │ role === 'ADMIN' 이면 /dashboard로
  ▼
[보호된 라우트 진입]
```

### 5.2 라우트 가드
```tsx
// app/providers/admin-protected-route.tsx
export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
}
```

### 5.3 로그인 페이지에서 role 검증
```tsx
// features/auth/hooks/use-admin-login.ts
export function useAdminLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { token, user } = await authApi.login(credentials);
      if (user.role !== 'ADMIN') {
        throw new NotAnAdminError();
      }
      return { token, user };
    },
  });
}
```

---

## 6. 데이터 테이블 (TanStack Table)

### 6.1 표준 패턴
```tsx
// features/user-management/components/user-table.tsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

const columns: ColumnDef<User>[] = [
  { accessorKey: 'email', header: '이메일' },
  { accessorKey: 'role', header: '권한' },
  { accessorKey: 'createdAt', header: '가입일' },
  {
    id: 'actions',
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];

export function UserTable({ users }: Props) {
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // ... 정렬, 필터, 페이지네이션
  });
  
  return <table>...</table>;
}
```

### 6.2 큰 데이터 셋: 서버 페이지네이션
- 1만 건 이상은 클라이언트 페이지네이션 X
- 백엔드에서 `?page=1&limit=50` 처리

### 6.3 가상 스크롤 (10만 건+)
- TanStack Virtual 결합

---

## 7. 차트/통계

### 7.1 Recharts 사용
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

<LineChart data={data} width={600} height={300}>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="userCount" />
</LineChart>
```

### 7.2 대시보드 구조
```
pages/dashboard/
└── dashboard.page.tsx
    ├── <MetricCard /> × 4   # DAU, 가입자, 거래처 수, 영업건 수
    ├── <UserGrowthChart />
    ├── <RevenueChart />
    └── <RecentSignups />
```

### 7.3 차트 데이터 캐싱
- staleTime 5분 (자주 안 바뀜)
- refetchInterval 비활성화 (수동 새로고침)

---

## 8. 상태 관리

User 웹과 동일:
- 서버 상태: TanStack Query
- 클라이언트 상태: useState 또는 Zustand
- 폼: React Hook Form + Zod

---

## 9. 라우팅

### 9.1 React Router 구조
```typescript
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'customers', element: <AllCustomersPage /> },
      { path: 'deals', element: <AllDealsPage /> },
      { path: 'metrics', element: <MetricsPage /> },
      { path: 'audit-log', element: <AuditLogPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },
]);
```

### 9.2 사이드바 네비게이션
- 좌측 고정 사이드바
- 메인 영역에 페이지 렌더링
- shadcn/ui의 `Sidebar` 컴포넌트 활용

---

## 10. UI/UX 원칙

### 10.1 데스크탑 전용
- 최소 너비 1280px 가정
- 모바일 반응형 안 함 (관리자 노트북 사용)

### 10.2 정보 밀도 높게
- 영업 앱은 여백 많고 큼직 (영업사원 빠른 입력)
- Admin은 정보 밀도 높게 (한 화면에 많은 정보)

### 10.3 위험한 액션은 명확히
- 사용자 삭제, 데이터 초기화 등은 확인 다이얼로그 + 이유 입력
- shadcn/ui의 `AlertDialog` 활용

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">사용자 삭제</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
      <AlertDialogDescription>
        이 사용자의 모든 데이터가 영구 삭제됩니다.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <Input placeholder="삭제 이유 입력 (감사 로그)" />
    <AlertDialogFooter>
      <AlertDialogCancel>취소</AlertDialogCancel>
      <AlertDialogAction>삭제</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 11. 감사 로그 (Audit Log)

### 11.1 모든 변경 액션 기록
- 사용자 정지/삭제
- 시스템 설정 변경
- 데이터 강제 수정

### 11.2 백엔드에서 자동 기록
- 컨트롤러에 `@AuditLog()` 데코레이터 (Phase 2~3)
- 누가 / 무엇을 / 언제

### 11.3 Admin 웹에서 조회만
- `pages/audit-log/`에서 검색/필터

---

## 12. 환경변수

```bash
# .env.example
VITE_API_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=
```

User 웹과 동일한 baseURL 사용 (Admin은 `/admin/api/*` 경로로 호출).

---

## 13. 안티 패턴 (Don't)

### 13.1 ❌ User 웹/모바일 코드 import
```typescript
// ❌ 다른 레포니까 당연히 불가능, 하지만 복사도 비추
import { CustomerCard } from '@/features/customer';  // User 웹 코드
```

### 13.2 ❌ User용 API 호출
```typescript
// ❌
adminApiClient.get('/api/customers');  // User용 API

// ✅
adminApiClient.get('/customers');  // baseURL이 /admin/api 라서 자동으로 /admin/api/customers
```

### 13.3 ❌ 모바일 반응형 작업
```typescript
// ❌ Admin은 데스크탑 전용
<div className="hidden md:flex">  // 불필요
```

### 13.4 ❌ Role 체크를 컴포넌트에서
```tsx
// ❌ 모든 컴포넌트에서 role 체크
if (user.role !== 'ADMIN') return null;

// ✅ 라우트 가드에서 한 번
<AdminProtectedRoute><Page /></AdminProtectedRoute>
```

---

## 14. AI에게 작업 시킬 때 강조할 것

1. "Admin 웹은 데스크탑 전용, 모바일 반응형 금지"
2. "모든 라우트는 AdminProtectedRoute로 감싸고, 로그인 시 role === 'ADMIN' 검증"
3. "API 호출은 /admin/api/* 경로 (adminApiClient 사용)"
4. "데이터 테이블은 TanStack Table, 차트는 Recharts"
5. "위험한 액션은 AlertDialog로 확인 + 감사 로그 사유 입력"
6. "User 웹과 코드 공유 안 함 (의도적 분리)"
