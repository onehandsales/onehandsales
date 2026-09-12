# UXUI_AGENT

## 1. 목적

`UXUI_AGENT`는 OneHand CRM의 사용자 경험과 화면 기준을 관리하는 문서 영역이다.

PM_AGENT가 제품 문제, MVP 범위, Kit 전략을 정하면 UXUI_AGENT는 사용자가 실제 화면에서 어떤 순서로 보고, 선택하고, 입력하고, 다시 찾는지를 설계한다. Software Agent가 구현 구조를 정하기 전, 사용자 흐름과 화면 기준을 먼저 명확히 만든다.

## 2. 역할

UXUI_AGENT는 아래 질문에 답한다.

- 사용자가 가입 후 어떤 순서로 첫 성공을 경험하는가?
- 업무 유형 선택과 Kit 미리보기는 어떻게 보여야 하는가?
- 준비된 Workspace는 어떤 정보부터 보여야 하는가?
- 첫 Record 생성은 어떤 입력 부담으로 끝나야 하는가?
- Record 목록, 상세, 연결, 검색은 어떤 패턴을 따라야 하는가?
- 내부 CRM Core 용어를 사용자 언어로 어떻게 바꿔 보여줄 것인가?
- 모바일과 데스크톱에서 같은 업무를 어떻게 다르게 풀 것인가?

## 3. 관리 범위

- 첫 사용 흐름
- Kit 선택과 Kit 미리보기 UX
- Workspace home UX
- Record 목록, 상세, 생성, 연결 UX
- 검색, 필터, 보기 전환 UX
- 사용자 노출 문구와 UX writing
- Notion + Attio reference 적용 방식
- User Web과 Admin Web의 화면 검수 기준
- 모바일/데스크톱 반응형 화면 기준

UXUI_AGENT는 API, DB schema, transaction, repository 구조를 확정하지 않는다. 그런 구현 기준은 SOFTWARE_AGENT가 소유한다.

## 4. 폴더 구조

```text
UXUI_AGENT/
  README.md
  UX_REVIEW_CHECKLIST.md
  PLANNING/
  DECISIONS/
```

과거 Deal/Product/Contact 전용 UI 리포트와 비활성 pipeline 결정은 현재 OneHand CRM 방향과 충돌하므로 정본에서 제거했다.

## 5. 우선 확인 문서

1. `PLANNING/FIRST_USE_FLOW.md`
2. `PLANNING/KIT_SELECTION_UX.md`
3. `PLANNING/WORKSPACE_HOME_UX.md`
4. `PLANNING/RECORD_LIST_DETAIL_UX.md`
5. `PLANNING/CRM_CORE_INTERACTION_MODEL.md`
6. `PLANNING/UX_UI_DIRECTION.md`
7. `PLANNING/UX_WRITING_GUIDE.md`
8. `DECISIONS/020_uxui_notion_attio_reference.md`
9. `UX_REVIEW_CHECKLIST.md`

## 6. UX 원칙

OneHand CRM의 핵심 문장은 다음이다.

> CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비된다.

UX/UI는 이 문장을 화면에서 증명해야 한다.

- 빈 builder처럼 보이면 안 된다.
- 모든 사용자에게 같은 영업 CRM처럼 보이면 안 된다.
- 처음부터 설정과 자유도를 많이 보여주면 안 된다.
- 사용자의 업무 언어로 Kit, Record, 관계, 다음 행동을 보여준다.
- 첫 10분 안에 첫 Record 생성과 기본 보기 확인까지 이어져야 한다.

## 7. 협업 원칙

- 제품 범위와 우선순위는 PM_AGENT 문서를 따른다.
- 화면 흐름과 정보 우선순위는 UXUI_AGENT가 정의한다.
- API/DB 가능성과 구현 제약은 SOFTWARE_AGENT와 맞춘다.
- 구현 상태와 다른 UX 문서는 현재 구현 가능 여부를 명확히 표시한다.
- 외부 reference는 패턴만 참고하고 브랜드, 문구, 시각 자산, pixel-level layout을 복제하지 않는다.

## 8. 관련 문서

- `README.md`
- `AGENT/README.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/FIRST_USE_EXPERIENCE.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
