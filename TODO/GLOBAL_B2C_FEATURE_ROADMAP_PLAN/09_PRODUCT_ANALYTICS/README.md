# 09 Product Analytics

상태: G05 Completed / G06 Ready
순서: 09
성격: Global B2C 첫 판매 전 제품 분석 수집/계산 기반 구현 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 확정 결정 반영
구현 상태: G01 문서 계약 동기화, G02 DB Schema Event Foundation, G03 Analytics Collector API, G04 Server Event Logging, G05 User Web Client Events 완료. 다음 작업은 G06 Snapshot Retention Batch이다.

## 1. 목적

가입 이후 사용자가 실제로 개인 영업 업무 루프에 들어왔는지, 핵심 기능을 반복해서 쓰는지, AI 비용이 사용자별로 어떻게 발생하는지 측정할 수 있는 자체 제품 분석 기반을 만든다.

09의 목표는 완성형 BI나 관리자 대시보드가 아니다. 09는 Global B2C 유료 판매를 위해 반드시 필요한 분석 정본을 만든다. Admin 화면/API는 `11_ADMIN_OPERATION`에서 구현하고, 결제/paywall/churn의 최종 상태 전이는 `12_BILLING_SUBSCRIPTION_TAX`에서 확정한다.

## 2. 현재 상태

- `BE/prisma/schema.prisma`에 제품 분석 전용 event/snapshot table 기반이 추가됐다.
- activation, retention 계산용 DB foundation은 추가됐고, 실제 snapshot 계산은 G06에서 구현한다.
- `AiProviderCallLog`는 이미 존재하며 AI 요청 수, 실패율, token, 추정 비용의 1차 근거로 사용할 수 있다.
- `AuthSession`, `AuthDevice`는 이미 존재하므로 09에서 별도 analytics session/device 식별자를 만들지 않는다.
- User Web core `/app` route view wrapper는 G05에서 구현됐고, `VITE_PRODUCT_ANALYTICS_ENABLED="true"`일 때 Backend G03 collector API를 호출한다.
- Backend 핵심 server event는 G04에서 `ProductAnalyticsEventRecorder`로 auth/deal/schedule/meeting-note/business-card/data-import/export 성공 지점에 연결했다.
- Admin Web `/analytics` route는 현재 root redirect/placeholder 성격이며 09 구현 범위가 아니다.

## 3. 확정 결정 요약

| 항목 | 결정 |
|---|---|
| 09 범위 | 수집/계산 기반만 만든다. Admin dashboard full UI/API는 11에서 만든다. |
| 저장 방식 | 자체 DB `ProductAnalyticsEvent`를 1차 정본으로 사용한다. 외부 analytics provider 연동은 후속이다. |
| Activation | `첫 딜 생성 + 다음 행동/일정/회의록 중 하나 연결`이다. |
| Event source | server event는 핵심 행동 정본, client event는 UX 행동 보조다. |
| Analytics 실패 | 제품 기능 성공을 막지 않는다. analytics는 best-effort로 저장하고 실패 시 서버 로그만 남긴다. |
| Session/Device | 기존 `AuthSession`, `AuthDevice`를 사용한다. Client는 session/device id를 보내지 않는다. |
| Payload | event별 allowlist schema만 허용한다. 자유 JSON/PII/raw text는 금지한다. |
| 시간 | DB 원본 `occurredAt`은 UTC instant로 저장하고, 사용자 `timeZone` 기준 `eventDate`를 함께 저장한다. |
| Retention | raw event는 365일 보관한다. 비식별 aggregate snapshot은 장기 보관한다. |
| 계정 삭제 | 삭제 요청 후 30일 유예, 이후 user-linked raw analytics event와 user-level snapshot은 실제 삭제한다. |
| AI usage | 09 1차는 기존 `AiProviderCallLog`로 사용자별 AI 요청 수/성공/실패/대기/취소/추정 비용을 계산한다. `AiUsageDaily`는 reserved다. |
| Billing/growth | paywall/trial/coupon/referral/churn event name은 09에서 reserved만 한다. 최종 계약은 12가 override한다. |
| Client page view | 1차는 핵심 `/app` route view만 수집한다. public site, UTM, 광고 attribution은 제외한다. |
| Runtime taxonomy | 2026-07-30 사용자 재확인 기준 현재 최소 event set을 유지한다. Notification/Google Calendar/follow-up/PWA/Admin/Billing 세부 event는 10/11/12 또는 후속 계획에서 결정한다. |
| 집계 방식 | raw event는 즉시 저장하고 activation/retention/cohort snapshot은 optional batch runner가 계산한다. |
| Event naming | `snake_case`, allowlist, `eventVersion`, deprecated 규칙을 처음부터 둔다. |
| 코드 주석 | 신규/수정 BE/FE 코드에는 `AGENT/SOFTWARE_AGENT` 기준의 한국어 주석을 반드시 둔다. |

## 4. Goal 실행 방식

09는 하나의 `/goal`로 끝내지 않는다. 각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

권장 순서:

```text
G01_DOCUMENT_CONTRACT_SYNC
-> G02_DB_SCHEMA_EVENT_FOUNDATION
-> G03_ANALYTICS_COLLECTOR_API
-> G04_SERVER_EVENT_LOGGING
-> G05_USER_WEB_CLIENT_EVENTS
-> G06_SNAPSHOT_RETENTION_BATCH
-> G07_AI_USAGE_AND_BILLING_RESERVED
-> G08_QA_DOCUMENT_CLOSEOUT
```

## 5. 09 완료 기준

- `ProductAnalyticsEvent` 기반 raw event 저장 정본이 생긴다.
- server-side 핵심 성공 이벤트가 auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product use case와 application service에서 기록된다.
- User Web은 core `/app` route view를 allowlist payload로 보낸다.
- Activation snapshot이 `첫 딜 + 다음 행동/일정/회의록 연결` 기준으로 계산된다.
- D1/D7/D30 retention 계산에 필요한 user local date 기준 eventDate가 저장된다.
- 사용자별 AI 사용량은 `AiProviderCallLog` 기반으로 조회/집계한다.
- raw event 365일 초과 purge use case가 `ProductAnalyticsEvent`만 batch hard delete한다.
- analytics 실패가 딜/일정/회의록/import 같은 제품 기능 성공을 막지 않는다.
- PII/raw text/prompt/provider raw response가 analytics payload에 저장되지 않는다.
- 30일 계정 삭제 유예 이후 user-linked analytics 삭제 기준과 365일 raw event retention 기준이 구현 문서와 코드에 반영된다.
- 12 Billing에서 확정할 billing/paywall/churn event 이름은 reserved list에만 남아 있다.

## 6. 참고

- `COMMON/REFERENCES.md`
- `COMMON/DECISION-LOG.md`
- `COMMON/EVENT-TAXONOMY.md`
- `COMMON/PRISMA-MIGRATION-SPEC.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `COMMON/API-SPEC/README.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`
- `BE/prisma/schema.prisma`
