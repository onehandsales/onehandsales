# DB Schema TODO

상태: Draft

## 모델 후보

- `Notification`
- `UserNotificationSetting`
- `BrowserPushSubscription`
- `NotificationDeliveryAttempt`

## 결정 필요

- endpoint/p256dh/auth 암호화 방식
- 알림 보관 기간
- 알림 source relation 저장 방식
- email/browser push 실패 로그 보관 범위
- unread count index

## migration 주의

- 민감정보가 provider error에 저장되지 않게 한다.
- browser push subscription은 사용자 ownership과 암호화가 필요하다.
