# User Flow / 화면 목록

---

## 1. 핵심 User Flow

### Flow 0. 로그인 후 딜 파이프라인 확인

1. 사용자가 로그인한다.
2. 홈에서 딜 파이프라인을 가장 먼저 확인한다.
3. 단계별 진행 중 딜을 훑어본다.
4. 금액, 가능성, 다음 행동, 마감 임박 여부를 확인한다.
5. 필요한 딜 상세로 진입하거나 새 딜을 생성한다.
6. 데스크톱에서는 선택한 딜의 상세 정보를 우측 패널에서 확인한다.

### Flow 1. 기본 데이터 등록

1. 사용자가 로그인한다.
2. 빠른 등록 모달로 회사 등록 또는 Import를 실행한다.
3. 빠른 등록 모달로 거래처(담당자)를 등록한다.
4. 빠른 등록 모달로 제품을 등록한다.
5. 필요 시 상세 페이지에서 추가 정보를 보강한다.
6. 태그를 생성하고 필요한 엔티티에 붙인다.

### Flow 2. 명함 OCR

1. 사용자가 명함 이미지 파일을 업로드한다.
2. OpenAI OCR이 회사/담당자 정보를 추출한다.
3. 사용자가 OCR 결과를 확인/수정한다.
4. 기존 회사 후보를 확인한다.
5. 기존 회사 연결 / 새 회사 생성 / 회사 없이 저장 중 선택한다.
6. 거래처(담당자)를 저장한다.

### Flow 3. 딜 관리

1. 회사/거래처/제품 기반으로 딜을 생성한다.
2. 빠른 등록 모달에서 딜명, 회사, 거래처, 제품, 금액, 단계, 가능성을 입력한다.
3. 회사/거래처/제품 검색 결과가 없으면 모달 안에서 최소 정보로 즉시 생성한다.
4. 새로 생성된 회사/거래처/제품은 딜에 자동 선택된다.
5. 필요 시 딜 상세 페이지에서 추가 정보를 보강한다.
6. 활동 로그를 추가한다.
7. 단계 변경 시 자동 활동 로그가 생성된다.
8. 딜 상세에서 관련 일정/회의록/제품을 확인한다.

### Flow 4. 일정 관리

1. 사용자가 일정을 등록한다.
2. 딜/회사/거래처와 연결한다.
3. 알림 기본값을 확인하거나 수정한다.
4. 일정 기본 화면에서 이번 달 월간 캘린더를 확인한다.
5. 같은 일정 화면에서 주간 보기로 전환한다.
6. 필요하면 주간 보고서 화면으로 이동한다.
7. PDF 또는 Excel로 출력한다.

### Flow 5. 구글 캘린더 가져오기

1. 사용자가 Google OAuth를 연결한다.
2. 구글 캘린더 이벤트를 가져온다.
3. 가져온 일정을 우리 서비스 일정으로 표시한다.
4. 필요 시 회사/거래처/딜에 연결한다.

### Flow 6. AI 회의록

1. 사용자가 회의 내용을 텍스트로 입력한다.
2. AI가 9개 항목으로 회의록을 생성한다.
3. AI가 회사/담당자 후보를 제안한다.
4. 사용자가 결과를 수정한다.
5. 회의록을 저장한다.
6. 필요 시 딜과 연결한다.
7. 딜 활동 로그가 자동 생성된다.

### Flow 7. Import

1. 사용자가 Excel/CSV 파일을 업로드한다.
2. AI가 컬럼을 자동 매핑한다.
3. 사용자가 매핑 결과를 확인/수정한다.
4. Import를 확정한다.
5. 성공/실패/건너뜀 결과를 확인한다.

### Flow 8. Export

1. 사용자가 Export 대상을 선택한다.
2. PDF 또는 Excel을 선택한다.
3. 민감 데이터 포함 여부를 선택한다.
4. 민감 데이터 포함 시 경고를 확인한다.
5. 파일을 다운로드한다.

### Flow 9. 통합검색

1. 사용자가 상단 통합검색에 키워드를 입력한다.
2. 회사/거래처/제품/딜/일정/회의록 결과가 유형별로 표시된다.
3. 진행 중 딜과 최근 항목이 우선 표시된다.
4. 사용자가 결과를 선택한다.
5. 해당 상세 페이지 또는 상세 패널로 이동한다.

### Flow 10. 딜 상세에서 일정/회의록 연결

1. 사용자가 딜 상세를 연다.
2. 일정 또는 회의록 섹션을 확인한다.
3. 새 일정/회의록을 만들거나 기존 항목을 연결한다.
4. 딜에서 생성한 일정/회의록은 딜의 회사/거래처 정보를 기본 상속한다.
5. 연결된 일정/회의록은 딜 상세 관련 섹션과 활동 로그에 표시된다.

### Flow 11. 다음 행동 처리

1. 사용자가 딜 목록 또는 딜 상세에서 다음 행동을 확인한다.
2. 다음 행동이 임박/지연이면 상태 색상으로 표시된다.
3. 사용자가 완료, 미루기, 일정 추가, 활동 로그 추가 중 하나를 선택한다.
4. 처리 결과가 딜 활동 로그에 반영된다.

## 2. User Web 화면 목록

| 경로 | 화면 | MVP |
|---|---|---|
| `/login` | 로그인 | 포함 |
| `/` | 딜 파이프라인 홈 | 포함 |
| `/companies` | 회사 목록 | 포함 |
| `/companies/:id` | 회사 상세 | 포함 |
| `/contacts` | 거래처(담당자) 목록 | 포함 |
| `/contacts/:id` | 거래처 상세 | 포함 |
| `/contacts/scan` | 명함 OCR 업로드 | 포함 |
| `/products` | 제품 목록 | 포함 |
| `/products/:id` | 제품 상세 | 포함 |
| `/deals` | 딜 목록 | 포함 |
| `/deals/:id` | 딜 상세 | 포함 |
| `/schedules` | 일정 목록/캘린더 | 포함 |
| `/schedules/week` | 주간 일정 보고서 | 포함 |
| `/meetings` | 회의록 목록 | 포함 |
| `/meetings/new` | AI 회의록 생성 | 포함 |
| `/meetings/:id` | 회의록 상세 | 포함 |
| `/imports` | Import 작업 | 포함 |
| `/exports` | Export 작업 | 포함 |
| `/settings` | 설정 | 포함 |
| `/trash` | 휴지통 | 포함 |
| `/search` | 통합검색 결과 | 포함 |

## 3. Admin Web 화면 목록

| 경로 | 화면 | MVP |
|---|---|---|
| `/login` | Admin 로그인 | 포함 |
| `/` | Admin 대시보드 | 포함 |
| `/users` | 사용자 목록 | 포함 |
| `/users/:id` | 사용자 상세 | 포함 |
| `/users/:id/deals` | 사용자별 딜 | 포함 |
| `/users/:id/companies` | 사용자별 회사 | 포함 |
| `/users/:id/contacts` | 사용자별 거래처 | 포함 |
| `/users/:id/products` | 사용자별 제품 | 포함 |
| `/deals` | 전체 딜 | 포함 |
| `/companies` | 전체 회사 | 포함 |
| `/contacts` | 전체 거래처 | 포함 |
| `/products` | 전체 제품 | 포함 |
| `/audit-logs` | 감사 로그 | 포함 |
| `/payments/manual` | 계좌이체 확인 | 이후 |

## 4. 현재 코드 라우트 상태

현재 User Web router 기준 실제 구현 경로:

- `/login`
- `/`
- `/companies`
- `/companies/:companyId`
- `/contacts`
- `/contacts/scan`
- `/contacts/:contactId`
- `/products`
- `/products/:productId`
- `/deals`
- `/deals/:dealId`
- `/schedules`
- `/schedules/week`
- `/meeting-notes`
- `/meeting-notes/new`
- `/meeting-notes/:meetingNoteId`
- `/business-cards`
- `/notifications`
- `/import`
- `/export`
- `/trash`
- `/settings`

현재 Admin Web router 기준 실제 구현 경로:

- `/login`
- `/`
- `/users`
- `/users/:userId`
- `/organizations`
- `/subscriptions`
- `/analytics`
- `/audit-logs`
- `/system`
- `/support`

현재 화면 목록과 코드의 차이:

- 기획 목록의 `/meetings*`는 현재 코드에서 `/meeting-notes*`로 구현되어 있다.
- 기획 목록의 `/imports`, `/exports`는 현재 코드에서 `/import`, `/export`로 구현되어 있다.
- 기획 목록의 `/search` 전용 라우트는 현재 User Web router에 없다.
- 기획 목록의 Admin 상세 데이터 라우트와 전체 딜/회사/거래처/제품 라우트는 현재 Admin Web router에 없다.
- Backend에는 현재 Admin Web 운영 조회 API가 `GET /admin/api/me` 외에는 구현되어 있지 않다.

라우트명을 변경하거나 신규 화면을 추가할 때는 이 문서와 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`를 함께 갱신한다.

## 5. 기본 레이아웃 방향

User Web:

- 좌측 사이드바
- 상단바
- 로그인 후 첫 화면은 딜 파이프라인 중심
- 중앙은 단계 탭 + 리스트/테이블형 딜 파이프라인
- 데스크톱에서는 우측 상세 패널 사용
- 모바일에서는 단계 탭 + 카드형 딜 리스트 사용
- 오늘 일정, 후속 연락, 최근 회의록은 보조 영역
- 상세 페이지 또는 우측 상세 패널은 화면 성격에 따라 사용
- 회사/거래처/제품/딜 빠른 등록은 모달 사용
- 상세 등록/수정은 별도 상세 페이지 사용
- 상단 통합검색 + 화면별 검색/필터를 함께 사용
- 딜 상세는 핵심 요약을 먼저 보여주고 활동 로그/일정/회의록/Memo 기록을 섹션화
- 다음 행동은 딜 목록, 딜 상세, 홈 파이프라인에서 바로 보여준다

## 6. 화면 구현 우선순위

이 프로젝트는 화면 수가 많기 때문에, 라우트 개수 순서대로 구현하지 않는다.

UX/UI 기준 우선순위는 아래와 같다.

1. 공용 토큰
2. 공용 Shell
3. 공용 상태 UI
4. 공용 데이터 표시 컴포넌트
5. 딜 기준 화면
6. 로그인/랜딩
7. 회사
8. 거래처
9. 제품
10. 일정
11. 부가 기능군

이 순서를 쓰는 이유:

- 로그인 후 첫 핵심 흐름은 딜 파이프라인 확인이다.
- 회사/거래처/제품은 딜과 강하게 연결되므로 딜 화면의 문법을 먼저 고정해야 한다.
- 상태 UI, modal, card, filter, detail panel 규칙이 먼저 정리되지 않으면 도메인별 화면이 쉽게 갈라진다.

### 공용 기반에서 먼저 정리할 것

- Desktop Sidebar
- Desktop TopBar
- Mobile Header
- Bottom Tab Bar
- Modal Shell
- Toast
- Loading / Empty / Error 상태 UI
- BaseCard
- SectionHeader
- PrimaryButton
- FilterChip
- Badge 계열

### 딜 화면에서 먼저 마감할 것

- Desktop Deal Pipeline Home
- Mobile Deal Pipeline Home
- Desktop Detail Panel
- Mobile Deal Detail
- Deal Quick Create Modal

### 그 다음 도메인 확장 순서

- 회사
- 거래처
- 제품
- 일정
- 회의록 / 명함 / Import / Export / 휴지통 / 알림 / 검색

원칙:

- 새 도메인 화면은 공용 shell, 공용 상태 UI, 공용 card/button/filter 문법을 재사용해야 한다.
- desktop/mobile은 레이아웃을 분리하되, 데이터 로직과 작은 UI는 공유할 수 있다.

Admin Web:

- 데스크톱 전용
- 좌측 사이드바
- 데이터 테이블 중심
- 민감 데이터는 기본 마스킹
- User Web보다 더 높은 정보 밀도
- 필터/서버 페이지네이션/행 상세 패널 중심
- 민감정보 원문 보기와 위험 액션은 사유 입력과 감사 로그 필수

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `UX Design/PEN_UI_06_SHARED_FIRST_WORK_ORDER.md`

