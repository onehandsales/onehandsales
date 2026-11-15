# OneHand CRM

folk의 제품 기능과 UX를 기준으로 전환 중인 CRM 프로젝트다. 현재 코드는 Attio식 범용 CRM 코어를 포함하며, folk 구조로의 전환은 아직 계획 단계다.

2026-11-15 사용자 결정으로 기존 Notion·Attio 혼합 기준과 직군별 Kit 전략을 대체했다. 제품명과 저장소 이름은 유지한다. 2026-11-14 개발 보류 기록은 [당시 회고](AGENT/PM_AGENT/PLANNING/PROJECT_RETROSPECTIVE.md)로 보존한다.

## 현재 방향

- **제품·UX 기준**: folk. 기능, 화면 구조, 사용자 흐름과 상호작용을 대응시킨다.
- **화면 조사**: Nicelydone MCP와 실제 folk 계정. 공식 도움말/API로 의미를 검증한다.
- **데이터 설계**: 기본 연락처와 그룹별 확장을 중심으로 단순화한다. 불필요한 범용 구조는 의존·데이터 검토 후 제거한다.
- **범위 관리**: 전체 대응이 목표이며 구현은 단계별로 진행한다. 타겟 직군이나 개인 전용 제품으로 임의 축소하지 않는다.

Nicelydone 화면 수집은 아직 수행하지 않았다. 공개 문서는 folk의 실제 내부 DB를 보여주지 않으므로 데이터베이스 구조는 우리 구현을 위한 설계안으로 관리한다.

## 먼저 읽기

| 문서 | 목적 |
| --- | --- |
| [전환 결정](AGENT/PM_AGENT/DECISIONS/036_folk_benchmark_transition.md) | 변경한 방향과 이전 결정의 적용 상태 |
| [현재 구현](AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md) | 실제 코드·DB·route와 미완성 기능 |
| [기능 대응표](AGENT/PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md) | 최종 범위와 구현 순서 |
| [화면·공식 근거 조사](AGENT/UXUI_AGENT/PLANNING/FOLK_BENCHMARK_RESEARCH.md) | 출처, MCP 상태, 미확인 동작 |
| [DB 전환 설계안](AGENT/SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md) | 현재 32개 모델과 유지·대체·제거 후보 |
| [API·FE 전환 영향](AGENT/SOFTWARE_AGENT/COMMON/FOLK_TRANSITION_MATRIX.md) | 코드 의존과 전환 절차 |
| [문서 검토 기록](AGENT/SOFTWARE_AGENT/COMMON/DOCUMENTATION_REVIEW_20261115.md) | 검토 범위와 검증 결과 |

## 저장소

```text
AGENT/       제품·UX·Software 정본
BE/          NestJS + Prisma, modular monolith
FE/user-web/ React 사용자 앱과 공개 사이트
FE/admin-web/ 관리자 권한 확인 앱
```

백엔드는 실제 MSA가 아니다. module별 Clean Architecture와 공개 application port를 사용한다. 프런트엔드는 기존 React/Vite 기반을 유지하며 folk 화면에 맞춰 전환한다.

현재 Auth/Workspace와 범용 Object/List/Attribute/Record/View API, TABLE/KANBAN/LIST 화면 일부가 존재한다. folk 전체 제품이 이미 구현됐다는 의미는 아니다.

## 작업 순서

1. 화면·flow·상태의 출처를 수집한다.
2. mock 프로토타입으로 흐름을 확인한다.
3. 같은 흐름의 API·권한·데이터 계약을 설계한다.
4. DB/API/FE를 함께 구현하고 검증한다.
5. 기존 데이터 이전과 참조 제거 후 불필요한 구조를 제거한다.

문서 전환만으로 실제 DB를 초기화하지 않는다. 과거 migration은 적용 이력으로 보존한다.

## 개발과 검증

환경·실행 명령은 [BE README](BE/README.md), [FE README](FE/README.md), [환경 정책](AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md)을 따른다. 환경 파일의 비밀값을 문서·로그에 넣지 않는다.

에이전트 작업은 [AGENTS.md](AGENTS.md)와 [AGENT 사용 규칙](AGENT/AGENT_USAGE_RULES.md)을 먼저 읽는다. 사용자 요청 범위가 문서 점검이면 코드 변경·DB 배포·커밋을 자동 수행하지 않는다.
