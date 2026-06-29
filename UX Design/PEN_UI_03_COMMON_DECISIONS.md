# PEN UI 03 Common Decisions

## 목적

이 문서는 `/Users/user/Sales_b2c/UX Design/onehand_sales.pen` 기준 CRM 리디자인을 진행할 때,
프론트엔드와 백엔드가 함께 먼저 합의해야 할 공통 결정사항을 정리한 문서다.

용도:
- 프론트 구현 착수 전 기준 합의
- 백엔드 API 영향도 판단 기준
- MVP 범위 고정
- 재작업 위험이 큰 항목 선제 정리

관련 문서:
- [PEN_UI_01_FRONTEND_PLAN.md](</Users/user/Sales_b2c/UX Design/PEN_UI_01_FRONTEND_PLAN.md>)
- [PEN_UI_02_BACKEND_IMPACT.md](</Users/user/Sales_b2c/UX Design/PEN_UI_02_BACKEND_IMPACT.md>)

---

## 1. 이미 확정된 방향

- 이번 작업은 `기존 UI 부분 수정`이 아니라 `CRM 전체 리디자인`이다.
- 기준은 현재 코드가 아니라 `onehand_sales.pen`이다.
- 기존 UI 구조는 보존 대상이 아니다.
- 기존 API, hook, 타입, 데이터 로직은 재사용 가능하면 유지한다.
- Desktop과 Mobile은 하나의 거대한 조건문 컴포넌트로 합치지 않는다.
- Desktop/Mobile은 레이아웃을 분리하고, 작은 UI와 데이터 로직만 공유한다.
- 먼저 디자인 토큰을 정리한 뒤 공통 App Shell과 대표 화면 구현에 들어간다.
- 전체 화면을 한 번에 구현하지 않고, 1차 범위를 먼저 완성한다.

2026-06-22 현재 구현 기준:

- `/` 홈은 실제 대시보드 화면으로 구현되어 있다.
- 딜 파이프라인은 `/deals`에서 운영한다.
- User Web 핵심 도메인은 Auth/User, Home, Company, Contact, Product, Deal, Schedule, MeetingNote, Search까지 실제 Backend API와 연결되어 있다.
- BusinessCard OCR, 범용 Import, Notification, Admin 운영 조회 API는 Backend 미구현 상태다. Trash와 Company/Contact/Product/Deal 도메인별 xlsx export는 현재 구현 완료 상태이며, 범용 ExportJob은 정본 흐름이 아니다.
- 회사/담당자/제품 생성 모달은 딜 추가 모달처럼 검색 입력형 선택과 결과 없음 즉시 추가를 사용한다.
- MeetingNote AI/STT 초안 endpoint와 User Web draft UI 연결은 구현 완료 상태다.
- 실제 구현 판단은 `BE/src/modules`, `BE/prisma/schema.prisma`, `FE/user-web/src/app/router/router.tsx`, `FE/user-web/src/features`를 우선한다.

---

## 2. 공통 목표

1차 목표:
- 디자인 토큰 정의
- 새 App Shell 정의
- 딜 중심 대표 화면 구현
- 이후 다른 CRM 화면으로 확장 가능한 구조 확보

1차 대표 화면:
- Desktop Deal Pipeline Home
- Mobile Deal Pipeline Home
- Deal Quick Create Modal
- Mobile Deal Detail Page

---

## 3. 우선 합의가 필요한 핵심 결정 5가지

### 1. Deal Stage 전략

현재 구조:
- `INITIAL_CONTACT`
- `NEEDS_CHECK`
- `PROPOSAL_QUOTE`
- `NEGOTIATION`
- `WON`
- `LOST`

pen 구조:
- 초기 접촉
- 니즈 확인
- 제안/견적
- 협상
- 성사
- 실패

현재 결정:
- FE/BE 모두 6단계 코드 계약을 사용한다.
- DB는 문자열 코드로 저장하고, 코드 단 enum/validation에서 6단계를 관리한다.
- 과거 `IN_DISCUSSION` 4단계 계약은 현재 기준이 아니다.

### 2. App Shell 교체 방식

현재 결정:
- App Shell은 현재 User Web 라우터의 기본 shell로 적용되어 있다.
- Desktop Sidebar, TopBar, Mobile Header, Bottom Tab Bar를 기준 shell로 사용한다.

후속:
- 새 도메인 화면은 현재 shell/navigation 문법을 재사용한다.
- Import처럼 숨김 처리된 라우트를 다시 노출할 때는 navigation 문서와 함께 갱신한다. Trash는 현재 navigation에 노출되는 구현 완료 화면이다.

### 3. MVP 범위

결정 필요:
- 딜만 1차 범위로 볼지
- 회사/담당자/제품까지 포함할지
- 일정까지 포함할지

현재 결정:
- 1차 딜 중심 구조는 완료 기준으로 본다.
- 현재는 회사/담당자/제품/일정/회의록 수동/AI/STT/저장 후 딜 연동까지 User Web/API 연동 완료 상태다.
- 후속 MVP는 Admin 운영 조회 API와 미구현 부가 기능군을 별도 계획으로 분리한다.

이유:
- pen 범위가 넓기 때문에 완료된 핵심 도메인과 Backend 미구현 도메인을 분리해야 한다.
- Admin/BusinessCard/Import/Notification을 핵심 도메인 유지보수와 섞으면 작업 범위가 급격히 커진다. Search와 Trash는 현재 구현 완료 기준으로 유지보수한다.

### 4. 토큰 관리 방식

결정 필요:
- Tailwind theme 중심
- CSS 변수 중심
- 병행

권장:
- `CSS 변수 + Tailwind semantic mapping 병행`

이유:
- pen 값이 매우 구체적이라 변수화에 적합하다.
- 컴포넌트 구현은 Tailwind utility를 유지하는 편이 빠르다.

### 5. Mobile/Desktop 기준

결정 필요:
- breakpoint 기준
- 모바일 우선 여부

권장:
- `768px` 기준으로 mobile/desktop 분리
- 1차 UX 기준은 mobile deal flow 우선

이유:
- pen 구조상 모바일 홈과 모바일 상세가 핵심 흐름이다.

---

## 4. 1차 범위 정의

### 포함

- 디자인 토큰
- Desktop App Shell
- Mobile App Shell
- Modal Shell
- Toast 구조
- Desktop Deal Pipeline Home
- Mobile Deal Pipeline Home
- Deal Quick Create Modal
- Mobile Deal Detail Page
- 상태 UI
  - loading
  - empty
  - error
  - success toast

### 제외

- 회사/담당자/제품 전면 리디자인은 2026-06-19 기준 목록/상세/API 연동과 생성 모달 입력 검색형 선택까지 완료 상태로 재분류한다.
- 일정 캘린더와 수동 회의록은 2026-06-19 기준 기본 구현 완료 상태로 재분류한다.
- 명함 스캔
- Import / Export
- 휴지통
- 알림 / 더보기 고도화
- Search 고도화는 현재 GlobalSearch 구현 이후의 품질/범위 확장으로 본다.

---

## 5. 공통 구조 원칙

### 프론트 구조

- 새 UI 구조를 먼저 만든다.
- 기존 page/feature는 데이터 로직 재사용 여부를 기준으로 유지한다.
- 새 라우트 또는 새 화면 컴포넌트를 병행 추가한 뒤 교체한다.

### 백엔드 구조

- 기존 CRUD API는 우선 재사용한다.
- 부족한 것은 aggregate/summary/metadata endpoint 후보로 분리한다.
- 1차에서는 가능한 한 API 전체 재설계보다 응답 확장 또는 조합으로 버틴다.

### 공유 원칙

- UI 구조 변경과 API 스키마 변경을 동시에 크게 벌리지 않는다.
- 재작업 위험이 큰 구조 변경은 1차에서 최소화한다.

---

## 6. 1차 공통 컴포넌트 합의안

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

주의:
- 이 컴포넌트들은 딜 중심 1차 범위를 기준으로만 만든다.
- 다른 도메인 전용 variation은 2차에서 확장한다.

---

## 7. 백엔드 영향이 큰 항목

- stage metadata endpoint 필요 여부
- 모바일 홈 aggregate endpoint 필요 여부
- quick create 후보 검색 endpoint 필요 여부는 현재 보류. 기존 옵션 조회/생성 API 조합으로 구현된 상태를 우선한다.
- summary/metadata 응답 추가 여부
- navigation badge count 필요 여부

1차 권장:
- 기존 API 재사용
- FE/BE 6단계 stage 계약 유지
- aggregate 필요성이 확인되면 별도 endpoint 추가 검토

---

## 8. 리스크와 대응

### 리스크

- Stage metadata/API 응답 표시 문법이 화면별로 갈라질 위험
- App Shell 교체가 모든 화면에 영향
- Quick Create modal 범위가 다시 커질 위험
- 모바일 홈이 aggregate 없이 다중 호출 과다로 갈 가능성
- 일정 화면까지 범위를 넓히면 일정/캘린더 설계가 별도 축으로 커짐

### 대응

- 1차는 딜 중심으로 제한
- shell은 병행 추가 후 교체
- stage는 FE/BE 6단계 계약 유지
- aggregate는 실제 호출량 확인 후 결정
- Import와 범용 ExportJob은 후속/비정본 흐름으로 분리. 일정/회의록과 도메인별 xlsx export는 현재 구현 기준을 따른다.

---

## 9. 권장 실행 순서

1. 디자인 토큰 정의
2. Desktop/Mobile Shell 구현
3. 공통 상태 UI 구현
4. 공통 딜 컴포넌트 구현
5. stage 6단계 표시/필터 문법 확인
6. Desktop Deal Pipeline Home 구현
7. Mobile Deal Pipeline Home 구현
8. Deal Quick Create Modal 구현
9. Mobile Deal Detail Page 구현
10. 기존 라우트와 연결
11. 타입체크 / 빌드 / 검증

---

## 10. 최종 결정 제안

### 지금 바로 확정 권장

- 1차 범위는 `딜 중심`
- `768px` 기준으로 mobile/desktop 분리
- `CSS 변수 + Tailwind mapping` 사용
- `새 Shell 병행 추가 후 교체`
- 데이터 로직 재사용, UI 구조 신규화
- stage는 FE/BE 6단계 계약 유지

### 별도 합의 후 진행할 것

- stage metadata endpoint 필요 여부
- Admin 운영 조회 API 범위
- BusinessCard/Import/Notification Backend 구현 범위. Trash는 구현 완료, 범용 ExportJob은 비정본.
- Search 고도화 범위

이미 결정/처리된 것:

- `/` 홈은 별도 aggregate endpoint 없이 기존 Schedule/Deal/MeetingNote API 조합으로 구현한다.
- 일정 화면과 수동 회의록은 현재 1차 구현 완료 범위로 본다.
- 회사/담당자/제품 분류 필터는 목록 select 안의 `+ 추가`로 관리 다이얼로그를 열 수 있다.
- quick create inline 생성 범위는 딜 추가와 회사/담당자/제품 생성 모달의 연결/분류 선택까지 포함한다.
- 회사/담당자/제품 생성 모달의 연결/분류 선택은 검색 입력형 필드에서 검색하고, 검색 결과가 없으면 현재 입력값 또는 연결 생성 모달로 새 항목을 만든 뒤 자동 선택한다.
- 딜 목록 필터는 stage tab과 별도로 `딜명 검색`, `전체`, `회사`, `담당자`, 정렬 select를 사용한다.

---

## 최종 정리

이 문서의 핵심은 하나다.

`pen 디자인 기준으로 UI는 전면 재설계하되, 1차에서는 딜 중심으로 범위를 고정하고, 백엔드 구조 변경은 최소화하면서 확장 가능한 기반을 먼저 만든다.`

이 문서를 기준으로 프론트와 백엔드는 다음을 먼저 합의해야 한다.

- stage 전략
- shell 교체 전략
- MVP 범위
- 토큰 전략
- mobile/desktop 기준
