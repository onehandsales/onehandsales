# Object/List 소속 View 목록 Backend API 계획

- 일자: 2026-10-26
- 상태: Backend 구현·검증·G99 규칙 검토 완료
- 범위: ① Object View 목록 GET, ② List View 목록 GET과 검증·최종 규칙 검토
- 적용 기준: [TODO Software 정본](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Backend Agent](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md), [검토 체크리스트](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)
- [작업 로그](../../../TODO_LOG/2026-10-26/OBJECT_LIST_VIEW_LIST_API/WORK_LOG.md)

## 실행 문서

- [① Object API](COMMON/API-SPEC/OBJECT_VIEW_LIST_API.md), [② List API](COMMON/API-SPEC/LIST_VIEW_LIST_API.md)
- [사용 흐름](COMMON/USER-FLOW.md), [작업 순서](COMMON/GOAL-WORK-ORDER.md)
- [Backend 구현](BE-TODO/IMPLEMENTATION.md), [검증·규칙 검토](BE-TODO/TEST-AND-REVIEW.md), [FE 후속 범위](FE-TODO/README.md)

## 결정과 기획 검토

사용자가 앞선 응답 형태·처리 순서를 확인한 뒤 두 API 구현과 검토를 요청했다. 공개 Port·Workspace 경계·최소 select·읽기 전용 처리·주석 규칙을 적용한다. 초기 헤더의 정렬과 동일하게 sortOrder/createdAt/id 오름차순을 사용한다. viewId는 선택 표시에만 사용하며 누락·목록 불일치는 모두 미선택이다. 필터·검색·페이지네이션 없이 대상의 전체 View 요약만 반환한다.

현재 저장 순서의 첫 View 선택 계약을 유지한다. 새로운 기본 View/최근 선택 정책, View 소속 XOR, 개인/팀 공유 권한은 추가하지 않는다. Backend 구현은 별도 Controller·UseCase·Query Port·Repository로 나누고 Object/List Summary Port를 재사용한다. 이 작업은 명시적 구현 요청에 따라 진행하며 goal 도구는 생성하지 않는다.

## 제외와 완료 기준

Frontend·본문·View 생성/저장·기본 View 자동 생성·즐겨찾기 클릭/쓰기·schema/migration/seed·환경 파일·배포·커밋은 제외한다. API 계약, 구현·빈 상태/권한/정렬/격리/DI 검증, Backend 규칙 검토를 완료하고 실제 실행 결과를 기록한 뒤 DONE 보관한다.

## 실제 완료 결과

Node 24.21.0에서 typecheck·lint·build, Prisma validate/generate와 임시 PostgreSQL 17의 전체 58 suites/341 tests가 실패·skip 없이 통과했다. 신규 검증은 5 suites/74 tests다. 실행 서버의 두 새 경로에서 인증 없는 요청의 401도 확인했다. 계층·모듈 경계와 역할/API/기능 주석 검토를 통과했다. 완료 계획은 DONE에 보관하고 FE 연결·생성/저장은 후속 요청에서 진행한다.
