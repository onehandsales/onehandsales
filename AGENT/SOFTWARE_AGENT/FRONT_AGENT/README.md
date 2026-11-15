# Front Agent

User Web/Admin Web의 route·feature·상태·검증 기준을 관리한다.

## 현재 범위

User Web은 Auth/Workspace, Object/List/View 화면, TABLE/KANBAN/LIST 본문, 인라인 값 수정, View 설정 미리보기·저장·되돌리기·충돌 복구, 사이드바·즐겨찾기와 계정/지원/공개 사이트를 포함한다.

Admin Web은 로그인과 관리자 권한 확인이 중심이다. 현재 구현 상세는 [IMPLEMENTATION_STATUS](../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)를 따른다. 이전 날짜의 계획이나 테스트 결과를 현재 실행 결과로 대체하지 않는다.

## folk 전환

[UX 025](../../UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md), [CRM_CORE_FRONTEND](ARCHITECTURE/CRM_CORE_FRONTEND.md), [전환 영향](../COMMON/FOLK_TRANSITION_MATRIX.md)을 따른다. Kit 선택과 기존 화면 제한은 현행 기준이 아니다.

## 구현 기준

- [User Web 구조](ARCHITECTURE/FRONTEND_USER_WEB.md), [컨벤션](CONVENTION/FRONTEND_USER_WEB.md)
- [Admin 구조](ARCHITECTURE/ADMIN_WEB.md), [컨벤션](CONVENTION/ADMIN_WEB.md)
- [검토 기준](ENGINEERING_REVIEW_CHECKLIST.md), [QA](../COMMON/QA_CHECKLIST.md)

실제 변경에 맞춰 typecheck/lint/test/build 및 필요한 E2E를 검증한다. 문서만 바꾼 경우 링크·내용·소스 정합성을 검증하고 실행하지 않은 runtime 검증을 명시한다.
