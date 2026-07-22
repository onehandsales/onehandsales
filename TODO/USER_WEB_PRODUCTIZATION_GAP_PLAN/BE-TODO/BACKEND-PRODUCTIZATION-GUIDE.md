# Backend Productization Guide

상태: Draft Guide

## 0. 완료 반영

- [x] ImportJob persistence/resume backend/API/DB 구현 완료
- [x] `NBA-006` active backend gap 종료
- [x] Notification reminder backend/API/DB 구현 완료
- [x] `NBA-010` active backend gap 종료

## 1. 목적

이 문서는 최종 서비스 형태와 현재 Backend/API/DB 상태의 차이를 판단하기 위한 가이드다.

이 문서는 구현 지시서가 아니며, 새 endpoint나 migration을 바로 만들기 위한 계약 문서도 아니다.

Backend 판단 기준은 MVP 기능 추가가 아니라 Global B2C 첫 판매 gate다. 결제/구독, Admin 운영, 제품 분석, 정책/감사, 현지화 데이터는 판매 전에 별도 계획으로 계약화해야 한다.

## 2. 현재 Backend 구현 요약

| 영역 | 현재 구현 |
|---|---|
| Auth/User | auth providers, exchange, refresh, logout, `/api/me`, `/admin/api/me`, profile, devices |
| Company | CRUD, taxonomy, memo/private memo, linked contacts/deals, xlsx export, trash |
| Contact | CRUD, taxonomy, linked deals, memo/private memo, xlsx export, trash |
| Product | CRUD, taxonomy, dealCount/sort, linked deals, memo/private memo, xlsx export, trash |
| Deal | list/detail/create/update/delete, stage counts, linked company/contact/product, following action, memo, xlsx export, trash |
| Schedule | CRUD, deal link, timezone local time handling |
| MeetingNote | CRUD, AI/STT draft, deal link, trash |
| BusinessCard | OCR scan log, upload scan, confirm company/contact |
| DataImport | templates, upload/mapping/row edit/validation/confirm/cancel/logs, DB persistent pre-confirm job |
| Notification | list/read/settings/browser-push API, 일정/딜 reminder 생성, due processor, delivery attempt |
| Search | integrated search |
| Trash | list/detail/restore |
| Admin | `/admin/api/me` only |

## 3. Backend gap 판단 표

| 후보 영역 | 현재 상태 | Backend에서 필요한 판단 | 바로 구현 여부 |
|---|---|---|---|
| DB/Prisma ops | `RQA-005` Blocked 이력 | DB target, migration status, seed/generate 정책 | 첫 판매 전 gate 필요 |
| Deal products summary | list response에 product summary 없음 | 목록 UX에서 진짜 필요한지, ownership aggregation 기준 | 아직 구현 금지 |
| Contact dealCount | contact list response에 dealCount 없음 | count 기준, soft delete 제외, user ownership 기준 | 아직 구현 금지 |
| Latest activity summary | 도메인별 summary 없음 | memo/private memo/activity 의미와 개인정보 제외 기준 | 아직 구현 금지 |
| BusinessCard provider failure | OCR 실패 UX는 있으나 error contract 정교화 후보 | user message와 provider log 분리 | 아직 구현 금지 |
| ImportJob persistence | 구현 완료 | ImportJob/Row/Error/UploadedFile, TTL/delete tracking, resume API, redaction/ownership QA 완료 | 완료 |
| Trash private memo restriction | FE에서 preview를 가림 | Backend response에서 원문 제한할지 정책 결정 | 아직 구현 금지 |
| Page size 15 cleanup | 현재 계약이 얽혀 있음 | service constant, response, tests, docs 동시 변경 | 아직 구현 금지 |
| Schedule week report | route redirect | report API/snapshot/timezone 범위 결정 | 아직 구현 금지 |
| Notification | 구현 완료 | Notification/UserNotificationSetting/NotificationDeliveryAttempt/BrowserPushSubscription, redaction/ownership/provider failure QA 완료. 실제 SMTP/Web Push provider smoke는 env 준비 후 운영 확인 | 완료 |
| MeetingNote provider log | raw/provider log table 없음 | transcript retention, audit, privacy policy | 아직 구현 금지 |
| Admin operation | `/admin/api/me` 외 없음 | masking, raw access reason, audit log, support flow | 첫 판매 전 별도 큰 계획 필요 |
| Payment/subscription | 없음 | plan, entitlement, payment provider, admin ops | 첫 판매 전 별도 큰 계획 필요 |
| Product analytics | 없음 | event taxonomy, data pipeline, privacy | 첫 판매 전 별도 계획 필요 |

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
2. 결제, Admin, 정책/감사, 앱 다국어/다국가 데이터, 제품 분석을 먼저 큰 bundle로 분리한다.
3. 제품화 UX에서 실제 필요한 API gap인지 확인한다.
4. 개인정보/보안/운영 정책이 얽힌 후보를 먼저 정책으로 확정한다.
5. ImportJob과 Notification은 완료됐고, Admin, Payment는 각각 별도 계획으로 분리한다.
