# G10 09 Product Analytics Follow-up Defer Closeout

상태: Completed / 문서 closeout 완료 / 구현 금지
작성일: 2026-08-06
검토일: 2026-08-06

## 1. 목표

`09_PRODUCT_ANALYTICS`에서 완료한 Product Analytics foundation을 재오픈하지 않고, 09 밖으로 남은 후속 후보를 PRE12 후보로 분류한다.

이 goal은 구현 goal이 아니다. `BE`, `FE` 코드 변경, API 계약 확정, Prisma migration 생성, analytics runtime event 추가, 외부 provider SDK/adapter 추가는 하지 않는다.

2026-08-06 재대조 결과, `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`에는 있으나 09 또는 PRE12에 누락된 추가 후속 후보는 발견되지 않았다. 확인된 후속 후보는 `PRE12-F26`~`PRE12-F30` 또는 기존 `PRE12-F12`, `PRE12-F01`, `PRE12-F02`, `PRE12-F10`으로 이미 분류되어 있다.

2026-08-07 2차 재대조 결과, 원천 문서의 `Marketing opt-in`은 G11 금지 목록에만 있었고 PRE12 후보 ID가 없어 `PRE12-F41`로 추가 분리했다. 이는 09 analytics runtime이나 10 notification/browser push 완료 범위가 아니라 `TODO/PADDLE_PLAN`/growth/privacy 정책 이후의 communication consent 후보로 본다.

## 2. 판단 근거

대조 기준:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- 실제 코드: `BE`, `FE/user-web`, `FE/admin-web`

확인한 완료 사실:

| 범위 | 현재 사실 |
| --- | --- |
| analytics 정본 | 자체 DB `ProductAnalyticsEvent` model, migration, repository, collector API가 있다. 외부 provider forwarding은 없다. |
| client event | User Web analytics helper와 `/app` route view hook이 있다. 10 mobile field-use client event도 같은 foundation을 재사용한다. |
| server event | auth/deal/schedule/meeting-note/business-card/import/export 성공 지점에 `ProductAnalyticsEventRecorder`가 연결됐다. |
| privacy | analytics payload allowlist와 PII/raw text/provider raw response 금지 기준이 있다. analytics 실패는 제품 기능 성공을 막지 않는다. |
| snapshot/retention | activation snapshot, retention cohort aggregate, raw event 365일 purge use case가 있다. |
| account deletion 기준 | 09는 30일 유예 후 user-linked raw analytics event와 user-level snapshot 실제 삭제 기준을 세웠다. 11은 삭제 요청/취소/Admin queue를 구현했다. |
| AI usage | 09는 `AiProviderCallLog` 기반 Admin 참고용 AI usage summary를 만든다. `AiUsageDaily`와 `UsageMeter`는 없다. |
| billing reserved | paywall/trial/coupon/referral/subscription/churn event name은 reserved taxonomy에만 있고 runtime allowlist로 발생하지 않는다. |
| Admin analytics | 11에서 `/admin/api/analytics/overview`와 Admin Web `/analytics` overview가 구현됐다. billing/subscription 지표는 표시하지 않는다. |
| mobile field-use | 10에서 business card capture, meeting note recording, browser push permission 같은 mobile field-use event를 추가했다. PWA install/offline shell/full offline sync/native app/native push/contact/calendar는 후속이다. |

## 3. PRE12 후보 분류

| 후보 | PRE12 ID | 분류 | 판단 |
| --- | --- | --- | --- |
| billing/subscription/tax/paywall/churn/paid conversion/AI usage billing source | `PRE12-F12` | billing-blocked | 09는 reserved taxonomy와 Admin 참고용 AI usage summary만 완료했다. plan/payment/subscription/tax/refund/invoice/failed payment와 billing source-of-truth는 `TODO/PADDLE_PLAN`에서 `AiUsageDaily` 또는 `UsageMeter` 등으로 결정해야 한다. |
| account deletion 실제 hard delete/anonymization job | `PRE12-F26` | billing-blocked / trust-policy | 09/11은 삭제 기준과 queue를 만들었지만 실제 job은 없다. privacy/legal/session revoke/access block/billing 영향과 Paddle Billing의 subscription/refund/invoice/tax 보관 기준 결정 전 구현하지 않는다. |
| Product analytics 세부 event 확장 | `PRE12-F27` | 후속 seed / 별도 analytics 계획 | Notification delivery/click/reach, Google Calendar sync detail, AI weekly/follow-up delivery detail event는 09 최소 taxonomy 밖이다. |
| 외부 analytics provider forwarding | `PRE12-F28` | 후속 seed / growth/ops | 자체 DB 정본을 유지한다. Segment/PostHog/Mixpanel/GA류 provider port/adapter/runtime call은 09 대상이 아니다. |
| public site/UTM/ad attribution/growth experiment | `PRE12-F29` | 후속 seed / growth/marketing | 09는 core `/app` route view만 수집했다. public route, UTM/referrer/ad attribution, `ExperimentAssignment`는 후속이다. |
| PWA/native packaging과 install attribution | `PRE12-F30` | 후속 seed / 별도 mobile roadmap | 10은 mobile browser field-use까지 완료했다. PWA install/offline shell/full offline sync, iOS/Android native app, native push/contact/calendar, native install attribution은 후속이다. |
| Marketing opt-in/communication consent policy | `PRE12-F41` | billing-blocked / growth-compliance | 원천 문서에 남은 Marketing opt-in은 09 runtime event나 10 push permission UX가 아니다. `FollowUpConsentNotice`는 follow-up 발송 고지 확인이고 public contact form `marketingAgreement`는 lead submission field이므로 대체물이 아니다. |

## 4. 기존/신규 PRE12 후보로 연결할 항목

아래 항목은 09 재대조에서도 보이지만 새 후보로 중복 생성하지 않는다.

| 항목 | 기존 후보 | 판단 |
| --- | --- | --- |
| billing/subscription/tax/paywall/churn/paid conversion | `PRE12-F12` | 09 reserved taxonomy는 Paddle Billing 구현을 대신하지 않는다. |
| AI usage plan/quota/paywall source | `PRE12-F12` | 09 `AiProviderCallLog` summary는 Admin 참고용이다. `TODO/PADDLE_PLAN`에서 `AiUsageDaily`/`UsageMeter` 여부를 결정한다. |
| Notification reminder 기능 자체 | `PRE12-F01`, `PRE12-F02` | 09에서 새 알림 기능을 만들지 않는다. 필요한 것은 별도 세부 analytics event 후보 `PRE12-F27`뿐이다. |
| Google Calendar 고급 sync/provider 기능 자체 | `PRE12-F10` | 09는 Calendar sync detail event를 만들지 않는다. Calendar export/write/watch/recurrence/reminders/attendee/multi-account/provider 확장은 기존 후보를 따른다. |
| PWA/native app 기능 자체 | `PRE12-F30` | 10 완료 범위는 mobile browser field-use다. PWA/offline/native는 10 미완성이 아니라 별도 mobile roadmap 후속이다. |
| Marketing opt-in/communication consent | `PRE12-F41` | 09 route analytics와 10 browser push permission은 marketing consent를 대신하지 않는다. 12/growth/privacy 정책 이후 별도 판단한다. |

## 5. 구현 금지

이 goal에서는 아래를 하지 않는다.

- `ProductAnalyticsEvent` schema, event source/target enum, repository, collector API 변경
- `PRODUCT_ANALYTICS_CLIENT_EVENT_NAMES`, `PRODUCT_ANALYTICS_SERVER_EVENT_NAMES` runtime allowlist 확장
- Notification/Google Calendar/follow-up delivery 세부 event hook 추가
- `AiUsageDaily`, `UsageMeter`, `BillingEvent`, `UserSubscription`, `ChurnSurveyResponse`, `ExperimentAssignment` model 추가
- `paywall_viewed`, `upgrade_clicked`, `subscription_started`, `churn_survey_submitted` 같은 reserved billing event를 runtime emit으로 전환
- Segment/PostHog/Mixpanel/GA provider SDK, backend adapter, outbox, forwarding worker 추가
- public site/UTM/referrer/ad attribution 수집 추가
- marketing opt-in/communication consent preference, withdrawal, campaign channel consent API/UI/model 추가
- account deletion 실제 hard delete/anonymization processor 추가
- session revoke/access block/deletion-complete UX를 정책 없이 추가
- PWA install/offline shell/full offline sync, iOS/Android native app, native push/contact/calendar, native install attribution 추가

## 6. 코드 재대조 기준

확인한 주요 코드 기준:

- `BE/prisma/schema.prisma`와 `BE/prisma/migrations/20260730090000_add_product_analytics/migration.sql`에는 `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot` 및 관련 enum/index/COMMENT가 있다.
- `BE/src/modules/analytics`에는 `POST /api/analytics/events`, `ProductAnalyticsEventRecorder`, snapshot/purge use case, AI usage summary use case, runtime/reserved taxonomy가 있다.
- `BE/src/modules/data-import`에는 01 ImportJob 완료 범위를 09 analytics로 연결하는 `import_confirmed` server event 기록이 있다.
- `FE/user-web/src/features/analytics`와 `FE/user-web/src/components/layout/app-shell.tsx`에는 `VITE_PRODUCT_ANALYTICS_ENABLED` gate, `trackAnalyticsEvent`, `useAppRouteAnalytics`, routeKey mapper가 있다.
- `BE/src/modules/admin-operation`과 `FE/admin-web/src/features/usage-analytics`에는 11 범위의 Admin analytics overview가 있으며, billing/subscription 지표는 제외된다.
- billing/paywall/churn event는 `PRODUCT_ANALYTICS_RESERVED_BILLING_EVENT_NAMES`에만 있고 09 runtime allowlist로 발생하지 않는다.
- `ExperimentAssignment`, external analytics provider forwarding, public/UTM attribution runtime, PWA/native install attribution 구현은 확인되지 않았다. `FE/user-web/src/pages/privacy`의 analytics provider 문구는 public privacy copy이며 실제 provider SDK/adapter 구현 근거가 아니다.
- `FollowUpConsentNotice`와 follow-up consent modal은 사용자 주도 follow-up EMAIL/SMS 발송 고지 확인이며, public contact form `marketingAgreement`는 lead submission field다. account-level marketing opt-in/withdrawal/campaign consent 구현 근거로 보지 않는다.

```powershell
rg -n "model ProductAnalyticsEvent|model UserActivationSnapshot|model RetentionCohortSnapshot|model AccountDeletionRequest|AiUsageDaily|UsageMeter|ExperimentAssignment|ChurnSurveyResponse|BillingEvent|UserSubscription" BE\prisma\schema.prisma
rg -n "PRODUCT_ANALYTICS_CLIENT_EVENT_NAMES|PRODUCT_ANALYTICS_SERVER_EVENT_NAMES|PRODUCT_ANALYTICS_RESERVED_BILLING_EVENT_NAMES" BE\src\modules\analytics
rg -n "Controller|Post|CollectProductAnalyticsEvent|ProductAnalyticsEventRecorder|ProcessProductAnalyticsSnapshotsUseCase|PurgeProductAnalyticsRawEventsUseCase|SummarizeAiUsageUseCase" BE\src\modules\analytics -g "*.ts"
rg -n "import_confirmed|ProductAnalyticsEventRecorder|analyticsEventRecorder|recordServerEvent" BE\src\modules\data-import TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\01_IMPORT_JOB_PERSISTENCE -g "*.ts" -g "*.md"
rg -n "useAppRouteAnalytics|trackAnalyticsEvent|VITE_PRODUCT_ANALYTICS_ENABLED" FE\user-web\src
rg -n "admin/api/analytics|AdminAnalytics|usage analytics" BE\src\modules\admin-operation FE\admin-web\src
rg -n "AccountDeletionRequest|scheduledDeletionAt|user\.delete|account deletion" BE\src\modules FE\user-web\src FE\admin-web\src
rg -n "ExperimentAssignment|experiments/assignments|Segment|PostHog|Mixpanel|GoogleAnalytics|gtag|amplitude|UTM|utm_|ad attribution|attribution|external analytics|analytics provider|provider forwarding" BE\src FE\user-web\src FE\admin-web\src -g "*.ts" -g "*.tsx"
```

## 7. 완료 기준

- [x] 09 완료 범위를 재오픈하지 않는다고 기록했다.
- [x] 09 후속 후보를 `PRE12-F26`~`PRE12-F30`으로 분류했다.
- [x] 2026-08-07 2차 재대조에서 source plan의 Marketing opt-in gap을 `PRE12-F41`로 추가 분리했다.
- [x] `PRE12-F12`가 billing/subscription/tax/paywall/churn뿐 아니라 AI usage billing source-of-truth 결정까지 포함한다고 보강했다.
- [x] 10 mobile field-use와 11 Admin analytics는 완료 연결로 보고, PWA/native 및 account deletion 실제 job은 별도 후속으로 분리했다.
- [x] external provider, public/UTM attribution, growth experiment, reserved billing runtime event는 09/PRE12 구현 금지로 고정했다.
