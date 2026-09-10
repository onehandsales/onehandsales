# User Web

`FE/user-web`은 로그인 이후 `/app` 업무 화면과 로그인 전 공개 페이지를 함께 제공하는 React/Vite 앱이다.

## 활성 업무 범위

- `/app` 홈
- 회사 목록/생성/상세/수정
- 회사 메모와 개인 비밀 메모
- 회사 xlsx export
- 통합검색
- 휴지통 목록/상세/복구
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

로그인 이후 활성 화면은 `/app`, `/app/companies`, `/app/companies/new`, `/app/companies/new/full`, `/app/companies/:companyId`, `/app/trash`, `/app/more`다. Contact/Product/Deal의 `/app/*` 경로는 현재 `/app`으로 redirect한다. 공개 페이지는 locale 기반 라우팅을 유지한다.
