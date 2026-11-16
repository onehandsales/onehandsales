# AGENT

제품·UX·Software 문서의 정본 공간이다. 현재 방향은 **folk 기능·UX 벤치마킹**이며, 과거 Kit·이전 참고 결정은 역사 자료로 구분한다.

## 시작 순서

1. [사용 규칙](AGENT_USAGE_RULES.md)
2. [현재 확정 결정](PM_AGENT/DECISIONS/000_확정_결정.md), [folk 전환 결정](PM_AGENT/DECISIONS/036_folk_benchmark_transition.md)
3. [제품 방향](PM_AGENT/PLANNING/PRODUCT_DIRECTION.md), [기능 대응표](PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md)
4. [현재 구현](PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)
5. [UX 기준](UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md), [화면·근거 조사](UXUI_AGENT/PLANNING/FOLK_BENCHMARK_RESEARCH.md)
6. [Software 기준](SOFTWARE_AGENT/README.md), [전환 영향](SOFTWARE_AGENT/COMMON/FOLK_TRANSITION_MATRIX.md), [DB 계획](SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md)
7. 해당 작업의 아키텍처·컨벤션·검토 기준.

## 역할

| 영역 | 책임 |
| --- | --- |
| [PM_AGENT](PM_AGENT/README.md) | 기능 범위·우선순위·제품 개념·수용 기준·결정 |
| [UXUI_AGENT](UXUI_AGENT/README.md) | 원본 근거·화면·flow·상태·상호작용 |
| [SOFTWARE_AGENT](SOFTWARE_AGENT/README.md) | API·DB·FE/BE 경계·검증·배포 |

제품 범위와 UX, 기술 계약을 서로 연결한다. 모델 단순화가 제품 기능 삭제로 이어지거나, 화면만 닮고 데이터 의미가 달라지는 경우를 함께 검토한다.

## 문서 사용

- 현재 구현 사실은 IMPLEMENTATION_STATUS와 실제 소스로 확인한다.
- 목표 기능은 대응표, 미확인 사항은 조사 문서, DB 제안은 FOLK_SCHEMA_PLAN으로 구분한다.
- Historical/Superseded 문서의 기존 금지·착수 조건은 현행 규칙이 아니다.
- “AGENT 학습” 요청은 모든 Markdown 문서를 대상으로 하되 사용자 제외 범위를 우선한다.
- 이번 문서 전환 검토는 TODO 및 TODO_LOG를 제외한다. 기존 링크의 대상도 읽지 않는다.

[문서 작성 규칙](PM_AGENT/CONVENTION/DOCUMENTATION.md), [기획 검토 기준](PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md)을 따른다. 사용자 요청이 이미 검토를 포함하면 확인을 반복하지 않고 검토 결과를 남긴다.
