# G04 Record Summary Contract

상태: Classified 후속 / 2026-08-06 A 결정 반영
목표: NBA-003 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 A 결정에 따라 defer로 고정하고, NBA-004 MeetingNote list latest/next summary는 기존 후속 seed로 분리 유지한다.

2026-08-07 최종 분류 기준은 `../FINAL-CLASSIFICATION.md`다. Record summary 계열은 PRE12에 할 것에 포함하지 않는다.

## 0. 2026-08-06 결정

- 06은 Completed 상태를 유지한다.
- Company/Contact/Product latest activity, latest memo, next action summary는 PRE12 API/DB/FE 계약화 대상이 아니다.
- generic summary endpoint와 record별 상세 timeline도 PRE12 구현 대상이 아니다.
- B/C로 논의된 전체 record summary와 record별 상세 timeline 확장은 B2B 또는 team CRM에서 더 강한 가치가 있는 후보로 본다.
- UX/UI 전체 polish는 지금 하지 않고, 로드맵 DONE 이후 별도 UX/UI 전면 유지보수 계획에서 다룬다.

## 1. 현재 사실

- 06은 Deal list `latestActivity`, `products`, Contact list `dealCount` subset을 완료했다.
- `NBA-003`의 Company/Contact/Product latest activity, latest memo, next action summary는 남아 있다.
- 07은 MeetingNote 상세 next action/follow-up draft를 완료했다.
- `NBA-004`의 MeetingNote list latest/next summary는 남아 있다.

## 2. 후속 재검토 때 다시 볼 기준

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
- PRE12에는 Company/Contact/Product latest summary 계약 초안을 만들지 않는다.
- PRE12에는 generic summary endpoint나 record별 상세 timeline을 설계하지 않는다.

## 4. 완료 기준

- 2026-08-06 A 결정이 `README.md`, `CANDIDATE-MATRIX.md`, `BE-TODO`, `FE-TODO`, 상위 입력 문서에 일관되게 반영된다.
- NBA-003 잔여 후보는 PRE12 구현 대상이 아닌 후속 B2B/team CRM strategy seed로 남긴다.
- NBA-004 MeetingNote list summary는 기존처럼 `후속 seed`로 남긴다.
- 06 완료 의미를 바꾸지 않는다.
