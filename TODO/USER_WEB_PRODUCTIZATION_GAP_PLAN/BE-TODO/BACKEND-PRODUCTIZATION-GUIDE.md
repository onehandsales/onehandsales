# Backend Productization Guide

상태: Draft Guide
최종 업데이트: 2026-07-31

## 0. 완료 반영

- [x] ImportJob persistence/resume backend/API/DB 구현 완료
- [x] `NBA-006` active backend gap 종료
- [x] Weekly Schedule Report backend/API 구현 완료
- [x] `NBA-009` active backend gap 종료
- [x] Notification reminder backend/API/DB 구현 완료
- [x] `NBA-010` active backend gap 종료
- [x] Google Calendar Integration backend/API/DB 구현 완료
- [x] `NBA-015` active backend gap 종료
- [x] Deal Activity Timeline backend/API/DB 구현 완료
- [x] `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-008`, `NBA-014` 06 범위 active backend gap 종료
- [x] MeetingNote AI Provider Log backend/API/DB 구현 완료
- [x] `NBA-004` MeetingNote detail subset, `NBA-011` provider log subset active backend gap 종료
- [x] Global Data I18N backend/API/DB 구현 완료
- [x] `08_GLOBAL_DATA_I18N` active backend gap 종료
- [x] Product Analytics backend/API/DB 구현 완료
- [x] `09_PRODUCT_ANALYTICS` active backend gap 종료
- [x] Mobile Field Use backend/API/DB 구현 완료
- [x] `NBA-005`, `10_MOBILE_PWA_FIELD_USE` active backend gap 종료

## 1. 목적

이 문서는 최종 서비스 형태와 현재 Backend/API/DB 상태의 차이를 판단하기 위한 가이드다.

이 문서는 구현 지시서가 아니며, 새 endpoint나 migration을 바로 만들기 위한 계약 문서도 아니다.

Backend 판단 기준은 MVP 기능 추가가 아니라 Global B2C 첫 판매 gate다. 현지화 데이터의 기본 구현은 08에서 닫혔고, 제품 분석 foundation은 09에서 닫혔으며, 모바일 현장 입력성 1차 범위는 10에서 닫혔다. 결제/구독, Admin 운영, 정책/감사, 운영 신뢰와 billing-linked conversion/churn 지표는 판매 전에 별도 계획으로 계약화해야 한다.

## 2. 현재 Backend 구현 요약

| 영역 | 현재 구현 |
|---|---|
| Auth/User | Google/LINE/Apple auth providers, exchange, verified email linking, refresh, logout, `/api/me`, `/admin/api/me`, profile, country/locale/default currency, devices |
| Company | CRUD, taxonomy, country/region/address, memo/private memo, linked contacts/deals, localized xlsx export, trash |
| Contact | CRUD, taxonomy, linked deals, dealCount, global phone, memo/private memo, localized xlsx export, trash |
| Product | CRUD, taxonomy, currencyCode, dealCount/sort, linked deals, memo/private memo, localized xlsx export, trash |
| Deal | list/detail/create/update/delete, stage counts, linked company/contact/product, currencyCode, following action, memo, localized xlsx export, trash, `DealActivity` timeline, products/latest activity summary |
| Schedule | CRUD, deal link, timezone local time handling, weekly report API, weekly xlsx export, Google Calendar connect/import/sync/calendar selection/source metadata/local edit/soft delete |
| MeetingNote | CRUD, AI/STT draft, provider call log, next action draft, follow-up draft, deal link, trash |
| BusinessCard | OCR scan log, upload scan, safe failure fields, KR/US phone normalization, confirm company/contact |
| DataImport | localized templates, upload/mapping/row edit/validation/confirm/cancel/logs, DB persistent pre-confirm job |
| Notification | list/read/settings/browser-push API, 일정/딜/Google-origin schedule reminder 생성, due processor, delivery attempt |
| Search | integrated search |
| Trash | list/detail/restore, Schedule restore |
| Product analytics | collector API, ProductAnalyticsEvent raw event, server event recorder, activation/retention snapshot, AI usage summary, mobile field-use event allowlist |
| Admin | `/admin/api/me` only |

## 3. Backend gap 판단 표

| 후보 영역 | 현재 상태 | Backend에서 필요한 판단 | 바로 구현 여부 |
|---|---|---|---|
| DB/Prisma ops | 06 범위 DB target/migrate/seed gate 확인 완료 | 실제 운영 DB 적용 절차, backup/restore, 장애 대응 기준 | 첫 판매 전 data reliability gate 필요 |
| Deal products summary | 구현 완료 | `GET /api/deals` products summary, ownership aggregation QA 완료 | 완료 |
| Contact dealCount | 구현 완료 | `GET /api/contacts` dealCount, soft delete 제외/user ownership QA 완료 | 완료 |
| Latest activity summary | Deal list `latestActivity` 구현 완료. Company/Contact/Product summary 없음 | 잔여 summary의 memo/private memo/activity 의미와 개인정보 제외 기준 | Deal subset 완료, 잔여는 후속 |
| BusinessCard provider failure | 10에서 구현 완료 | safe `errorCode`, `userMessage`, `retryable`, provider raw detail 미노출, `BusinessCardScanLog` safe failure field QA 완료 | 완료 |
| ImportJob persistence | 구현 완료 | ImportJob/Row/Error/UploadedFile, TTL/delete tracking, resume API, redaction/ownership QA 완료 | 완료 |
| Trash private memo restriction | FE에서 preview를 가림 | Backend response에서 원문 제한할지 정책 결정 | 아직 구현 금지 |
| Page size 15 cleanup | 구현 완료 | service response, API 문서, Backend/User Web test 기준 확인 | 완료 |
| Schedule week report | 구현 완료 | `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`, 기존 `User`, `Schedule`, `ScheduleDeal`, `Deal`, `DealCompany`, `DealContact`, `Company`, `Contact`, `DealFollowingActionLog` runtime aggregation, timezone/weekStart/ownership/redaction QA 완료. PDF/범용 ExportJob, 반복 일정, AI 요약은 별도 후속 범위 | 완료 |
| Notification | 구현 완료 | Notification/UserNotificationSetting/NotificationDeliveryAttempt/BrowserPushSubscription, redaction/ownership/provider failure QA 완료. 실제 SMTP/Web Push provider smoke는 env 준비 후 운영 확인 | 완료 |
| Google Calendar Integration | 구현 완료 | Google OAuth connect/callback/status/calendar list/selection/sync/disconnect, token encryption/redaction, Schedule Google metadata, soft delete/Trash restore, reminder QA 완료. 실제 Google provider smoke는 env 준비 후 운영 확인. export/write/realtime webhook/watch/반복 일정/여러 Google 계정 동시 연결은 별도 후속 범위 | 완료 |
| MeetingNote AI follow-up draft | 구현 완료 | next action/follow-up draft API, provider log, safe failure, ownership/redaction QA 완료. 자동 저장/자동 발송은 하지 않음 | 완료 |
| Global Data I18N | 구현 완료 | User country/locale/default currency, app i18n API 기반 설정, Product/Deal currency, Contact KR/US phone, Company country/region/address, import/export localization, Google/LINE/Apple auth 구현 완료. 현재 `BE/.env` 연결 DB는 2026-07-29 최신 상태 재확인 완료, LINE/Apple 실제 provider smoke도 2026-07-29 사용자 확인 기준 운영 완료 | 완료 |
| MeetingNote provider audit 잔여 | 공통 `AiProviderCallLog` 기반 provider log subset 구현 완료. 별도 raw/transcript table 없음 | Admin/internal 조회, raw access reason, retention/cleanup, privacy policy | 후속 정책 전 구현 금지 |
| Admin operation | `/admin/api/me` 외 없음 | masking, raw access reason, audit log, support flow | 첫 판매 전 별도 큰 계획 필요 |
| Payment/subscription | 없음 | plan, entitlement, payment provider, admin ops | 첫 판매 전 별도 큰 계획 필요 |
| Product analytics | 09 foundation과 10 mobile field-use event 구현 완료 | Admin analytics dashboard/API, billing/paywall/churn runtime source 연결 | foundation 완료, 11/12 후속 전 확장 금지 |

## 4. API 계약 원칙

Backend/API 구현이 필요하면 아래를 먼저 만족해야 한다.

- `COMMON/API-SPEC`에 계약 문서가 있다.
- 계약 상태가 최소 `confirmed`다.
- request/response DTO 이름, success status, error response가 있다.
- transaction 필요 여부와 rollback 범위가 적혀 있다.
- observability, audit log, redaction 기준이 있다.
- FE client와 Query invalidation 기준이 연결되어 있다.
- DB schema 영향이 있으면 `BE-TODO/DB-SCHEMA.md`와 연결되어 있다.

## 5. DB/migration 원칙

- 실제 source of truth는 `BE/prisma/schema.prisma`와 migration 파일이다.
- 적용된 migration 파일을 수정하지 않는다.
- 공유/운영성 DB에 무단 migrate/seed를 실행하지 않는다.
- 실제 DB URL이나 secret을 문서에 기록하지 않는다.
- table/column 추가는 API 계약과 UX 필요성이 확인된 뒤 진행한다.

## 6. Backend 관점 권장 순서

1. Global B2C 첫 판매 gate에 필요한 Backend/API/DB/운영 항목인지 확인한다.
2. 결제, Admin, 정책/감사, 운영 신뢰를 먼저 큰 bundle로 분리한다. 앱 다국어/다국가 데이터 기본 범위는 08 완료 이력, 제품 분석 foundation은 09 완료 이력, 모바일 현장 입력성 1차 범위는 10 완료 이력으로 본다.
3. 제품화 UX에서 실제 필요한 API gap인지 확인한다.
4. 개인정보/보안/운영 정책이 얽힌 후보를 먼저 정책으로 확정한다.
5. ImportJob, Weekly Schedule Report, Notification, Google Calendar Integration, Deal Activity Timeline, MeetingNote AI Provider Log, Global Data I18N, Product Analytics foundation, Mobile Field Use는 완료됐고, Admin, Payment, 운영 신뢰, billing-linked analytics dashboard는 각각 별도 계획으로 분리한다.
