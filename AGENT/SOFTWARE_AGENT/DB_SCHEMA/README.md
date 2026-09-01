# DB Schema

## 1. 목적

이 폴더는 Backend 데이터베이스 구조의 정본을 관리한다.

실제 source of truth는 `BE/prisma/schema.prisma`와 migration 파일이다. 이 폴더의 문서는 구현자와 기획자가 table 역할, 관계, column 의미를 빠르게 확인하기 위한 설명 문서다.

## 2. 현재 문서

- `AUTH_USER_SCHEMA.md`: Auth/User DB 구조
- `COMPANY_SCHEMA.md`: Company DB 구조
- `CONTACT_SCHEMA.md`: Contact DB 구조
- `PRODUCT_SCHEMA.md`: Product DB 구조
- `DEAL_SCHEMA.md`: Deal DB 구조
- `SCHEDULE_SCHEMA.md`: Schedule DB 구조
- `MEETING_NOTE_SCHEMA.md`: MeetingNote DB 구조
- `BUSINESS_CARD_SCHEMA.md`: BusinessCardScanLog DB 구조
- `ERROR_REPORT_SCHEMA.md`: User Web 에러 신고 DB 구조
- `SUPPORT_REQUEST_SCHEMA.md`: User Web 지원 요청 DB 구조
- `PUBLIC_CONTACT_REQUEST_SCHEMA.md`: 로그인 전 공개 문의 접수 DB 구조
- `DATA_IMPORT_SCHEMA.md`: DataImport 양식/성공 로그 DB 구조
- `PRODUCT_ANALYTICS_SCHEMA.md`: Product Analytics raw event/snapshot DB 구조
- `TIME_AND_TIMEZONE_POLICY.md`: DB/API/Frontend 시간과 timezone 처리 기준

## 3. 현재 DB 범위

Snapshot date: 2026-08-24

현재 Backend DB는 `BE/prisma/schema.prisma`와 migration 기준으로 Auth/User, Company, Contact, BusinessCard OCR, Error Report, Support Request, Product, Deal, DealActivity, Schedule, MeetingNote, DataImport/ImportJob, Notification/BrowserPush, Google Calendar integration, AI Weekly Sales Report/Follow-up, AI provider call log, Product Analytics, Admin Operation 도메인을 포함한다. `User`에는 기본 timezone과 사용자 locale/region 메타데이터가 포함된다. Company/Contact/Product/Deal/Schedule/MeetingNote 본문 row와 각 도메인의 메모, 비밀 메모, 다음 행동 로그에는 7일 휴지통 보관을 위한 soft delete 컬럼이 반영되어 있다. Product Analytics raw event는 User hard delete 시 함께 삭제하고, retention cohort snapshot은 userId 없는 aggregate로 보관한다. 별도 `Trash` table은 없고, Trash 목록/상세/복구 API는 기존 row의 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 기준으로 동작한다.

Auth/User 기준:

- Supabase OAuth provider 계정은 `UserOAuthAccount`로 내부 `User`와 연결한다.
- 앱 session은 `AuthSession`이 정본이며, refresh token 원문은 저장하지 않고 hash만 저장한다.
- 현재 User Web은 `mobile`/`personal_laptop` device slot을 사용한다. 같은 slot의 다른 기기 로그인은 기존 active device/session을 교체한다.
- `signupCountryCode`/`lastLoginCountryCode`는 proxy geo header가 없으면 `null`일 수 있다.

포함 table/model:

- `User`
- `UserOAuthAccount`
- `AuthDevice`
- `AuthSession`
- `Company`
- `CompanyField`
- `CompanyRegion`
- `CompanyMemoLog`
- `CompanyUserPrivateMemoLog`
- `Contact`
- `ContactJobGrade`
- `ContactDepartment`
- `ContactMemoLog`
- `ContactUserPrivateMemoLog`
- `BusinessCardScanStatus`
- `BusinessCardResolution`
- `BusinessCardScanLog`
- `ErrorReportStatus`
- `ErrorReport`
- `SupportRequestType`
- `SupportRequestStatus`
- `SupportRequest`
- `PublicContactRequestStatus`
- `PublicContactRequest`
- `Product`
- `ProductCategory`
- `ProductStatus`
- `ProductMemoLog`
- `ProductUserPrivateMemoLog`
- `Deal`
- `DealCompany`
- `DealContact`
- `DealProduct`
- `DealFollowingActionLog`
- `DealMemoLog`
- `Schedule`
- `ScheduleDeal`
- `MeetingNoteSourceType`
- `MeetingNote`
- `MeetingNoteCompany`
- `MeetingNoteContact`
- `MeetingNoteProduct`
- `MeetingNoteDeal`
- `ImportTemplateType`
- `ImportTemplate`
- `ImportUserLog`
- `ImportUserLogRow`
- `ImportJob`
- `ImportJobRow`
- `ImportJobError`
- `ImportUploadedFile`
- `ProductAnalyticsEventSource`
- `UserActivationStatus`
- `ProductAnalyticsTargetType`
- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`
- `AdminAuditLog`
- `AdminSensitiveAccessLog`
- `TrashRecoveryRequest`
- `AccountDeletionRequest`
- `UserDataExportRequest`
- `AdminOperationCheckRun`
- `DealActivity`
- `ExternalCalendarConnection`
- `ExternalCalendarSource`
- `AiWeeklySalesReport`
- `AiWeeklySalesReportSuggestion`
- `AiJob`
- `AiProviderCallLog`
- `ExternalEmailConnection`
- `ExternalEmailOAuthState`
- `SmsSenderNumber`
- `FollowUpConsentNotice`
- `FollowUpMessage`
- `FollowUpMessageTarget`
- `FollowUpDeliveryAttempt`
- `UserNotificationSetting`
- `Notification`
- `NotificationDeliveryAttempt`
- `BrowserPushSubscription`

현재 반영된 주요 migration:

- `BE/prisma/migrations/20260611000000_add_company_domain/migration.sql`
- `BE/prisma/migrations/20260611010000_add_contact_domain/migration.sql`
- `BE/prisma/migrations/20260611020000_add_product_domain/migration.sql`
- `BE/prisma/migrations/20260612000000_add_deal_domain/migration.sql`
- `BE/prisma/migrations/20260612010000_add_deal_product_join/migration.sql`
- `BE/prisma/migrations/20260614010000_add_user_timezone/migration.sql`
- `BE/prisma/migrations/20260614020000_add_schedule_domain/migration.sql`
- `BE/prisma/migrations/20260615000000_add_meeting_note_domain/migration.sql`
- `BE/prisma/migrations/20260617010000_make_meeting_note_meeting_at_required/migration.sql`
- `BE/prisma/migrations/20260626010000_add_meeting_note_title/migration.sql`
- `BE/prisma/migrations/20260623010000_add_deal_company_contact_joins/migration.sql`
- `BE/prisma/migrations/20260625010000_add_log_soft_delete_columns/migration.sql`
- `BE/prisma/migrations/20260625020000_add_core_entity_soft_delete_columns/migration.sql`
- `BE/prisma/migrations/20260626020000_add_meeting_note_soft_delete_columns/migration.sql`
- `BE/prisma/migrations/20260629010000_add_business_card_scan_log/migration.sql`
- `BE/prisma/migrations/20260630010000_add_import_templates_and_logs/migration.sql`
- `BE/prisma/migrations/20260702010000_add_deal_import_template/migration.sql`
- `BE/prisma/migrations/20260708010000_add_user_locale_region_metadata/migration.sql`
- `BE/prisma/migrations/20260730090000_add_product_analytics/migration.sql`
- `BE/prisma/migrations/20260823010000_add_error_reports/migration.sql`
- `BE/prisma/migrations/20260824010000_add_support_requests/migration.sql`
- `BE/prisma/migrations/20260901010000_add_public_contact_requests/migration.sql`

Search는 기존 table을 읽는 기능이므로 별도 table이나 migration이 없다.

MeetingNote AI/STT draft는 현재 DB table을 추가하지 않는다. `POST /api/meeting-notes/ai-draft`와 `POST /api/meeting-notes/stt-draft`는 draft만 반환하고, 최종 저장은 기존 `MeetingNote`와 snapshot link table을 사용한다. AI 초안 provider와 STT provider는 application port로 분리되어 있으며, transcript, raw text, provider call log table은 후속 범위다.

DataImport는 `ImportTemplate`, `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`, `ImportUserLog`, `ImportUserLogRow`를 사용한다. 확정 전 import job은 DB에 저장하며 resume/cancel/expire/confirm 상태를 추적한다. 확정 성공 시에는 도메인 row와 성공 내역 snapshot이 같은 transaction에서 저장된다. 딜 불러오기는 기존 회사/담당자/제품 이름 매칭을 전제로 딜과 연결 row를 같은 transaction에서 생성한다. 누락 회사/담당자/제품 보정 배열은 FE API와 HTTP controller/application/repository confirm 경로에 연결되어 있다. Import preview validation 메시지는 누락 또는 오류가 있는 셀에만 표시한다.

2026-08-11 기준 Global B2C 01~11 DB foundation은 `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN` 완료 archive를 따른다. Billing/paywall/churn final event table, `UserSubscription`, `UsageMeter`, invoice/refund/tax/payment 관련 table은 아직 만들지 않았고 `TODO/PADDLE_PLAN`에서 베타 이후 confirmed scope로 확정한다.

## 4. 현재 DB 기준 구현 완료/참조 Backend TODO

- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/G01-BE-MEETING-NOTE-DOMAIN.goal.md`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/BE-TODO/G01-BE-MEETING-NOTE-AI-STT-DRAFT.goal.md`
- `TODO/DONE/BUSINESS_CARD_OCR_PLAN`
- `TODO/DONE/IMPORT_TEMPLATE_PLAN`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`

## 5. 아직 포함되지 않은 DB 범위

- `UserSetting`
- 계정 영구 삭제 예약 column/table
- 유료 영구 삭제 복구 예약 column/table
- MeetingNote AI/STT transcript/raw text 영구 저장 table
- generic ExportJob table은 현재 범용 export를 쓰지 않는 정책으로 제외한다. Company/Contact/Product/Deal export는 각 도메인 API가 xlsx 파일을 직접 생성한다.
- Billing/paywall/churn final event table, `UserSubscription`, `UsageMeter`, invoice/refund/tax/payment table은 `TODO/PADDLE_PLAN`에서 베타 이후 확정한다.

## 6. 관리 규칙

- 실제 Prisma schema를 수정하면 이 폴더 문서도 함께 갱신한다.
- migration을 추가하거나 이미 적용된 DB 구조를 바꾸면 관련 schema 문서와 API 문서를 함께 갱신한다.
- table/column을 추가할 때 역할, nullable 여부, 기본값, 관계, index 의도를 기록한다.
- 시간 column을 추가하거나 API 시간 필드를 설계할 때는 `TIME_AND_TIMEZONE_POLICY.md`를 따른다.
- `createdAt`, `updatedAt` 같은 시스템 시각은 UTC 기준으로 저장한다.
- 일정의 `startAt`, `endAt`은 사용자 입력 local date-time과 IANA `timeZone`을 해석해 DB에는 UTC instant로 저장한다.
- date-only 값은 Prisma `DateTime @db.Date`를 사용한다.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/SCHEDULE_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/MEETING_NOTE_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/BUSINESS_CARD_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/ERROR_REPORT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/SUPPORT_REQUEST_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PUBLIC_CONTACT_REQUEST_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DATA_IMPORT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_ANALYTICS_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
