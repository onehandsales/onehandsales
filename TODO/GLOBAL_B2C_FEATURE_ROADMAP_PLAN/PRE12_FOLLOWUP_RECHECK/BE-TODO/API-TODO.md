# Backend API Todo

상태: Final / confirmed backend API 없음 / BEFORE_12 반영 완료
작성일: 2026-08-06
최종 업데이트: 2026-08-09

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK` 후보가 Backend에 어떤 영향을 줄 수 있는지 기록한다. 현재 바로 구현할 Backend API 작업은 없다.

2026-08-07 `../COMMON/FINAL-CLASSIFICATION.md` 기준으로 12 전에 할 것은 `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`뿐이며 Backend API 구현은 없다. 2026-08-10 기준 해당 5개는 BEFORE_12에서 모두 닫혔다. `PRE12-F04`도 새 API가 아니라 운영 Gmail/Microsoft provider smoke verified closeout 기록이다.

## 2. 현재 코드 사실

| 영역 | 현재 사실 |
| --- | --- |
| Notification | `NotificationSourceType`은 `SCHEDULE`, `DEAL`만 사용한다. 일정 시작 reminder와 딜 마감 reminder 중심이다. |
| Google Calendar | `/api/schedules/google` connect/status/calendars/selection/sync/disconnect와 callback은 04 범위로 완료됐다. OAuth scope는 `calendar.readonly`이고 export/write/watch/reminders/attendee/multi-account/other provider API는 없다. |
| DealActivity | `GET/POST/PATCH /api/deals/:dealId/activities`와 자동 event, manual create/update, Deal list products/latestActivity, Contact dealCount가 06에서 완료됐다. manual delete API, automatic activity update/delete API, memo/private memo activity 통합, all-domain activity bus, advanced search/filter/score/AI 판단 API는 없다. |
| MeetingNote AI | `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`, `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`, `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`가 07에서 완료됐다. `AiProviderOperation`에는 MeetingNote draft/STT/next action/follow-up draft operation이 있고, 후보 자동 저장/자동 발송 API는 없다. |
| Follow-up Delivery | `FollowUpMessage`, `FollowUpDeliveryAttempt`, `ExternalEmailConnection` 계열이 있고 Gmail/Microsoft email adapter는 구현됐다. SMS provider는 production 실제 provider가 아니라 test/not-configured provider 상태이며, 예약 발송/sequence/campaign/unsubscribe/email sync API는 없다. |
| ImportJob | `/api/imports` 계열 persistence/resume/confirm/cancel과 10MB/5,000 data row 제한은 01에서 완료됐다. 현재 import 대상은 회사, 담당자, 제품, 딜이다. ImportJob cleanup 실패 전용 Admin aggregate/system gate API는 없다. |
| MeetingNote raw storage | transcript/raw provider response/follow-up draft body 전용 저장 API나 table은 없다. 07은 safe metadata log만 남긴다. |
| Global Data I18N | User global settings, Product/Deal currency, Contact KR/US phone, Company KR/US region/address, Import/Export localization, Google/LINE/Apple auth는 08에서 완료됐다. |
| Product Analytics | `POST /api/analytics/events`, server-side recorder, activation/retention snapshot, AI usage summary, 10 mobile field-use event, 11 Admin analytics overview가 있다. 09는 외부 provider, billing runtime, public attribution, experiment, account deletion 실제 job을 만들지 않았다. |
| Mobile Field Use | BusinessCard OCR safe failure, 기존 MeetingNote STT draft, 기존 Notification browser push subscription API, 09 analytics collector 재사용으로 10 범위가 완료됐다. 10은 advanced camera/image processing API, `UserDraft`, `/api/drafts/*`, media/raw 저장 API, PWA/native API, `/api/exports`를 만들지 않았다. |
| Admin Operation | `/admin/api/*`, AuthGuard/AdminGuard, Admin users/domain/trash/provider/analytics/account-request/audit/system API가 있다. Admin domain records는 read-only 조회 기준이며 Admin 도메인 데이터 mutation API는 없다. `UserRole`은 `USER`/`ADMIN` 기준이고 customer/B2B tenant admin API는 없다. 11은 Admin 직접 Trash 복구 mutation, 유료 복구 결제, Trash hard delete/purge, export artifact/download endpoint, 자동 민감정보 감지를 만들지 않았다. |

## 3. 구현 금지

G00과 API contract 확정 전에는 아래 Backend 변경을 하지 않는다.

- `NotificationSourceType` 확장
- `NotificationType` 확장
- next action reminder scheduling use case 추가
- MeetingNote follow-up reminder scheduling use case 추가
- Notification/NotificationDeliveryAttempt/BrowserPushSubscription TTL cleanup runner 또는 Admin cleanup API 추가
- Follow-up 자동 발송 worker 추가
- MeetingNote AI 후보 자동 저장, 자동 일정 생성, 자동 딜 변경, 자동 Contact/MeetingNote/Deal mutation API 추가
- AI weekly report 자동 생성 또는 AI suggestion 자동 mutation API 추가
- Follow-up delivery SMS 실제 provider/vendor API, B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송, SMTP/external email SaaS, HTML/첨부/tracking API 추가
- Company/Contact/Product list summary API field 추가
- DealActivity manual delete/restore API, automatic activity update/delete API, retention/audit/trash API, memo/private memo activity 통합 API, all-domain activity bus, 고급 search/filter, deal score, AI activity 자동 판단 API 추가
- MeetingNote list summary API field 추가
- AI data cleanup 제안 저장/적용 API 추가
- MeetingNote transcript/raw provider response/follow-up draft 저장 또는 조회 API 추가
- 대용량 import worker API 추가
- 일정/회의록 import API 추가
- ImportJob Admin 전용 API 추가
- ImportJob cleanup 실패 전용 Admin aggregate/system gate API 추가
- generic ExportJob API 추가
- Google Calendar export/write/양방향 sync/webhook/watch/reminders/attendee import/multi-account/other provider API 추가
- billing/subscription/plan/payment/invoice/refund/failed payment/tax/paywall/churn API 추가
- User locale/country/currency 허용값 확장
- Contact phone country 확장
- Company region country 확장 또는 국가별 상세 주소 validation 추가
- Product/Deal amount minor unit 전환
- email/password, Microsoft, Kakao runtime, 신규 auth provider 추가
- account deletion 실제 hard delete/anonymization worker 또는 manual execution API 추가
- Notification/Calendar/follow-up 세부 analytics event 수집 API/allowlist 추가
- 외부 analytics provider forwarding API/adapter/worker 추가
- public site/UTM/ad attribution API 또는 `/api/experiments/assignments` 추가
- marketing opt-in/communication consent policy API 추가
- `AiUsageDaily`/`UsageMeter` 기반 billing usage API 추가
- PWA install/offline shell/full offline sync/native app/native push/contact/calendar/native install attribution API 추가
- BusinessCard advanced camera preview/crop을 위한 image processing/upload API를 `PRE12-F42` 계약 없이 추가
- `UserDraft`, `/api/drafts/*`, server draft DB API를 `PRE12-F43` 정책 없이 추가
- audio/image binary, transcript 전문, provider raw response 저장/조회 API를 `PRE12-F43` 정책 없이 추가
- `/api/exports`, `ExportJob` API를 10/PRE12 후속처럼 추가
- stale 11 문서 체크리스트를 근거로 Admin API 재구현
- Admin 직접 Trash 복구 mutation, 유료 복구 결제 API, Trash hard delete/purge API 추가
- Admin domain records를 Company/Contact/Product/Deal/Schedule/MeetingNote/BusinessCard/Import 직접 수정/삭제/복구 mutation으로 확장
- Customer/B2B tenant admin API, organization/member/role/permission API를 11 Admin 후속처럼 추가
- data export artifact 생성 processor, signed URL, download endpoint 추가
- 자동 민감정보 감지/DLP API 또는 processor 추가

2026-08-06 A 결정에 따라 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 API contract 확정 대상으로 올리지 않는다.

06 재대조 기준으로 DealActivity timeline, manual create/update, 자동 event, Deal list products/latestActivity, Contact dealCount, page size 15는 완료다. 삭제/보존/감사, memo 통합, 공통 activity bus, 검색/필터, score, AI 자동 판단, summary cache API는 `PRE12-F39`로만 두고 06 미완성으로 재오픈하지 않는다.

07 재대조 기준으로 MeetingNote AI/STT provider log, detail next action draft, detail follow-up draft API는 완료다. MeetingNote follow-up reminder/자동 발송, list latest/next summary, AI data cleanup 저장/적용, transcript/raw/follow-up draft 저장/조회 API, AI 후보 자동 업무 mutation API는 07 미완성이 아니라 `PRE12-F02`/`PRE12-F03`/`PRE12-F08`/`PRE12-F14`/`PRE12-F15`/`PRE12-F40` 후속 후보로만 둔다. 11에서 닫힌 Admin provider audit/raw access는 07 또는 PRE12에서 재구현하지 않는다.

04 재대조 기준으로 Google Calendar Backend/API 범위는 read-only import/sync, calendar 선택, source metadata, Trash restore, Google-origin reminder까지 완료다. Google export/write/양방향 sync, realtime webhook/watch, 반복 일정 정식 모델, reminders/attendee import, multi-account/provider 확장은 04 미완성이 아니라 `PRE12-F10` 후속 후보로만 둔다.

05 재대조 기준으로 AI weekly report API, snapshot-summary, follow-up delivery settings, Gmail/Microsoft connect/callback/disconnect, draft/send/retry/list API와 send adapter는 완료다. 운영 provider smoke는 새 API 없이 BEFORE_12 G01 기록으로 닫혔고, SMS 실제 provider와 B2B/email growth 확장은 `PRE12-F05`/`PRE12-F06` 후속 후보로 둔다.

08 재대조 기준으로 Google/LINE/Apple 외 provider, `/app` locale prefix, 추가 국가/통화/전화번호 포맷은 새 계약 없이 확장하지 않는다. 국가별 tax/terms/pricing, subscription/payment/refund/invoice/failed payment, amount precision은 12 Billing 결정 전 Backend API 작업으로 올리지 않는다.

09 재대조 기준으로 Product Analytics foundation은 완료다. account deletion 실제 처리, Notification/Calendar/follow-up 세부 analytics event, 외부 provider forwarding, public/UTM attribution, growth experiment, marketing opt-in, billing usage source-of-truth, PWA/native attribution은 09 미완성이 아니라 PRE12 후속 후보 또는 12 이후 계획으로 둔다.

10 재대조 기준으로 Mobile Field Use Backend/API 범위는 완료다. `10/BE-TODO/API-TODO.md`의 G03/G05/G06 미체크는 기능 미구현이 아니라 문서 체크리스트 정리 대상이다. `/api/exports`와 `ExportJob`은 03/11 후속 `PRE12-F09`로만 본다. BusinessCard advanced camera preview/crop은 `PRE12-F42`, server draft/media raw storage policy는 `PRE12-F43`으로 분리한다.

11 재대조 기준으로 Admin Operation Backend/API 범위는 완료다. `11/COMMON/GOAL-COMPLETION-CHECKLIST`, `11/COMMON/GOAL-SPECS/README`, `11/BE-TODO/API-TODO.md`의 정합성은 BEFORE_12 G04에서 닫았다. Admin 직접 Trash 복구/유료 복구/hard delete/purge, data export artifact/download, 자동 민감정보 감지, Admin 직접 도메인 데이터 mutation, Customer/B2B tenant admin은 11 밖의 후속 후보로만 본다. ImportJob cleanup 실패 전용 aggregate/system gate는 기존 `PRE12-F13` import/Admin ops 확장으로 연결한다.

## 4. 후보별 Backend 영향

| 후보 | 예상 Backend 영향 | 현재 상태 |
| --- | --- | --- |
| 다음 행동 reminder | Notification source/setting/scheduler/dedupe/cancel rule 확정 필요 | post-12-seed / notification policy |
| 회의록 follow-up reminder | MeetingNote source, follow-up draft/send 상태, notification rule 확정 필요 | post-12-seed |
| MeetingNote 자동 발송 | consent, retry, unsubscribe, send policy, provider cost policy 필요 | post-12-seed |
| MeetingNote AI 후보 자동 업무 mutation | 자동 적용 endpoint/worker, approval/audit/rollback, confidence threshold, idempotency/ownership 계약 필요 | post-12-seed / `PRE12-F40` |
| Notification 데이터 TTL/cleanup | `Notification`/delivery attempt/revoked subscription 삭제 기준, batch runner, Admin/provider failure 조회 보존 기간, 계정 삭제 실제 처리와의 충돌 기준 필요 | post-12-seed / `PRE12-F38` |
| record summary | 기존 list API field 추가 또는 별도 summary endpoint, redaction 기준 필요 | Company/Contact/Product는 defer. 비고: post-12 B2B/team CRM strategy seed. MeetingNote list summary는 post-12-seed. |
| DealActivity lifecycle/search/score 확장 | manual delete/restore, automatic activity update/delete, retention/audit/trash, memo/private memo 통합, all-domain activity bus, advanced search/filter, deal score, AI activity 자동 판단, summary cache API 계약 필요 | post-12-seed / `PRE12-F39` |
| AI data cleanup | cleanup suggestion 생성/적용/rollback API, audit log, ownership/redaction 기준 필요 | post-12-seed / 별도 data quality 계획 |
| transcript/raw/follow-up draft 저장 | retention, 삭제권, raw access audit, redaction, Admin/User 노출 기준 필요 | defer / 정책 필요 |
| Import scale/source/Admin 확장 | worker queue/status/cancel/retry, schedule/meeting-note source mapping, Admin 조회/cleanup API, cleanup failure aggregate/system gate 기준 필요 | post-12-seed / `PRE12-F13` |
| provider smoke | 새 API 없음. 운영 환경과 runbook 기록만 필요 | closed-by-BEFORE_12 |
| Follow-up delivery 고급 provider/growth 확장 | SMS vendor adapter, B2B tenant sender, email sync/import, sequence/campaign/bulk, unsubscribe, scheduled send, SMTP/external SaaS/HTML/attachment/tracking API contract 필요 | post-12-seed / `PRE12-F05`/`PRE12-F06` |
| App locale 확장 | `preferredLocale` 허용값, validation error, app translation delivery 기준 확정 필요 | post-12-seed |
| Global country/currency/phone 확장 | User/Contact/Company/Product/Deal validation과 import/export/report 변환 기준 필요 | post-12-seed |
| amount precision/minor unit | Product/Deal amount 저장 단위, 기존 row migration, import/export/report 호환 기준 필요 | billing-blocked |
| address/tax/terms/pricing policy | 청구 주소, 세금, 약관, 가격 정책과 API 경계 확정 필요 | billing-blocked |
| auth strategy 확장 | password reset, email verification, provider linking, account recovery, abuse/rate limit 기준 필요 | defer / 정책 필요 |
| app i18n/Settings/bundle polish | 새 Backend API 없음. 필요 시 FE 유지보수만 검토 | post-12-seed / UXUI quality |
| account deletion 실제 처리 | 30일 유예 만료 request 조회, AI report full snapshot과 follow-up subject/body log retention/deletion, processing lock, session revoke/access block, hard delete/anonymization, audit/result API 기준 필요 | billing-blocked / trust-policy |
| Product analytics 세부 event 확장 | Notification/Calendar/follow-up domain event hook, event allowlist, payload privacy contract 필요 | post-12-seed / 별도 analytics 계획 |
| external analytics provider forwarding | provider port/adapter, retry/dead-letter, consent/DPA, redaction, failure isolation 기준 필요 | post-12-seed / growth/ops |
| public/UTM attribution/growth experiment | public route event collector, attribution cookie/referrer policy, experiment assignment API 기준 필요 | post-12-seed / growth/marketing |
| Marketing opt-in/communication consent policy | account-level opt-in/withdrawal API, campaign channel consent, audit snapshot, billing/growth event linkage 기준 필요. `FollowUpConsentNotice` 재사용 금지 | billing-blocked / growth-compliance / `PRE12-F41` |
| Billing/subscription/tax/paywall runtime | plan/payment/subscription, tax/refund/invoice/failed payment, `AiProviderCallLog` summary, `FollowUpDeliveryAttempt` cost 추정과 `AiUsageDaily`/`UsageMeter` 중 billing source-of-truth 결정 필요 | billing-blocked / `PRE12-F12` |
| PWA/native packaging과 attribution | manifest/install/offline/full offline sync/native push/contact/calendar/native app install attribution API 필요 여부 결정 | post-12-seed / 별도 mobile roadmap |
| BusinessCard mobile advanced camera preview/crop | 기본은 FE camera UX 후보이며, image preprocessing/upload 제약이 필요할 때만 API 계약을 재검토한다. 10 safe failure API를 재오픈하지 않는다 | post-12-seed / mobile advanced capture / `PRE12-F42` |
| Server draft and media/raw storage policy | `UserDraft`/`MobileDraft`, `/api/drafts/*`, blob/raw upload, transcript/provider raw 저장/조회 API 필요 여부와 retention/delete/raw access 기준 필요 | defer / trust-policy / `PRE12-F43` |
| 10 FE/BE TODO 체크리스트 정합성 | 10 BE TODO의 G03/G05/G06 체크박스를 실제 완료 상태와 맞추는 문서 정리. 새 API 없음 | closed-by-BEFORE_12 |
| generic ExportJob/PDF | BE `ExportJob`/`/api/exports`는 현재 없음. FE 잔여 코드가 있어도 post-12 전 API를 열지 않음 | post-12-seed |
| Google Calendar 고급 sync/provider 확장 | 현재 API는 read-only sync와 selected calendar 관리만 제공한다. write/export/watch/reminders/attendee/multi-account/other provider는 새 API contract 필요 | post-12-seed / `PRE12-F10` |
| 11 Admin 문서 체크리스트 정합성 | 11 BE/API TODO와 goal index를 실제 완료 상태와 맞추는 문서 정리. 새 API 없음 | closed-by-BEFORE_12 |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge | Admin restore mutation, payment recovery API, purge/hard delete API 기준 필요 | billing-blocked / recovery-policy |
| User data export artifact/download | artifact 생성 processor, storage signed URL, download controller, file TTL/ownership/audit 기준 필요 | post-12-seed / `PRE12-F09` 연결 |
| 자동 민감정보 감지 | PII/DLP detection 위치, 오탐/누락 처리, audit/redaction 기준 필요 | defer / 정책 필요 |
| Admin direct domain data mutation and recovery action policy | 도메인별 Admin mutation, ownership, 사용자 통지, audit/result, rollback, redaction 기준 필요. 11 read-only records API를 재오픈하지 않는다 | defer / ops-policy / `PRE12-F44` |
| Customer/B2B tenant admin and organization admin model | tenant/org/member/role/permission API, customer admin auth boundary, billing/support boundary 기준 필요. 내부 AdminGuard 재사용 금지 | defer / B2B-strategy / `PRE12-F45` |

## 5. 권장 검색 명령

```powershell
rg -n "enum NotificationSourceType|model Notification|model UserNotificationSetting|model NotificationDeliveryAttempt" BE\prisma\schema.prisma
rg -n "NotificationSourceType|schedule.*reminder|deal.*reminder|NEXT_ACTION|MEETING_NOTE|FOLLOW_UP" BE\src -g "*.ts"
rg -n "@Controller" BE\src\modules\notification BE\src\modules\deal BE\src\modules\meeting-note BE\src\modules\follow-up -g "*.controller.ts"
rg -n "SUPPORTED_LOCALES|SUPPORTED_COUNTRY_CODES|SUPPORTED_CURRENCY_CODES|SUPPORTED_CONTACT_PHONE_COUNTRY_CODES|COMPANY_REGION_COUNTRY_CODES" BE\src -g "*.ts"
rg -n "ExternalAuthProvider|OAuthProvider|normalizeProvider" BE\src\modules\auth BE\src\shared -g "*.ts"
rg -n "ProductAnalyticsEvent|PRODUCT_ANALYTICS_CLIENT_EVENT_NAMES|PRODUCT_ANALYTICS_SERVER_EVENT_NAMES|PRODUCT_ANALYTICS_RESERVED_BILLING_EVENT_NAMES" BE\src\modules\analytics BE\prisma\schema.prisma
rg -n "AccountDeletionRequest|scheduledDeletionAt|user\.delete|account deletion" BE\src\modules BE\prisma\schema.prisma
rg -n "@Controller\(|@UseGuards\(|data-export-requests/.*/download|TrashRecoveryRequest|AdminOperationCheckRun" BE\src\modules\admin-operation BE\src\modules\account-request BE\src\modules\trash BE\prisma\schema.prisma
rg -n "@Post|@Patch|@Put|@Delete|domain-records|UserRole|TenantAdmin|CustomerAdmin|model Tenant|model Organization|tenantId" BE\src\modules\admin-operation BE\prisma\schema.prisma
```

## 6. 관련 문서

- `../COMMON/API-SPEC/README.md`
- `../COMMON/CANDIDATE-MATRIX.md`
- `../COMMON/GOAL-SPECS/G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/BE-TODO/API-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/BE-TODO/API-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC/AI_USAGE_ANALYTICS_CONTRACT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/BE-TODO/API-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
