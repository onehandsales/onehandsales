# Scope

상태: Completed

## 1. 포함 범위

| 항목 | 내용 |
|---|---|
| Event taxonomy | `snake_case` allowlist와 `eventVersion` 기준을 정의한다. |
| Raw event store | 자체 DB `ProductAnalyticsEvent`를 만든다. |
| Client event collector | `POST /api/analytics/events`로 User Web core `/app` route view를 수집한다. |
| Server event recorder | 가입, 딜, 다음 행동, 일정 연결, 회의록 연결, 명함 확정, import/export 성공 같은 핵심 event를 use case에서 기록한다. |
| Activation | `첫 딜 생성 + 다음 행동/일정/회의록 중 하나 연결` 기준 snapshot을 만든다. |
| Retention | 사용자 timezone 기준 `eventDate`로 D1/D7/D30 계산 기반과 365일 raw event purge use case를 만든다. |
| AI usage | 기존 `AiProviderCallLog`를 기준으로 사용자별 요청 수, 성공/실패/대기/취소, 추정 비용을 계산한다. |
| Privacy | payload allowlist, PII 금지, 365일 raw event retention, 계정 삭제 30일 유예 후 실제 삭제 기준을 구현 계약에 넣는다. |
| Reserved billing taxonomy | `TODO/PADDLE_PLAN`에서 확정할 paywall/trial/coupon/referral/churn event 이름을 reserved list로 남긴다. |
| Runtime taxonomy 유지 | 2026-07-30 사용자 재확인 기준 09 runtime event는 현재 최소 event set 그대로 유지한다. |
| Code comment rule | BE/FE 신규/수정 코드에 한국어 주석 규칙을 적용한다. |

## 2. 제외 범위

| 항목 | 이유 |
|---|---|
| Admin analytics full UI | 11 Admin Operation에서 구현한다. |
| `/admin/api/analytics/*` full API | 11에서 Admin 권한, table, filter, masking 기준과 함께 만든다. 09는 snapshot/read model 기반만 준비한다. |
| 외부 analytics provider | 자체 DB 정본이 먼저다. 09에서는 provider forwarding port/adapter/runtime call을 만들지 않는다. |
| Public site full page view | 09 1차는 로그인 이후 core `/app` usage만 본다. |
| 광고 attribution/UTM | 판매 funnel 이후 marketing attribution 계획에서 다룬다. |
| Billing/paywall 실제 상태 전이 | `TODO/PADDLE_PLAN`에서 최종 확정한다. |
| Churn survey 저장/화면 | `TODO/PADDLE_PLAN`에서 cancel flow와 함께 확정한다. |
| Notification/Calendar/follow-up/PWA/Admin 세부 event | 09의 activation/retention/AI usage/core usage 정본 범위를 넘으므로 10/11/12 또는 후속 분석 계획에서 결정한다. |
| 완성형 BI dashboard | 09는 수집/계산 기반이다. |
| prompt/raw response 저장 | privacy와 cost log 정책상 금지한다. |

## 3. 1차 Event Taxonomy

Server event:

| Event | Source | 의미 |
|---|---|---|
| `auth_signup_completed` | server | 신규 User 생성과 app session 발급이 완료됐다. |
| `deal_created` | server | 딜 생성이 성공했다. |
| `deal_next_action_created` | server | 딜에 다음 행동이 생성됐다. |
| `schedule_created` | server | 일정 생성이 성공했다. |
| `schedule_deal_linked` | server | 일정 생성/수정에서 새 딜 연결이 추가됐다. |
| `meeting_note_created` | server | 회의록 저장이 성공했다. |
| `meeting_note_deal_linked` | server | 회의록 생성/수정/딜 연결 API에서 새 딜 연결이 추가됐다. |
| `business_card_scan_confirmed` | server | 명함 OCR 결과가 사용자 확인 후 저장됐다. |
| `import_confirmed` | server | import 확정 저장이 성공했다. |
| `export_downloaded` | server | 도메인 xlsx export가 성공했다. |

Client event:

| Event | Source | 의미 |
|---|---|---|
| `app_route_viewed` | client | core `/app` route 진입이 발생했다. payload는 routeKey allowlist만 허용한다. |

Event별 target, idempotencyKey, payload schema는 `COMMON/EVENT-TAXONOMY.md`를 정본으로 한다.

Reserved event:

| Event | Owner |
|---|---|
| `paywall_viewed`, `upgrade_clicked`, `trial_started`, `coupon_applied`, `referral_invited`, `subscription_started`, `subscription_canceled`, `churn_survey_submitted` | `TODO/PADDLE_PLAN`에서 최종 확정 |

## 4. Payload 금지 기준

Analytics payload에 저장하지 않는다.

- 이름, 이메일, 전화번호, 주소 상세, 회사명, 담당자명
- memo, private memo, meeting note details, nextPlan, requiredAction 원문
- AI prompt, raw response, provider raw response, quota detail
- access token, refresh token, authorization header, provider token
- userAgent, ipAddressHash, deviceIdHash 같은 auth/security data 복제

허용 예시:

```json
{
  "routeKey": "deals"
}
```

```json
{
  "importType": "DEAL",
  "rowCountBucket": "11_50",
  "importedRowCount": 32
}
```

## 5. 완료 기준

- 핵심 event taxonomy가 `COMMON/API-SPEC`과 `BE-TODO/DB-SCHEMA.md`에 같은 이름으로 기록된다.
- `ProductAnalyticsEvent` schema, migration, repository, collector API가 구현된다.
- 핵심 server mutation 성공 후 event가 best-effort로 기록된다.
- client page view event는 core `/app` routeKey allowlist만 보낸다.
- activation snapshot, retention snapshot, 365일 raw event purge use case가 있다.
- AI usage는 `AiProviderCallLog` 기반으로 1차 계산된다.
- billing/paywall/churn은 reserved taxonomy로만 남고 12 구현을 침범하지 않는다.
- 모든 신규/수정 코드에는 한국어 주석 규칙이 적용된다.

## 6. G08 Closeout

- 완료일: 2026-07-30
- 09 포함 범위는 G01~G08에서 구현 또는 검증 완료됐다.
- G08에서 새 기능, Admin UI/API, Billing/paywall/churn, 운영 DB migrate/seed는 실행하지 않았다.
- Backend/User Web 자동 검증과 event taxonomy/privacy 검색을 통과했다.
- 후속 범위는 10 Mobile/PWA, 11 Admin Operation, `TODO/PADDLE_PLAN` 또는 별도 후속 분석 계획에서 다룬다.
