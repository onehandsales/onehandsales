# G13 Deal User Web 목록과 빠른 생성 작업 로그

## 작업 상태

- 상태: 완료
- 작업 일자: 2026-06-06
- 관련 goal: `G13. Deal User Web 목록과 빠른 생성`
- 관련 문서:
  - `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
  - `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
  - `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
  - `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`

## 요청 내용

- G13 Deal User Web 목록과 빠른 생성 작업을 진행한다.
- 작업 진행과 완료 결과를 `TODO_LOG`에 기록한다.

## 구현 범위

- `/deals` 실제 목록 화면 연결
- Deal 목록 API와 query hook 추가
- 단계 탭, 검색, 필터 구현
- 딜 row/card 표시 순서: 딜이름 -> 회사/담당자 -> 단계 -> 금액 -> 가능성 -> 다음 행동 -> 마감일
- 딜 빠른 등록 modal 구현
- 회사/담당자/제품 검색 combobox 구현
- 딜 생성 후 목록과 단계 summary 갱신

## 제외 범위

- G14 inline entity creation
- G15 상세 패널과 상세 페이지
- 일정/회의록 연결

## 진행 기록

- 2026-06-06: 작업 로그 문서 생성
- 2026-06-06: Deal feature API, query key, query/mutation hook, type, form schema 추가
- 2026-06-06: `/deals` 페이지를 placeholder에서 `DealListScreen`으로 교체
- 2026-06-06: 단계 탭, 검색, 가능성 필터, 다음 행동 필터, 삭제 포함 toggle 구현
- 2026-06-06: 딜 리스트 desktop row와 mobile card 구현
  - 표시 순서: 딜이름 -> 회사/담당자 -> 단계 -> 금액 -> 가능성 -> 다음 행동 -> 마감일
- 2026-06-06: 딜 빠른 등록 modal 구현
  - 필수 입력: 딜이름, 금액
  - 선택 입력: 회사, 담당자, 제품, 단계, 가능성, 다음 행동, 다음 행동 일시, 예상 종료일, 첫 메모
  - 회사/담당자/제품 검색 combobox
  - 제품은 `productIds` 배열에 맞춰 다중 선택 chip으로 처리
- 2026-06-06: 생성 성공 시 Deal list query invalidate로 목록과 stage summary 갱신
- 2026-06-06: 모바일 단계/가능성 badge 줄바꿈 방지 보정

## 검증 결과

- 통과: `pnpm run typecheck`
- 통과: `pnpm run lint`
- 통과: `pnpm run build`
  - 참고: Vite 단일 chunk 500kB 초과 경고가 있으나 build 실패는 아님
- 통과: `git diff --check`
- 통과: G13 Playwright smoke
  - backend: `http://127.0.0.1:3101`
  - user-web: `http://127.0.0.1:5175`
  - local Google Chrome 사용
  - 인증 헤더 주입 후 `/deals`에서 딜 빠른 생성 수행
  - 회사/담당자/제품 combobox 검색 선택 확인
  - 생성 후 목록 row 표시 확인
  - 리스트 헤더 순서 확인: `딜이름`, `회사/담당자`, `단계`, `금액`, `가능성`, `다음 행동`, `마감일`
  - desktop/mobile 스크린샷 확인
  - smoke 테스트 데이터 정리 완료
  - 임시 backend/Vite 서버 종료 완료

## 검토 결과

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`의 G13 완료 기준 충족
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`의 G13 포함/제외 범위 준수
- User Web feature 구조 준수
  - 페이지는 `DealListScreen` 조립만 담당
  - Deal API, hook, schema, type은 `features/deal` 내부에 배치
  - API 호출은 `src/lib/api-client.ts` 경유
  - 서버 상태는 TanStack Query 사용
- UX/UI 검토
  - 업무 도구형 조밀한 목록 레이아웃 유지
  - desktop/mobile에서 UI 요소 겹침 없음
  - mobile card의 단계 badge 줄바꿈 보정 완료

## 남은 리스크 또는 보류 사항

- G13 범위는 완료.
- 로그인/토큰 주입 UI는 아직 별도 Auth 목표 범위이므로 smoke test에서는 Playwright route로 인증 헤더를 주입했다.
- inline entity creation은 G14 범위로 남긴다.
- 딜 상세 패널/상세 페이지는 G15 범위로 남긴다.

## 다음 권장 작업

- G13 완료 후 `G14. Deal inline entity creation`

## 전체 작업 현황

- 완료: G06 Company Backend vertical slice
- 완료: G07 Company User Web
- 완료: G08 Contact Backend vertical slice
- 완료: G09 Contact User Web
- 완료: G10 Product Backend vertical slice
- 완료: G11 Product User Web
- 완료: G12 Deal Backend vertical slice
- 완료: G13 Deal User Web 목록과 빠른 생성
- 진행 필요: G14 Deal inline entity creation
- 진행 필요: G15 Deal 상세 패널과 상세 페이지
- 진행 필요: G16 Meeting Note Backend와 AI parsing stub
- 진행 필요: 이후 Meeting Note User Web 관련 goal
