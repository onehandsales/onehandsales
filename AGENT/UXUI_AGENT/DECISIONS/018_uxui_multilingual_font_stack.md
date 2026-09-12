# UX/UI Multilingual Font Stack Decision

Date: 2026-09-12

## 1. 결정

OneHand CRM의 User Web과 Admin Web은 다국어 업무 도구에 맞는 조용하고 읽기 쉬운 typography를 기준으로 한다.

Notion-like typography 방향을 참고하되, 특정 브랜드의 고유 폰트나 시각 자산을 복제하지 않는다.

## 2. 기준

- 한국어와 영어가 함께 보여도 행 높이와 자간이 어색하지 않아야 한다.
- 숫자, 날짜, 상태, 이름이 반복되는 목록에서 가독성이 좋아야 한다.
- 30~50대 사용자가 반복해서 읽기 편한 크기와 대비를 우선한다.
- 작은 화면에서 form label, validation, 버튼 텍스트가 겹치지 않아야 한다.

## 3. 권장 방향

- Latin UI: Inter 계열 또는 시스템 sans
- Korean UI: Pretendard 계열 또는 시스템 sans
- fallback은 운영체제별 system font를 따른다.
- letter spacing은 기본 0을 우선한다.
- viewport width에 따라 font size를 과하게 scale하지 않는다.

## 4. 검수 기준

- 한국어 문장이 버튼 안에서 잘리지 않는가?
- 긴 Kit 이름이나 관리 대상 이름이 layout을 깨지 않는가?
- table/list row에서 숫자와 상태가 읽기 쉬운가?
- validation message가 모바일에서 입력 영역을 가리지 않는가?

## 5. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
