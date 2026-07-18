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
- `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`
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

1. 현재 딜 목록은 이미 record table 구조로 본다. 새 table로 갈아엎기보다 기존 row/table/card를 Notion database + Attio deal record 기준으로 다듬는다.
2. 단계 탭과 stage count가 한눈에 보이는지 확인한다.
3. 딜 목록 row/card에서 딜명, 회사/담당자, 단계, 금액, 다음 행동, 마감일, 현재 응답에서 가능한 최근 활동이 비교 가능한지 확인한다.
4. 등록일이 업무 판단 정보를 밀어내면 마감일, 다음 행동, 현재 응답에서 가능한 최근 활동, 연결 record를 우선한다.
5. 다음 행동이 낮은 대비나 보조 텍스트로 묻히면 1급 정보로 올린다.
6. 회사/담당자/제품 연결 맥락이 Attio식 linked record처럼 분명한지 확인한다.
7. desktop row height가 약 52~56px 수준의 업무용 밀도에 가까운지 확인한다. 현재 약 66px 전후의 큰 row가 유지되면 줄일 수 있는 padding/typography를 우선 조정한다.
8. 최근 활동 summary가 현재 Deal list response에 부족하면 새 API를 만들지 않고 BE/API 후속으로 기록한다.
9. desktop page size 15개 기본은 목표 UX로 검토하되, Backend 상수와 응답 `pageSize`, API/DB 문서, 테스트 계약을 함께 바꾸지 못하면 G03에서 숫자만 변경하지 않는다.
10. 모바일은 10개 내외 card/list를 유지하고, 15~20개 desktop table을 억지로 노출하지 않는다.
11. 필터/검색/정렬이 목록 가까이에 있고 Notion database control처럼 예측 가능한지 확인한다.
12. row 선택, 상세 패널, 상세 진입이 열 수 있는 record 문법으로 자연스러운지 확인한다.
13. 상세 패널이 있다면 stage, amount, company/contact/product, next action, due date를 property-first로 보여주는지 확인한다.
14. 활동 로그, Memo 기록, 일정/회의록 맥락이 섞이지 않게 구분되어 있는지 확인한다.
15. 1440px, 1280px, 768px, 125% 확대에서 겹침/overflow를 수정한다.
16. 긴 딜명/회사명/담당자명/금액/다음 행동이 row layout을 깨지 않게 한다.
17. 삭제/복구/수정 success/error 상태를 안전하게 보이게 한다.

## 5. UX 기준

- desktop 기본은 pure Kanban이 아니라 stage-filtered list/table + detail panel 방향이다.
- 목록은 Notion database처럼 조용하고 조밀해야 한다.
- 딜은 Attio식 핵심 workflow record로 보이고, 연결 회사/담당자/제품이 즉시 읽혀야 한다.
- 데스크톱 딜 목록은 단순 조회 테이블이 아니라 영업자가 목록에서 바로 판단하고 행동할 수 있는 record table이어야 한다.
- `10개 + 큰 row + 약한 업무 맥락` 조합이 사이드 프로젝트처럼 보이는 주요 원인이므로, 숫자보다 row density와 다음 행동/마감일/현재 응답에서 가능한 최근 활동 가시성을 먼저 고친다.
- row/card는 열 수 있는 record처럼 동작해야 한다.
- 상세는 property-first로 읽히고, activity/Memo/일정/회의록 맥락을 구분해야 한다.
- 모바일 전용 QA는 후속이지만, 768px tablet에서는 최소 사용 가능해야 한다.
- 20개 기본 표시는 이번 범위에서 제외한다. 나중에 고밀도 보기 옵션으로만 검토한다.
- 가능성/확률 기능은 현재 API/FE 입력에 없으므로 새로 만들지 않는다.

## 6. 제외 범위

- Deal API 변경
- FE만의 page size 숫자 변경
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
- 데스크톱 딜 row가 조용하고 조밀한 업무용 record table로 보이며, 등록일보다 마감일/다음 행동/현재 응답에서 가능한 최근 활동/연결 record가 우선된다.
- 최근 활동 summary가 현재 API로 부족하면 FE에서 임의로 만들지 않고 BE/API 후속으로 기록된다.
- page size 15개가 필요하다고 판단되면 FE 단독 변경 없이 BE/API/test 문서 영향과 후속 처리 방안이 기록된다.
- 1440px, 1280px, 768px, 125% 확대에서 주요 정보가 겹치지 않는다.
- 관련 이슈가 `COMMON/ISSUE-LOG.md`에서 정리된다.
