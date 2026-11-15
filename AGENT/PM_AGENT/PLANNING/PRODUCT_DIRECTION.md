# Product Direction

Status: Current product direction
Date: 2026-11-15

OneHand CRM은 **folk의 제품 기능과 UX를 재현하는 CRM**을 목표로 한다. [036 결정](../DECISIONS/036_folk_benchmark_transition.md)에 따라 기존 No Setup CRM / 직군별 Kit / Notion·Attio 혼합 방향을 대체한다.

## 판단 기준

- folk의 실제 사용자 흐름과 같은 일을 같은 맥락에서 할 수 있는가.
- 화면·공식 동작 근거가 있고 현재 구현과 목표를 구분했는가.
- People/Companies 기본 정보와 Group별 정보가 분리되는가.
- 반복되는 범용 추상화를 줄이면서 사용자 필드·커스텀 객체 기능을 보존하는가.
- 일부 화면만 닮은 상태를 전체 제품 완성으로 과장하지 않는가.

## 범위

[기능 대응표](FOLK_FEATURE_PARITY_MATRIX.md)의 전체 기능을 조사·전환 대상으로 둔다. 개발 순서는 [ROADMAP](ROADMAP.md)을 따른다.

사용자 타겟·직군을 아직 확정하지 않았다. 특정 영업직의 초기 아이디어는 참고할 수 있으나 folk에 없는 기능을 자동 추가하거나 folk 기능을 개인 전용으로 제한하지 않는다. 첫 Kit 선정은 선행 조건이 아니다.

## 증거와 구현

Nicelydone MCP는 화면 수집 경로다. 공식 도움말/API는 동작 의미의 근거이며 실제 계정으로 버전 차이를 확인한다. DB는 공개 기능으로부터 설계하는 우리 구현이고 folk 내부 schema라고 부르지 않는다.

현재 개발 상태는 [IMPLEMENTATION_STATUS](IMPLEMENTATION_STATUS.md), 미확인 사항은 [조사 문서](../../UXUI_AGENT/PLANNING/FOLK_BENCHMARK_RESEARCH.md)를 따른다.
