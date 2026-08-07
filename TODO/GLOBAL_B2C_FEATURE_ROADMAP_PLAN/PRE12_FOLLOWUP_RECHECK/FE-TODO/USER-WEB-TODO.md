# User Web Todo

상태: Draft / confirmed User Web 작업 없음
작성일: 2026-08-06
최종 업데이트: 2026-08-07

## 1. 목적

이 문서는 후속 후보가 User Web에 어떤 영향을 줄 수 있는지 기록한다. 현재 이 계획만으로 새 화면, route, API client, state를 만들지 않는다.

## 2. 현재 기준

| 영역 | 현재 기준 |
| --- | --- |
| Notification | `/app/notifications`, notification settings, browser push 설정은 02 범위로 완료됐다. |
| Weekly report | `/app/schedules/week`와 Excel export는 03 범위로 완료됐다. |
| Google Calendar | `/app/schedules`, `/app/settings`, schedule detail source badge/sync/status는 04 범위로 완료됐다. Google export/write/watch/reminders/attendee/multi-account/other provider UI는 없다. |
| AI weekly report/follow-up | `/app/schedules/week` AI report section, `/app/settings` follow-up delivery settings, compose/send/retry/timeline UX는 05 범위로 구현됐다. SMS 실제 provider, B2B sender/email sync/sequence/campaign/unsubscribe UI는 없다. |
| DealActivity | deal list products/latestActivity, deal detail activity timeline, manual create/update UI는 06 범위로 완료됐다. manual delete/restore, memo/private memo 통합, all-domain activity bus, advanced search/filter, score, AI activity 자동 판단 UI는 없다. |
| MeetingNote AI | meeting note detail AI next action/follow-up draft section, 후보 편집 후 existing Deal following-action 저장, follow-up draft 수정/복사는 07 범위로 완료됐다. STT transcript는 생성 흐름의 임시 확인용이고 저장/목록/상세 summary 대상이 아니다. |
| Import | `/app/import` review/resume, row detail 만료 안내, 10MB/5,000행 제한 안내는 01 범위로 완료됐다. |
| Global Data I18N | `/app` `ko-KR/en`, Settings global profile, Product/Deal currency, Contact KR/US phone, Company KR/US region/address, Import/Export localization, Google/LINE/Apple auth는 08 범위로 완료됐다. |
| Product Analytics | User Web analytics helper, `/app` route view hook, mobile field-use client event, `VITE_PRODUCT_ANALYTICS_ENABLED` gate가 있다. analytics 실패는 사용자-facing UI로 표시하지 않는다. |
| Mobile Field Use | BusinessCard native file/camera picker capture/OCR safe failure, MeetingNote recording/STT fallback, FE local draft 24시간 TTL, `/app/notifications` browser push permission UX, mobile field analytics는 10 범위로 완료됐다. `/app/export`는 `/app`으로 redirect된다. |
| Admin Operation 영향 | `/app/trash` 만료 row/복구 문의와 `/app/settings` account deletion/data export request UI는 11에서 완료됐다. User Web은 `/admin/api/*`를 호출하지 않는다. |

## 3. 구현 금지

G00과 API contract 확정 전에는 아래 User Web 변경을 하지 않는다.

- 다음 행동 reminder 설정 UI 추가
- MeetingNote follow-up reminder UI 추가
- follow-up 자동 발송 toggle 추가
- MeetingNote AI 후보 자동 저장/자동 적용 toggle, 자동 일정 생성/딜 변경 UI 추가
- AI weekly report 자동 생성/AI suggestion 자동 mutation UI 추가
- Follow-up delivery SMS 실제 provider, B2B tenant sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송, SMTP/external email SaaS, HTML/첨부/tracking UI 추가
- Notification TTL/cleanup 정책 확정 전 알림 이력 자동 삭제 안내, 보관 기간 설정 UI, Admin cleanup UI 추가
- Company/Contact/Product latest summary를 API 없이 FE에서 조합 표시
- DealActivity manual delete/restore UI, activity retention/audit/trash UX, memo/private memo activity 통합, all-domain activity bus, advanced search/filter, deal score, AI activity 자동 판단, summary cache fallback UI 추가
- MeetingNote list latest/next summary를 API 없이 FE에서 조합 표시
- AI data cleanup 제안 저장/적용 UI 추가
- transcript 원문, follow-up draft 저장 상태, provider raw response를 User Web에 표시
- 대용량 import worker UI 추가
- 일정/회의록 import source UI 추가
- ImportJob Admin 전용 화면 추가
- generic ExportJob/PDF/export route 추가
- Google Calendar export/write/양방향 sync/watch/recurrence/reminders/attendee/multi-account/other provider UI 추가
- billing/subscription/plan/payment/invoice/refund/failed payment/tax/paywall/churn UI 추가
- `/app` `ja`, `zh-TW`, `zh-CN` translation 추가
- `/app` locale route prefix 추가
- 전 세계 country/currency/phone option 추가
- Product/Deal amount minor unit 입력 전환
- 국가별 상세 주소 validation UI 또는 Contact 개인 주소 UI 추가
- email/password, Microsoft, Kakao runtime, 신규 auth provider 버튼 추가
- account deletion 실제 hard delete/anonymization 실행 UI 추가
- Notification/Calendar/follow-up 세부 analytics event를 화면별로 임의 추가
- 외부 analytics provider SDK/script 삽입
- public site/UTM/ad attribution, campaign attribution, experiment assignment UI 추가
- marketing opt-in/communication consent policy UI 추가
- billing/subscription/tax/refund/invoice/paywall/churn/AI quota 사용량 UI를 12 전 추가
- PWA install/offline shell/full offline sync/native app/native push/contact/calendar/native install attribution UI 추가
- BusinessCard 전용 `getUserMedia`, custom camera preview/crop/canvas capture flow를 `PRE12-F42` 계약 없이 추가
- `UserDraft`, server draft DB, audio/image binary, transcript/provider raw 저장 UX를 `PRE12-F43` 정책 없이 추가
- FE에 남은 `ExportScreen`/`/api/exports` 잔여 코드를 `/app/export` 활성 route로 연결
- stale FE architecture 문서에 맞추기 위해 `/app/notifications`를 redirect로 되돌림
- Admin 직접 Trash 복구/유료 복구/hard delete/purge UI를 User Web에서 우회 표시
- Admin 직접 도메인 데이터 수정/복구 action을 User Web에서 운영자 대행 기능처럼 우회 표시
- Customer/B2B tenant admin, organization/member/role 관리 UI를 tenant 전략 없이 User Web에 추가
- data export artifact 생성/download UI를 실제 file job/download contract 없이 활성화
- 자동 민감정보 감지 결과나 raw access 상태를 User Web에 표시

2026-08-06 A 결정에 따라 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 User Web 작업으로 올리지 않는다. UX/UI 전체 polish는 별도 전면 유지보수 계획에서 다룬다.

06 재대조 기준으로 deal detail timeline, manual create/update, Deal list products/latestActivity, Contact dealCount, page size 15는 완료다. activity 삭제/보존/감사, memo 통합, 공통 activity bus, 고급 검색/필터, score, AI 자동 판단, summary cache/fallback UI는 `PRE12-F39` 후속 후보로만 두고 06 미완성으로 재오픈하지 않는다.

07 재대조 기준으로 meeting note detail AI 후속 작업 section, next action 후보 편집/저장 흐름, follow-up draft 수정/복사 UX는 완료다. MeetingNote list latest/next summary, follow-up reminder/자동 발송 UI, AI data cleanup 적용 UI, transcript/raw/follow-up draft 장기 보관 표시, AI 후보 자동 업무 mutation UI, Admin provider audit UI는 07 미완성이 아니라 `PRE12-F02`/`PRE12-F03`/`PRE12-F08`/`PRE12-F14`/`PRE12-F15`/`PRE12-F16`/`PRE12-F40` 기준으로만 판단한다.

08 재대조 기준으로 `/app` 기본 Global Data I18N은 완료다. market locale 확장, country/currency/phone 확장, auth strategy 확장, Settings OAuth 계정 라벨과 bundle 최적화는 08 blocker가 아니다. 첫 판매용 subscription/payment/tax/refund/invoice UI도 08 미완성이 아니라 12 Billing 계약 후속이다.

04 재대조 기준으로 User Web의 Google Calendar 범위는 read-only import/sync, calendar 선택, source badge/status, Trash restore, Google-origin reminder UX까지 완료다. Google export/write/양방향 sync, webhook/watch 상태 UI, 반복 일정 정식 모델, reminders/attendee import, 여러 Google 계정, Google 외 provider UX는 04 미완성이 아니라 `PRE12-F10` 후속 후보로만 둔다.

05 재대조 기준으로 `/app/schedules/week` AI report와 `/app/settings` follow-up delivery, compose/send/retry/timeline UX는 완료다. 운영 provider smoke는 화면 변경 없이 문서 기록으로만 닫고, SMS 실제 provider와 B2B/email growth 확장, 사용자-facing cost/paywall, 자동 생성/자동 mutation은 05 미완성이 아니라 후속 후보로 둔다.

09 재대조 기준으로 Product Analytics User Web foundation은 완료다. 신규 사용자-facing analytics 화면, external provider SDK, billing/paywall/churn UI, public attribution, marketing opt-in, PWA/native install flow는 09 미완성이 아니라 PRE12 후속 후보 또는 12 이후 계획으로 둔다.

10 재대조 기준으로 Mobile Field Use User Web 범위는 완료다. `10/FE-TODO/USER-WEB-TODO.md`의 G03~G06 미체크는 기능 미구현이 아니라 문서 체크리스트 정리 대상이며, `FE/ARCHITECTURE.md`와 `FE/user-web/ARCHITECTURE.md`의 `/app/notifications` stale 설명은 실제 router 기준으로 정정한다. 2차 재대조에서 `custom getUserMedia` 기반 BusinessCard preview/crop은 `PRE12-F42`, server draft/media raw storage는 `PRE12-F43`으로 분리한다.

11 재대조 기준으로 User Web 영향 범위는 `/app/trash` 만료 row/복구 문의와 `/app/settings` account deletion/data export request UI까지 완료다. 실제 account deletion hard delete/anonymization, data export artifact/download, Admin 직접 Trash 복구/유료 복구/hard delete/purge, Admin 직접 도메인 데이터 mutation, Customer/B2B tenant admin, 자동 민감정보 감지는 11 미완성이 아니라 정책/ExportJob/Billing/B2B 전략 이후 후속 후보로 둔다.

## 4. 후보별 FE 영향

| 후보 | 예상 FE 영향 | 현재 상태 |
| --- | --- | --- |
| 다음 행동 reminder | notification settings, next action form, deal detail 상태 표시 | Question |
| 회의록 follow-up reminder | meeting note detail/list, notification settings, follow-up draft 상태 표시 | post-12-seed |
| MeetingNote AI 후보 자동 업무 mutation | 자동 적용 CTA/toggle, 적용 전 diff, 확인 modal, undo/rollback 표시 기준 필요 | post-12-seed / `PRE12-F40` |
| Notification 데이터 TTL/cleanup | `/app/notifications` 표시 기간, 삭제된 알림 안내, provider failure 이력 노출 여부, 설정 UI 필요 여부 | post-12-seed / `PRE12-F38` |
| record summary | Company/Contact/Product/MeetingNote list item summary 위치와 empty fallback | Company/Contact/Product는 defer. 비고: post-12 B2B/team CRM strategy seed. MeetingNote list summary는 post-12-seed. |
| DealActivity lifecycle/search/score 확장 | activity delete/restore UX, retention/audit 표시, memo/private memo timeline 통합, all-domain activity feed, advanced filter/search, deal score/AI 판단 표시, summary cache/fallback UX 기준 필요 | post-12-seed / `PRE12-F39` |
| AI data cleanup | cleanup suggestion 확인/적용/되돌리기 UX, 적용 전 diff 표시 | post-12-seed / 별도 data quality 계획 |
| transcript/raw/follow-up draft 저장 표시 | transcript 보관 상태, raw access 안내, draft 저장/발송 상태 | defer / 정책 필요 |
| Import scale/source/Admin 확장 | 대용량 import progress, 일정/회의록 source mapping, Admin-only job cleanup/조회 화면 | post-12-seed |
| provider smoke | 화면 변경 없음. 운영 smoke 결과 문서 반영 | pre-12-follow-up-needed |
| Follow-up delivery 고급 provider/growth 확장 | SMS actual provider 상태, B2B sender, email sync/inbox import, sequence/campaign/bulk, unsubscribe, 예약 발송, SMTP/external SaaS, HTML/첨부/tracking UX 기준 필요 | post-12-seed / `PRE12-F05`/`PRE12-F06` |
| App locale/market UX 확장 | `/app` `ja`, `zh-TW` resource, validation/empty/toast copy, market UX writing QA | post-12-seed |
| `zh-CN` 지원 | public/auth/app locale, market routing, policy copy, 결제/세금/인프라 요구 확인 | defer / 시장 진입 결정 필요 |
| Global country/currency/phone 확장 | Settings option, Contact phone UI, Company region selector, Product/Deal currency selector 확장 | post-12-seed |
| amount precision/minor unit | 금액 입력/표시/import/export/report 호환 UX 변경 | billing-blocked |
| address/tax/terms/pricing policy | 청구 주소, 세금/약관/가격 표시 UX | billing-blocked |
| Contact personal address | Contact create/edit/detail/list/export UX 확장 | post-12-seed / CRM 확장 |
| Auth strategy 확장 | email/password, Microsoft, Kakao runtime, 신규 provider 버튼과 오류 UX | defer / 정책 필요 |
| `/app` locale route prefix | router, legacy redirect, auth callback, deep link 전체 변경 필요 | defer / guardrail |
| i18n/Settings/bundle polish | legacy static fallback 직접 keying, Settings OAuth account `LINE/Apple` 라벨, Vite chunk split | post-12-seed / UXUI quality |
| account deletion 실제 처리 | 삭제 예정 상태 표시, access block, session 종료, 처리 완료/실패 UX 기준 필요 | Question / 정책 필요 |
| Product analytics 세부 event 확장 | Notification/Calendar/follow-up 화면의 click/reach/sync/detail tracking 위치와 payload privacy 기준 필요 | post-12-seed / 별도 analytics 계획 |
| external analytics provider forwarding | FE SDK를 직접 넣을지, Backend forwarding만 사용할지, consent/banner/DNT 기준 결정 필요 | post-12-seed / growth/ops |
| public/UTM attribution/growth experiment | public/auth route attribution, campaign parameter 보존, experiment assignment 표시/노출 기준 필요 | post-12-seed / growth/marketing |
| Marketing opt-in/communication consent policy | account-level opt-in/withdrawal UI, campaign channel consent, preference display, consent audit copy 기준 필요. public contact form `marketingAgreement`와 follow-up consent modal은 대체물이 아니다 | billing-blocked / growth-compliance / `PRE12-F41` |
| Billing/subscription/tax/paywall UI | 05/09 내부 cost/usage 기록과 별개로 12의 plan/payment/subscription/tax/refund/invoice/failed payment, quota/paywall/upgrade contract와 API 필요 | billing-blocked / `PRE12-F12` |
| PWA/native packaging과 attribution | install prompt, offline shell/full offline sync, native app deep link, native push/contact/calendar bridge, install attribution UX 기준 필요 | post-12-seed / 별도 mobile roadmap |
| BusinessCard mobile advanced camera preview/crop | `getUserMedia`, camera preview, crop/retake, fallback, permission denial, accessibility/device QA 기준 필요. 10의 native file/camera picker를 임의 대체하지 않는다 | post-12-seed / mobile advanced capture / `PRE12-F42` |
| Server draft and media/raw storage policy | server-backed draft restore, blob/raw transcript 보관 표시, 삭제/만료/계정 삭제 UX 기준 필요. 10 local draft TTL 완료 범위와 분리한다 | defer / trust-policy / `PRE12-F43` |
| 10 FE/BE TODO 체크리스트 정합성 | 10 FE TODO의 G03~G06 체크박스를 실제 완료 상태와 맞추는 문서 정리 | pre-12-doc-cleanup |
| User Web route/architecture 문서 정합성 | 실제 router 기준 `/app/notifications` 활성, `/app/export` redirect 상태를 architecture 문서에 반영 | pre-12-doc-cleanup |
| FE generic ExportJob 잔여 코드 | `ExportScreen`, `/api/exports` client/hook/type을 post-12 전 dead code로 둘지 정리/주석화/삭제할지 판단 | post-12-seed |
| Google Calendar 고급 sync/provider 확장 | write/export, webhook/watch status, recurrence, Google reminders, attendee/contact auto-link, multi-account/provider 선택 UX 기준 필요 | post-12-seed / `PRE12-F10` |
| 11 Admin/User 영향 문서 정합성 | 11 User Web 영향 문서와 실제 `/app/trash`, `/app/settings`, `/admin/api/*` 차단 기준을 맞추는 문서 정리 | pre-12-doc-cleanup |
| User data export artifact/download | export request status UI 이후 실제 download 가능 상태, 만료, 실패 UX 기준 필요 | post-12-seed / `PRE12-F09` 연결 |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge | User Web에서는 요청/안내 UX만 가능하다. 실행/결제/삭제 정책은 별도 결정 필요 | Question / 정책 및 billing 필요 |
| Admin direct domain data mutation and recovery action policy | User Web에서는 운영자 대행 mutation을 직접 노출하지 않는다. 필요한 경우 사용자 확인/통지/감사/rollback UX 정책이 먼저 필요 | defer / ops-policy / `PRE12-F44` |
| Customer/B2B tenant admin and organization admin model | organization/member/role 관리 UI가 필요한지 B2B 전략, billing/support boundary, 권한 모델을 먼저 결정 | defer / B2B-strategy / `PRE12-F45` |

## 5. UX 기준

- list item에 없는 API 정보를 FE에서 사실처럼 만들지 않는다.
- reminder나 자동 발송처럼 사용자 신뢰에 영향을 주는 기능은 명시적 상태, 취소, 실패, 재시도 기준이 먼저 있어야 한다.
- 모바일에서는 table 확장이 아니라 card/list summary 기준을 우선 검토한다.
- private memo, meeting note raw text, follow-up body 전체를 list summary에 노출하지 않는다.
- transcript 원문과 provider raw response는 저장 정책이 확정되기 전까지 UI에 장기 보관 상태로 표현하지 않는다.
- public/auth locale이 있다고 해서 `/app` locale 지원이 완료된 것으로 간주하지 않는다.
- `/app` route는 새 routing contract 전까지 `/app/*`를 유지한다.
- analytics event는 payload allowlist와 privacy contract 없이 화면 컴포넌트에서 임의로 추가하지 않는다.
- analytics 실패는 사용자 작업을 막거나 toast/modal/banner로 노출하지 않는다.
- external analytics SDK/script는 consent/privacy/DPA 기준 없이 User Web에 삽입하지 않는다.
- marketing opt-in/communication consent는 12/growth/privacy 정책 없이 settings, notification, follow-up consent UI에 끼워 넣지 않는다.
- account deletion 실제 처리와 billing/paywall/churn은 12/정책 결정 전 표시하지 않는다.
- `/app/notifications`는 실제 구현된 route로 보고, stale 문서에 맞춰 숨기지 않는다.
- `/app/export`는 post-12 ExportJob 계약 전까지 활성화하지 않는다.
- data export download link는 실제 artifact/download contract 전까지 사용자에게 완료 상태로 노출하지 않는다.
- Trash 유료 복구나 Admin 직접 복구 실행을 User Web에서 결제/버튼 흐름으로 암시하지 않는다.

## 6. 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `../COMMON/CANDIDATE-MATRIX.md`
- `../COMMON/GOAL-SPECS/G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/FE-TODO/USER-WEB-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/USER-FLOW.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/FE-TODO/USER-WEB-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/FE-TODO/USER-WEB-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/FE-TODO/USER-WEB-TODO.md`
- `FE/user-web/src/lib/api-client.ts`
