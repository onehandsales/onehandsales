# UX/UI Issue Log

이 문서는 `USER_WEB_UXUI_COMMON_QA_PLAN` 중 발견한 UX/UI 이슈와 처리 상태를 기록한다.

## 상태 값

- `Open`: 아직 처리하지 않음
- `In Progress`: 처리 중
- `Fixed`: 수정 완료
- `Deferred`: 후속 계획으로 분리
- `N/A`: 현재 범위 아님

## 심각도

- `S0 Blocker`: 앱 사용 불가, 로그인/핵심 화면 접근 불가
- `S1 Critical`: 핵심 데이터 손실, 보안/민감정보 노출, 결제/권한급 문제
- `S2 Major`: 핵심 업무 흐름 실패, 생성/수정/삭제/복구 실패, 주요 화면 사용 불가
- `S3 Minor`: 사용성 저하, 문구/레이아웃/상태 문제
- `S4 Polish`: 시각 polish, 세부 간격/정렬 개선

## 기록 템플릿

```markdown
## UX-001 제목

- 상태: Open
- 심각도: S3 Minor
- 화면:
- Viewport:
- 발견 goal:
- 처리 goal:
- 관련 파일:

### 문제

### 기대 결과

### 수정 제안

### 검증

### 완료 후 검토
```

## 발견 이슈

## 2026-07-18 UX Reference Update

- 반영일: 2026-07-18
- 반영 근거: `f7da689 docs: define Notion and Attio UX reference`
- 기준 문서: `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- 적용 범위: G02~G06 전체, G01 baseline 해석

### 적용 기준

- 모든 후속 goal은 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`를 기준으로 시작한다.
- 목록은 Notion database-like table/list로 조용하고 조밀하게 읽혀야 한다.
- row/card는 열 수 있는 sales record처럼 동작해야 한다.
- 상세는 Attio record처럼 property-first, linked record, activity/Memo 맥락을 보여야 한다.
- Company, Contact, Product, Deal, Schedule, MeetingNote는 custom object가 아니라 고정 sales record다.
- Notion/Attio brand, copy, visual asset, pixel-level layout은 복제하지 않는다.

### 기존 이슈 해석 변경

- UX-001은 단순 table overflow가 아니라 `딜`이라는 핵심 workflow record에서 next action, due date, linked company/contact/product 맥락이 충분히 보이지 않는 문제로 본다.
- UX-002는 단순 calendar width 문제가 아니라 일정 record가 주간/월간 맥락과 연결 딜 맥락을 잃는 문제로 본다.
- UX-003은 단순 tablet cramped layout이 아니라 database/list row가 열 수 있는 record처럼 읽히지 못하는 문제로 본다.
- UX-004는 해요체 위반과 함께 reference 제품 copy, 내부 provider/운영 문구 노출 여부를 함께 확인한다.
- UX-005는 홈/더보기의 polish 이슈지만, 홈이 실제 sales record entry point처럼 보이는지 함께 확인한다.

## G01 Baseline Audit Summary

- 점검일: 2026-07-18
- 점검 goal: `G01-UXUI-AUDIT-BASELINE`
- 점검 환경: `FE/user-web` Vite dev server `http://127.0.0.1:5175`, Google Chrome headless, Playwright route mock, 인증 세션 localStorage 주입
- 점검 viewport: 1440px, 1280px, 768px, 125% 확대 proxy 1152px
- 캡처 근거: G01 실행 중 로컬로 생성한 screenshot 48장. 이미지 파일은 repository에 보관하지 않는다.
- 자동 점검 결과: 실제 Backend API mock 기준 console error 0건, page error 0건, failed request 0건, document-level horizontal overflow 0건
- 제외: 390px/360px 모바일 브라우저 전용 QA

### 화면별 요약

| 화면 | 상태 | 근거 | 후속 |
|---|---|---|---|
| `/app` | PASS | 1440/1280/768/125%에서 핵심 카드, 오늘 할 일, 딜 현황, 빠른 실행이 깨지지 않음 | UX-005 |
| `/app/deals` | FAIL | 1440에서도 마감일 대신 등록일이 보이고, 1280/768/125%에서 오른쪽 핵심 컬럼이 잘림 | UX-001 |
| AppShell/Sidebar/TopBar | NEEDS CHECK | 768px에서 desktop sidebar가 유지되어 본문 폭이 좁고 여러 목록이 과밀해짐 | UX-003 |
| `/app/companies` | NEEDS CHECK | 768px에서 테이블 헤더/셀 일부가 과하게 축약됨 | UX-003 |
| `/app/contacts` | NEEDS CHECK | 768px에서 이름, 회사, 부서, 이메일, 등록일이 대부분 축약됨 | UX-003 |
| `/app/products` | PASS | 768px에서도 핵심 비교 정보가 비교적 유지됨 | - |
| `/app/schedules` | FAIL | 768px에서 월간 캘린더가 월~목 중심으로만 보이고 금~일이 화면 밖으로 밀림 | UX-002 |
| `/app/meeting-notes` | NEEDS CHECK | 768px에서 테이블 컬럼 의미가 많이 축약됨 | UX-003 |
| `/app/business-cards` | NEEDS CHECK | 768px에서 상태 배지가 세로로 찢어져 상태 인지가 나빠짐 | UX-003 |
| `/app/import` | PASS | 768px 기본 목록은 깨지지 않음 | UX-004 |
| `/app/trash` | NEEDS CHECK | 768px에서 유형 배지가 세로로 찢어지고 제목/위치 비교성이 낮아짐 | UX-003 |
| `/app/settings` | PASS | 올바른 profile/device mock 기준 console error 0건, overflow 0건 | - |
| `/app/more` | PASS | P2 화면으로 기능 접근은 가능함 | UX-005 |

### 후속 goal 우선순위

아래는 이슈 심각도 기준의 처리 우선순위다. 실제 `/goal` 실행 순서는 `COMMON/GOAL-WORK-ORDER.md`를 따르며, 다음 실행은 G02가 기본이다.

1. G03: `/app/deals` 목록에서 마감일, 다음 행동, 금액, 단계가 1440/1280/768/125%에서 비교되도록 수정한다.
2. G05: `/app/schedules` 월간 캘린더의 768px 표시 방식을 수정한다.
3. G02/G04/G05: 768px tablet에서 desktop sidebar + table 조합이 과밀해지는 화면을 compact/tablet layout 또는 명확한 내부 스크롤로 정리한다.
4. G06: Import, 명함 스캔, 계정 popover, empty/error/validation 문구의 해요체/행동형 기준을 정리한다.
5. G02: 홈과 더보기 화면의 과한 빈 공간과 정보 밀도를 polish한다.

## UX-001 `/app/deals`에서 마감일 비교가 불가능하고 1280/768/125%에서 핵심 컬럼이 잘림

- 상태: Open
- 심각도: S2 Major
- 화면: `/app/deals`
- Viewport: 1440px, 1280px, 768px, 125% 확대 proxy 1152px
- 발견 goal: G01
- 처리 goal: G03
- 관련 파일: `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`

### 문제

데스크톱 딜 목록의 마지막 컬럼이 `마감일`이 아니라 `등록일`이다. 1440px에서도 딜의 예상 마감일을 직접 비교할 수 없다.

1280px, 768px, 125% 확대 proxy에서는 오른쪽 컬럼이 화면 밖으로 밀리거나 잘려 보인다. 특히 768px에서는 단계 탭 label이 세로로 줄바꿈되고, 목록에서 단계 이후 정보가 사실상 보이지 않는다.

### 기대 결과

딜 목록은 `딜명`, `회사/담당자`, `단계`, `금액`, `다음 행동`, `마감일` 또는 `D-day`를 한 화면에서 빠르게 비교할 수 있어야 한다.

폭이 부족한 경우에는 내부 가로 스크롤, compact column, tablet card layout, detail/peek panel 중 하나로 명확하게 대응해야 한다.

### 수정 제안

- desktop table의 `등록일` 컬럼을 `마감일` 또는 `D-day + 마감일` 중심으로 바꾼다.
- `overflow-x-hidden`으로 핵심 컬럼이 조용히 잘리는 구조를 없앤다.
- 1280px/125%에서는 다음 행동과 마감일이 함께 보이도록 column width를 재조정한다.
- 768px에서는 desktop table을 유지할지, mobile card/tablet compact list로 전환할지 결정한다.

### 검증

- G01 로컬 캡처 `1440-deals.png`: 마지막 컬럼이 `등록일`로 표시됨.
- G01 로컬 캡처 `1280-deals.png`: 오른쪽 핵심 컬럼이 잘림.
- G01 로컬 캡처 `768-deals.png`: 단계 tab label이 세로로 깨지고 테이블 정보가 오른쪽으로 밀림.
- G01 로컬 캡처 `125zoom-proxy-deals.png`: 다음 행동 이후 핵심 정보가 잘림.

### 완료 후 검토

G01은 baseline audit이므로 수정하지 않았다. G03에서 우선 수정해야 한다.

## UX-002 `/app/schedules` 768px에서 월간 캘린더 7일 맥락이 유지되지 않음

- 상태: Open
- 심각도: S2 Major
- 화면: `/app/schedules`
- Viewport: 768px
- 발견 goal: G01
- 처리 goal: G05
- 관련 파일: `FE/user-web/src/features/schedule/components/schedule-screen.tsx`

### 문제

768px에서 월간 캘린더가 월~목 중심으로만 보이고 금~일은 화면 오른쪽 밖으로 밀린다. 캘린더 컨테이너는 내부 가로 스크롤을 갖고 있지만, 현재 화면만 보면 사용자가 한 주 전체와 월간 맥락을 바로 읽기 어렵다.

### 기대 결과

tablet 768px에서도 월간 일정 화면의 7일 구조가 이해 가능해야 한다. 전체 월간 맥락을 유지하기 어렵다면 week/list 전환, compact month grid, 명확한 scroll affordance 중 하나가 필요하다.

### 수정 제안

- 768px에서 month grid의 최소 폭 `820px` 기준을 재검토한다.
- tablet에서는 주/목록 view를 기본으로 하거나, 7열을 유지하는 compact month grid를 제공한다.
- 내부 가로 스크롤을 유지한다면 사용자가 스크롤 가능하다는 affordance를 추가한다.

### 검증

- G01 로컬 캡처 `768-schedules.png`: 월~목만 보이고 금~일은 화면 밖으로 밀림.
- G01 로컬 캡처 `1280-schedules.png`: 7일 전체가 보임.

### 완료 후 검토

G01은 baseline audit이므로 수정하지 않았다. G05에서 우선 수정해야 한다.

## UX-003 768px tablet에서 desktop sidebar + table 조합이 과밀해져 목록 비교성이 낮아짐

- 상태: Open
- 심각도: S3 Minor
- 화면: AppShell, `/app/companies`, `/app/contacts`, `/app/meeting-notes`, `/app/business-cards`, `/app/trash`
- Viewport: 768px
- 발견 goal: G01
- 처리 goal: G02, G04, G05
- 관련 파일: `FE/user-web/src/components/layout/app-shell.tsx`, `FE/user-web/src/features/*/components/*list*`, `FE/user-web/src/features/trash/components/trash-screen.tsx`, `FE/user-web/src/features/business-card/components/business-card-scan-screen.tsx`

### 문제

768px에서 desktop sidebar가 유지되어 본문 폭이 약 540px 수준으로 줄어든다. 이 상태에서 여러 화면이 desktop table을 그대로 사용해 컬럼명이 축약되고, 일부 배지는 세로로 찢어진다.

확인한 사례:

- `/app/companies`: 회사명, 담당자 수, 등록일 등 일부 컬럼이 과하게 축약됨.
- `/app/contacts`: 이름, 회사, 부서, 이메일, 등록일이 대부분 잘림.
- `/app/meeting-notes`: 회의일, 제목, 회사, 담당자, 등록일이 축약되어 비교성이 낮음.
- `/app/business-cards`: `확인 필요` 상태가 세로로 줄바꿈됨.
- `/app/trash`: `주요 데이터` 유형이 세로로 줄바꿈됨.

### 기대 결과

768px tablet에서도 주요 목록은 핵심 비교 정보와 주요 action이 유지되어야 한다. desktop table을 유지한다면 가로 스크롤이 명확해야 하고, 그렇지 않다면 compact row/card layout으로 전환해야 한다.

### 수정 제안

- AppShell의 768px breakpoint에서 desktop sidebar 유지가 맞는지 재검토한다.
- tablet 폭에서는 목록별 핵심 컬럼만 남기는 compact table 또는 card list를 검토한다.
- 배지는 `whitespace-nowrap`, 최소 폭, compact label로 세로 찢어짐을 막는다.
- 내부 가로 스크롤이 필요한 table에는 scroll affordance를 둔다.

### 검증

- G01 로컬 캡처 `768-companies.png`, `768-contacts.png`, `768-meeting-notes.png`, `768-business-cards.png`, `768-trash.png`

### 완료 후 검토

G01은 baseline audit이므로 수정하지 않았다. AppShell 기준은 G02에서 먼저 보고, 도메인 목록은 G04/G05에서 화면별로 처리한다.

## UX-004 Import/명함/계정 popover 문구에 UX Writing Guide 위반 후보가 남아 있음

- 상태: Open
- 심각도: S3 Minor
- 화면: `/app/import`, `/app/business-cards`, AppShell account/profile popover
- Viewport: 공통
- 발견 goal: G01
- 처리 goal: G06
- 관련 파일: `FE/user-web/src/features/import-export/components/import-screen.tsx`, `FE/user-web/src/features/import-export/components/import-detail-screen.tsx`, `FE/user-web/src/features/business-card/components/business-card-scan-screen.tsx`, `FE/user-web/src/components/layout/app-shell.tsx`

### 문제

앱 내부 사용자 노출 문구에 `없습니다`, `못했습니다`, `있습니다`, `필수입니다`, `저장되었습니다`, `업로드해주세요` 같은 UX Writing Guide 위반 후보가 남아 있다.

확인한 예:

- `스캔하려는 명함을 업로드해주세요.`
- `업로드 내역을 불러오지 못했습니다.`
- `조건에 맞는 업로드 내역이 없습니다.`
- `등록된 회사 분야가 없습니다.`
- `담당자 이메일 형식이 올바르지 않습니다.`
- `확정할 데이터 row가 없습니다.`
- `저장되었습니다.`

### 기대 결과

사용자 노출 문구는 해요체와 행동형 기준을 따른다. Empty/error/validation은 문제를 짧게 말하고 다음 행동을 함께 알려야 한다.

### 수정 제안

- `업로드해주세요` -> `업로드해 주세요`
- `저장되었습니다.` -> `저장했어요.`
- `없습니다.` 계열 empty state -> 다음 행동 안내형 문구
- validation/error 문구는 `올바르지 않습니다`, `필수입니다` 대신 `입력해 주세요`, `형식으로 입력해 주세요`, `다시 시도해 주세요` 형태로 정리한다.

### 검증

- `rg`로 앱 내부 components/pages 사용자 노출 문자열을 검색했다.
- 주요 캡처에서는 populated state를 보았기 때문에 empty/error/validation 문구는 source 기준으로 기록했다.

### 완료 후 검토

G01은 baseline audit이므로 수정하지 않았다. G06에서 일괄 정리해야 한다.

## UX-005 `/app`와 `/app/more`의 desktop 정보 밀도 polish 후보

- 상태: Open
- 심각도: S4 Polish
- 화면: `/app`, `/app/more`
- Viewport: 1440px
- 발견 goal: G01
- 처리 goal: G02
- 관련 파일: `FE/user-web/src/pages/home/index.tsx`, `FE/user-web/src/pages/more/index.tsx`

### 문제

`/app`는 기능적으로 깨지지 않지만 1440px에서 일부 dashboard panel이 데이터량 대비 지나치게 길어져 빈 공간이 크다. `/app/more`도 desktop에서 mobile list에 가까운 구성이 넓게 펼쳐져 다소 성긴 화면으로 보인다.

### 기대 결과

업무 화면은 조용하되 반복 사용자가 빠르게 읽을 수 있는 밀도를 유지해야 한다.

### 수정 제안

- 홈 하단 패널의 최소 높이/row 구성을 재검토한다.
- More는 P2 화면이므로 기능 QA 후, 필요하면 desktop density만 polish한다.

### 검증

- G01 로컬 캡처 `1440-app-home.png`, `1440-more.png`

### 완료 후 검토

G01은 baseline audit이므로 수정하지 않았다. S4 polish로 G02에서 여유가 있을 때 처리한다.
