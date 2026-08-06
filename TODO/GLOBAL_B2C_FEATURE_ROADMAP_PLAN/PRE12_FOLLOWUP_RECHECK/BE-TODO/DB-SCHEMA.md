# DB Schema Todo

상태: Draft / migration 없음
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 후속 후보가 Prisma schema에 어떤 영향을 줄 수 있는지 기록한다. 현재 이 계획만으로 새 migration을 만들지 않는다.

## 2. 현재 기준

| 모델/enum | 현재 의미 |
| --- | --- |
| `NotificationSourceType` | `SCHEDULE`, `DEAL`만 존재한다. |
| `UserNotificationSetting` | 일정 reminder와 딜 마감 reminder 설정 중심이다. |
| `Notification` | source type/id, dedupe key, status, scheduledAt 기반이다. |
| `NotificationDeliveryAttempt`, `BrowserPushSubscription` | provider safe error와 push subscription 암호화 저장은 완료됐지만 TTL cleanup 정책/runner는 없다. |
| `ExternalCalendarConnection`, `ExternalCalendarSource`, `Schedule` external fields | 04에서 Google read-only import/sync metadata로 완료됐다. provider는 `GOOGLE`만 있고 `ExternalCalendarConnection`은 `@@unique([userId, provider])`로 사용자당 Google 연결 1개 기준이다. recurrence/reminders/attendee/watch channel/other provider table은 없다. |
| `DealActivityType` | next action, schedule, meeting note, follow-up event를 activity로 기록한다. |
| `DealActivitySourceType` | `SYSTEM`, `USER`, `NEXT_ACTION`, `SCHEDULE`, `MEETING_NOTE`, `FOLLOW_UP`가 있다. |
| `AiProviderOperation` | Weekly report, follow-up draft, MeetingNote AI/STT/draft operation을 포함한다. |
| `FollowUpMessage`, `FollowUpDeliveryAttempt` | follow-up draft/send/retry/history와 provider attempt를 저장한다. |
| `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` | 01에서 persistence/resume과 보관/삭제/입력량 제한 기준을 닫았다. |
| MeetingNote raw 저장 table | `MeetingNoteTranscript`, `MeetingNoteFollowUpDraft`, raw provider response 전용 table은 없다. |
| `User.preferredLocale`, `User.timeZone`, `User.countryCode`, `User.defaultCurrencyCode` | 08에서 user global settings로 완료됐다. 1차 허용값은 `ko-KR/en`, `KR/US`, `KRW/USD`다. |
| `Product.currencyCode`, `Deal.currencyCode` | 08에서 KRW/USD 정수 금액 정책으로 완료됐다. amount는 minor unit이 아니다. |
| `Contact.phoneCountryCode`, `Contact.phoneNationalNumber`, `Contact.phoneE164` | 08에서 KR/US phone normalization과 legacy mobile fallback으로 완료됐다. |
| `Company.address`, `CompanyRegion.countryCode`, `CompanyRegion.regionCode` | 08에서 Company free address와 KR/US region code로 완료됐다. Contact address는 없다. |
| `OAuthProvider` | `KAKAO`, `GOOGLE`, `APPLE`, `LINE` enum이 있다. Runtime auth provider는 Google/LINE/Apple이고 Kakao는 legacy 호환이다. |
| `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot` | 09에서 analytics 정본, activation/retention snapshot, raw event retention 기준으로 완료됐다. |
| `AccountDeletionRequest`, `UserDataExportRequest` | 11에서 계정 삭제 요청/취소/Admin queue와 데이터 export request workflow로 완료됐다. 실제 계정 hard delete/anonymization processor는 없다. |
| `AiUsageDaily`, `UsageMeter`, `BillingEvent`, `UserSubscription`, `ChurnSurveyResponse`, `ExperimentAssignment` | 현재 schema에 없다. 09에서는 만들지 않았고 12 또는 12 이후 후보로 남긴다. |
| `BusinessCardScanLog.safeErrorCode/safeErrorMessage/retryable` | 10에서 BusinessCard OCR safe failure 계약으로 완료됐다. 10 범위 신규 DB model은 이것 외에 없다. |
| `UserDraft`, server draft DB, media/raw 저장 table | 현재 schema에 없다. 10 local draft는 FE storage 기준이며 audio/image binary, transcript 전문, provider raw response를 DB에 저장하지 않는다. |
| `ExportJob` | 현재 schema에 없다. 03/11 후속 `PRE12-F09`로만 본다. FE 잔여 코드가 있어도 10 또는 PRE12에서 migration을 만들지 않는다. |
| `AdminAuditLog`, `AdminSensitiveAccessLog`, `TrashRecoveryRequest`, `AdminOperationCheckRun` | 11 Admin Operation에서 운영 audit/redaction, Trash recovery queue, system gate record로 완료됐다. Admin 직접 restore/payment/purge 실행 model은 없다. |

## 3. 새 migration 금지 기준

아래 중 하나가 confirmed 되기 전에는 migration을 만들지 않는다.

- next action reminder의 source type과 due date model
- MeetingNote follow-up reminder의 source type, source id, cancel rule
- follow-up 자동 발송 정책과 저장 모델
- Notification/NotificationDeliveryAttempt/BrowserPushSubscription TTL cleanup 기준을 확정하지 않은 상태의 삭제 migration 또는 cleanup cursor table
- Company/Contact/Product latest summary의 저장 방식
- MeetingNote list summary의 저장 방식
- AI data cleanup suggestion의 저장/적용/rollback 방식
- MeetingNote transcript/raw provider response/follow-up draft body의 retention, 삭제권, raw access audit 방식
- 대용량 import worker queue/status/retry 저장 방식
- 일정/회의록 import source snapshot과 mapping 저장 방식
- ImportJob Admin 운영 조회/cleanup 저장 방식
- ExportJob/file retention 정책
- Google Calendar write/watch channel, recurrence/reminder/attendee mapping, multi-account connection key, Google 외 calendar provider 모델
- billing entitlement/paywall/churn 모델
- `/app` 신규 locale 지원을 위한 User locale 확장
- 신규 country/currency/phone dictionary 확장
- Product/Deal minor unit 전환 또는 amount precision migration
- 국가별 상세 주소 validation, tax/terms/pricing 저장 모델
- Contact personal address 저장 모델
- email/password, Microsoft, Kakao runtime, 신규 auth provider 저장 모델
- account deletion 실제 hard delete/anonymization job 상태/lock/result 저장 모델
- Notification/Calendar/follow-up 세부 analytics event 확장을 위한 새 enum/table
- external analytics provider forwarding outbox/dead-letter table
- public/UTM/ad attribution과 growth experiment assignment 저장 모델
- `AiUsageDaily`, `UsageMeter`, `BillingEvent`, `UserSubscription`, `ChurnSurveyResponse`
- PWA install/offline shell/full offline sync/native app/native push/contact/calendar/native install attribution 저장 모델
- `UserDraft`, server draft DB, audio/image binary, transcript 전문, provider raw response 저장 table
- `ExportJob`, export file retention, `/api/exports` 전용 저장 모델
- Admin 직접 Trash 복구 실행, 유료 복구 결제, hard delete/purge 상태/결과 저장 모델
- data export artifact 생성/다운로드 worker 상태, storage object, signed URL audit 저장 모델
- 자동 민감정보 감지/DLP scan result, false positive/override 저장 모델

2026-08-06 A 결정으로 Company/Contact/Product latest summary와 generic summary endpoint는 12 전 DB 설계 후보로 승격하지 않는다.

04 재대조 기준으로 Google Calendar DB 영향은 Google read-only source metadata까지 완료다. `ExternalCalendarProvider=GOOGLE`, 사용자당 provider 1개 unique, `Schedule` external metadata 기준을 재오픈하지 않고 write/watch/recurrence/reminders/attendee/multi-account/other provider schema는 `PRE12-F10` 후속 후보로만 둔다.

08 재대조 기준으로 global data/i18n의 1차 schema는 완료다. 추가 country/currency/phone/auth provider/money/address 변경은 08 미완성이 아니라 post-12 또는 12 Billing 정책 이후의 별도 migration 후보로 둔다.

09 재대조 기준으로 analytics 1차 schema는 완료다. `ProductAnalyticsEvent`와 snapshot model을 재오픈하지 않고, account deletion 실제 처리, 세부 event taxonomy, provider forwarding, attribution/experiment, billing usage source, PWA/native attribution은 별도 migration 후보로만 둔다.

10 재대조 기준으로 Mobile Field Use의 DB 영향은 BusinessCard safe failure field까지로 닫혔다. `UserDraft`, server draft DB, media/raw 저장 table, PWA/native attribution table, `ExportJob`은 10 미완성이 아니라 별도 후속 후보로만 둔다.

11 재대조 기준으로 Admin Operation의 1차 DB 영향은 Admin audit/security, Trash recovery request, account/data request, system operation check run으로 닫혔다. 11 문서 체크리스트 미체크를 근거로 새 migration을 만들지 않는다. Admin 직접 Trash 복구/유료 복구/hard delete/purge, data export artifact/download, 자동 민감정보 감지는 별도 정책/운영 계약 전 migration 후보로 올리지 않는다.

## 4. 후보별 DB 영향

| 후보 | 가능한 DB 영향 | 현재 판단 |
| --- | --- | --- |
| 다음 행동 reminder | `NotificationSourceType` 확장, `UserNotificationSetting` 필드 추가, `DealFollowingActionLog` due field 검토 | 결정 필요 |
| 회의록 follow-up reminder | Notification source 확장 또는 별도 reminder table 검토 | post-12 seed |
| follow-up 자동 발송 | send schedule, consent, unsubscribe, retry policy table 검토 | post-12 seed |
| Notification 데이터 TTL/cleanup | `Notification.createdAt`, `NotificationDeliveryAttempt.createdAt`, `BrowserPushSubscription.revokedAt` 기준 hard delete/보존 정책과 provider failure 운영 조회 영향 검토 | post-12 seed / `PRE12-F38` |
| record summary | denormalized summary table 또는 runtime aggregation 여부 결정 | Company/Contact/Product는 defer. 비고: post-12 B2B/team CRM strategy seed. MeetingNote list summary는 post-12-seed. |
| AI data cleanup | suggestion table, 적용 이력, rollback/audit table 필요 여부 결정 | post-12 seed / 별도 data quality 계획 |
| transcript/raw/follow-up draft 저장 | raw text 저장 table, TTL, 삭제권, sensitive access log 기준 필요 | defer / 정책 필요 |
| Import scale/source/Admin 확장 | background job queue, source별 row snapshot, Admin cleanup/audit table 필요 여부 결정 | post-12 seed |
| provider smoke | DB 변경 없음 | 운영 기록 |
| App locale 확장 | User locale enum/table 분리 여부, 기존 locale migration 필요 여부 | post-12 seed |
| Global country/currency/phone 확장 | country/currency/phone/region dictionary table 또는 code enum 확장 여부 결정 | post-12 seed |
| amount precision/minor unit | Product/Deal amount 저장 단위, 기존 정수 row migration, export/report 호환 field 필요 여부 결정 | billing-blocked |
| address/tax/terms/pricing policy | billing address, tax profile, price catalog, terms acceptance 모델과 연결 | billing-blocked |
| Contact personal address | Contact address field 또는 address child table 필요 여부 결정 | post-12 seed / CRM 확장 |
| auth strategy 확장 | password credential, reset token, provider linking 정책 table 필요 여부 결정 | defer / 정책 필요 |
| app i18n/Settings/bundle polish | DB 변경 없음 | UXUI quality |
| account deletion 실제 처리 | job lock/result table 또는 기존 `AccountDeletionRequest` status transition으로 충분한지 결정. `User` hard delete/anonymization 범위와 cascade 영향 검증 필요 | Question / 정책 필요 |
| Product analytics 세부 event 확장 | 신규 table보다는 taxonomy/payload contract 확장이 우선. 필요 시 event version 또는 derived aggregate table 검토 | post-12 seed / 별도 analytics 계획 |
| external analytics provider forwarding | provider delivery outbox, retry/dead-letter, consent snapshot 저장 필요 여부 결정 | post-12 seed / growth/ops |
| public/UTM attribution/growth experiment | attribution touchpoint, campaign/referrer, `ExperimentAssignment` 저장 모델 필요 여부 결정 | post-12 seed / growth/marketing |
| AI usage billing source | `AiUsageDaily`와 `UsageMeter` 중 billing source-of-truth 결정. `AiProviderCallLog`는 09 Admin 참고용 summary source다 | billing-blocked |
| PWA/native packaging과 attribution | install attribution, full offline sync metadata, native device/push/contact/calendar/app install event 저장 필요 여부 결정 | post-12 seed / 별도 mobile roadmap |
| 10 FE/BE TODO 체크리스트 정합성 | DB 변경 없음. 문서 체크리스트 정리만 대상 | pre-12-doc-cleanup |
| generic ExportJob/PDF | `ExportJob`, file TTL, audit, ownership, deletion policy가 필요하지만 post-12 전 migration 금지 | post-12 seed |
| Google Calendar 고급 sync/provider 확장 | write/watch channel, recurrence/reminder/attendee mapping, multi-account connection key, provider abstraction table 필요 여부 결정 | post-12 seed / `PRE12-F10` |
| 11 Admin 문서 체크리스트 정합성 | DB 변경 없음. 문서 체크리스트 정리만 대상 | pre-12-doc-cleanup |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge | 복구 실행 결과, 결제 연결, purge audit/hold table 필요 여부 결정. 11에서는 없음 | Question / 정책 및 billing 필요 |
| User data export artifact/download | `ExportJob` 또는 `UserDataExportRequest` status transition으로 충분한지 결정. file TTL/storage/audit 기준 필요 | post-12 seed / `PRE12-F09` 연결 |
| 자동 민감정보 감지 | scan result, override, audit, retention 저장 모델 필요 여부 결정 | defer / 정책 필요 |

## 5. DB/Prisma gate

새 migration이 필요한 goal로 전환되면 아래를 선행한다.

- `BE/prisma/schema.prisma`와 migration SQL에 한국어 주석 또는 `COMMENT ON` 설명 추가
- `pnpm run prisma:validate`
- `pnpm run prisma:generate`
- 공유/운영 DB에 무단 migrate/seed 금지
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`의 DB/Prisma gate 확인

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/BE-TODO/DB-SCHEMA.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/BE-TODO/DB-SCHEMA.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/BE-TODO/DB-SCHEMA.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/BE-TODO/DB-SCHEMA.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC/AI_USAGE_ANALYTICS_CONTRACT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/BE-TODO/DB-SCHEMA.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/GOAL-SPECS/G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT.md`
