# UXUI_AGENT

참고 기준 갱신: 2026-11-17. 과거 구현·검증 날짜는 아래 기록을 따른다.

Bonsai의 화면·사용자 흐름·상태·상호작용을 조사하고 재현 기준을 관리한다. 현재 기준은 [025 Bonsai reference](DECISIONS/025_uxui_bonsai_reference.md)다.

## 먼저 읽기

1. [화면과 공식 근거 조사](PLANNING/BONSAI_BENCHMARK_RESEARCH.md)
2. [전체 기능 대응표](../PM_AGENT/PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md)
3. [화면 지도](PLANNING/USER_FLOW_AND_SCREENS.md)
4. [첫 사용](PLANNING/FIRST_USE_FLOW.md), [Workspace 탐색](PLANNING/WORKSPACE_HOME_UX.md)
5. [목록·상세](PLANNING/RECORD_LIST_DETAIL_UX.md), [상호작용](PLANNING/CRM_CORE_INTERACTION_MODEL.md)
6. [UI 방향](PLANNING/UX_UI_DIRECTION.md), [문구](PLANNING/UX_WRITING_GUIDE.md)
7. [검토 기준](UX_REVIEW_CHECKLIST.md)

Gummble MCP 화면과 실제 Bonsai 계정을 대조한다. 공식 문서로 기능 의미를 검증한다. 현재 Bonsai 화면 수집은 대기 중이다.

이전 참고 제품 기준, Kit 선택, 일괄적인 모바일 표 금지·생성 패널 고정은 현행 기준이 아니다. 원본과 다르게 단순화한 부분은 명시적으로 차이로 관리한다.

API/DB 구조는 Software와 함께 맞추되, 화면만으로 Bonsai의 실제 내부 schema를 단정하지 않는다.
