# 후속 구현 작업 순서와 완료 기준

이 문서는 후속 실행 단위를 제안한다. 이번 문서 작업에서 goal을 생성하거나 구현을 시작하지 않는다. [현재 범위](SCOPE_AND_DEFERRED_WORK.md)에 따라 지금 구현할 대상은 Backend GET 하나다. 계약 상태는 draft이며 [결정 현황](PLANNING-REVIEW.md) 중 이번 조회에 필요한 지원 규칙·기본값·실패 처리를 먼저 구체화한다. 필터·정렬 저장 API는 선행 작업이 아니다. 타입 범위는 11개 전체다.

## 현재 Backend 작업

| 단계 | 목적 | 포함 범위 | 제외 범위 | 완료 기준 |
| --- | --- | --- | --- | --- |
| 1. GET 계약 확정 | 현재 조회를 구현 가능한 수준으로 정리 | query/part/state, 값 해석·연산자·날짜·집계, 오류, 역할 지원표, 실행 한도·snapshot, 예제 동기화. Entry 단위와 기간 미설정 선택 반영 | 저장 API 계약·코드·DB 변경, 모든 확장 기능 확정 | 이번 GET의 미지원 처리까지 명시하고 관련 결정 반영 후 API-SPEC이 confirmed |
| 2. 공통 조회 기반 | 모듈 경계를 지키며 값을 해석 | 인증·Workspace, public query Port/provider wiring, snapshot, 값 decoder, 필터·검색·정렬·cursor, 안전 한도 | 타입 UI·mutation | 권한/원본 단위/다중값/실패/일관성 테스트, bounded query 비용 검증 |
| 3. 11개 조회기 | 모든 View type의 본문 계약 제공 | TABLE/KANBAN/LIST/GALLERY/CALENDAR/TIMELINE/GANTT/CHART/PIVOT/MAP/DASHBOARD handler·mapper, 신규 오류 매핑, 필요한 인덱스 검토 | 생성·수정·삭제·드릴다운·위젯 저장 | 11타입 계약/단위/통합 테스트, mock 기대값, 한도·권한·타입 전환 실패 검증 |
| 4. Backend 통합 검토 | 실제 데이터와 운영 한계 확인 | Backend 요구 검사, 실제 목표 Workspace 읽기, EXPLAIN·시간·query 수·메모리, 보안·로그 검토 | FE 구현·저장 API·배포·커밋 | 검증 결과/잔여 위험/재현 절차 기록, 완료된 GET 계약만 implemented |

## 후속 작업

| 작업 | 목적·포함 범위 | 현재 단계와의 관계 | 후속 완료 기준 |
| --- | --- | --- | --- |
| FE 공통 연결·11개 본문 | api/query/types/renderer, Object/List 연결, 캐시·취소·타입별 본문·반응형·접근성 | 현재 GET의 후속 소비자. 기존 컴포넌트 문서는 설계 참고 | 11타입·비동기·권한·오류·브라우저와 기존 헤더 회귀 검증 |
| 필터·정렬 저장 API | 별도 mutation 계약, 권한/참조 검증, transaction, 동시 수정/재시도 | 현재 GET를 구현하기 위한 선행 API가 아님 | 저장 성공·실패·원자성·저장 유지 검증 |
| 자동 저장 후 본문 갱신 | 저장 성공 후 메뉴 갱신·page 초기화·같은 GET 재조회 | 사용자가 선택한 P09의 후속 FE 연결. 임시 override 요구 없음 | 새로고침 후 조건 유지, 연속 변경/실패/늦은 응답 처리 |

후속 작업은 필요에 따라 따로 착수한다. FE 조회 연결에 저장 API를 반드시 먼저 붙여야 하는 것은 아니며, 자동 저장 경험을 제공할 때 저장 API와 연결한다.

각 구현 단위는 해당 모듈 AGENT 규칙을 다시 적용하고 기존 사용자 변경을 보존한다. 담당 타입이 끝났다는 이유로 전체 11개 구현 완료를 표시하지 않는다. schema/index 변경이 필요해지면 실제 영향과 migration 검토를 별도 작업으로 포함한다. 읽기 계약을 구현하면서 데이터 보정/자동 View 생성/수정 API를 함께 넣지 않는다.
