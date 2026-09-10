# UX/UI Direction

## Product UX Principle

onehand.sales는 개인 영업자가 빠르게 기록하고 다시 찾는 업무 도구다. 화면은 조용하고 밀도 있게 구성하며, 장식보다 정보 스캔과 반복 사용 효율을 우선한다.

## First Screen

로그인 이후 첫 화면은 `/app` 홈이다. 회사 관리로 바로 이어지는 요약과 최근 업무 흐름이 한눈에 보여야 한다.

## Navigation Priority

- 홈
- 회사
- 검색
- 휴지통
- 더보기/계정

## List Direction

- 목록은 검색, 필터, 정렬, 페이지네이션 상태를 명확히 보여준다.
- 행 높이는 과도하게 키우지 않는다.
- 주요 식별값과 상태값은 한 줄에서 스캔 가능해야 한다.
- 빈 상태는 바로 생성 행동으로 이어진다.

## Detail Direction

- 상세는 속성, 일반 메모, 개인 비밀 메모를 구분한다.
- 회사 상세는 회사명, 분야, 지역, 주소를 먼저 보여준다.
- 메모는 시간순 흐름이 끊기지 않게 표시한다.

## Create / Edit Direction

- 목록 맥락에서는 빠른 생성 패널을 우선한다.
- 복잡한 입력은 `/new/full` page mode로 확장한다.
- 저장 후에는 사용자가 방금 만든 record 위치를 잃지 않게 한다.

## Mobile Direction

- 하단 navigation과 주요 action button은 엄지 조작 범위 안에 둔다.
- 목록, 상세, 편집 flow가 작은 화면에서 겹치지 않아야 한다.
- 표 형태 정보는 모바일에서 카드가 아니라 compact row/list로 재구성한다.

## Writing Direction

- 버튼은 명령형으로 짧게 쓴다.
- 실패 메시지는 원인과 다음 행동을 함께 제시한다.
- 빈 상태 문구는 기능 설명보다 바로 할 수 있는 행동을 안내한다.
