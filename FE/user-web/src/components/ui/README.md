# UI 기본 컴포넌트

user-web의 범용 shadcn-style primitive를 이곳에 둔다.

예시:

- `button.tsx`
- `input.tsx`
- `dialog.tsx`
- `badge.tsx`
- `table.tsx`

비즈니스 기능에 특화된 component는 `src/features/<feature>/components`에 둔다.

## 현재 확정된 공용 문법

- `button.tsx`
  - `Button`: variant(primary/secondary/danger/ghost), size(md/sm/lg/icon), isPending(spinner) 지원
- `badge.tsx`
  - `Badge`: variant(success/warning/danger/neutral/info/primary), size(md/sm) 지원
- `filter-chip.tsx`
  - `FilterChip`: 선택/미선택 상태 토글 chip
  - `FilterChipGroup`: chip 묶음 래퍼
- `search-input.tsx`
  - `SearchInput`: onSubmit 제공 시 form 래퍼 포함, 검색 아이콘 내장
- `pagination.tsx`
  - `Pagination`: page X/Y 표시, 이전/다음 버튼, 첫/마지막 경계 비활성화
- `section-header.tsx`
  - `SectionHeader`: 섹션 title, description, 선택적 action 슬롯
- `page-header.tsx`
  - `PageHeader`: 페이지 title, description, actions 슬롯, 선택적 backHref/backLabel 링크
- `toast.tsx`
  - `Toast`: variant(success/error/info), 3초 자동 닫힘
  - `useToast`: showToast(message, variant) hook
- `modal-shell.tsx`
  - `ModalShell`은 overlay, dialog panel, header, body, footer를 담당한다.
  - 생성/수정 폼은 modal body에 `<form id="...">`를 두고 footer submit 버튼은 `form` 속성으로 연결한다.
  - 로그인 모달, 딜 빠른등록, company/contact/product 생성 모달은 이 문법을 기준으로 한다.
- `modal-form.tsx`
  - Quick Create 계열 모달 내부 폼 문법을 담당한다.
  - `ModalFormSection`, `ModalSectionHeader`, `ModalFormRow`, `ModalFieldGroup`으로 섹션/행/필드 묶음을 고정한다.
  - `ModalInlineCreateArea`는 딜 빠른등록의 인라인 거래처/제품 생성 영역에 사용한다.
  - `ModalAdvancedSection`은 접을 수 있는 고급 옵션 영역을 담당한다.
  - `ModalFooterActions`는 생성 모달 footer의 취소/저장 action 문법을 담당한다.
- `state.tsx`
  - `LoadingState`: 도메인 공용 로딩 상태
  - `EmptyState`: 도메인 공용 빈 상태
  - `ErrorState`: 도메인 공용 오류 상태
  - `SuccessToast`: 도메인 공용 성공 피드백
