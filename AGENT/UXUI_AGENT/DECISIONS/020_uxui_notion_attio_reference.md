# UX/UI Notion + Attio Reference Decision

Date: 2026-09-12

## 1. 결정

OneHand CRM의 선호 UX/UI 기준은 다음 조합으로 둔다.

```text
Notion식 작업 공간 UX + Attio식 CRM record UX
```

이 결정은 화면 설계, Frontend 구현, 사용자 노출 문구, UX/UI QA, 화면이 연결된 API/DB 계약에서 함께 참고한다.

## 2. Notion에서 가져올 것

Notion은 전체 작업 공간 문법의 1차 reference다.

- sidebar 중심 navigation
- page 중심 화면 구조
- database-like list/table view
- 조용한 typography와 절제된 색
- row를 열면 page 또는 detail panel로 깊게 보는 구조
- 목록 맥락을 유지하는 오른쪽 문서형 생성/상세 panel
- hover action, inline action, compact control 같은 낮은 시각 소음

## 3. Attio에서 가져올 것

Attio는 CRM record 구조의 1차 reference다.

- record의 주요 속성을 분명히 보여주는 구조
- linked record를 핵심 업무 맥락으로 보여주는 방식
- table/list/kanban view를 CRM workflow에 맞게 바꿔 보는 감각
- quick action과 inline creation으로 입력 흐름을 끊지 않는 방식
- record 상세에서 상태, 속성, 연결, 활동을 구분하는 정보 구조

## 4. OneHand CRM 적용 방식

OneHand CRM은 빈 CRM builder도, 고정형 영업 CRM도 아니다.

따라서 reference를 적용할 때 아래 기준을 지킨다.

- 첫 사용자는 CRM 구조를 만들지 않고 Kit을 선택한다.
- Object/Attribute/Relationship은 내부 개념으로 두고 사용자 화면은 업무 언어를 쓴다.
- 목록은 Notion database처럼 조용하고 조밀하게 보이되, Attio처럼 Record 속성과 관계가 분명해야 한다.
- 상세 화면은 Record의 상태, 연결된 Record, 다음 행동을 우선한다.
- 생성은 목록 맥락이 중요하면 오른쪽 문서형 패널을 우선한다.
- 모바일에서는 desktop table을 억지로 유지하지 않고 compact list/detail 흐름으로 전환한다.

## 5. 가져오지 않을 것

- Notion 브랜드, 로고, 고유 문구, 고유 아이콘, pixel-level 화면 복제
- Notion처럼 모든 것을 자유 block editor로 만드는 것
- Attio 브랜드, 문구, 화면 구조의 직접 복제
- Attio의 custom object builder를 첫 사용 경험에 노출하는 것
- 팀 CRM 설정, 이메일 동기화, 복잡한 협업 권한을 MVP 첫 화면에 끌어오는 것
- Deal pipeline을 전역 home으로 고정하는 것
- 직업별 필수 속성을 임의 필드 목록처럼 약화하는 것

## 6. 작업 전 확인 규칙

화면, Frontend, 사용자 노출 문구, 목록/상세/생성/검색/연결 Record에 영향이 있으면 아래를 확인한다.

1. `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
2. `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
3. `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
4. `AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md`
5. `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
6. `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
7. `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

Backend/API/DB 작업이 화면 계약이나 Record 관계에 영향을 주면 Backend API contract, transaction, DB schema 문서도 함께 확인한다.

## 7. 리뷰 질문

- 사용자가 CRM 구조를 직접 설계하게 만들지 않는가?
- Notion식 workspace/page/list/detail 문법이 살아 있는가?
- Attio식 Record 속성과 연결 관계가 분명한가?
- Kit의 업무 언어가 사용자 화면에 반영되어 있는가?
- 목록에서 Record를 찾고, 열고, 생성하는 흐름이 끊기지 않는가?
- reference 제품의 brand/copy/visual asset/layout을 그대로 복제하지 않았는가?

## 8. 관련 문서

- `AGENT/README.md`
- `AGENT/UXUI_AGENT/README.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
