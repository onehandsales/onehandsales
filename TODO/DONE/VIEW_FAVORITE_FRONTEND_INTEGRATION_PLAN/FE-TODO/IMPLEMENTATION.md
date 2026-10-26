# 구현·검증

먼저 [TODO Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Front 규칙](../../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [소비 계약](../COMMON/API-SPEC/README.md)을 따른다. 아래 구현을 완료했다.

- view-favorite: API client·response type·공개 index. 기존 인증 client와 sidebar key 재사용.
- crm-view: mutation 전용 hook·Query key header prefix·헤더 모델. 사용자/Workspace/View별 결과 적용, 기존 선택 유지, 중복 차단, 현재 scope 오류만 표시.
- WorkspaceViewHeader: 공통 접근 가능한 별표 버튼·로딩/오류/빈 상태·현지화. AppShell은 개인 목록 갱신 시각만 추가 전달한다.
- 규칙: feature 공개 진입점 사용, TypeScript strict/no any, 함수·hook·handler·client 한국어 기능 주석과 중요 상태/캐시 흐름의 번호 주석. 직접 console/민감 로그 없음.

검증 완료: client method/path/무입력 계약·실패 전파 단위 검사, 브라우저 Object/List 초기·선택 View 등록/해제·재요청·pending 중복·실패/404/401 refresh·늦은 응답/Workspace 격리·빈/미확인·키보드·반응형·기존 헤더/사이드바·핵심 화면 회귀. Node 24 typecheck/lint/test/build와 관련 Playwright를 통과했다. 자동 브라우저는 API를 mock해 업무 DB에 쓰지 않았다.

G99 결과는 [검증·검토](TEST-AND-REVIEW.md)에 기록하고 DONE 보관했다. 배포·커밋은 별도 명시 요청에서 진행한다.
