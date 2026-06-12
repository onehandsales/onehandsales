# Modal State UI Foundation

## 작업명

공통 ModalShell 및 도메인 공용 상태 UI 정리

## 작업 일자

2026-06-12

## 관련 계획과 goal

- `UX Design/PEN_UI_01_FRONTEND_PLAN.md`
- `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`

## 예정 범위

- 로그인 모달 공통 문법 적용
- 딜 빠른등록 모달 공통 문법 적용
- company/contact/product 생성 모달 공통 문법 적용
- `LoadingState`, `EmptyState`, `ErrorState`, `SuccessToast` primitive 확정

## 진행 기록

- `ModalShell`을 추가해 overlay, panel, header, scroll body, footer, close button 문법을 통합했다.
- modal 내부 form은 body에 두고 footer submit 버튼은 `form` 속성으로 연결하는 패턴으로 확정했다.
- 로그인 모달, 딜 빠른등록 모달, company/contact/product 생성 모달을 `ModalShell` 기반으로 전환했다.
- `ErrorState`를 생성 모달 오류 표시에 적용했다.
- `SuccessToast`를 company 목록/상세 성공 피드백에 적용했다.
- `LoadingState`, `EmptyState`, `ErrorState`, `SuccessToast`를 `components/ui/state.tsx`에 추가했다.

## 적용 범위 또는 변경 파일

- `FE/user-web/src/components/ui/modal-shell.tsx`
- `FE/user-web/src/components/ui/state.tsx`
- `FE/user-web/src/components/ui/README.md`
- `FE/user-web/src/features/auth/components/auth-login-modal.tsx`
- `FE/user-web/src/features/auth/components/auth-landing-page.tsx`
- `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
- `FE/user-web/src/features/company/components/company-create-dialog.tsx`
- `FE/user-web/src/features/company/components/company-list-screen.tsx`
- `FE/user-web/src/features/company/components/company-detail-screen.tsx`
- `FE/user-web/src/features/contact/components/contact-create-dialog.tsx`
- `FE/user-web/src/features/product/components/product-create-dialog.tsx`
- `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`

## 검증 결과

- `pnpm --dir FE/user-web run typecheck`: 통과
- `pnpm --dir FE/user-web run lint`: 통과
- `pnpm --dir FE/user-web run build`: 통과

참고:

- 로컬 Node는 `v20.20.2`이고 프로젝트 요구사항은 `>=24 <25`라 pnpm engine warning이 표시됐다.
- Vite build에서 500kB 초과 chunk warning이 표시됐지만 build는 성공했다.

## 검토 결과

- 빠른등록 모달이 이후 생성 모달의 기준 shell 문법이 됐다.
- 도메인별 생성 모달은 overlay/header/footer 중복을 직접 구현하지 않는다.
- 상태 UI primitive는 추가됐지만 모든 화면의 Loading/Empty/Error 치환은 아직 일괄 완료하지 않았다.

## 남은 리스크 또는 보류 사항

- focus trap, ESC close, body scroll lock은 아직 구현하지 않았다.
- Loading/Empty/ErrorState는 company 외 다른 목록/상세 화면에 점진 적용이 필요하다.

## 다음 권장 작업

- Quick Create 내부 field group, inline create panel, 고급 옵션 구조를 더 명확한 하위 컴포넌트로 분리한다.
- company/contact/product 생성 폼의 field group 문법을 Quick Create 기준으로 맞춘다.

## 전체 작업 진행 현황

- 상태: 완료
- 커밋 가능 여부: 검증 통과, `git diff --check` 통과
