# Candidate Matrix

상태: Draft
작성일: 2026-07-20

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: Done (2026-07-21)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
  - 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`
  - 현재 의미: active backlog 후보가 아니라 완료 이력으로만 남긴다.
- [x] `NBA-010 Notification`: Done (2026-07-22)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`
  - 완료 기록: `TODO_LOG/2026-07-22/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
  - 현재 의미: active backlog 후보가 아니라 완료 이력으로만 남긴다.

## 1. 기준

후보 분류는 `release blocker`, `release follow-up`, `product feature`, `ops/security`, `defer` 중 하나만 사용한다.

G07은 구현 goal이 아니므로 완료 이력으로 승격된 `NBA-006`, `NBA-010` 외의 후보 API 계약은 `draft` 또는 `후보` 상태로만 남긴다.

## 2. 후보 매트릭스

| ID | 후보명 | 출처 | 분류 | 사용자-facing 여부 | 제품 가치 | API 영향 | DB 영향 | FE 영향 | 보안/운영 리스크 | 권장 다음 goal | 구현 금지 사유 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| NBA-001 | Deal list `products` summary | UX/UI QA | release follow-up | Yes | 딜 목록에서 제품 linked record까지 바로 비교할 수 있다. | response field 추가 | 없음 | client type, 딜 목록 화면 | 제품 연결도 사용자 ownership을 따라 필터되어야 한다. | Deal list summary API contract | 현재 S0/S1/S2가 아니며 `GET /api/deals` response 계약 확정이 필요하다. |
| NBA-002 | Contact list `dealCount` | UX/UI QA | release follow-up | Yes | 담당자 목록에서 영업 연결도를 빠르게 판단할 수 있다. | response field 추가 | 없음 | client type, 담당자 목록 화면 | count 집계가 다른 사용자 딜을 포함하면 데이터 격리 문제가 된다. | Contact list deal count contract | 현재 S0/S1/S2가 아니며 aggregation 계약과 테스트가 필요하다. |
| NBA-003 | Company/Contact/Product latest memo/activity/next action summary | UX/UI QA | product feature | Yes | 기본 record 목록이 실제 영업 활동 맥락을 더 잘 보여준다. | response field 추가 또는 summary endpoint 후보 | 없음 또는 activity/index/table 후보 | client type, 목록 화면 | private memo와 일반 활동이 섞이면 개인정보 노출 위험이 있다. | Core record activity summary design | 새 summary 의미와 private memo 제외 정책이 확정되지 않았다. |
| NBA-004 | MeetingNote next/latest summary | UX/UI QA | product feature | Yes | 회의록 목록에서 다음 행동과 최신 맥락을 빠르게 찾을 수 있다. | response field 추가 | 없음 또는 action summary table 후보 | client type, 회의록 목록 화면 | AI/STT 원문 또는 민감 회의 내용 노출 위험이 있다. | MeetingNote summary contract | action 추출 기준과 raw text 저장 정책이 확정되지 않았다. |
| NBA-005 | BusinessCard provider failure code/message contract | UX/UI QA | release follow-up | Yes | OCR 실패 시 사용자는 안전한 안내를 보고 운영자는 원인을 추적할 수 있다. | status/error contract | 없음 | error copy, retry UI | provider, quota, API key, 내부 에러 노출 위험이 있다. | BusinessCard provider failure contract | 현재 FE가 사용자 상세에 내부 정보를 노출하지 않으며, error 계약을 먼저 정해야 한다. |
| NBA-006 | ImportJob persistence/resume API | AGENT 문서 | product feature | Yes | 업로드, 매핑, 검증 중 새로고침/탭 이동 복구가 가능해진다. | Done: `/api/imports` 계열 persistence/resume API 구현 | Done: ImportJob/Row/Error/UploadedFile schema 및 migration 구현 | Done: import review resume UX와 client state 구현 | redaction, ownership, TTL/delete tracking QA 완료. Live Supabase 수동 QA는 운영 확인 단계에서 별도 실행 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE` | 완료. Active backlog에서 제외한다. |
| NBA-007 | Trash private memo backend response restriction | UX/UI QA | ops/security | Yes | FE가 숨기는 것을 넘어 Backend 응답에서도 비밀 메모 원문을 제한한다. | response field 제한 | 없음 | client type, QA only | private memo 원문 노출 방지와 복구 전 preview 정책 영향이 있다. | Trash private memo response policy | 현재 S1로 확인된 노출은 아니며, response compatibility를 먼저 확인해야 한다. |
| NBA-008 | Page size 15 contract 정리 | UX/UI QA | release follow-up | Yes | desktop record density와 FE/BE/test 계약을 맞춘다. | list pagination contract 정리 | 없음 | client type, tests, 목록 화면 | pageSize 불일치가 pagination/cache 오류를 만들 수 있다. | Page size 15 contract cleanup | FE 단독 변경 금지이며 Backend 상수, 응답, 테스트, 문서 동시 변경이 필요하다. |
| NBA-009 | Schedule week report | AGENT 문서 | product feature | Yes | 일정과 딜을 주간 영업 판단으로 연결한다. | 새 endpoint 후보 | 없음 또는 report snapshot 후보 | 새 화면 또는 기존 redirect 해제 | timezone, 기간 경계, report 정확도 리스크가 있다. | Schedule week report design | `/app/schedules/week`는 현재 redirect이며 새 화면/API 범위가 아니다. |
| NBA-010 | Notification | AGENT 문서 | product feature | Yes | reminder 기반 retention loop를 만들 수 있다. | Done: notification list/read/settings/browser-push API 구현 | Done: Notification/UserNotificationSetting/NotificationDeliveryAttempt/BrowserPushSubscription schema 및 migration 구현 | Done: `/app/notifications`, unread badge, settings, browser push fallback UX 구현 | provider raw response, push endpoint/key, email 원문 redaction QA 완료. 실제 SMTP/Web Push provider smoke는 env 부재로 운영 확인 단계에서 별도 실행 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER` | 완료. Active backlog에서 제외한다. |
| NBA-011 | MeetingNote transcript/provider call log table | AGENT 문서 | ops/security | No | AI/STT 품질 추적과 provider 감사가 가능해진다. | Admin/internal API 후보 | table, migration | 없음 또는 Admin future | 원문/오디오/외부 provider 로그 보관과 삭제 정책이 필요하다. | MeetingNote provider audit schema | raw text 저장 정책과 감사/retention 기준이 확정되지 않았다. |
| NBA-012 | Trash 7일 이후 복구 정책 | AGENT 문서 | ops/security | Yes | 복구 가능 기한 이후 동작과 운영 책임을 명확히 한다. | status contract 또는 purge API 후보 | column/table/job 후보 | trash copy, restore error 처리 | irreversible delete, 유료 복구, 법적 보관 정책 영향이 있다. | Trash retention policy plan | 복구/영구삭제 정책과 운영 절차가 먼저 확정되어야 한다. |
| NBA-013 | Admin 운영 UX/API | AGENT 문서 | ops/security | No | 고객 지원, 민감정보 마스킹, 감사 로그 기반 운영이 가능해진다. | 새 `/admin/api/*` | audit/admin table 후보 | Admin Web 화면 | 권한, 마스킹, 원문 조회 사유, audit log 리스크가 크다. | Admin operation API plan | Admin 운영 API와 화면은 이번 release QA 범위에서 제외됐다. |
| NBA-014 | DB/Prisma migration 운영 gate closeout | G02~G06 | release blocker | No | 배포 전 DB 대상, Prisma generate, migration status, seed 정책을 안전하게 닫는다. | 없음 | 기존 migration 운영 절차, 새 migration 없음 | 없음 | cloud DB 오적용, seed 오염, Prisma engine lock, migration 불일치 리스크가 있다. | DB/Prisma ops closeout goal | `RQA-005`가 사용자 DB 대상 결정 없이 Blocked이며 G07에서 migrate/seed/generate를 실행할 수 없다. |

## 3. 다음 실행 순서 제안

1. `NBA-014` DB/Prisma migration 운영 gate closeout
2. `NBA-005`, `NBA-007`, `NBA-012`, `NBA-013` 보안/운영 계약 정리
3. `NBA-001`, `NBA-002`, `NBA-008` release follow-up API contract 정리
4. `NBA-003`, `NBA-004`, `NBA-009`, `NBA-011` product feature 설계
