# API Spec

상태: Draft
작성일: 2026-07-20

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- [x] `NBA-009 Schedule week report`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`
- [x] `NBA-010 Notification`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`
- [x] `NBA-015 Google Calendar Integration`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`

## 1. 계약 상태

이 폴더의 남은 API 후보 항목은 `draft` 또는 `후보` 상태다.

G07은 구현 goal이 아니므로 완료 이력으로 승격된 `NBA-006`, `NBA-009`, `NBA-010`, `NBA-015` 외에는 `confirmed`, `implemented` 상태의 새 API 계약을 만들지 않는다. 실제 구현 전에 각 후보는 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`와 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md` 기준으로 별도 계약 문서를 가져야 한다.

예외: `NBA-006`은 별도 계획 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`로 승격되어 2026-07-21 구현 완료됐고, `NBA-009`는 별도 계획 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`로 승격되어 2026-07-22 구현 완료됐으며, `NBA-010`은 별도 계획 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`로 승격되어 2026-07-22 구현 완료됐고, `NBA-015`는 별도 계획 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`으로 승격되어 2026-07-23 구현 완료됐다. 이 문서에서는 완료 추적용으로만 남긴다.

## 2. Draft API 후보

| 후보 ID | 계약 상태 | API 영향 | 소비자 | 초안 |
|---|---|---|---|---|
| NBA-001 | draft | `GET /api/deals` list item response field 추가 | User Web | `products: ProductSummary[]` 후보. 제품 ID, 제품명, 상태/카테고리 최소 summary 여부는 미정. |
| NBA-002 | draft | `GET /api/contacts` list item response field 추가 | User Web | `dealCount: number` 후보. soft-deleted deal 제외와 user ownership aggregation 기준 필요. |
| NBA-003 | draft | Company/Contact/Product list summary field 또는 summary endpoint 후보 | User Web | `latestMemoAt`, `latestActivityAt`, `latestActivitySummary`, `nextActionSummary` 후보. private memo 제외 정책 필요. |
| NBA-004 | draft | `GET /api/meeting-notes` list item response field 추가 | User Web | `latestSummary`, `nextActionSummary` 후보. AI/STT raw text 저장 여부와 분리 필요. |
| NBA-005 | draft | BusinessCard OCR error/status contract | User Web | 사용자 응답에는 safe `errorCode`, `userMessage`, `retryable`만 두고 provider detail은 운영 log로 분리하는 후보. |
| NBA-006 | implemented | ImportJob persistence/resume API | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/API-SPEC/IMPORT_JOB_API.md` 기준 `/api/imports` 계열로 구현. |
| NBA-007 | draft | Trash detail response 제한 | User Web | private memo 대상은 복구 전 detail response에서 `content` 원문을 내려주지 않는 후보. |
| NBA-008 | draft | list pagination/page size contract 정리 | User Web | 기본 `pageSize=15` 계약을 FE/BE/test/API 문서에 동시에 맞추는 후보. |
| NBA-009 | implemented | Schedule week report API | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md` 기준 `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx` 구현. 새 DB/migration 없음. |
| NBA-010 | implemented | Notification API | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/COMMON/API-SPEC/NOTIFICATION_API.md` 기준 notification list/read/settings/browser-push API와 일정/딜 reminder 생성/발송 처리 구현. |
| NBA-015 | implemented | Google Calendar Integration API | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md` 기준 Google OAuth connect/callback/status/calendar list/selection/sync/disconnect, Schedule Google fields, Trash restore 확장 구현. |
| NBA-011 | draft | MeetingNote provider audit Admin/internal API 후보 | Admin Web 또는 Backend internal | transcript/provider call log 조회는 민감정보 원문 조회 사유와 audit log가 필요하다. |
| NBA-012 | draft | Trash retention/restore status contract | User Web, Backend internal | 7일 이후 restore 실패 status, purge job, 유료/운영 복구 정책 후보. |
| NBA-013 | draft | Admin operation API | Admin Web | `/admin/api/*` 운영 조회, masking, raw access reason, audit log 후보. |
| NBA-014 | N/A | 새 API 없음 | Backend internal | DB 대상 결정, Prisma generate lock, migration status, seed 정책 closeout 후보. |

## 3. 공통 계약 규칙

- User API는 `/api/*`, Admin API는 `/admin/api/*`로 분리한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- 권한 없음과 소유권 없음은 client 응답에서 다른 사용자 리소스 존재 여부를 노출하지 않는다.
- mutation, Admin API, 민감정보, 외부 Provider API는 transaction과 observability 계약을 생략하지 않는다.
- private memo, transcript, provider detail, API key, quota 정보는 일반 사용자 response에 섞지 않는다.
- page size 변경은 FE 숫자만 바꾸지 않고 Backend 상수, response `pageSize`, API 문서, 테스트를 함께 갱신한다.
