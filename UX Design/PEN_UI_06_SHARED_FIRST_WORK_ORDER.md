# PEN UI 06 Shared-First Work Order

## 목적

이 문서는 `/Users/user/Sales_b2c/UX Design/onehand_sales.pen` 기준 CRM 리디자인 작업을 진행할 때,
도메인 화면을 바로 늘리기 전에 `공용 파일과 공용 구조를 우선` 정리하는 실행 순서를 정의한다.

이 문서의 목표:

- 공용 토큰, shell, 상태 UI, 공용 컴포넌트의 우선순위를 고정한다.
- 딜/로그인/company/contact/product/schedule 순서가 왜 그렇게 잡히는지 정리한다.
- 작업자가 중간에 domain-first로 퍼지지 않도록 기준 순서를 남긴다.

관련 문서:

- [PEN_UI_01_FRONTEND_PLAN.md](</Users/user/Sales_b2c/UX Design/PEN_UI_01_FRONTEND_PLAN.md>)
- [PEN_UI_03_COMMON_DECISIONS.md](</Users/user/Sales_b2c/UX Design/PEN_UI_03_COMMON_DECISIONS.md>)
- [PEN_UI_04_IMPLEMENTATION_LOG.md](</Users/user/Sales_b2c/UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md>)
- [AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md](</Users/user/Sales_b2c/AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md>)
- [AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md](</Users/user/Sales_b2c/AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md>)
- [AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md](</Users/user/Sales_b2c/AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md>)

---

## 현재 전제

- 기준은 기존 화면이 아니라 `onehand_sales.pen`이다.
- 기존 API/hook/type/data 로직은 재사용 가능하면 유지한다.
- desktop/mobile은 하나의 거대한 조건문 컴포넌트로 합치지 않는다.
- 공통화는 `토큰`, `shell`, `상태 UI`, `작은 UI 컴포넌트`, `데이터/액션 로직`에 집중한다.
- 도메인 화면은 공용 기반이 어느 정도 정리된 뒤 확장한다.

2026-06-22 현재 구현 상태:

- 공용 Shell, navigation, modal shell, 상태 UI, page-number pagination은 User Web에 적용되어 있다.
- `/` 홈은 실제 대시보드 화면으로 구현되어 있다.
- `/deals`는 딜 파이프라인 기준 화면으로 운영한다.
- Company, Contact, Product, Schedule, MeetingNote는 실제 Backend API와 연결되어 있다.
- 회사/담당자/제품/딜/회의록 목록은 10개 단위 page-number pagination과 공용 `Pagination`을 사용한다.
- 회사/담당자/제품 필터 select에는 `+ 추가` 옵션이 있고, 각 분류 관리 다이얼로그에서 추가/삭제 후 해당 필터를 바로 선택할 수 있다.
- 회사/담당자/제품 생성 모달의 연결/분류 선택은 검색 입력형 필드와 결과 없음 즉시 추가 흐름을 사용한다.
- 통합검색은 Backend `GET /api/search`와 User Web `GlobalSearch`가 연결되어 있다.
- MeetingNote AI/STT 초안 endpoint와 User Web draft UI 연결은 구현 완료 상태다.
- MeetingNote 저장 후 딜 추가 연동과 딜 활동 로그 생성은 구현 완료 상태다.
- 딜 목록은 `딜명 검색`, `전체`, `회사`, `담당자`, 정렬 select 순서를 사용하며, 회사/담당자 필터는 stage counts, 목록, export에 반영된다.
- BusinessCard, DataImport, Trash는 FE/BE 연결이 완료된 상태다. Notification, Admin 운영 조회 API, Tag, ImportJob 영속화/재개는 후속 범위이며, 범용 ExportJob은 비정본이다.

---

## 왜 공용 파일을 먼저 해야 하는가

공용 파일을 먼저 하지 않으면 아래 문제가 반복된다.

1. company/contact/product 화면마다 spacing, radius, color가 갈라진다.
2. mobile/desktop 레이아웃 규칙이 화면마다 달라진다.
3. loading/empty/error 표현이 제각각이 된다.
4. modal, detail panel, card, section header가 도메인마다 중복 구현된다.
5. 딜 화면에서 쓴 패턴을 다른 도메인으로 옮길 때 다시 뜯게 된다.

따라서 화면 수를 늘리기 전에 공용 구조를 먼저 고정하는 편이 전체 비용이 더 낮다.

---

## 전체 실행 순서

이 리디자인은 아래 순서를 기본으로 한다.

1. 디자인 토큰
2. 공용 Shell
3. 공용 상태 UI
4. 공용 데이터 표시 컴포넌트
5. 딜 1차 마감
6. 로그인/랜딩 정리
7. company
8. contact
9. product
10. schedule
11. 부가 기능군

---

## Phase 1. 공용 기반

### 목표

모든 후속 도메인 화면이 재사용할 수 있는 시각/구조 기반을 먼저 고정한다.

### 1-1. 디자인 토큰

먼저 확정할 것:

- color
- typography
- spacing
- radius
- border
- shadow
- semantic status color
- desktop/mobile layout size

구현 대상 예시:

- `FE/user-web/src/styles/global.css`
- `FE/user-web/tailwind.config.ts`
- 필요 시 `src/design/tokens/*`

완료 조건:

- 딜/로그인/company가 모두 같은 토큰 세트를 참조할 수 있어야 한다.
- button, card, panel, badge, modal에 필요한 값이 토큰 수준에서 표현돼야 한다.

### 1-2. 공용 Shell

먼저 완성할 것:

- Desktop Sidebar
- Desktop TopBar
- Mobile Header
- Bottom Tab Bar
- App Shell 분기 구조
- Modal Shell
- Toast 공통 구조

구현 대상 예시:

- `FE/user-web/src/components/layout/*`
- `FE/user-web/src/components/shell/*`
- `FE/user-web/src/components/navigation/*`

완료 조건:

- 이후 도메인 페이지는 shell을 새로 만들지 않고 화면 content만 꽂을 수 있어야 한다.
- mobile/desktop 분기 기준이 shell 수준에서 정리되어 있어야 한다.

### 1-3. 공용 상태 UI

먼저 정리할 것:

- LoadingState
- EmptyState
- ErrorState
- SuccessToast
- FilterEmptyState

완료 조건:

- 각 도메인에서 loading/empty/error를 다시 디자인하지 않아도 된다.
- 상태 UI가 pen 톤과 어긋나지 않는다.

### 1-4. 공용 데이터 표시 컴포넌트

먼저 정리할 것:

- BaseCard
- SectionHeader
- PrimaryButton
- SecondaryButton
- FilterChip
- Badge 계열
- SearchBar
- list row / mobile card 계열 베이스

완료 조건:

- 딜/회사/담당자/제품 화면이 동일한 card/button/filter 문법을 공유할 수 있어야 한다.

---

## Phase 2. 딜 기준 화면 마감

### 목표

로그인 후 첫 화면인 딜 파이프라인을 기준 화면으로 완성해 이후 도메인 확장의 기준 퀄리티를 고정한다.

### 먼저 할 것

- Desktop Deal Pipeline Home
- Mobile Deal Pipeline Home
- Desktop Detail Panel
- Mobile Deal Detail Page
- Deal Quick Create Modal
- StageBadge / FilterChip / Deal Row / MobileDealCard 문법 통일

### 왜 딜을 먼저 마감하는가

- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md` 기준 첫 핵심 흐름이 딜 파이프라인 확인이다.
- `UX_UI_DIRECTION.md` 기준 로그인 후 첫 화면은 딜 파이프라인 홈이다.
- 딜이 완성돼야 다른 도메인도 어느 정도 정보 밀도와 액션 문법을 따라갈 수 있다.

### 완료 조건

- desktop/home, mobile/home, mobile/detail, quick create modal이 pen 기준으로 크게 어색하지 않아야 한다.
- 다음 행동, 금액, 단계, 마감일의 표시 문법이 고정돼야 한다.
- 가능성/likelihood는 현재 Deal API 기준이 아니므로 후속 범위로 분리돼야 한다.

---

## Phase 3. 로그인 / 랜딩 정리

### 목표

auth 기능 전체 완성보다 먼저, 앱 첫 진입 경험을 pen 기준으로 정리한다.

### 정리 대상

- 랜딩 페이지
- 로그인 모달
- provider 버튼
- loading / error / disabled 상태
- mock fallback 동작

### 원칙

- 실제 Supabase env 연동은 나중에 해도 된다.
- 하지만 UI 구조와 mock 진입 흐름은 지금 정리해야 한다.
- `/login`은 단순 폼 페이지가 아니라 랜딩 + 모달 구조를 기준으로 본다.

### 완료 조건

- pen과 크게 다른 첫 진입 경험이 정리돼 있어야 한다.
- mock/fallback 버튼은 실제로 동작해야 한다.

---

## Phase 4. Company 도메인

### 목표

딜 다음으로 중요한 기준 데이터 도메인인 회사를 새 리디자인 구조에 올린다.

### 구현 대상

- 회사 목록
- 회사 상세
- 회사 생성/수정
- 회사 메모 / 개인 비밀 메모
- 연결 Contact 요약
- 회사 export

### 이유

- 딜 생성과 상세 문맥에서 회사는 필수 연결 엔티티다.
- company 화면을 먼저 완성하면 contact/product 화면도 같은 패턴으로 확장하기 쉬워진다.

### 완료 조건

- company 목록/상세가 공용 shell, 공용 state UI, 공용 card/button 문법을 재사용한다.
- company 전용 row/card/detail section 패턴이 안정적으로 잡혀야 한다.

---

## Phase 5. Contact 도메인

### 구현 대상

- 담당자 목록
- 담당자 상세
- 생성/수정
- 회사 연결 문맥

### 이유

- 회사 다음으로 딜과 강하게 연결되는 엔티티다.
- company 화면에서 만든 요약/상세 패턴을 재사용하기 쉽다.

---

## Phase 6. Product 도메인

### 구현 대상

- 제품 목록
- 제품 상세
- 생성/수정
- 딜 연결 문맥

### 이유

- 딜과 함께 핵심 데이터 문맥을 이루는 마지막 기준 엔티티다.

---

## Phase 7. Schedule 도메인

### 구현 대상

- 월간/주간 일정
- 딜/회사/담당자 연결
- 일정 생성/수정

### 이유

- 캘린더와 레이아웃 규칙이 별도 축이라, 기준 데이터 도메인보다 뒤에 두는 편이 안전하다.

---

## Phase 8. 부가 기능군

후순위 기능:

- meeting-note
- business-card
- import/export
- trash
- notifications
- search

원칙:

- 핵심 영업 흐름을 먼저 안정화한 뒤 붙인다.
- 별도 외부 연동 또는 부가 상태가 많은 기능은 마지막으로 보낸다.

---

## 지금 시점의 실제 다음 작업

현재 상태를 기준으로 바로 들어갈 다음 3개는 아래다.

1. 생성 모달 입력 검색형 추가/자동선택과 홈/딜/회사/담당자/제품/일정/회의록 실제 세션 smoke 확인
2. 목록 컨트롤 select/button 공통화 범위 결정
3. Admin 운영 조회 API 또는 미구현 부가 기능군의 Backend 계획 수립

이 순서를 권장하는 이유:

- 핵심 User Web 도메인은 이미 실제 API 연결까지 넓어졌으므로, 다음 작업은 구현 확대보다 일관성 검증과 공통화가 우선이다.
- Admin 운영 조회, Notification, Tag, ImportJob 영속화/재개는 Backend 부재가 분명하므로 별도 계획 없이 FE만 확장하면 계약 불일치가 커진다. BusinessCard, DataImport, Search, Trash는 현재 구현 완료 기준으로 유지보수하고, 범용 ExportJob은 신규 확장하지 않는다.

---

## 순서 변경이 가능한 경우

아래 경우에는 예외적으로 순서를 조정할 수 있다.

- 실제 auth env가 준비되어 로그인 smoke를 먼저 붙여야 할 때
- Backend company API 계약 변경이 먼저 발생했을 때
- Quick Create modal 범위가 backend 결정 때문에 막힐 때

하지만 그 경우에도 `공용 토큰 -> 공용 shell -> 공용 상태 UI`보다 먼저 company/contact/product를 크게 확장하는 것은 권장하지 않는다.

---

## 완료 판단 기준

이 문서 기준으로 작업이 잘 진행되고 있는지는 아래로 판단한다.

- 새 도메인 화면이 생길 때 공용 shell/state/button/card를 재사용하고 있는가
- mobile/desktop 레이아웃을 분리하되 데이터 로직은 공유하고 있는가
- 딜 화면이 후속 도메인의 기준 퀄리티 역할을 하고 있는가
- 로그인/company가 임의 스타일이 아니라 pen 톤과 연결되고 있는가
- 도메인 수가 늘어나도 문법이 갈라지지 않는가

---

## 한 줄 원칙

`토큰 -> 셸 -> 상태 UI -> 공용 컴포넌트 -> 딜 기준 화면 -> 로그인 -> company -> contact -> product -> schedule -> 부가 기능`
