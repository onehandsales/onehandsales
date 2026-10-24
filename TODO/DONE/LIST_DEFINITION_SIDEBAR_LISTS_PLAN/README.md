# 사이드바 업무 목록 조회 API 계획

상태: Backend 구현·검증 완료 / 2026-10-24

## 1. 목적과 범위

사이드바 업무 목록에 현재 Workspace의 List 이름과 아이콘을 표시할 Backend API 1개를 제공한다. 기존 관리 항목 조회와 같은 인증·접근 확인·정렬 조건을 사용한다.

Frontend 연결, List 생성·수정·삭제, ListEntry/View 조회, DB schema/migration 변경은 이번 범위에 포함하지 않는다.

## 2. 실행 순서와 완료 기준

1. API 계약·기획 검토 확정
2. `list-definition` 모듈 구현과 AppModule 등록
3. 정상/빈 목록, 인증, UUID, Workspace 접근 차단 검증
4. Backend typecheck/lint/test/build와 Prisma validate, 범위 검토 결과 기록

## 3. 문서

- [공통 API 계약](COMMON/API-SPEC/SIDEBAR_LIST_DEFINITION_API.md)
- [Backend 작업·DB 연결](BE-TODO/README.md)
- [기획 검토](COMMON/PLANNING-REVIEW.md)
- [작업 로그](../../../TODO_LOG/2026-10-24/LIST_DEFINITION_SIDEBAR_LISTS/WORK_LOG.md)
- [필수 Software 정본 참조](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)

사용자가 사전 합의한 조건으로 Backend 구현을 요청해 `confirmed` 계약을 먼저 작성하고 구현했다. `/goal`이 아닌 하나의 Backend 구현 단위다.

## 4. 완료 결과

List 조회 모듈과 AppModule 등록을 완료했다. Node 24.10.0/pnpm 8.14.1에서 typecheck/lint/build/Prisma validate가 통과했고, 새 테스트 9개를 포함해 전체 45개 suite·221개 테스트가 통과했다. 기존 Prisma SetNull 경고 4건은 유지된다. 구현 범위·계층·계약 검토를 마쳐 완료 보관한다. Frontend 연결은 사용자의 후속 요청 범위다.
