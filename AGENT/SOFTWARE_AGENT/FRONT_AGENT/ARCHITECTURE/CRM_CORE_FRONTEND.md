# CRM Core Frontend — 현재와 folk 전환

Date: 2026-11-15

## 현재

User Web은 `workspace`, `crm-object`, `crm-list`, `crm-view`, `sidebar-order`, `view-favorite`를 사용한다. Object/List/View ID route가 공통 WorkspaceViewPage에 연결되어 있다. 현재 route와 미완성 범위는 [IMPLEMENTATION_STATUS](../../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)가 정본이다.

TABLE/KANBAN/LIST 본문과 설정의 미리보기·명시적 저장·되돌리기·충돌 복구가 있다. 이 UI를 folk 자동 저장이라고 설명하지 않는다.

## 전환 방향

- Group 탐색과 People/Companies/Custom object 탭을 분리한다.
- Table/Pipeline이 동일 데이터와 필드 계약을 사용하게 한다.
- 기본 연락처 정보와 그룹별 값을 상세·목록에서 같은 의미로 보여준다.
- Notes/Tasks/Interactions, 공유·권한 제한, 메시지·Dashboard 등은 기능 대응표대로 확장한다.
- mock 프로토타입은 실제 API 확정 전 가능하다. 저장 완료처럼 오인시키지 않고 전환 계약을 병행한다.
- API client·query key·response type은 feature 경계를 지킨다.
- Workspace/Group/View/레코드별 캐시 범위와 늦은 응답을 격리한다.
- 원본 화면과 다른 패널·모달·반응형·스크롤 정책을 임의로 강제하지 않는다.

최종 route와 feature 이름은 화면 조사 후 확정한다. 기존 Object→People, List→Group의 단순 이름 변경만으로 전환하지 않는다.

[UX 기준](../../../UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md), [전환 영향](../../COMMON/FOLK_TRANSITION_MATRIX.md)을 따른다.
