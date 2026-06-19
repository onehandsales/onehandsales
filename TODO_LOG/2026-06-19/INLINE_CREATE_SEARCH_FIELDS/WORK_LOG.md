# 입력 검색형 생성 필드 작업 로그

## 작업 배경
- 회사 추가 모달의 분야/지역, 담당자 추가 모달의 회사/직급/부서, 제품 추가 모달의 카테고리/상태 선택 방식을 딜 추가 모달처럼 입력 검색 기반으로 맞춘다.
- 검색 결과가 없을 때 별도 관리 화면으로 이동하지 않고 현재 입력값으로 바로 새 항목을 추가하고 선택할 수 있게 한다.

## 진행 상황
- 2026-06-19: 기존 딜 추가 모달의 검색 선택 패턴과 회사/담당자/제품 생성 mutation 반환 형태를 확인했다.
- 2026-06-19: 공용 분류 드롭다운과 각 생성 모달의 변경 지점을 확정했다.
- 2026-06-19: 회사 분야/지역, 담당자 부서/직급, 제품 카테고리/상태를 검색 입력형 선택 + 없을 때 즉시 추가 방식으로 변경했다.
- 2026-06-19: 담당자 회사 검색 결과가 없을 때 회사 생성 모달을 열고, 생성 후 담당자 회사 옵션을 다시 조회해 자동 선택하도록 연결했다.

## 검증
- `pnpm --dir FE/user-web exec eslint src/components/ui/managed-taxonomy-dropdown.tsx src/features/company/components/company-create-dialog.tsx src/features/contact/components/contact-company-field.tsx src/features/contact/components/contact-create-dialog.tsx src/features/product/components/product-create-dialog.tsx`
- `pnpm --dir FE/user-web typecheck`
- `git diff --check`
