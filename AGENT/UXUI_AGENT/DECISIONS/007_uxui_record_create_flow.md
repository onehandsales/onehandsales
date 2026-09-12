# UX/UI Record Create Flow Decision

Date: 2026-09-12

## 1. 결정

OneHand CRM의 Record 생성 흐름은 사용자가 CRM 구조를 설계하는 경험이 아니라, 선택한 Kit 안에서 첫 업무 기록을 빠르게 남기는 경험이어야 한다.

사용자에게 `Object`, `Attribute`, `Relationship` 같은 내부 용어를 먼저 보여주지 않는다. 화면에서는 Kit의 업무 언어를 사용한다.

예:

- `고객 추가`
- `매물 추가`
- `후보자 추가`
- `상담 기록 추가`
- `프로젝트 추가`

## 2. 첫 Record 생성 기준

첫 사용 경험에서 Record 생성은 activation의 핵심이다.

원칙:

- 첫 입력 필드는 최소화한다.
- 필수 값은 해당 Kit에서 업무 식별에 꼭 필요한 값으로 제한한다.
- 저장 후 사용자가 방금 만든 Record를 목록이나 상세에서 바로 확인할 수 있어야 한다.
- 생성 화면은 설정 화면처럼 보이면 안 된다.
- 추가 정보는 생성 이후 상세에서 자연스럽게 채우게 한다.

## 3. 화면 패턴

목록 맥락에서 새 Record를 만들 때는 오른쪽 문서형 패널을 우선 검토한다.

오른쪽 패널을 우선하는 경우:

- 사용자가 목록을 보며 새 Record를 추가한다.
- 저장 후 목록 맥락을 유지해야 한다.
- 생성 중 다른 Record와 비교할 가능성이 있다.
- 첫 화면에서 modal이 작업 흐름을 끊을 위험이 있다.

짧은 보조 입력이나 위험 확인은 modal/dialog를 사용할 수 있다.

## 4. 생성 후 상태

저장 후 기본 동작:

- 생성한 Record를 상세 패널 또는 상세 화면에서 보여준다.
- 관련 목록의 첫 위치 또는 적절한 정렬 위치에 반영한다.
- 다음 행동이 있으면 바로 보이게 한다.

예:

```text
고객을 추가했어요.
다음으로 방문 일정을 잡을 수 있어요.
```

## 5. 제외 범위

현재 결정은 아래를 포함하지 않는다.

- 사용자가 처음부터 Object를 직접 만드는 builder
- Attribute/Relationship 설정 화면
- 대량 import
- 복잡한 권한/Team 기반 생성 정책
- 자동화 builder와 연결된 생성 flow

## 6. 관련 문서

- `AGENT/PM_AGENT/PLANNING/FIRST_USE_EXPERIENCE.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/UXUI_AGENT/DECISIONS/019_uxui_record_create_panel.md`
