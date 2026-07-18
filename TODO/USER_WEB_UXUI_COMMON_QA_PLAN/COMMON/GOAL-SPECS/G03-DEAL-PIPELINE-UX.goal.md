# G03 Deal Pipeline UX

상태: Ready
우선순위: P0
담당 영역: FE/user-web

## 1. 목표

`/app/deals`를 제품의 핵심 화면답게 정리한다.

딜명, 회사, 담당자, 금액, 단계, 다음 행동, 마감일이 빠르게 비교되어야 한다.

G03의 화면 기준은 `Notion database-like deal list + Attio deal record detail`이다.

## 2. 먼저 읽을 문서

- `COMMON/ISSUE-LOG.md`
- `COMMON/UXUI-QA-SCOPE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 3. 주요 파일 후보

- `FE/user-web/src/pages/deals/index.tsx`
- `FE/user-web/src/pages/deals/detail/*`
- `FE/user-web/src/pages/deals/new/*`
- `FE/user-web/src/features/deal/components/*`
- `FE/user-web/src/features/deal/hooks/*`
- `FE/user-web/src/features/deal/api/*`
- `FE/user-web/src/features/deal-redesign/*`

실제 파일명은 작업 전 확인한다.

## 4. 작업 내용

1. 단계 탭과 stage count가 한눈에 보이는지 확인한다.
2. 딜 목록 row/card에서 딜명, 회사, 담당자, 금액, 단계, 다음 행동, 마감일이 비교 가능한지 확인한다.
3. 다음 행동이 낮은 대비나 보조 텍스트로 묻히면 1급 정보로 올린다.
4. 회사/담당자/제품 연결 맥락이 Attio식 linked record처럼 분명한지 확인한다.
5. 필터/검색/정렬이 목록 가까이에 있고 Notion database control처럼 예측 가능한지 확인한다.
6. row 선택, 상세 패널, 상세 진입이 열 수 있는 record 문법으로 자연스러운지 확인한다.
7. 상세 패널이 있다면 stage, amount, company/contact/product, next action, due date를 property-first로 보여주는지 확인한다.
8. 활동 로그, Memo 기록, 일정/회의록 맥락이 섞이지 않게 구분되어 있는지 확인한다.
9. 1440px, 1280px, 768px, 125% 확대에서 겹침/overflow를 수정한다.
10. 긴 딜명/회사명/담당자명/금액이 row layout을 깨지 않게 한다.
11. 삭제/복구/수정 success/error 상태를 안전하게 보이게 한다.

## 5. UX 기준

- desktop 기본은 pure Kanban이 아니라 stage-filtered list/table + detail panel 방향이다.
- 목록은 Notion database처럼 조용하고 조밀해야 한다.
- 딜은 Attio식 핵심 workflow record로 보이고, 연결 회사/담당자/제품이 즉시 읽혀야 한다.
- row/card는 열 수 있는 record처럼 동작해야 한다.
- 상세는 property-first로 읽히고, activity/Memo/일정/회의록 맥락을 구분해야 한다.
- 모바일 전용 QA는 후속이지만, 768px tablet에서는 최소 사용 가능해야 한다.
- 가능성/확률 기능은 현재 API/FE 입력에 없으므로 새로 만들지 않는다.

## 6. 제외 범위

- Deal API 변경
- DealActivity table 구현
- likelihood/probability 기능 추가
- Notification/Reminder 기능 추가
- 주간 리포트 구현
- custom object/custom field builder 노출

## 7. 검증

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 8. 완료 기준

- `/app/deals`에서 진행 딜과 다음 행동이 빠르게 읽힌다.
- 딜 목록과 상세가 Notion database + Attio deal record 기준을 통과한다.
- 1440px, 1280px, 768px, 125% 확대에서 주요 정보가 겹치지 않는다.
- 관련 이슈가 `COMMON/ISSUE-LOG.md`에서 정리된다.
