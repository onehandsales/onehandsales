# 업무 목록 Frontend 구현

## 1. 선행 문서

- [Front Agent](../../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md)
- [Software 정본 참조](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)
- [API 사용 계약](../COMMON/API-SPEC/README.md)

## 2. 코드

- `features/crm-list/types/sidebar-crm-list.ts`: id/icon/name 응답 타입
- `features/crm-list/api/sidebar-crm-list-api.ts`: 공통 apiClient 호출
- `features/crm-list/api/sidebar-crm-list-query-keys.ts`: 사용자/Workspace 캐시 키
- `features/crm-list/hooks/use-sidebar-crm-lists.ts`: 인증/Workspace가 있어야 활성화되는 Query
- `features/crm-list/index.ts`: 공개 Hook과 타입 export
- AppShell: 현재 Workspace ID를 관리 항목과 함께 사용하고 목록·상태·재시도 전달
- SidebarNav: 같은 디자인의 업무 목록 행, 공통 Skeleton/IconValueGlyph, 빈 목록/오류 안내
- app-i18n: 한국어·영어 상태 문구

새 함수·Hook·API 호출·복잡한 상태 흐름은 Front Agent의 한글 기능·번호 주석을 적용한다. Admin Web, apiClient 인증 로직, 업무 route, Backend와 DB는 변경하지 않는다.

## 3. 검증

E2E Mock에 /lists 분기를 일반 Workspace 조회보다 먼저 추가한다. Playwright로 응답 순서/이름/아이콘/인증, 접기·펼치기, 로딩·빈 목록, 오류 재시도와 Workspace 전환 후 데이터 분리를 확인한다. 기존 관리 항목과 헤더 smoke도 확인한다.

User Web typecheck/lint/test/build를 실행하고 결과·실패·기존 경고를 작업 로그에 기록한다. 실제 Backend에 대한 별도 API smoke를 하지 않으면 그 한계를 명시한다.

2026-10-24 구현 완료. 신규 E2E 4건과 기존 헤더 1건, typecheck/lint/단위 테스트 33개/build가 통과했다. 함께 실행한 기존 관리 항목·Workspace 생성 모달 E2E 2건은 기존 화면과 테스트의 불일치로 실패했다. 변경하지 않은 해당 파일과 HEAD를 비교해 확인했으며 후속 테스트 정비 범위로 남긴다. 실제 Backend smoke는 하지 않았다.
