# G02 Home And App Shell UX

상태: Ready
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
