# UI 기본 컴포넌트

user-web의 범용 shadcn-style primitive를 이곳에 둔다.

예시:

- `button.tsx`
- `search-input.tsx`
- `confirm-dialog.tsx`
- `badge.tsx`
- `list-table-header-cell.tsx`

비즈니스 기능에 특화된 component는 `src/features/<feature>/components`에 둔다.

## 현재 구현된 공용 문법

아래는 기존 primitive의 사용 계약이다. Bonsai 화면의 생성 방식·배치·표현을 확정하는 UX 규칙은 아니다. 새 화면은 [UX 025](../../../../../AGENT/UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md)와 Gummble/공식 문서에서 확인한 상호작용에 맞춰 조합하거나 수정한다.

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
  - `Pagination`: page X/Y 표시, 이전/다음 버튼, 단순한 목록 하단 페이지 이동
- `section-header.tsx`
  - `SectionHeader`: 섹션 title, description, 선택적 action 슬롯
- `page-header.tsx`
  - `PageHeader`: 페이지 title, description, actions 슬롯, 선택적 backHref/backLabel 링크
- `toast.tsx`
  - `Toast`: variant(success/error/info), 메시지·설명·닫기 콜백 지원
- `use-toast.tsx`
  - `useToast`: `{ toast, dismiss, node }` 반환. `toast({ message, variant, description, duration })`으로 표시하며 기본 3초 후 닫힌다.
- `modal-shell.tsx`
  - `ModalShell`은 overlay, dialog panel, header, body, footer를 담당한다.
  - 생성/수정 폼은 modal body에 `<form id="...">`를 두고 footer submit 버튼은 `form` 속성으로 연결한다.
  - 현재 로그인 모달에서 사용한다. 예전 고정형 회사 생성/수정 화면은 제거되었으며, 새 Bonsai 생성 UX를 모달로 미리 고정하지 않는다.
- `modal-form.tsx`
  - Quick Create 계열 모달 내부 폼 문법을 담당한다.
  - `ModalFormSection`, `ModalSectionHeader`, `ModalFormRow`, `ModalFieldGroup`으로 섹션/행/필드 묶음을 고정한다.
  - `ModalInlineCreateArea`는 현재 활성 화면에서 쓰지 않는다. 후속 inline option/entity 생성이 열릴 때 사용한다.
  - `ModalAdvancedSection`은 접을 수 있는 고급 옵션 영역을 담당한다.
  - `ModalFooterActions`는 생성 모달 footer의 취소/저장 action 문법을 담당한다.
- `state.tsx`
  - `LoadingState`: 도메인 공용 로딩 상태
  - `EmptyState`: 도메인 공용 빈 상태
  - `ListEmptyState`: 목록 테이블/카드 내부에서 쓰는 빈 상태
  - `ErrorState`: 도메인 공용 오류 상태
  - `SuccessToast`: 도메인 공용 성공 피드백
