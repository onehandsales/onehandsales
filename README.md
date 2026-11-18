# OneHand CRM

Bonsai(hellobonsai.com)의 전체 제품 기능과 UX를 재현한 뒤 차별화하는 CRM 프로젝트다. 현재 코드는 범용 CRM 코어를 포함하며, Bonsai 업무 모델과 화면으로의 전환은 아직 조사·설계 단계다.

2026-11-17 사용자 방향을 반영한 [PM 036](AGENT/PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md)을 따른다. 제품명과 저장소 이름은 유지한다. 과거 직군별 Kit 전략과 2026-11-14 개발 보류 기록은 [당시 회고](AGENT/PM_AGENT/PLANNING/PROJECT_RETROSPECTIVE.md) 등 역사 자료로 보존하며 현재 개발의 선행 조건으로 적용하지 않는다.

## 현재 방향

- **제품·UX 기준**: Bonsai. 고객·거래에서 견적·합의 문서, 프로젝트·작업·시간, 청구·입금까지의 흐름을 재현한다.
- **화면 조사**: Gummble MCP와 실제 Bonsai 계정. 공식 도움말로 업무 의미를, 공식 REST API 문서로 공개 계약을 대조한다. Gummble은 UX 조사 도구다.
- **데이터 설계**: 고객 기본정보, 거래 조건, 견적 원본, 발송·서명 문서, 수행 기록, 청구와 실제 입금의 책임·상태를 구분한다. 관계와 개수는 기능별 계약에서 확정한다.
- **DB 교체 방향**: 인증·사용자·Workspace를 유지 검토의 출발점으로 두고 기존 범용 코어를 교체·재설계한다. 화면·업무 요구와 API·FE·데이터 보존 의존을 확인한 뒤 전환한다.
- **범위 관리**: 고객 포털·팀·인력·예산·보고서·자동화·연동·설정도 전체 대응 범위다. 구현은 기능별로 진행하며 특정 직군·업종·팀 규모로 제품을 임의 제한하지 않는다.
- **화면 제작**: 확보한 원본을 바탕으로 기존 React 앱에서 임시 데이터 화면과 계약 초안을 함께 만들 수 있다. Figma와 전체 제품 조사 완료는 필수 선행 단계가 아니다.

2026-11-17 조사 기록에는 주요 공식 자료 확인이 남아 있으며, Gummble 화면 수집과 실제 계정 동작 검증은 미확인이다. 이번 문서 정비에서도 외부 조회·계정 조작은 수행하지 않았다. 공개 API 문서는 Bonsai의 비공개 DB 구조가 아니므로 우리 DB는 별도 설계안으로 관리한다.

## 먼저 읽기

| 문서 | 목적 |
| --- | --- |
| [전환 결정](AGENT/PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md) | 변경한 방향과 이전 결정의 적용 상태 |
| [실행 순서](AGENT/PM_AGENT/PLANNING/ROADMAP.md) | 조사부터 기능별 화면·DB·API·FE 구현까지 |
| [현재 구현](AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md) | 실제 코드·DB·route와 미완성 기능 |
| [기능 대응표](AGENT/PM_AGENT/PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md) | 전체 범위와 조사·구현 차이 |
| [화면·공식 근거 조사](AGENT/UXUI_AGENT/PLANNING/BONSAI_BENCHMARK_RESEARCH.md) | 출처, MCP 상태, 미확인 동작 |
| [Gummble 조사 안내](AGENT/UXUI_AGENT/PLANNING/GUMMBLE_RESEARCH_GUIDE.md) | 화면·flow의 수집 절차와 확인 수준 |
| [DB 전환 설계안](AGENT/SOFTWARE_AGENT/DB_SCHEMA/BONSAI_SCHEMA_PLAN.md) | 현재 32개 모델과 유지·교체·재설계 후보 |
| [API·FE 전환 영향](AGENT/SOFTWARE_AGENT/COMMON/BONSAI_TRANSITION_MATRIX.md) | 코드 의존과 전환 절차 |
| [Bonsai 학습 안내·플로우 색인](bonsai_analysis/README.md) | 전체 기능·업무 개념·공식 근거와 플로우 원본을 연결하는 학습 자료 |
| [문서 검토 기록](AGENT/SOFTWARE_AGENT/COMMON/DOCUMENTATION_REVIEW_20261117.md) | 최초 전환과 후속 정비의 범위·검증 결과 |

## 저장소

```text
AGENT/       제품·UX·Software 정본
BE/          NestJS + Prisma, modular monolith
FE/user-web/ React 사용자 앱과 공개 사이트
FE/admin-web/ 관리자 권한 확인 앱
```

백엔드는 실제 MSA가 아니다. module별 Clean Architecture와 공개 application port를 사용한다. 프런트엔드는 기존 React/Vite 기반을 유지하며 Bonsai의 업무별 화면·권한·상태에 맞춰 전환한다.

현재 Auth/Workspace와 범용 Object/List/Attribute/Record/View API, TABLE/KANBAN/LIST 화면 일부가 존재한다. 견적·문서·프로젝트·청구·입금 모델과 완성된 업무 흐름은 전환 대상이며 현재 구현 완료 상태가 아니다.

## 작업 순서

1. 고객·거래 등 해당 기능의 원본 화면·flow·상태와 업무 근거를 수집한다.
2. 기존 프런트엔드에서 화면을 만들며 같은 흐름의 API·DB·권한·계산·상태 계약을 설계한다.
3. 실제 API 연동 전에 해당 계약을 확정한다.
4. 기능별 DB/API/FE를 함께 구현하고 저장·재조회·오류·권한과 원본 차이를 검증한다.
5. 필요한 데이터 이전과 참조 제거 후 불필요한 구조를 정리하고 다음 기능으로 확장한다.

문서 전환만으로 실제 DB를 초기화하지 않는다. 과거 migration은 적용 이력으로 보존한다.

## 개발과 검증

환경·실행 명령은 [BE README](BE/README.md), [FE README](FE/README.md), [환경 정책](AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md)을 따른다. 환경 파일의 비밀값을 문서·로그에 넣지 않는다.

에이전트 작업은 [AGENTS.md](AGENTS.md)와 [AGENT 사용 규칙](AGENT/AGENT_USAGE_RULES.md)을 먼저 읽는다. 사용자 요청 범위가 문서 점검이면 코드 변경·DB 배포·커밋을 자동 수행하지 않는다.
