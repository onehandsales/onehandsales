# G34 User Web Smoke E2E 작업 로그

## 목표

- User Web의 개인 영업자 핵심 업무 흐름을 Playwright smoke E2E로 보호한다.
- 로그인 또는 mock login, 회사 생성, 거래처 생성, 제품 생성, 딜 생성, 딜 단계 변경, 일정 생성, 회의록 저장을 한 시나리오에서 검증한다.

## 참고 문서

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P6-G33-G36-TEST-RELEASE.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/TESTING.md`

## 구현 내용

- User Web에 memory 기반 mock login과 protected route guard를 추가한다.
- User Web 전용 Playwright 설정을 추가한다.
- 외부 Provider와 Backend 서버 호출 없이 Playwright route mock으로 Company, Contact, Product, Deal, Schedule, MeetingNote API를 검증한다.

## 검토 메모

- App access token은 기존 결정대로 storage에 저장하지 않고 memory에만 둔다.
- 실제 Supabase provider login은 G34 범위에서 제외하고, smoke 안정성을 위해 mock login만 사용한다.
- E2E mock은 생성 API 응답과 목록 재조회 상태를 모두 갱신해 화면 회귀를 잡을 수 있게 한다.
- Playwright route mock은 `/src/features/*/api/*` Vite module 요청을 가로채면 앱이 빈 화면이 되므로, 실제 Backend API path인 `/api/` prefix만 intercept하도록 제한했다.
- 기존 5173 dev server stale 상태와 섞이지 않도록 E2E webServer는 5175 포트를 사용한다.

## 검증 결과

- `cd FE/user-web && pnpm run typecheck` 통과
- `cd FE/user-web && pnpm run lint` 통과
- `cd FE/user-web && pnpm run build` 통과
- `cd FE/user-web && pnpm exec playwright test tests/e2e/user-web-smoke.spec.ts` 통과
- `cd FE/user-web && pnpm run test:e2e` 통과
