# UX/UI List Filter And Pagination Decision

## 결정


현재 활성 앱 도메인 목록은 없다.

후속 CRM record 목록을 만들 때는 옵션 API를 초회 조회한 뒤 compact select로 제공한다.

## 적용 범위

- 현재 적용 대상 없음
- 후속 Workspace/Object/Attribute/Record/List/View 기반 목록

## Pagination 규칙

- 목록 페이지는 `totalPages`, `totalCount`를 사용한다.
- 후속 목록 API는 page-number pagination을 우선 검토한다.
- page size를 바꾸려면 Backend 도메인 서비스 상수, 응답 `pageSize`, API/DB 문서, 관련 테스트를 함께 갱신한다.
- FE에서 page size 숫자만 바꾸거나, 응답 `pageSize`와 UI 표시가 어긋나게 만들지 않는다.
- 모바일 record list도 15개 page 계약을 사용하되 desktop table 대신 card/list로 표현한다.
- 20개 기본 표시는 현재 row height와 layout에서는 쓰지 않는다. 나중에 고밀도 보기 옵션으로만 검토한다.
- 공용 `Pagination` 컴포넌트에는 `hasNext`를 전달하지 않는다.
- 1페이지만 존재하면 pagination은 숨길 수 있다.
- `hasNext`는 cursor 기반 incremental loading API가 다시 추가될 때만 사용한다.

## Option 관리 UX

후속 record 목록에서 관리형 옵션 필드를 사용할 때는 필터 select에 `+ 추가` 옵션을 제공할 수 있다.

예:

- 직업별 record 상태 select의 `+ 추가` -> 옵션 관리 다이얼로그

분류 다이얼로그에서는 옵션 추가/삭제를 처리하고, 새로 추가된 옵션은 목록 필터로 바로 선택한다.

## 정렬 Select

목록 정렬은 chip 나열보다 compact select를 기본으로 한다.

- 후속 record 목록: `최신순`

## Visual Grammar

주요 목록 화면은 가능한 한 다음 문법을 공유한다.

- compact controls bar
- select filter
- count text
- table card
- fixed-height row
- bottom pagination

현재 크기 기준:

- 공용 `Pagination`: 48px(`h-12`)
- 미리보기 header와 table header: 44px(`h-11`)
- desktop record row: 48px 수준을 우선 검토한다.

목록 화면은 비교와 반복 작업이 중요하므로 큰 hero/page header보다 조밀한 업무 도구형 구성을 우선한다.

## 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
