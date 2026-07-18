# UX/UI Notion Reference Decision

> 최신 적용 기준: `020_uxui_notion_attio_reference.md`에서 Notion 기준은 Attio식 CRM record 관계 UX와 결합되어 적용된다. 이 문서는 Notion식 작업공간 UX의 세부 기준으로 유지한다.

## 결정

`onehand.sales`의 User Web과 Admin Web UX/UI는 앞으로 Notion식 작업도구 UX를 1차 기준으로 삼는다.

이 결정은 Notion의 브랜드, 로고, 문구, 고유 화면을 복제한다는 뜻이 아니다. Notion이 가진 작업도구 UX 원칙을 `onehand.sales`의 개인 영업 업무에 맞게 적용한다는 뜻이다.

## Notion식 UX/UI로 해석할 원칙

Notion의 UX/UI는 다음 특징을 가진다.

- 좌측 사이드바가 정보 구조의 중심이다.
- 화면은 페이지 중심이며, 사용자는 현재 보고 있는 업무 단위를 하나의 page처럼 이해한다.
- 정보는 block, section, property처럼 작은 단위로 나뉘고 재배치 가능한 느낌을 준다.
- 데이터베이스는 table, list, board, calendar, gallery, timeline 같은 여러 view로 표현된다.
- 같은 record라도 목록에서는 압축해서 보고, 열면 상세 page 또는 peek 형태로 깊게 본다.
- row/card는 단순 데이터 행이 아니라 열 수 있는 record page처럼 동작한다.
- 속성(property)은 상세 상단에 정돈되어 있고, 본문은 memo, activity, note처럼 자유롭게 이어진다.
- 필터, 정렬, grouping, view 전환이 데이터 탐색의 핵심이다.
- 색과 장식은 절제하고, whitespace와 typography로 정보 위계를 만든다.
- hover, inline edit, small action, keyboard-friendly search처럼 조용한 상호작용을 선호한다.
- 빈 상태와 template은 사용자가 다음 구조를 만들도록 안내한다.

## onehand.sales 적용 방향

### 공통

- 전체 제품은 `workspace + sidebar + page + database/list view + record detail` 문법을 따른다.
- 주요 도메인인 회사, 담당자, 제품, 딜, 일정, 회의록은 각각 독립 page/database처럼 느껴져야 한다.
- 목록 화면은 Notion database view처럼 필터, 정렬, 검색, view 상태가 화면 상단에 붙는다.
- 상세 화면은 Notion page처럼 속성 영역과 본문 영역이 분리된다.
- 상세 본문은 Memo 기록, 활동 로그, 일정, 회의록 연결을 block/section 단위로 읽히게 한다.
- 목록 맥락을 유지해야 하는 생성/빠른 편집은 오른쪽 문서형 패널을 우선 검토한다.
- modal은 삭제 확인, 짧은 보조 입력, 작은 선택 흐름에만 제한적으로 쓰고, 깊은 편집은 page/detail 또는 문서형 패널로 보낸다.
- 카드와 테이블은 장식 카드가 아니라 database record 표현이어야 한다.
- 불필요한 marketing hero, 과한 dashboard card, 과한 gradient, 큰 일러스트는 사용하지 않는다.

### User Web

- 홈과 딜 화면은 Notion database + CRM record view처럼 구성한다.
- 딜 목록은 stage tab을 가진 database view로 보고, row/card 클릭 시 detail page 또는 detail panel로 들어간다.
- 회사/담당자/제품/딜/회의록 상세는 page처럼 구성한다.
- 회사 생성은 목록을 유지한 채 오른쪽 문서형 패널에서 처리한다. 패널은 데스크톱에서 화면 최상단~최하단에 고정되고 resize가 가능하며, 목록 컬럼은 숨기지 않는다.
- 연결된 record는 relation처럼 보이게 한다.
- Memo 기록과 활동 로그는 page body의 section/block처럼 다룬다.
- 모바일 브라우저에서도 같은 정보 구조를 유지하되, table은 card/list로 전환한다.

### Admin Web

- Admin은 Notion database보다 더 운영 콘솔에 가깝게, table/filter/detail panel을 중심으로 한다.
- 그래도 사이드바, page title, view controls, property/detail 구조는 Notion식 정돈감을 따른다.
- 민감정보 masking, reason dialog, audit trail은 Notion reference보다 우선한다.

## 피할 것

- Notion 로고, 브랜드, 고유 아이콘, 고유 문구 복제
- Notion 화면을 픽셀 단위로 복사
- 모든 것을 자유 편집 가능한 문서 편집기로 만드는 것
- 영업 업무에 필요한 고정 필드와 검증을 약화하는 것
- 딜 pipeline을 Notion board처럼만 고정하는 것
- 정보 밀도를 지나치게 낮춰 실제 영업 비교가 어려워지는 것

## 기존 reference 우선순위 변경

기존 Toss, Pipedrive, Attio, Linear, Airtable reference는 폐기하지 않는다. 다만 우선순위를 다음처럼 바꾼다.

1. Notion: 전체 UX/UI 기준
2. Pipedrive/Attio: 영업 record와 pipeline 도메인 참고
3. Linear: 빠른 탐색, command/search, peek/detail 참고
4. Airtable: Admin table/filter/detail 참고
5. Toss: 문구, 명확한 CTA, 낮은 시각 소음 참고

## Reference URLs

- Notion sidebar navigation: https://www.notion.com/help/navigate-with-the-sidebar
- Notion database intro: https://www.notion.com/help/intro-to-databases
- Notion database views: https://www.notion.com/help/guides/using-database-views
- Notion table view: https://www.notion.com/help/guides/table-view-databases
- Notion content blocks: https://www.notion.com/help/guides/types-of-content-blocks
- Notion style/customize: https://www.notion.com/help/customize-and-style-your-content

## 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `QA_CHECKLIST.md`
