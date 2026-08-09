# DB Schema Todo

상태: Final / migration 없음 / BEFORE_12 반영 완료
작성일: 2026-08-06
최종 업데이트: 2026-08-09

## 1. 목적

이 문서는 후속 후보가 Prisma schema에 어떤 영향을 줄 수 있는지 기록한다. 현재 이 계획만으로 새 migration을 만들지 않는다.

2026-08-07 `../COMMON/FINAL-CLASSIFICATION.md` 기준으로 12 전에 할 것은 `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`뿐이며 모두 새 Prisma model, enum, index, migration이 필요 없다. 2026-08-09 기준 해당 5개는 BEFORE_12에서 모두 닫혔다.

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
| `DealActivity` | 06에서 Deal timeline source-of-truth로 추가됐다. soft delete/trash/restore/retention/audit field, score field, summary cache table은 없다. |
| `AiProviderOperation` | Weekly report, follow-up draft, MeetingNote AI/STT/next action/follow-up draft operation을 포함한다. |
| `AiProviderCallLog` | MeetingNote provider log를 공통 로그로 기록하며 `targetType`, `targetId`, `[userId, targetType, targetId, createdAt]` index가 있다. |
| `AiWeeklySalesReport`, `AiWeeklySalesReportSuggestion`, `AiJob`, `AiProviderCallLog` | 05에서 저장형 weekly report, version/failed version, input snapshot, safe provider log, suggestion을 완료했다. 자동 생성 schedule/cursor나 AI suggestion 자동 mutation 적용 모델은 없다. |
| `ExternalEmailConnection`, `ExternalEmailOAuthState`, `SmsSenderNumber`, `FollowUpConsentNotice` | 05에서 Gmail/Microsoft email connection과 SMS sender verification/consent foundation을 완료했다. B2B tenant sender, email sync, campaign/sequence, unsubscribe, external SMTP/SaaS provider 모델은 없다. |
| `FollowUpMessage`, `FollowUpDeliveryAttempt` | follow-up draft/send/retry/history와 provider attempt를 저장한다. 예약 발송, bulk/campaign, tracking/attachment 전용 모델은 없다. |
| `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` | 01에서 persistence/resume과 보관/삭제/입력량 제한 기준을 닫았다. |
| MeetingNote raw 저장 table | `MeetingNoteTranscript`, `MeetingNoteFollowUpDraft`, raw provider response 전용 table은 없다. |
| `User.preferredLocale`, `User.timeZone`, `User.countryCode`, `User.defaultCurrencyCode` | 08에서 user global settings로 완료됐다. 1차 허용값은 `ko-KR/en`, `KR/US`, `KRW/USD`다. |
| `Product.currencyCode`, `Deal.currencyCode` | 08에서 KRW/USD 정수 금액 정책으로 완료됐다. amount는 minor unit이 아니다. |
| `Contact.phoneCountryCode`, `Contact.phoneNationalNumber`, `Contact.phoneE164` | 08에서 KR/US phone normalization과 legacy mobile fallback으로 완료됐다. |
| `Company.address`, `CompanyRegion.countryCode`, `CompanyRegion.regionCode` | 08에서 Company free address와 KR/US region code로 완료됐다. Contact address는 없다. |
| `OAuthProvider` | `KAKAO`, `GOOGLE`, `APPLE`, `LINE` enum이 있다. Runtime auth provider는 Google/LINE/Apple이고 Kakao는 legacy 호환이다. |
| `UserRole` | 현재 `USER`, `ADMIN`만 있다. `TenantAdmin`, `CustomerAdmin` 같은 customer/B2B admin 역할은 없다. |
| `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot` | 09에서 analytics 정본, activation/retention snapshot, raw event retention 기준으로 완료됐다. |
| `AccountDeletionRequest`, `UserDataExportRequest` | 11에서 계정 삭제 요청/취소/Admin queue와 데이터 export request workflow로 완료됐다. 실제 계정 hard delete/anonymization processor는 없다. |
| `AiUsageDaily`, `UsageMeter`, `BillingEvent`, `UserSubscription`, `ChurnSurveyResponse`, `ExperimentAssignment`, billing/payment/tax/refund/invoice 관련 모델 | 현재 schema에 없다. 09에서는 만들지 않았고 08도 결제 국가/세금/환불/인보이스를 다루지 않았으며 12 또는 12 이후 후보로 남긴다. |
| `BusinessCardScanLog.safeErrorCode/safeErrorMessage/retryable` | 10에서 BusinessCard OCR safe failure 계약으로 완료됐다. 10 범위 신규 DB model은 이것 외에 없다. |
| BusinessCard advanced camera preview/crop model | 현재 schema에 없다. 10은 native file/camera picker와 safe failure field까지만 닫았고 custom camera/crop 상태 저장 model을 만들지 않았다. |
| `UserDraft`, server draft DB, media/raw 저장 table | 현재 schema에 없다. 10 local draft는 FE storage 기준이며 audio/image binary, transcript 전문, provider raw response를 DB에 저장하지 않는다. |
| `ExportJob` | 현재 schema에 없다. 03/11 후속 `PRE12-F09`로만 본다. FE 잔여 코드가 있어도 10 또는 PRE12에서 migration을 만들지 않는다. |
| `AdminAuditLog`, `AdminSensitiveAccessLog`, `TrashRecoveryRequest`, `AdminOperationCheckRun` | 11 Admin Operation에서 운영 audit/redaction, Trash recovery queue, system gate record로 완료됐다. Admin 직접 restore/payment/purge 실행 model, Admin domain mutation result/rollback model, ImportJob cleanup failure aggregate model은 없다. |
| Tenant/organization 계열 model | 현재 `Tenant`, `Organization`, `OrgMember`, `TenantAdmin` model은 없다. 11 Admin Web `/organizations` redirect는 customer-facing tenant admin schema가 있다는 의미가 아니다. |

## 3. 새 migration 금지 기준

아래 중 하나가 confirmed 되기 전에는 migration을 만들지 않는다.

- next action reminder의 source type과 due date model
- MeetingNote follow-up reminder의 source type, source id, cancel rule
- follow-up 자동 발송 정책과 저장 모델
- MeetingNote AI 후보 자동 업무 mutation 이력/승인/rollback/audit 저장 모델
- AI weekly report 자동 생성 scheduler/cursor 또는 AI suggestion 자동 mutation 이력 모델
- SMS 실제 provider/vendor, B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, scheduled send, tracking/attachment 저장 모델
- Notification/NotificationDeliveryAttempt/BrowserPushSubscription TTL cleanup 기준을 확정하지 않은 상태의 삭제 migration 또는 cleanup cursor table
- Company/Contact/Product latest summary의 저장 방식
- DealActivity soft delete/trash/restore/retention/audit, summary cache/denormalized latest, score/AI 판단, memo/private memo 통합, all-domain activity bus 저장 방식
- MeetingNote list summary의 저장 방식
- AI data cleanup suggestion의 저장/적용/rollback 방식
- MeetingNote transcript/raw provider response/follow-up draft body의 retention, 삭제권, raw access audit 방식
- 대용량 import worker queue/status/retry 저장 방식
- 일정/회의록 import source snapshot과 mapping 저장 방식
- ImportJob Admin 운영 조회/cleanup 저장 방식
- ImportJob cleanup 실패 전용 aggregate/system gate 저장 방식
- ExportJob/file retention 정책
- Google Calendar write/watch channel, recurrence/reminder/attendee mapping, multi-account connection key, Google 외 calendar provider 모델
- billing entitlement/paywall/churn 모델
- subscription/plan/payment/invoice/refund/failed payment/tax profile 저장 모델
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
- marketing opt-in/communication consent preference, withdrawal, audit snapshot 저장 모델
- `AiUsageDaily`, `UsageMeter`, `BillingEvent`, `UserSubscription`, `ChurnSurveyResponse`, subscription/payment/tax/refund/invoice model
- PWA install/offline shell/full offline sync/native app/native push/contact/calendar/native install attribution 저장 모델
- BusinessCard advanced camera preview/crop 상태, image preprocessing, crop metadata 저장 model을 `PRE12-F42` 계약 없이 추가
- `UserDraft`, server draft DB, audio/image binary, transcript 전문, provider raw response 저장 table을 `PRE12-F43` 정책 없이 추가
- `ExportJob`, export file retention, `/api/exports` 전용 저장 모델
- Admin 직접 Trash 복구 실행, 유료 복구 결제, hard delete/purge 상태/결과 저장 모델
- Admin domain mutation result/rollback/audit 저장 모델
- Tenant/organization/member/role/permission 저장 모델 또는 customer/B2B admin role enum
- data export artifact 생성/다운로드 worker 상태, storage object, signed URL audit 저장 모델
- 자동 민감정보 감지/DLP scan result, false positive/override 저장 모델

2026-08-06 A 결정으로 Company/Contact/Product latest summary와 generic summary endpoint는 12 전 DB 설계 후보로 승격하지 않는다.

06 재대조 기준으로 `DealActivity` schema와 migration은 timeline/manual create-update/자동 event 기록용으로 완료됐다. 삭제/보존/감사, memo 통합, 공통 activity bus, 검색/필터/score/AI 판단, summary cache는 `PRE12-F39`로만 두고 06 미완성 migration으로 보지 않는다.

07 재대조 기준으로 MeetingNote AI/STT provider log는 공통 `AiProviderCallLog` operation/target 확장으로 완료됐다. 별도 `MeetingNoteTranscript`, `MeetingNoteFollowUpDraft`, `MeetingNoteProviderCallLog`, `AiDataCleanupSuggestion` table은 없고, list summary 저장 방식이나 reminder/자동 발송 저장 모델, AI 후보 자동 업무 mutation 이력 모델은 `PRE12-F02`/`PRE12-F03`/`PRE12-F08`/`PRE12-F14`/`PRE12-F15`/`PRE12-F40` 후속 후보로만 둔다.

04 재대조 기준으로 Google Calendar DB 영향은 Google read-only source metadata까지 완료다. `ExternalCalendarProvider=GOOGLE`, 사용자당 provider 1개 unique, `Schedule` external metadata 기준을 재오픈하지 않고 write/watch/recurrence/reminders/attendee/multi-account/other provider schema는 `PRE12-F10` 후속 후보로만 둔다.

05 재대조 기준으로 AI weekly report와 follow-up delivery의 1차 schema는 완료다. Gmail/Microsoft provider smoke는 DB 변경 없이 BEFORE_12 G01 운영 기록으로 닫혔고, SMS 실제 provider, B2B/email growth 확장, 사용자-facing cost/paywall, 영구 로그 legal deletion 정책은 `PRE12-F05`/`PRE12-F06`/`PRE12-F12`/`PRE12-F26` 후속 후보로 둔다.

08 재대조 기준으로 global data/i18n의 1차 schema는 완료다. 추가 country/currency/phone/auth provider/money/address 변경은 08 미완성이 아니라 post-12 또는 12 Billing 정책 이후의 별도 migration 후보로 둔다.

09 재대조 기준으로 analytics 1차 schema는 완료다. `ProductAnalyticsEvent`와 snapshot model을 재오픈하지 않고, account deletion 실제 처리, 세부 event taxonomy, provider forwarding, attribution/experiment, marketing opt-in, billing usage source, PWA/native attribution은 별도 migration 후보로만 둔다.

10 재대조 기준으로 Mobile Field Use의 DB 영향은 BusinessCard safe failure field까지로 닫혔다. BusinessCard advanced camera preview/crop은 `PRE12-F42`, `UserDraft`, server draft DB, media/raw 저장 table은 `PRE12-F43`, PWA/native attribution table은 `PRE12-F30`, `ExportJob`은 `PRE12-F09` 후속 후보로만 둔다.

11 재대조 기준으로 Admin Operation의 1차 DB 영향은 Admin audit/security, Trash recovery request, account/data request, system operation check run으로 닫혔다. 11 문서 체크리스트 미체크를 근거로 새 migration을 만들지 않는다. Admin 직접 Trash 복구/유료 복구/hard delete/purge, data export artifact/download, 자동 민감정보 감지, Admin direct domain data mutation, Customer/B2B tenant admin은 별도 정책/운영/전략 계약 전 migration 후보로 올리지 않는다. ImportJob cleanup 실패 전용 aggregate/system gate는 기존 `PRE12-F13` import/Admin ops 확장으로만 본다.

## 4. 후보별 DB 영향

| 후보 | 가능한 DB 영향 | 현재 판단 |
| --- | --- | --- |
| 다음 행동 reminder | `NotificationSourceType` 확장, `UserNotificationSetting` 필드 추가, `DealFollowingActionLog` due field 검토 | post-12 seed / notification policy |
| 회의록 follow-up reminder | Notification source 확장 또는 별도 reminder table 검토 | post-12 seed |
| follow-up 자동 발송 | send schedule, consent, unsubscribe, retry policy table 검토 | post-12 seed |
| MeetingNote AI 후보 자동 업무 mutation | 자동 적용 승인 상태, mutation 이력, undo/rollback, audit, confidence threshold 저장 모델 필요 여부 결정 | post-12 seed / `PRE12-F40` |
| Notification 데이터 TTL/cleanup | `Notification.createdAt`, `NotificationDeliveryAttempt.createdAt`, `BrowserPushSubscription.revokedAt` 기준 hard delete/보존 정책과 provider failure 운영 조회 영향 검토 | post-12 seed / `PRE12-F38` |
| record summary | denormalized summary table 또는 runtime aggregation 여부 결정 | Company/Contact/Product는 defer. 비고: post-12 B2B/team CRM strategy seed. MeetingNote list summary는 post-12-seed. |
| DealActivity lifecycle/search/score 확장 | soft delete/trash/restore/retention/audit field/table, memo/private memo 통합 모델, all-domain activity bus, search index, score/AI 판단 결과, summary cache/denormalized latest 필요 여부 결정 | post-12 seed / `PRE12-F39` |
| AI data cleanup | suggestion table, 적용 이력, rollback/audit table 필요 여부 결정 | post-12 seed / 별도 data quality 계획 |
| transcript/raw/follow-up draft 저장 | raw text 저장 table, TTL, 삭제권, sensitive access log 기준 필요 | defer / 정책 필요 |
| Import scale/source/Admin 확장 | background job queue, source별 row snapshot, Admin cleanup/audit table, cleanup failure aggregate/system gate 저장 필요 여부 결정 | post-12 seed / `PRE12-F13` |
| provider smoke | DB 변경 없음 | closed-by-BEFORE_12 |
| Follow-up delivery 고급 provider/growth 확장 | SMS vendor config/outbox, tenant sender, email sync/import, sequence/campaign/bulk, unsubscribe, scheduled send, tracking/attachment 저장 모델 필요 여부 결정 | post-12 seed / `PRE12-F05`/`PRE12-F06` |
| App locale 확장 | User locale enum/table 분리 여부, 기존 locale migration 필요 여부 | post-12 seed |
| Global country/currency/phone 확장 | country/currency/phone/region dictionary table 또는 code enum 확장 여부 결정 | post-12 seed |
| amount precision/minor unit | Product/Deal amount 저장 단위, 기존 정수 row migration, export/report 호환 field 필요 여부 결정 | billing-blocked |
| address/tax/terms/pricing policy | billing address, tax profile, price catalog, terms acceptance 모델과 연결 | billing-blocked |
| Contact personal address | Contact address field 또는 address child table 필요 여부 결정 | post-12 seed / CRM 확장 |
| auth strategy 확장 | password credential, reset token, provider linking 정책 table 필요 여부 결정 | defer / 정책 필요 |
| app i18n/Settings/bundle polish | DB 변경 없음 | UXUI quality |
| account deletion 실제 처리 | job lock/result table 또는 기존 `AccountDeletionRequest` status transition으로 충분한지 결정. `AiWeeklySalesReport.inputSnapshotJson`, `FollowUpMessage.subject/body`, `FollowUpDeliveryAttempt.detailJson`, `User` hard delete/anonymization 범위와 cascade 영향 검증 필요 | billing-blocked / trust-policy |
| Product analytics 세부 event 확장 | 신규 table보다는 taxonomy/payload contract 확장이 우선. 필요 시 event version 또는 derived aggregate table 검토 | post-12 seed / 별도 analytics 계획 |
| external analytics provider forwarding | provider delivery outbox, retry/dead-letter, consent snapshot 저장 필요 여부 결정 | post-12 seed / growth/ops |
| public/UTM attribution/growth experiment | attribution touchpoint, campaign/referrer, `ExperimentAssignment` 저장 모델 필요 여부 결정 | post-12 seed / growth/marketing |
| Marketing opt-in/communication consent policy | account-level marketing consent preference, withdrawal history, campaign channel consent, audit snapshot 저장 모델 필요 여부 결정. `FollowUpConsentNotice`는 follow-up 발송 고지 확인이므로 대체 모델로 쓰지 않는다 | billing-blocked / growth-compliance / `PRE12-F41` |
| Billing/subscription/tax/paywall runtime | `UserSubscription`, plan/payment/invoice/refund/failed payment/tax profile과 `AiUsageDaily`/`UsageMeter` 중 billing source-of-truth 결정. `AiProviderCallLog`와 `FollowUpDeliveryAttempt.estimatedCostAmount`는 내부 참고/운영용 기록일 뿐 billing source-of-truth가 아니다 | billing-blocked / `PRE12-F12` |
| PWA/native packaging과 attribution | install attribution, full offline sync metadata, native device/push/contact/calendar/app install event 저장 필요 여부 결정 | post-12 seed / 별도 mobile roadmap |
| BusinessCard mobile advanced camera preview/crop | crop metadata, preprocessing result, device capability 저장이 필요한지 검토하되 기본은 FE UX 후보로 둔다. 10 safe failure schema를 재오픈하지 않는다 | post-12 seed / mobile advanced capture / `PRE12-F42` |
| Server draft and media/raw storage policy | `UserDraft`/`MobileDraft`, audio/image binary, transcript 전문, provider raw response 저장 model 필요 여부와 TTL/deletion/encryption/raw access audit 기준 필요 | defer / trust-policy / `PRE12-F43` |
| 10 FE/BE TODO 체크리스트 정합성 | DB 변경 없음. 문서 체크리스트 정리만 대상 | closed-by-BEFORE_12 |
| generic ExportJob/PDF | `ExportJob`, file TTL, audit, ownership, deletion policy가 필요하지만 post-12 전 migration 금지 | post-12 seed |
| Google Calendar 고급 sync/provider 확장 | write/watch channel, recurrence/reminder/attendee mapping, multi-account connection key, provider abstraction table 필요 여부 결정 | post-12 seed / `PRE12-F10` |
| 11 Admin 문서 체크리스트 정합성 | DB 변경 없음. 문서 체크리스트 정리만 대상 | closed-by-BEFORE_12 |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge | 복구 실행 결과, 결제 연결, purge audit/hold table 필요 여부 결정. 11에서는 없음 | billing-blocked / recovery-policy |
| User data export artifact/download | `ExportJob` 또는 `UserDataExportRequest` status transition으로 충분한지 결정. file TTL/storage/audit 기준 필요 | post-12 seed / `PRE12-F09` 연결 |
| 자동 민감정보 감지 | scan result, override, audit, retention 저장 모델 필요 여부 결정 | defer / 정책 필요 |
| Admin direct domain data mutation and recovery action policy | 도메인 mutation result, rollback snapshot, user notification, redaction/audit model 필요 여부 결정. 11 read-only records 완료 범위와 분리한다 | defer / ops-policy / `PRE12-F44` |
| Customer/B2B tenant admin and organization admin model | `Tenant`/`Organization`/`OrgMember`, tenant role/permission, customer admin audit, billing/support boundary 저장 모델 필요 여부 결정 | defer / B2B-strategy / `PRE12-F45` |

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
