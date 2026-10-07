# CRM View Sidebar Presentation Plan

## 목적

OneHand CRM은 `Object`, `Attribute`, `Record` 기반의 범용 CRM 엔진을 갖고 간다. 다만 이 내부 구조를 그대로 화면에 노출하면 사용자는 CRM이 아니라 스프레드시트처럼 느낄 수 있다.

이 계획의 목적은 Attio식 데이터 모델을 기준으로 `Records`, `Lists`, `Views`, `Kit`의 역할을 정리하고, 사용자 사이드바와 기본 화면을 CRM답게 재구성하는 것이다.

## 제품 기준

OneHand CRM의 기준은 다음 조합으로 본다.

```text
데이터 모델: Attio식
사용 경험: Notion식
CRM 업무 표현: folk 참고
```

folk는 `Leads`, `Clients`, `Partners` 같은 관계 관리 표현을 참고하는 대상이다. 하지만 OneHand CRM의 구조 기준은 folk식 Group이 아니라 Attio식 `Records / Lists / Views`로 잡는다.

추가 결정 문서:

- [Attio 모델링과 화면 표현 결정](./ATTIO_FOLK_MODELING_AND_PRESENTATION_DECISION.md)
- [List 테이블 구성안과 영업 예시](./ATTIO_FOLK_MODELING_AND_PRESENTATION_DECISION.md#list-데이터-모델-구성안)

핵심 결정은 내부 데이터 모델링은 Attio식으로 유지하고, 실제 사이드바와 첫 화면 표현은 folk처럼 업무 이름 중심으로 번역한다는 것이다.

## 핵심 개념

### Records

`Records`는 사용자가 관리하는 기본 항목이다. 현재 DB 기준으로는 `ObjectDefinition`에 해당한다.

예시:

```text
영업: 회사, 사람, 딜
부동산: 고객, 매물, 집주인, 계약
법률: 의뢰인, 사건, 상대방, 문서
채용: 후보자, 고객사, 포지션
```

Records는 CRM 엔진의 원장이다. 사용자는 Records를 통해 “무엇을 관리하는지”를 이해한다.

### Lists

`Lists`는 특정 업무 목적을 위해 Records를 담아 쓰는 작업 공간이다. List는 Record를 복사하지 않고, 기존 Record를 특정 업무 맥락에 참여시킨다.

예시:

```text
영업: 인바운드 리드, 고객 온보딩, 파트너 후보
부동산: 방문 예정, 매수 희망 고객, 계약 진행
법률: 신규 상담, 진행 중 사건, 서류 요청
채용: 채용 파이프라인, 인터뷰 진행, 제안 대기
```

List 안에서는 해당 업무에서만 필요한 추가 정보가 붙을 수 있다.

예시:

```text
Records > 사람
  이름
  이메일
  전화번호

Lists > 채용 파이프라인
  후보자: 김민준
  지원 포지션
  채용 단계
  면접 일정
  평가
```

즉 `Records`는 원장이고, `Lists`는 업무 맥락이다.

### Views

`Views`는 Records 또는 Lists를 보는 방식이다.

예시:

```text
테이블 보기
파이프라인 보기
카드 보기
내 담당만 보기
이번 주 팔로업
최근 연락
미응답
```

View는 데이터를 새로 만드는 것이 아니라 필터, 정렬, 표시 필드, 그룹 기준, 레이아웃을 저장한다.

### Kit

`Kit`은 직종별 초기 CRM 설치 패키지다. Kit은 Records만 만드는 것이 아니라 Lists와 Views까지 함께 만든다.

예시:

```text
영업 Kit
  Records: 회사, 사람, 딜
  Lists: 인바운드 리드, 고객 온보딩, 파트너 후보
  Views: 딜 파이프라인, 이번 주 팔로업, 미응답 리드

부동산 Kit
  Records: 고객, 매물, 집주인, 계약
  Lists: 방문 예정, 매수 희망 고객, 계약 진행
  Views: 방문 일정, 매물 매칭, 계약 단계

법률 Kit
  Records: 의뢰인, 사건, 상대방, 문서
  Lists: 신규 상담, 진행 중 사건, 서류 요청
  Views: 사건 단계, 이번 주 기일, 서류 미제출
```

따라서 직종이 달라지면 Records뿐 아니라 Lists와 Views도 함께 달라진다.

## 사이드바 방향

Attio식 기준의 기본 사이드바는 다음처럼 본다.

```text
내 CRM
  홈
  검색
  할 일
  대시보드

Records
  회사
  사람
  딜
  매물
  사건

Lists
  인바운드 리드
  채용 파이프라인
  방문 예정
  진행 중 사건

Favorites
  오늘 팔로업
  이번 주 계약 가능성
  미응답 고객
```

`Records`는 전체 원장이고, `Lists`는 업무 흐름이다. `Favorites`는 자주 쓰는 View 또는 List shortcut이다.

## 숨길 것

다음 요소는 첫 화면이나 기본 사이드바에서 전면 노출하지 않는다.

- ObjectDefinition
- AttributeDefinition
- RecordDefinition
- RecordAttributeValueDefinition
- 내부 apiSlug
- 필드 순서
- 테이블 컬럼 설정
- RelationshipDefinition

이 요소들은 사용자가 필요할 때만 `View 설정`, `Record 설정`, `고급 설정`에서 열어볼 수 있게 한다.

## View 설정에 둘 것

`View 설정`은 현재 사용자가 보고 있는 화면을 조정하는 위치다.

- 보기 방식: table, card, pipeline
- 표시 필드
- 카드에 표시할 필드
- 필터
- 정렬
- 그룹 기준
- Status 컬럼
- Select 옵션 필터
- Relationship 표시
- 필드 추가 및 편집
- 고급: Object/Attribute/Record 구조 확인

## 필요한 모델 방향

현재 DB에는 `Workspace`, `ObjectDefinition`, `AttributeDefinition`, `RecordDefinition`, `RecordAttributeValueDefinition`, `SelectOption`, `StatusOption`, `RelationshipDefinition` 기반이 있다.

다음 단계에서는 아래 개념이 필요하다.

- `ListDefinition`
  - 이름
  - 대상 Workspace
  - 주로 다루는 Object
  - 사이드바 노출 여부
  - 기본 List 여부

- `ListEntry`
  - List에 들어간 Record
  - 업무 참여 항목마다 독립적인 ID를 갖고 원본 Record를 참조
  - 같은 Record가 여러 List에 들어갈 수 있는 구조

- List 전용 `AttributeDefinition`
  - 업무별 정보의 이름과 타입을 정의
  - 예: 영업 단계(Status), 관심 상품(Select), 다음 연락일(Date)
  - 현재 Object 소속만 지원하는 AttributeDefinition을 Object 또는 List 소속으로 확장하는 안을 권장
  - 별도 ListAttributeDefinition 테이블을 만드는 대안과 최종 선택은 후속 설계에서 검토

- `ListEntryAttributeValue`
  - 각 ListEntry의 List 전용 Attribute 실제 값
  - 예: 김민수의 신규 영업 참여 항목에 영업 단계 = 상담 중
  - SelectOption과 StatusOption을 참조하고, 원본 Record의 값과 구분하여 저장

- `ViewDefinition`
  - 이름
  - 대상 Object 또는 List
  - 보기 방식: table, card, pipeline
  - 표시 필드 목록
  - 필터 조건
  - 정렬 조건
  - 그룹 기준
  - 사이드바 또는 Favorite 노출 여부
  - 기본 View 여부

- `KitDefinition`
  - 직종별 기본 Records
  - 기본 Attributes
  - 기본 Relationships
  - 기본 Lists
  - 기본 Views
  - 기본 Status/Select options
  - 기본 사이드바 순서

List의 핵심 개념은 `List / ListEntry / ListAttribute / ListEntryValue` 네 가지다. 기존 AttributeDefinition을 확장하는 안에서는 핵심 신규 테이블을 `ListDefinition`, `ListEntry`, `ListEntryAttributeValue` 세 개로 구성할 수 있다. 이 이름과 테이블 구성은 설계 제안이며, 실제 Prisma schema 또는 migration에 반영된 상태는 아니다.

## 첫 구현 우선순위

1. Select → Status → Relationship 순서로 최소 사용 흐름을 마무리한다.
2. `ListDefinition`, `ListEntry`, List 전용 Attribute, `ListEntryAttributeValue`를 함께 설계한다.
3. `ViewDefinition` 초안을 설계한다.
4. 첫 Kit은 하나만 선택해서 Records, Lists, Views를 함께 생성하게 한다.
5. 사이드바를 `Records / Lists / Favorites` 구조로 바꾼다.
6. 기존 테이블 화면은 `Table View`로 유지한다.
7. Status 기준 `Pipeline View`를 제공한다.
8. 필드/속성 편집은 `View 설정` 또는 `고급 설정` 안으로 이동한다.

## 참고 이미지

사이드바 방향 예시는 같은 폴더의 `sidebar-view-layer-mockup.png`와 `sidebar-view-layer-mockup.svg`를 기준으로 본다.

이미지의 핵심은 다음과 같다.

- 사용자가 보는 사이드바는 Attio식 `Records / Lists / Favorites` 구조다.
- Records는 관리항목, Lists는 업무 맥락, Views는 보는 방식이다.
- 직종별 Kit은 Records뿐 아니라 Lists와 Views까지 함께 설치한다.
- 내부 데이터 구조는 기본 노출하지 않는다.
