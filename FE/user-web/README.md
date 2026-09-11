# User Web

`FE/user-web`은 로그인 이후 `/app` 업무 화면과 로그인 전 공개 페이지를 함께 제공하는 React/Vite 앱이다.

## 활성 업무 범위

- `/app` 홈
- 빈 `/app` 홈과 계정 설정 모달
- 오류 신고와 지원 문의
- 계정 모달 기반 프로필/기기/세션 관리

## 주요 명령

- `pnpm dev`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`
- `pnpm test:e2e:mobile`
- `pnpm test:e2e:browsers`

로그인 이후 활성 화면은 `/app`, `/app/more`다. Contact/Product/Deal의 `/app/*` 경로는 현재 `/app`으로 redirect한다. 공개 페이지는 locale 기반 라우팅을 유지한다.

고정형 회사 목록/생성/상세/수정 화면과 회사 검색은 OneHand CRM 방향 전환에 맞춰 제거했다. 다음 CRM 코어는 동적 Object/Attribute/Record 기반 화면으로 다시 추가한다.
