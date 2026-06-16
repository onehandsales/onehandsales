# Deal Common

## 1. 역할

이 폴더는 Backend와 Frontend가 함께 따라야 하는 딜 도메인 계약을 둔다.

`/goal` 작업자는 구현 파일을 열기 전에 이 폴더의 사용자 흐름, API 명세, goal 상세, 계획 검토 결과를 먼저 확인한다.

## 2. 계약 상태

- API 계약 상태: `implemented`
- Backend 구현 상태: `completed`
- Frontend 구현 상태: `pending`
- 기준일: 2026-06-12

## 3. 핵심 결정

- DB에는 Deal 상태를 enum이 아닌 string으로 저장한다.
- 상태 값은 코드 단 enum으로 관리하고, DB에는 영어 code를 저장한다.
- UI에는 한국어 label을 표시한다.
- FK로 가져온 회사, 담당자, 제품, 다음 행동은 flat 필드가 아니라 객체 또는 객체 배열로 응답한다.
- 딜-제품 관계는 `DealProduct` 중간 테이블로 관리한다.
- 딜 생성/수정은 `productIds` 배열을 사용한다.
- 딜 생성/수정 시 담당자가 선택한 회사에 속하는지 검증한다.
- 딜 목록 응답과 export에는 제품을 포함하지 않는다.
- 딜 export에는 id와 최근수정일을 포함하지 않는다.
- 옵션 API 3개는 전체 목록을 `createdAt DESC`로 반환한다.
- 다음 행동 생성 API는 `followingAction`만 받으며 `checkComplete`은 항상 `false`로 시작한다.

## 4. 참조 문서

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
