# UX/UI Create Flow Decision

## 결정

현재 활성 생성 flow는 회사 등록을 기준으로 한다.

- 빠른 등록: 목록 맥락을 유지하는 문서형 생성 패널 또는 최소 입력 모달
- 상세 등록/수정: 별도 상세 페이지

2026-09-10 기준 담당자/제품/딜의 `/app` route는 `/app`으로 redirect하므로 활성 생성 flow가 아니다. 후속에 다시 활성화할 때는 회사 생성 패널 기준을 우선 검토한다.

## 이유

영업자는 현장에서 정보를 빠르게 남겨야 한다.

처음부터 모든 정보를 입력하게 하면 등록을 미루거나 누락할 가능성이 높다.

반대로 회사 히스토리와 Memo 기록 같은 복잡한 정보는 작은 모달에서 다루기 어렵다.

따라서 최소 필드로 빠르게 생성하고, 상세 페이지에서 보강한다.

## 빠른 등록 원칙

- 현재 화면 맥락을 유지한다.
- 필수 또는 거의 필수인 필드만 받는다.
- 저장 후 상세로 이동할 수 있어야 한다.
- 복잡한 입력은 상세 페이지로 넘긴다.
- 목록 화면에서 생성하는 도메인은 가능하면 목록을 유지한 채 오른쪽 문서형 패널로 연다.
- 패널이 열려도 목록 비교 컬럼은 줄이지 않고, 공간이 부족하면 가로 스크롤로 대응한다.

## 빠른 등록 최소 필드

Company:

- 회사명
- 카테고리/업종 optional
- initial Memo optional

비활성 도메인:

- 담당자
- 제품
- 딜

## 현재 비활성 생성 흐름

담당자/제품/딜 생성과 딜 등록 중 inline entity creation은 현재 user-web 활성 범위가 아니다.

## 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
