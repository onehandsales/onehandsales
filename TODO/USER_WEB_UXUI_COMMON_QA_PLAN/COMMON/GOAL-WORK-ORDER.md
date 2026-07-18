# Goal Work Order

## 1. 목적

이 문서는 `USER_WEB_UXUI_COMMON_QA_PLAN`을 `/goal`로 실행할 때의 작업 순서를 고정한다.

모든 goal은 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`의 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`를 전역 기준으로 적용한다.

## 2. 실행 순서

### G01. UX/UI Baseline Audit

문서: `COMMON/GOAL-SPECS/G01-UXUI-AUDIT-BASELINE.goal.md`

먼저 현재 화면 상태를 확인하고 `COMMON/ISSUE-LOG.md`를 채운다.

이 goal에서는 큰 구현을 하지 않는다. 필요한 경우 명백한 문서/측정 보조 수정만 한다.

### G02. Home And App Shell UX

문서: `COMMON/GOAL-SPECS/G02-HOME-AND-APP-SHELL-UX.goal.md`

`/app`, `AppShell`, sidebar/topbar/mobile header/basic navigation, quick action, account/settings entry를 정리한다.

G01에서 발견한 홈/쉘 관련 S0/S1/S2를 우선 처리한다.

### G03. Deal Pipeline UX

문서: `COMMON/GOAL-SPECS/G03-DEAL-PIPELINE-UX.goal.md`

`/app/deals`를 제품의 핵심 화면으로 정리한다.

딜 단계, 딜 목록, 금액, 다음 행동, 마감일, 상세 패널, 필터/검색/정렬의 정보 구조를 우선한다.

### G04. Domain List/Detail/Create UX

문서: `COMMON/GOAL-SPECS/G04-DOMAIN-LIST-DETAIL-CREATE-UX.goal.md`

회사, 담당자, 제품의 목록/상세/생성/수정 UX를 정리한다.

딜 생성과 연결되는 기본 데이터 등록 흐름이 끊기지 않게 한다.

### G05. Complex Flow UX

문서: `COMMON/GOAL-SPECS/G05-COMPLEX-FLOW-UX.goal.md`

일정, 회의록, 명함 스캔, Import, Trash의 복잡한 상태 UX를 정리한다.

provider failure, validation, long text, table overflow, restore/delete 상태를 집중한다.

### G06. UX Writing, States, Accessibility Closeout

문서: `COMMON/GOAL-SPECS/G06-UX-WRITING-STATES-A11Y-CLOSEOUT.goal.md`

UX writing, loading/empty/error/success 상태, icon-only aria-label/tooltip, focus, dialog 동작, 최종 검증을 닫는다.

## 3. 순서 변경 규칙

- G01은 반드시 먼저 실행한다.
- G01은 2026-07-18에 완료됐고, 이후 `Notion + Attio` reference를 반영해 baseline 해석만 갱신했다. 화면 코드가 크게 바뀌지 않았다면 G01 전체를 다시 실행하지 않는다.
- G02와 G03은 G01 이후 우선 실행한다.
- 기본 실행 순서는 G02 -> G03이다. G01의 S2 이슈 심각도만 보면 G03이 더 급하지만, AppShell과 홈 기준이 후속 화면의 공통 문법에 영향을 주므로 계획 순서를 유지한다.
- G04/G05는 독립적으로 진행할 수 있지만, 공통 컴포넌트 변경이 겹치면 먼저 한쪽을 완료한다.
- G06은 마지막에 실행한다.

## 3A. Notion + Attio Reference Gate

각 goal을 시작하기 전과 끝낸 뒤 아래 질문을 확인한다.

- Notion식 workspace/sidebar/page/database/detail 문법이 살아 있는가?
- Attio식 CRM record 관계와 linked record 맥락이 분명한가?
- 회사/담당자/제품/딜/일정/회의록이 custom object builder가 아니라 고정 sales record처럼 보이는가?
- row/card를 열면 record page, detail panel, modal 중 현재 맥락에 맞는 깊이로 들어가는가?
- 상세는 property-first로 읽히고, activity/Memo/일정/회의록 맥락이 구분되는가?
- 딜과 다음 행동이 필요한 화면에서 1급 정보로 보이는가?
- reference 제품의 brand, copy, visual asset, pixel-level layout을 그대로 복제하지 않았는가?

## 4. 완료 후 필수 검토 게이트

각 goal은 구현 또는 점검을 끝낸 뒤 아래 검토를 통과해야 완료로 본다. 이 검토를 건너뛰고 다음 goal로 넘어가지 않는다.

- Goal 문서를 다시 읽고, 원래 목표와 제외 범위를 벗어난 수정이 없는지 확인한다.
- `Notion + Attio Reference Gate`를 다시 확인한다.
- `git diff` 기준으로 수정 파일을 자체 검토하고, 의도하지 않은 변경이 없는지 확인한다.
- 해당 goal의 대상 화면을 브라우저 또는 Playwright screenshot으로 다시 확인한다.
- 1440px, 1280px, 768px, 125% 확대 중 해당 goal에 필요한 viewport를 다시 확인한다.
- loading, empty, error, success, validation, delete/restore 등 해당 goal의 상태 UX가 깨지지 않는지 확인한다.
- 실행한 검증 명령과 실패/성공 결과를 기록한다.
- 발견/수정/보류 이슈를 `COMMON/ISSUE-LOG.md`에 반영한다.
- S0/S1/S2가 남아 있으면 다음 goal로 넘기지 말고 우선 수정하거나, 제품/기술적으로 보류 가능한 이유를 문서화한다.
- 완료 보고에는 `수정 요약`, `검증`, `완료 후 검토 결과`, `남은 리스크`를 포함한다.

## 5. 완료 판정

각 goal은 아래 조건을 모두 만족해야 `Done`으로 본다.

- goal 문서의 `완료 기준`을 만족한다.
- 위 `완료 후 필수 검토 게이트`가 수행됐다.
- `COMMON/ISSUE-LOG.md` 상태가 최신이다.
- 남은 S0/S1/S2가 없거나, 명시적으로 보류 판단됐다.
- 다음 goal에서 이어받아야 할 항목이 있으면 완료 보고와 `ISSUE-LOG.md`에 남겼다.
