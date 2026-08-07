# Candidate Matrix

상태: Draft
작성일: 2026-08-06
최종 업데이트: 2026-08-07

## 1. 목적

이 문서는 01~11 완료 슬롯 재대조에서 나온 후속 후보를 한 표로 관리한다. 이 표는 구현 지시가 아니라 분류 기준이다.

## 2. 후보 표

| ID | 후보 | 출처 | 현재 코드/문서 사실 | 기본 분류 | 다음 조치 |
| --- | --- | --- | --- | --- | --- |
| PRE12-F01 | 다음 행동 reminder | 02 제외, 06에서 재설계 언급 | Notification source는 `SCHEDULE`, `DEAL`만 있다. 06의 다음 행동 범위는 Notification reminder가 아니라 DealActivity `NEXT_ACTION_CREATED/COMPLETION_CHANGED` 기록이다. | Question | G00에서 12 전 처리 여부 결정. 결정 전 구현 금지. |
| PRE12-F02 | 회의록 follow-up reminder | 02 제외, 07에서 후속 언급 | 07은 follow-up draft만 만들고 자동 발송/알림/DB 저장을 제외했다. | post-12-seed | G03에서 계약 후보만 정리. 구현 금지. |
| PRE12-F03 | MeetingNote follow-up 자동 발송 | 05/07 후속 | 05는 사용자가 확인/수정한 뒤 즉시 발송하는 follow-up delivery를 제공한다. 07은 초안만 반환한다. | post-12-seed | 자동 발송 정책, 수신 동의, retry, 취소, 알림 정책 필요. |
| PRE12-F04 | Gmail/Microsoft provider smoke | 05 G10 | Gmail/Microsoft API adapter, token refresh, reconnect-required, send-only scope, smoke allowlist, safe failure, FE reconnect CTA는 구현 및 자동 검증이 완료됐다. 운영 credential/callback/allowlist 실제 수신자 smoke는 미실행 상태다. | pre-12-follow-up-needed | G05에서 운영 smoke 실행 조건과 결과 기록. 코드 구현 후보가 아니다. |
| PRE12-F05 | SMS 실제 provider | 05 G10 제외 | SMS sender verification UI/API foundation과 `SmsSenderNumber`는 있으나 `ConfigurableFollowUpSmsDeliveryProvider`는 test-sms/non-configured 상태다. 실제 SMS vendor 연동은 제외됐다. | post-12-seed | SMS 비용, 국가, 발신자 정책 결정 후 별도 계획. |
| PRE12-F06 | Follow-up delivery 고급 provider/growth 확장 | 05 G10 제외, NEXT/USER gap | G10은 Gmail/Microsoft plain text send adapter만 닫는다. B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송, SMTP 직접 설정, external email SaaS provider, HTML email, 첨부파일, tracking pixel은 없다. | post-12-seed | Growth/B2B/compliance/privacy/cost 정책 후 별도 계획. |
| PRE12-F07 | Company/Contact/Product latest summary | NBA-003 잔여, 06 제외 | 06은 Deal list `latestActivity`만 완료했다. 2026-08-06 A 결정으로 06 완료 범위를 재오픈하지 않는다. | defer | 12 전 G04 계약화와 구현은 하지 않는다. post-12 B2B/team CRM strategy seed로 재검토한다. |
| PRE12-F08 | MeetingNote list latest/next summary | NBA-004 잔여, 07 제외 | 07은 상세 next action/follow-up draft만 완료했다. list response에는 `latestSummary`, `nextActionSummary`가 없다. | post-12-seed | 12 전 구현하지 않는다. raw text 제외 계약은 post-12 필요성이 확인될 때만 만든다. |
| PRE12-F09 | generic ExportJob/PDF | 03/11 후속, 10 재대조 | 03은 sync Excel만 완료했고 generic ExportJob/PDF는 제외됐다. 실제 BE `ExportJob`/`/api/exports` 구현은 없고 `/app/export`는 `/app`으로 redirect된다. 다만 FE에는 `ExportScreen`, `/api/exports` client/hook/type 잔여 코드가 남아 있다. | post-12-seed | Trust/policy, file TTL, audit, Admin queue와 함께 재검토. post-12 전에는 FE 잔여 코드를 활성 route/API로 연결하지 않는다. |
| PRE12-F10 | Google Calendar 고급 sync/provider 확장 | 03/04 후속, NEXT/USER gap | 04는 Google read-only import/sync, calendar 선택, source badge, Trash restore, Google-origin reminder, provider smoke까지 완료했다. 실제 코드도 `ExternalCalendarProvider=GOOGLE`, 사용자당 `@@unique([userId, provider])`, `calendar.readonly` scope 기준이며 Google export/write/양방향 sync, realtime webhook/watch, 반복 일정 정식 모델, Google reminders import, 참석자/contact auto-link, 여러 Google 계정, Google Calendar 외 provider는 없다. | post-12-seed | Calendar write 권한, conflict resolution, event ownership, recurrence/reminder/attendee/contact mapping, multi-account identity, provider abstraction, privacy/redaction, 운영 quota 정책을 별도 계약으로 만든다. |
| PRE12-F11 | backup/restore runbook/drill | NBA-014/data reliability | 11 Admin system gate는 운영 결과 기록이지 shell 실행/운영 drill runbook이 아니다. | post-12-seed | 운영 절차 문서로 승격할지 재검토. |
| PRE12-F12 | billing/subscription/tax/paywall/churn/paid conversion/AI usage billing source | 05/08/09/11/12 연결 | 05는 `AiProviderCallLog`와 `FollowUpDeliveryAttempt`의 내부 cost 추정 필드만 남기고 사용자-facing cost, plan, quota, paywall, entitlement를 만들지 않았다. 08은 국가/통화/주소의 1차 데이터 모델만 닫고 결제 국가, 세금, 환불, chargeback, invoice, failed payment recovery는 12 범위로 넘겼다. 09는 reserved taxonomy와 Admin 참고용 AI usage summary만 완료했다. `AiUsageDaily`, `UsageMeter`, `BillingEvent`, `UserSubscription`, `ChurnSurveyResponse`는 만들지 않았고 11도 billing 지표나 Billing Admin을 표시하지 않는다. | billing-blocked | 12 전 구현 금지. 12에서 plan/payment/subscription/tax/refund/invoice/failed payment와 05/09 cost/usage 기반 billing source-of-truth를 함께 확정한다. |
| PRE12-F13 | Import scale/source/Admin 확장 | 01 제외 | 01은 회사/담당자/제품/딜 import와 10MB/5,000 data row 제한, 보관/삭제/복구 기준으로 완료됐다. 대용량 worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 01 최종형 밖이다. | post-12-seed | 12 전 구현하지 않는다. post-12 product scale/Admin ops/import source 전략에서 새 TODO 승격 여부를 판단한다. |
| PRE12-F14 | AI data cleanup 제안 저장/적용 | 07 제외, USER_WEB productization gap | 07은 data cleanup suggestion을 1차 제외했다. 05 AI weekly report에는 저장형 report suggestion이 있으나 MeetingNote cleanup 적용 흐름은 없다. | post-12-seed / 별도 data quality 계획 | 09 Product Analytics 또는 별도 data quality TODO에서 권한, 적용, 감사 로그, rollback 기준을 먼저 정한다. |
| PRE12-F15 | MeetingNote transcript/raw provider response/follow-up draft 저장 | NBA-011 원본 후보, 07 명시 제외 | 07은 전용 transcript/follow-up draft/raw provider response table을 만들지 않고 공통 `AiProviderCallLog` safe metadata만 남긴다. | defer / 정책 필요 | retention, 삭제권, raw access audit, redaction 정책 없이는 구현 금지. |
| PRE12-F16 | MeetingNote Admin/internal provider audit 조회 | NBA-011, USER_WEB gap | Admin provider failure 조회와 raw access audit 기준은 11 Admin Operation에서 완료됐다. | done | 07 또는 PRE12에서 재구현하지 않는다. 11 완료 문서를 참조한다. |
| PRE12-F17 | `/app` `ja`, `zh-TW` 번역과 시장별 UX writing | 08 제외, USER_WEB productization gap | public/auth는 `ja`, `zh-TW` locale URL/copy가 있지만 `/app` i18n은 `ko-KR`, `en`만 지원한다. | post-12-seed | 일본/대만 판매 준비 goal에서 시장, 용어, QA 범위를 확정한 뒤 진행한다. |
| PRE12-F18 | `zh-CN` 중국 본토 지원 | 08 결정 로그 | 08은 `zh-CN`을 현재 글로벌 후보로 보지 않았다. 코드도 `/app` locale에 `zh-CN`을 포함하지 않는다. | defer / 시장 진입 결정 필요 | 중국 본토 시장, 인프라, 정책, 결제/세금 기준이 정해지기 전 구현 금지. |
| PRE12-F19 | 전 세계 국가/통화/전화번호 확장 | 08 제외, USER_WEB/NEXT backlog | 현재 Backend/Frontend는 `KR/US`, `KRW/USD`, `ko-KR/en`으로 좁혀져 있다. | post-12-seed | 실제 판매 국가와 운영 지원 국가를 확정한 뒤 country/currency/phone dictionary와 migration 전략을 새 TODO로 만든다. |
| PRE12-F20 | USD cent/minor unit과 금액 정밀도 | 08 제외 | Product/Deal 금액은 `Int` 정수와 `currencyCode`를 사용한다. export/report도 정수 금액 정책을 따른다. | billing-blocked / amount-precision 후속 | 12 Billing money model, invoice/tax 표시, 기존 금액 migration 기준이 정해지기 전 구현 금지. |
| PRE12-F21 | 국가별 상세 주소 검증 | 08 제외, USER_WEB productization gap | Company는 free address와 KR/US region code만 사용한다. Contact 주소는 없다. | billing-blocked / post-12-seed | 세금/약관/청구 주소 또는 주소 품질 요구가 확정될 때 validation과 UX를 설계한다. |
| PRE12-F22 | Contact 개인 주소 | 08 결정 로그 | 08은 Company에만 주소/지역을 적용했고 Contact에는 주소 필드를 추가하지 않았다. | post-12-seed / CRM 확장 | 개인 주소가 실제 CRM workflow 요구로 확정될 때 별도 Contact data expansion으로 판단한다. |
| PRE12-F23 | Auth strategy 확장 | 08 제외, NEXT backlog | 런타임 provider는 Google/LINE/Apple이다. 이메일/비밀번호, Microsoft login, Kakao runtime 복구는 없다. | defer / auth strategy 필요 | 보안, 계정 복구, 약관, provider 운영 정책을 확정하기 전 추가 provider 또는 password auth 구현 금지. |
| PRE12-F24 | `/app` locale route prefix | 08 guardrail | 현재 `/app` route는 locale prefix 없이 `/app/*`만 사용한다. public/auth locale routing과 app i18n은 분리돼 있다. | defer / guardrail | 새 라우팅 계약 없이 `/:locale/app` 또는 `/ko/app` 구조를 만들지 않는다. |
| PRE12-F25 | app i18n 직접 keying, OAuth 계정 라벨, bundle 최적화 polish | 08 G09/G10, 실제 FE 코드 재대조 | 핵심 `/app` 화면은 app i18n resource와 legacy static fallback으로 동작한다. Settings OAuth account label은 `line/apple`이 raw 값으로 보일 수 있고, Vite large chunk warning은 기존 후속으로 남았다. | post-12-seed / UXUI quality | 08 완료를 재오픈하지 않고 UX/UI 제품화 유지보수 또는 bundle optimization 계획에서 처리한다. |
| PRE12-F26 | account deletion 실제 hard delete/anonymization job | 05/09/11/trust 연결 | 05는 AI weekly full input snapshot과 follow-up subject/body 로그를 보관하고, 09는 삭제 요청 후 30일 유예와 user-linked analytics 삭제 기준을 세웠고 Prisma cascade도 준비돼 있다. 11은 계정 삭제 request/cancel/Admin queue를 구현했지만 실제 hard delete/anonymization processor는 제외했다. | Question / 정책 필요 | privacy/legal/session revoke/access block/billing 영향과 AI report/follow-up delivery permanent log retention을 결정하기 전 구현 금지. 실제 job 계약이 생기면 05/09/11 기준을 함께 재대조한다. |
| PRE12-F27 | Product analytics 세부 event 확장 | 09 Decision Log, 10/11/12 연결 | 09 runtime taxonomy는 최소 core event와 10 mobile field-use event까지다. Notification delivery/click/reach, Google Calendar sync detail, AI weekly/follow-up delivery detail event는 runtime allowlist에 없다. | post-12-seed / 별도 analytics 계획 | 02/04/05/10/11/12 완료 의미를 침범하지 않고 별도 analytics event taxonomy 계약에서만 추가한다. |
| PRE12-F28 | 외부 analytics provider forwarding | 09 Scope/Decision | 현재 source-of-truth는 자체 DB `ProductAnalyticsEvent`다. Segment/PostHog/Mixpanel/GA forwarding port, adapter, runtime call은 구현돼 있지 않다. | post-12-seed / growth/ops | 12 이후 growth/ops 요구와 privacy/DPA 기준이 확인될 때 provider adapter 계획으로 승격한다. 자체 DB 정본은 유지한다. |
| PRE12-F29 | public site/UTM/ad attribution/growth experiment | 09/10/NEXT/USER_WEB gap | 09는 core `/app` route view만 수집하고 public site, UTM, ad attribution을 제외했다. `ExperimentAssignment`와 `/api/experiments/assignments`도 만들지 않았다. | post-12-seed / growth/marketing | marketing attribution, experiment assignment model/API, public route analytics는 별도 growth 계획에서 다룬다. |
| PRE12-F30 | PWA/native packaging과 install attribution | 09 후속, 10 완료/제외 | 10은 모바일 브라우저 field-use event와 UX를 완료했지만 PWA install/offline shell/full offline sync, iOS/Android native app, native push/contact/calendar, native install attribution은 완료 범위가 아니었다. | post-12-seed / 별도 mobile roadmap | 10을 재오픈하지 않고 mobile roadmap에서 PWA/offline/native packaging, native bridge, install attribution 계약을 만든다. |
| PRE12-F31 | 10 Mobile Field Use 문서 체크리스트 정합성 | 10 재대조 | 10 `README`, `GOAL-COMPLETION-CHECKLIST`, G07 closeout과 실제 BE/FE 코드는 완료를 가리킨다. 하지만 `10/FE-TODO/USER-WEB-TODO.md`의 G03~G06과 `10/BE-TODO/API-TODO.md`의 G03/G05/G06 구현 체크박스가 미완료로 남아 있다. | pre-12-doc-cleanup | 10을 기능 미완성으로 재오픈하지 않는다. 문서 체크리스트만 실제 완료 상태와 맞춘다. |
| PRE12-F32 | User Web route/architecture 문서 정합성 | 10 재대조, 실제 FE router | 실제 `FE/user-web/src/app/router/router.tsx`에는 `/app/notifications` route가 활성이고 `/app/export`만 `/app`으로 redirect된다. `FE/ARCHITECTURE.md`와 `FE/user-web/ARCHITECTURE.md`는 `/app/notifications`도 redirect라고 적고 있어 stale이다. | pre-12-doc-cleanup | 실제 route 기준으로 architecture 문서를 정정한다. 문서에 맞추기 위해 `/app/notifications`를 숨기지 않는다. |
| PRE12-F33 | 11 Admin Operation 문서 체크리스트/goal index 정합성 | 11 재대조 | 11 `README`, G10 closeout, 개별 goal spec, 실제 BE/FE 코드는 완료를 가리킨다. 하지만 `11/COMMON/GOAL-COMPLETION-CHECKLIST`, `11/COMMON/GOAL-SPECS/README`, `11/BE-TODO`, `11/FE-TODO`는 planning/미체크 상태가 일부 남아 있다. | pre-12-doc-cleanup | 11을 기능 미완성으로 재오픈하지 않는다. 문서 체크리스트와 goal index를 실제 완료 상태와 맞춘다. |
| PRE12-F34 | Admin Web architecture/legacy route 정합성 | 11 재대조, 실제 Admin Web router/code | 실제 `FE/admin-web/src/app/router/router.tsx`에는 11 Admin 운영 route가 활성화되어 있다. `/subscriptions`, `/organizations`, `/support`는 redirect이고 메뉴에 billing/subscription은 없다. `FE/admin-web/ARCHITECTURE.md`는 대부분 redirect와 `/admin/api/me`만 연동이라고 적고 있어 stale이다. 또한 `features/admin-query`, `pages/dashboard`, `pages/organizations`에는 현재 router/API 계약과 맞지 않는 legacy 잔여 코드가 일부 있다. | pre-12-doc-cleanup | 실제 Admin route/API 기준으로 architecture 문서와 비활성 legacy 잔여 코드를 정리한다. 문서에 맞추기 위해 Admin route를 숨기거나 legacy API path를 활성화하지 않는다. |
| PRE12-F35 | Admin 직접 Trash 복구 실행/유료 복구/Trash hard delete/purge | NEXT/USER gap, 11 제외 | 11은 User self-restore, 만료 row 유지, User 복구 문의, Admin recovery queue까지 완료했다. Admin restore mutation, paid recovery 결제, Trash hard delete/purge는 없다. | Question / 정책 및 billing 필요 | recovery policy, 결제/환불 영향, private memo/redaction, audit, rollback 기준이 확정되기 전 구현 금지. 12 Billing 이후 별도 recovery/ops goal로 판단한다. |
| PRE12-F36 | User data export artifact 생성/download endpoint | 11 G08, USER_WEB export gap, `PRE12-F09` 연결 | 11은 `UserDataExportRequest` 요청/상태 조회와 Admin queue를 구현했다. 실제 artifact 생성 processor, storage signed URL provider, download controller는 없다. 응답 mapper는 artifact가 준비된 경우의 `downloadUrl`만 표현한다. | post-12-seed / `PRE12-F09` 연결 | ExportJob/file TTL/ownership/audit/Admin queue 계약과 함께 재검토한다. post-12 전에는 download endpoint나 artifact processor를 열지 않는다. |
| PRE12-F37 | 자동 민감정보 감지 | NEXT_BACKEND 잔여, Global coverage | 11은 masking, raw access reason, audit/sensitive log를 완료했지만 자동 PII/sensitive detection은 구현하지 않았다. `GLOBAL` coverage에는 후속 별도 결정으로 남아 있다. | defer / 정책 필요 | 보안/data governance, 오탐/누락 처리, raw access audit, 사용자 권리와 retention 기준 확정 전 구현 금지. |
| PRE12-F38 | Notification 데이터 TTL/cleanup | 02 `SCOPE.md` 보관 후보, 실제 notification module 재대조 | 02는 일정/딜 reminder, in-app/email/browser push, provider smoke까지 완료했다. 다만 `Notification` 90일, `NotificationDeliveryAttempt` 30일, revoked `BrowserPushSubscription` 90일 보관 후보는 cleanup runner/use case/API로 구현되어 있지 않다. | post-12-seed / trust-ops policy | 알림 이력 보존, 사용자 표시 기간, provider failure 운영 조회, 계정 삭제 실제 처리와 충돌하지 않도록 TTL/cleanup 계약을 먼저 만든다. 02 완료 의미를 재오픈하지 않고 정책 확정 전 구현 금지. |
| PRE12-F39 | DealActivity lifecycle/search/score 확장 | 06 제외, NEXT/USER gap, 06 실제 코드 재대조 | 06은 `DealActivity` model/repo/API, 자동 event, manual create/update, Deal list products/latestActivity, Contact dealCount, page size 15를 완료했다. 수동 activity delete API/UI, 자동 activity update/delete, `DealActivity` soft delete/trash/restore/retention/audit, memo/private memo timeline 통합, 모든 도메인 공통 activity bus, 고급 검색/필터, 딜 score, AI activity 자동 판단, summary cache/denormalized latest는 구현되어 있지 않다. | post-12-seed / trust-product policy | activity 삭제/보존/감사 정책, record별 activity ownership, search/filter contract, score/AI 판단 근거, 성능 cache 필요성을 post-12 전략에서 확정한다. 06 완료 의미를 재오픈하지 않고 정책/계약 전 구현 금지. |
| PRE12-F40 | MeetingNote AI 후보 자동 업무 mutation | 07 제외, NEXT/USER gap, 05/07 guardrail | 07은 next action/follow-up draft 후보만 반환하고 사용자가 확인한 뒤 기존 Deal following-action API 또는 복사 흐름으로 처리한다. AI 후보 자동 저장, 자동 일정 생성, 자동 딜 변경, Contact/MeetingNote/Deal 자동 변경 API/worker는 없다. 05 AI weekly suggestion도 원본 record를 자동 변경하지 않는다. | post-12-seed / AI policy | 권한, 명시적 동의, confidence 기준, diff/undo/rollback, audit, notification/cost 정책 확정 전 구현 금지. |

## 3. 06과 직접 충돌하는 후보

아래 후보는 06 작업에 끼워 조정하면 안 된다.

| 후보 | 06에서 가능한 것 | 06에서 금지 |
| --- | --- | --- |
| 다음 행동 reminder | 다음 행동 생성/완료 변경을 DealActivity로 기록 | Notification scheduling, due processor, reminder setting 추가 |
| 회의록 follow-up reminder | 회의록 연결/해제를 DealActivity로 기록 | MeetingNote 기반 Notification 생성 |
| follow-up sent/failed | Deal target follow-up delivery attempt를 safe summary로 기록 | follow-up body 전체, provider raw, 연락처 원문을 summary/log에 저장 |
| record summary | Deal list `latestActivity` 유지 | Company/Contact/Product/MeetingNote list summary를 몰래 추가 |
| DealActivity lifecycle/search/score | timeline 조회, manual create/update, 자동 event 기록 유지 | manual delete, auto activity edit/delete, soft delete/trash/restore/retention/audit, memo 통합, 공통 activity bus, 고급 검색/필터, 딜 score, AI 자동 판단, summary cache 추가 |

## 4. 07과 직접 충돌하는 후보

아래 후보는 07 완료 범위를 넓히지 않고 PRE12 후보로만 남긴다.

| 후보 | 07에서 완료된 것 | 07/PRE12에서 금지 |
| --- | --- | --- |
| MeetingNote list summary | 상세 next action/follow-up draft | list `latestSummary`, `nextActionSummary` API/FE 추가 |
| follow-up reminder/자동 발송 | 사용자가 확인/수정/복사하는 follow-up draft | 자동 발송, 자동 알림, draft 저장 상태 추가 |
| AI data cleanup | provider log와 safe draft UX | cleanup suggestion 저장/적용 API 추가 |
| transcript/raw storage | STT transcript 임시 표시, safe metadata log | transcript/raw provider response/follow-up draft table 추가 |
| Admin provider audit | 11 Admin Operation에서 완료 | 07 또는 PRE12에서 Admin audit를 재구현 |
| AI 후보 자동 업무 mutation | 후보 생성과 사용자 확인 후 기존 API/복사 흐름 | 자동 일정 생성, 자동 딜 변경, Contact/MeetingNote/Deal 자동 변경, AI suggestion 자동 적용 |

## 5. 08과 직접 충돌하는 후보

아래 후보는 08 완료 범위를 넓히지 않고 PRE12 후보 또는 guardrail로만 남긴다.

| 후보 | 08에서 완료된 것 | 08/PRE12에서 금지 |
| --- | --- | --- |
| app locale 확장 | `/app` `ko-KR`, `en` i18n foundation/resource/formatter와 legacy static fallback | `ja`, `zh-TW`, `zh-CN`을 08 완료 범위로 끼워 넣기 |
| 글로벌 데이터 확장 | User global settings, KR/US phone/region, KRW/USD currency | 전 세계 country/currency/phone dictionary를 계약 없이 추가 |
| 금액 정밀도 | Product/Deal `Int` 금액과 `currencyCode` | 12 money model 없이 USD cent/minor unit migration 추가 |
| 주소/세금/가격 정책 | Company free address와 KR/US region code | 국가별 tax/terms/pricing/address validation을 08 후속으로 우회 구현 |
| auth provider | Google/LINE/Apple runtime provider와 Kakao legacy 호환 | 이메일/비밀번호, Microsoft, Kakao runtime 복구, 신규 provider 추가 |
| app route | `/app/*` 고정 route | `/app` locale prefix 추가 |

## 6. 09와 직접 충돌하는 후보

아래 후보는 09 Product Analytics foundation을 재오픈하지 않고 PRE12 후보 또는 후속 analytics/mobile/trust 계획으로만 남긴다.

| 후보 | 09/10/11에서 완료된 것 | 09/PRE12에서 금지 |
| --- | --- | --- |
| account deletion 실제 처리 | 09 schema/cascade 기준과 11 request/cancel/Admin queue | 실제 hard delete/anonymization job을 정책 없이 추가 |
| 세부 analytics event | 09 core events, 10 mobile field-use, 11 Admin overview | Notification/Calendar/follow-up click/reach/sync/detail event를 몰래 runtime allowlist에 추가 |
| external provider | 자체 DB `ProductAnalyticsEvent` source of truth | provider forwarding port/adapter/runtime call 추가 |
| attribution/experiment | core `/app` routeKey와 billing reserved taxonomy | public route/UTM/ad attribution/experiment assignment API/model 추가 |
| PWA/native attribution | mobile browser field-use events | PWA install/offline/full offline sync/native app/native push/contact/calendar/native install attribution을 09 완료 범위로 끼워 넣기 |

## 7. 10과 직접 충돌하는 후보

아래 후보는 10 Mobile PWA Field Use 완료 범위를 넓히지 않고 PRE12 후보 또는 문서 정리 후보로만 남긴다.

| 후보 | 10에서 완료된 것 | 10/PRE12에서 금지 |
| --- | --- | --- |
| PWA/native packaging | mobile browser field-use, browser push permission UX, mobile field analytics | manifest/offline shell/full offline sync/native app/native push/contact/calendar bridge를 10 완료 범위로 끼워 넣기 |
| server draft/media/raw 저장 | FE local draft 24시간 TTL, server draft DB 미생성, media/raw 저장 금지 | `UserDraft`, `/api/drafts/*`, audio/image binary, transcript 전문, provider raw 저장 추가 |
| generic ExportJob/PDF | `/app/export` redirect 유지, BE `ExportJob`/`/api/exports` 미구현 | FE 잔여 `ExportScreen`을 route/API에 연결하거나 BE `ExportJob`을 10 후속처럼 구현 |
| 10 문서 체크리스트 | 10 README/G07 closeout/코드 기준 완료 | FE/BE TODO 미체크를 근거로 10 기능을 재구현 |
| User Web route architecture | 실제 `/app/notifications` 활성, `/app/export` redirect | stale architecture 문서에 맞추기 위해 `/app/notifications`를 숨김 route로 되돌리기 |

## 8. 11과 직접 충돌하는 후보

아래 후보는 11 Admin Operation 완료 범위를 넓히지 않고 PRE12 후보 또는 문서 정리 후보로만 남긴다.

| 후보 | 11에서 완료된 것 | 11/PRE12에서 금지 |
| --- | --- | --- |
| Admin 문서 체크리스트 | 11 README/G10 closeout/개별 goal spec/실제 코드 기준 완료 | stale checklist나 planning status를 근거로 11 기능 재구현 |
| Admin Web architecture | 실제 11 Admin route/API 활성, `/subscriptions` redirect | stale architecture 문서에 맞춰 실제 Admin route/API를 숨기거나 되돌리기 |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge | User self-restore, 만료 row 유지, User 복구 문의, Admin recovery queue | Admin restore mutation, paid recovery payment, Trash hard delete/purge 추가 |
| Data export artifact/download | data export request/status/Admin queue | ExportJob/file retention 계약 없이 artifact processor/download endpoint 추가 |
| 자동 민감정보 감지 | masking, raw access reason, append-only audit/sensitive log | 정책 없이 PII/DLP 자동 탐지 model/processor 추가 |

## 9. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/README.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/SOURCE-PLAN-COVERAGE.md`
- `FE/ARCHITECTURE.md`
- `FE/admin-web/ARCHITECTURE.md`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/user-web/ARCHITECTURE.md`
- `FE/user-web/src/app/router/router.tsx`
