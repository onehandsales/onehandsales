# Release Scope Check

상태: Done / 12 Billing Handoff Ready

## 1. 목적

이 문서는 `BEFORE_12_TASKS`가 12 Billing 착수 전 선행 작업으로 충분한지 검수한다.

핵심 판단:

- 이 계획은 12 전에 닫아야 하는 closeout만 포함한다.
- 이 계획은 Billing 기능을 먼저 구현하지 않는다.
- 이 계획은 post-12 후보를 구현하지 않는다.
- 이 계획은 stale 문서 때문에 실제 구현을 되돌리지 않는다.

## 2. PRE12 항목 대조

| PRE12 ID | 이번 계획 포함 | Goal | 판단 |
| --- | ---: | --- | --- |
| `PRE12-F04` | Yes | G01 | Gmail/Microsoft provider smoke closeout |
| `PRE12-F31` | Yes | G02 | 10 Mobile Field Use 문서 체크리스트 정합성 |
| `PRE12-F32` | Yes | G03 | User Web route/architecture 문서 정합성 |
| `PRE12-F33` | Yes | G04 | 11 Admin Operation 문서 체크리스트/goal index 정합성 |
| `PRE12-F34` | Yes | G05 | Admin Web architecture/legacy route 정합성 |

12 전에 할 것으로 분류된 PRE12 후보는 위 5개가 전부다.

## 3. 12 전에 닫는 항목

- provider smoke 결과 확인 및 기록
- 10 Mobile 문서 checklist의 실제 완료 상태 보정
- User Web route/architecture 문서의 실제 route 상태 보정
- 11 Admin Operation checklist와 goal index 상태 보정
- Admin Web architecture와 legacy route/API 상태 보정
- 12 Billing 착수 전 handoff 기록

## 4. post-12로 유지하는 항목

PRE12 final classification의 post-12 후보는 이번 계획에 포함하지 않는다.

- next action reminder 확장
- MeetingNote follow-up reminder/자동 mutation
- SMS 실제 provider
- email sync, sequence, campaign, unsubscribe, scheduled send
- record summary/detail/list summary 확장
- generic ExportJob/PDF
- Google Calendar write/sync/watch/recurrence
- import scale/source/Admin 확장
- app i18n polish와 growth attribution
- PWA/native packaging
- advanced mobile camera/draft/media raw storage
- Admin direct domain mutation
- Customer/B2B tenant admin

## 5. billing 종속으로 유지하는 항목

아래 항목은 12 Billing의 confirmed scope/API/DB가 먼저 정해져야 한다.

- plan, subscription, entitlement, payment, invoice, refund, failed payment, tax, paywall, churn
- money precision, currency minor unit, tax 표시
- billing address, tax profile, terms, refund policy, invoice policy
- account deletion hard delete/anonymization과 billing retention
- paid recovery, paid Trash restore, hard delete/purge
- marketing opt-in, billing lifecycle communication, consent audit

## 6. 12 Billing provider 경계

12 Billing의 현재 방향은 아래와 같다.

- Merchant of Record 우선 검토
- Stripe 직접 결제는 fallback
- 결제/세금/환불/인보이스/chargeback 운영 범위는 12에서 확정

따라서 `BEFORE_12_TASKS`에서는 Stripe 기반 결제/구독 작업을 선행하지 않는다.

## 7. 충돌 방지 체크

- [x] `PRE12_FOLLOWUP_RECHECK`의 12 전 항목과 `BEFORE_12_TASKS` goal이 1:1로 연결된다.
- [x] post-12 후보가 이번 계획의 포함 범위에 들어오지 않는다.
- [x] billing 종속 후보가 이번 계획의 포함 범위에 들어오지 않는다.
- [x] `/app/notifications` 활성 상태를 rollback하지 않는다.
- [x] `/app/schedules/week` 활성 상태를 rollback하지 않는다.
- [x] `/app/export` redirect 상태를 변경하지 않는다.
- [x] G04에서 11 User Web 영향 문서의 `/app/trash`, `/app/settings`, `/admin/api/*` 차단 기준을 확인한다.
- [x] Admin Web redirect route를 billing/admin 기능으로 활성화하지 않는다.
- [x] G01~G06 각 goal 문서에 착수 체크리스트, request/response, business logic, user flow, DB/Prisma, 검증 명령, 완료 기준이 반영되어 있다.
- [x] 새 API와 새 DB migration이 없다.
- [x] G01 Gmail/Microsoft smoke verified closeout 근거가 문서에 기록되어 있다.

## 8. 완료 판정

아래가 모두 만족되면 `BEFORE_12_TASKS`는 12 Billing 착수 전 closeout 완료로 처리한다.

- G01~G06 완료
- G01 Gmail/Microsoft production-equivalent smoke 배포 환경 verified 기준 성공 처리
- `COMMON/PLANNING-REVIEW.md` 갱신
- `COMMON/FINAL-SERVICE-SHAPE.md` 갱신
- `COMMON/RELEASE-SCOPE-CHECK.md` 갱신
- `PRE12_FOLLOWUP_RECHECK`와 상태 충돌 없음

최종 판정:

- 2026-08-10 기준 `BEFORE_12_TASKS`는 G01~G06 완료 상태다.
- 12 전 blocker는 남아 있지 않다.
- G01 provider smoke는 `Production Provider Smoke Verified` 성격으로 닫혔다.
- 12 Billing은 구현이 아니라 confirmed scope/API/DB 문서 상세화부터 착수한다.

## 9. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/FINAL-SERVICE-SHAPE.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX/COMMON/SCOPE.md`
