# 업무 목록과 첫 보기 생성

사이드바 업무 목록 +에서 이름/관리 항목과 첫 보기(TABLE·LIST·KANBAN)를 선택하고
List와 View를 원자적으로 생성한다. 관리 항목의 기존 기록은 자동 등록하지 않는다.

- [공통 API 계약](COMMON/API-SPEC/LIST_VIEW_CREATE_API.md)
- [Backend 작업](BE-TODO.md)
- [Backend 규칙·비즈니스 로직 재검토](BE-REVIEW.md)
- [Frontend 작업](FE-TODO.md)

기준: BACKEND_AGENT의 modular monolith/Clean Architecture, transaction/contract/comment 규칙,
FRONT_AGENT의 feature/query 경계, UXUI_AGENT의 기존 생성 모달과 업무 언어.
Docker·서버 재시작·schema 변경·DB seed·커밋은 이번 코드 작업에 포함하지 않는다.

## 구현 결과

- `POST /api/users/me/workspaces/:workspaceId/list-definitions` → List/View ID 반환.
- TABLE/LIST: List + View + 원본 Record 제목 표시 설정.
- KANBAN: 위 구조 + 그룹. 새 단계 선택 시에만 List 전용 상태 속성과 옵션 생성.
- 소속 검증, 중복 이름409, 부분 저장 rollback, 안전한 requestId 로그.
- 모달 두 단계, 기본 TABLE, 상태 재사용/신규 단계, 한국어/영어, 조회 실패 재시도,
  중복 제출 차단과 늦은 응답 방어.
- DONE으로 이동한 OBJECT_TABLE_CREATE_PLAN의 외부 문서 참조 4곳도 수정했다.

기준 관리 항목 선택은 첫 View의 제목/상태 참조를 위한 것이다. List의 허용 Object 종류나
같은 Record의 중복 참여 정책을 확정하거나 DB 제약을 추가하지 않는다.
기존 Record를 ListEntry로 등록하거나 List 안에서 새 Record를 생성하는 API/화면은 후속 작업이다.
실제 DB 통합/rollback 검증은 미실행 상태로 남긴다.
