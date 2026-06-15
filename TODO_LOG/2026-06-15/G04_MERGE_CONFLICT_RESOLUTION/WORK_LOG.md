# G04_MERGE_CONFLICT_RESOLUTION Work Log

## 작업 일자

- 2026-06-15

## 개요

`fe/contact` 브랜치에서 `origin/main` 을 merge 시도했을 때 6개 파일에서 충돌 발생.
두 브랜치가 동일 파일을 **병렬로 수정**한 결과이며, 각 충돌의 원인과 해결 방향을 기록한다.

---

## 충돌 배경

| 브랜치 | 작업 내용 |
|--------|-----------|
| `fe/contact` (HEAD) | 회사/담당자 목록 화면 PageHeader 기반 디자인 시스템으로 전면 개편, taxonomy 다이얼로그, FilterChip 컴포넌트 등 UI 전면 교체 |
| `origin/main` | Pagination 컴포넌트에 `totalCount` 표시 기능 추가, meeting-note/trash 화면에 회사/담당자 필터·정렬 기능 추가 |

---

## 충돌 파일별 상세

---

### 1. `FE/user-web/src/components/ui/pagination.tsx`

#### 충돌 위치

```
type PaginationProps — totalCount?: number 추가 여부
함수 시그니처 — totalCount 파라미터 추가 여부
본문 — canPrev 변수 vs pageLabel 변수
```

#### HEAD (fe/contact)
```tsx
type PaginationProps = {
  readonly page: number;
  readonly totalPages: number;
  // totalCount 없음
  readonly onPageChange: (page: number) => void;
  readonly className?: string;
};

const canPrev = page > 1;
const canNext = page < safeTotalPages;
// pageLabel 없음
```

#### origin/main
```tsx
type PaginationProps = {
  readonly page: number;
  readonly totalPages: number;
  readonly totalCount?: number;   // 추가됨
  readonly onPageChange: (page: number) => void;
  readonly className?: string;
};

const canNext = page < safeTotalPages;
const pageLabel = `${page} / ${safeTotalPages}페이지`;  // 추가됨
// "총 N개 · 1 / 3페이지" 형태로 UI에 표시
```

#### 해결 방법: **origin 버전 채택**

```bash
git checkout --theirs FE/user-web/src/components/ui/pagination.tsx
```

#### 이유
- `totalCount` prop은 선택적(optional)이므로 기존 호출부를 깨지 않음
- `pageLabel`을 통한 "총 N개 · X / Y페이지" 표시가 사용자 경험상 명확히 유리
- `canPrev`는 Pagination 내부에서 `page <= 1` 조건으로 동일하게 처리 가능하므로 제거해도 무방

---

### 2. `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`

#### 충돌 위치

데스크탑 컬럼 뷰와 모바일 리스트 뷰, 두 곳의 `<Pagination>` props (line 244, 349 근처)

#### HEAD
```tsx
<Pagination
  onPageChange={setPage}
  page={page}
  totalPages={dealsQuery.data.totalPages}
/>
```

#### origin/main
```tsx
<Pagination
  onPageChange={setPage}
  page={page}
  totalCount={dealsQuery.data?.totalCount}
  totalPages={dealsQuery.data?.totalPages ?? 1}
/>
```

#### 해결 방법: **HEAD 기반 + origin 개선사항 수동 반영**

```tsx
<Pagination
  onPageChange={setPage}
  page={page}
  totalCount={dealsQuery.data.totalCount}
  totalPages={dealsQuery.data.totalPages ?? 1}
/>
```

#### 이유
- `totalCount` prop 추가는 Pagination 컴포넌트 개선(1번 파일)과 짝을 이루므로 반영
- `?? 1` 안전장치는 Pagination 내부에서 `Math.max(totalPages, 1)`로 처리하므로 중복이지만, 호출부에서도 명시적으로 표현하는 것이 코드 의도를 드러냄
- optional chaining(`?.`)은 이미 `dealsQuery.data ?` 조건부 렌더링 안에 있으므로 제거

---

### 3. `FE/user-web/src/features/company/components/company-list-screen.tsx`

#### 충돌 위치

import 목록, 컴포넌트 시그니처, 상태 선언부, 전체 JSX 레이아웃, select 스타일, Pagination props 등 파일 전반

#### HEAD (fe/contact) 주요 특징
- `PageHeader` 컴포넌트로 상단 헤더 통일
- `initialCreateOpen` / `onCreateDialogClose` props (router에서 `/companies/new` 경로와 연동)
- `useMemo`로 지역/분야 필터 옵션 메모이제이션
- `FilterChip` 재사용 컴포넌트
- `useNavigate` + taxonomy 다이얼로그 연동

#### origin/main 주요 특징
- `PageHeader` 없는 인라인 레이아웃 (`<section className="flex flex-col gap-0 px-6 py-5">`)
- `filterOptionError` 에러 처리 블록
- `onResetFilters` 함수 이름 패턴
- 다른 CSS 클래스 (더 큰 높이값, 다른 색상)

#### 해결 방법: **HEAD 버전 완전 채택**

```bash
git checkout --ours FE/user-web/src/features/company/components/company-list-screen.tsx
```

#### 이유
- `app-shell.tsx`의 `hideTopBar` 로직이 이 화면에 대해 전역 TopBar를 숨기도록 설정되어 있음. origin 버전을 쓰면 화면 상단에 헤더가 아예 없어짐
- `initialCreateOpen` / `onCreateDialogClose` props는 라우터의 `/companies/new` 경로와 연동되어 있어 필수
- FilterChip + PageHeader 디자인이 product-list-screen 등 다른 목록 화면과 일관성 유지
- origin의 `filterOptionError` 처리는 없어도 동작하며, 추후 별도로 추가 가능

---

### 4. `FE/user-web/src/features/contact/components/contact-list-screen.tsx`

#### 충돌 위치

company-list-screen.tsx와 동일한 패턴의 전면 충돌

#### 해결 방법: **HEAD 버전 완전 채택**

```bash
git checkout --ours FE/user-web/src/features/contact/components/contact-list-screen.tsx
```

#### 이유

company-list-screen.tsx와 동일:
- `hideTopBar` 패턴으로 인해 `PageHeader`가 없으면 화면 헤더 자체가 사라짐
- taxonomy 다이얼로그(부서/직급 추가) 연동 포함
- `initialCreateOpen` props가 라우터 연동 필수
- 나머지 화면과 디자인 일관성

---

### 5. `FE/user-web/src/features/meeting-note/components/meeting-note-list-screen.tsx`

#### 충돌 위치

거의 전체 파일 — 상태 구조, 필터 UI, 레이아웃, Pagination props

#### HEAD (fe/contact) 주요 특징
- `PageHeader` 사용, `useNavigate` 포함
- `useDeferredValue`로 검색어 지연 처리
- 단순 텍스트 검색 필터만 존재
- Pagination: `totalPages`만 전달, totalCount는 직접 계산

#### origin/main 주요 특징
- 회사(companyId) / 담당자(contactId) 드롭다운 필터 + 정렬(sort) 필터
- `useMeetingNoteFilterCompanies`, `useMeetingNoteFilterContacts` 훅 사용
- `clearFilters` / `updateCompanyId` / `updateContactId` / `updateSort` 명시적 핸들러
- Pagination에 `totalCount` 전달

#### 해결 방법: **origin 버전 채택**

```bash
git checkout --theirs FE/user-web/src/features/meeting-note/components/meeting-note-list-screen.tsx
```

#### 이유
- 회사/담당자 필터는 회의록 화면의 핵심 기능으로, origin 버전이 더 완성된 상태
- `useMeetingNoteFilterCompanies`, `useMeetingNoteFilterContacts` 훅이 origin/main에 이미 구현되어 있음
- HEAD의 텍스트 검색 방식은 추후 별도로 추가 가능하며 기능상 열위

> **주의**: `meeting-note-list-screen.tsx`가 origin 버전으로 교체됨에 따라,  
> `app-shell.tsx`의 `isMeetingNoteListPage` 조건이 이 화면의 PageHeader 유무와 맞는지 재확인 필요.  
> origin 버전에는 PageHeader가 없으므로, 전역 TopBar가 표시되어야 한다면 `hideTopBar` 조건에서 제거해야 함.

---

### 6. `FE/user-web/src/features/trash/components/trash-screen.tsx`

#### 충돌 위치

`<Pagination>` props (line 149 근처)

#### HEAD
```tsx
{(trashQuery.data && (totalPages > 1 || page > 1)) ? (
  <Pagination
    page={page}
    totalPages={totalPages}
    onPageChange={setPage}
  />
) : null}
```

#### origin/main
```tsx
{trashQuery.data && (trashTotalPages > 1 || page > 1) ? (
  <Pagination
    page={page}
    totalCount={trashQuery.data?.totalCount}
    totalPages={trashTotalPages}
    onPageChange={setPage}
  />
) : null}
```

#### 해결 방법: **origin 버전 채택**

```bash
git checkout --theirs FE/user-web/src/features/trash/components/trash-screen.tsx
```

#### 이유
- origin 버전이 파일 전체적으로 더 완성된 구조 (유형 필터 사이드바, 다양한 TrashTargetType 등)
- `totalCount` prop 전달은 Pagination 개선(1번 파일)과 일관성 유지
- HEAD의 `totalPages`는 지역 변수(`Math.ceil(...)`)였으나 origin의 `trashTotalPages`가 동일한 역할

---

## 해결 결과

| 파일 | 채택 버전 | 방법 |
|------|----------|------|
| `pagination.tsx` | origin | `git checkout --theirs` |
| `deal-pipeline-home-screen.tsx` | HEAD + origin 수동 병합 | 직접 Edit |
| `company-list-screen.tsx` | HEAD | `git checkout --ours` |
| `contact-list-screen.tsx` | HEAD | `git checkout --ours` |
| `meeting-note-list-screen.tsx` | origin | `git checkout --theirs` |
| `trash-screen.tsx` | origin | `git checkout --theirs` |
| `app-shell.tsx` | HEAD | 충돌 마커 없음, 이미 정상 |

## 후속 확인 사항

- [ ] `meeting-note-list-screen.tsx`가 origin 버전으로 교체됨에 따라 `app-shell.tsx`의 `isMeetingNoteListPage` / `hideTopBar` 조건 재검토
- [ ] company-list-screen, contact-list-screen의 `hideTopBar` 조건이 app-shell에서 올바르게 유지되는지 브라우저에서 확인
