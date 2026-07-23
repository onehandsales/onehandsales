# DB Schema TODO

상태: Draft

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: ImportJob/ImportJobRow/ImportJobError/ImportUploadedFile DB persistence 구현 완료
- [x] `NBA-009 Schedule week report`: 새 DB/migration 없이 기존 `User`, `Schedule`, `ScheduleDeal`, `Deal`, `DealCompany`, `DealContact`, `Company`, `Contact`, `DealFollowingActionLog` runtime aggregation으로 구현 완료
- [x] `NBA-010 Notification`: Notification/UserNotificationSetting/NotificationDeliveryAttempt/BrowserPushSubscription DB persistence 구현 완료
- [x] `NBA-015 Google Calendar Integration`: ExternalCalendarConnection/ExternalCalendarSource, Schedule Google metadata, soft delete/trash fields, sync lock/status DB persistence 구현 완료

## 1. 현재 DB 변경 상태

이 계획 후보에서 남은 후보 중 새로 확정된 Prisma schema 변경은 없다. `NBA-006`, `NBA-009`, `NBA-010`, `NBA-015`는 별도 계획에서 구현 완료된 이력으로만 남긴다.

실제 source of truth는 `BE/prisma/schema.prisma`와 migration 파일이다. 이 문서는 G07에서 분리된 후보의 DB/migration 가능성만 기록한다.

## 2. 새 migration이 필요 없을 가능성이 높은 후보

| 후보 ID | 후보 | 비고 |
|---|---|---|
| NBA-001 | Deal list `products` summary | 기존 `DealProduct` 관계 조회/summary로 가능할 수 있다. |
| NBA-002 | Contact list `dealCount` | 기존 `DealContact` 관계 aggregation으로 가능할 수 있다. |
| NBA-005 | BusinessCard provider failure contract | error/status contract 중심이며 DB 변경은 기본 필요 없다. |
| NBA-007 | Trash private memo backend response restriction | response mapping 제한 중심이며 DB 변경은 기본 필요 없다. |
| NBA-008 | Page size 15 contract cleanup | API 상수/테스트/문서 정리 중심이다. |
| NBA-014 | DB/Prisma migration 운영 gate closeout | 새 schema가 아니라 기존 migration 운영 정합성 closeout이다. |

## 3. migration 가능성이 높은 후보

| 후보 ID | 후보 | DB 영향 후보 |
|---|---|---|
| NBA-003 | Company/Contact/Product latest memo/activity/next action summary | 실제 activity 통합이 필요하면 `DealActivity` 또는 summary/index 설계 후보가 생긴다. |
| NBA-004 | MeetingNote next/latest summary | action summary를 저장하면 column/table 후보가 생긴다. |
| NBA-011 | MeetingNote transcript/provider call log table | transcript/raw text/provider call log table과 retention column 후보가 필요하다. |
| NBA-012 | Trash 7일 이후 복구 정책 | purge job 기록, 복구 예약, 유료 복구 정책에 따라 column/table 후보가 생길 수 있다. |
| NBA-013 | Admin 운영 UX/API | admin audit log, raw access reason, support action log table 후보가 필요할 수 있다. |

## 4. RQA-005 운영 gate

`RQA-005`는 새 migration 추가 문제가 아니라 현재 DB 대상과 migration 적용 상태를 안전하게 분류하지 못한 운영 gate 문제다.

다음 조건이 충족되기 전에는 migrate/seed를 실행하지 않는다.

- active `BE/.env`의 DB URL이 로컬 dev/test DB인지 명확하다.
- 공유 QA 또는 cloud/운영성 DB라면 사용자가 대상과 적용 방식을 명시적으로 결정했다.
- Prisma generate `EPERM` lock 원인이 사용자 실행 프로세스와 충돌하지 않는 방식으로 정리됐다.
- migration status의 미적용 migration 목록을 적용할지, baseline/repair할지 운영 절차가 확정됐다.

## 5. 금지

- 적용된 migration 파일을 수정하지 않는다.
- 공유/운영성 DB에 무단 `prisma:migrate` 또는 seed를 실행하지 않는다.
- 실제 DB URL이나 secret을 문서에 기록하지 않는다.
- API 계약 없이 table/column을 먼저 추가하지 않는다.
