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
- `DATA_IMPORT_SCHEMA.md`: DataImport 양식/성공 로그 DB 구조
- `TIME_AND_TIMEZONE_POLICY.md`: DB/API/Frontend 시간과 timezone 처리 기준

## 3. 현재 DB 범위

Snapshot date: 2026-07-03

현재 Backend DB는 `BE/prisma/schema.prisma`와 migration 기준으로 Auth/User, Company, Contact, BusinessCard OCR, Product, Deal, Schedule, MeetingNote, DataImport 도메인을 포함한다. Company/Contact/Product/Deal/MeetingNote 본문 row와 각 도메인의 메모, 비밀 메모, 다음 행동 로그에는 7일 휴지통 보관을 위한 soft delete 컬럼이 반영되어 있다. 별도 `Trash` table은 없고, Trash 목록/상세/복구 API는 기존 row의 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 기준으로 동작한다.

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
- `BE/prisma/migrations/20260629010000_add_business_card_scan_log/migration.sql`
- `BE/prisma/migrations/20260630010000_add_import_templates_and_logs/migration.sql`
- `BE/prisma/migrations/20260702010000_add_deal_import_template/migration.sql`

Search는 기존 table을 읽는 기능이므로 별도 table이나 migration이 없다.

MeetingNote AI/STT draft는 현재 DB table을 추가하지 않는다. `POST /api/meeting-notes/ai-draft`와 `POST /api/meeting-notes/stt-draft`는 draft만 반환하고, 최종 저장은 기존 `MeetingNote`와 snapshot link table을 사용한다. AI 초안 provider와 STT provider는 application port로 분리되어 있으며, transcript, raw text, provider call log table은 후속 범위다.

DataImport는 `ImportTemplate`, `ImportUserLog`, `ImportUserLogRow`를 사용한다. 확정 전 임시 import job은 현재 in-memory store에 있으며 DB table로 저장하지 않는다. 확정 성공 시에만 도메인 row와 성공 내역 snapshot이 같은 transaction에서 저장된다. 딜 불러오기는 기존 회사/담당자/제품 이름 매칭을 전제로 딜과 연결 row를 같은 transaction에서 생성한다.

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
- `TODO/IMPORT_TEMPLATE_PLAN`

## 5. 아직 포함되지 않은 DB 범위

- `UserSetting`
- 계정 영구 삭제 예약 column/table
- DealActivity 통합 영업 활동 table
- 유료 영구 삭제 복구 예약 column/table
- Admin 감사/조회 도메인 table
- MeetingNote AI/STT transcript/raw text/provider call log table
- persistent ImportJob table. 현재 확정 전 job은 in-memory store를 사용한다.
- generic ExportJob table은 현재 범용 export를 쓰지 않는 정책으로 제외한다. Company/Contact/Product/Deal export는 각 도메인 API가 xlsx 파일을 직접 생성한다.
- Notification table

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
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DATA_IMPORT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
