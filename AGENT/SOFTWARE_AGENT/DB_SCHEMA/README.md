# DB Schema

## 1. 목적

이 폴더는 Backend 데이터베이스 구조의 소프트웨어 정본을 관리한다.

현재 기준 소스는 `BE/prisma/schema.prisma`이며, 이 폴더의 문서는 구현자와 기획자가 테이블 역할, 관계, 컬럼 의미를 빠르게 확인하기 위한 주석 포함 설명서다.

## 2. 현재 문서

- `AUTH_USER_SCHEMA.md`: 현재 Backend에 남아 있는 Auth/User DB 구조
- `COMPANY_SCHEMA.md`: 회사 도메인 기본 기능에 필요한 Company DB 구조
- `CONTACT_SCHEMA.md`: 거래처 도메인 기본 기능에 필요한 Contact DB 구조
- `PRODUCT_SCHEMA.md`: 제품 도메인 기본 기능에 필요한 Product DB 구조
- `DEAL_SCHEMA.md`: 딜 도메인 기본 기능에 필요한 Deal DB 구조
- `SCHEDULE_SCHEMA.md`: 일정 도메인 기본 기능에 필요한 Schedule DB 구조
- `MEETING_NOTE_SCHEMA.md`: 수동 회의록 도메인 기본 기능에 필요한 MeetingNote DB 구조
- `TIME_AND_TIMEZONE_POLICY.md`: DB/API/Frontend의 시간과 timezone 처리 기준

## 3. 현재 DB 범위

현재 Backend DB는 `BE/prisma/schema.prisma`와 migration 기준으로 Auth/User 도메인, Company 기본 도메인, Contact 기본 도메인, Product 기본 도메인, Deal 기본 도메인, Schedule 기본 도메인, MeetingNote 수동 도메인을 포함한다.

포함:

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
- `Product`
- `ProductCategory`
- `ProductStatus`
- `ProductMemoLog`
- `ProductUserPrivateMemoLog`
- `Deal`
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

현재 반영된 migration:

- `BE/prisma/migrations/20260611000000_add_company_domain/migration.sql`
- `BE/prisma/migrations/20260611010000_add_contact_domain/migration.sql`
- `BE/prisma/migrations/20260611020000_add_product_domain/migration.sql`
- `BE/prisma/migrations/20260612000000_add_deal_domain/migration.sql`
- `BE/prisma/migrations/20260612010000_add_deal_product_join/migration.sql`
- `BE/prisma/migrations/20260614010000_add_user_timezone/migration.sql`
- `BE/prisma/migrations/20260614020000_add_schedule_domain/migration.sql`
- `BE/prisma/migrations/20260615000000_add_meeting_note_domain/migration.sql`

첫 migration에는 Auth/User 기본 테이블과 Company 기본 도메인 테이블이 함께 반영되어 있다. Contact migration에는 거래처, 거래처 직급/부서, 일반 메모 로그, 개인 비밀 메모 로그 테이블이 반영되어 있다. Product migration에는 제품, 제품 카테고리/상태, 일반 메모 로그, 개인 비밀 메모 로그 테이블이 반영되어 있다. Deal migration에는 딜, 다음 행동 로그, 메모 로그 테이블이 반영되어 있고 후속 DealProduct migration에는 딜-제품 N:M 연결 테이블이 반영되어 있다. User timezone migration에는 `User.timeZone`이 반영되어 있다. Schedule migration에는 일정과 일정-딜 N:M 연결 테이블이 반영되어 있다. MeetingNote migration에는 수동 회의록과 회사/담당자/제품/딜 snapshot 연결 테이블이 반영되어 있다.

현재 DB 기준을 완료한 Backend TODO:

- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/G01-BE-MEETING-NOTE-DOMAIN.goal.md`

아직 포함하지 않음:

- `UserSetting`
- 계정 영구 삭제 예약 컬럼
- 계정 삭제 API용 별도 테이블
- DealActivity 등 후속 영업 활동 통합 테이블
- Trash/휴지통 테이블
- Admin 감사/조회 도메인 테이블
- MeetingNote AI/STT 원문 암호화와 Admin 민감 원문 조회용 감사 구조

회사 도메인의 테이블 역할, 관계, 인덱스 의도는 `COMPANY_SCHEMA.md`를 기준으로 확인한다.
거래처 도메인의 테이블 역할, 관계, 인덱스 의도는 `CONTACT_SCHEMA.md`를 기준으로 확인한다.
제품 도메인의 테이블 역할, 관계, 인덱스 의도는 `PRODUCT_SCHEMA.md`를 기준으로 확인한다.
딜 도메인의 테이블 역할, 관계, 인덱스 의도는 `DEAL_SCHEMA.md`를 기준으로 확인한다.
일정 도메인의 테이블 역할, 관계, 인덱스 의도는 `SCHEDULE_SCHEMA.md`를 기준으로 확인한다.
회의록 도메인의 테이블 역할, 관계, 인덱스 의도는 `MEETING_NOTE_SCHEMA.md`를 기준으로 확인한다.

## 4. 관리 규칙

- 실제 Prisma schema를 수정하면 이 폴더의 문서도 함께 갱신한다.
- migration을 추가하거나 이미 적용된 DB 구조를 바꾸면 관련 schema 문서와 API 문서를 함께 갱신한다.
- 테이블/컬럼을 추가할 때는 역할, nullable 여부, 기본값, 관계, 인덱스 의도를 함께 기록한다.
- 주석은 실제 구현자가 DB만 보고도 의미를 이해할 수 있을 정도로 구체적으로 작성한다.
- 시간 컬럼을 추가하거나 API 시간 필드를 설계할 때는 `TIME_AND_TIMEZONE_POLICY.md`를 따른다.
- `createdAt`, `updatedAt` 같은 시스템 시각은 UTC 기준으로 저장한다.
- 일정의 `startAt`, `endAt`은 사용자가 입력한 local date-time과 IANA `timeZone`을 해석한 뒤 DB에는 UTC instant로 저장한다.
- 사용자가 입력한 현지 날짜/시간을 저장하는 업무 테이블은 `timeZone` 컬럼을 함께 둔다.
- 날짜만 필요한 값은 Prisma `DateTime @db.Date`를 사용한다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/SCHEDULE_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/MEETING_NOTE_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
