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

## 3. 새 migration 금지 기준

아래 중 하나가 confirmed 되기 전에는 migration을 만들지 않는다.

- next action reminder의 source type과 due date model
- MeetingNote follow-up reminder의 source type, source id, cancel rule
- follow-up 자동 발송 정책과 저장 모델
- Company/Contact/Product latest summary의 저장 방식
- MeetingNote list summary의 저장 방식
- AI data cleanup suggestion의 저장/적용/rollback 방식
- MeetingNote transcript/raw provider response/follow-up draft body의 retention, 삭제권, raw access audit 방식
- 대용량 import worker queue/status/retry 저장 방식
- 일정/회의록 import source snapshot과 mapping 저장 방식
- ImportJob Admin 운영 조회/cleanup 저장 방식
- ExportJob/file retention 정책
- billing entitlement/paywall/churn 모델
- `/app` 신규 locale 지원을 위한 User locale 확장
- 신규 country/currency/phone dictionary 확장
- Product/Deal minor unit 전환 또는 amount precision migration
- 국가별 상세 주소 validation, tax/terms/pricing 저장 모델
- Contact personal address 저장 모델
- email/password, Microsoft, Kakao runtime, 신규 auth provider 저장 모델

2026-08-06 A 결정으로 Company/Contact/Product latest summary와 generic summary endpoint는 12 전 DB 설계 후보로 승격하지 않는다.

08 재대조 기준으로 global data/i18n의 1차 schema는 완료다. 추가 country/currency/phone/auth provider/money/address 변경은 08 미완성이 아니라 post-12 또는 12 Billing 정책 이후의 별도 migration 후보로 둔다.

## 4. 후보별 DB 영향

| 후보 | 가능한 DB 영향 | 현재 판단 |
| --- | --- | --- |
| 다음 행동 reminder | `NotificationSourceType` 확장, `UserNotificationSetting` 필드 추가, `DealFollowingActionLog` due field 검토 | 결정 필요 |
| 회의록 follow-up reminder | Notification source 확장 또는 별도 reminder table 검토 | post-12 seed |
| follow-up 자동 발송 | send schedule, consent, unsubscribe, retry policy table 검토 | post-12 seed |
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
