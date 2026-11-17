# PM_AGENT

참고 기준 갱신: 2026-11-17. 과거 구현·검증 날짜는 아래 기록을 따른다.

Bonsai 전환의 기능 범위·제품 개념·우선순위·수용 기준을 관리한다. 최상위 방향은 [루트 README](../../README.md)와 [036 결정](DECISIONS/036_bonsai_benchmark_transition.md)이다.

## 정본

- [확정 결정](DECISIONS/000_확정_결정.md)
- [Planning 목록](PLANNING/README.md)
- [기능 대응표](PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md)
- [현재 구현](PLANNING/IMPLEMENTATION_STATUS.md)
- [PM 역할](PM_ROLE_AND_DOCUMENTS.md)
- [운영 모델](OPERATING_MODEL.md)
- [문서 규칙](CONVENTION/DOCUMENTATION.md)
- [기획 검토](CONVENTION/PLANNING_REVIEW_CHECKLIST.md)

## 원칙

전체 Bonsai 기능·UX 대응과 단계별 구현 범위를 구분한다. 타겟 직군·개인 전용 제품·첫 Kit을 임의로 확정하지 않는다. 과거 Kit 전략과 개발 보류는 역사 자료다.

현재 Workspace/CRM 코어는 이미 존재한다. 소스의 구현 상태, 목표 요구, 미확인 외부 동작, 내부 설계 제안을 구분한다. UX는 UXUI_AGENT, API/DB 상세는 SOFTWARE_AGENT가 관리한다.
