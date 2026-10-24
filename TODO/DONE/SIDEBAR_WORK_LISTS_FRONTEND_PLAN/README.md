# 사이드바 업무 목록 Frontend 연동

상태: 요청 범위 구현 완료, 기존 생성 모달 E2E 2건 불일치 기록 / 2026-10-24

## 1. 목적과 범위

현재 Workspace에 속한 List 이름과 아이콘을 사이드바 업무 목록에 표시한다. 관리 항목과 같은 행 높이·글자 크기·간격과 Skeleton을 사용한다. List 클릭 이후 화면/route, List 생성·편집·삭제와 View 연동은 추가하지 않는다.

## 2. 실행 순서와 완료 기준

1. 기존 API 계약과 Front Agent 규칙에 맞는 사용 흐름을 검토한다.
2. crm-list feature와 AppShell/SidebarNav를 연결하고 한국어·영어 상태를 처리한다.
3. 실제 API 경로·인증·응답 순서, 로딩/빈 목록/오류 복구, Workspace 전환과 기존 관리 항목을 검증한다.
4. typecheck/lint/test/build와 관련 Playwright 결과를 기록하고 완료 보관한다.

## 3. 문서

- [API 사용 계약](COMMON/API-SPEC/README.md)
- [Frontend 작업](FE-TODO/README.md)
- [기획 검토](COMMON/PLANNING-REVIEW.md)
- [작업 로그](../../../TODO_LOG/2026-10-24/SIDEBAR_WORK_LISTS_FRONTEND/WORK_LOG.md)
- [필수 Software 정본](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)

한 번의 Frontend 구현 단위로 진행한다. 기존 Backend 완료 계획은 계약 근거로 참조한다.

## 4. 결과와 제한

목록 조회·표시·로딩·빈 목록·오류 재시도·Workspace 전환을 구현했다. typecheck/lint와 기존 단위 테스트 10개 파일·33개, build가 통과했다. Playwright는 신규 업무 목록 4건과 기존 헤더 1건이 통과했다.

추가 확인한 기존 생성 모달 E2E 2건은 관리 항목 입력 단계 및 Workspace 제목 색상에 대한 기존 코드/테스트 불일치로 실패했다. 해당 모달과 테스트 파일은 이번 작업에서 변경하지 않았으며 HEAD에도 동일한 구현이 있음을 확인했다. 전체 E2E가 통과했다고 표시하지 않는다. 빌드의 기존 500 kB 초과 chunk 경고는 유지된다. 실제 Backend 연결 smoke와 List 화면/생성 기능은 수행하지 않았다.
