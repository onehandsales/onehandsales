# P2 G12-G16 딜 중심 핵심 루프 상세 명세

## 1. 목적

P2는 `한손에 영업 / onehand.sales`의 핵심 사용 흐름인 딜 생성, 단계 관리, 다음 행동, 활동 로그, 홈 파이프라인을 완성하는 단계다.

## G12. Deal Backend vertical slice

### 화면 영향

G13-G16의 딜 목록, 빠른 생성, 상세 패널, 홈 파이프라인이 사용할 API를 제공한다.

### API 연결

- Deal CRUD
- Deal stage change
- Deal next action
- DealActivity CRUD
- API 요약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
- 엔드포인트 구현 계약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`

### DB 연결

- Deal
- DealActivity
- DealActivityType
- ProductConnection
- Company
- Contact
- Product

### 비즈니스 기준

- 딜 금액은 필수다.
- 단계 변경은 자동 활동 로그를 생성한다.
- 현재 사용자 소유 회사/담당자/제품만 연결할 수 있다.
- 다음 행동은 딜 목록과 상세에서 1급 정보로 취급한다.

### 완료 기준

- `/api/deals` CRUD가 동작한다.
- 단계 변경 시 `DealActivity`가 자동 생성된다.
- 다음 행동 완료/미루기 API가 동작한다.

## G13. Deal User Web 목록과 빠른 생성

### 화면 목적

사용자가 딜을 빠르게 만들고 목록에서 단계, 금액, 가능성, 다음 행동을 비교할 수 있게 한다.

### 화면 구성

#### 딜 목록

- 경로: `/deals` 또는 홈 `/` 일부
- 표시 순서: 딜이름 -> 회사/담당자 -> 단계 -> 금액 -> 가능성 -> 다음 행동 -> 마감일
- 주요 UI: 단계 탭, 검색, 필터, 빠른 생성 버튼, 딜 row/card

#### 딜 빠른 등록 modal

- 필수 입력: 딜이름, 금액
- 선택 입력: 회사, 담당자, 제품, 단계, 가능성, 다음 행동, 예상 종료일
- 회사/담당자/제품은 검색 combobox를 사용한다.

### API 연결

- `GET /api/deals`
- `POST /api/deals`
- `GET /api/companies`
- `GET /api/contacts`
- `GET /api/products`

### 상태/validation

- 딜이름 필수
- 금액 필수, 0 이상
- 가능성은 기본 `긍정/중립/부정`
- 퍼센트는 고급 옵션으로만 사용
- 생성 성공 시 목록과 단계 summary를 갱신한다.

### 완료 기준

- 딜을 생성하고 목록에서 확인할 수 있다.
- 딜 리스트 정보 순서가 UX 확정 기준을 따른다.

## G14. Deal inline entity creation

### 화면 목적

딜 빠른 생성 중 회사/담당자/제품이 없을 때 modal을 벗어나지 않고 최소 정보로 즉시 생성할 수 있게 한다.

### 화면 구성

- 검색 결과 없음 상태에서 `새 회사 만들기`, `새 담당자 만들기`, `새 제품 만들기` 표시
- inline 생성 form은 최소 필드만 노출
- 생성 후 해당 값을 딜 form에 자동 선택

### API 연결

- `POST /api/companies`
- `POST /api/contacts`
- `POST /api/products`
- `POST /api/deals`

### 상태/validation

- 회사 inline: 회사명 필수
- 담당자 inline: 이름 필수, 회사 선택 가능
- 제품 inline: 제품명 필수, 단가 선택
- 중복 후보가 있으면 먼저 보여주고, 사용자가 새로 만들기를 선택할 수 있게 한다.

### DB 연결

- Company
- Contact
- Product
- Deal

### 완료 기준

- 딜 modal을 벗어나지 않고 없는 항목을 최소 생성할 수 있다.
- 자유 텍스트만으로 딜에 저장하지 않는다.

## G15. Deal 상세 패널과 상세 페이지

### 화면 목적

딜의 핵심 요약, 활동 로그, Memo 기록, 관련 정보를 빠르게 확인하고 수정할 수 있게 한다.

### Desktop 화면

- 딜 목록 우측 상세 패널
- 항상 먼저 보이는 정보: 딜이름, 회사/담당자, 단계, 금액, 가능성, 다음 행동, 마감일
- 섹션: 기본 정보, 활동 로그, Memo 기록, 일정/회의록 placeholder, 제품/연결 정보
- 활동 로그는 객관적 사실/상태 변경/행동 이력이고, Memo 기록은 딜에 대한 사용자의 주관적 생각/판단이다.
- 딜 Memo는 `PersonalMemo(targetType=DEAL)`에 암호화 저장한다.

### Mobile 화면

- 딜 row/card 선택 시 상세 페이지로 이동
- 상단에는 핵심 요약을 먼저 표시
- 활동 로그는 timeline 형태

### API 연결

- `GET /api/deals/:dealId`
- `PATCH /api/deals/:dealId`
- `PATCH /api/deals/:dealId/stage`
- `PATCH /api/deals/:dealId/next-action`
- `POST /api/deals/:dealId/next-action/complete`
- `POST /api/deals/:dealId/next-action/snooze`
- `GET /api/deals/:dealId/activities`
- `POST /api/deals/:dealId/activities`

### 상태/validation

- 상세 loading skeleton
- 딜 없음 또는 삭제됨 상태
- 활동 로그 입력은 제목 필수
- 단계 변경 성공 시 timeline에 자동 로그가 즉시 보인다.

### 완료 기준

- 상세 패널에서 단계 변경과 활동 로그 추가가 가능하다.
- 다음 행동 완료/미루기가 동작한다.

## G16. Home pipeline 통합

### 화면 목적

로그인 후 첫 화면에서 개인 영업자가 진행 중인 딜과 다음 행동을 빠르게 파악하게 한다.

### 화면 구성

- 경로: `/`
- 1순위 영역: 딜 파이프라인
- 단계 탭: 전체, 초기 접촉, 협의중, 성사, 실패
- 데스크톱: 리스트/테이블 + 우측 상세 패널
- 모바일: 단계 탭 + 카드형 리스트
- 보조 영역: 오늘 일정 placeholder, 후속 연락 summary, 최근 회의록 placeholder

### API 연결

- `GET /api/deals`
- `GET /api/deals/:dealId`
- `PATCH /api/deals/:dealId/stage`
- G17 이후 `GET /api/schedules` 연결
- G19 이후 `GET /api/meeting-notes` 연결

### 상태/validation

- 딜 없음: 빠른 생성 CTA 표시
- 필터 결과 없음: 필터 초기화 버튼
- API 실패: 재시도
- 단계 변경 optimistic update는 실패 시 rollback한다.

### 완료 기준

- 홈 첫 화면에서 딜 파이프라인이 가장 큰 우선순위로 보인다.
- 다음 행동과 마감 상태가 목록에서 드러난다.

## 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
