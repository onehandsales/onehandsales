# User Web

`FE/user-web`은 로그인 이후 `/app` 업무 화면과 로그인 전 공개 페이지를 함께 제공하는 React/Vite 앱이다.

## 활성 업무 범위

- `/app` 홈
- 빈 `/app` 홈과 계정 설정 모달
- 오류 신고와 지원 문의
- 계정 모달 기반 프로필/기기/세션 관리

## 관리 대상 생성

관리 대상 추가는 기존 이름 → 아이콘/설명 단계를 유지한다. 생성 성공 후 사이드바를 갱신하고
응답의 `viewDefinitionId`에 해당하는 TABLE로 이동한다. 예를 들어 `매물`을 만들면 `전체 매물`의
빈 TABLE에 기본 `이름` 열이 표시된다. [구현 범위와 API 계약](../../TODO/DONE/OBJECT_TABLE_CREATE_PLAN/README.md)을 참고한다.

## 업무 목록 생성

사이드바 업무 목록 +는 이름·관리 항목·제목 정보 → 아이콘·설명·첫 보기 입력 모달을 연다.
표가 기본 선택이며 보드/목록도 선택할 수 있다. 보드는 기존 상태 또는 목록 전용 단계를 사용한다.
성공 시 원래 사용자/Workspace의 업무 목록을 갱신하고 새 View로 이동한다. 닫기·재열기·화면 전환
이후 늦은 응답의 이동과 중복 제출을 차단한다. [구현 범위와 계약](../../TODO/LIST_VIEW_CREATE_PLAN/README.md)을 따른다.

## 주요 명령

- `pnpm dev`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`
- `pnpm test:e2e:mobile`
- `pnpm test:e2e:browsers`

로그인 이후 활성 화면은 `/app`, `/app/more`다. 과거 `contact`/`product`/`deal`의 `/app/*` 경로와 legacy top-level 경로는 현재 `/app` 또는 `/app/more`로 redirect한다. 공개 페이지는 locale 기반 라우팅을 유지한다.

고정형 회사 목록/생성/상세/수정 화면과 회사 검색은 OneHand CRM 방향 전환에 맞춰 제거했다. 다음 CRM 코어는 Workspace/Kit/Object/Attribute/Relationship/Record/List/View 기반 화면으로 다시 추가한다.
