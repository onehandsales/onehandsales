# CRM Core Frontend — 기존 구현과 Bonsai 전환

Updated: 2026-11-17

## 기존 구현 기록

User Web의 `workspace`, `crm-object`, `crm-list`, `crm-view`, `sidebar-order`, `view-favorite`와 Object/List/View ID route는 [구현 현황](../../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)의 기존 소스 기록이다. 이번 작업에서 실행 코드를 재검증하지 않았다.

TABLE/KANBAN/LIST 본문과 설정의 preview/save/undo·충돌 복구는 기존 계약이다. Bonsai의 화면별 저장 방식은 별도 조사한다.

## 전환 방향

- 고객·거래·견적·문서·프로젝트·작업·청구의 탐색과 상세 연결을 실제 화면으로 확인한다.
- 발송·서명·청구·입금 상태를 단순 로컬 편집 상태와 구분한다.
- 같은 업무의 목록·상세·관련 화면에서 값과 상태를 일관되게 표시한다.
- 고객 포털과 내부 팀·재무·운영자 화면의 권한·정보 범위를 분리한다.
- 기능별 mock은 API 확정 전 만들 수 있으며 실제 저장 상태와 구분한다.
- API client·query key·응답 타입은 feature 경계를 지킨다.
- 사용자·Workspace·업무 대상·View별 캐시와 늦은 응답을 격리한다.
- 금액·날짜·기한의 입력·표시는 Backend 계약과 맞춘다.
- 패널·모달·페이지·반응형·스크롤은 원본 근거와 접근성을 함께 검토한다.

최종 route와 feature 이름은 조사 후 정한다. 기존 범용 화면의 이름만 바꿔 목표 기능으로 취급하지 않는다. [UX 기준](../../../UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md)과 [전환 영향](../../COMMON/BONSAI_TRANSITION_MATRIX.md)을 따른다.
