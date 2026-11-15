# UX/UI Direction

Status: Current
Date: 2026-11-15

전역 기준은 [025 folk reference](../DECISIONS/025_uxui_folk_reference.md)다. folk의 화면 구성과 상호작용을 재현한다.

## 화면 기준을 정하는 순서

1. Nicelydone의 화면/flow/component와 출처를 수집한다.
2. 실제 계정과 공식 문서에서 버전·동작을 대조한다.
3. layout, typography, color, spacing, icon, hover/focus/disabled 상태를 기록한다.
4. 같은 화면의 모바일·키보드·빈 상태·오류·권한 제한을 확인한다.
5. mock을 비교한 후 API/DB 계약과 연결한다.

원본을 보지 않은 수치나 UI 패턴을 확정하지 않는다. 기존 폰트·공용 컴포넌트는 전환 전 구현값이며 원본과 다르면 차이를 기록한다. 제품명은 OneHand CRM을 유지한다.

테이블 가로 스크롤 금지, 생성 화면 우측 패널 강제, 개인용 메뉴 제한 같은 과거 정책을 folk 근거보다 우선하지 않는다. 접근성·데이터 보안·사용 가능성은 유지하며 원본과 차이가 필요하면 명시적으로 기록한다.
