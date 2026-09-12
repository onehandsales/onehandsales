# OneHand CRM Monorepo

이 저장소는 `OneHand CRM`의 모노레포 루트다.

브랜드 표기는 아래를 기준으로 한다.

- 제품명: `OneHand CRM`
- 붙여 쓰는 브랜드 표기: `OneHandCRM`
- 도메인/slug/code 표기: `onehandcrm`

이 README는 제품 방향, 문서 갱신 기준, 저장소 구조, 실행 방법을 함께 담는 루트 기준 문서다.

핵심 문장:

> CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비된다.

OneHand CRM은 고정된 영업 CRM도, 빈 CRM builder도 아니다. 사용자가 어떤 일을 하는지 알려주면 그 일에 맞는 CRM 구조가 먼저 준비되고, 필요해지는 순간 업무 언어로 자연스럽게 확장되는 No Setup CRM을 목표로 한다.

## Product Direction

Status: Product Direction Draft / 후속 문서 갱신 기준 초안
Date: 2026-09-12

이 문서는 OneHand CRM 피벗의 제품 방향을 정리한다. 이후 `AGENT`, `BE`, `FE` 문서를 갱신할 때 이 README를 우선 기준으로 삼는다.

아직 세부 기능 명세나 DB schema 확정 문서는 아니다. 이 문서의 목적은 제품이 어떤 포지션으로 이동하는지, 어떤 메시지를 앞세우고 어떤 표현을 내려야 하는지, 후속 설계가 어떤 원칙을 지켜야 하는지 정리하는 것이다.

### 0. 핵심 결론

OneHand CRM의 가장 강한 판매 포인트는 "자유로운 CRM"도 아니고 "직업별 CRM"도 아니다.

가장 강한 문장은 아래다.

> CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비된다.

사용자에게 팔아야 하는 것은 자유도 자체가 아니다. 사용자가 얻는 진짜 가치는 CRM을 공부하지 않아도, 빈 화면에서 구조를 만들지 않아도, 자기 일이 돌아가는 방식에 맞는 CRM을 바로 시작할 수 있다는 점이다.

따라서 OneHand CRM의 제품 철학은 아래 문장으로 요약한다.

> Ready-made, but never locked.

처음에는 준비된 CRM처럼 쉽고, 필요해지면 자유로운 CRM처럼 확장된다. 다만 그 확장조차 사용자가 데이터 모델링을 배워서 직접 설계하는 방식이 아니라, 제품이 업무 언어로 제안하고 사용자는 짧은 결정만 하는 방식이어야 한다.

### 1. 서비스 이름

서비스 이름은 `OneHand CRM`으로 고정한다.

붙여 쓰는 브랜드 표기는 `OneHandCRM`을 사용한다. 도메인, slug, package, 환경 변수 prefix처럼 공백 없이 써야 하는 곳은 `onehandcrm`을 기준으로 한다.

이유는 제품 방향이 영업 전용 도구에 머물지 않기 때문이다. 앞으로 만들려는 것은 B2B 영업뿐 아니라 B2C 고객관리, 프리랜서 업무, 부동산, 보험, 법무, 상담, 교육, 채용 등 다양한 직업과 업무에 맞춰 쓸 수 있는 CRM이다.

`CRM`은 고객, 관계, 업무 기록, 상태 관리, 상담, 거래, 프로젝트 같은 넓은 범위를 담을 수 있다. 새 도메인과 외부 노출 이름도 `onehandcrm` 기준으로 변경한다는 전제로 후속 문서를 정리한다.

브랜드 기준:

- 제품명: `OneHand CRM`
- 붙여 쓰는 브랜드 표기: `OneHandCRM`
- 도메인/slug/code 표기: `onehandcrm`
- 의미: 영업 전용 CRM이 아니라 내 일에 맞게 준비되는 CRM
- 사용자 인상: 한 손에 들어오는 단순함, 하지만 필요하면 계속 확장되는 CRM

사용자-facing 문서와 화면에서는 `OneHand CRM`을 우선한다. 공백 없는 표기가 필요한 곳에서는 `OneHandCRM` 또는 `onehandcrm`만 사용한다.

### 2. 포지셔닝

기존 제품들은 대체로 두 방향 중 하나다.

| 유형 | 장점 | 비용 |
| --- | --- | --- |
| 쉬운 CRM | 바로 시작하기 쉽다. | 구조가 고정되어 업무가 달라지면 한계가 온다. |
| 자유로운 CRM/DB 도구 | 원하는 구조를 만들 수 있다. | Object, Relation, Database, Board, Automation 같은 개념을 배워야 한다. |

OneHand CRM이 차지해야 할 자리는 그 사이가 아니다. 둘을 단순히 절충하는 것도 아니다.

OneHand CRM의 목표는 아래다.

```text
쉽다
+
자유롭다
+
내가 만들 필요도 없다
```

이 중 세 번째가 진짜 제품 가설이다.

사용자에게는 "CRM을 세팅하세요"가 아니라 아래처럼 말한다.

> 무슨 일을 하는지만 알려주세요.

예를 들어 사용자가 `부동산 중개`를 선택하면, 빈 CRM builder가 열리는 것이 아니다. 바로 아래와 같은 업무 구조가 준비되어야 한다.

```text
고객 / 매물 / 소유자 / 방문 / 상담 / 계약
```

관계도 단순 목록이 아니라 실제 업무 흐름을 반영해야 한다.

```text
고객 <-> 매물
       |
      방문
       |
      계약
```

즉, OneHand CRM은 Pipeline 하나를 만들어주는 제품이 아니라 업무 전체의 데이터 모델과 기본 화면을 준비해주는 제품이어야 한다.

### 3. 세 가지 USP

#### 3.1 Zero Setup

> CRM을 직접 만들지 않는다.

사용자는 처음부터 Object, Field, Relation, View를 만들지 않는다. 회원가입 후 자기 일을 선택하면 제품이 시작 구조를 먼저 결정한다.

사용자-facing 표현:

- CRM을 설정하지 마세요. 하는 일을 알려주세요.
- 내 일에 맞는 CRM이 바로 준비됩니다.
- 빈 화면에서 시작하지 않아도 됩니다.

#### 3.2 Work-aware

> 내 직업의 업무 방식을 이미 알고 있다.

직업별 Kit은 단순히 이름만 다른 템플릿이 아니다. 실제 업무에서 다루는 대상, 상태, 관계, 기본 화면이 달라야 한다.

나쁜 예:

```text
Customer / Deal / Task
```

모든 직군에 같은 구조를 이름만 바꿔 제공하면 제품 가치는 약하다.

좋은 예:

```text
부동산 중개: 고객 / 매물 / 소유자 / 방문 / 상담 / 계약
헤드헌터: 후보자 / 회사 / 채용공고 / 인터뷰 / 추천 / Offer
B2B 기술영업: 회사 / 담당자 / 기회 / 제품 / Sample / Technical Issue / Quote
```

여기서 `회사`, `제품`, `딜` 같은 단어는 특정 직업 Kit 안에서는 사용할 수 있다. 다만 OneHand CRM 전체의 고정 기본 도메인처럼 말하면 안 된다.

#### 3.3 Infinite Expansion

> 그래도 내 방식이 다르면 자유롭게 바꿀 수 있다.

처음 구조는 제품이 준비하지만, 사용자가 그 구조에 갇히면 안 된다. 시간이 지나며 업무가 달라지면 새로운 관리 대상, 필드, 관계, 상태, 보기, 자동화를 추가할 수 있어야 한다.

다만 확장 UX는 설정 화면에서 데이터 모델링을 시키는 방식이 아니어야 한다.

나쁜 UX:

```text
Settings -> Objects -> Create Object -> Add Attributes -> Configure Relations -> Create View
```

좋은 UX:

```text
제품별로 고객을 관리하고 있는 것 같아요.
제품 관리를 추가할까요?

[제품 관리 추가]
```

내부적으로는 Product Object, Customer Relation, Product View, 기본 필드가 생성되더라도 사용자는 Object라는 단어를 배울 필요가 없다.

### 4. 경쟁 제품 대비 공격 지점

경쟁 제품을 사용자 가치 기준으로 보면 OneHand CRM의 공격 지점이 선명해진다.

| 제품 | 고객이 얻는 핵심 가치 | 약점/비용 | OneHand CRM의 공격 지점 |
| --- | --- | --- | --- |
| Notion | 무엇이든 만들 수 있음 | 사용자가 직접 설계해야 함 | 만들 필요 없음 |
| Airtable | 강력한 관계형 DB와 템플릿 | DB 구조 이해가 필요함 | DB를 몰라도 됨 |
| Attio | 유연한 CRM 데이터 모델 | Object/Relation 개념을 배워야 함 | 같은 자유도를 더 쉽게 |
| monday CRM | Template, Board, Automation | Board/Column/Automation 구조를 익혀야 함 | 업무 자체의 언어로 사용 |
| Streak | 자연어 기반 Pipeline 생성 | Pipeline 중심, Gmail 중심 | 업무 전체의 관계형 CRM 구조 |
| HubSpot | 쉽게 시작하는 CRM | 구조가 상대적으로 정형화됨 | 더 높은 자유도 |
| Salesforce | 무엇이든 가능한 Enterprise CRM | 너무 무겁고 복잡함 | SMB와 1인 사용자용 단순함 |

주의할 점은 "직업별 Kit", "템플릿", "자동 생성" 자체가 강한 moat는 아니라는 점이다. 경쟁사도 산업별 템플릿이나 AI 생성 흐름을 만들 수 있다.

OneHand CRM이 더 날카로워지려면 아래 차이를 끝까지 밀어야 한다.

```text
Streak: AI가 Pipeline을 만들어준다.
OneHand CRM: 제품이 업무 전체의 데이터 모델과 기본 화면을 준비해준다.
```

그리고 장기적으로는 사용자의 실제 업무 패턴을 학습해 더 좋은 Kit과 확장 제안을 만드는 쪽으로 가야 한다.

### 5. 사용자 경험 원칙

#### 5.1 사용자는 CRM 용어를 몰라도 된다

내부 구조와 사용자 언어를 분리한다.

| 내부 용어 | 사용자-facing 표현 |
| --- | --- |
| Create custom object | 관리할 항목 추가 |
| Create attribute | 필요한 정보 추가 |
| Create relationship | 두 기록 연결 |
| Create view | 보기 방식 추가 |
| Create workflow | 반복 작업 자동화 |
| Trigger/Action | 이럴 때 이렇게 하기 |

예시:

```text
Attio식 표현: Create relationship
OneHand식 표현: 고객과 제품을 연결할까요?

Attio식 표현: Create workflow
OneHand식 표현: 3일 동안 연락이 없으면 알려드릴까요?
```

#### 5.2 처음 10분 안에 성공을 느껴야 한다

사용자가 처음 성공했다고 느끼는 순간은 "기능을 많이 봤다"가 아니다.

목표 순간:

1. 회원가입한다.
2. 어떤 일을 하는지 선택한다.
3. 내 일에 맞는 CRM이 바로 열린다.
4. 첫 기록을 추가한다.
5. "이 CRM이 내 일을 알고 있네"라고 느낀다.

#### 5.3 확장은 필요한 순간에만 제안한다

OneHand CRM은 처음부터 모든 자유도를 보여주지 않는다. 기본 Kit을 쓰다가 사용자의 반복 행동이나 입력 패턴에서 확장 필요가 보일 때 제안한다.

예시 1:

```text
사용자가 메모에 "다음달 다시 연락", "금요일 전화", "10월 재방문"을 자주 쓴다.

제품:
고객에게 다시 연락할 날짜를 자주 기록하시네요.
자동으로 Follow-up을 관리할까요?

[추가]
```

내부 변화:

```text
FollowUp Object
+ Customer Relation
+ Today's Follow-ups View
+ Reminder Workflow
```

예시 2:

```text
사용자가 고객마다 A 제품, B 제품, C 제품을 계속 메모한다.

제품:
제품별로 고객을 관리하고 있는 것 같아요.
제품 관리를 추가할까요?

[제품 관리 추가]
```

내부 변화:

```text
Product Object
+ Customer <-> Product Relation
+ Product View
+ Customer Detail UI 업데이트
```

이 방식이 성공하면 제품은 "설정하는 CRM"이 아니라 "같이 바뀌는 CRM"이 된다.

### 6. Kit의 기준

Kit은 템플릿 파일이 아니다. Kit은 특정 업무를 바로 시작하기 위한 기본 CRM 운영 구조다.

Kit은 최소한 아래를 포함해야 한다.

- 업무에서 관리해야 하는 주요 대상
- 대상 사이의 관계
- 기본 필드
- 상태값
- 기본 목록과 상세 화면
- 첫 사용자가 바로 이해할 수 있는 보기
- 자주 필요한 다음 행동
- 필요할 때 확장할 수 있는 제안 후보

직업별 Kit 예시:

| Kit | 시작 구조 예시 |
| --- | --- |
| 부동산 중개 | 고객, 매물, 소유자, 방문, 상담, 계약 |
| 헤드헌팅/채용 | 후보자, 회사, 채용공고, 인터뷰, 추천, Offer |
| B2B 기술영업 | 회사, 담당자, 기회, 제품, Sample, Technical Issue, Quote |
| 보험/재무상담 | 고객, 상담, 보장/상품, 계약, 갱신, Follow-up |
| 교육/코칭 | 수강생, 상담, 과정, 등록, 출석, 진도, 재등록 |
| 프리랜서/컨설팅 | 고객, 프로젝트, 미팅, 제안, 계약, 청구, 산출물 |

중요한 기준:

- 모든 Kit을 `Customer / Deal / Task`로 환원하지 않는다.
- 직업을 이해한 것처럼 보여야 한다.
- 처음 제공되는 구조는 그대로 써도 충분해야 한다.
- 사용자가 구조를 바꾸고 싶을 때는 CRM 설정 언어가 아니라 업무 언어로 바꾼다.

### 7. 기술 구조 방향

기술 구조는 유연한 CRM 데이터 모델의 장점을 참고하되, OneHandCRM의 No Setup UX에 맞게 재해석한다.

내부 Backend/DB는 고정형 Company/Product/Deal 구조로 되돌아가지 않는다. 다음 CRM 코어는 유연한 데이터 모델을 전제로 별도 설계한다.

후보 개념:

- Workspace
- WorkspaceMember
- Kit
- KitObjectTemplate
- KitAttributeTemplate
- Object
- Attribute
- Relationship
- SelectOption
- Status
- Record
- RecordValue
- List
- View
- Automation
- Trigger
- Action

이 용어들은 내부 설계와 AGENT/BE 문서에서는 사용할 수 있다. 그러나 사용자-facing FE 문구에서는 그대로 노출하지 않는다.

예외적으로 관리자/고급 설정 화면에서 필요한 경우에도, 기본 언어는 아래처럼 업무 중심으로 번역한다.

```text
Object -> 관리 항목
Attribute -> 정보
Relationship -> 연결
Record -> 기록
View -> 보기
Automation -> 자동 처리
```

### 8. 사용자-facing 메시지 기준

가장 강한 메시지:

> CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비된다.

Hero 후보:

- 내 일에 맞는 CRM. 처음부터 준비되어 있습니다.
- CRM을 설정하지 마세요. 하는 일을 알려주세요.
- 1분 안에 내 일에 맞는 CRM. 필요한 만큼 자연스럽게 확장됩니다.

보조 문구 후보:

- 처음엔 간단하게. 필요할 때만 확장하세요.
- 빈 화면에서 시작하지 않아도 됩니다.
- 고객, 업무, 기록, 다음 행동이 내 일에 맞게 정리됩니다.
- 복잡한 설정 없이 바로 시작하고, 내 방식이 생기면 자연스럽게 바꿀 수 있습니다.

English 후보:

- Do not set up your CRM. Tell us how you work.
- A CRM made for your work, ready from the start.
- Start simple. Expand only when you need to.
- Ready-made, but never locked.
- The CRM that understands how you work.

앞세우지 않을 메시지:

- Notion처럼 깔끔한 CRM
- Attio처럼 Object를 만들 수 있는 CRM
- Flexible CRM
- AI CRM
- 모든 직업을 위한 CRM
- 회사/담당자/제품/딜을 관리하는 CRM

이 표현들은 내부 설명이나 특정 Kit 예시에서는 사용할 수 있지만, 랜딩페이지의 핵심 가치로는 약하다.

### 9. 기존 Company/Product/Deal 표현 정리 기준

앞으로 문서를 정리할 때 Company/Product/Deal을 무조건 금지어처럼 처리하지 않는다. 기준은 문맥이다.

삭제 또는 수정해야 하는 경우:

- OneHand CRM의 전체 기본 도메인을 `Company`, `Product`, `Deal`로 설명하는 경우
- 모든 사용자에게 회사/제품/딜 관리가 핵심 기능처럼 보이는 경우
- 과거 영업 CRM 카피가 사용자-facing 문구에 남아 있는 경우
- 고정형 `/app/companies`, `/app/products`, `/app/deals`를 활성 기능처럼 설명하는 경우
- Company/Search/xlsx export를 현재 구현된 핵심 기능처럼 설명하는 경우

남길 수 있는 경우:

- 문의자가 입력하는 회사명과 회사 규모
- 특정 직업 Kit 예시에서 필요한 `회사`, `제품`, `기회`, `Quote` 같은 업무 용어
- 과거 제거 기록을 명확히 비활성 문서로 표시한 경우
- DB migration history처럼 삭제하면 안 되는 이력
- "제품 방향", "제품 경험"처럼 product-domain이 아닌 일반 제품 의미

핵심은 단어 삭제가 아니라 포지션 정리다.

### 10. Moat 전략

초기 기능 moat는 약하다. 직업별 Kit, 자동 생성, 유연한 데이터 모델은 경쟁사가 따라 할 수 있다.

장기 moat는 사용 데이터에서 만들어야 한다.

목표 흐름:

```text
CRM Kit
  -> Industry Workflow Dataset
  -> Recommendation Engine
  -> Adaptive CRM
```

예를 들어 반도체 기술영업 Kit v1을 100명이 사용하면, 제품은 익명화/집계된 패턴을 통해 아래를 배운다.

```text
87% -> Sample 관리 추가
72% -> Technical Issue 관리
68% -> Quote Follow-up 생성
54% -> Distributor Relation 추가
```

그 결과 반도체 기술영업 Kit v2는 더 좋아진다. 보험설계사, 부동산 중개사, 헤드헌터도 같은 방식으로 Kit과 추천이 발전해야 한다.

이 단계까지 가면 OneHand CRM은 단순한 템플릿 제품이 아니라, 직업별 업무 방식을 점점 더 잘 이해하는 CRM이 된다.

장기 메시지:

> The CRM that understands how you work.

### 11. 초기 타겟

초기 타겟은 중견/대기업보다 1인 사용자, 소규모 팀, 중소기업, 200명 이하 스타트업에 가깝다.

가능성이 높은 타겟:

- 1인 사업자
- 1인 영업자
- 1인 부동산 중개사
- 보험설계사, 재무상담사
- 헤드헌터, 채용 컨설턴트
- 프리랜서, 컨설턴트
- 상담, 교육, 코칭 직군
- CRM은 필요하지만 기존 CRM이 무겁다고 느끼는 중소기업
- 업무 기록과 고객 관계를 관리해야 하지만 CRM을 배울 시간이 없는 사람

B2C라고 할 때의 의미는 일반 소비자가 직접 CRM을 쓴다는 뜻이 아니다. B2C 고객을 관리하는 직업인과 1인 사업자를 뜻한다.

초기에는 중견기업과 대기업을 타겟으로 잡기 어렵다. 이유는 기능보다 구매 조건 때문이다. SSO, 감사 로그, 조직 권한, 보안 심사, ERP/그룹웨어 연동, 계약 프로세스가 필요해져 제품보다 운영/영업 난이도가 커진다.

### 12. 후속 설계에서 아직 확정하지 않을 것

현재 단계에서는 제품 가설과 포지션을 먼저 정리한다.

아직 깊게 확정하지 않을 것:

- 메모/block editor 상세 기능
- 자동화 세부 조건
- 권한 체계 상세
- API endpoint 상세
- Prisma schema 세부 컬럼
- 가격/요금제
- 모든 직군 Kit의 상세 필드
- 첫 출시 직군 1~2개
- AI 제안의 구체적인 모델/알고리즘

다만 후속 BE/FE 개발을 시작하려면 최소한 아래는 먼저 정해야 한다.

- 첫 출시에서 검증할 Kit
- Kit이 생성하는 최소 Object/Attribute/Relationship/View 구조
- 사용자가 첫 기록을 추가하는 화면 흐름
- Kit이 없는 사용자의 기본 workspace 경험
- 사용자-facing 용어 사전

### 13. 후속 문서 갱신 순서

이 README가 기준이 되면 다음 문서를 순서대로 맞춘다.

1. `AGENT/PM_AGENT` 제품 방향과 MVP 범위
2. `AGENT/SOFTWARE_AGENT` BE/FE 아키텍처 기준
3. `AGENT/UXUI_AGENT` UX writing, 화면 흐름, 금지/권장 표현
4. `FE` 공개 사이트, SEO, legal copy, route 설명
5. `BE` 문서, Prisma 주석, 모듈 설명

코드 개발은 문서 기준이 먼저 잡힌 뒤 시작한다.

### 14. 한 줄 정리

OneHand CRM은 사용자가 CRM을 직접 설계하게 만드는 서비스가 아니다. 사용자가 하는 일을 알려주면 바로 쓸 수 있는 CRM을 먼저 준비하고, 필요해지는 순간 업무 언어로 자연스럽게 확장해주는 No Setup CRM이다.

## Current Implementation

현재 구현은 새 CRM 코어를 만들기 전 foundation 상태다.

Backend:

- Auth/User
- PublicContactRequest
- ErrorReport
- SupportRequest
- Health
- `GET /admin/api/me`

User Web:

- locale 기반 공개/인증 페이지
- `/app` 홈
- `/app/more`
- 계정 설정 모달
- 오류 신고와 지원 문의
- 공개 문의

Admin Web:

- `/login`
- `/`
- 관리자 access token 확인

Prisma:

- `User`
- `ErrorReport`
- `SupportRequest`
- `PublicContactRequest`
- `UserOAuthAccount`
- `AuthDevice`
- `AuthSession`

다음 CRM 코어는 고정형 도메인을 되살리지 않고, `Workspace`, `Kit`, `Object`, `Attribute`, `Relationship`, `Record`, `View` 계열의 유연한 데이터 모델로 별도 설계한다.

## Domain Direction

외부 노출 도메인과 배포 이름은 `onehandcrm` 기준으로 전환한다.

전환 기준:

- User Web canonical domain: `onehandcrm` 계열 신규 도메인
- Admin Web deployment name: `onehandcrm` 계열 이름
- Backend API deployment name: `onehandcrm` 계열 이름
- OAuth redirect URL, CORS origin, cookie domain, SEO canonical URL도 같은 기준으로 갱신

실제 구매/연결된 도메인과 배포 URL은 환경 문서와 배포 플랫폼 설정을 기준으로 관리한다. Frontend domain 변경은 Railway Backend, Supabase project/database region, provider secret을 자동으로 바꾸지 않는다.

## Structure

```text
AGENT/
  PM_AGENT/
  UXUI_AGENT/
  SOFTWARE_AGENT/
    FRONT_AGENT/
    BACKEND_AGENT/
    DB_SCHEMA/
FE/
  user-web/
  admin-web/
BE/
TODO/
TODO_LOG/
IMAGE_SAMPLE/
UX Design/
```

## Quick Start

전제 조건:

- Node.js 24 LTS
- pnpm 8.x
- Docker Desktop 또는 호환 Docker runtime

### 1. Backend

```bash
cd BE
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run start:dev
```

Backend URL: `http://localhost:3000`

Health check:

```bash
curl http://localhost:3000/api/health
```

### 2. User Web

```bash
cd FE/user-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

User Web URL: `http://localhost:5173`

User Web은 locale 기반 공개/인증 URL과 로그인 후 `/app` 영역을 제공한다. 인증은 Supabase OAuth provider login, 공유 `/auth/callback`, Backend `POST /api/auth/exchange`, refresh cookie 기반 access token 재발급 흐름을 사용한다.

### 3. Admin Web

```bash
cd FE/admin-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

Admin Web URL: `http://localhost:5174`

Admin Web은 입력받은 Backend App access token이 관리자인지 확인한다. 현재 route는 `/login`과 보호 route `/`이며, Backend 연동은 `GET /admin/api/me`만 사용한다.

## Verification

각 앱은 독립적으로 검증한다.

Backend:

```bash
cd BE
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

User Web:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Admin Web:

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Playwright smoke E2E는 기본적으로 Backend와 외부 Provider를 route mock으로 대체한다. User Web E2E는 5175 포트의 Vite dev server를 테스트용으로 사용한다. Admin Web E2E는 관리자 token 통과, non-admin 차단, `GET /admin/api/me` 호출만 확인한다.

문서와 코드 변경 후에는 관련 실행 단위를 다시 검증한다.

## External Providers

환경 변수 정본은 각 실행 단위의 `.env`와 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. Backend와 Vite가 로컬 override 파일을 읽을 수 있더라도, 공유 환경 계약은 공통 환경 문서에 기록된 변수명만 기준으로 한다.

외부 provider 에러 처리와 후속 개선 항목은 `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`에 기록한다.

- Backend Auth/DB: `DATABASE_URL`, `DIRECT_URL`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`
- Frontend Supabase/Auth: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_REDIRECT_URL`

로그인 국가 메타데이터는 Google/Supabase 계정 정보가 아니라 배포 프록시가 전달하는 `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country` 헤더에서 저장한다. 로컬 또는 해당 헤더가 없는 배포 환경에서는 `signupCountryCode`, `lastLoginCountryCode`가 `null`이며 화면에는 `기록 없음`으로 표시될 수 있다.

## Rules

- 루트에는 `package.json`을 두지 않는다.
- `FE`와 `BE`는 package dependency를 공유하지 않는다.
- `FE/user-web`, `FE/admin-web`은 별도 Frontend 앱이다.
- `BE`는 `/api/*`와 `GET /admin/api/me`를 제공하는 단일 NestJS 서버다.
- `AGENT`는 PM, UX/UI, Software 역할별 정본 문서 공간이다.
- `TODO`, `TODO_LOG`, `IMAGE_SAMPLE`, `UX Design`은 작업/참고 자료이며 `AGENT`를 override하지 않는다.
