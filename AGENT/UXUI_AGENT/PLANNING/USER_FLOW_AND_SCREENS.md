# User Flow / 화면 목록

---

## 1. 핵심 User Flow

### Flow 0. 로그인 후 딜 파이프라인 확인

1. 사용자가 로그인한다.
2. `/app` 홈에서 오늘 일정, 진행 딜, 마감 임박 딜, 최근 회의록, 빠른 실행, 최근 활동을 확인한다.
3. 사용자는 사이드바 또는 하단 탭에서 `/app/deals`로 이동해 딜 파이프라인을 확인한다.
4. 단계별 진행 중 딜을 훑어본다.
5. 금액, 다음 행동, 마감 임박 여부를 확인한다.
6. 필요한 딜 상세로 진입하거나 새 딜을 생성한다.
7. 데스크톱에서는 선택한 딜의 상세 정보를 우측 패널에서 확인한다.

### Flow 1. 기본 데이터 등록

1. 사용자가 로그인한다.
2. 회사 목록에서 오른쪽 문서형 생성 패널로 회사를 등록한다.
3. 빠른 등록 모달로 담당자를 등록한다.
4. 빠른 등록 모달로 제품을 등록한다.
5. 필요 시 상세 페이지에서 추가 정보를 보강한다.

### Flow 2. 딜 관리

1. 회사/담당자/제품 기반으로 딜을 생성한다.
2. 빠른 등록 모달에서 딜이름, 회사, 담당자, 제품, 금액, 단계, 다음 행동, 예상 마감일을 입력한다.
3. 회사/담당자/제품 검색 결과가 없으면 모달 안에서 최소 정보로 즉시 생성한다.
4. 새로 생성된 회사/담당자/제품은 딜에 자동 선택된다.
5. 필요 시 딜 상세 페이지에서 추가 정보를 보강한다.
6. 활동 로그를 추가한다.
7. 단계 변경 시 자동 활동 로그가 생성된다.
8. 딜 상세에서 관련 일정/회의록/제품을 확인한다.

### Flow 3. 일정 관리

1. 사용자가 일정을 등록한다.
2. 딜/회사/담당자와 연결한다.
4. 일정 기본 화면에서 이번 달 월간 캘린더를 확인한다.
5. 같은 일정 화면에서 월간/목록 중심으로 확인한다.
6. 주간 보고서 화면, PDF, Excel 출력은 후속 범위로 둔다.

### Flow 4. 구글 캘린더 가져오기

1. 사용자가 Google OAuth를 연결한다.
2. 구글 캘린더 이벤트를 가져온다.
3. 가져온 일정을 우리 서비스 일정으로 표시한다.
4. 필요 시 회사/담당자/딜에 연결한다.

### Flow 5. 회의록 작성

1. 사용자가 `/app/meeting-notes`에서 회의록 작성을 시작한다.
2. 사용자가 회의 일시, 회사, 담당자를 선택하고 필요 시 제품, 딜을 선택한다.
3. 사용자는 직접 작성, 텍스트 `AI로 정리`, `음성으로 작성` 중 하나를 선택한다.
4. 직접 작성 시 상세내용, 향후계획, 필요액션을 입력하고 바로 저장한다.
5. AI/STT 사용 시 결과가 상세내용, 향후계획, 필요액션 field에 채워진다.
6. 사용자가 결과를 확인/수정한 뒤 저장한다.
7. 저장 후 필요 시 회의록 상세에서 영업 딜과 연동한다.
8. 딜 연동 성공 후 딜 활동기록에 회의록 링크와 요약이 표시된다.

### Flow 6. Export

1. 사용자가 회사/담당자/제품/딜 목록 화면에서 `엑셀 다운로드`를 누른다.
2. 현재 목록의 검색어, 필터, 정렬 조건을 기준으로 xlsx 파일을 다운로드한다.

### Flow 7. 통합검색

1. 사용자가 상단 통합검색에 키워드를 입력한다.
2. 회사/담당자/제품/딜/일정/회의록 결과가 유형별로 표시된다.
3. 진행 중 딜과 최근 항목이 우선 표시된다.
4. 사용자가 결과를 선택한다.
5. 해당 상세 페이지 또는 상세 패널로 이동한다.

### Flow 8. 딜 상세에서 일정/회의록 연결

1. 사용자가 딜 상세를 연다.
2. 일정 또는 회의록 섹션을 확인한다.
3. 새 일정/회의록을 만들거나 기존 항목을 연결한다.
4. 딜에서 생성한 일정/회의록은 딜의 회사/담당자 정보를 기본 상속한다.
5. 연결된 일정/회의록은 딜 상세 관련 섹션과 활동 로그에 표시된다.

### Flow 9. 다음 행동 처리

1. 사용자가 딜 목록 또는 딜 상세에서 다음 행동을 확인한다.
2. 다음 행동이 임박/지연이면 상태 색상으로 표시된다.
3. 사용자가 완료, 미루기, 일정 추가, 활동 로그 추가 중 하나를 선택한다.
4. 처리 결과가 딜 활동 로그에 반영된다.

## 2. User Web 화면 목록

| 경로 | 화면 | MVP |
|---|---|---|
| `/{locale}/login` | 로그인 | 포함 |
| `/{locale}/signup` | 가입/로그인 진입 | 포함 |
| `/auth/callback` | Supabase OAuth callback | 포함 |
| `/{locale}` | 공개 랜딩/진입 화면 | 포함 |
| `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy` | 공개 정보 페이지 | 포함 |
| `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy` | legacy public/auth redirect | 선호 locale URL로 redirect |
| `/app` | 홈 대시보드 | 포함 |
| `/app/companies` | 회사 목록 | 포함 |
| `/app/companies/new` | 회사 생성 | 포함. 회사 목록을 유지하고 오른쪽 문서형 생성 패널을 초기 open 상태로 표시 |
| `/app/companies/new/full` | 회사 생성 확장 화면 | 포함. 패널에서 확대한 page-mode 생성 route |
| `/app/companies/:id` | 회사 상세 | 포함 |
| `/app/contacts` | 담당자 목록 | 포함 |
| `/app/contacts/new` | 담당자 생성 | 포함. 담당자 목록을 유지하고 생성 패널을 초기 open 상태로 표시 |
| `/app/contacts/new/full` | 담당자 생성 확장 화면 | 포함. 패널에서 확대한 page-mode 생성 route |
| `/app/contacts/:id` | 담당자 상세 | 포함 |
| `/app/products` | 제품 목록 | 포함 |
| `/app/products/new` | 제품 생성 | 포함 |
| `/app/products/new/full` | 제품 생성 확장 화면 | 포함. 패널에서 확대한 page-mode 생성 route |
| `/app/products/:id` | 제품 상세 | 포함 |
| `/app/deals` | 딜 목록 | 포함 |
| `/app/deals/new` | 딜 생성 | 포함 |
| `/app/deals/new/full` | 딜 생성 확장 화면 | 포함. 패널에서 확대한 page-mode 생성 route |
| `/app/deals/:id` | 딜 상세 | 포함 |
| `/app/schedules` | 일정 목록/캘린더 | 포함 |
| `/app/schedules/week` | 주간 일정 보고서 | 포함. `ScheduleWeekPage`와 `ScheduleWeekReportScreen`으로 활성 제공 |
| `/app/schedules/:scheduleId` | 일정 상세 | 포함 |
| `/app/meeting-notes` | 회의록 목록 | 포함 |
| `/app/meeting-notes/new` | 회의록 작성 | `/app/meeting-notes?create=1`로 redirect |
| `/app/meeting-notes/new/full` | 회의록 작성 확장 화면 | 포함. page-mode 작성 route |
| `/app/meeting-notes/:meetingNoteId` | 회의록 상세 | 포함 |
| `/app?account=settings` | 계정 설정 모달 | 포함. `/app/settings` 사용자-facing route는 제거됨 |
| `/app/more` | 더보기 | 포함 |
| `/app/trash` | 휴지통 | 포함 |
| `/search` | 통합검색 결과 | 전용 라우트 없음 |

## 3. Admin Web 화면 목록

| 경로 | 화면 | MVP |
|---|---|---|
| `/login` | Admin 로그인 | 포함 |
| `/` | 관리자 권한 확인 화면 | 포함 |
| `*` | `/` redirect | 포함 |

## 4. 현재 코드 라우트 상태

> 최종 업데이트: 2026-09-10

현재 User Web router 기준 실제 구현 경로:

- 공개/인증 canonical: `/{locale}`, `/{locale}/login`, `/{locale}/signup`, `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy`
- 현재 언어 선택 UI 노출 locale slug: `ko`, `en-us`, `en-ca`
- 추후 확장 후보 locale slug: `ja`, `en-gb`, `en-sg`, `en-au`
- legacy public/auth redirect: `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy`는 선호 locale URL로 이동한다.
- OAuth callback: `/auth/callback`은 locale prefix 없이 유지한다.
- 계정 설정 진입점: `/app?account=settings` query contract를 사용해 현재 업무 화면 위에서 계정 모달 `Settings`를 연다.

pen 디자인 반영 완료/정리 도메인:
- `/app` — Schedule/Deal/MeetingNote API 조합 대시보드 구현 완료
- `/app/deals` — pen 기준 테이블+우측패널 구조 완료
- Sidebar / TopBar — pen 기준 재구성 완료
- DealStage 6단계 FE/BE 계약 반영 완료
- `/app/companies`, `/app/contacts`, `/app/products` — 제품형 조밀 목록 UX로 정렬
- 회사/담당자/제품 생성 모달 — 입력 검색형 선택, 결과 없음 즉시 추가, 생성 후 자동 선택 기준 반영
- `/app/meeting-notes` — 회의록 목록/상세/생성 API, AI/STT draft UI, 저장 후 딜 추가 연동 연결 완료
- `/app/trash` — 회의록 목록형 밀도를 따른 휴지통 목록, row 클릭 상세 모달, 모달 내부 복구 액션 반영 완료
- `/app/schedules` — 주간 일정 보고서, Google Calendar 연결/status/calendar 선택/read-only sync foundation 구현 완료
- `/app/deals/:dealId` — `DealActivity` timeline 생성/수정/조회 foundation 구현 완료
- `/app/meeting-notes/:meetingNoteId` — AI next action draft와 follow-up draft 보조 액션 구현 완료
- `/app?account=settings` — 계정 모달 `Settings` 안에서 Google Calendar 설정, follow-up delivery 설정. `/app/settings` route는 제거됨
- `/app` — AI weekly sales report 섹션과 제품 분석 route/mobile event foundation 구현 완료
- 상단 통합검색 — Backend `GET /api/search`와 User Web GlobalSearch 연결 완료

현재 의도적으로 보류된 화면:
- MeetingNote AI/STT draft UI — 작성 화면의 기본 흐름은 직접 작성 저장이며, AI/STT는 선택 보조 액션으로 연결되어 있다.

현재 활성화된 확장 화면/진입점:

기능별 완료 범위와 제외 범위는 `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_01_11_FEATURE_CATALOG.md`를 우선한다. 이 문단은 UX/UI 화면 진입점만 요약한다.

- `/app/schedules/week` — 주간 일정 보고서 화면이며 일정 화면의 `주간 보고서` link에서 진입한다.

pen 디자인 반영 대기 도메인:
- `/app/products/:productId`
- `/app/schedules`, `/app/schedules/week`
- `/app/contacts/:contactId` (부분 반영)
- `/app/companies/:companyId` (부분 반영)

현재 Admin Web router 기준 실제 구현 경로:

- `/login`
- `/`

현재 Admin Web wildcard redirect:

- `*`는 `/`로 이동한다.

현재 화면 목록과 코드의 차이:

- 기획 목록의 `/meetings*`는 현재 코드에서 `/meeting-notes*`로 구현되어 있다.
- 기획 목록의 `/search` 전용 라우트는 현재 User Web router에 없다. 통합검색 흐름은 상단 UI에서 `GET /api/search`를 호출하고 결과 선택 시 상세 화면으로 이동하는 방식으로 구현되어 있다.
- 현재 `/`는 공개 진입면이고 `/app`이 홈 대시보드다. 딜 파이프라인은 `/app/deals`에서 운영한다.
- Admin Web은 현재 `GET /admin/api/me`로 관리자 권한만 확인한다.

라우트명을 변경하거나 신규 화면을 추가할 때는 이 문서와 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`를 함께 갱신한다.

## 5. 기본 레이아웃 방향

User Web:

- 좌측 사이드바
- 상단바
- 현재 `/`는 공개 진입면이며, 로그인 후 `/app`는 홈 대시보드이고 핵심 딜 작업 화면은 `/app/deals` 딜 파이프라인이다.
- 딜 화면 중앙은 단계 탭 + 리스트/테이블형 딜 파이프라인
- 데스크톱에서는 우측 상세 패널 사용
- 모바일에서는 단계 탭 + 카드형 딜 리스트 사용
- 오늘 일정, 후속 연락, 최근 회의록은 보조 영역
- 상세 페이지 또는 우측 상세 패널은 화면 성격에 따라 사용
- 회사/담당자/제품/딜 빠른 등록은 모달 사용
- 상세 등록/수정은 별도 상세 페이지 사용
- 회사/담당자/제품 목록의 분야/지역/부서/직급/카테고리/판매 상태 필터는 전체 옵션 API를 초회 조회한 select 필터로 제공한다.
- 회사/담당자/제품 필터 select에는 `+ 추가` 옵션을 두고, 선택 시 각 분류 관리 다이얼로그에서 옵션을 추가/삭제할 수 있다.
- 딜 목록은 `딜이름 검색`, `전체`, `회사`, `담당자`, 정렬 select 순서를 사용한다.
- 상단 통합검색 + 화면별 검색/필터를 함께 사용
- 딜 상세는 핵심 요약을 먼저 보여주고 활동 로그/일정/회의록/Memo 기록을 섹션화
- 다음 행동은 딜 목록, 딜 상세, 홈 파이프라인에서 바로 보여준다
- 가능성(`긍정/중립/부정`, percent)은 현재 Deal API/FE 입력에 없으며 후속 범위로 본다.

## 6. 화면 구현 우선순위

이 프로젝트는 화면 수가 많기 때문에, 라우트 개수 순서대로 구현하지 않는다.

UX/UI 기준 우선순위는 아래와 같다.

이 섹션의 `Mobile`은 User Web의 브라우저 모바일 레이아웃을 뜻한다.

1. 공용 토큰
2. 공용 Shell
3. 공용 상태 UI
4. 공용 데이터 표시 컴포넌트
5. 딜 기준 화면
6. 로그인/랜딩
7. 회사
8. 담당자
9. 제품
10. 일정
11. 부가 기능군

이 순서를 쓰는 이유:

- 로그인 후 첫 핵심 흐름은 `/app` 홈 대시보드에서 오늘 업무를 확인하고 `/app/deals` 딜 파이프라인으로 이동하는 흐름이다.
- 회사/담당자/제품은 딜과 강하게 연결되므로 딜 화면의 문법을 먼저 고정해야 한다.
- 상태 UI, modal, card, filter, detail panel 규칙이 먼저 정리되지 않으면 도메인별 화면이 쉽게 갈라진다.

### 공용 기반에서 먼저 정리할 것

- Desktop Sidebar
- Desktop TopBar
- User Web Mobile Header
- User Web Browser-Mobile Bottom Tab Bar
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
- User Web Mobile Deal Pipeline Home
- Desktop Detail Panel
- User Web Mobile Deal Detail
- Deal Quick Create Modal

### 그 다음 도메인 확장 순서

- 회사
- 담당자
- 제품
- 일정

원칙:

- 새 도메인 화면은 공용 shell, 공용 상태 UI, 공용 card/button/filter 문법을 재사용해야 한다.
- User Web의 desktop/browser-mobile은 레이아웃을 분리하되, 데이터 로직과 작은 UI는 공유할 수 있다.

Admin Web:

- `/login`과 보호 route `/`만 현재 활성이다.
- Backend `GET /admin/api/me` 응답으로 관리자 권한을 확인한다.
- User Web의 도메인 화면과 데이터를 암시하지 않는다.

## 7. 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `UX Design/PEN_UI_06_SHARED_FIRST_WORK_ORDER.md`
