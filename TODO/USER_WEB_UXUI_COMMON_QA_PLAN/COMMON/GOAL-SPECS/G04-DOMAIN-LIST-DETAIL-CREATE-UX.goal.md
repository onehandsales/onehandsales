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

1. 회사/담당자/제품 목록의 핵심 비교 정보가 보이는지 확인한다.
2. 검색/필터/정렬/export/create action이 혼동되지 않게 정리한다.
3. 회사 생성 오른쪽 문서형 패널이 1440px, 1280px, 768px에서 깨지지 않게 한다.
4. 담당자/제품 생성 modal 또는 panel의 필수 입력이 과하게 무거워 보이지 않게 한다.
5. 목록 row가 열 수 있는 record처럼 보이고 상세 진입이 자연스러운지 확인한다.
6. 상세 화면에서 기본 정보, 연결 딜, 연결 담당자/제품, 메모/개인 메모가 구분되게 한다.
7. 상세가 property-first로 읽히고, 연결 record와 Memo 기록이 섞이지 않게 한다.
8. 긴 이름, 긴 이메일, 긴 전화번호, 긴 URL이 overflow되지 않게 한다.
9. 저장/수정/삭제/복구 상태를 명확하게 한다.
10. delete action은 `ConfirmDialog`를 사용하고, `window.confirm`을 쓰지 않는다.

## 5. UX 기준

- 생성 UX는 목록 맥락을 가능한 한 유지한다.
- 회사/담당자/제품은 custom object가 아니라 고정 sales record로 보여야 한다.
- 목록은 Notion database-like list/table 문법을 따른다.
- 상세는 Attio record처럼 속성, 연결 딜, Memo 기록을 먼저 이해할 수 있어야 한다.
- 회사 생성 패널은 desktop에서 목록을 숨기지 않고, 필요한 경우 horizontal scroll을 허용한다.
- 삭제 버튼은 빨간 휴지통 icon action 기준을 따른다.
- 삭제 성공 문구는 정본 문구와 맞춘다.

## 6. 제외 범위

- Company/Contact/Product API 변경
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
- 긴 텍스트 overflow가 주요 화면에서 해결된다.
- 관련 이슈가 `COMMON/ISSUE-LOG.md`에서 정리된다.
