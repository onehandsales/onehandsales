# CRM Interaction Model

Status: folk target
Date: 2026-11-15

| 사용자 동작 | 데이터 의미 | 계약에서 확인할 것 |
| --- | --- | --- |
| 연락처 등록 | Workspace의 Person/Company 생성 | 기본 필드·중복·생성 후 위치 |
| 그룹에 추가 | 기존 연락처와 Group의 포함 관계 | 중복 포함·권한·회사 자동 포함 |
| 그룹 필드 편집 | 해당 그룹·대상 타입의 값 변경 | 다른 그룹 값과 격리 |
| View 변경 | 같은 데이터의 표시 조건 변경 | 자동 저장·실패·동시 편집 |
| Pipeline 카드 이동 | 기준 선택 필드 값 변경 | 허용 옵션·되돌림·권한 |
| Custom object 연결 | 그룹 업무 객체와 연락처 연결 | 대상 범위·기수·해제 영향 |
| 메모/작업 작성 | 레코드 관련 활동과 공개 범위 | 작성자·담당자·권한·기한 |
| 그룹에서 제외 | 멤버십 제거 | 그룹 값과 연락처 기본 정보의 처리 |
| 연락처/그룹 삭제 | 다른 범위의 삭제 | 연결·메모·작업·복구의 영향 |

위 내용은 설계 질문이다. 미확인 자동 동작·삭제 cascade를 표만으로 확정하지 않는다. 공식 확인과 충돌 목록은 [FOLK_BENCHMARK_RESEARCH](FOLK_BENCHMARK_RESEARCH.md), 물리 설계안은 [FOLK_SCHEMA_PLAN](../../SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md)을 따른다.

화면 명칭은 folk 원문과 locale 번역을 대응시킨다. Object/List/View 같은 기존 API 이름을 사용자 메뉴로 자동 노출하지 않는다.
