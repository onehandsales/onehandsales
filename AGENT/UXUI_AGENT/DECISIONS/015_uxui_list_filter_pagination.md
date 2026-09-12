# UX/UI List Filter Pagination Decision

Date: 2026-09-12

## 1. 결정

Record 목록은 사용자가 업무 기록을 빠르게 찾고 판단하는 화면이다.

목록, 필터, pagination은 Kit의 업무 언어와 Backend/API 계약을 함께 따라야 한다.

## 2. 목록 기준

- desktop은 dense row/list/table을 우선한다.
- 모바일은 compact row/list로 재구성한다.
- 목록 row에는 이름, 상태, 핵심 속성, 연결된 Record, 다음 행동을 우선한다.
- card-heavy dashboard는 반복 사용성이 필요한 목록에 기본 적용하지 않는다.

## 3. 필터 기준

필터는 내부 schema 용어가 아니라 업무 상태와 행동 기준으로 표현한다.

예:

- `상담 중`
- `방문 예정`
- `인터뷰 예정`
- `갱신 필요`
- `최근 추가`

고급 filter builder는 MVP 우선순위가 아니다.

## 4. Pagination 기준

목록 page size는 FE만 임의로 바꾸지 않는다.

page size를 바꾸려면 아래를 함께 확인한다.

- Backend 상수
- API 응답의 `pageSize`
- API 문서
- DB 조회 기준
- 테스트 계약
- 모바일/데스크톱 row density

## 5. Empty state

목록의 empty state는 설정 안내가 아니라 첫 행동 안내로 이어진다.

예:

```text
아직 고객 기록이 없어요.
첫 고객을 추가하면 여기에서 다시 볼 수 있어요.
```

## 6. 제외

- 첫 MVP에서 복잡한 view/filter builder 제공
- 모든 Kit에 같은 column을 강제
- API에 없는 summary를 FE에서 임의 데이터처럼 표시

## 7. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
