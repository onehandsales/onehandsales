# Frontend 구현·재검토

먼저 읽기: [TODO Software Agent Reference](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Frontend 규칙](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [UX 기준](../../../AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md), [사용자 흐름](../COMMON/USER-FLOW.md), [API 계약](../COMMON/API-SPEC/VIEW_CONFIGURATION_API.md).

User Web의 기존 보호 route와 crm-view feature를 사용한다. apiClient/TanStack Query에서 서버 상태를 읽고 useViewConfiguration에서 공통 baseline/draft를 유지한다. 새 업무 객체 form은 만들지 않고 기존 설정 입력과 컬럼 편집기를 연결한다. Admin Web API나 내부 feature를 공유하지 않는다.

- 설정·옵션·본문·메뉴 query key는 feature factory로 사용자/Workspace/View/source를 구분한다. 본문은 미리보기 command까지 키에 포함한다.
- TABLE/KANBAN/LIST의 메뉴와 컬럼 변경을 한 초안에 반영한다. 저장 서버 응답 전 성공 상태를 가정하지 않고 실패에도 초안을 보존한다.
- 보기별 pending 집합과 방문 식별자로 늦은 응답을 제한한다. A 저장 중 B 편집/저장, A→B→A 복귀, 최신 조회 중 새 편집을 회귀 검증한다. A 완료가 B의 cursor/본문을 초기화하지 않는다.
- 초기 로딩, empty, 실패/재시도, 409 입력 유지/명시 복구, 저장 성공/진행 중, 접근 불가, 미지원 보기 상태를 구분한다. 한국어는 해요체, 내부 ID를 사용자 라벨로 노출하지 않는다.
- 새로고침 복원, 오류 입력 유지, IME, 모바일 팝오버와 저장 중 보기 이동은 제어된 API 응답의 Playwright로 확인한다. 실제 로그인/Supabase 통합 검증과 구분한다.

완료 기준: 관련 Vitest 및 Chromium E2E, typecheck/lint/build 통과. 다른 8개 보기 저장·모바일 기본 본문 재설계·보기 생성/복사·대표 속성 선택 UI는 별도 범위다.
