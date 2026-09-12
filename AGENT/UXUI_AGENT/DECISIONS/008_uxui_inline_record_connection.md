# UX/UI Inline Record Connection Decision

Date: 2026-09-12

## 1. 결정

OneHand CRM에서 관련 Record를 연결하거나 새로 추가하는 흐름은 사용자의 현재 업무 흐름을 끊지 않는 inline 패턴을 우선한다.

사용자에게는 `Relation 생성`, `Linked entity 생성`처럼 말하지 않는다. 화면에서는 실제 업무 행동으로 표현한다.

예:

- `고객과 매물 연결`
- `후보자를 공고에 추천`
- `상담을 계약과 연결`
- `프로젝트에 미팅 추가`

## 2. 적용 기준

Inline 연결/생성은 아래 상황에서 우선 검토한다.

- Record 상세에서 관련 Record를 바로 이어서 추가해야 한다.
- 생성 중 관련 대상이 아직 없어서 함께 만들어야 한다.
- 사용자가 페이지를 이동하면 맥락을 잃을 가능성이 높다.
- Kit의 핵심 가치가 Record 간 관계에서 드러난다.

## 3. UX 원칙

- 연결하려는 대상의 이름과 상태를 먼저 보여준다.
- 새로 만들기와 기존 Record 선택을 같은 흐름 안에서 처리한다.
- 필수 입력은 연결을 성립시키는 최소 값으로 제한한다.
- 연결 후에는 양쪽 Record에서 관계가 확인되어야 한다.
- 이미 연결된 Record를 중복으로 추가하려 할 때는 명확히 알려준다.

## 4. 사용자-facing 표현

내부 용어와 사용자 표현을 분리한다.

| 내부 용어 | 사용자-facing 표현 |
| --- | --- |
| Create relationship | 두 기록 연결 |
| Linked record | 연결된 기록 |
| Junction object | 연결 기록 |
| Relation field | 연결 정보 |

가능하면 실제 Kit 언어를 쓴다.

예:

```text
이 고객이 관심 있는 매물을 연결할까요?
이 후보자를 어떤 공고에 추천할까요?
이 상담이 이어진 계약을 연결할까요?
```

## 5. 제외 범위

- 관계형 데이터 모델을 직접 설계하는 설정 화면
- 모든 연결 구조를 한 번에 보여주는 고급 schema 화면
- Team 권한에 따른 연결 제한 UX
- 자동화 trigger/action 설정

## 6. 관련 문서

- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
