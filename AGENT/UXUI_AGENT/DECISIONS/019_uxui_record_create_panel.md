# UX/UI Record Create Panel Decision

## 결정

목록 화면에서 새 record를 생성할 때는 사용자가 보던 목록 맥락을 유지하는 오른쪽 문서형 생성 패널을 우선한다.

2026-07-10 기준 첫 적용 대상은 회사 생성이다.

## 이유

회사, 담당자, 제품, 딜은 목록에서 비교하면서 빠르게 추가하는 업무가 많다. 전체 페이지로 이동하면 사용자가 보던 검색어, 필터, 정렬, 주변 record 맥락이 끊긴다. 작은 중앙 모달은 간단하지만, Notion식 page/property 느낌이 약하고 입력 영역이 좁다.

오른쪽 문서형 패널은 목록을 유지하면서도 record 하나를 독립된 문서처럼 작성하게 해 준다. 따라서 빠른 생성과 정보 집중 사이의 균형이 좋다.

## 회사 생성 패널 기준

- `/app/companies`에서 생성 버튼을 누르면 오른쪽 문서형 생성 패널을 연다.
- `/app/companies/new`는 별도 full page form이 아니라 회사 목록을 렌더링하고 패널을 초기 open 상태로 둔다.
- 데스크톱 패널은 viewport 최상단~최하단에 fixed로 붙는다.
- 패널 왼쪽 edge에 resize handle을 두고, 사용자가 좌우로 폭을 조절할 수 있게 한다.
- 폭은 최소 `420px`, 최대 화면/작업영역의 `70%`다.
- 조절한 폭은 `onehand.company.createPanelWidth` localStorage key에 저장한다.
- 패널이 열려도 회사 목록 컬럼은 하나도 줄이지 않는다.
- 공간이 부족하면 목록 table 영역에서 horizontal scroll을 사용한다.
- 데스크톱 미만 viewport에서는 overlay panel로 전환한다.

## 적용 방향

- 담당자/제품/딜 생성도 UX/UI 통일 시 회사 생성 패널 기준을 우선 검토한다.
- 삭제 확인, 짧은 분류 추가, 위험 액션 확인은 기존 dialog/modal을 유지할 수 있다.
- 긴 상세 편집과 관계/활동/메모 관리는 record detail page를 유지한다.

## 피할 것

- 패널이 열렸다는 이유로 목록 비교 컬럼을 숨기거나 합치는 것
- 모든 생성 화면을 full page로 강제해 목록 맥락을 끊는 것
- 작은 중앙 모달에 상세 페이지 수준의 필드를 모두 넣는 것
- Notion 브랜드, 문구, 고유 화면을 복제하는 것

## 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/007_uxui_create_flow.md`
- `AGENT/UXUI_AGENT/DECISIONS/017_uxui_notion_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
