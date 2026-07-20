# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `GET` | `/api/notifications` | 알림 목록 |
| `PATCH` | `/api/notifications/:notificationId/read` | 읽음 처리 |
| `GET` | `/api/notifications/settings` | 알림 설정 조회 후보 |
| `PATCH` | `/api/notifications/settings` | 알림 설정 수정 |
| `GET` | `/api/notifications/browser-push/public-key` | VAPID public key |
| `POST` | `/api/notifications/browser-subscriptions` | browser push 등록 |
| `DELETE` | `/api/notifications/browser-subscriptions/:subscriptionId` | browser push 해제 |

## 계약 보강 필요

- notification type/source/status enum
- scheduledAt, readAt, deliveredAt 의미
- delivery retry 기준
- provider error redaction
- settings 기본값
