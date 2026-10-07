# Attio Modeling And folk Presentation Decision

## 목적

이 문서는 OneHand CRM의 `List`, `View`, `Sidebar` 후속 설계에서 Attio와 folk를 어떻게 참고할지 정리한다.

현재 결론은 다음과 같다.

```text
데이터 모델링: Attio식 구조를 유지한다.
사용자 표현: folk처럼 업무 언어를 먼저 보여준다.
```

monday.com은 이번 판단 범위에서 제외한다. OneHand CRM은 범용 업무 보드보다 CRM 원장, 관계, 업무 맥락을 우선하기 때문이다.

## 핵심 결론

OneHand CRM은 내부적으로 Attio식 `Object / Attribute / Record / List / View` 구조를 가져간다.

다만 사이드바와 첫 화면에서 `Records`, `Lists`, `Views`, `Favorites` 같은 제품 구조 용어를 그대로 노출하지 않는다. 사용자는 모델을 이해하려고 들어오는 것이 아니라 지금 해야 할 일을 찾으러 들어오기 때문이다.

따라서 화면에서는 다음처럼 번역한다.

| 내부 개념 | 사용자 화면 표현 | 설명 |
| --- | --- | --- |
| `ObjectDefinition` / Records | 관리 대상 | 회사, 사람, 딜, 매물, 사건처럼 CRM에서 관리하는 항목 타입 |
| `RecordDefinition` | 항목 | 특정 회사, 특정 사람, 특정 딜 같은 실제 데이터 |
| `AttributeDefinition` | 필드 | 이름, 이메일, 단계, 금액, 날짜 같은 입력/표시 값 |
| `SelectOption` | 선택 옵션 | 출처, 유형, 우선순위 같은 선택값 |
| `StatusOption` | 단계 / 상태 | 파이프라인, 진행 단계, 처리 상태 |
| `RelationshipDefinition` | 연결 | 사람-회사, 딜-회사, 사건-의뢰인 같은 관계 |
| `ListDefinition` | 업무 | 신규 리드, 고객 온보딩, 방문 예정, 진행 중 사건 같은 업무 맥락 |
| `ListEntry` | 업무에 포함된 항목 | 같은 Record가 여러 업무에 참여할 수 있는 연결 |
| `ViewDefinition` | 보기 / 화면 | 테이블, 파이프라인, 필터/정렬이 저장된 화면 |
| Favorite List/View | 자주 보는 화면 | 자주 쓰는 업무 또는 보기 shortcut |
| `KitDefinition` | 업종 템플릿 | 업종별 초기 CRM 설치 패키지 |

## Attio와 folk의 차이

Attio와 folk는 추상 모델만 보면 비슷한 계열이다.

```text
Record
Field / Attribute
업무 맥락 컨테이너
View
Favorite
```

하지만 사이드바의 철학은 다르다.

Attio는 원장과 업무공간의 구분을 비교적 직접 보여준다.

```text
Records
  Companies
  People
  Deals

Lists
  Sales pipeline
  Recruiting
  Strategic accounts
```

folk는 사용자가 해야 할 업무 이름을 더 앞에 둔다.

```text
Groups
  Leads
  Clients
  Candidates

Views
  Table
  Pipeline
```

따라서 두 제품은 "말만 다른 같은 구조"라기보다, 비슷한 데이터 재료를 서로 다른 사용자 경험으로 보여주는 제품에 가깝다.

OneHand는 이 중간 지점을 선택한다.

```text
엔진과 DB: Attio처럼 탄탄한 원장/업무/보기 구조
사이드바와 첫 화면: folk처럼 업무 이름 중심
```

## 현재 DB 상태

현재 `BE/prisma/schema.prisma`에는 CRM Core의 기본 골격이 이미 있다.

- `Workspace`
- `ObjectDefinition`
- `AttributeDefinition`
- `RecordDefinition`
- `RecordAttributeValueDefinition`
- `SelectOption`
- `StatusOption`
- `RelationshipDefinition`

아직 없는 후속 개념은 다음이다.

- `ListDefinition`
- `ListEntry`
- List 전용 Attribute 지원
- `ListEntryAttributeValue`
- `ViewDefinition`
- `KitDefinition`
- `WorkspaceKit` 또는 Kit snapshot 구조

즉 현재 단계는 Attio식 기본 원장 엔진은 잡혀 있고, 다음으로 업무 맥락과 보기 저장 구조를 추가해야 하는 상태다.

## List 데이터 모델 구성안

확인 기준일: 2026-10-07

List에는 `List`, `ListEntry`, `ListAttribute`, `ListEntryValue` 네 가지 개념이 필요하다. 현재 우리 구조에서는 **핵심 신규 테이블 3개 + 기존 AttributeDefinition 확장**을 권장한다. 아래 이름과 구성은 설계 제안이며, 실제 Prisma schema 또는 migration에 반영된 상태는 아니다.

Attio 공식 문서는 Object와 List가 각각 Attribute를 가질 수 있고, Record를 List에 추가하면 그 Record를 참조하는 ListEntry가 생성된다고 설명한다. 이 공개 개념과 API를 우리 DB 구조로 옮긴 제안이며, Attio 내부의 실제 물리 테이블 구성을 의미하지 않는다. [Attio Objects and lists](https://docs.attio.com/docs/objects-and-lists)

### 필요한 개념과 테이블

| 필요한 개념 | 테이블 구성안 | 저장 책임 | 영업 예시 |
| --- | --- | --- | --- |
| List | `ListDefinition` 신규 | Workspace 안의 업무 묶음 정의 | 신규 영업 |
| ListEntry | `ListEntry` 신규 | 특정 List에 특정 Record가 참여한 한 건 | 김민수가 신규 영업에 참여한 항목 |
| ListAttribute | 기존 `AttributeDefinition` 확장 | 해당 업무에서 관리할 정보의 이름과 타입 | 영업 단계: Status, 관심 상품: Select |
| ListEntryValue | `ListEntryAttributeValue` 신규 | 각 참여 항목의 List 전용 Attribute 실제 값 | 김민수의 영업 단계 = 상담 중 |

`ListDefinition`은 업무 자체를 정의하고, `ListEntry`는 그 업무에 참여한 항목을 저장한다. `ListEntryAttributeValue`는 각 참여 항목이 가진 업무 전용 값을 저장한다.

### 현재 스키마에서 확장할 부분

현재 [Prisma schema](../../BE/prisma/schema.prisma)의 AttributeDefinition은 `objectDefinitionId`가 필수이므로 Object 소속만 지원한다. RecordAttributeValueDefinition도 `recordDefinitionId`가 필수이므로 Record의 값을 저장한다.

권장안을 채택할 경우의 방향은 다음과 같다.

- AttributeDefinition에 List 소속을 표현할 수 있게 한다. Attribute 하나는 Object 또는 List 중 정확히 한 곳에 속하도록 설계한다.
- Object 전용 값은 기존 RecordAttributeValueDefinition에 저장한다.
- List 전용 값은 신규 ListEntryAttributeValue에 저장한다.
- ListEntry는 `listDefinitionId`와 `recordDefinitionId`로 업무와 원본 Record를 연결한다.
- SelectOption과 StatusOption은 기존 AttributeDefinition 참조 구조를 활용한다. 각 Attribute마다 자기 옵션 row를 갖는다.

이 구조에서는 `ListAttribute`라는 개념을 위해 반드시 별도 테이블을 만들 필요는 없다. List에 속한 AttributeDefinition이 ListAttribute 역할을 한다. Attio의 Attribute 생성 API도 Object 또는 List를 대상으로 같은 Attribute 개념을 사용한다. [Attio Create an attribute](https://docs.attio.com/rest-api/endpoint-reference/attributes/create-an-attribute)

Attribute를 두 소속에 사용할 수 있게 바꾸면 소속별 apiSlug 중복 규칙, 인덱스, 기존 API의 Object 범위 검증도 함께 검토해야 한다. 값의 Entry와 Attribute, 선택한 옵션이 같은 List 및 Workspace 범위에 속하는지 검증해야 한다. Object용 양방향 Relationship의 범위를 List로 확대할지는 별도 설계 대상이다.

### 영업 예시: ListEntry 두 개

고객 Object에 김민수와 이영희라는 Record가 이미 있다고 가정한다. 두 고객을 신규 영업 List에 추가하면 화면에서 다음처럼 볼 수 있다.

| 고객 | 영업 단계 | 관심 상품 |
| --- | --- | --- |
| 김민수 | 상담 중 | 기본형 |
| 이영희 | 계약 완료 | 프리미엄 |

각 데이터의 저장 위치는 다음과 같다. 아래 ID는 이해를 위한 예시다.

```text
ListDefinition
  L1: 신규 영업

AttributeDefinition
  A1: L1의 영업 단계 → 타입: Status
  A2: L1의 관심 상품 → 타입: Select

ListEntry
  E1: L1 + 김민수 Record 참조
  E2: L1 + 이영희 Record 참조

ListEntryAttributeValue
  E1 + A1 → 상담 중의 statusOptionId
  E1 + A2 → 기본형의 selectOptionId
  E2 + A1 → 계약 완료의 statusOptionId
  E2 + A2 → 프리미엄의 selectOptionId
```

김민수의 이름과 전화번호는 기존 Record의 Attribute 값에서 가져온다. 신규 영업에서의 단계와 관심 상품은 E1의 List 전용 값에서 가져온다. Attio도 Object Attribute 값은 Record에, List Attribute 값은 ListEntry에 저장한다고 구분한다. [Attio Understanding lists](https://attio.com/help/reference/attio-101/attios-data-model/understanding-lists)

김민수를 파트너 모집 List에도 추가하면 같은 김민수 Record를 참조하는 별도 ListEntry가 생긴다. 신규 영업의 단계와 파트너 모집의 단계는 각 업무에서 독립적으로 관리할 수 있다.

### Select와 Status를 활용하는 방식

Select와 Status는 Attribute의 타입이다. 이 타입을 List에 속한 Attribute에서도 사용한다.

```text
AttributeDefinition A1: 영업 단계, 타입 = Status
  StatusOption: 상담 전 / 상담 중 / 계약 완료

AttributeDefinition A2: 관심 상품, 타입 = Select
  SelectOption: 기본형 / 프리미엄

ListEntryAttributeValue
  E1의 A1 값 → 상담 중의 StatusOption 참조
  E1의 A2 값 → 기본형의 SelectOption 참조
```

따라서 권장안에서는 List 전용 SelectOption 테이블이나 StatusOption 테이블을 추가하지 않는다. 기존 테이블에 해당 List Attribute의 옵션 row를 만들고, ListEntryAttributeValue가 선택한 옵션을 참조한다. 단계의 값은 각 ListEntry에 저장되며, View는 그 값을 표나 단계별 화면으로 보여준다.

### 대안과 구현 전 결정할 정책

List 전용 필드 정의를 별도 `ListAttributeDefinition` 테이블로 분리하는 방식도 가능하다. 이 경우 핵심 신규 테이블은 네 개가 되고, SelectOption과 StatusOption이 List 전용 필드를 어떻게 참조할지도 함께 설계해야 한다. 기존 Attribute와 옵션 구조를 활용할 수 있다는 이유로 현재는 AttributeDefinition 확장안을 권장하지만, 최종 schema 선택은 확정하지 않는다.

다음 정책은 구현 전에 정한다.

- List에 담을 Object 범위: Attio는 새 List를 생성할 때 하나의 기준 Object를 선택한다. OneHand의 최종 범위는 별도 결정한다. [Attio Create a list](https://docs.attio.com/rest-api/endpoint-reference/lists/create-a-list)
- 같은 Record가 같은 List에 여러 ListEntry로 참여할 수 있는지: 현재 Attio는 허용한다. OneHand에서도 허용한다면 `listDefinitionId + recordDefinitionId` 조합에 중복 금지 제약을 걸면 안 된다. [Attio Create an entry](https://docs.attio.com/rest-api/endpoint-reference/entries/create-an-entry-add-record-to-list)
- ListEntry 값의 변경 이력과 삭제·복구 정책: 현재 값 저장과 과거 이력 저장 범위를 구분해서 설계한다. Attio는 ListEntry Attribute 값의 과거 이력을 조회하는 API를 제공한다. [Attio List entry attribute values](https://docs.attio.com/rest-api/endpoint-reference/entries/list-attribute-values-for-a-list-entry)

List, Entry, Attribute, 옵션, 값의 연결 범위와 기존 Record 보존 동작을 검토한 뒤 API 계약과 migration 계획을 작성한다.

## 구현 순서 판단

첫 구현 순서는 다음으로 본다.

1. `SelectOption` 최소 사용 흐름을 마무리한다.
2. `StatusOption` 최소 사용 흐름을 마무리한다.
3. `RelationshipDefinition` 최소 사용 흐름을 마무리한다.
4. `ListDefinition`, `ListEntry`, List 전용 Attribute, `ListEntryAttributeValue`를 함께 설계한다.
5. `ViewDefinition`을 설계한다.
6. 첫 `KitDefinition` 또는 Kit snapshot 전략을 정한다.
7. 사이드바 API는 내부 모델명이 아니라 presentation 모델로 응답한다.

사용자가 정한 작업 순서는 `Select → Status → Relationship → List → View → Kit`이다. 직종별 Kit에서 서로 다른 List와 View를 제공할 수 있도록 공통 기능을 먼저 마련한다.

`Select`, `Status`, `Relationship`을 먼저 끝내야 하는 이유는 `List`와 `View`가 결국 이 값들을 기준으로 필터링, 그룹핑, 파이프라인 표시를 하기 때문이다.

예시:

```text
업무: 신규 리드
View: 파이프라인 보기
Group by: 리드 단계(Status)
Filter: 리드 출처(Select) = 홈페이지
Card fields: 사람, 회사, 금액, 다음 연락일
Relationship: 딜 -> 회사, 딜 -> 사람
```

## Sidebar Presentation 기준

사용자에게 보이는 기본 사이드바는 `Records / Lists / Favorites`를 그대로 쓰지 않는다.

권장 표현은 다음이다.

```text
내 CRM
  오늘 할 일
  고객 찾기
  대시보드

업무
  신규 리드
  고객 온보딩
  방문 예정
  진행 중 계약

관리 대상
  사람
  회사
  딜
  매물
  사건

자주 보는 화면
  오늘 팔로업
  미응답 고객
  이번 주 계약 가능성
```

내부적으로는 `업무`가 `ListDefinition`, `관리 대상`이 `ObjectDefinition`, `자주 보는 화면`이 favorite 처리된 `ViewDefinition` 또는 `ListDefinition`을 가리킨다.

## Kit별 표현 예시

### 영업 Kit

```text
업무
  신규 리드
  고객 온보딩
  파트너 후보
  갱신 관리

관리 대상
  회사
  사람
  딜

자주 보는 화면
  오늘 팔로업
  미응답 리드
  이번 주 계약 가능성
```

### 부동산 Kit

```text
업무
  방문 예정
  매수 희망 고객
  계약 진행
  매물 매칭

관리 대상
  고객
  매물
  집주인
  계약

자주 보는 화면
  오늘 방문
  새 매물 매칭
  계약 단계
```

### 법률 Kit

```text
업무
  신규 상담
  진행 중 사건
  서류 요청
  기일 관리

관리 대상
  의뢰인
  사건
  상대방
  문서

자주 보는 화면
  이번 주 기일
  서류 미제출
  긴급 사건
```

## 설계 원칙

- `ObjectDefinition`, `AttributeDefinition`, `RecordDefinition`, `apiSlug` 같은 내부 모델명은 기본 화면에 노출하지 않는다.
- `ListDefinition`은 Record를 복사하지 않는다. 기존 Record를 업무 맥락에 참여시킨다.
- `ViewDefinition`은 데이터를 새로 만들지 않는다. 필터, 정렬, 표시 필드, 그룹 기준, 레이아웃만 저장한다.
- folk의 `Group` 느낌은 OneHand에서 별도 최상위 모델로 복제하지 않는다. 사용자 화면의 `업무` 표현으로 흡수하고, 내부 구현은 Attio식 `ListDefinition`으로 둔다.
- `Favorites`는 별도 데이터 원장이 아니라 자주 쓰는 `ListDefinition` 또는 `ViewDefinition` shortcut으로 본다.
- 첫 사용자 경험에서는 `관리 대상`보다 `업무`를 먼저 보여준다.
- 고급 사용자는 설정 안에서 `관리 대상`, `필드`, `연결`, `보기` 구조를 편집할 수 있게 한다.

## 보류 결정

아래는 구현 전에 별도 결정이 필요하다.

- 한 Workspace에 여러 Kit을 적용할 수 있는지
- Kit 업데이트가 기존 Workspace에 어떻게 반영되는지
- List에 담을 Object 범위와 같은 Record의 같은 List 내 중복 참여 허용 여부
- ListEntry 값의 변경 이력과 삭제·복구 범위
- List 전용 필드를 기존 AttributeDefinition 확장으로 구현할지, 별도 ListAttributeDefinition으로 구현할지: 위 구성안에서는 확장을 권장하며 최종 선택은 보류
- Favorite이 List와 View를 모두 가리킬 수 있는지
- 사이드바 정렬을 모델별 `sortOrder`로 둘지, 별도 presentation 설정으로 둘지

## 참고 링크

- Attio workspace navigation: https://attio.com/help/reference/productivity-collaborating/navigating-your-workspace
- Attio records: https://attio.com/help/reference/attio-101/attios-data-model/understanding-records
- Attio lists: https://attio.com/help/reference/managing-your-data/lists/create-lists
- folk data model: https://help.folk.app/en/articles/9790806-folk-data-model
- folk groups and sidebar: https://help.folk.app/en/articles/4970706-create-groups-manage-your-sidebar
- folk views: https://help.folk.app/en/articles/4998224-create-views
