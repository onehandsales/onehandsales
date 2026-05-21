# Frontend Comment Rules

> 주석은 "WHY"만. "WHAT"은 코드와 명명으로 표현.

---

## 1. 핵심 원칙

### 1.1 기본은 주석 없음
- 잘 짠 컴포넌트는 주석 없이 읽힘
- 좋은 컴포넌트명/Props명/훅명이 주석 대체

### 1.2 주석이 필요한 경우 (WHY)
- 코드만으로는 알 수 없는 **이유/맥락**
- UI/UX 제약 (예: "디자인 시안 기준 모바일에서 숨김")
- 브라우저 호환성 회피 (예: "Safari에서 flex gap 안 먹음")
- 성능 최적화 이유 (예: "리스트 1000개 이상 가능해서 가상 스크롤")
- 외부 라이브러리 버그 회피
- TODO/FIXME/HACK

### 1.3 절대 쓰지 말 것
- ❌ 코드 그대로 번역
- ❌ JSX 구조 설명 (`// 헤더`, `// 본문`)
- ❌ 변경 이력
- ❌ 주석 처리된 코드

---

## 2. 좋은 주석 예시

### 2.1 UX 제약
```tsx
// 디자인 시안: 모바일에서는 가격 컬럼 숨김 (가독성 우선)
<td className="hidden md:table-cell">{customer.region}</td>
```

### 2.2 브라우저 호환성
```tsx
// Safari < 16: flex gap이 inline-flex에서 안 먹어서 margin 사용
<span className="inline-flex">
  <Icon className="mr-1" />
  <span>{label}</span>
</span>
```

### 2.3 성능
```tsx
// 거래처가 5,000개까지 가능 (운영 정책 상한)
// react-virtuoso로 가상 스크롤, key는 customer.id로 안정성 확보
<Virtuoso data={customers} itemContent={...} />
```

### 2.4 외부 라이브러리 회피
```tsx
// React Hook Form: defaultValues가 비동기 로딩 시 reset 필요
useEffect(() => {
  if (data) form.reset(data);
}, [data]);
```

### 2.5 TanStack Query 의도
```tsx
// staleTime을 5분으로 잡은 이유: 거래처 데이터는 자주 안 바뀜
// 영업사원이 새로고침으로 강제 갱신 가능
useQuery({
  queryKey: customerKeys.list(filter),
  queryFn: () => customerApi.list(filter),
  staleTime: 1000 * 60 * 5,
});
```

### 2.6 TODO/FIXME
```tsx
// TODO(#234): 명함 미리보기 zoom 기능 추가
// FIXME(#199): Safari에서 카메라 권한 거부 시 에러 메시지 누락
// HACK: shadcn/ui Dialog가 portal 안에서 form context 잃어버려서 manual wrapping
```

---

## 3. 나쁜 주석 예시

### 3.1 ❌ JSX 구조 설명
```tsx
// ❌ 모든 섹션마다 주석
return (
  <div>
    {/* 헤더 */}
    <Header />
    {/* 본문 */}
    <Main />
    {/* 푸터 */}
    <Footer />
  </div>
);
```
→ 컴포넌트명이 이미 설명

### 3.2 ❌ Props 설명을 주석으로
```tsx
// ❌
interface Props {
  customer: Customer;  // 거래처 객체
  onEdit?: (id: string) => void;  // 수정 콜백
}
```
→ 타입과 명명이 이미 설명

### 3.3 ❌ 의미 없는 구분자
```tsx
// ❌
// =================
// State 정의
// =================
const [open, setOpen] = useState(false);
```

### 3.4 ❌ 주석 처리된 코드
```tsx
// ❌
return (
  <div>
    {/* <OldCustomerCard customer={customer} /> */}
    <CustomerCard customer={customer} />
  </div>
);
```

### 3.5 ❌ Hook 호출 설명
```tsx
// ❌
// 거래처 목록을 가져옴
const { data } = useCustomers();
```
→ 훅명이 이미 설명

---

## 4. JSDoc 사용 정책

### 4.1 JSDoc 사용 경우
- 다른 feature가 사용하는 **public 훅/컴포넌트**
- 명확하지 않은 사용 규칙
- IDE 자동완성에 도움이 되고 WHY가 있는 경우

### 4.2 좋은 JSDoc
```tsx
/**
 * 거래처 필터 상태를 URL 쿼리스트링과 동기화합니다.
 *
 * @remarks
 * 북마크/공유 가능하도록 모든 필터를 URL에 반영합니다.
 * region, status는 단일 값, tags는 콤마 구분 배열로 직렬화됩니다.
 */
export function useCustomerFilter() { ... }
```

### 4.3 나쁜 JSDoc
```tsx
// ❌ 타입이 이미 설명
/**
 * @param customer - 거래처
 * @returns JSX 요소
 */
export function CustomerCard({ customer }: Props) { }
```

---

## 5. 주석 분류 태그

| 태그 | 의미 | 형식 |
|------|------|------|
| `TODO` | 나중에 할 일 | `TODO(#123):` 또는 `TODO(2026-06-01):` |
| `FIXME` | 알려진 버그, 임시 회피 | `FIXME(#456):` |
| `HACK` | 의도적 우회 | `HACK: 사유` |
| `NOTE` | 중요한 맥락 | `NOTE: 사유` |
| `WARNING` | 위험 | `WARNING: 사유` |

```tsx
// TODO(#234): 명함 미리보기 zoom in/out 추가
// FIXME(#199): iOS Safari에서 input focus 시 viewport jump
// HACK: shadcn/ui Dialog 포털 안에서 form context 잃음 - FormProvider 한 번 더 감쌈
// NOTE: 이 컴포넌트는 모바일에서만 사용됨. 데스크탑에서 렌더링 X.
// WARNING: 이 useEffect의 의존성 배열을 변경하면 무한 루프 위험 있음
```

---

## 6. 검토 체크리스트

PR 리뷰 시:
- [ ] JSX 구조 설명 주석 없는가 (`// 헤더` 같은)
- [ ] Props 설명을 주석으로 하지 않았는가 (타입으로 충분)
- [ ] 주석 처리된 코드 없는가
- [ ] TODO/FIXME에 이슈 번호 있는가
- [ ] WHY 없이 WHAT만 설명한 주석 없는가
- [ ] 컴포넌트명/훅명/Props명으로 주석 없앨 수 있는가

---

## 7. AI에게 코드 생성 시킬 때 강조할 것

1. "주석은 기본적으로 쓰지 마라. WHY가 필요한 경우만"
2. "JSX 구조에 주석 달지 마라 (헤더, 본문 같은 거)"
3. "Props 설명을 주석으로 하지 마라, 타입으로 표현하라"
4. "TanStack Query queryKey, staleTime 같은 결정에는 WHY 한 줄 OK"
5. "TODO/FIXME에는 반드시 이슈 번호나 날짜를 붙여라"
