# Planning Review

상태: Done / 12 Billing Handoff Ready
판정: G01~G06 완료, 12 Billing 문서 작성/상세화 착수 가능
검토일: 2026-08-09

## 1. 결론

- 판정: `BEFORE_12_TASKS`는 G01~G06 완료 상태로 닫혔다.
- 이유: PRE12 최종 분류의 12 전 항목 5개가 G01~G05로 1:1 연결됐고, G06 handoff에서 12 Billing 문서 작성/상세화 착수 가능 상태를 기록했다.
- 구현 상태: 이번 계획은 구현 계획이 아니라 closeout 실행 계획이다. 새 API/DB/route 구현은 발생하지 않았다.
- G01 증거 성격: Gmail과 Microsoft 365 smoke는 `User-Assumed Provider Smoke Accepted`로 닫혔다. 독립 재감사가 필요하면 G01 work log의 재감사 조건을 따른다.

## 2. 검토 대상

BEFORE_12 내부 문서:

- `README.md`
- `COMMON/README.md`
- `COMMON/SCOPE.md`
- `COMMON/USER-FLOW.md`
- `COMMON/REFERENCES.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/NO_NEW_API_CONTRACT.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md`
- `COMMON/GOAL-SPECS/G02_10_MOBILE_CHECKLIST_CLOSEOUT.md`
- `COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md`
- `COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md`
- `COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md`
- `COMMON/GOAL-SPECS/G06_BEFORE_12_CLOSEOUT_AND_HANDOFF.md`
- `COMMON/FINAL-SERVICE-SHAPE.md`
- `COMMON/RELEASE-SCOPE-CHECK.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`
- `FE-TODO/ADMIN-WEB-TODO.md`

상위 TODO:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX`

AGENT 기준:

- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`

실제 코드:

- `BE/src/app.module.ts`
- `BE/src/modules/follow-up`
- `BE/src/modules/notification`
- `BE/src/modules/admin-operation`
- `BE/src/modules/account-request`
- `BE/src/modules/trash`
- `BE/prisma/schema.prisma`
- `FE/user-web/src/app/router/router.tsx`
- `FE/user-web/src/features/follow-up-delivery`
- `FE/user-web/src/features/notification`
- `FE/user-web/src/features/import-export`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/admin-web/src/features`

## 3. 핵심 발견 사항

| 등급 | 영역 | 발견 | 조치 |
| --- | --- | --- | --- |
| Resolved | 문서 구조 | 초기 `BEFORE_12_TASKS`는 실행 전 초안 상태였고 01번 수준의 실행 체크리스트가 부족했다. | 실행 체크리스트와 공통 gate를 보강한 뒤 G01~G06 완료 상태로 닫았다. |
| Resolved | Goal 분리 | PRE12 12 전 후보는 5개뿐이며, meta closeout이 필요하다. | G01~G05 + G06 handoff 구조로 고정한다. |
| Closed | G01 완료 기준 | 기존 문서에는 실행 불가 사유 기록만으로도 closeout처럼 읽히는 문구가 있었다. | Gmail/Microsoft smoke를 사용자 acceptance 기준으로 닫고, 증거 성격과 재감사 조건을 G01/G06 로그에 남긴다. |
| Resolved | API 범위 | G01은 기존 follow-up API를 쓰지만 새 API는 필요 없다. | `NO_NEW_API_CONTRACT.md`를 confirmed 상태로 고정한다. |
| Resolved | DB 범위 | follow-up email connection/message/attempt 모델은 이미 있고 billing 모델은 없다. | 새 migration 없음, billing 모델은 12에서 결정한다고 명시한다. |
| Resolved | User Web route | `/app/notifications`와 `/app/schedules/week`는 실제 route로 활성이고 `/app/export`는 redirect다. | G03에서 문서만 실제 route 상태에 맞추도록 한다. |
| Resolved | Admin Web route | 11 Admin route는 활성이고 `/organizations`, `/subscriptions`, `/support`는 redirect다. | G05에서 active/redirect/legacy 상태를 문서화하도록 한다. |
| Resolved | Billing 경계 | 12는 Merchant of Record 우선, Stripe 직접 결제 fallback 방향이다. | BEFORE_12에서 Stripe 기반 결제/구독 작업을 선행하지 않도록 수정한다. |

## 4. AGENT 기준 적합성

Backend:

- User API와 Admin API는 분리한다.
- User API는 `/api/*`, Admin API는 `/admin/api/*` 경계를 유지한다.
- Domain/application에서 Prisma 직접 접근을 하지 않는 기존 기준을 유지한다.
- 새 API가 생기면 구현 전에 API 계약이 필요하지만, 이번 계획은 새 API 없음이다.
- 코드 변경이 생기면 Backend class/interface/API method/function에 한글 주석을 둔다.

Frontend/UX:

- User Web은 `/api/*`만 호출한다.
- Admin Web은 `/admin/api/*`만 호출한다.
- Notion식 작업공간 UX와 Attio식 CRM record 관계 UX를 유지한다.
- 사용자 노출 문구 변경이 생기면 해요체와 짧은 행동 중심 문구를 따른다.
- stale 문서를 기준으로 실제 route를 rollback하지 않는다.

DB/운영:

- 실제 DB source of truth는 `BE/prisma/schema.prisma`와 migrations다.
- 이번 계획에서는 새 schema/migration이 없다.
- DB 변경이 필요해 보이면 현재 goal에서 구현하지 않고 12 또는 post-12 후보로 분리한다.
- DB 변경이 실제로 승인되면 한국어 Prisma 주석 또는 SQL comment가 필요하다.

## 5. 출시 범위 적합성

`BEFORE_12_TASKS`는 12 Billing 전 closeout bundle이다.

포함:

- provider smoke
- 10 Mobile 문서 정합성
- User Web route/architecture 문서 정합성
- 11 Admin 문서 정합성
- Admin Web architecture/legacy 문서 정합성
- 12 착수 handoff

제외:

- Billing/subscription/tax/payment/invoice/refund/paywall
- post-12 기능 후보
- B2B/customer admin
- ExportJob/UserDraft
- Admin direct mutation
- PWA/native/offline

## 6. 누락 사항

현재 goal 분리 기준의 누락은 없다.

G01 독립 재감사가 필요하면 사용자가 준비한 `.env`, provider console callback URL, dedicated smoke allowlist 수신자, production-equivalent Backend 또는 `NODE_ENV=production` 실행 환경을 다시 확인한다.

## 7. 충돌 사항

현재 문서 구조 기준의 unresolved 충돌은 없다.

G01은 사용자 acceptance 기준으로 닫혔고, G06은 이 증거 성격을 숨기지 않은 상태로 12 Billing 문서 작성/상세화 착수 가능 판정을 남겼다.

## 8. 추가 사용자 결정 필요 여부

현재 G06 handoff 완료에는 추가 질문이 필요 없다.

G01 독립 재감사 준비물:

- `BE/.env` 또는 실행 환경의 follow-up provider env key
- provider console callback URL 등록
- dedicated smoke allowlist 수신자
- production-equivalent Backend 또는 `NODE_ENV=production` 실행 환경

## 9. 완료 여부

- 완료 여부: G01~G06 완료
- 완료 전 반드시 수정할 항목: 없음
- 실행 순서: G01 -> G02 -> G03 -> G04 -> G05 -> G06
