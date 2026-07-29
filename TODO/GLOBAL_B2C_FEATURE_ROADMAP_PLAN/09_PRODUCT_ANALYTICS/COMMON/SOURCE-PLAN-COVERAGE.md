# Source Plan Coverage

상태: Confirmed

## 1. 목적

09 Product Analytics가 원본 계획인 `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`을 어떻게 반영하는지 기록한다.

## 2. USER_WEB_PRODUCTIZATION_GAP_PLAN 반영

| 원본 항목 | 09 반영 |
|---|---|
| Global B2C first sale gate의 Analytics | 09의 핵심 목표로 반영 |
| activation, retention, paid conversion, churn, AI cost/user 필요 | activation/retention/AI usage는 09 구현. paid conversion/churn은 12 reserved |
| 제품 분석 정본 없음 | `ProductAnalyticsEvent` 자체 DB 정본으로 반영 |
| 첫 판매 전 privacy 기준 필요 | payload allowlist, PII 금지, retention, account deletion 기준 반영 |
| Admin/support와 billing은 별도 계획 필요 | Admin은 11, billing은 12로 범위 분리 |
| 실제 `/app` 업무 흐름을 기준으로 제품화 필요 | `app_route_viewed` routeKey allowlist를 `FE/user-web/src/app/router/router.tsx`의 보호된 `/app` route 기준으로 고정 |
| AI cost/user 확인 필요 | 09에서는 기존 `AiProviderCallLog` 기반 summary를 사용하고 quota/plan source of truth는 12로 이관 |

## 3. NEXT_BACKEND_API_BACKLOG_PLAN 반영

`NEXT_BACKEND_API_BACKLOG_PLAN`에는 09 Product Analytics 자체가 이미 구현 backlog로 존재하지 않는다.

09에서 반영한 연결점:

- 기존 BE module/use case/repository 구조 유지
- `AiProviderCallLog` 기반 AI usage 계산
- `NBA-006 ImportJob persistence/resume API` 완료 범위는 `import_confirmed` server event로 연결
- `NBA-009 Schedule week report`와 Schedule/Deal 연결 완료 범위는 `schedule_created`, `schedule_deal_linked`, `schedule_week` routeKey로 연결
- `NBA-010 Notification` 완료 범위는 `/app/notifications` routeKey로 연결. Notification reminder 발송/클릭/도달 event는 09 runtime에 넣지 않는다.
- `NBA-001/002/003/008` Deal Activity Timeline 완료 범위는 `deal_created`, `deal_next_action_created`, `deal_detail`/`deals` routeKey로 연결
- `NBA-004/011` MeetingNote AI Provider Log 완료 범위는 `meeting_note_created`, `meeting_note_deal_linked`, 기존 `AiProviderCallLog` AI usage summary로 연결
- `08_GLOBAL_DATA_I18N` 완료 범위는 timezone, locale, country, KRW/USD currency, Google/LINE/Apple provider payload allowlist로 연결
- 새로운 Admin/Billing API를 09에서 앞당기지 않음

## 4. GLOBAL_B2C_FEATURE_ROADMAP_PLAN 반영

| Slot | 09와 관계 |
|---|---|
| 08 Global Data I18N | timezone, locale, currency, auth provider 완료 상태를 analytics event 계산 기준으로 사용 |
| 09 Product Analytics | raw event/snapshot/AI usage 기반 구현 |
| 11 Admin Operation | Admin analytics UI/API 구현 위치 |
| 12 Billing Subscription Tax | paywall/trial/coupon/referral/churn/payment event 최종 계약 위치 |

## 5. AGENT 반영

| 문서 | 반영 |
|---|---|
| `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md` | activation funnel, D1/D7/D30 retention, AI cost/user 반영 |
| `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md` | `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot`은 09 구현 대상으로 반영하고 `ChurnSurveyResponse`는 12 이관 대상으로 반영 |
| `AGENT/SOFTWARE_AGENT` | API contract, transaction, observability, code comment rule 반영 |
| `AGENT/UXUI_AGENT` | 기존 `/app` record workflow를 방해하지 않는 client wrapper 기준 반영 |

## 6. 의도적으로 제외한 항목

- Admin dashboard full UI
- `/admin/api/analytics/*` full API
- Billing provider/webhook
- Paywall/upgrade modal
- Churn survey UI/API
- External analytics provider
- Ad attribution / UTM
