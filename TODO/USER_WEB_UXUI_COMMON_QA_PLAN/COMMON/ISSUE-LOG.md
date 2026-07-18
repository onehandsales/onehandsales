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

## G02 Home And App Shell UX Summary

- 완료일: 2026-07-18
- 처리 goal: `G02-HOME-AND-APP-SHELL-UX`
- 구현 파일: `FE/user-web/src/components/layout/app-shell.tsx`, `FE/user-web/src/components/navigation/bottom-tab-bar.tsx`, `FE/user-web/src/components/navigation/mobile-app-header.tsx`, `FE/user-web/src/pages/home/index.tsx`, `FE/user-web/src/pages/more/index.tsx`
- 화면 검증: `/tmp/onehandsales-g02-final/*.png` 로컬 screenshot. 이미지 파일은 repository에 보관하지 않는다.
- 자동 점검 결과: console error 0건, page error 0건, failed request 0건, document horizontal overflow 0건
- 검증 명령: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `git diff --check`
- E2E: `pnpm run test:e2e`는 실행했지만 로컬 Playwright chromium headless shell이 없어 테스트 시작 전 실패했다. 코드 assertion 실패는 없었다.

### 처리 요약

- 768px tablet에서 desktop sidebar가 본문을 좁히지 않도록 AppShell desktop breakpoint를 `lg`로 조정했다.
- MobileAppHeader와 BottomTabBar를 같은 `lg` 기준으로 맞추고, 하단 홈 tab 링크를 `/app`으로 수정했다.
- `/app` 홈의 빠른 실행, 섹션 action, 최근 활동 링크를 legacy path가 아니라 `/app/*` 보호 앱 path로 정리했다.
- 홈의 일정 row와 최근 활동 row가 실제 record entry point로 동작하도록 연결했다.
- 홈 하단 panel이 과하게 길어지는 grid row 구성을 제거하고, `/app/more` desktop 폭과 topbar title을 정리했다.

### Reference Gate

- Desktop에서는 Notion식 sidebar/page workspace를 유지한다.
- 768px에서는 table/sidebar 과밀을 피하기 위해 tablet/mobile shell로 전환한다.
- 홈의 일정, 딜, 회의록 preview는 Attio식 linked sales record entry point로 연결된다.
- Notification, 결제/구독, Admin 운영, generic Export는 노출하지 않았다.

## G03 Deal Pipeline UX Summary

- 완료일: 2026-07-18
- 처리 goal: `G03-DEAL-PIPELINE-UX`
- 구현 파일: `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`, `FE/user-web/src/features/deal/components/deal-detail-panel.tsx`
- 화면 검증: `/tmp/onehandsales-g03-final/*.png` 로컬 screenshot. 이미지 파일은 repository에 보관하지 않는다.
- 자동 점검 결과: console error 0건, page error 0건, failed request 0건, document horizontal overflow 0건
- 검증 명령: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `git diff --check`
- E2E: `pnpm run test:e2e`는 실행했지만 로컬 Playwright chromium headless shell이 없어 테스트 시작 전 실패했다. 코드 assertion 실패는 없었다.

### 처리 요약

- `/app/deals` desktop row를 56px 딜 전용 record table row로 낮췄다.
- 마지막 컬럼을 `등록일`에서 `마감`으로 바꾸고 D-day와 날짜를 보여주도록 정리했다.
- 다음 행동 아래에 현재 Deal list response의 `latestFollowingAction` 또는 `updatedAt` 기반 최근 활동을 표시했다.
- 금액과 마감이 1440px, 1280px, 125% proxy 1152px에서 읽히도록 컬럼 폭과 padding을 조정했다.
- 768px에서는 desktop table을 숨기고 mobile card list를 유지했다.
- mobile card에도 다음 행동, 최근 활동, D-day, 마감일, 금액을 함께 표시했다.
- `overflow-x-hidden`으로 핵심 컬럼이 조용히 잘리는 구조를 제거했다.
- 딜 상세의 768px breakpoint를 `lg` 기준으로 맞추고, mobile/tablet 상세에서 로그 패널이 과도한 고정 높이를 만들지 않게 조정했다.
- 완료 후 리뷰에서 date-only D-day timezone 오차를 발견해 `YYYY-MM-DD`를 local date로 계산하도록 수정했다.

### Reference Gate

- Desktop 목록은 Notion database-like table처럼 조용하고 조밀하게 읽힌다.
- 딜 row/card는 Attio식 deal record entry point처럼 열 수 있고, 회사/담당자 linked record 맥락을 보여준다.
- 딜 상세는 기존 구조에서 stage, amount, company/contact/product, next action, due date, activity log, Memo log를 property-first로 구분한다.
- Deal list response에는 `products`가 없으므로 목록에서 제품 linked record를 임의로 만들지 않았다. 필요한 경우 Deal list API response 확장으로 분리한다.
- 15개 page size는 Backend 상수, 응답 `pageSize`, 테스트/API 문서 계약과 함께 바꿔야 하므로 G03에서 FE 단독 변경하지 않았다.

## G04 Domain List Detail Create UX Summary

- 완료일: 2026-07-18
- 처리 goal: `G04-DOMAIN-LIST-DETAIL-CREATE-UX`
- 구현 파일: `FE/user-web/src/features/company/components/company-list-screen.tsx`, `FE/user-web/src/features/contact/components/contact-list-screen.tsx`, `FE/user-web/src/features/contact/components/contact-detail-screen.tsx`, `FE/user-web/src/features/product/components/product-list-screen.tsx`, `FE/user-web/src/features/product/components/product-detail-screen.tsx`, `FE/user-web/src/hooks/use-resizable-table-columns.ts`
- 문서 파일: `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/GOAL-SPECS/G04-DOMAIN-LIST-DETAIL-CREATE-UX.goal.md`, `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/API-SPEC/README.md`, `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/BE-TODO/API-TODO.md`, `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/FE-TODO/USER-WEB-TODO.md`
- 화면 검증: `/tmp/onehandsales-g04-final/*.png` 로컬 screenshot. 이미지 파일은 repository에 보관하지 않는다.
- 자동 점검 결과: 36개 route/viewport 조합에서 console error 0건, page error 0건, failed request 0건, document horizontal overflow 0건
- 검증 명령: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `git diff --check`
- E2E: `pnpm run test:e2e`는 실행했지만 로컬 Playwright chromium headless shell이 없어 테스트 시작 전 실패했다. 코드 assertion 실패는 없었다.

### 처리 요약

- 회사/담당자/제품 desktop list row를 56px 업무용 record table 밀도로 낮췄다.
- 회사/담당자/제품 768px은 desktop table이 아니라 card/list를 유지하도록 `lg` breakpoint 기준으로 맞췄다.
- 회사/담당자/제품 목록의 마지막 컬럼을 `등록일`에서 `활동`으로 정리하고, 현재 list response에서 가능한 `등록 YYYY. MM. DD.` 기록을 표시했다.
- 회사 목록은 담당자 수와 진행 딜, 제품 목록은 연결 딜 수를 유지해 linked record count가 보이게 했다.
- 담당자 목록은 현재 list response에 연결 딜 수가 없어 FE에서 임의로 만들지 않았다.
- 도메인 table column hook에 최소 폭 이하에서는 내부 가로 스크롤을 허용하는 옵션을 추가했다. 기본 동작은 유지해 다른 화면 영향은 막았다.
- 담당자/제품 상세 768px breakpoint를 mobile/tablet layout으로 맞추고 긴 담당자명/제품명/회사명/연락처 overflow를 보강했다.
- 회사/담당자/제품 생성 panel은 1440px, 1280px, 768px에서 목록 맥락 또는 overlay 맥락으로 확인했다.

### Reference Gate

- 회사/담당자/제품 목록은 기존 record table/list를 유지하면서 Notion database-like row density와 Attio식 linked record count를 강화했다.
- 상세는 property-first 기본 정보, 연결 딜/담당자, Memo 기록과 비밀 메모가 구분된다.
- Company/Contact/Product를 custom object builder처럼 노출하지 않았다.
- 실제 최신 활동, 다음 행동, 담당자 연결 딜 수는 현재 API 응답에 없으므로 FE에서 꾸며내지 않고 BE/API 후속으로 기록했다.
- 15개 page size는 Backend 상수, 응답 `pageSize`, 테스트/API 문서 계약과 함께 바꿔야 하므로 G04에서 FE 단독 변경하지 않았다.

## G05 Complex Flow UX Summary

- 완료일: 2026-07-18
- 처리 goal: `G05-COMPLEX-FLOW-UX`
- 구현 파일: `FE/user-web/src/features/schedule/components/schedule-screen.tsx`, `FE/user-web/src/features/meeting-note/components/meeting-note-list-screen.tsx`, `FE/user-web/src/features/business-card/components/business-card-scan-screen.tsx`, `FE/user-web/src/features/import-export/components/import-screen.tsx`, `FE/user-web/src/features/trash/components/trash-screen.tsx`
- 화면 검증: `/tmp/onehandsales-g05-final/*.png` 로컬 screenshot. 이미지 파일은 repository에 보관하지 않는다.
- 자동 점검 결과: 28개 route/viewport/detail 조합에서 console error 0건, page error 0건, failed request 0건, document horizontal overflow 0건
- 검증 명령: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `git diff --check`
- E2E: `pnpm run test:e2e`는 실행했지만 로컬 Playwright chromium headless shell이 없어 테스트 시작 전 실패했다. 코드 assertion 실패는 없었다.

### 처리 요약

- 일정 월간/주간 grid의 tablet 최소 폭과 pill 밀도를 낮춰 768px에서 7일 맥락과 연결 딜명이 보이게 했다.
- 회의록 desktop list row를 56px로 낮추고, 회사/담당자와 연결 딜을 등록일보다 우선하는 record table 구조로 정리했다.
- 회의록 768px은 table 대신 card/list를 유지하고, 회사/담당자/딜 linked record summary와 작성일을 함께 보이게 했다.
- 명함 스캔 desktop/mobile list는 상태와 저장 판단 action을 우선 표시하고, provider/model/token 같은 내부값은 상세에서 숨겼다.
- 명함 스캔 성공/실패/확인 필요 상태에는 이미지가 저장되지 않는다는 안내와 안전한 실패 문구를 보여주도록 정리했다.
- Import 목록 row를 56px로 낮추고, 768px preview table은 내부 가로 스크롤과 field-level validation 표시가 가능하게 했다.
- Trash desktop row를 56px로 낮추고, 768px은 민감 preview를 줄인 card/list로 전환했다.
- Trash 상세 modal은 복구 action을 유지하되, private memo 원문과 내부 enum 노출을 막고 원문은 복구 후 record에서 확인하도록 안내한다.

### Reference Gate

- 복잡 흐름 화면도 workspace/page/list/detail 문법을 유지한다.
- 일정, 회의록, 명함, Import, Trash는 custom builder나 운영 콘솔이 아니라 sales workflow를 보조하는 고정 업무 record처럼 보인다.
- linked record 맥락이 필요한 곳은 현재 API 응답의 회사/담당자/딜 summary를 사용했고, 없는 next action/recent activity summary는 FE에서 임의 생성하지 않았다.
- provider failure와 validation failure는 내부 provider/quota/API key 정보를 노출하지 않는다.
- 15개 page size, Schedule week report, ImportJob 영속화, transcript 저장, provider call log table, 7일 이후 restore는 G05 제외 범위대로 구현하지 않았다.

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
- 768px 과밀 문제는 G02 이후 둘로 나눠 본다. UX-003은 AppShell sidebar가 본문 폭을 줄이는 구조 문제, UX-006은 화면별 database/list row가 열 수 있는 record처럼 읽히는지 확인하는 문제다.
- UX-004는 해요체 위반과 함께 reference 제품 copy, 내부 provider/운영 문구 노출 여부를 함께 확인한다.
- UX-005는 홈/더보기의 polish 이슈지만, 홈이 실제 sales record entry point처럼 보이는지 함께 확인한다.

## 2026-07-18 Record Table Density Update

- 반영일: 2026-07-18
- 적용 범위: G03~G05 목록형 화면
- G01/G02 재실행 여부: 재실행하지 않는다. G01은 baseline audit이고 G02는 AppShell/home 작업이므로, 새 목록 밀도 기준은 G03부터 적용한다.

### 적용 기준

- 현재 회사/담당자/제품/딜/회의록 목록은 이미 record table 구조에 가깝다.
- 따라서 후속 작업은 "record table로 바꾸는 작업"이 아니라, 기존 record table을 조용하고 조밀한 Notion database + Attio식 CRM linked record 기준으로 다듬는 작업이다.
- 데스크톱은 15개 기본 page size가 장기 목표에 더 가깝지만, 현재 10개 page size는 Backend 도메인 서비스 상수와 API/DB 문서 계약에 연결되어 있다.
- page size를 바꾸려면 FE만 수정하지 말고 Backend 상수, 응답 `pageSize`, 관련 테스트/API 계약을 함께 확인한다.
- 현재 우선순위는 숫자 변경보다 row height 52~56px 수준의 업무용 밀도와 record 관계 표현 개선이다.
- 최근 활동은 현재 목록 API 응답에서 가능한 데이터로 먼저 표현한다. 부족한 summary가 필요하면 FE에서 임의로 만들지 않고 BE/API 후속으로 기록한다.
- 모바일은 10개 내외 card/list를 유지한다. 15~20개 desktop table 기본 노출은 하지 않는다.
- 20개 기본 표시는 현재 layout에서는 과하므로 후속 고밀도 보기 옵션으로만 검토한다.

### 도메인별 적용

- 딜 목록: 딜명, 회사/담당자, 단계, 금액, 다음 행동, 마감일, 현재 응답에서 가능한 최근 활동을 우선한다.
- 회사 목록: 회사명, 분야, 지역, 담당자, 진행 딜, 다음 행동 또는 현재 응답에서 가능한 최근 활동을 우선한다.
- 담당자 목록: 이름, 회사, 부서/직급, 연락처, 연결 딜, 현재 응답에서 가능한 최근 활동을 우선한다.
- 제품 목록: 제품명, 카테고리/타입, 연결 딜 수, 현재 응답에서 가능한 최근 활동 또는 사용 맥락을 우선한다.
- 회의록 목록: 제목/요약, 연결 회사/담당자/딜, 작성일, 다음 행동 맥락을 우선한다.

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
| `/app/deals` | FIXED | G03에서 등록일 컬럼을 마감/D-day로 교체하고 row height, 다음 행동, 최근 활동, 768px card 전환을 정리함 | UX-001 |
| AppShell/Sidebar/TopBar | FIXED | G02에서 768px tablet은 mobile/tablet shell로 전환하고 desktop sidebar 본문 압박을 제거함 | UX-003 |
| `/app/companies` | FIXED | G04에서 desktop row 56px, 활동 컬럼, 768px card/list 전환, 생성 panel overflow를 확인함 | UX-006 |
| `/app/contacts` | FIXED | G04에서 desktop row 56px, 활동 컬럼, 768px card/list 전환, 긴 이름/회사/연락처 overflow를 확인함 | UX-006 |
| `/app/products` | FIXED | G04에서 desktop row 56px, 연결 딜/활동 컬럼, 768px card/list 전환, 긴 제품명 overflow를 확인함 | UX-006 |
| `/app/schedules` | FIXED | G05에서 768px compact month/week grid로 7일 구조와 연결 딜 pill 표시를 확인함 | UX-002 |
| `/app/meeting-notes` | FIXED | G05에서 desktop 56px row, 회사/담당자/연결 딜 우선 table, 768px card/list 전환을 확인함 | UX-006 |
| `/app/business-cards` | FIXED | G05에서 desktop 56px row, 768px card/list, 상태/저장 action, provider 내부값 비노출을 확인함 | UX-006 |
| `/app/import` | PASS | G05에서 768px preview table 내부 스크롤과 field-level validation 표시를 재확인함 | UX-004 |
| `/app/trash` | FIXED | G05에서 desktop 56px row, 768px card/list, private memo preview masking, restore modal을 확인함 | UX-006 |
| `/app/settings` | PASS | 올바른 profile/device mock 기준 console error 0건, overflow 0건 | - |
| `/app/more` | PASS | P2 화면으로 기능 접근은 가능함 | UX-005 |

### 후속 goal 우선순위

아래는 이슈 심각도 기준의 처리 우선순위다. 실제 `/goal` 실행 순서는 `COMMON/GOAL-WORK-ORDER.md`를 따른다. G05 완료 이후 다음 실행은 G06이다.

1. G03: `/app/deals` 목록에서 마감일, 다음 행동, 금액, 단계가 1440/1280/768/125%에서 비교되도록 수정한다. 2026-07-18 G03에서 처리 완료했다.
2. G05: `/app/schedules` 월간 캘린더의 768px 표시 방식을 수정한다. 2026-07-18 G05에서 처리 완료했다.
3. G05: UX-006 중 남은 회의록/명함 스캔/Trash 목록 row/table이 compact/tablet layout 또는 명확한 내부 스크롤을 갖는지 정리한다. 회사/담당자/제품은 2026-07-18 G04에서, 회의록/명함 스캔/Trash는 2026-07-18 G05에서 처리 완료했다.
4. G06: Import, 명함 스캔, 계정 popover, empty/error/validation 문구의 해요체/행동형 기준을 정리한다.
5. G02 polish는 2026-07-18 G02에서 처리 완료했다.

## UX-001 `/app/deals`에서 마감일 비교가 불가능하고 1280/768/125%에서 핵심 컬럼이 잘림

- 상태: Fixed
- 심각도: S2 Major
- 화면: `/app/deals`
- Viewport: 1440px, 1280px, 768px, 125% 확대 proxy 1152px
- 발견 goal: G01
- 처리 goal: G03
- 관련 파일: `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`

### 문제

데스크톱 딜 목록의 마지막 컬럼이 `마감일`이 아니라 `등록일`이다. 1440px에서도 딜의 예상 마감일을 직접 비교할 수 없다.

1280px, 768px, 125% 확대 proxy에서는 오른쪽 컬럼이 화면 밖으로 밀리거나 잘려 보인다. 특히 768px에서는 단계 탭 label이 세로로 줄바꿈되고, 목록에서 단계 이후 정보가 사실상 보이지 않는다.

추가 해석: 문제는 "10개 page size" 하나가 아니라 `10개 + 큰 row + 약한 업무 맥락` 조합이다. 딜 목록은 이미 record table 구조이므로, G03은 새 table 전환보다 row density와 다음 행동/마감일/현재 응답에서 가능한 최근 활동/연결 record 가시성을 먼저 개선해야 한다.

### 기대 결과

딜 목록은 `딜명`, `회사/담당자`, `단계`, `금액`, `다음 행동`, `마감일` 또는 `D-day`, 현재 응답에서 가능한 `최근 활동`을 한 화면에서 빠르게 비교할 수 있어야 한다.

폭이 부족한 경우에는 내부 가로 스크롤, compact column, tablet card layout, detail/peek panel 중 하나로 명확하게 대응해야 한다.

데스크톱 row는 약 52~56px 수준의 업무용 밀도를 우선 검토한다. 15개 기본 page size는 목표 UX로 보되, Backend/API/test 계약을 같이 바꾸지 못하면 FE에서 숫자만 바꾸지 않는다.

### 수정 제안

- desktop table의 `등록일` 컬럼을 `마감일` 또는 `D-day + 마감일` 중심으로 바꾼다.
- 최근 활동 또는 다음 행동 상태가 현재 응답의 가능한 데이터 범위에서 보이도록 row 정보를 재배치한다.
- 최근 활동 summary가 현재 Deal list response에 부족하면 FE에서 임의로 만들지 않고 BE/API 후속으로 기록한다.
- `overflow-x-hidden`으로 핵심 컬럼이 조용히 잘리는 구조를 없앤다.
- 1280px/125%에서는 다음 행동과 마감일이 함께 보이도록 column width를 재조정한다.
- 768px에서는 desktop table을 유지할지, mobile card/tablet compact list로 전환할지 결정한다.
- 15개 page size가 필요하면 Deal API 변경 범위로 분리하거나 Backend 상수/응답/test/API 문서를 함께 갱신한다.

### 검증

- G01 로컬 캡처 `1440-deals.png`: 마지막 컬럼이 `등록일`로 표시됨.
- G01 로컬 캡처 `1280-deals.png`: 오른쪽 핵심 컬럼이 잘림.
- G01 로컬 캡처 `768-deals.png`: 단계 tab label이 세로로 깨지고 테이블 정보가 오른쪽으로 밀림.
- G01 로컬 캡처 `125zoom-proxy-deals.png`: 다음 행동 이후 핵심 정보가 잘림.
- G03 Playwright route mock + Google Chrome headless 기준 `/app/deals` 1440px, 1280px, 768px, 125% proxy 1152px에서 console error 0건, page error 0건, failed request 0건, document horizontal overflow 0건을 확인했다.
- G03 1440px, 1280px, 125% proxy 1152px에서 desktop row height 56px, `마감`, D-day, 날짜, 금액, 다음 행동, 최근 활동 표시를 확인했다.
- G03 768px에서 desktop table 미노출, mobile card list 노출, D-day/마감일/금액/다음 행동/최근 활동 표시를 확인했다.
- G03 `/app/deals/:dealId` 1440px/768px에서 회사/담당자/제품, Memo log, 다음 행동, 삭제 action 표시와 document horizontal overflow 0건을 확인했다.
- G03 완료 후 리뷰에서 `TZ=America/Los_Angeles` 기준 `2026-07-18` -> `2026-07-25`가 `D-7`로 계산되는지 확인했다.
- `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `git diff --check`를 통과했다.
- `pnpm run test:e2e`는 로컬 Playwright chromium headless shell 누락으로 테스트 시작 전 실패했다. 코드 assertion 실패는 발생하지 않았다.

### 완료 후 검토

G03에서 처리했다. Deal list response에는 `products`가 없으므로 목록에서 제품 linked record를 임의로 만들지 않았고, 필요한 경우 별도 Deal list API response 확장으로 분리한다. 15개 page size도 FE 단독 변경하지 않았고 Backend 상수, 응답 `pageSize`, 테스트/API 문서와 함께 변경해야 한다.

## UX-002 `/app/schedules` 768px에서 월간 캘린더 7일 맥락이 유지되지 않음

- 상태: Fixed
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
- G05 Playwright route mock + Google Chrome headless 기준 `/app/schedules` 1440px, 1280px, 768px, 125% proxy 1152px에서 console error 0건, page error 0건, failed request 0건, document horizontal overflow 0건을 확인했다.
- G05 `768-schedules.png`에서 월간 7열 구조와 연결 딜 pill이 한 화면에서 읽히는 것을 확인했다.
- `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `git diff --check`를 통과했다.

### 완료 후 검토

G05에서 처리했다. `/app/schedules/week`는 G05 제외 범위대로 새 구현하지 않고 기존 redirect 상태를 유지한다. 일정 생성/수정 form의 local date-time/timezone 구조는 기존 form을 유지했고, 별도 API 변경은 없다.

## UX-003 768px tablet에서 desktop sidebar가 본문 폭을 과하게 줄임

- 상태: Fixed
- 심각도: S3 Minor
- 화면: AppShell, Sidebar, MobileAppHeader, BottomTabBar
- Viewport: 768px
- 발견 goal: G01
- 처리 goal: G02
- 관련 파일: `FE/user-web/src/components/layout/app-shell.tsx`, `FE/user-web/src/components/navigation/mobile-app-header.tsx`, `FE/user-web/src/components/navigation/bottom-tab-bar.tsx`

### 문제

768px에서 desktop sidebar가 유지되어 본문 폭이 약 540px 수준으로 줄어든다. 이 상태에서 여러 화면이 desktop table을 그대로 사용해 컬럼명이 축약되고, 일부 배지는 세로로 찢어진다.

### 기대 결과

768px tablet에서는 desktop sidebar가 본문 폭을 과하게 줄이지 않아야 한다. tablet에서 desktop table을 유지할지 compact row/card로 전환할지는 화면별 goal에서 확인한다.

### 수정 제안

- AppShell의 desktop breakpoint를 `md`에서 `lg`로 올린다.
- MobileAppHeader와 BottomTabBar도 같은 `lg` 기준으로 맞춘다.

### 검증

- G02 Playwright route mock 기준 `/app` 768px에서 desktop sidebar 미노출, MobileAppHeader/BottomTabBar 노출, horizontal overflow 0건을 확인했다.
- `/app` 1440px, 1280px, 125% 확대 proxy 1152px에서는 desktop sidebar/page 구조를 유지하고 horizontal overflow 0건을 확인했다.

### 완료 후 검토

G02에서 AppShell 기준을 수정했다. 도메인별 목록 row/table 자체의 compact layout 검토는 UX-006으로 분리해 G04/G05에서 처리한다.

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
- G05에서 명함 스캔 upload/progress/failure/success 문구 일부와 Import empty/preview/validation 문구 일부를 해요체와 행동형으로 정리했다.
- G05 명함 스캔 상세에서 provider/model/token/cost/pending time 같은 내부 운영값이 사용자에게 노출되지 않는지 확인했다.

### 완료 후 검토

G05에서 복잡 흐름 화면의 provider 노출과 일부 핵심 문구는 처리했다. 앱 전체 empty/error/validation/success 문구 일괄 closeout은 G06에서 계속 처리한다.

## UX-005 `/app`와 `/app/more`의 desktop 정보 밀도 polish 후보

- 상태: Fixed
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

- G02 Playwright route mock 기준 `/app` 1440px에서 하단 panel 높이가 콘텐츠 기반으로 줄어든 것을 확인했다.
- G02 Playwright route mock 기준 `/app/more` 1440px에서 desktop 폭이 `760px` 기준으로 정돈되고 topbar title이 `더보기`로 표시되는 것을 확인했다.
- `/app`, `/app/more` 1440px/768px 모두 horizontal overflow 0건, console/page/request error 0건을 확인했다.

### 완료 후 검토

G02에서 처리했다. More는 여전히 P2 화면이므로 추가 시각 고도화가 필요하면 후속 polish로 분리한다.

## UX-006 도메인 목록의 768px compact row/table 세부 검토

- 상태: Fixed
- 심각도: S3 Minor
- 화면: `/app/companies`, `/app/contacts`, `/app/products`, `/app/meeting-notes`, `/app/business-cards`, `/app/trash`
- Viewport: 768px
- 발견 goal: G02
- 처리 goal: G04, G05
- 관련 파일: `FE/user-web/src/features/*/components/*list*`, `FE/user-web/src/features/trash/components/trash-screen.tsx`, `FE/user-web/src/features/business-card/components/business-card-scan-screen.tsx`

### 문제

G02에서 768px AppShell 본문 폭 문제는 해결했지만, 각 도메인 목록이 자체 table/card 문법으로 핵심 비교 정보와 상태 배지를 충분히 유지하는지는 화면별로 다시 확인해야 한다.

추가 해석: 회사/담당자/제품/회의록/Trash 목록은 이미 record table 또는 record list 구조다. 후속 작업은 새 구조 전환이 아니라, 기존 row/card를 더 조밀하게 만들고 등록일보다 연결 record, 진행 딜, 다음 행동, 현재 응답에서 가능한 최근 활동, 상태를 우선 보이게 하는 것이다.

### 기대 결과

도메인 목록 row/card는 Notion database row처럼 열 수 있는 record로 읽히고, status badge나 핵심 비교 정보가 세로로 찢어지지 않아야 한다.

데스크톱 row는 52~56px 수준의 업무용 밀도를 우선 검토한다. 모바일은 10개 내외 card/list를 유지하고, 15~20개 table을 억지로 노출하지 않는다.

### 수정 제안

- G04에서 회사/담당자/제품 목록 row/table을 확인했다.
- G05에서 회의록/명함 스캔/Trash 목록 row/table을 확인했다.
- 필요한 경우 화면별 compact row/card 또는 명확한 내부 scroll affordance로 처리한다.
- 15개 page size가 필요하면 FE 단독 변경이 아니라 Backend 상수, 응답 `pageSize`, API/DB 문서, 테스트 계약 영향을 함께 기록한다.
- 최근 활동 또는 다음 행동 summary가 현재 list response에 부족하면 BE/API 후속으로 기록한다.

### 검증

- G04 Playwright route mock + Google Chrome headless 기준 `/app/companies`, `/app/contacts`, `/app/products`, `/app/companies/new`, `/app/contacts/new`, `/app/products/new`, `/app/companies/:id`, `/app/contacts/:id`, `/app/products/:id`를 1440px, 1280px, 768px, 125% proxy 1152px에서 확인했다.
- G04 36개 route/viewport 조합에서 console error 0건, page error 0건, failed request 0건, document horizontal overflow 0건을 확인했다.
- G04 768px에서 회사/담당자/제품 목록은 desktop table 대신 card/list를 유지한다.
- G04 1440px, 1280px, 125% proxy 1152px에서 회사/담당자/제품 desktop row height 56px와 활동/연결 record count 표시를 확인했다.
- G05 Playwright route mock + Google Chrome headless 기준 `/app/meeting-notes`, `/app/business-cards`, `/app/trash`를 1440px, 1280px, 768px, 125% proxy 1152px에서 확인했다.
- G05 28개 route/viewport/detail 조합에서 console error 0건, page error 0건, failed request 0건, document horizontal overflow 0건을 확인했다.
- G05 768px에서 회의록/명함 스캔/Trash 목록은 desktop table 대신 card/list를 유지한다.
- G05 1440px, 1280px, 125% proxy 1152px에서 회의록/명함 스캔/Trash desktop row height 56px와 linked record/status/restore 맥락 표시를 확인했다.
- G05 명함 스캔 상세에서 provider/model 내부값이 노출되지 않는지, Trash private memo 상세에서 원문과 내부 enum이 노출되지 않는지 확인했다.
- `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `git diff --check`를 통과했다.
- `pnpm run test:e2e`는 로컬 Playwright chromium headless shell 누락으로 테스트 시작 전 실패했다. 코드 assertion 실패는 발생하지 않았다.

### 완료 후 검토

G04에서 회사/담당자/제품 목록/상세/생성 흐름을 처리했고, G05에서 회의록/명함 스캔/Trash 목록/상세 상태를 처리했다.

담당자 list response에는 연결 딜 수가 없고, 회사/담당자/제품/회의록 list response에는 실제 최신 활동/다음 행동 summary가 부족하다. FE에서 임의 값을 만들지 않고 `COMMON/API-SPEC/README.md`와 `BE-TODO/API-TODO.md` 후속으로 기록했다.
