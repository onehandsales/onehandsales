# UX/UI Reference Style Decision

Date: 2026-09-12

## 1. 결정

OneHand CRM의 UX/UI reference는 아래 조합을 기준으로 한다.

```text
Notion식 작업 공간 UX + Attio식 CRM record UX
```

단, reference 제품의 브랜드, 문구, 시각 자산, 화면 구조를 그대로 복제하지 않는다.

## 2. 가져올 것

### Notion에서 참고할 것

- 조용한 workspace 구조
- sidebar/page/list/detail의 낮은 시각 소음
- database-like list/table 경험
- hover/inline action의 절제된 사용
- 흰색/회색 기반의 업무 도구 톤

### Attio에서 참고할 것

- CRM record의 속성 중심 상세
- linked record를 중요한 업무 맥락으로 보여주는 방식
- record 목록에서 상태와 관계를 빠르게 읽는 구조
- 빠른 생성과 상세 확인이 끊기지 않는 흐름

## 3. 가져오지 않을 것

- Notion의 자유 block editor를 제품 핵심으로 삼는 것
- Attio의 custom object builder를 첫 사용 경험으로 노출하는 것
- 모든 화면을 card-heavy dashboard로 만드는 것
- Deal pipeline을 전역 기본 구조로 고정하는 것
- 브랜드, copy, icon, pixel-level layout 복제

## 4. 시각 톤

- 화이트/그레이 중심의 조용한 작업도구 톤
- 주요 CTA와 상태 색상만 제한적으로 강조
- 반복 사용에 적합한 밀도와 대비
- 모바일에서는 compact list/detail 중심

## 5. 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
