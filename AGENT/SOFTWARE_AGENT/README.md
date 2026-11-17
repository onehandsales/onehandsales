# SOFTWARE_AGENT

참고 기준 갱신: 2026-11-17. 과거 구현·검증 날짜는 아래 기록을 따른다.

Bonsai 전환을 위한 API·DB·FE/BE 구조와 검증 기준을 관리한다. 현재 코드는 이미 Workspace와 범용 CRM 코어를 포함한다. [현재 구현](../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)을 기준으로 하고 목표를 완료 상태로 표현하지 않는다.

## 정본

- [현재/목표 경계](COMMON/IMPLEMENTATION_BOUNDARY.md)
- [전환 의존·순서](COMMON/BONSAI_TRANSITION_MATRIX.md)
- [DB 계획](DB_SCHEMA/BONSAI_SCHEMA_PLAN.md)
- [DB 문서 목록](DB_SCHEMA/README.md)
- [Backend](BACKEND_AGENT/README.md)
- [Frontend](FRONT_AGENT/README.md)
- [환경](COMMON/ENVIRONMENT.md), [API 목록](COMMON/API_SAMPLE.md), [QA](COMMON/QA_CHECKLIST.md)

## 기술 원칙

백엔드는 단일 NestJS modular monolith + Clean Architecture다. 다른 모듈의 Prisma repository를 직접 사용하지 않고 공개 application/query port로 협력한다. 트랜잭션 경계는 application이 소유한다.

프런트는 User Web/Admin Web의 독립 앱 구조와 feature 경계를 유지한다. mock 화면 검토는 가능하나 실제 연동 전에 API·오류·권한 계약을 정한다.

DB는 고객·거래·견적·문서·수행·청구의 명시적 업무 모델과 필요한 사용자 필드·보기 확장을 함께 검토한다. 모든 동적 기능을 없애거나 기존 모델 이름만 바꾸지 않는다. 실제 제거는 데이터·API·FE·테스트 의존을 함께 처리한다.

제품 범위는 [PM 036](../PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md), 화면 기준은 [UX 025](../UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md)를 따른다.
