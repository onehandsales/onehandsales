# onehand.sales QA 체크리스트

현재 QA 범위는 로그인 이후 핵심 CRM, 계정, 검색, 휴지통, 제품 분석, 지원 접수, 관리자 권한 확인이다.

## 자동 점검

- BE: `pnpm prisma:validate`, `pnpm prisma:generate`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`
- FE/user-web: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, `pnpm test:e2e:mobile`, `pnpm test:e2e:browsers`, `pnpm test:e2e:analytics`
- FE/admin-web: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:e2e`

## 수동 QA 범위

- 로그인, refresh, logout, 권한 없는 API 차단
- `/app` 홈 로딩과 주요 지표 표시
- 회사/담당자/제품/딜 목록, 검색, 필터, 정렬, 페이지네이션
- 회사/담당자/제품/딜 생성, 상세, 수정, 삭제, 복구
- 회사/담당자/제품/딜 xlsx export
- 딜 다음 행동, 메모, 활동 로그 생성/수정/삭제
- 통합검색 결과와 상세 이동
- 휴지통 목록, 미리보기, 복구 기간 정책
- 제품 분석 이벤트 수집 실패가 사용자 업무를 막지 않는지 확인
- 오류 신고와 지원 문의 접수
- 계정 모달의 프로필, 로그인 기기, 세션 관리
- 관리자 화면은 access token 입력 후 `/admin/api/me` 확인만 검증

## 최종 완료 기준

- 자동 점검이 통과한다.
- 핵심 도메인의 생성/조회/수정/삭제/복구가 같은 계정 소유권 안에서만 동작한다.
- 삭제된 기능의 route, API, DB schema, 사용자 화면 참조가 남아 있지 않다.
- 문서에는 현재 코드에서 제공하는 기능만 운영 범위로 남긴다.
