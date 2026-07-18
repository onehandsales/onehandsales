# G01 UX/UI Audit Baseline

상태: Done
우선순위: P0
담당 영역: UX/UI QA, FE/user-web

## 1. 목표

현재 `FE/user-web` 주요 화면을 1440px, 1280px, 768px, 125% 확대 기준으로 확인하고, UX/UI 이슈를 `COMMON/ISSUE-LOG.md`에 분류한다.

이 goal은 큰 화면 수정을 바로 하기보다, G02~G06에서 처리할 이슈를 정확히 찾는 baseline 작업이다.

## 2. 먼저 읽을 문서

- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/README.md`
- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/UXUI-QA-SCOPE.md`
- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/ISSUE-LOG.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 3. 점검 대상

P0:

- `/app`
- `/app/deals`
- AppShell, Sidebar, TopBar, MobileAppHeader, BottomTabBar

P1:

- `/app/companies`
- `/app/contacts`
- `/app/products`
- `/app/schedules`
- `/app/meeting-notes`
- `/app/business-cards`
- `/app/import`
- `/app/trash`

P2:

- `/app/settings`
- `/app/more`

## 4. 작업 내용

1. `FE/user-web` dev 또는 preview 환경을 실행한다.
2. 테스트 계정 또는 E2E mock 흐름으로 보호 화면에 접근한다.
3. 1440px, 1280px, 768px 기준으로 주요 화면을 확인한다.
4. 브라우저 125% 확대 기준으로 P0/P1 화면을 확인한다.
5. layout, 정보 구조, 상태, UX writing, 접근성 기본 문제를 기록한다.
6. 발견 이슈를 `COMMON/ISSUE-LOG.md`에 `UX-001` 형식으로 추가한다.
7. S0/S1/S2는 G02~G06에서 먼저 처리해야 할 항목으로 표시한다.

## 5. 산출물

- `COMMON/ISSUE-LOG.md` 업데이트
- 화면별 PASS/FAIL/NEEDS CHECK 요약
- G02~G06에 넘길 우선순위 목록

## 6. 제외 범위

- 큰 UX/UI 구현 수정
- Backend API 수정
- DB schema/migration 수정
- 390px/360px 모바일 전용 QA
- 결제/구독/Admin/Notification 기능 추가

## 7. 검증

문서만 수정했다면:

```bash
git diff --check
```

화면 보조 스크립트나 테스트를 수정했다면:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

## 8. 완료 기준

- P0/P1 화면의 UX/UI baseline 이슈가 기록된다.
- S0/S1/S2 후보가 구분된다.
- 후속 goal에서 처리할 화면별 작업이 명확해진다.

## 9. 완료 기록

- 완료일: 2026-07-18
- 산출물: `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/ISSUE-LOG.md`
- 캡처 근거: G01 실행 중 로컬로 생성한 screenshot 48장. 이미지 파일은 repository에 보관하지 않는다.
- 점검 viewport: 1440px, 1280px, 768px, 125% 확대 proxy 1152px
- S0/S1 후보: 없음
- S2 후보: UX-001, UX-002
- 후속 이슈 심각도 우선순위: G03 -> G05 -> G02/G04/G05 -> G06 -> G02 polish
- 후속 실행 순서: `COMMON/GOAL-WORK-ORDER.md` 기준 G02 -> G03 -> G04 -> G05 -> G06
- 검증: `git diff --check`

## 10. 완료 후 검토

- Goal 원문 재확인: 큰 UX/UI 구현 수정, Backend API 수정, DB schema/migration 수정, 390px/360px 모바일 전용 QA는 제외 범위로 유지했다.
- Diff 자체 검토: 문서와 TODO 상태 업데이트만 포함했다. `FE/user-web` 구현 코드는 수정하지 않았고, screenshot artifact는 repository에 보관하지 않는다.
- 화면 재확인: G01 로컬 캡처 `1440-app-home.png`, `1440-deals.png`, `1280-deals.png`, `768-app-home.png`, `768-deals.png`, `768-schedules.png`, `768-business-cards.png`, `768-trash.png`, `1440-more.png`를 시각 확인했다.
- Viewport 검토: 1440px, 1280px, 768px, 125% 확대 proxy 기준으로 P0/P1/P2 화면 48장을 생성했다.
- 자동 검토: 실제 Backend API mock 기준 console error 0건, page error 0건, failed request 0건, document-level horizontal overflow 0건을 확인했다.
- 남은 리스크: UX-001과 UX-002가 S2 후보로 남아 있으며 각각 G03, G05에서 먼저 처리해야 한다.
- 2026-07-18 UX reference 갱신: G01 완료 후 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`가 전역 기준으로 고정됐다. G01의 screenshot baseline은 유지하되, G02~G06은 `020_uxui_notion_attio_reference.md`를 추가 기준으로 적용한다.
- 2026-07-18 record table density 기준 갱신: 목록은 이미 record table 구조로 보고 row density와 linked record/업무 판단 정보 표현을 강화한다. 이 기준은 G03~G05에 적용하며, G01 baseline 전체 재실행은 필요하지 않다.
- 재실행 판정: G01 전체 재실행은 필요하지 않다. 다만 G02 또는 G03 시작 시 해당 화면만 `Notion + Attio Reference Gate`로 재확인한다.
