# Quick Create Form Grammar

## 목표

- `ModalShell` 위에서 Quick Create 계열 모달 내부 폼 문법을 공통화한다.
- pen 빠른등록 모달 구조를 기준으로 deal/company/contact/product 생성 모달이 같은 계열로 보이게 정리한다.
- 기존 데이터 로직은 유지하고 UI 구조만 조정한다.

## 변경 요약

- `FE/user-web/src/components/ui/modal-form.tsx` 추가
  - `ModalForm`
  - `ModalFormSection`
  - `ModalSectionHeader`
  - `ModalFormRow`
  - `ModalFieldGroup`
  - `ModalHelperText`
  - `ModalErrorText`
  - `ModalInlineCreateArea`
  - `ModalAdvancedSection`
  - `ModalFooterActions`
- Deal Quick Create Modal
  - 기본 정보, 연결 대상, 진행 상태, 고급 옵션 섹션으로 재구성
  - 인라인 담당자/제품 생성 영역을 `ModalInlineCreateArea`로 대체
  - helper/error text 위치를 `ModalFieldGroup` 기준으로 정리
- Company Create Modal
  - 회사 기본 정보, 첫 메모 섹션으로 재구성
  - footer action을 `ModalFooterActions`로 대체
- Contact Create Modal
  - 담당자 기본 정보, 상세 정보, 첫 메모 섹션으로 재구성
  - 기존 회사 검색 컴포넌트는 데이터 로직 보존을 위해 유지
- Product Create Modal
  - 제품 기본 정보, 설명, 첫 메모 섹션으로 재구성
  - 3열 가격 row는 `ModalFormRow` 기준으로 정리

## 남긴 차이점

- `ContactCompanyField`는 자체 검색/선택 로직이 있어 이번 단계에서 내부까지 분해하지 않았다.
- Deal Quick Create만 인라인 담당자/제품 생성과 고급 옵션을 가진다.
- 실제 focus trap, ESC close 등 modal interaction 보강은 별도 작업으로 남긴다.

## 검증

- `pnpm --dir FE/user-web run typecheck`: 통과
- `pnpm --dir FE/user-web run lint`: 통과
- `pnpm --dir FE/user-web run build`: 통과
- `git diff --check`: 통과

