# 기존 CRM 구현과 Bonsai 화면 전환

기준일: 2026-11-20 KST.

## 1. 기존 구현의 위치

기존 `workspace`, `crm-object`, `crm-list`, `crm-view`, `sidebar-order`, `view-favorite`와 Object/List/View ID route는 현재 범용 CRM 구현의 구조다. 상세 이력은 [구현 현황](../../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md), 현재 경로는 [router](../../../../FE/user-web/src/app/router/router.tsx)에서 확인한다.

TABLE/KANBAN/LIST와 설정의 preview/save/undo·충돌 복구는 기존 기능의 계약이다. 이를 Bonsai 전체 기능의 저장 방식이나 목표 도메인으로 확대하지 않는다. 이번 문서 개정은 기존 기능의 실행 재검증이 아니다.

## 2. 신규 Bonsai 기능의 기준

- 제품 목표는 [PM 036](../../../PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md)과 [UX 025](../../../UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md)에 따른다.
- 신규 업무 화면은 [mock 우선](MOCK_FIRST_DEVELOPMENT.md)으로 개발한다. 기존 업무 API와 범용 모델에 연결해야 화면을 만들 수 있는 구조를 피한다.
- 고객·거래·견적·문서·프로젝트·작업·청구 등 실제 기능별 흐름과 관계를 확인한다. 이 목록은 전체 기능을 제한하는 확정 도메인 목록이 아니다.
- 동일 항목의 목록·상세·관련 화면은 같은 mock 데이터를 사용한다. 화면 이름 변경만으로 Bonsai 기능을 구현했다고 보지 않는다.
- 발송·서명·청구·입금의 실제 효과와 로컬 UI 상태를 구분한다. mock 완료 표시는 외부 수신·결제·서버 저장의 증거가 아니다.
- 고객 포털은 고객용 제품 화면이며 내부 운영자 Admin Web과 동일한 권한 영역으로 취급하지 않는다.

## 3. 기존 코드 재사용과 교체

| 기존 요소 | 판단 기준 |
| --- | --- |
| Button·Field·표·오버레이 등 UI | 업무 중립 책임과 접근성이 맞으면 재사용 |
| 인증·session·workspace | 보존 여부와 mock 진입의 의존 경계를 명시 |
| 범용 Object/List/View 데이터 계약 | 신규 업무 규칙과 같다고 가정하지 않고 분리 |
| 캐시·API client·오류 처리 도구 | 실제 연동 단계에서 계약과 보안 경계를 확인 |
| 기존 route·redirect | 영향 경로와 회귀 범위를 확인한 뒤 단계적으로 전환 |

기존 화면을 옮기거나 제거할 때 import·navigation·테스트·딥링크 의존을 함께 검토한다. 새 화면 작업을 기존 코드 전체 삭제나 DB 초기화로 확대하지 않는다.

## 4. 완료 상태

각 기능은 “화면 재현”, “mock 흐름 검증”, “API 계약 확정”, “실제 연동 검증”을 별도로 기록한다. 관련 컴포넌트와 상태의 소유권은 [User Web 구조](FRONTEND_USER_WEB.md), [상태·데이터](STATE_AND_DATA.md)를 따른다.
