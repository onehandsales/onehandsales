# G02 Home And App Shell UX

상태: Done
우선순위: P0
담당 영역: FE/user-web

## 1. 목표

`/app` 홈과 앱 공통 shell이 개인 영업 실무 도구처럼 빠르게 읽히도록 정리한다.

## 2. 먼저 읽을 문서

- `COMMON/ISSUE-LOG.md`
- `COMMON/UXUI-QA-SCOPE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 3. 주요 파일 후보

- `FE/user-web/src/components/layout/app-shell.tsx`
- `FE/user-web/src/components/navigation/sidebar-nav.tsx`
- `FE/user-web/src/components/navigation/bottom-tab-bar.tsx`
- `FE/user-web/src/components/layout/top-bar.tsx`
- `FE/user-web/src/pages/home/index.tsx`
- `FE/user-web/src/features/search/components/*`
- `FE/user-web/src/features/auth/*`

실제 파일명은 작업 전 `rg --files FE/user-web/src`로 확인한다.

## 4. 작업 내용

1. `/app` 홈에서 오늘 일정, 진행 중 딜, 마감 임박 딜, 최근 회의록, 빠른 실행이 명확한지 확인한다.
2. 홈의 카드/섹션이 과하게 장식적으로 보이면 정보 우선순위를 재정리한다.
3. AppShell의 sidebar/topbar/mobile header가 page/database/detail 구조와 맞는지 확인한다.
4. 홈의 딜/일정/회의록 항목이 연결 record 맥락을 보여주고, 관련 상세로 자연스럽게 이동하는지 확인한다.
5. sidebar/topbar/global search/quick action이 Notion식 workspace navigation처럼 조용하고 예측 가능하게 동작하는지 확인한다.
6. icon-only 버튼에 tooltip 또는 `aria-label`이 있는지 확인한다.
7. 빠른 실행 link가 legacy public route로 빠지지 않고 보호 앱 흐름에 맞는지 확인한다.
8. 1440px, 1280px, 768px, 125% 확대에서 겹침/overflow를 수정한다.
9. G01에서 기록된 홈/쉘 관련 S0/S1/S2/S3를 처리한다.

## 5. UX 기준

- `/app`는 오늘 업무 dashboard다.
- `/app/deals`는 고밀도 딜 비교 화면이다.
- 홈은 장식 카드보다 오늘 해야 할 일과 다음 행동이 먼저 보여야 한다.
- 앱 내부는 마케팅 hero처럼 보이면 안 된다.
- AppShell은 Notion식 sidebar/page 구조를 따르되, Attio식 CRM record 탐색을 방해하지 않아야 한다.
- 홈의 record preview는 custom dashboard widget이 아니라 실제 sales record entry point처럼 보여야 한다.

## 6. 제외 범위

- 새 dashboard API 추가
- Notification 기능 노출
- 결제/구독 entry 추가
- Admin Web 변경

## 7. 검증

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

가능하면:

```bash
cd FE/user-web
pnpm run test:e2e
```

## 8. 완료 기준

- `/app` 홈이 오늘 일정/진행 딜/마감 임박/최근 회의록/빠른 실행 중심으로 읽힌다.
- AppShell navigation이 1440px, 1280px, 768px, 125% 확대에서 깨지지 않는다.
- Notion + Attio reference gate에서 shell/home 관련 항목이 통과된다.
- 관련 이슈가 `COMMON/ISSUE-LOG.md`에서 `Fixed` 또는 `Deferred`로 정리된다.

## 9. 완료 기록

- 완료일: 2026-07-18
- 구현 파일:
  - `FE/user-web/src/components/layout/app-shell.tsx`
  - `FE/user-web/src/components/navigation/bottom-tab-bar.tsx`
  - `FE/user-web/src/components/navigation/mobile-app-header.tsx`
  - `FE/user-web/src/pages/home/index.tsx`
  - `FE/user-web/src/pages/more/index.tsx`
- 문서 파일:
  - `COMMON/ISSUE-LOG.md`
  - `FE-TODO/USER-WEB-TODO.md`
- 로컬 화면 근거: `/tmp/onehandsales-g02-final/*.png`. Screenshot은 repository에 보관하지 않는다.

### 수정 요약

- AppShell desktop breakpoint를 `md`에서 `lg`로 올려 768px tablet에서 desktop sidebar가 본문을 좁히지 않게 했다.
- MobileAppHeader와 BottomTabBar도 같은 `lg` 기준으로 맞춰 768px에서 tablet/mobile shell이 유지되게 했다.
- BottomTabBar 홈 링크를 `/`에서 `/app`으로 수정했다.
- `/app` 홈의 빠른 실행, 섹션 action, 최근 활동 링크를 legacy path가 아니라 `/app/*` 보호 앱 path로 정리했다.
- 홈의 일정 row를 실제 일정 상세 record 링크로 바꿨다.
- 홈 하단 dashboard panel이 데이터량보다 과하게 길어지는 grid row 구성을 제거했다.
- `/app/more` desktop 화면 폭과 topbar title을 정리했다.

### 검증

- `cd FE/user-web && pnpm run typecheck`
- `cd FE/user-web && pnpm run lint`
- `cd FE/user-web && pnpm run build`
- `git diff --check`
- `cd FE/user-web && pnpm run test:e2e`는 실행했지만 로컬 Playwright chromium headless shell이 없어 테스트 시작 전 실패했다. 실패 사유: `Executable doesn't exist at .../chromium_headless_shell-1223/...`; 코드 assertion 실패는 발생하지 않았다.
- Playwright route mock + Google Chrome headless:
  - `/app`: 1440px, 1280px, 768px, 125% 확대 proxy 1152px
  - `/app/more`: 1440px, 768px
  - console error 0건, page error 0건, failed request 0건
  - document horizontal overflow 0건
  - 768px `/app`에서 desktop sidebar 미노출, MobileAppHeader/BottomTabBar 노출 확인
  - `/app`와 `/app/more`에서 legacy `/`, `/deals`, `/schedules`, `/meeting-notes` 링크가 남지 않음

### 완료 후 검토

- 제외 범위 유지: 새 dashboard API, Notification, 결제/구독 entry, Admin Web 변경은 하지 않았다.
- Notion + Attio Reference Gate: sidebar/page workspace 문법은 desktop에서 유지하고, 768px에서는 table/sidebar 과밀을 피하는 tablet shell로 전환했다. 홈의 일정/딜/회의록 항목은 실제 sales record entry point로 연결된다.
- 남은 리스크: `/app/deals`의 딜 목록 S2 이슈 UX-001은 G03에서 처리한다. 일정 월간 캘린더 UX-002는 G05에서 처리한다. 도메인별 목록 자체의 compact row/table 세부 검토는 UX-006으로 G04/G05에 넘긴다.
- 2026-07-18 record table density 기준 갱신: 목록은 이미 record table 구조로 보고 row density와 linked record/업무 판단 정보 표현을 강화한다. 이 기준은 G03~G05에 적용하며, G02 AppShell/home 작업을 다시 열 필요는 없다.
