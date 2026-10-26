# View 즐겨찾기 Frontend 연결

- 일자: 2026-10-26
- 상태: Frontend 구현·검증·G99 규칙 검토 완료
- 기준: [TODO Software 정본](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Front Agent](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [Notion·Attio UX](../../../AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md)
- [작업 로그](../../../TODO_LOG/2026-10-26/VIEW_FAVORITE_FRONTEND_INTEGRATION/WORK_LOG.md), [소비 계약](COMMON/API-SPEC/README.md), [구현](FE-TODO/IMPLEMENTATION.md), [검증·G99](FE-TODO/TEST-AND-REVIEW.md)

공통 View 헤더의 별표를 실제 등록/해제 버튼으로 연결한다. 기존 AppShell의 단일 모델을 두 반응형 헤더가 공유한다. view-favorite feature는 POST/DELETE client와 응답 타입·개인 목록 key를 공개하고, crm-view hook이 현재 View·헤더와 개인 사이드바 갱신을 조합한다.

API 요청 중 같은 동작을 중복 전송하지 않는다. 낙관적 변경 없이 성공 응답을 표시하고 관련 조회를 invalidate한다. 초기 View와 드롭다운에서 고른 View 모두 지원한다. View 없음·상태 미확인·권한/대상 부재는 쓰기를 막고, 실패는 안전한 현지화 문구로 안내한다. 성공 응답이 늦게 와도 요청 당시 사용자·Workspace·View 캐시에만 적용한다. 화면 선택과 서버 목록 순서는 보존한다.

G01 규칙·계약 확인 → G02 client/hook/공통 버튼 → G03 단위·브라우저·typecheck/lint/build → G99 Front 규칙·UX·문서 검토 후 DONE 보관. 단계 공통 제외는 Backend·DB·환경 파일·사용자 서버·Admin Web이다. 최초 구현에서 제외한 커밋은 후속 사용자 명시 요청에 따라 진행한다. 즐겨찾기 행 클릭 이동·순서 변경·보기 생성/저장·본문은 후속 범위다.

## 완료 결과

Node 24.21.0에서 typecheck/lint/build와 단위 전체 13 files/58 tests, Chromium 관련 E2E 33건이 모두 통과했다. 신규 검사는 client/실제 React·QueryClient 단위 17건과 브라우저 13건이다. Object/List 초기·비초기 View의 추가/해제, 200 재요청, 중복 차단, 실패/404/401 refresh, 늦은 응답·Workspace 전환, 서버 순서·조회 갱신, 키보드·360~1440px 반응형을 확인했다.

G99에서 공개 feature 경계·인증 client·사용자/Workspace/View 캐시·현지화·기능/번호 주석·UI 상태·범위를 검토했다. 자동 브라우저는 mock API만 사용했다. 사용자의 Front/Admin/Backend 서버는 HTTP 200으로 유지됐으며 환경 파일과 업무 DB에 쓰지 않았다. 후속 사용자의 커밋 요청에서 동일 검증 결과와 변경 범위를 다시 확인했다.
