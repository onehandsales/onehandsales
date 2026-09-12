# CRM Core Interaction Model

Status: UX Baseline
Date: 2026-09-12

## 1. 목적

이 문서는 PM의 CRM Core 개념을 사용자 화면 언어와 상호작용으로 바꾸는 기준을 정의한다.

Software 구현 용어가 아니라 UX/UI 설계자가 화면에서 어떤 말과 패턴을 써야 하는지 정리한다.

## 2. 용어 변환 기준

| 내부 개념 | 화면 표현 |
| --- | --- |
| Workspace | 내 CRM, 업무 공간 |
| Kit | 부동산 중개 CRM, 헤드헌팅 CRM처럼 업무별 CRM |
| Object | 고객, 매물, 후보자, 상담처럼 관리할 항목 |
| Attribute | 필요한 정보 |
| Relationship | 연결, 추천, 방문, 계약처럼 업무 관계 |
| Record | 실제 기록 |
| List | 목록 |
| View | 보기 방식 |
| Status | 상태 |
| Next Action | 다음 행동 |

내부 용어는 설정/개발 문서에서만 사용한다. 사용자 화면은 Kit의 업무 언어를 우선한다.

## 3. Workspace 상호작용

Workspace는 사용자가 일을 시작하는 기본 공간이다.

UX 기준:

- 가입 직후 사용자가 복잡한 Workspace 설정을 하지 않게 한다.
- 개인 사용자는 기본 Workspace를 자동으로 받는 흐름을 우선한다.
- Team/권한은 MVP 첫 사용 화면에서 노출하지 않는다.
- Workspace 이름은 선택한 Kit과 연결되어야 한다.

## 4. Kit 상호작용

Kit은 Workspace에 적용되는 업무 구조다.

UX 기준:

- Kit은 선택과 미리보기 중심으로 보여준다.
- 시작 전 필드 편집을 강요하지 않는다.
- Kit의 가치는 관리 대상, 관계, 첫 행동으로 보여준다.
- Kit 변경/추가는 별도 정책이 확정되기 전까지 고급 흐름으로 다룬다.

## 5. Object 상호작용

Object는 사용자가 관리하는 대상의 종류다.

UX 기준:

- 화면에서는 Object라고 부르지 않는다.
- navigation, 목록 제목, 생성 버튼은 실제 업무명으로 쓴다.
- 모든 Kit에 같은 대상 이름을 고정하지 않는다.

예:

- 부동산 중개: `고객`, `매물`, `방문`, `계약`
- 헤드헌팅: `후보자`, `회사`, `공고`, `인터뷰`

## 6. Attribute 상호작용

Attribute는 Record에 필요한 정보다.

UX 기준:

- 첫 생성 form에서는 최소 정보만 받는다.
- 중요도가 낮은 정보는 상세 화면에서 접거나 나중에 입력하게 한다.
- 사용자에게 `필드 추가`보다 `필요한 정보 추가`에 가깝게 표현한다.

## 7. Relationship 상호작용

Relationship은 OneHand CRM이 단순 목록 앱이 아니라 CRM인 이유다.

UX 기준:

- 연결은 상세 화면과 생성 flow 안에서 자연스럽게 만든다.
- 사용자가 "관계"를 설계하지 않아도 업무 행동으로 관계가 생겨야 한다.
- 연결된 Record는 서로의 상세에서 확인되어야 한다.

## 8. List/View 상호작용

List와 View는 Record를 다시 찾기 위한 기본 진입점이다.

UX 기준:

- 모든 Object에는 기본 목록이 필요하다.
- 고급 view builder보다 Kit별 기본 보기를 먼저 제공한다.
- 모바일에서는 가로로 넓은 table보다 compact list를 우선한다.

## 9. 확장 상호작용

확장은 사용자가 필요를 느낄 때 업무 언어로 제공한다.

나쁜 방향:

```text
Settings -> Objects -> Create Object -> Add Attributes -> Configure Relations
```

좋은 방향:

```text
제품별로 고객을 관리하고 있나요?
제품 관리를 추가할 수 있어요.
```

UXUI_AGENT는 확장 화면을 만들 때 PM의 Infinite Expansion 원칙을 따른다.

## 10. 관련 문서

- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/UXUI_AGENT/DECISIONS/024_uxui_internal_terms_user_language.md`
