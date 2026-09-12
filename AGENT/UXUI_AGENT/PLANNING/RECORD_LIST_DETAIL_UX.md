# Record List / Detail UX

Status: UX Baseline
Date: 2026-09-12

## 1. 목적

이 문서는 OneHand CRM의 Record 목록, 상세, 생성, 연결 화면 기준을 정의한다.

Record UX의 목표는 사용자가 자신의 업무 기록을 빠르게 찾고, 상태와 관계를 이해하고, 다음 행동으로 이어지게 만드는 것이다.

## 2. 목록 UX

Record 목록은 단순 데이터 테이블이 아니라 업무 판단 화면이다.

목록에서 우선 보여야 하는 정보:

- Record 이름 또는 식별값
- Kit별 핵심 속성
- 상태
- 연결된 주요 Record
- 다음 행동 또는 예정일
- 최근 변경 또는 최근 상담/활동 요약

desktop에서는 조밀한 row/list/table을 우선한다. card-heavy 화면은 반복 사용성이 떨어질 수 있으므로 신중하게 쓴다.

## 3. 필터와 보기

MVP에서는 고급 view builder보다 Kit별 기본 보기를 우선한다.

기본 보기 예:

- 전체
- 상태별
- 예정된 일
- 최근 기록
- 내가 바로 처리할 일

필터는 사용자의 업무 언어로 표시한다.

예:

- `상담 중`
- `방문 예정`
- `인터뷰 예정`
- `갱신 필요`

## 4. 상세 UX

Record 상세는 아래 구조를 우선한다.

1. 핵심 식별 정보
2. 상태와 다음 행동
3. Kit별 주요 속성
4. 연결된 Record
5. 메모 또는 활동
6. 수정/삭제 등 보조 액션

상세 화면에서는 내부 필드 구조보다 업무 맥락이 먼저 보여야 한다.

예:

```text
김민수 고객
상태: 방문 예정
관심 매물: 강남 오피스텔
다음 행동: 토요일 방문 시간 확인
```

## 5. 생성 UX

새 Record 생성은 현재 목록 맥락을 유지하는 오른쪽 문서형 패널을 우선한다.

생성 form 원칙:

- 첫 입력 필드는 최소화한다.
- Kit별 첫 Record 후보를 다르게 둔다.
- 저장 후 생성한 Record 위치를 잃지 않게 한다.
- 상세 입력은 생성 이후 이어서 채우게 한다.

## 6. 연결 UX

OneHand CRM은 Record 간 관계가 중요한 제품이다.

연결 UX 기준:

- 관계는 업무 행동 중 자연스럽게 만든다.
- `Relationship` 대신 `연결`, `추천`, `방문`, `계약`처럼 업무 언어를 쓴다.
- 연결된 Record는 양쪽 상세에서 확인할 수 있어야 한다.
- 중복 연결은 사용자가 이해할 수 있게 막거나 병합 흐름을 제공한다.

## 7. 모바일 기준

모바일에서는 desktop table을 그대로 줄이지 않는다.

- 목록은 compact row/list를 우선한다.
- 상세는 핵심 정보, 다음 행동, 연결 Record 순으로 접어 보여준다.
- 생성은 한 화면에 너무 많은 필드를 넣지 않는다.
- 중요한 CTA는 하단 고정 또는 엄지 조작 범위에 둔다.

## 8. 제외 범위

- 고급 view builder
- schema editor
- 대량 편집
- import/export 중심 목록 UX
- Team 권한 기반 column visibility

## 9. 관련 문서

- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md`
- `AGENT/UXUI_AGENT/DECISIONS/007_uxui_record_create_flow.md`
- `AGENT/UXUI_AGENT/DECISIONS/008_uxui_inline_record_connection.md`
- `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`
- `AGENT/UXUI_AGENT/DECISIONS/019_uxui_record_create_panel.md`
