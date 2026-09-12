# CRM Core 개념 모델

Status: PM Concept Baseline
Date: 2026-09-12

## 1. 목적

이 문서는 OneHand CRM의 후속 CRM Core를 PM 관점에서 설명한다.

이 문서는 Prisma schema나 API 명세가 아니다. Software Agent가 구현 설계를 하기 전에, PM이 제품 개념과 사용자-facing 의미를 정의하기 위한 기준 문서다.

## 2. 핵심 원칙

다음 CRM Core는 기존 고정형 Company/Product/Deal 테이블을 되살리는 방식이 아니다.

OneHand CRM은 직군별 Kit을 통해 CRM 구조를 준비하고, 내부적으로는 유연한 모델을 사용해야 한다. 사용자는 내부 모델을 배우지 않아도 되고, 제품은 업무 언어로 구조를 설명해야 한다.

## 3. 개념 목록

| 개념 | PM 정의 | 사용자-facing 표현 |
| --- | --- | --- |
| Workspace | 사용자의 업무 CRM이 담기는 기본 공간 | 내 CRM, 내 업무 공간 |
| Kit | 특정 직군/업무에 맞춰 준비된 CRM 시작 구조 | 부동산 중개 CRM, 헤드헌팅 CRM |
| Object | 관리 대상의 종류 | 고객, 매물, 후보자, 상담, 계약 |
| Attribute | 기록에 필요한 정보 | 전화번호, 예산, 희망 지역, 상태 |
| Relationship | 두 기록 사이의 연결 | 고객과 매물 연결, 후보자와 공고 연결 |
| Record | 실제 하나의 기록 | 김민수 고객, 강남 매물, A사 공고 |
| List | 같은 Object의 Record를 모아보는 기본 목록 | 고객 목록, 매물 목록, 후보자 목록 |
| View | 기록을 목적에 맞게 보는 방식 | 상태별 보기, 예정된 일, 최근 상담 |
| Status | 업무 진행 상태 | 상담 중, 방문 예정, 계약 검토 |
| Next Action | 사용자가 다음에 해야 할 일 | 연락하기, 방문 잡기, 인터뷰 확인 |

## 4. Workspace

Workspace는 사용자의 CRM 데이터가 들어가는 기본 단위다.

PM 기준:

- MVP에서는 사용자가 복잡한 Workspace 설정을 하지 않아야 한다.
- 개인 사용자는 가입 후 기본 Workspace를 자동으로 받을 수 있어야 한다.
- Team/조직 권한은 Workspace와 관련될 수 있지만, MVP의 핵심 범위는 아니다.

## 5. Kit

Kit은 Workspace에 적용되는 업무 구조다.

PM 기준:

- Kit은 템플릿 파일이 아니다.
- Kit은 Object, Attribute, Relationship, List, View, Status, Next Action을 함께 정의한다.
- 한 Workspace에 Kit을 어떻게 변경/추가할지는 별도 정책이 필요하다.

## 6. Object

Object는 관리 대상의 종류다.

예:

- 부동산 중개 Kit: 고객, 매물, 소유자, 방문, 상담, 계약
- 헤드헌팅 Kit: 후보자, 회사, 채용공고, 인터뷰, 추천, Offer

PM 기준:

- Object라는 단어는 내부 용어다.
- 사용자에게는 "관리할 항목" 또는 실제 업무명으로 표현한다.
- Company/Product/Deal은 전역 Object가 아니라 특정 Kit 안의 Object일 수 있다.

## 7. Attribute

Attribute는 Record에 필요한 정보다.

PM 기준:

- 첫 기록에 필요한 필드는 최소화한다.
- 고급 필드는 나중에 추가하거나 접을 수 있어야 한다.
- 필드 설계는 사용자 입력 부담과 업무 필요성 사이의 균형을 가져야 한다.

## 8. Relationship

Relationship은 두 Record가 어떤 업무 관계를 가지는지 나타낸다.

예:

- 고객이 특정 매물에 관심 있다.
- 후보자가 특정 채용공고에 추천됐다.
- 상담이 특정 계약으로 이어졌다.

PM 기준:

- Relationship은 OneHand CRM이 단순 목록 앱이 아니라 CRM인 이유다.
- 사용자는 "관계 생성"이라는 말을 몰라도 되어야 한다.
- 연결은 업무 행동 중 자연스럽게 만들어져야 한다.

## 9. Record

Record는 실제 하나의 업무 기록이다.

PM 기준:

- 첫 MVP에서는 Record 생성, 조회, 수정이 핵심이다.
- 삭제, 복구, audit, 병합 같은 고급 기능은 후속 범위로 둘 수 있다.
- Record detail은 메모, 상태, 관계, 다음 행동을 중심으로 확장된다.

## 10. List

List는 같은 Object의 Record를 모아보는 기본 목록이다.

PM 기준:

- MVP에서는 모든 Object에 최소 1개의 기본 List가 필요하다.
- List는 사용자가 자신이 만든 Record를 다시 찾는 가장 기본적인 진입점이다.
- 고급 정렬/필터 builder보다 Kit별 기본 List를 우선한다.

## 11. View

View는 Record를 보는 방식이다.

PM 기준:

- MVP에서는 복잡한 view builder보다 Kit별 기본 보기를 우선한다.
- 기본 보기에는 목록, 상태별 보기, 예정된 행동 보기가 포함될 수 있다.
- 모바일에서는 가로로 넓은 테이블보다 스캔하기 쉬운 목록/카드 흐름을 우선한다.

## 12. 후속 결정 필요 항목

Software 구현 전 PM 결정이 필요한 항목:

- 한 사용자가 여러 Workspace를 가질 수 있는 시점
- 한 Workspace에 여러 Kit을 적용할 수 있는지
- Kit 변경 시 기존 Record를 어떻게 보존할지
- Object/Attribute/Relationship 커스터마이즈를 MVP에 포함할지
- Team 권한을 언제 Workspace에 연결할지

## 13. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/DECISIONS/033_workspace_team_scope_policy.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
