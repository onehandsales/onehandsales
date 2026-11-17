# CRM Core Concept Model

Status: Bonsai 업무 개념 / 물리 모델 미확정
Updated: 2026-11-17

공식 근거는 [조사 정본](../../UXUI_AGENT/PLANNING/BONSAI_BENCHMARK_RESEARCH.md), 실제 테이블 제안은 [DB 계획](../../SOFTWARE_AGENT/DB_SCHEMA/BONSAI_SCHEMA_PLAN.md)에서 관리한다.

| 개념 | 의미·구분 |
| --- | --- |
| 계정·Workspace·멤버 | 우리 서비스의 데이터·권한 경계. Bonsai 계정의 조직과 고객 회사를 구분 |
| Client / Company / Contact | 일을 의뢰하는 고객 주체와 연락 담당자 |
| Deal | 성사시키려는 영업 건. 고객이나 프로젝트와 같은 개념이 아님 |
| Service / Rate card | 재사용할 서비스와 가격·역할별 단가 |
| Estimate | 수행 범위·금액·원가 등을 산정하는 견적 |
| Document / Agreement | 고객에게 전달·서명받는 문서와 그 상태 |
| Project | 실제 수행할 업무와 과금·예산을 관리하는 단위 |
| Task / Time entry | 해야 할 일과 실제 투입 시간. 완료와 청구 여부는 별도 |
| Budget / Expense / Allocation | 예산, 발생 비용, 인력 배정 |
| Invoice / Payment | 지급 요청과 실제 입금·결제. 부분 입금·잔액을 구분 |
| Portal / Sharing | 외부 고객에게 노출하는 자료와 접근 범위 |
| Custom field / View | 지원 업무 대상의 추가 필드와 모듈별 표시·필터 설정 |
| Automation / Integration / Report | 업무 사건 처리, 외부 동기화, 의미가 정해진 집계 |

같은 고객에게 여러 거래와 프로젝트, 여러 청구가 생기는 사례를 검증한다. 정확한 카디널리티·필수 관계는 API와 실계정 근거로 정한다. 문서 전송이나 프로젝트 생성이 모든 흐름에서 자동이라고 가정하지 않는다.
