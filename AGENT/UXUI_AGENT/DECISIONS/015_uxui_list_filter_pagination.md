# UX/UI List Filter And Pagination Decision

## 결정

회사, 담당자, 제품, 딜, 회의록의 목록 조회 화면은 page-number pagination을 기준으로 한다.

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
  - sort/filter controls
- 회의록 목록
  - 회사/담당자 filter option API

## Pagination 규칙

- 목록 페이지는 `totalPages`, `totalCount`를 사용한다.
- 목록 페이지는 10개 단위로 페이지를 나눈다.
- 공용 `Pagination` 컴포넌트에는 `hasNext`를 전달하지 않는다.
- 1페이지만 존재하면 pagination은 숨길 수 있다.
- `hasNext`는 상세 메모 로그처럼 cursor 기반 incremental loading에서만 사용한다.

## Option 관리 UX

목록 페이지에서는 option table의 생성/삭제 UI를 보여주지 않는다.

예:

- 회사 분야 생성/삭제
- 회사 지역 생성/삭제
- 담당자 부서 생성/삭제
- 담당자 직급 생성/삭제

이 기능들은 상세/설정/관리 화면에서 다룬다.

## 정렬 Select

목록 정렬은 chip 나열보다 compact select를 기본으로 한다.

- 회사 목록: `최신순`, `담당자 높은순`, `담당자 낮은순`, `딜 높은순`, `딜 낮은순`
- 담당자 목록: `최신순`, `이름순`
- 제품 목록: `최신순`, `딜 높은순`, `딜 낮은순`
- 딜 목록: `최신순`, `금액 높은순`, `금액 낮은 순`, `마감일순`
- 회의록 목록: `등록 최신순`, `회의일 최신순`

## Visual Grammar

회사/담당자/제품/딜 목록은 가능한 한 다음 문법을 공유한다.

- compact controls bar
- select filter
- count text
- table card
- fixed-height row
- bottom pagination

목록 화면은 비교와 반복 작업이 중요하므로 큰 hero/page header보다 조밀한 업무 도구형 구성을 우선한다.

## 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
