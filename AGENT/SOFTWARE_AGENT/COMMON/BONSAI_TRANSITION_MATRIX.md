# Bonsai 전환 — DB / API / FE 의존

Status: Plan / 실행 코드 미변경
Updated: 2026-11-17

[기존 구현 기록](../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md), [DB 계획](../DB_SCHEMA/BONSAI_SCHEMA_PLAN.md), [ROADMAP](../../PM_AGENT/PLANNING/ROADMAP.md)을 연결한다. 기존 엔진을 유지하는 것과 교체하는 것 모두 기능 요구와 의존을 확인한 뒤 결정한다.

| 현재 경계 | 전환에서 확인할 것 |
| --- | --- |
| Auth·User·Workspace | 기존 세션·기기·프로필 보존, 팀·초대·계정/고객 구분 |
| Object·Attribute·Record | 고객·담당자·거래·수행 등 업무 모델과 Custom fields |
| List·Entry | 업무별 관계와 목록; 특정 그룹 구조로 자동 매핑하지 않음 |
| View·설정·본문 | 모듈별 보기·필터·정렬·보드·일정·공유 |
| Sidebar·Favorite | 실제 업무 탐색과 개인화, 역할별 노출 |
| TABLE/KANBAN/LIST renderer | 재사용 가능성과 업무별 입력·상태·오류 |
| Widget·WorkDependency | 보고서·작업 의존·Gantt 요구; 선제 제거하지 않음 |
| 신규 기능 | 견적·문서·서명·시간·비용·청구·입금·고객 포털·자동화 |
| 지원·운영 Admin | 지원 기능 유지 검토; 고객 포털과 분리 |

기존 기록의 CRM 모듈 HTTP handler는 Object 3, List 3, Attribute 5, Record 4, View 18개로 총 33개다. 이번 작업에서 코드를 다시 세거나 API를 실행하지 않았다.

Object/List/View ID route와 API client 의존이 있으므로 schema만 먼저 제거하지 않는다. DTO·공개 port·repository·DI·client·query key·route·seed·fixture·테스트까지 함께 전환한다.

## 실행 순서

공식 근거·화면 조사 → 업무 흐름 mock → API/DB/권한·계산·상태 계약 → 기능 단위 수직 구현 → 필요한 데이터 이전 → 기존 참조 제거 → 전체 대응 검수.

자료가 부족한 단계는 미확인을 표시하며 독립적으로 가능한 조사·설계를 진행한다. 현재 preview/save/undo·version 계약은 실제 코드의 기존 동작이고 목표 저장 방식은 화면별로 확인한다.

## 검증

- 고객·거래·견적·문서·프로젝트·청구의 연결과 값·상태가 일관되는가.
- 동일 요청·외부 이벤트 재시도에서 중복 문서·청구·입금이 발생하지 않는가.
- 내부 멤버·재무·고객 포털 권한이 응답 필드와 동작에 적용되는가.
- 삭제·보관·취소·연결 해제의 영향이 계약과 일치하는가.
- 기존 로그인·Workspace 접근·지원 접수가 유지되는가.
- mock·로컬 검증·외부 발송/서명/결제 검증을 구분했는가.

[Bonsai 공개 API 참고](BONSAI_API_REFERENCE.md)는 외부 계약 근거이며 우리 API 명세 자체가 아니다.
