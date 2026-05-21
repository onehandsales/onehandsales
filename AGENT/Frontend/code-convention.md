# Frontend Code Convention

> React + Vite + TypeScript 코드 컨벤션
> 아키텍처 규칙은 별도 (architecture.md 참고)

---

## 1. 파일 명명

### 1.1 파일명: kebab-case + 역할 suffix
```
customer-list.page.tsx           # 페이지
customer-card.tsx                # 컴포넌트
customer-form.tsx
use-customers.ts                 # 훅
customer.api.ts                  # API 함수
customer.types.ts                # 타입
customer-filter.utils.ts         # 유틸
auth.store.ts                    # zustand store
date.utils.ts
api-client.ts
```

### 1.2 컴포넌트 파일과 export
```typescript
// customer-card.tsx
export function CustomerCard({ customer }: Props) { ... }
```
- 파일명: `customer-card.tsx` (kebab-case)
- 컴포넌트명: `CustomerCard` (PascalCase)
- **named export만** (default 금지)

### 1.3 디렉토리: kebab-case
```
features/customer/
components/customer-list/
```

### 1.4 변수/함수: camelCase
```typescript
const customerList = ...;
function findCustomerById() {}
```

### 1.5 상수: UPPER_SNAKE_CASE
```typescript
export const MAX_CUSTOMERS_PER_PAGE = 50;
export const API_TIMEOUT = 10_000;
```

### 1.6 타입/인터페이스: PascalCase
```typescript
interface Customer { }
type CustomerStatus = 'active' | 'inactive';
```

---

## 2. TypeScript 규칙

### 2.1 strict 모드 필수
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 2.2 any 금지
```typescript
// ❌
function process(data: any) {}

// ✅
function process(data: unknown) {
  if (isCustomer(data)) { ... }
}
```

### 2.3 type vs interface
- 객체 형태: `interface` (확장 가능)
- 유니온/유틸리티: `type`
```typescript
interface Customer {
  id: string;
  name: string;
}

type CustomerStatus = 'active' | 'inactive';
type CustomerWithDeals = Customer & { deals: Deal[] };
```

### 2.4 Props 타입
```typescript
// ✅ 컴포넌트 파일 내 Props 인터페이스
interface CustomerCardProps {
  customer: Customer;
  onEdit?: (id: string) => void;
}

export function CustomerCard({ customer, onEdit }: CustomerCardProps) { ... }
```

### 2.5 `as` 형변환 최소화
```typescript
// ❌
const customer = data as Customer;

// ✅ Zod 등으로 검증
const customer = customerSchema.parse(data);
```

---

## 3. React 규칙

### 3.1 함수형 컴포넌트 + Hooks만
```typescript
// ✅
export function CustomerList() {
  const { data } = useCustomers();
  return <ul>{data?.map(...)}</ul>;
}

// ❌ Class component
class CustomerList extends Component { }
```

### 3.2 컴포넌트 작성 순서
```typescript
export function CustomerCard({ customer }: Props) {
  // 1. 훅 (라이브러리 → 커스텀 → useState)
  const navigate = useNavigate();
  const { mutate } = useDeleteCustomer();
  const [isOpen, setIsOpen] = useState(false);
  
  // 2. 파생값 (useMemo는 필요할 때만)
  const displayName = customer.name || '이름 없음';
  
  // 3. 이벤트 핸들러
  const handleEdit = () => navigate(`/customers/${customer.id}/edit`);
  const handleDelete = () => mutate(customer.id);
  
  // 4. early return
  if (!customer) return null;
  
  // 5. JSX
  return <div>...</div>;
}

interface Props {
  customer: Customer;
}
```

### 3.3 이벤트 핸들러 명명
- `on*`: Props로 받는 핸들러 (`onClick`, `onSubmit`, `onCustomerSelect`)
- `handle*`: 컴포넌트 내부 핸들러 (`handleClick`, `handleSubmit`)

```typescript
interface Props {
  onCustomerSelect: (id: string) => void;  // ✅ Props
}

export function CustomerList({ onCustomerSelect }: Props) {
  const handleItemClick = (id: string) => {  // ✅ 내부
    onCustomerSelect(id);
  };
  return <button onClick={() => handleItemClick(customer.id)}>...</button>;
}
```

### 3.4 key는 ID 사용
```typescript
// ✅
{customers.map((c) => <CustomerCard key={c.id} customer={c} />)}

// ❌ index
{customers.map((c, i) => <CustomerCard key={i} customer={c} />)}
```

### 3.5 controlled vs uncontrolled
- 폼: React Hook Form (uncontrolled)
- 단순 input: controlled (`useState` + `onChange`)

---

## 4. JSX 규칙

### 4.1 self-closing
```typescript
// ✅
<Avatar src={url} />

// ❌
<Avatar src={url}></Avatar>
```

### 4.2 짧은 조건부 렌더링
```typescript
// ✅
{isLoading && <Spinner />}
{data && <CustomerList data={data} />}

// 둘 다 필요한 분기는 early return
```

### 4.3 인라인 함수 최소화
```typescript
// ❌ 매 렌더링마다 새 함수 생성 (큰 리스트에서 문제)
{customers.map((c) => (
  <CustomerCard onClick={() => navigate(`/customers/${c.id}`)} />
))}

// ✅ 핸들러로 추출
const handleClick = (id: string) => navigate(`/customers/${id}`);
{customers.map((c) => <CustomerCard customer={c} onClick={handleClick} />)}
```

### 4.4 Fragment 사용
```typescript
// ✅
return (
  <>
    <Header />
    <Main />
  </>
);

// ❌ 의미 없는 div
return (
  <div>
    <Header />
    <Main />
  </div>
);
```

---

## 5. 훅 규칙

### 5.1 use* 접두사
```typescript
// ✅
function useCustomers() {}
function useDebounce() {}

// ❌
function getCustomers() {}  // 일반 함수처럼 보임
```

### 5.2 훅 순서 (조건문 안에 두기 금지)
```typescript
// ❌
if (condition) {
  const { data } = useCustomers();
}

// ✅
const { data } = useCustomers();
if (condition) { ... }
```

### 5.3 의존성 배열 정확히
```typescript
// ESLint react-hooks/exhaustive-deps 위반 금지
useEffect(() => {
  fetchCustomers(userId);
}, [userId]);  // userId 필수
```

### 5.4 커스텀 훅은 한 책임만
```typescript
// ❌ 너무 많은 일
function useCustomerEverything(id: string) {
  // get, update, delete, notify, log...
}

// ✅ 분리
function useCustomer(id: string) {}
function useUpdateCustomer() {}
function useDeleteCustomer() {}
```

---

## 6. TanStack Query 규칙

### 6.1 queryKey는 배열 + 일관 구조
```typescript
// ✅ 도메인 → 작업 → 파라미터
['customers']                          // 리스트
['customers', { region: '서울' }]      // 필터된 리스트
['customers', id]                      // 상세
['customers', id, 'deals']             // 관련 데이터
```

### 6.2 queryKey factory 사용
```typescript
// features/customer/api/customer-keys.ts
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filter: CustomerFilter) => [...customerKeys.lists(), filter] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};
```

### 6.3 mutation 후 invalidate
```typescript
const queryClient = useQueryClient();

const { mutate } = useMutation({
  mutationFn: createCustomer,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: customerKeys.all });
  },
});
```

### 6.4 optimistic update (필요 시)
```typescript
const { mutate } = useMutation({
  mutationFn: updateCustomer,
  onMutate: async (newCustomer) => {
    await queryClient.cancelQueries({ queryKey: customerKeys.detail(newCustomer.id) });
    const previous = queryClient.getQueryData(customerKeys.detail(newCustomer.id));
    queryClient.setQueryData(customerKeys.detail(newCustomer.id), newCustomer);
    return { previous };
  },
  onError: (err, newCustomer, context) => {
    queryClient.setQueryData(customerKeys.detail(newCustomer.id), context?.previous);
  },
});
```

---

## 7. 폼 (React Hook Form + Zod)

### 7.1 스키마 우선 정의
```typescript
const customerSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  phone: z.string().regex(/^01[0-9]{8,9}$/, '올바른 전화번호 형식이 아닙니다').optional(),
  region: z.string().max(50).optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;
```

### 7.2 useForm + zodResolver
```typescript
const form = useForm<CustomerFormValues>({
  resolver: zodResolver(customerSchema),
  defaultValues: { name: '', phone: '', region: '' },
});

const onSubmit = (values: CustomerFormValues) => {
  // ...
};
```

### 7.3 에러 메시지는 스키마에서
- 컴포넌트에서 일일이 한국어 메시지 작성 X
- Zod 스키마의 메시지를 그대로 사용

---

## 8. import 순서

### 8.1 그룹 순서
1. React
2. 외부 라이브러리
3. `@/app/*`, `@/pages/*`
4. `@/features/*`
5. `@/shared/*`
6. 상대 경로

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth';
import { Button } from '@/shared/ui/button';

import { CustomerCard } from './customer-card';
```

### 8.2 tsconfig paths
```json
{
  "paths": {
    "@/*": ["src/*"]
  }
}
```

### 8.3 import type
```typescript
import type { Customer } from '@/features/customer';
import { useCustomers } from '@/features/customer';
```

---

## 9. 환경변수

### 9.1 VITE_ 접두사
```bash
VITE_API_URL=
VITE_SENTRY_DSN=
```

### 9.2 직접 접근 금지, config로
```typescript
// shared/config/env.ts
export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
} as const;
```

---

## 10. 비동기 처리

### 10.1 async/await 일관 사용
```typescript
// ✅
const data = await fetchCustomers();

// ❌
fetchCustomers().then(...)
```

### 10.2 에러 핸들링
```typescript
try {
  await mutate(values);
  toast.success('저장되었습니다');
} catch (error) {
  toast.error('저장에 실패했습니다');
}
```

### 10.3 Promise.all 병렬 처리
```typescript
const [customers, deals] = await Promise.all([
  fetchCustomers(),
  fetchDeals(),
]);
```

---

## 11. 스타일링 (Tailwind)

### 11.1 클래스 정렬 (prettier-plugin-tailwindcss)
```typescript
// 자동 정렬: layout → spacing → sizing → typography → colors
<div className="flex items-center gap-2 p-4 text-sm text-gray-700">
```

### 11.2 조건부 className: clsx 또는 cn
```typescript
import { cn } from '@/shared/lib/cn';

<button className={cn(
  'rounded px-4 py-2',
  isActive && 'bg-primary text-white',
  disabled && 'opacity-50',
)} />
```

### 11.3 변형 패턴: cva (class-variance-authority)
shadcn/ui 패턴 그대로 사용

---

## 12. Git 커밋

### 12.1 Conventional Commits
```
feat(customer): add region filter
fix(deal): correct probability validation
refactor(filter): extract tab filter logic
chore: bump tanstack-query to v5.20
```

---

## 13. 금지 사항 요약

### 13.1 절대 금지
- ❌ `any` 사용
- ❌ default export (컴포넌트)
- ❌ useEffect + fetch (TanStack Query 사용)
- ❌ class component
- ❌ CSS 모듈 / styled-components
- ❌ Feature 내부 파일 직접 import (index.ts 경유)
- ❌ `process.env` 직접 접근
- ❌ `console.log` (개발 중 외)
- ❌ key={index}
- ❌ 폼 검증 메시지 한국어를 컴포넌트에 하드코딩

### 13.2 권장
- ✅ named export
- ✅ TanStack Query 일관 사용
- ✅ Zod로 폼/응답 검증
- ✅ early return으로 분기
- ✅ Tailwind 클래스만
- ✅ cn() 유틸로 조건부 className
