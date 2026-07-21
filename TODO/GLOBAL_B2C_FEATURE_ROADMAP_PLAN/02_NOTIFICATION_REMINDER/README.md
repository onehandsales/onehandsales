# 02 Notification Reminder

상태: Draft Slot
순서: 02
성격: 기능 구현 전 검토 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-21 추천 결정 반영

## 1. 목적

일정 시작 전, 딜 마감, 다음 행동, 회의록 후속 알림을 통해 사용자가 영업 follow-up을 놓치지 않게 한다.

## 2. 현재 상태

- FE notification feature와 화면 코드는 일부 남아 있다.
- `/app/notifications` route는 현재 `/app`으로 redirect된다.
- Backend notification module/API/DB는 없다.

## 3. 착수 전 해야 할 일

추천 결정:

- 1차는 in-app notification과 browser push를 함께 설계한다.
- email은 전체 실시간 알림이 아니라 중요 알림과 digest 중심으로 둔다.
- 기본 reminder는 일정 30분 전, 딜 마감 1일 전, 다음 행동 당일 오전으로 둔다.
- 설정은 복잡한 automation builder가 아니라 toggle 중심으로 단순하게 둔다.

1. 첫 판매 제품에 필요한 최소 알림 범위는 일정, 딜 마감, 다음 행동 reminder 중심으로 둔다.
2. in-app notification과 browser push를 1차로 두고, email은 중요 알림/digest로 제한한다.
3. 기본 lead time은 일정 30분 전, 딜 마감 1일 전, 다음 행동 당일 오전으로 둔다.
4. 설정, unread count, 읽음 처리, delivery worker 범위를 정한다.
5. 개인정보와 provider failure redaction 기준을 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-010
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md` G27
