# G04 Record Summary Contract

상태: Question
목표: Company/Contact/Product latest summary와 MeetingNote list latest/next summary 후보를 구현 전 계약 수준으로 분리한다.

## 1. 현재 사실

- 06은 Deal list `latestActivity`, `products`, Contact list `dealCount` subset을 완료했다.
- `NBA-003`의 Company/Contact/Product latest activity, latest memo, next action summary는 남아 있다.
- 07은 MeetingNote 상세 next action/follow-up draft를 완료했다.
- `NBA-004`의 MeetingNote list latest/next summary는 남아 있다.

## 2. 계약 전에 결정할 기준

| 기준 | 질문 |
| --- | --- |
| summary 의미 | latest memo, latest activity, next action 중 무엇을 보여줄 것인가? |
| 민감정보 제외 | private memo, meeting note raw text, follow-up body, provider raw를 어떻게 제외할 것인가? |
| ownership | linked record가 삭제되었거나 접근 불가하면 어떻게 숨길 것인가? |
| 성능 | list page마다 runtime aggregation으로 충분한가, denormalized summary가 필요한가? |
| API 방식 | 기존 list response field 추가인가, 별도 summary endpoint인가? |
| FE 표시 | list item에서 어느 위치에 표시하고 empty fallback은 무엇인가? |

## 3. 제외 범위

- confirmed API 없이 response field를 추가하지 않는다.
- FE에서 API에 없는 summary를 조합해 사실처럼 표시하지 않는다.
- MeetingNote raw text나 private memo를 list summary에 노출하지 않는다.

## 4. 완료 기준

- 구현하기로 결정한 summary마다 API/DB/FE 계약 초안이 생긴다.
- 구현하지 않기로 결정한 후보는 `post-12-seed` 또는 `defer`로 남긴다.
- 06 완료 의미를 바꾸지 않는다.

