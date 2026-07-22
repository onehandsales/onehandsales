# G03 Reminder Generation Delivery

상태: Ready after G02

## 1. 목적

일정과 딜 변경에 따라 reminder notification을 예약하고, due processor가 앱 안 알림과 email/browser push delivery를 처리하게 한다.

## 2. 선행 조건

- G01 DB foundation 완료
- G02 Backend Notification API 완료
- SMTP/Web Push env 이름이 `BE/.env.example`과 환경 문서에 정리되어 있다.

## 3. 포함 범위

- 일정 생성/수정 시 `SCHEDULE_START_REMINDER` 예약
- 일정 삭제/hard delete 시 pending schedule reminder 취소
- 딜 생성/수정 시 `DEAL_DUE_REMINDER` 예약
- 딜 soft delete 시 pending deal reminder 취소
- `ProcessDueNotificationsUseCase`
- email delivery port와 SMTP adapter
- browser push delivery port와 Web Push VAPID adapter
- delivery attempt retry 정책
- push 404/410 성격 실패 시 subscription revoke
- provider failure safe error mapping

## 4. 제외 범위

- 다음 행동 알림
- 회의록 후속 알림
- digest email
- Admin provider failure 화면
- native push

## 5. Scheduling 기준

- 일정: `startAt - 30분`
- 딜: 사용자 timezone 기준 `expectedEndDate - 1일 09:00`
- 계산된 scheduledAt이 이미 지났지만 원본 일정/딜이 아직 유효하면 즉시 due 처리 가능한 notification을 만든다.
- 원본 일정/딜이 이미 지난 경우 새 notification을 만들지 않는다.
- 원본 시간이 바뀌면 기존 pending notification은 `CANCELED` 처리한다.

## 6. Delivery 기준

- `Notification.status=PENDING`, `scheduledAt <= now`인 row를 batch 조회한다.
- 앱 안 알림은 `SENT`, `sentAt=now`로 연다.
- email/browser push는 user setting에 따라 delivery attempt를 만든다.
- provider 호출은 DB transaction 밖에서 실행한다.
- retryable failure는 최대 3회 재시도한다.
- provider raw response는 저장하지 않는다.

## 7. 검증 명령

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- notification
pnpm run build
```

## 8. 완료 기준

- 일정 생성/수정/삭제가 pending notification을 정확히 생성/갱신/취소한다.
- 딜 생성/수정/삭제가 pending notification을 정확히 생성/갱신/취소한다.
- due processor가 notification을 `SENT`로 전환한다.
- email/browser push delivery attempt가 성공/실패/retry 상태를 저장한다.
- provider 실패가 앱 안 알림을 rollback하지 않는다.
- log/response에 email body, push endpoint/key, provider raw response가 남지 않는다.
