# PEN UI 01 Frontend Plan

## 목적

이 문서는 `/Users/user/Sales_b2c/UX Design/onehand_sales.pen` 기준으로 CRM 프론트엔드를 전면 재설계하기 위한 1차 구현 계획 문서다.

목표:
- pen 파일의 화면 구조와 UX를 기준으로 새 앱 구조를 정의한다.
- 기존 UI 구조는 보존 대상이 아니며, 필요 시 대체한다.
- 기존 API/hook/type/data 로직은 재사용 가능하면 유지한다.
- 1차 범위는 디자인 토큰, 공통 App Shell, 대표 딜 화면 3개에 집중한다.
- 2026-06-22 기준으로 이 문서는 초기 계획과 현재 구현 기준선을 함께 담는다. 실제 구현 판단은 `현재 구현 기준선`을 우선한다.

구현 원칙:
- 구현 시작은 모바일 대표 화면을 우선한다.
- 하지만 앱 구조는 모바일만 기준으로 확정하지 않는다.
- 토큰, shell, navigation, 상태 구조는 처음부터 desktop/mobile 동시 대응 기준으로 설계한다.
- desktop과 mobile은 하나의 조건문 많은 컴포넌트로 합치지 않고 레이아웃을 분리한다.
- 공통화 대상은 데이터, 상태, 액션, 작은 UI 컴포넌트에 한정한다.

---

## 0. 현재 구현 기준선

기준일: 2026-06-22

현재 User Web 구현 상태:

- `/` 홈은 실제 대시보드 화면이다. Schedule, Deal, Deal stage count, MeetingNote API를 조합해 오늘 일정, 진행 딜, 마감 임박, 최근 회의록, 빠른 실행, 최근 활동을 표시한다.
- `/deals`는 딜 파이프라인 화면이다. 데스크톱은 테이블 + 우측 미리보기 패널, 모바일은 stage tab + 카드 리스트를 사용한다.
- 딜 목록 control 순서는 `딜명 검색`, `전체`, `회사`, `담당자`, 정렬 select다. `전체`는 검색/회사/담당자/정렬/stage/page를 기본값으로 되돌린다.
- 딜 목록 정렬은 select로 제공하며 라벨은 `최신순`, `금액 높은순`, `금액 낮은 순`, `마감일순`이다.
- 딜 목록과 stage counts는 `search`, `companyId`, `contactId` 필터를 함께 반영한다. 목록/export는 여기에 `dealStatus`, `sort`를 추가로 반영한다.
- `/companies`, `/contacts`, `/products`, `/meeting-notes`는 조밀한 Controls Bar + Table Card + Pagination 문법을 따른다.
- 회사/담당자/제품의 분류 필터 select는 현재 옵션 전체 조회 결과를 사용하며, select 안의 `+ 추가`로 해당 분류 관리 다이얼로그를 열 수 있다.
- 회사/담당자/제품 생성 모달의 연결/분류 필드는 딜 추가 모달과 같은 검색 입력형 선택 UX를 따른다.
  - 회사 추가: 분야/지역 검색, 결과 없음 시 즉시 추가 후 자동 선택
  - 담당자 추가: 회사 검색, 결과 없음 시 회사 생성 모달 연결 후 자동 선택. 부서/직급은 즉시 추가 후 자동 선택
  - 제품 추가: 카테고리/상태 검색, 결과 없음 시 즉시 추가 후 자동 선택
- 담당자 목록 정렬은 select로 `최신순`, `이름순`을 제공한다.
- 제품 목록 정렬은 select로 `최신순`, `딜 높은순`, `딜 낮은순`을 제공한다.
- `/schedules`, `/schedules/week`, `/meeting-notes`는 실제 Backend API와 연결되어 있다.
- `/business-cards`, `/contacts/scan`, `/notifications`, `/import`, `/export`, `/trash`는 라우트/feature가 있으나 대응 Backend module이 없어 완료 기능으로 보지 않는다.
- `GET /api/search` Backend와 User Web `GlobalSearch`가 연결되어 있다. 별도 검색 결과 라우트는 없고 상단/모바일 검색 UI에서 사용한다.
- MeetingNote AI/STT 초안 endpoint와 User Web 초안 UI 연결은 구현 완료 상태다.
- MeetingNote 후속 UI는 `/meeting-notes/new`의 직접 작성/저장 흐름을 기본으로 두고 `AI로 정리`, `음성으로 작성`을 선택 보조 액션으로 붙인다. 저장 후 상세 화면에서는 `POST /api/meeting-notes/:meetingNoteId/deals`로 딜 추가 연동과 딜 활동 로그 생성을 처리한다.
- Sidebar는 `홈`, `딜`, `회사`, `담당자`, `제품`, `일정`, `회의록`, `설정`을 노출한다. Import와 휴지통은 숨김 처리되어 있다.

현재 Backend 구현 상태:

- 구현됨: Auth/User, Company, Contact, Product, Deal, Schedule, MeetingNote 수동/AI/STT/딜 연동 도메인.
- Admin API는 `GET /admin/api/me`만 구현되어 있다.
- 없음: BusinessCard OCR, 범용 Import/Export job, Notification, Trash, Admin 운영 조회/감사/민감 원문 API.
- 구현됨: Search 통합검색 API와 User Web GlobalSearch.

---

## 1. pen 구조 요약

현재 pen 파일에서 확인한 핵심 top-level 프레임:

- `[home] Desktop – Deal Pipeline Home`
- `[home] -Mobile – Deal Pipeline Home`
- `[home] - 빠른등록 Modal`
- `[home] - Mobile – Deal Detail Page`
- `State Loading Panel` 포함 공통 상태 화면
- 추가 CRM 화면군
  - 딜 칸반 보드
  - 회사
  - 담당자
  - 제품
  - 일정
  - 회의록
  - 명함 스캔
  - Import / Export
  - 휴지통
  - 검색 / 알림 / 더보기

현재 editor 기준 reusable component:

- `StageBadge`
- `PrimaryButton`
- `FilterChip`
- `NavItem`
- `MobileDealCard`
- `ListItem/Deal Row`
- `Card/Base`
- `Toast/Success`
- `Toast/Error`

1차 구현의 대표 화면 기준은 다음으로 본다.

- Desktop Deal Pipeline Home
- Mobile Deal Pipeline Home
- Mobile Deal Detail Page
- 빠른등록 Modal

---

## 2. 화면별 구조 관찰

### Desktop Deal Pipeline Home

- 좌측 240px Sidebar
- 상단 64px TopBar
- TopBar 아래 48px Stage Tabs
- 메인 영역은 `list column + right detail panel(380px)` 구조
- 리스트와 상세 패널이 동시에 보이는 split view

### Mobile Deal Pipeline Home

- iOS 스타일 Status Bar
- 브랜드/액션 아이콘이 있는 상단 Header
- 검색 영역
- 가로 스크롤 Stage Tabs
- 필터 행
- MobileDealCard 리스트
- 우하단 FAB
- 하단 Bottom Tab Bar

### 빠른등록 Modal

- 공통 modal shell 위에 딜 생성 폼이 올라가는 구조
- 헤더 컬러/액션 스타일이 일반 페이지와 다름
- 회사/담당자/제품 선택 또는 생성 플로우와 연결될 가능성이 높음

### Mobile Deal Detail Page

- 모바일 전용 상세 레이아웃
- 헤더/상세 카드/탭/액션 구성이 홈 화면과 다른 문법을 가짐
- Desktop 우측 상세 패널과 동일 데이터를 쓰되 레이아웃은 별도 구현이 맞음

---

## 3. 공통 패턴 요약

### App Shell

- Desktop Shell
  - `Sidebar`
  - `TopBar`
  - `Main Area`
- Mobile Shell
  - `Mobile Header`
  - `Scrollable Content`
  - `Bottom Tab Bar`
  - `Floating Action Button`

### Navigation

- Sidebar menu group 구조
- Desktop top action bar
- Mobile bottom tab navigation
- More 화면 진입 구조가 따로 필요함

### List / Card

- `MobileDealCard`
- `Deal List Row`
- `Card/Base`
- 상태 badge와 액션 상태 텍스트가 반복됨

### Filter / Tabs / Badge

- `Stage Tabs`
- `FilterChip`
- `StageBadge`
- 가능성/다음 행동 상태 badge

### Modal / Feedback

- `BaseModal`
- `Toast/Success`
- `Toast/Error`
- loading / empty / error 상태 패널

---

## 4. 디자인 토큰 후보

pen에서 즉시 확인 가능한 토큰 축:

### Color

- background
  - `#F9FAFB`
  - `#F6F7F9`
  - `#FFFFFF`
  - `#14151F`
- border
  - `#E5E7EB`
  - `#E6EAF0`
  - `#1E2030`
- brand / action
  - `#1D4ED8`
  - `#4880EE`
  - `#5E5CE6`
- semantic
  - green / amber / red / cyan / indigo 계열

### Typography

- `Inter` 기반
- desktop / mobile 모두 명시적인 weight 사용
- 타이틀, 본문, 메타, badge용 폰트 계층 분리 필요

### Spacing

- 주 사용값: `8, 10, 12, 14, 16, 18, 20, 24`

### Radius

- `6, 8, 10, 11, 13, 16, 20, 26`

### Layout Size

- Sidebar: `240`
- TopBar: `64`
- Desktop Stage Tab Bar: `48`
- Right Detail Panel: `380`
- Mobile Bottom Tab Bar: `72`
- FAB: `52`

### Shadow

- FAB shadow
- Toast/Modal shadow

### 토큰 적용 방식 제안

1차는 `global.css`의 CSS 변수 + Tailwind semantic mapping 병행이 적합하다.

이유:
- pen 파일 값이 매우 구체적이라 CSS 변수로 토큰화하기 쉽다.
- 컴포넌트 사용성은 Tailwind utility를 유지하는 편이 빠르다.
- 이후 dark mode나 theme 확장보다 현재는 빠른 재구성이 우선이다.

---

## 5. 현재 코드 구조와 재사용 판단

현재 프론트 루트:

- `FE/user-web/src/app`
- `FE/user-web/src/components`
- `FE/user-web/src/features/*`
- `FE/user-web/src/pages/*`

### 유지 가치가 높은 것

- 도메인별 API client
- query key
- query/mutation hooks
- schema
- type 정의
- auth/provider/router의 큰 틀
- 에러 처리 및 공용 format 유틸

### 대체 가능성이 큰 것

- `src/components/layout/app-shell.tsx`
- 현재 page 레벨 화면 컴포넌트의 레이아웃
- 현재 딜 홈/리스트/상세 UI
- 기존 desktop/mobile 혼합형 화면 계층

### 결론

- 데이터 로직은 재사용
- 레이아웃/UI 계층은 새로 설계
- 기존 화면 컴포넌트는 병행 추가 후 라우트 연결 시 교체

---

## 6. 현재 코드와 pen 간 핵심 충돌

### Deal Stage

현재 단계 계약 (2026-06-15 기준, FE/BE 6단계 반영 완료):

- `INITIAL_CONTACT` — 초기 접촉
- `NEEDS_CHECK` — 니즈 확인
- `PROPOSAL_QUOTE` — 제안/견적
- `NEGOTIATION` — 협상
- `WON` — 성사
- `LOST` — 실패

pen 단계: 위와 동일 (완전 일치 달성).

판단:
- FE와 BE는 6단계 계약으로 정리됐다.
- DB는 문자열 코드로 저장하며 코드 단 enum/validation에서 6단계를 관리한다.

### App Shell

- 현재 셸은 pen 구조보다 단순하다.
- Mobile Bottom Tab 구조가 현재 앱 구조의 기본 전제는 아니다.

### Detail Layout

- 현재 딜 상세는 panel/page 구조가 있으나 pen 기준으로는 mobile detail page와 desktop side panel을 더 의도적으로 분리해야 한다.

---

## 7. 새 앱 구조 제안

### 추천 디렉터리 구조

- `src/design/tokens`
- `src/design/system`
- `src/components/shell`
- `src/components/navigation`
- `src/components/feedback`
- `src/features/deal-redesign`

### 1차 구조 초안

- `src/design/tokens/index.ts`
- `src/styles/globals.css` 또는 기존 global style 확장
- `src/components/shell/desktop-app-shell.tsx`
- `src/components/shell/mobile-app-shell.tsx`
- `src/components/shell/modal-shell.tsx`
- `src/components/navigation/sidebar-nav.tsx`
- `src/components/navigation/bottom-tab-bar.tsx`
- `src/components/navigation/mobile-app-header.tsx`
- `src/components/feedback/loading-state.tsx`
- `src/components/feedback/empty-state.tsx`
- `src/components/feedback/error-state.tsx`
- `src/components/feedback/toast.tsx`
- `src/features/deal-redesign/components/stage-badge.tsx`
- `src/features/deal-redesign/components/filter-chip.tsx`
- `src/features/deal-redesign/components/mobile-deal-card.tsx`
- `src/features/deal-redesign/components/deal-list-row.tsx`
- `src/features/deal-redesign/components/deal-quick-create-modal.tsx`
- `src/features/deal-redesign/screens/desktop-deal-pipeline-home.tsx`
- `src/features/deal-redesign/screens/mobile-deal-pipeline-home.tsx`
- `src/features/deal-redesign/screens/mobile-deal-detail-page.tsx`

### 구조 설계 원칙

- 구현 우선순위는 mobile-first로 가져간다.
- 하지만 구조 설계는 `desktop-aware`여야 한다.
- 즉, 모바일 홈을 먼저 구현하더라도 아래 항목은 처음부터 desktop 기준까지 포함해 결정한다.
  - app shell 경계
  - navigation 구조
  - stage/filter 공통 상태
  - list/detail 데이터 흐름
  - modal/toast/feedback 공통 규칙

이유:
- pen은 mobile과 desktop이 둘 다 존재하고 레이아웃 차이가 크다.
- mobile만 보고 구조를 고정하면 이후 desktop의 sidebar, split view, right detail panel 대응 과정에서 컴포넌트 경계와 상태 흐름을 다시 뜯을 가능성이 높다.
- 따라서 `화면 구현 순서`는 모바일 우선으로 가져가되, `구조 결정 순서`는 처음부터 mobile + desktop 동시 고려가 맞다.

---

## 8. 1차 구현 범위

### 포함

- 디자인 토큰
- Desktop App Shell
- Mobile App Shell
- Modal Shell
- Toast 구조
- Desktop Deal Pipeline Home
- Mobile Deal Pipeline Home
- Mobile Deal Detail Page
- Deal Quick Create Modal
- 상태 UI
  - loading
  - empty
  - error
  - success toast

### 제외

- 회사/담당자/제품 전면 리디자인
- 일정 캘린더 리디자인
- 회의록
- 명함 스캔
- Import / Export
- 휴지통
- 알림 / 검색 / 더보기 고도화

---

## 9. 공통 컴포넌트 1차 목록

- `PrimaryButton`
- `FilterChip`
- `StageBadge`
- `SidebarNavItem`
- `BottomTabBar`
- `MobileAppHeader`
- `MobileDealCard`
- `DealListRow`
- `BaseCard`
- `ModalShell`
- `SearchBar`
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `ToastSuccess`
- `ToastError`

---

## 10. 구현 순서

1. pen 기준 토큰 정의
2. shell/navigation 공통 구조 구현
3. feedback/state UI 구현
4. reusable component 구현
5. 딜 데이터에 대한 stage 임시 매핑 계층 정의
6. Mobile Deal Pipeline Home 구현
7. 같은 데이터/상태 구조 위에 Desktop Deal Pipeline Home 구현
8. Deal Quick Create Modal 구현
9. Mobile Deal Detail Page 구현
10. 필요 시 Desktop Detail Panel/Detail Shell 정리
11. 기존 라우트 연결 및 화면 교체
12. 타입체크 / 빌드 / 화면 점검

설명:
- 모바일 화면을 먼저 구현해서 핵심 UX와 컴포넌트 문법을 빠르게 검증한다.
- 바로 이어서 같은 도메인의 desktop 화면을 붙여서 구조가 실제로 재사용 가능한지 확인한다.
- 즉 `모바일만 오래 구현한 뒤 나중에 desktop을 생각하는 방식`은 피한다.

---

## 11. 리스크

- 과거 Deal stage 4단계와 pen 6단계 충돌은 해소됨
- Quick Create 및 핵심 생성 모달의 inline 생성 UX는 회사/담당자/제품 연결과 분류 선택 범위까지 포함해 구현됨
- Shell 교체가 전체 라우트에 영향을 줄 수 있음
- Mobile/Desktop을 지나치게 공유하려고 하면 구조가 다시 꼬일 수 있음
- 1차 범위를 넘겨 일정/회의록까지 같이 건드리면 구현이 퍼질 수 있음

---

## 12. 현재 시점 결정 제안

### 확정 권장

- 1차 범위는 `딜 중심`으로 제한
- 데이터 로직은 재사용
- UI 레이어는 신규 구조 병행 추가
- `768px`를 mobile/desktop 기준으로 사용
- 토큰은 CSS 변수 + Tailwind mapping 병행

### 별도 결정 필요

- Deal stage는 FE/BE 6단계 계약을 유지
- Quick Create와 핵심 생성 모달의 inline entity create는 1차 포함으로 확정
- Desktop 홈에서 현재 right detail panel을 그대로 유지할지, 새 detail shell로 바꿀지

---

## 다음 단계

1. 홈/딜/회사/담당자/제품/일정/회의록 실제 세션 smoke 확인
2. 목록 컨트롤 select/button 공통화 범위 결정
3. 생성 모달 입력 검색형 inline create의 실제 세션 smoke 확인
4. Admin 운영 조회 API 또는 Admin Web placeholder 경계 결정
5. BusinessCard/Import-Export/Notification/Trash Backend 계획 수립
