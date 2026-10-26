# 공통 View 헤더 Frontend 연결

- 일자: 2026-10-26
- 상태: Frontend 연결·검증·G99 규칙 검토 완료
- 기준: [TODO Software 정본](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Front Agent](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [UX 기준](../../../AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md)
- [작업 로그](../../../TODO_LOG/2026-10-26/VIEW_HEADER_FRONTEND_INTEGRATION/WORK_LOG.md)

## 범위와 문서

Object/List 클릭 시 ③ 조회로 대상 이름·아이콘/현재 View/읽기 전용 별표를 표시한다. 드롭다운 오픈 시에만 ①/②를 조회하며 선택은 현재 화면 상태로 관리한다. 공통 crm-view feature와 헤더 컴포넌트를 만들고 기존 오른쪽 도구·Object 본문을 유지한다.

- [FE 소비 계약](COMMON/API-SPEC/VIEW_HEADER_FRONTEND_CONSUMPTION.md)
- [작업 순서](COMMON/GOAL-WORK-ORDER.md)
- [FE 구현·검토](FE-TODO/IMPLEMENTATION-AND-REVIEW.md)

Frontend 요청과 응답은 기존 API 정본을 그대로 사용한다. Backend·DB·Admin·환경 파일·서버·커밋을 변경하지 않는다. View 생성/저장·즐겨찾기 클릭/쓰기·타입별 본문 조회는 제외한다. List에는 헤더를 표시할 경로와 최소 화면만 연결한다. 완료 후 실제 검증 결과를 기록하고 DONE 보관한다.

## 완료 결과

crm-view의 공통 헤더와 단일 모델, 세 API adapter/Query·서버 상태, List 경로/사이드바 링크를 연결했다. 기존 Object 본문과 오른쪽 도구를 유지하며 로컬 View/별표 미리보기를 실제 조회 표시로 교체했다.

Node 24.21.0의 typecheck·lint·build와 단위 11 files/41 tests 통과. 신규 통합 10개·기존 앱 smoke 1개 최종 재실행 통과와 Sidebar/오른쪽 도구 회귀 9개를 포함해 고유 E2E 20개를 검증했다. 초기 브라우저 부재·StrictMode 횟수 assertion 실패와 수정 이력은 검토 문서에 기록했다. 360/390/1024/1440px·키보드·빠른 전환 격리와 화면 캡처를 확인했다.
