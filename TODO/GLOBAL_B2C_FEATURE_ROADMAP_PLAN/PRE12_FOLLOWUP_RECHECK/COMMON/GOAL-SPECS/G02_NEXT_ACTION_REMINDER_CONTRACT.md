# G02 Next Action Reminder Contract

상태: Question
목표: 다음 행동 reminder를 12 전에 구현할지, post-12 seed로 남길지 결정할 수 있는 계약 초안을 만든다.

## 1. 현재 사실

- 02 Notification은 일정 시작 reminder와 딜 마감 reminder를 완료했다.
- 02 문서는 다음 행동 알림을 제외했고, 딜 1건 데이터 구조가 바뀔 수 있어 06에서 다시 설계한다고 기록했다.
- 06은 다음 행동 생성/완료 변경을 DealActivity로 기록한다.
- 현재 Notification source type은 `SCHEDULE`, `DEAL`이다.

## 2. 결정해야 할 질문

1. 다음 행동에 별도 due date/time을 둘 것인가, 아니면 기존 `DealFollowingActionLog`의 현재 구조 안에서만 알림을 만들 것인가?
2. 알림 source를 `DEAL`로 유지할 것인가, `NEXT_ACTION`으로 확장할 것인가?
3. 사용자 설정에 next action reminder toggle/time을 추가할 것인가?
4. 완료된 다음 행동, 삭제된 딜, soft-deleted source의 pending reminder를 어떻게 취소할 것인가?
5. 12 전 첫 판매 gate에 필요한 기능인가, 아니면 post-12 product follow-up인가?

## 3. 포함 가능 범위

계약이 confirmed로 올라간 뒤에만 아래를 검토한다.

- next action reminder 생성/갱신/취소 business rule
- Notification source type 확장 여부
- UserNotificationSetting 필드 확장 여부
- due processor 재사용 여부
- User Web 설정/목록 표시 방식

## 4. 제외 범위

- G02 자체에서 구현하지 않는다.
- 06 DealActivity 작업에 끼워 넣지 않는다.
- billing/paywall/plan별 reminder 제한은 12 전 결정하지 않는다.

## 5. 완료 기준

- 사용자 결정이 있으면 `COMMON/API-SPEC`에 계약 문서를 새로 만들고 상태를 `draft` 또는 `confirmed`로 기록한다.
- 사용자 결정이 없으면 `post-12-seed` 또는 `Question`으로 유지하고 구현 금지를 명시한다.

