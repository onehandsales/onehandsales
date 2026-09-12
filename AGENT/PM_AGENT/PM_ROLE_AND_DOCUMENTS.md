# PM 역할과 산출물

## 1. 목적

이 문서는 OneHand CRM에서 PM_AGENT가 맡아야 하는 역할과 작성해야 하는 문서를 정의한다.

PM_AGENT는 UX/UI 상세 설계나 API/DB 구현을 대신 작성하는 영역이 아니다. PM_AGENT의 책임은 제품이 풀 문제, 먼저 만족시킬 사용자, MVP 범위, 우선순위, 성공 기준을 결정하고 다른 역할이 실행할 수 있는 기준을 제공하는 것이다.

## 2. PM의 책임

PM은 다음 질문에 답해야 한다.

- 누구를 위해 만드는가?
- 사용자가 지금 어떤 문제를 겪는가?
- 이 제품이 기존 대안보다 왜 나은가?
- 이번 단계에서 반드시 만들어야 하는 것은 무엇인가?
- 이번 단계에서 의도적으로 하지 않을 것은 무엇인가?
- 성공과 실패를 어떤 기준으로 판단할 것인가?
- UX/UI와 Software가 임의로 해석하지 않도록 어떤 결정을 남겨야 하는가?

## 3. OneHand CRM에서 PM이 지켜야 할 기준

OneHand CRM의 최상위 제품 문장은 다음이다.

> CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비된다.

PM은 모든 기능, 문서, 로드맵을 이 문장에 비추어 판단한다.

우선순위가 높은 기능:

- 사용자가 CRM 구조를 직접 만들지 않아도 되게 하는 기능
- 직군별 업무 흐름을 잘 반영하는 Kit
- 첫 기록을 빠르게 만들게 하는 경험
- 기록, 관계, 상태, 다음 행동을 쉽게 이어주는 기능

우선순위가 낮거나 보류해야 하는 기능:

- 초기 사용자가 이해하기 어려운 builder 설정
- 특정 영업 도메인만 전역 기본값으로 고정하는 기능
- 제품 가설 검증 전 결제/구독/복잡한 권한을 먼저 붙이는 작업
- UX/UI 또는 DB 구현 세부를 PM 문서에서 과도하게 확정하는 작업

## 4. PM이 작성하는 문서

| 문서 | 목적 |
| --- | --- |
| `PRODUCT_DIRECTION.md` | 제품 방향, 포지셔닝, 하지 않는 것과 해야 하는 것을 정의한다. |
| `SERVICE_OVERVIEW.md` | 서비스를 한 문서로 이해할 수 있게 설명한다. |
| `PRD.md` | 제품 요구사항과 사용자 문제, 핵심 기능, 성공 기준을 정리한다. |
| `MVP_SCOPE.md` | 현재 단계에 포함할 것과 제외할 것을 결정한다. |
| `PERSONA.md` | 핵심 사용자와 Jobs-to-be-Done을 정의한다. |
| `KIT_STRATEGY.md` | Kit의 정의, 구성 요소, 첫 Kit 선정 기준을 정한다. |
| `FIRST_USE_EXPERIENCE.md` | 가입 후 첫 10분 경험과 activation 기준을 정의한다. |
| `CRM_CORE_CONCEPT_MODEL.md` | Workspace, Kit, Object, Attribute, Relationship, Record, View의 제품 개념을 정의한다. |
| `ROADMAP.md` | 제품을 어떤 순서로 만들지 단계별로 정리한다. |
| `SUCCESS_METRICS.md` | PM이 확인해야 할 활성화, 리텐션, 품질 지표를 정의한다. |
| `IMPLEMENTATION_STATUS.md` | 현재 코드에 실제로 존재하는 기능과 아직 없는 기능을 구분한다. |
| `DATA_MODEL.md` | 현재 구현 데이터 모델과 후속 제품 개념 모델의 경계를 설명한다. |

## 5. PM이 직접 작성하지 않는 것

PM_AGENT는 아래 내용을 최종 구현 기준으로 확정하지 않는다.

- 상세 화면 레이아웃
- 컴포넌트 구조
- 색상, 간격, 타이포그래피
- API request/response DTO
- Prisma schema 세부 필드
- transaction, repository, adapter 구조
- 테스트 코드 구조
- 배포 설정

위 항목은 UXUI_AGENT 또는 SOFTWARE_AGENT가 소유한다. 다만 PM은 그 작업들이 제품 문제와 MVP 범위에 맞는지 검토한다.

## 6. 역할 간 전달 방식

PM 문서는 다음 형태로 UX/UI와 Software에 기준을 넘긴다.

- 사용자 문제: 사용자가 왜 이 기능을 필요로 하는가
- 포함 범위: 이번 단계에서 반드시 가능한 행동은 무엇인가
- 제외 범위: 이번 단계에서 의도적으로 하지 않는 것은 무엇인가
- 우선순위: 어떤 흐름을 먼저 만들어야 하는가
- 성공 기준: 어떤 상태가 되면 완료로 볼 수 있는가
- 결정 기록: 왜 이 방향으로 결정했는가

## 7. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/README.md`
- `AGENT/PM_AGENT/OPERATING_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
