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
- `ViewDefinition`
- `KitDefinition`
- `WorkspaceKit` 또는 Kit snapshot 구조

즉 현재 단계는 Attio식 기본 원장 엔진은 잡혀 있고, 다음으로 업무 맥락과 보기 저장 구조를 추가해야 하는 상태다.

## 구현 순서 판단

첫 구현 순서는 다음으로 본다.

1. `SelectOption` 최소 사용 흐름을 마무리한다.
2. `StatusOption` 최소 사용 흐름을 마무리한다.
3. `RelationshipDefinition` 최소 사용 흐름을 마무리한다.
4. `ListDefinition`과 `ListEntry`를 설계한다.
5. `ViewDefinition`을 설계한다.
6. 첫 `KitDefinition` 또는 Kit snapshot 전략을 정한다.
7. 사이드바 API는 내부 모델명이 아니라 presentation 모델로 응답한다.

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
- `ListEntry`에 list 안에서만 쓰는 상태/메타데이터를 어디까지 둘지
- List 전용 필드를 `AttributeDefinition`으로 볼지, 별도 list-scoped field로 볼지
- Favorite이 List와 View를 모두 가리킬 수 있는지
- 사이드바 정렬을 모델별 `sortOrder`로 둘지, 별도 presentation 설정으로 둘지

## 참고 링크

- Attio workspace navigation: https://attio.com/help/reference/productivity-collaborating/navigating-your-workspace
- Attio records: https://attio.com/help/reference/attio-101/attios-data-model/understanding-records
- Attio lists: https://attio.com/help/reference/managing-your-data/lists/create-lists
- folk data model: https://help.folk.app/en/articles/9790806-folk-data-model
- folk groups and sidebar: https://help.folk.app/en/articles/4970706-create-groups-manage-your-sidebar
- folk views: https://help.folk.app/en/articles/4998224-create-views
