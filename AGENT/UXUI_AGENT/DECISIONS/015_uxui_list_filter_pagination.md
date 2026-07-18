# UX/UI List Filter And Pagination Decision

## 결정

회사, 담당자, 제품, 딜, 회의록, 명함스캔, 데이터 업로드 내역, 휴지통의 목록 조회 화면은 page-number pagination을 기준으로 한다.

목록 페이지 필터는 제품 목록의 category/status select처럼 전체 옵션 API를 초회 조회한 뒤 compact select로 제공한다.

## 적용 범위

- 회사 목록
  - `GET /api/company-fields`
  - `GET /api/company-regions`
  - `분야 ▾`, `지역 ▾` select
- 담당자 목록
  - `GET /api/contact-departments`
  - `GET /api/contact-job-grades`
  - `부서 ▾`, `직급 ▾` select
- 제품 목록
  - `GET /api/product-categories`
  - `GET /api/product-statuses`
  - `카테고리 ▾`, `판매 상태 ▾` select
- 딜 목록
  - stage tab
  - `딜이름 검색`, `전체`, `회사`, `담당자`, sort select
  - 회사/담당자 옵션은 Deal option API를 사용하고, 회사 선택 시 담당자 옵션을 같은 회사 기준으로 좁힌다.
- 회의록 목록
  - 회사/담당자 filter option API
- 명함스캔 목록
  - status filter
- 데이터 업로드 내역 목록
  - 업로드 대상 filter
- 휴지통 목록
  - domain/item kind/log type filter

## Pagination 규칙

- 목록 페이지는 `totalPages`, `totalCount`를 사용한다.
- 현재 목록 API는 15개 단위 page-number pagination을 계약으로 가진다.
- page size를 바꾸려면 Backend 도메인 서비스 상수, 응답 `pageSize`, API/DB 문서, 관련 테스트를 함께 갱신한다.
- FE에서 page size 숫자만 바꾸거나, 응답 `pageSize`와 UI 표시가 어긋나게 만들지 않는다.
- 모바일 record list도 15개 page 계약을 사용하되 desktop table 대신 card/list로 표현한다.
- 20개 기본 표시는 현재 row height와 layout에서는 쓰지 않는다. 나중에 고밀도 보기 옵션으로만 검토한다.
- 공용 `Pagination` 컴포넌트에는 `hasNext`를 전달하지 않는다.
- 1페이지만 존재하면 pagination은 숨길 수 있다.
- `hasNext`는 상세 메모 로그처럼 cursor 기반 incremental loading에서만 사용한다.

## Option 관리 UX

회사/담당자/제품 목록 필터 select에는 `+ 추가` 옵션을 제공한다.

예:

- 회사 분야/지역 select의 `+ 추가` -> 회사 분류 관리 다이얼로그
- 담당자 부서/직급 select의 `+ 추가` -> 담당자 분류 관리 다이얼로그
- 제품 카테고리/판매 상태 select의 `+ 추가` -> 제품 분류 관리 다이얼로그

분류 다이얼로그에서는 옵션 추가/삭제를 처리하고, 새로 추가된 옵션은 목록 필터로 바로 선택한다.

## 정렬 Select

목록 정렬은 chip 나열보다 compact select를 기본으로 한다.

- 회사 목록: `최신순`, `담당자 높은순`, `담당자 낮은순`, `딜 높은순`, `딜 낮은순`
- 담당자 목록: `최신순`, `이름순`
- 제품 목록: `최신순`, `딜 높은순`, `딜 낮은순`
- 딜 목록: `최신순`, `금액 높은순`, `금액 낮은 순`, `마감일순`
- 회의록 목록: `등록 최신순`, `회의일 최신순`

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
