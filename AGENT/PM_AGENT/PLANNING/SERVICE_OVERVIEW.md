# 서비스 기획 개요

## 1. 서비스 정의

OneHand CRM은 사용자가 CRM을 배우거나 직접 설계하지 않아도, 자기 일에 맞는 CRM을 바로 시작할 수 있게 만드는 No Setup CRM이다.

사용자는 처음부터 `Object`, `Field`, `Relation`, `View`를 만들지 않는다. 대신 무슨 일을 하는지 알려주고, 제품은 해당 업무에 필요한 관리 대상, 관계, 상태, 기본 보기, 다음 행동을 포함한 Kit을 준비한다.

핵심 문장:

> CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비된다.

제품 철학:

> Ready-made, but never locked.

## 2. 현재 제품 상태

현재 구현은 고정형 고객사 관리 기능을 제거한 전환 상태다.

남아 있는 활성 foundation:

- 인증과 앱 세션
- 사용자 프로필, 연결 계정, 기기, 세션 관리
- 오류 신고
- 지원 문의
- 공개 문의
- Health check
- 관리자 권한 확인

아직 구현되지 않은 핵심 제품 범위:

- Workspace
- Kit
- Object/Attribute/Relationship
- Record
- List/View
- 직군별 첫 CRM 생성 흐름
- Kit 기반 업무 화면

## 3. 대상 사용자

OneHand CRM의 초기 대상은 CRM을 전문적으로 운영하는 관리자보다, 자기 업무를 바로 정리해야 하는 개인과 소규모 팀이다.

- 1인 사업자와 개인 영업자
- 부동산 중개사
- 보험/재무 상담사
- 헤드헌터와 채용 컨설턴트
- 프리랜서와 컨설턴트
- 교육, 코칭, 상담 업무자
- 기존 CRM이 무겁고 스프레드시트가 한계에 온 소규모 팀

공통점은 팀 규모가 아니라 업무 흐름이다. 이들은 고객, 상담, 제안, 후속 연락, 상태 변화를 계속 관리하지만, CRM 구조를 직접 설계할 시간과 전문성이 부족하다.

## 4. 핵심 문제

- 직업마다 관리해야 할 대상과 관계가 다르다.
- 기존 쉬운 CRM은 구조가 고정되어 업무가 조금만 달라져도 맞지 않는다.
- 자유로운 CRM이나 DB 도구는 시작 전에 구조를 직접 설계해야 한다.
- 스프레드시트는 시작은 쉽지만 관계, 상태, 후속 행동, 검색, 기록 맥락이 약하다.
- 사용자는 CRM을 잘 만들고 싶은 것이 아니라 자기 일을 놓치지 않고 관리하고 싶다.

## 5. 제품 가치

OneHand CRM이 제공해야 하는 가치는 세 가지다.

| 가치 | 설명 |
| --- | --- |
| Zero Setup | 사용자가 빈 화면에서 CRM을 만들지 않아도 된다. |
| Work-aware | 직군별 업무 대상, 상태, 관계, 화면이 처음부터 맞아야 한다. |
| Infinite Expansion | 시작 구조에 갇히지 않고 업무 변화에 맞게 확장할 수 있다. |

## 6. 제품 경험 요약

초기 사용 흐름은 아래 방향이어야 한다.

1. 사용자가 가입한다.
2. 제품이 "무슨 일을 하시나요?"를 묻는다.
3. 사용자가 직군 또는 업무 유형을 선택한다.
4. 제품이 해당 Kit으로 Workspace를 준비한다.
5. 사용자는 바로 첫 기록을 만든다.
6. 제품은 다음 행동과 기본 보기를 제공한다.
7. 사용자가 다른 관리 대상이 필요해지는 순간 업무 언어로 확장을 제안한다.

## 7. 후속 설계 방향

다음 CRM 코어는 기존 고정 테이블을 되살리지 않는다.

PM 기준의 후속 개념은 아래 문서를 우선한다.

- `CRM_CORE_CONCEPT_MODEL.md`
- `KIT_STRATEGY.md`
- `FIRST_USE_EXPERIENCE.md`
- `MVP_SCOPE.md`

Software 문서는 이 개념을 바탕으로 Prisma schema, API, 권한, migration, 테스트 기준을 별도로 확정한다.

## 8. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
