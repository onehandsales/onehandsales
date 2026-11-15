# CRM Core Concept Model

Status: folk target concepts
Date: 2026-11-15

이 문서는 사용자 관점의 개념이다. 실제 테이블 이름은 [DB 설계안](../../SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md)에서 정한다. 근거는 [공식 자료](../../UXUI_AGENT/PLANNING/FOLK_BENCHMARK_RESEARCH.md)를 따른다.

| 개념 | 의미 | 기존 구현과 차이 |
| --- | --- | --- |
| Workspace | 연락처·멤버·접근의 경계 | 현재 기반은 있으나 folk 정책은 대조 필요 |
| People / Companies | 기본 연락처 종류 | 사용자 임의 Object가 아닌 명시적 기반 |
| Group | 연락처를 모으고 추가 정보·공유를 관리 | List의 행 집합과 완전히 같지 않음 |
| Custom field | 그룹·대상에 속한 추가 정보 | 범용 Object/List Attribute의 범위를 좁힘 |
| Custom object | 그룹 안에서 정의한 업무 대상 | Deals 등; Workspace 전체의 범용 Object와 구분 |
| 객체 탭 | People/Companies/각 Custom object 유형의 화면 구분 | 물리 테이블과 1:1일 필요 없음 |
| View | 같은 대상의 표시·필터·정렬 방식 | Group과 데이터 자체를 복제하지 않음 |
| Table / Pipeline | 목록 표시 방식 | Dashboard와 구분 |
| Notes / Tasks / Interactions | 기록·후속 행동·접촉 이력 | 공통 Next Action 필드 하나로 대체하지 않음 |
| Dashboard | 그룹 데이터 집계·차트 | 일반 목록 View와 별도 기능 |

같은 사람이 “거래처”와 “파트너” 두 그룹에 있으면 이름·연락처는 공유하면서 각 그룹의 상태는 다르게 관리할 수 있어야 한다. 이 예시는 우리 설계 검증 시나리오이며 folk 내부 DB 구조의 증거는 아니다.
