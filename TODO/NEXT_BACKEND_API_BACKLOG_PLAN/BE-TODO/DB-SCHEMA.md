# DB Schema TODO

상태: Draft
최종 업데이트: 2026-07-28

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: ImportJob/ImportJobRow/ImportJobError/ImportUploadedFile DB persistence 구현 완료
- [x] `NBA-009 Schedule week report`: 새 DB/migration 없이 기존 `User`, `Schedule`, `ScheduleDeal`, `Deal`, `DealCompany`, `DealContact`, `Company`, `Contact`, `DealFollowingActionLog` runtime aggregation으로 구현 완료
- [x] `NBA-010 Notification`: Notification/UserNotificationSetting/NotificationDeliveryAttempt/BrowserPushSubscription DB persistence 구현 완료
- [x] `NBA-015 Google Calendar Integration`: ExternalCalendarConnection/ExternalCalendarSource, Schedule Google metadata, soft delete/trash fields, sync lock/status DB persistence 구현 완료
- [x] `NBA-001 Deal list products summary`: 기존 `DealProduct` 관계 aggregation으로 구현 완료
- [x] `NBA-002 Contact list dealCount`: 기존 `DealContact` 관계 aggregation으로 구현 완료
- [x] `NBA-003 Deal latest activity subset`: `DealActivity` 정본 model/migration 기반으로 구현 완료
- [x] `NBA-008 Page size 15 contract cleanup`: 새 DB/migration 없이 API/FE/test 계약 확인 완료
- [x] `NBA-014` 06 범위 DB/Prisma migration 운영 gate closeout 완료
- [x] `NBA-004 MeetingNote detail next action/follow-up draft subset`: 새 action/follow-up 저장 table 없이 구현 완료
- [x] `NBA-011 MeetingNote provider log subset`: `AiProviderOperation` meeting-note 값과 `AiProviderCallLog.targetType/targetId/index` 구현 완료
- [x] `08_GLOBAL_DATA_I18N`: User global settings, Product/Deal currency, Contact global phone, Company country/region/address, `OAuthProvider.LINE` migration 구현 및 QA closeout 완료

## 1. 현재 DB 변경 상태

이 계획 후보에서 남은 active 후보 중 새로 확정된 Prisma schema 변경은 없다. `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-004` MeetingNote detail subset, `NBA-006`, `NBA-008`, `NBA-009`, `NBA-010`, `NBA-011` provider log subset, `NBA-014`, `NBA-015`, `08_GLOBAL_DATA_I18N`은 별도 계획에서 구현 완료된 이력으로만 남긴다.

실제 source of truth는 `BE/prisma/schema.prisma`와 migration 파일이다. 이 문서는 G07에서 분리된 후보의 DB/migration 가능성만 기록한다.

06 완료 이력의 DB source of truth:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- `BE/prisma/migrations/20260726010000_add_deal_activity/migration.sql`
- `BE/prisma/schema.prisma`의 `DealActivityType`, `DealActivitySourceType`, `DealActivity`

07 완료 이력의 DB source of truth:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
- `BE/prisma/migrations/20260726020000_add_meeting_note_ai_provider_log_target/migration.sql`
- `BE/prisma/schema.prisma`의 `AiProviderOperation` meeting-note 값과 `AiProviderCallLog.targetType`, `AiProviderCallLog.targetId`

08 완료 이력의 DB source of truth:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- `BE/prisma/migrations/20260728010000_add_user_global_settings/migration.sql`
- `BE/prisma/migrations/20260728020000_add_product_deal_currency/migration.sql`
- `BE/prisma/migrations/20260728030000_add_contact_global_phone/migration.sql`
- `BE/prisma/migrations/20260728040000_add_company_global_region_address/migration.sql`
- `BE/prisma/migrations/20260728050000_add_line_oauth_provider/migration.sql`
- `BE/prisma/schema.prisma`의 `User.countryCode`, `User.preferredLocale`, `User.defaultCurrencyCode`, Product/Deal `currencyCode`, Contact 글로벌 전화번호 필드, Company country/region/address 필드, `CompanyRegion`, `OAuthProvider.LINE`
- 2026-07-28 후속 확인 기준 현재 `.env` 연결 DB는 `pnpm.cmd exec prisma migrate status`에서 최신 상태로 확인됐다.

## 2. 새 migration이 필요 없을 가능성이 높은 후보

| 후보 ID | 후보 | 비고 |
|---|---|---|
| NBA-005 | BusinessCard provider failure contract | error/status contract 중심이며 DB 변경은 기본 필요 없다. |
| NBA-007 | Trash private memo backend response restriction | response mapping 제한 중심이며 DB 변경은 기본 필요 없다. |

## 3. migration 가능성이 높은 후보

| 후보 ID | 후보 | DB 영향 후보 |
|---|---|---|
| NBA-003 잔여 | Company/Contact/Product latest memo/activity/next action summary | Deal list `latestActivity`는 `DealActivity`로 완료됐다. 나머지 record summary는 별도 summary/index 설계 후보가 생길 수 있다. |
| NBA-004 | MeetingNote 목록 next/latest summary | 상세 next action/follow-up draft는 새 저장 table 없이 07에서 완료됐다. 목록 summary를 저장하면 column/table 후보가 생긴다. |
| NBA-011 잔여 | MeetingNote Admin provider audit/retention | 공통 provider call log target 확장은 07에서 완료됐다. Admin 조회 audit, raw access reason, retention/cleanup 정책에 따라 추가 table/column 후보가 생길 수 있다. |
| NBA-012 | Trash 7일 이후 복구 정책 | purge job 기록, 복구 예약, 유료 복구 정책에 따라 column/table 후보가 생길 수 있다. |
| NBA-013 | Admin 운영 UX/API | admin audit log, raw access reason, support action log table 후보가 필요할 수 있다. |

## 4. RQA-005 운영 gate

`RQA-005`는 새 migration 추가 문제가 아니라 현재 DB 대상과 migration 적용 상태를 안전하게 분류하지 못한 운영 gate 문제다. 06에서는 active DB target이 원격 Supabase임을 확인했고, 공유/운영성 DB에 무단 migrate/seed를 실행하지 않는 기준으로 closeout했다.

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
