# UX/UI Notion + Attio Reference Decision

Date: 2026-07-18

## 1. 결정

`onehand.sales`의 선호 UX/UI 기준은 앞으로 다음 조합으로 고정한다.

```text
Notion식 작업공간 UX + Attio식 CRM record 관계 UX
```

이 결정은 화면, Frontend 구현, 사용자 노출 흐름, UX/UI QA, 화면이 연결된 API/DB 설계에서 항상 참고한다.

순수 Backend 내부 리팩터링처럼 사용자 화면과 직접 관련이 없는 작업도 이 결정과 충돌하는 데이터 구조나 API 표현을 만들지 않는지 빠르게 확인한다. 화면, 문구, 목록, 상세, 생성, 검색, 연결 record, 활동/메모/회의록 흐름에 조금이라도 영향이 있으면 이 문서를 반드시 먼저 읽는다.

## 2. Notion에서 가져올 것

Notion은 전체 작업공간 문법의 1차 기준이다.

- 좌측 sidebar 중심 navigation
- page 중심 화면 구조
- database-like table/list view
- 조용한 typography와 절제된 색
- row/card를 열면 record page 또는 peek/detail panel처럼 깊게 보는 구조
- 목록 맥락을 유지하는 오른쪽 문서형 생성/상세 panel
- 본문을 block/section 단위로 정리하는 정보 구조
- hover action, inline action, compact control 같은 낮은 시각 소음

## 3. Attio에서 가져올 것

Attio는 CRM record와 관계 구조의 1차 기준이다.

- 회사, 담당자, 제품, 딜, 일정, 회의록을 각각 열 수 있는 record처럼 다루는 방식
- record 간 관계를 화면에서 분명히 보여주는 linked record 구조
- 회사 ↔ 담당자 ↔ 딜 ↔ 일정/회의록 연결 흐름
- property-first 상세 화면
- activity timeline 또는 activity-like section
- notes/tasks처럼 record에 붙는 업무 맥락
- table/list/kanban view를 CRM workflow에 맞게 바꿔 보는 감각
- quick action과 inline creation으로 입력 흐름을 끊지 않는 방식

## 4. onehand.sales 적용 방식

이 제품은 사용자 정의 CRM builder가 아니라 개인 영업자를 위한 구조화된 업무 도구다.

따라서 Notion과 Attio의 패턴을 참고하되, 아래 기준을 유지한다.

- `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`는 고정된 영업 도메인 record다.
- 사용자가 custom object나 custom field를 자유롭게 만드는 제품으로 확장하지 않는다.
- 회사/담당자/제품/딜/일정/회의록의 DB/API validation, ownership, soft delete, transaction 기준을 약화하지 않는다.
- 목록은 Notion database처럼 조용하고 조밀하게 보이되, Attio처럼 record 관계와 업무 상태를 분명히 보여준다.
- 상세는 Notion page처럼 읽히되, Attio record page처럼 속성, 관계, 활동, 메모, 일정/회의록 맥락이 먼저 보인다.
- 딜은 핵심 workflow record다. 딜 목록과 상세에서 단계, 금액, 다음 행동, 마감일, 연결 회사/담당자/제품이 즉시 보여야 한다.
- Memo 기록은 Activity/Log와 구분하고, 민감 가능 입력으로 다룬다.
- 생성은 목록 맥락이 중요하면 오른쪽 문서형 패널을 우선한다. 짧은 보조 입력, 삭제 확인, 위험 액션 확인은 modal/dialog를 사용할 수 있다.
- 모바일에서는 desktop table을 억지로 유지하지 않고 stage tab + card/list로 전환한다.

## 4A. Record Table Density 기준

현재 onehand.sales의 회사, 담당자, 제품, 딜, 회의록 목록은 이미 record table 구조에 가깝다. 따라서 후속 작업은 "record table로 새로 바꾸는 작업"이 아니라, 기존 record table을 더 조용하고 조밀한 Notion database table과 Attio식 CRM linked record 기준으로 다듬는 작업이다.

목록 UX 판단 기준:

- 단순 조회 테이블이 아니라, 영업자가 목록에서 바로 판단하고 행동할 수 있는 record table이어야 한다.
- 등록일보다 다음 행동, 현재 응답에서 가능한 최근 활동, 연결 record, 상태, 마감일 같은 업무 판단 정보가 우선이다.
- 최근 활동은 현재 목록 API 응답에 있는 `updatedAt`, 최신/다음 행동, 연결 record 요약 등 가능한 데이터로 먼저 표현한다. 응답이 부족하면 FE에서 새 값을 꾸미지 말고 BE/API 후속으로 기록한다.
- desktop 목록은 현재 10개 고정 계약보다 15개 기본 표시가 장기적으로 더 적합하다.
- 다만 page size는 Backend 도메인 서비스 상수, 응답 `pageSize`, API/DB 문서, 테스트 계약과 연결되어 있으므로 FE에서 숫자만 바꾸지 않는다.
- 현재 작업 우선순위는 page size 숫자 변경보다 row density와 record 관계 표현 개선이다.
- desktop record row는 현재처럼 약 66px로 크게 보이면 사이드 프로젝트처럼 느껴질 수 있으므로, 52~56px 수준의 업무용 밀도를 우선 검토한다.
- 모바일은 desktop table을 억지로 15~20개 보여주지 않고 10개 내외 card/list를 유지한다.
- 20개 기본 표시는 현재 row 높이와 layout에서는 과하다. 나중에 고밀도 보기 옵션으로만 검토한다.

도메인별 목록에서 우선할 정보:

- 딜: 딜명, 회사/담당자, 단계, 금액, 다음 행동, 마감일, 현재 응답에서 가능한 최근 활동
- 회사: 회사명, 분야, 지역, 담당자, 진행 딜, 다음 행동 또는 현재 응답에서 가능한 최근 활동
- 담당자: 이름, 회사, 부서/직급, 연락처, 연결 딜, 현재 응답에서 가능한 최근 활동
- 제품: 제품명, 카테고리/타입, 연결 딜 수, 현재 응답에서 가능한 최근 활동 또는 사용 맥락
- 회의록: 제목/요약, 연결 회사/담당자/딜, 작성일, 다음 행동 맥락

## 5. 가져오지 않을 것

- Notion 브랜드, 로고, 고유 문구, 고유 아이콘, pixel-level 화면 복제
- Notion처럼 모든 것을 자유 block editor로 만드는 것
- Attio 브랜드, 문구, 화면 구조의 직접 복제
- Attio의 custom object builder, 팀 CRM 설정, 이메일 동기화, 협업 권한 복잡도를 현재 MVP에 끌어오는 것
- Backend에 없는 Notification, generic Export, Admin 운영, 결제/구독, Series A급 AI 기능을 reference에 있다는 이유만으로 화면에 노출하는 것
- 딜 desktop 기본 화면을 pure Kanban으로 고정하는 것
- 제품의 고정 도메인 필드를 자유 텍스트나 임의 속성으로 약화하는 것

## 6. 작업 전 확인 규칙

화면, Frontend, UX/UI, 사용자 노출 문구, route, list/detail, create/edit, search/filter, linked record, meeting note, schedule, deal 흐름이 포함된 작업은 시작 전에 아래 문서를 함께 본다.

1. `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
2. `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`
3. `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
4. `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
5. `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
6. `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
7. `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

Backend/API/DB 작업이 화면 계약이나 record 관계에 영향을 주면 위 문서와 함께 Backend API contract, transaction, DB schema 문서를 확인한다.

## 7. 리뷰 기준

UX/UI 또는 Frontend 리뷰 시 아래 질문을 반드시 포함한다.

- Notion식 workspace/page/database/detail 문법이 살아 있는가?
- Attio식 record 관계와 linked record 맥락이 분명한가?
- 이 화면이 사용자를 custom CRM builder로 밀어내지 않고, 고정된 개인 영업 workflow를 빠르게 처리하게 하는가?
- 딜과 다음 행동이 필요한 곳에서 1급 정보로 보이는가?
- 목록에서 record를 찾고, 열고, 연결하고, 생성하는 흐름이 끊기지 않는가?
- reference 제품의 brand/copy/visual asset/layout을 그대로 복제하지 않았는가?

## 8. 관련 문서

- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/UXUI_AGENT/README.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/DECISIONS/017_uxui_notion_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
