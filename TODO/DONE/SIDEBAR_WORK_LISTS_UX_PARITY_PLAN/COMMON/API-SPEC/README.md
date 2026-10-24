# 업무 목록 Frontend 표시 기준 변경

상태: Frontend 표시 변경 완료 / 소비자: User Web

[기존 Backend 계약](../../../LIST_DEFINITION_SIDEBAR_LISTS_PLAN/COMMON/API-SPEC/SIDEBAR_LIST_DEFINITION_API.md)을 그대로 사용한다. endpoint·인증·응답·정렬·오류 status와 DB 계약은 변경하지 않는다.

사용자가 최초 연동의 안내 UI를 현재 관리 항목과 동일하게 수정하도록 확정했다. 성공한 빈 배열은 빈 목록으로 표시하며, 최초 조회 실패도 별도 문구나 재시도 버튼을 표시하지 않는다. 자동 인증 갱신·Query 재조회·사용자/Workspace 캐시는 기존 구현을 유지한다. 캐시 데이터가 있는 재조회 실패에서는 데이터 존재 여부대로 행을 표시한다.

이 문서의 표시 기준이 최초 연동 계획의 빈 목록·오류 안내/재시도 UI 설명보다 우선한다. 관리 항목의 클릭 route는 유지하며 업무 목록에 미구현 route나 생성 기능을 추가하지 않는다.
