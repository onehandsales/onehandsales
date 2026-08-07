# Release Scope Check

상태: Draft / Skeleton

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

## 3. 12 전에 닫는 항목

- provider smoke 결과 확인 및 기록
- 10 Mobile 문서 checklist의 실제 완료 상태 보정
- User Web route/architecture 문서의 실제 route 상태 보정
- 11 Admin Operation checklist와 goal index 상태 보정
- Admin Web architecture와 legacy route/API 상태 보정
- 12 Billing 착수 전 handoff 기록

## 4. 12 밖으로 유지하는 항목

- Stripe 상품/가격/구독 구현
- tax, invoice, refund, credit note 구현
- entitlement, plan limit, paywall 구현
- B2B tenant/customer admin 구현
- usage-based 관리비 과금 구현
- ExportJob, UserDraft, advanced admin operation 구현

## 5. 충돌 방지 체크

- [ ] `PRE12_FOLLOWUP_RECHECK`의 12 전 항목과 `BEFORE_12_TASKS` goal이 1:1로 연결된다.
- [ ] post-12 후보가 이번 계획의 포함 범위에 들어오지 않는다.
- [ ] billing 종속 후보가 이번 계획의 포함 범위에 들어오지 않는다.
- [ ] `/app/notifications` 활성 상태를 rollback하지 않는다.
- [ ] `/app/export` redirect 상태를 변경하지 않는다.
- [ ] Admin Web redirect route를 billing/admin 기능으로 활성화하지 않는다.
- [ ] 새 API와 새 DB migration이 없다.

## 6. 완료 판정

아래가 모두 만족되면 `BEFORE_12_TASKS`는 12 Billing 착수 전 closeout 완료로 처리한다.

- G01~G06 완료
- `COMMON/PLANNING-REVIEW.md` 갱신
- `COMMON/FINAL-SERVICE-SHAPE.md` 갱신
- `COMMON/RELEASE-SCOPE-CHECK.md` 갱신
- `PRE12_FOLLOWUP_RECHECK`와 상태 충돌 없음

## 7. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/FINAL-SERVICE-SHAPE.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`

