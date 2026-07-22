# G02 Backend Notification API

상태: Ready after G01

## 1. 목적

User Web이 알림 목록, unread count, 읽음 처리, 설정, browser push subscription을 사용할 수 있게 Backend User API를 구현한다.

## 2. 선행 조건

- G01이 완료되어 Prisma model과 repository adapter를 사용할 수 있다.
- `COMMON/API-SPEC/NOTIFICATION_API.md` 계약 상태가 `confirmed`다.

## 3. 포함 범위

- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:notificationId/read`
- `GET /api/notifications/settings`
- `PATCH /api/notifications/settings`
- `GET /api/notifications/browser-push/public-key`
- `POST /api/notifications/browser-subscriptions`
- `DELETE /api/notifications/browser-subscriptions/:subscriptionId`
- DTO/request/response 구현
- AuthGuard와 user ownership 적용
- settings default response/upsert
- subscription endpoint hash/encryption

## 4. 제외 범위

- 일정/딜 mutation과 reminder 예약 연결
- due notification processor
- SMTP/Web Push provider 실제 발송
- User Web route 해제
- Admin API

## 5. Backend 구조 기준

- controller는 request validation과 application service 호출만 담당한다.
- Prisma 직접 접근을 controller에 두지 않는다.
- application service는 repository port를 통해 DB를 사용한다.
- mutation에서 여러 model을 변경하면 transaction manager port 사용을 검토한다.
- User API는 `/api/*`만 사용한다.

## 6. 검증 명령

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- notification
pnpm run build
```

## 7. 완료 기준

- 모든 API가 `COMMON/API-SPEC/NOTIFICATION_API.md`와 일치한다.
- 다른 사용자의 notification/subscription 접근은 404다.
- 읽음 처리는 idempotent하다.
- setting row가 없어도 기본값을 반환한다.
- browser push subscription 원문은 저장/logging되지 않는다.
- VAPID env 누락 시 안전한 503을 반환한다.
