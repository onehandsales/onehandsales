# Product Direction

Status: Current product direction
Updated: 2026-11-17

OneHand CRM은 **Bonsai 전체 기능·UX 재현 후 차별화**를 목표로 한다. [036 결정](../DECISIONS/036_bonsai_benchmark_transition.md)을 따른다.

## 중심 업무

고객·담당자와 거래를 관리하고, 견적·제안·계약으로 합의한 내용을 프로젝트·작업·시간 기록과 청구·수금까지 연결한다. 이는 학습용 중심 시나리오이며 모든 기능이 이 순서를 강제하거나 자동 연결된다는 뜻은 아니다.

대표와 회사 영업사원도 사용자 시나리오에 포함된다. 업종보다 수행하는 업무와 접근 권한을 먼저 확인한다. 특정 업종·개인 전용·Kit을 제품의 확정 제약으로 정하지 않는다.

## 판단 기준

- [기능 대응표](BONSAI_FEATURE_PARITY_MATRIX.md)에 전체 기능군과 누락 조사 항목이 남아 있는가.
- UI뿐 아니라 저장·상태 전이·계산·권한·고객 측 동작이 연결되는가.
- Estimate, Document, Project, Invoice를 서로 다른 업무 개념으로 다루는가.
- 공식 자료, Gummble 화면, 실계정 결과와 설계 가정을 구분했는가.
- 현재 구현과 원본의 차이를 숨기지 않고 완료 증거를 남겼는가.

단계별 구현은 [ROADMAP](ROADMAP.md)을 따른다. 공개 API에 없는 기능을 제외하거나 기존 범용 엔진에 맞춰 제품을 축소하지 않는다. 제품 제공 상태는 [IMPLEMENTATION_STATUS](IMPLEMENTATION_STATUS.md), 조사 상태는 [근거 목록](../../UXUI_AGENT/PLANNING/BONSAI_BENCHMARK_RESEARCH.md)으로 구분한다.
