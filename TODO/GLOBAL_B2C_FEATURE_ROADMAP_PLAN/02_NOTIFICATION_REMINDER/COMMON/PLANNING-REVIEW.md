# Planning Review

상태: Ready for Goal
검토일: 2026-07-22

## 1. 결론

- 판정: 구현 착수 가능
- 이유: 02의 제품 결정, 포함/제외 범위, API 계약, DB schema, FE 작업, goal 순서, QA 체크리스트가 confirmed 수준으로 정리됐다.
- 구현 상태: Not Started

## 2. 사용자 결정 반영

| 항목 | 반영 결과 |
|---|---|
| 채널 | 앱 안 알림 + 브라우저 푸시 + 이메일 모두 포함 |
| 알림 대상 | 일정 시작 전, 딜 마감일 |
| 일정 알림 시간 | 시작 30분 전 |
| 딜 알림 시간 | 마감일 1일 전 오전 9시 |
| 다음 행동 알림 | 제외. 딜 데이터 구조 변경 가능성이 있어 06에서 설계 |
| 회의록 후속 알림 | 제외. 07에서 설계 |

## 3. 검토 대상

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/NOTIFICATION_API.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/*`
- `COMMON/REVIEW-CHECKLIST.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`

## 4. 핵심 설계 판단

| 판단 | 내용 |
|---|---|
| 앱 안 알림 정본 | `Notification`은 앱 안 알림의 정본이다. |
| 외부 채널 분리 | email/browser push는 `NotificationDeliveryAttempt`로 분리한다. |
| 다음 행동 제외 | 현재 `DealFollowingActionLog`에는 due date가 없으므로 02에서 건드리지 않는다. |
| 딜 마감 계산 | `Deal.expectedEndDate` date-only를 사용자 timezone local 09:00으로 변환한다. |
| Push 보안 | endpoint/p256dh/auth는 암호화 저장한다. |
| Provider 실패 | 외부 발송 실패는 앱 안 알림을 rollback하지 않고 delivery attempt에 redacted 기록한다. |

## 5. 미해결 Critical/Major

없음.

## 6. 구현 중 주의

- 실제 SMTP/Web Push provider env가 없으면 adapter는 mock/stub으로 테스트하고 provider smoke는 별도 기록한다.
- `web-push`, `nodemailer` dependency 추가가 필요할 수 있다.
- schedule/deal mutation과 notification 생성/취소를 같은 transaction으로 묶는 구조를 우선 검토한다.
- User Web 기존 notification API client는 `/api/users/me/settings`를 사용하므로 `/api/notifications/settings`로 정리해야 한다.
- `notification-sw.js`의 기본 target path는 `/app/notifications` 기준으로 고쳐야 한다.

## 7. 사용자의 추가 결정이 필요한 질문

현재 구현 착수를 막는 질문은 없다.

후속으로 06/07에서 다시 결정할 항목:

- 다음 행동 알림 due date 모델
- 회의록 follow-up 알림
- digest email
- Admin provider failure UI

## 8. 구현 시작 권장 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/COMMON/GOAL-SPECS/G01_DB_NOTIFICATION_FOUNDATION.md 기준으로 G01을 구현해줘.
```
