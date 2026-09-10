# User Web

`FE/user-web`은 로그인 이후 `/app` 업무 화면과 로그인 전 공개 페이지를 함께 제공하는 React/Vite 앱이다.

## 활성 업무 범위

- `/app` 홈
- 회사, 담당자, 제품, 딜 목록/생성/상세/수정
- 딜 다음 행동, 메모, 활동 로그
- 회사/담당자/제품/딜 도메인별 xlsx export
- 통합검색
- 휴지통 목록/상세/복구
- 제품 분석 이벤트 수집
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
- `pnpm test:e2e:analytics`

로그인 이후 화면은 `/app/*` 아래에 있고, 공개 페이지는 기존 라우팅을 유지한다.
