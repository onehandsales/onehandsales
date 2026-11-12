# 공식 자료와 설계 근거

확인일: 2026-10-30. 공식 문서는 제품의 공개 동작을 확인하는 근거다. Attio의 내부 DB 테이블, 비공개 endpoint 구조, 우리 스키마의 JSON 규격을 증명하지 않는다.

| 자료 | 확인한 내용 | 이번 설계에 반영 |
| --- | --- | --- |
| [Attio Lists](https://attio.com/help/reference/attio-101/attios-data-model/understanding-lists) | ListEntry가 Record와 List 고유 값을 연결하며 같은 Record가 여러 Entry로 참여할 수 있음. List 보기로 Table·Kanban 설명 | List 조회의 행 식별자는 Entry. Record ID 기준으로 행을 합치지 않음 |
| [Attio Table](https://attio.com/help/reference/managing-your-data/views/create-and-manage-table-views) | 속성 열, 필터·정렬, 열 위치·너비, 값 표시 형식 | TABLE 표시 바인딩과 값 조회 분리 |
| [Attio Kanban](https://attio.com/help/reference/managing-your-data/views/create-and-manage-kanban-views) | Status 기반 열, 카드 속성, 단계 숨김·접기 | 칸반의 단계 키·빈 단계·카드 페이지 분리 |
| [Attio Filter and sort](https://attio.com/help/reference/managing-your-data/views/filter-and-sort-views) | AND/OR 중첩, 우선순위 정렬, 연결 속성 조건, 임시 변경과 저장 구분 | 전체 조건 평가 후 페이지 처리. 임시 설정 적용과 영속 저장을 별도 결정 |
| [Attio Insight](https://attio.com/help/reference/managing-your-data/dashboard-and-reports/set-up-an-insight-report) | 원본·측정값·집계·그룹·추가 계열·필터. 그룹 없는 단일 측정값 가능 | CHART의 집계와 단일 숫자 표현. COUNT를 위해 가짜 Attribute를 만들지 않음 |
| [Attio Dashboards](https://attio.com/help/reference/managing-your-data/dashboard-and-reports/dashboards) | 보고서 묶음, 배치·크기 조절, 접근 권한 | 위젯별 결과와 배치 분리. 우리 `contentViewDefinitionId` 모델로 연결 |
| [Notion Views](https://www.notion.com/help/views-filters-and-sorts) | 타입별 레이아웃·설정, 속성 표시, 옆 패널 열기 | 조밀한 본문과 오른쪽 설정·상세 표현의 참고 |

Attio의 공개 List 문서는 Table·Kanban을 설명한다. 우리 11개 View enum 전체가 Attio의 독립 View 타입이라는 뜻은 아니다. LIST/GALLERY/CALENDAR/TIMELINE/GANTT/PIVOT/MAP 등의 구체적인 본문은 [프로젝트 UX](../../VIEW_TWO_AREA_TEXT_UX.md)를 구현할 확장 설계다. Attio의 업무 데이터 의미를 유지하면서 이 표시 방식을 적용한다.

Attio Insight의 Map은 국가별 집계 지도다. 우리 MAP은 개별 Location 좌표의 핀과 기록 목록이므로 그 구현을 동일하다고 설명하지 않는다. Notion의 Files & media, 반복 일정, 자동 일정 이동도 현재 우리 schema에 존재하는 기능으로 간주하지 않는다.

필터의 `ANY/ALL` 빈 집합 평가, 다중값 집계 기여, 통화 혼합, 기간의 끝 포함 여부 등은 위 도움말만으로 우리 서비스의 정확한 계약이 정해지지 않는다. [설계 검토](PLANNING-REVIEW.md)의 제안과 결정 항목을 따른다.
