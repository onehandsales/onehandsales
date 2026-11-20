# 웹 프론트엔드 규칙의 근거

조회일: 2026-11-20 KST. 아래 공식 자료의 관련 설명을 조회하여 개발 규칙에 반영했다. 라이브러리 전체 문서 검토나 현재 앱의 준수 검증을 뜻하지 않는다.

## 1. 공식 기술 문서

| 자료 | 직접 대조한 범위 | 적용 문서 |
| --- | --- | --- |
| [React: Thinking in React](https://react.dev/learn/thinking-in-react) | 컴포넌트 계층과 데이터 흐름 | [컴포넌트](CONVENTION/COMPONENT_DESIGN.md) |
| [React: Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) | 중복·계산 가능한 state 방지 | [상태](ARCHITECTURE/STATE_AND_DATA.md) |
| [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) | 이벤트 처리와 외부 동기화의 구분 | [컴포넌트](CONVENTION/COMPONENT_DESIGN.md) |
| [TanStack Query v5: Query Keys](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys) | 조회 조건과 캐시 식별자 | [상태](ARCHITECTURE/STATE_AND_DATA.md) |
| [TanStack Query v5: Query Cancellation](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation) | AbortSignal 전달과 취소 | [상태](ARCHITECTURE/STATE_AND_DATA.md) |
| [React Router 7: useSearchParams](https://reactrouter.com/7.18.6/api/hooks/useSearchParams) | URL 상태 갱신과 navigation | [상태](ARCHITECTURE/STATE_AND_DATA.md) |
| [WAI-ARIA APG: Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | 모달의 키보드·포커스·이름 | [웹 규칙](CONVENTION/WEB_ACCESSIBILITY_AND_LAYOUT.md) |
| [WCAG 2.2: Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | 확대·좁은 폭·2차원 배치 예외 | [웹 규칙](CONVENTION/WEB_ACCESSIBILITY_AND_LAYOUT.md) |
| [Playwright: Best Practices](https://playwright.dev/docs/best-practices) | 사용자 관점 검증·격리·locator·자동 대기 | [테스트](ARCHITECTURE/TESTING.md) |
| [Vite 7: Env Variables and Modes](https://v7.vite.dev/guide/env-and-mode) | 브라우저 번들에 노출되는 환경 값 | [User Web 규칙](CONVENTION/FRONTEND_USER_WEB.md) |

React Router와 Vite는 현재 저장소의 major에 맞춘 문서를 사용했다. 다른 문서는 조회 당시 공개 문서이며 설치된 정확한 minor/patch와 동일함을 보장하지 않는다. 실제 의존성 변경 시 lockfile과 해당 버전 문서를 다시 확인한다.

## 2. 저장소에서 확인한 근거

2026-11-20에 다음 파일의 선언과 설정을 확인했다. 이 기록은 명령 실행 결과가 아니다.

- [User Web package.json](../../../FE/user-web/package.json): React 19, Router 7, Vite 7, TanStack Query 5, RHF 7, Zod 4, Tailwind 3 및 검증 script.
- [Admin Web package.json](../../../FE/admin-web/package.json): React·Router·Vite·Tailwind와 독립 검증 script. User Web의 query/form/unit-test 의존성이 그대로 설치된 것은 아니다.
- [TypeScript 설정](../../../FE/user-web/tsconfig.app.json): strict·미사용 검사·인덱스 접근 검사.
- [Vitest 설정](../../../FE/user-web/vitest.config.ts): jsdom과 테스트 파일 범위.
- [Playwright 기본 설정](../../../FE/user-web/playwright.config.ts), [브라우저 QA 설정](../../../FE/user-web/playwright.release-qa.config.ts): 실제 프로젝트와 viewport 구성.
- [앱 provider](../../../FE/user-web/src/app/providers/app-providers.tsx): 실제 인증 provider가 포함된 현재 조립 구조.
- [API client](../../../FE/user-web/src/lib/api-client.ts): 기존 실제 요청 경로. 신규 mock 경계 구현 증거로 사용하지 않는다.

## 3. 제품 근거와 기술 규칙의 구분

Bonsai 제품 기능은 [PM 036](../../PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md)과 [UX 025](../../UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md)에 따라 검토한다. 이번 문서 개정에서 Bonsai 계정 재현이나 Gummble 전체 재검토를 수행한 것은 아니다.

폴더 경계·한글 주석·mock 우선·리뷰 항목은 프로젝트의 개발 규칙이다. 공식 React 문서가 특정 폴더명·주석 형식·Bonsai 업무 정책을 의무화한다고 해석하지 않는다.
