# Admin Web Code Convention

> React + Vite + TypeScript 코드 컨벤션 (Admin 웹)
> User 웹 컨벤션과 거의 동일. 차이점만 정리.

---

## 1. User 웹과 동일한 부분

다음은 User 웹의 [Frontend/code-convention.md](../Frontend/code-convention.md)와 **완전히 동일**:

- 파일 명명 (kebab-case + 역할 suffix)
- 컴포넌트 명명 (PascalCase + named export)
- TypeScript 규칙 (strict, any 금지)
- React 규칙 (함수형, hooks 순서)
- JSX 규칙 (Fragment, 조건부 렌더링)
- 훅 규칙 (use* 접두사, 의존성 배열)
- TanStack Query queryKey 패턴
- 폼 (React Hook Form + Zod)
- import 순서
- Tailwind 클래스 정렬
- Git 커밋 (Conventional Commits)

**User 웹 컨벤션을 그대로 적용하면서, 아래 차이점만 추가로 지킨다.**

---

## 2. Admin 전용 차이점

### 2.1 API 호출은 `adminApiClient`
```typescript
// ✅
import { adminApiClient } from '@/shared/api/client';
adminApiClient.get('/users');  // → /admin/api/users

// ❌ User용 apiClient 사용 금지
import { apiClient } from '...';
apiClient.get('/api/users');
```

### 2.2 queryKey에 `admin` 네임스페이스
```typescript
// ✅ User 웹과 구분 (혹시 코드 복사 시 충돌 방지)
export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  list: (filter: UserFilter) => [...adminUserKeys.all, 'list', filter] as const,
  detail: (id: string) => [...adminUserKeys.all, 'detail', id] as const,
};
```

### 2.3 데이터 테이블은 TanStack Table 우선
```typescript
// ✅ 큰 데이터 셋
import { useReactTable } from '@tanstack/react-table';

// 작은 데이터 셋이면 일반 table도 OK
```

### 2.4 차트는 Recharts
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
```

대안 (Phase 후반에 검토): Tremor (대시보드 특화)

### 2.5 모바일 반응형 클래스 사용 금지
```tsx
// ❌ Admin은 데스크탑 전용
<div className="md:flex hidden md:block">

// ✅ 그냥 데스크탑 기준
<div className="flex">
```

### 2.6 정보 밀도 높게
- 여백/패딩을 User 웹보다 작게
- 폰트 사이즈 작게 (text-sm 기본)
- 한 화면에 정보 많이

```tsx
// User 웹
<div className="p-6 text-base">

// Admin 웹
<div className="p-3 text-sm">
```

---

## 3. 디렉토리/파일 명명 추가

### 3.1 Admin 전용 컴포넌트 접두사
구분을 명확히 하기 위해:

```
features/user-management/components/
├── user-table.tsx
├── user-detail-panel.tsx
├── user-action-menu.tsx
└── user-search-filter.tsx
```

### 3.2 페이지 명명
```
pages/users/user-list.page.tsx
pages/users/user-detail.page.tsx
pages/dashboard/dashboard.page.tsx
```

---

## 4. 권한 체크

### 4.1 라우트 가드만 사용 (컴포넌트 내 체크 금지)
```tsx
// ✅ 라우트 가드
<AdminProtectedRoute><UserListPage /></AdminProtectedRoute>

// ❌ 컴포넌트마다 체크
function UserListPage() {
  if (user.role !== 'ADMIN') return null;
  return <...>;
}
```

### 4.2 더 세분화된 권한 (Phase 후반)
- super-admin vs admin 구분이 생기면 그때 추가
- 초기엔 ADMIN 단일 권한

---

## 5. 환경변수

```bash
# .env.example
VITE_API_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=
```

```typescript
// shared/config/env.ts
export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
} as const;
```

---

## 6. Git 커밋 (User 웹과 구분)

레포가 분리되어 있어 별도 히스토리지만, 스코프에 `admin` 추가:

```
feat(admin/user-management): add bulk delete
fix(admin/dashboard): correct DAU calculation
refactor(admin/auth): extract role check to hook
```

---

## 7. 금지 사항 추가 (User 웹 컨벤션 + 다음)

- ❌ `apiClient` (User용) 사용
- ❌ 모바일 반응형 클래스 (`md:`, `sm:`)
- ❌ User 웹/모바일 코드 import (별도 레포)
- ❌ 컴포넌트 내부에서 role 체크
- ❌ `console.log` (운영 환경 제외)
- ❌ 큰 데이터를 클라이언트 페이지네이션 (서버 페이지네이션 필수)

---

## 8. AI에게 작업 시킬 때 강조할 것

1. "Admin 웹이므로 데스크탑 전용, 모바일 반응형 클래스 사용 금지"
2. "API는 adminApiClient 사용, baseURL이 /admin/api로 시작"
3. "queryKey는 ['admin', ...] 네임스페이스로 시작"
4. "데이터 테이블은 TanStack Table, 차트는 Recharts"
5. "권한 체크는 라우트 가드에서만, 컴포넌트 내부 금지"
6. "정보 밀도 높게: text-sm 기본, 패딩 작게"
