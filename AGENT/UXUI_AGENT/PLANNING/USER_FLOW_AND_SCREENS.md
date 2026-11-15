# User Flow and Screens

Date: 2026-11-15

현재 route는 [IMPLEMENTATION_STATUS](../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md), 목표 기능은 [대응표](../../PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md)를 따른다.

| 화면군 | 조사할 흐름 | 현재와의 차이 |
| --- | --- | --- |
| 가입·Workspace | 생성·초대·전환·초기 연결 | 기존 직업 선택은 folk 기준 아님 |
| 연락처 | 전체 People/Companies, 등록·검색·상세 | 범용 Object 화면만 있음 |
| Group | 생성·포함·공유·삭제·객체 탭 | List 구조와 다른 의미 |
| View | Table/Pipeline·필터·정렬·컬럼·저장 | 현재 명시적 저장 UI |
| 업무 객체 | 타입 생성·레코드·연결 | 그룹 범위 재설계 필요 |
| 활동 | Notes/Tasks/Interactions·알림 | 업무 구현 필요 |
| 확장 기능 | 메시지·연동·AI·Dashboard·설정 | 상세 조사 및 구현 필요 |
| Admin Web | 관리자 확인·운영 | 현재 권한 확인 앱 유지 |

각 화면은 정상·빈·로딩·실패·권한 제한 상태를 수집한다. 전체 기능 수집이 끝났다고 가정하지 않는다. 첫 조사 단위는 [FIRST_USE_FLOW](FIRST_USE_FLOW.md), 기준 양식은 [FOLK_BENCHMARK_RESEARCH](FOLK_BENCHMARK_RESEARCH.md)다.
