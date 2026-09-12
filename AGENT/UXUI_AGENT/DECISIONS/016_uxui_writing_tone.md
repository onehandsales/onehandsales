# UX/UI Writing Tone Decision

Date: 2026-09-12

## 1. 결정

OneHand CRM의 사용자 노출 문구는 해요체를 기본으로 한다.

문구는 친근하되 가볍지 않고, 사용자가 지금 해야 할 행동을 짧게 알려야 한다.

## 2. 원칙

- `입니다/습니다/합니다` 체를 쓰지 않는다.
- 결과 문구는 능동형으로 쓴다.
- empty state는 다음 행동을 포함한다.
- error state는 문제와 해결 행동을 함께 말한다.
- 내부 CRM Core 용어를 사용자 화면에 그대로 노출하지 않는다.

## 3. 예시

| 피하기 | 권장 |
| --- | --- |
| 저장되었습니다. | 저장했어요. |
| 불러오는 중입니다. | 불러오고 있어요. |
| 데이터가 없습니다. | 첫 기록을 추가하면 여기에서 볼 수 있어요. |
| Object를 생성하세요. | 관리할 항목을 추가해 보세요. |
| Relationship을 설정하세요. | 관련 기록을 연결해 보세요. |

## 4. 버튼 기준

- 주요 행동은 짧게 쓴다.
- dialog 왼쪽 버튼은 `닫기`로 통일한다.
- `취소`는 오해 가능성이 있으면 피한다.

## 5. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/DECISIONS/024_uxui_internal_terms_user_language.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
