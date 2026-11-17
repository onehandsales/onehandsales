# Implementation Boundary

Updated: 2026-11-17

## 기존 구현 기록

[IMPLEMENTATION_STATUS](../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)는 2026-11-15 소스 확인 기록이다. Auth·지원·Workspace와 Object/List/Attribute/Record/View API, TABLE/KANBAN/LIST UI가 있다. 이번 문서 작업에서 코드·DB를 재검증하지 않았다.

기존 범용 코어, enum, 테이블이 있다는 사실을 Bonsai 기능 구현 완료로 보지 않는다.

## 목표

[기능 대응표](../../PM_AGENT/PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md)의 고객·거래·견적·문서·수행·청구·포털·팀·운영 기능을 재현하고 이후 차별화한다.

## 경계

- 인증·Workspace·Team·감사·지원 기반은 유지 검토의 출발점이며 목표 권한과 대조한다.
- 기존 CRM 엔진의 유지·교체는 [DB 계획](../DB_SCHEMA/BONSAI_SCHEMA_PLAN.md)과 의존 검토로 정한다.
- mock 제작과 API 계약 초안은 병행할 수 있다. 실연동은 같은 흐름의 계약을 확정한 뒤 진행한다.
- [UX 025](../../UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md#figma와-구현-착수)에 따라 Figma는 선택 사항이다. 기존 React 프런트엔드에서 원본 기반 임시 데이터 화면을 만들고 실제 API로 연결할 수 있으며 별도 전체 디자인·프로토타입 완성을 선행 조건으로 두지 않는다.
- 문서·mock·로컬 구현·외부 서비스 동작·배포 증거를 별도로 관리한다.
- 이번 변경은 AGENT와 조사 폴더의 문서다. 실행 코드·schema·migration·DB 변경이 아니다.

[전환 영향](BONSAI_TRANSITION_MATRIX.md)과 [공개 API 참고](BONSAI_API_REFERENCE.md)를 함께 읽는다.
