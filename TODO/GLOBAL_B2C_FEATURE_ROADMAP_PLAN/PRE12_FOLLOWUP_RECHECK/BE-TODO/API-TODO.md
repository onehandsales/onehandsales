# Backend API Todo

상태: Draft / confirmed backend API 없음
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK` 후보가 Backend에 어떤 영향을 줄 수 있는지 기록한다. 현재 바로 구현할 Backend API 작업은 없다.

## 2. 현재 코드 사실

| 영역 | 현재 사실 |
| --- | --- |
| Notification | `NotificationSourceType`은 `SCHEDULE`, `DEAL`만 사용한다. 일정 시작 reminder와 딜 마감 reminder 중심이다. |
| DealActivity | `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`, `MEETING_NOTE_LINKED`, `FOLLOW_UP_SENT/FAILED` 같은 activity event가 있다. |
| MeetingNote AI | `AiProviderOperation`에 MeetingNote draft/STT/next action/follow-up draft operation이 있다. |
| Follow-up Delivery | `FollowUpMessage`, `FollowUpDeliveryAttempt`, `ExternalEmailConnection` 계열이 있고 Gmail/Microsoft email adapter는 구현됐다. SMS provider는 production 실제 provider가 아니라 test/not-configured provider 상태다. |

## 3. 구현 금지

G00과 API contract 확정 전에는 아래 Backend 변경을 하지 않는다.

- `NotificationSourceType` 확장
- `NotificationType` 확장
- next action reminder scheduling use case 추가
- MeetingNote follow-up reminder scheduling use case 추가
- Follow-up 자동 발송 worker 추가
- Company/Contact/Product list summary API field 추가
- MeetingNote list summary API field 추가
- generic ExportJob API 추가
- billing/paywall/churn API 추가

2026-08-06 A 결정에 따라 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 API contract 확정 대상으로 올리지 않는다.

## 4. 후보별 Backend 영향

| 후보 | 예상 Backend 영향 | 현재 상태 |
| --- | --- | --- |
| 다음 행동 reminder | Notification source/setting/scheduler/dedupe/cancel rule 확정 필요 | Question |
| 회의록 follow-up reminder | MeetingNote source, follow-up draft/send 상태, notification rule 확정 필요 | post-12-seed |
| MeetingNote 자동 발송 | consent, retry, unsubscribe, send policy, provider cost policy 필요 | post-12-seed |
| record summary | 기존 list API field 추가 또는 별도 summary endpoint, redaction 기준 필요 | Company/Contact/Product는 defer. 비고: post-12 B2B/team CRM strategy seed. MeetingNote list summary는 post-12-seed. |
| provider smoke | 새 API 없음. 운영 환경과 runbook 기록만 필요 | pre-12-follow-up-needed |

## 5. 권장 검색 명령

```powershell
rg -n "enum NotificationSourceType|model Notification|model UserNotificationSetting|model NotificationDeliveryAttempt" BE\prisma\schema.prisma
rg -n "NotificationSourceType|schedule.*reminder|deal.*reminder|NEXT_ACTION|MEETING_NOTE|FOLLOW_UP" BE\src -g "*.ts"
rg -n "@Controller" BE\src\modules\notification BE\src\modules\deal BE\src\modules\meeting-note BE\src\modules\follow-up -g "*.controller.ts"
```

## 6. 관련 문서

- `../COMMON/API-SPEC/README.md`
- `../COMMON/CANDIDATE-MATRIX.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
