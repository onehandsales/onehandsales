# User Web UX/UI Common QA Plan

상태: Active
작성일: 2026-07-18
목적: 1순위 작업인 `UX/UI 공통 QA`를 바로 `/goal`로 실행할 수 있게 작업 단위로 쪼갠다.

## 1. 배경

`AGENT/PM_AGENT/DECISIONS/029_global_b2c_series_a_priority.md` 기준으로 현재 바로 다음 우선순위는 새 기능 추가가 아니라 출시 전 품질 라운드다.

이 계획은 그중 1번인 `UX/UI 공통 QA`만 다룬다.

2026-07-18 기준 UX/UI 방향성은 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`의 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`로 고정됐다. 따라서 이 계획의 모든 goal은 단순 반응형/문구 QA가 아니라, 앱 내부 화면이 Notion식 workspace/page/database/detail 문법과 Attio식 CRM record/linked record/activity 문법을 따르는지 함께 검토한다.

목록 UX는 새 record table 전환이 아니라 기존 record table/list를 더 조용하고 조밀하게 다듬는 방향이다. 데스크톱은 52~56px row와 15개 기본 표시를 장기 목표로 보되, page size 숫자는 Backend/API/test 계약과 함께 바꿀 때만 수정한다. 모바일은 10개 내외 card/list를 유지한다.

다음 작업은 이 계획의 범위가 아니다.

- 모바일 브라우저 390px/360px 전용 QA
- Chrome/Edge 브라우저 호환 QA
- 다중 계정 보안 QA
- DB/Prisma/migration 운영 정합성
- DataImport Job 영속화
- Notification
- Admin 운영 API
- 결제/구독

## 2. 목표

현재 구현된 `FE/user-web`이 유료 사용자가 매일 쓰는 개인 영업 실무 도구처럼 보이고 동작하도록 UX/UI 공통 품질을 정리한다.

핵심 질문:

- `/app` 홈에서 오늘 해야 할 일이 바로 읽히는가?
- `/app/deals`에서 딜, 금액, 단계, 다음 행동, 마감일이 빠르게 비교되는가?
- 회사, 담당자, 제품, 딜, 일정, 회의록이 열 수 있는 고정 sales record처럼 보이는가?
- 목록은 Notion database처럼 조용하고 조밀하며, 상세는 Attio record처럼 속성/관계/활동 맥락이 분명한가?
- 주요 목록/상세/생성 흐름이 1440px, 1280px, 768px, 125% 확대에서 깨지지 않는가?
- empty/loading/error/success/validation/delete/restore/provider failure 상태가 사용자에게 안전하게 보이는가?
- UX writing이 해요체와 행동형 기준을 따르는가?
- 카드 중첩, 과한 장식, 낮은 대비, 긴 텍스트 overflow가 없는가?
- Notion/Attio의 brand, copy, visual asset, pixel-level layout을 그대로 복제하지 않았는가?

## 3. 작업 대상

주요 대상은 `FE/user-web`이다.

우선순위 화면:

1. `/app`
2. `/app/deals`
3. `/app/companies`
4. `/app/contacts`
5. `/app/products`
6. `/app/schedules`
7. `/app/meeting-notes`
8. `/app/business-cards`
9. `/app/import`
10. `/app/trash`
11. `/app/settings`
12. `/app/more`

공개/인증 화면은 이번 계획에서 보조 범위다. 앱 내부 UX/UI 품질을 먼저 본다.

## 4. 제외 범위

- Backend 새 API 추가
- Prisma schema/migration 변경
- Admin Web 운영 화면 구현
- `/app/notifications` 노출
- `/app/export` generic export 재노출
- `/app/schedules/week` 구현
- 결제/구독 구현
- 네이티브 iOS/Android 앱
- 390px/360px 모바일 브라우저 전용 QA

단, UX/UI QA 중 Backend error code, response shape, data isolation, migration 문제가 발견되면 이 계획에서 바로 수정하지 않고 별도 Backend/DB 계획으로 분리한다.

## 5. Goal 작업 순서

| 순서 | Goal 문서 | 목적 |
|---|---|---|
| 1 | `COMMON/GOAL-SPECS/G01-UXUI-AUDIT-BASELINE.goal.md` | 현재 화면을 캡처/점검하고 이슈를 분류한다. |
| 2 | `COMMON/GOAL-SPECS/G02-HOME-AND-APP-SHELL-UX.goal.md` | `/app` 홈, AppShell, navigation, topbar, quick action을 정리한다. |
| 3 | `COMMON/GOAL-SPECS/G03-DEAL-PIPELINE-UX.goal.md` | `/app/deals` 파이프라인, 목록, 상세 패널, 다음 행동 가시성을 정리한다. |
| 4 | `COMMON/GOAL-SPECS/G04-DOMAIN-LIST-DETAIL-CREATE-UX.goal.md` | 회사/담당자/제품의 목록, 상세, 생성/수정 UX를 정리한다. |
| 5 | `COMMON/GOAL-SPECS/G05-COMPLEX-FLOW-UX.goal.md` | 일정, 회의록, 명함 스캔, Import, Trash의 복잡한 상태 UX를 정리한다. |
| 6 | `COMMON/GOAL-SPECS/G06-UX-WRITING-STATES-A11Y-CLOSEOUT.goal.md` | UX writing, 상태, 접근성 기본, 최종 검증을 닫는다. |

## 6. 완료 기준

이 계획은 아래 조건을 만족하면 완료로 본다.

- G01~G06이 모두 완료된다.
- 각 goal은 `COMMON/GOAL-WORK-ORDER.md`의 `완료 후 필수 검토 게이트`를 통과한다.
- 각 goal은 `Notion + Attio reference gate`를 통과한다.
- `COMMON/ISSUE-LOG.md`에 발견 이슈와 처리 상태가 남는다.
- S0/S1/S2 UX/UI 이슈가 수정되거나 명시적으로 보류 판단된다.
- `FE/user-web` 검증 명령이 통과한다.
- 주요 화면이 1440px, 1280px, 768px, 125% 확대 기준에서 사용 가능하다.
- 390px/360px 모바일 전용 이슈는 후속 `MOBILE_BROWSER_QA_PLAN` 후보로 분리된다.

## 7. 검증 명령

기본 검증:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

화면 검증:

- Playwright 또는 브라우저 수동 확인으로 1440px, 1280px, 768px, 125% 확대를 본다.
- 각 goal 종료 전 확인 결과를 `COMMON/ISSUE-LOG.md` 또는 goal 완료 보고에 남긴다.

## 8. 반드시 먼저 읽을 문서

- `AGENT/PM_AGENT/DECISIONS/029_global_b2c_series_a_priority.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/GOAL-WORK-ORDER.md`

## 9. 관련 문서

- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/README.md`
- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/UXUI-QA-SCOPE.md`
- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/ISSUE-LOG.md`
- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/BE-TODO/README.md`
