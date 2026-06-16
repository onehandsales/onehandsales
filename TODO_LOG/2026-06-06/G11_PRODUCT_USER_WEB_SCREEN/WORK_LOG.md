# G11 Product User Web 화면 작업 로그

## 작업 상태

- 상태: 완료
- 작업 일자: 2026-06-06
- 관련 goal: `G11. Product User Web 화면`
- 관련 문서:
  - `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P1-G05-G11-CORE-DATA.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
  - `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
  - `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
  - `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
  - `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
  - `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`

## 요청 내용

- G11 Product User Web 화면을 구현한다.
- 작업 진행과 완료 결과를 `TODO_LOG`에 기록한다.

## 예정 범위

- 제품 목록 화면
- 제품 빠른 등록 modal
- 제품 상세/수정 화면
- 제품 연결 관리 UI
- ProductLog 작성/조회 UI
- `src/lib/api-client.ts` 기반 Product API 연동
- loading, error, empty, success 상태
- 모바일/데스크톱 반응형 확인

## 진행 기록

- 2026-06-06: 작업 로그 문서 생성
- 2026-06-06: Product list/detail route와 feature 구조 분석
- 2026-06-06: Product 응답에 `connectionCount`를 추가해 목록 연결 수 표시 지원
- 2026-06-06: Product API, query key, hook, schema, type 추가
- 2026-06-06: 제품 목록, 빠른 등록 modal, 상세/수정 화면 구현
- 2026-06-06: ProductConnection 회사/담당자 연결 생성/삭제 UI 구현
- 2026-06-06: ProductLog 생성/수정/삭제 UI 구현
- 2026-06-06: typecheck, lint, build, route smoke 검증 수행

## 검증 결과

- FE `pnpm run typecheck`: 통과
- FE `pnpm run lint`: 통과
- FE `pnpm run build`: 통과
  - Vite build 통과
  - 500kB chunk warning은 기존 앱 번들 크기 경고이며 build 실패 아님
- BE `pnpm exec tsc --noEmit`: 통과
- BE `pnpm exec jest --runInBand BE/src/modules/product/application/use-cases/product.use-cases.spec.ts`: 통과
  - 1 suite, 8 tests
- BE `pnpm exec jest --runInBand`: 통과
  - 7 suites, 27 tests
- BE `pnpm run lint`: 통과
- BE `pnpm run build`: 통과
- 정적 경계 확인:
  - Product FE 범위에서 `fetch(` 직접 호출 없음
  - Product FE/BE 변경 범위에서 `any`, `console.`, `process.env` 문제 없음
- dev server route smoke:
  - `GET http://127.0.0.1:5173/products`: 200
  - `GET http://127.0.0.1:5173/products/test-product-id`: 200

## 검토 결과

- G11 요구사항 기준 제품 생성, 목록, 상세, 수정, 삭제 UI를 구현했다.
- 제품 단가는 `Intl.NumberFormat` 기반 KRW/통화 코드로 표시한다.
- 제품 연결 섹션은 Company/Contact 검색 선택과 연결 생성/삭제를 지원한다.
- Deal 연결은 G12 Deal Backend 전까지 선택 목록이 없어 UI에서 비활성 안내로 처리했다.
- ProductLog 영역은 별도 logs API를 호출해 생성/수정/삭제를 지원한다.
- Memo 기록은 G10 상세 API가 반환하는 `PersonalMemo(targetType=PRODUCT)` 복호화 결과를 표시한다.
- 페이지는 feature 조립 구조를 유지하고 Product API 호출은 `src/lib/api-client.ts` 경유로만 수행한다.
- User Web dev server는 `http://localhost:5173/`에서 실행 중이다.

## 남은 리스크 또는 보류 사항

- ProductConnection의 Deal target 검색/선택은 G12 Deal Backend와 Deal 목록 API 이후 연결해야 한다.
- Playwright E2E는 아직 작성된 시나리오가 없어 실행하지 않았다.

## 다음 권장 작업

- 다음 작업: `G12. Deal Backend vertical slice`
- 전체 진행 현황:
  - 완료: G00-G11, AGENT TODO_LOG 규칙 반영
  - 진행 필요: G12-G36
  - 다음 순서: G12 -> G13 -> G14 -> G15 -> G16 -> G17...
