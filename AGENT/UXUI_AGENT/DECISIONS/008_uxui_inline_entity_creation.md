# UX/UI Inline Entity Creation Decision

## 결정

현재 비활성 결정이다.

2026-09-12 기준 `/app/deals/*`, `/app/contacts/*`, `/app/products/*`는 `/app`으로 redirect한다. 고정형 고객사 관리 route는 현재 활성 route가 아니다. 딜 빠른 등록 중 관련 record를 inline 생성하는 흐름은 현재 활성 User Web 범위가 아니다.

현재 활성 범위에는 inline entity creation이 없다.

## 이유

후속 CRM record 생성에서 선택지가 필요한 필드가 생기면, 선택지가 없다는 이유로 사용자를 다른 화면으로 보내지 않도록 inline 생성 흐름을 검토한다.

## UX 규칙

- 검색형 선택 필드에서 기존 항목을 먼저 찾는다.
- 검색 결과가 없으면 현재 필드 맥락에 맞는 옵션 추가 액션을 보여준다.
- 새 옵션은 최소 필드만 받는다.
- 생성 후 현재 입력에 자동 선택한다.
- 자세한 정보는 해당 상세 페이지에서 보강한다.
- 생성 후 자동 선택은 생성 API 응답 id에 의존하지 않고, 필요한 경우 옵션 목록을 다시 조회해 같은 이름의 항목을 찾는 방식도 허용한다.

## 금지

- 자유 텍스트만으로 선택지가 필요한 필드를 저장하지 않는다.
- 선택지가 필요한 필드를 사용자가 입력한 텍스트만으로 저장하지 않는다. 반드시 실제 option/entity를 생성하거나 기존 항목을 선택한다.

## 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
