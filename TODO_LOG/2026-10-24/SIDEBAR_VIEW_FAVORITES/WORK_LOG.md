# 사이드바 View 즐겨찾기 조회·Frontend 연동 작업 로그

- 일자: 2026-10-24
- 상태: 구현 완료. 실제 DB 검증은 로컬 테스트 DB 미가동으로 미확인
- 계획: [완료 문서](../../../TODO/DONE/SIDEBAR_VIEW_FAVORITES_PLAN/README.md)
- 시작 상태: 변경 없는 main, origin/main보다 커밋 4개 앞섬

## 1. 사용자 확정 범위

Object/List 조회 구조를 참고해 즐겨찾기 조회 GET API 1개를 추가하고 공통 사이드바 UI에 연결한다. 응답은 id(즐겨찾기 ID), viewDefinitionId(View ID), name, icon 4개 필드다. type과 Object/List 소속 ID는 반환하지 않는다.

즐겨찾기 등록·해제·순서 변경, View 상세 API/화면, DB schema/migration/seed와 커밋은 제외한다. 클릭 후 View 상세 조회는 후속 API/화면 작업이므로 이번에는 실제 조회·표시와 View ID 보존까지 구현한다.

## 2. 기준과 구현 판단

- AGENTS.md, BE/AGENTS.md, Backend/Front Agent 규칙과 리뷰 체크리스트
- 기존 Object/List Controller·UseCase·Query Port·Prisma Repository, 공통 SidebarDataSection
- DB_SCHEMA의 현재 View 기반과 module ownership 기준
- API 계약을 먼저 confirmed로 작성한다. 사용자가 최소 응답과 실제 구현을 승인했다.
- 새 view-definition 모듈이 ViewDefinition/ViewFavoriteDefinition의 즐겨찾기 읽기 책임을 맡는다. Workspace 정보는 기존 공개 Port를 사용한다.
- WorkspaceAccessQuery.getWorkspaceMemberAccess에서 멤버 ID를 구한다. Actor 유무를 조회 조건에 추가하지 않는다.
- 조회는 Workspace·현재 멤버·연결 View의 Workspace를 제한하고 sortOrder/createdAt/id 오름차순으로 정렬한다.

## 3. 구현 결과

- Backend: view-definition 조회 모듈과 AppModule 등록, 소유권·HTTP·저장소 검증
- Frontend: view-favorite 단수형 feature, AppShell Query, SidebarNav의 공통 SidebarDataSection 연결
- 공통 API 계약·FE/BE 범위·검토 기록과 관련 상태 문서
- E2E Mock과 즐겨찾기 표시/상태/Workspace 전환 검증

GET /api/users/me/sidebar/workspaces/:workspaceId/view-favorites를 등록했다. ViewFavoriteDefinition과 연결 ViewDefinition을 개인·Workspace 범위로 조회해 4개 필드만 반환한다. Frontend는 view-favorite feature → AppShell → SidebarNav → 기존 SidebarDataSection으로 연결했다. 세 영역은 같은 Skeleton/목록/행/아이콘/접힘/추가 버튼 표시 조건을 사용한다.

View 상세 API·route가 없으므로 클릭 이동, 등록·해제, 헤더 로컬 별표 동기화는 구현하지 않았다. schema/migration/seed, 환경 파일, 실행 중인 사용자 개발 서버는 변경하지 않았다. 커밋은 하지 않았다.

## 4. 검증

- Node 24 / pnpm 8.14.1로 실행했다.
- BE typecheck, lint, build: 통과.
- Prisma validate: 통과. 기존 List SetNull 경고 4개 유지.
- BE 기본 테스트: 47 suite·231개 통과, 새 저장소 테스트 1개가 localhost:5432 연결 불가로 실패했다. .env의 TEST_DATABASE_URL이 지정돼 있으나 테스트 DB와 Docker daemon이 실행 중이지 않았다. 다른 DB로 대체하거나 연결 실패를 성공 처리하지 않았다.
- BE TEST_DATABASE_URL="" 테스트: 44 suite·218개 통과, DB 테스트 4 suite·14개 skip. 생략한 실제 DB 검증을 성공으로 계산하지 않는다.
- 신규 UseCase/HTTP 테스트 10개: 인증 사용자 멤버 도출·Actor 불필요·비멤버 차단·빈 배열·AuthGuard·UUID·응답·404·클라이언트 멤버 ID 무시 통과.
- User Web typecheck, lint, build: 통과. 기존 500kB chunk 경고 유지.
- User Web 단위 테스트: 10개 파일·33개 통과.
- Playwright: 즐겨찾기 4개·기존 업무 목록 4개 통과. 헤더는 최초 소스 파일 URL을 API 요청으로 오인해 실패했고, /api/ 경로만 감시하도록 수정한 뒤 해당 1개 재실행 통과. 관련 고유 시나리오 총 9개 통과.
- API 계약은 구현 전에 confirmed로 작성했고, 구현 후 implemented로 갱신했다. Backend/Frontend 리뷰와 DB 소유권·현황 문서를 갱신하고 계획을 TODO/DONE으로 보관했다.
- 최종 git diff --check, 신규 소스 공백 검사와 완료 계획 Markdown 상대 링크 검사: 통과. 헤더 테스트 수정 후 해당 파일 lint도 통과했다.

## 5. 남은 검증과 후속 범위

실제 DB의 개인·Workspace·연결 View 격리와 정렬 rollback 테스트는 준비한 TEST_DATABASE_URL의 DB를 기동한 뒤 다시 실행해야 한다. 이번 연결 실패와 DB 비활성화 결과를 구분해 기록했다. 즐겨찾기 등록·해제·정렬 저장과 View 상세 이동은 후속 기능 범위다.
