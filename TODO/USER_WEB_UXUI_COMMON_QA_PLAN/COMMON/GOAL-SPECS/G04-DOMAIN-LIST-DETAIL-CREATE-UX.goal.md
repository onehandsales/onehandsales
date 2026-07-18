# G04 Domain List Detail Create UX

상태: Ready
우선순위: P1
담당 영역: FE/user-web

## 1. 목표

회사, 담당자, 제품의 목록/상세/생성/수정 UX를 정리한다.

이 goal은 딜 생성 전 기본 데이터 등록 흐름이 빠르고 안정적으로 보이게 하는 것이 목적이다.

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

- `FE/user-web/src/pages/companies/*`
- `FE/user-web/src/pages/contacts/*`
- `FE/user-web/src/pages/products/*`
- `FE/user-web/src/features/company/components/*`
- `FE/user-web/src/features/contact/components/*`
- `FE/user-web/src/features/product/components/*`
- `FE/user-web/src/components/ui/*`

## 4. 작업 내용

1. 회사/담당자/제품 목록은 이미 record table 구조로 보고, 새 구조로 갈아엎기보다 기존 row/table/card를 더 조밀한 업무용 목록으로 다듬는다.
2. 회사 목록은 회사명, 분야, 지역, 담당자, 진행 딜, 다음 행동 또는 현재 응답에서 가능한 최근 활동이 우선 보이는지 확인한다.
3. 담당자 목록은 이름, 회사, 부서/직급, 연락처, 연결 딜, 현재 응답에서 가능한 최근 활동이 우선 보이는지 확인한다.
4. 제품 목록은 제품명, 카테고리/타입, 연결 딜 수, 현재 응답에서 가능한 최근 활동 또는 사용 맥락이 우선 보이는지 확인한다.
5. 등록일이 핵심 업무 판단 정보를 밀어내면 연결 record와 현재 응답에서 가능한 최근 활동/다음 행동 맥락을 우선한다.
6. desktop row height가 약 52~56px 수준의 업무용 밀도에 가까운지 확인한다.
7. desktop page size 15개 기본은 목표 UX로 검토하되, Backend 상수와 응답 `pageSize`, API/DB 문서, 테스트 계약을 함께 바꾸지 못하면 FE에서 숫자만 변경하지 않는다.
8. 최근 활동 또는 다음 행동 summary가 현재 list response에 부족하면 새 API를 만들지 않고 BE/API 후속으로 기록한다.
9. 모바일은 10개 내외 card/list를 유지하고, 15~20개 desktop table을 억지로 노출하지 않는다.
10. 검색/필터/정렬/export/create action이 혼동되지 않게 정리한다.
11. 회사 생성 오른쪽 문서형 패널이 1440px, 1280px, 768px에서 깨지지 않게 한다.
12. 담당자/제품 생성 modal 또는 panel의 필수 입력이 과하게 무거워 보이지 않게 한다.
13. 목록 row가 열 수 있는 record처럼 보이고 상세 진입이 자연스러운지 확인한다.
14. 상세 화면에서 기본 정보, 연결 딜, 연결 담당자/제품, 메모/개인 메모가 구분되게 한다.
15. 상세가 property-first로 읽히고, 연결 record와 Memo 기록이 섞이지 않게 한다.
16. 긴 이름, 긴 이메일, 긴 전화번호, 긴 URL이 overflow되지 않게 한다.
17. 저장/수정/삭제/복구 상태를 명확하게 한다.
18. delete action은 `ConfirmDialog`를 사용하고, `window.confirm`을 쓰지 않는다.

## 5. UX 기준

- 생성 UX는 목록 맥락을 가능한 한 유지한다.
- 회사/담당자/제품은 custom object가 아니라 고정 sales record로 보여야 한다.
- 목록은 Notion database-like list/table 문법을 따른다.
- 단순 조회 목록이 아니라 연결 record, 진행 딜, 다음 행동, 현재 응답에서 가능한 최근 활동을 통해 바로 판단 가능한 CRM record table이어야 한다.
- 상세는 Attio record처럼 속성, 연결 딜, Memo 기록을 먼저 이해할 수 있어야 한다.
- 회사 생성 패널은 desktop에서 목록을 숨기지 않고, 필요한 경우 horizontal scroll을 허용한다.
- 삭제 버튼은 빨간 휴지통 icon action 기준을 따른다.
- 삭제 성공 문구는 정본 문구와 맞춘다.

## 6. 제외 범위

- Company/Contact/Product API 변경
- FE만의 page size 숫자 변경
- taxonomy 모델 변경
- inline creation의 새 기능 확장
- 다국가 전화번호 모델 구현

## 7. 검증

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 8. 완료 기준

- 회사/담당자/제품 목록/상세/생성/수정 흐름이 desktop/tablet에서 사용 가능하다.
- 목록/상세/생성 흐름이 Notion + Attio reference gate를 통과한다.
- 회사/담당자/제품 목록이 조용하고 조밀한 업무용 record table로 보이며, 연결 딜/담당자/현재 응답에서 가능한 최근 활동/다음 행동 맥락이 등록일보다 우선된다.
- 최근 활동 또는 다음 행동 summary가 현재 API로 부족하면 FE에서 임의로 만들지 않고 BE/API 후속으로 기록된다.
- page size 15개가 필요하다고 판단되면 FE 단독 변경 없이 BE/API/test 문서 영향과 후속 처리 방안이 기록된다.
- 긴 텍스트 overflow가 주요 화면에서 해결된다.
- 관련 이슈가 `COMMON/ISSUE-LOG.md`에서 정리된다.
