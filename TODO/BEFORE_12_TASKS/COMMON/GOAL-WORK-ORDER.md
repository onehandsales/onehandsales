# Goal Work Order

상태: Draft / Skeleton

## 1. 원칙

이 계획은 12 Billing 착수 전 closeout만 다룬다.

각 `/goal`은 문서 정합성 또는 운영 smoke 기록 하나만 처리한다. 새 API, 새 DB, 새 route, 새 제품 기능은 만들지 않는다.

## 2. 실행 순서

| 순서 | Goal | PRE12 ID | 상태 | 목적 |
| --- | --- | --- | --- | --- |
| G01 | Provider Smoke Closeout | `PRE12-F04` | Draft | Gmail/Microsoft provider smoke 상태를 닫는다. |
| G02 | 10 Mobile Checklist Closeout | `PRE12-F31` | Draft | 10 Mobile Field Use 문서 체크리스트를 실제 완료 상태와 맞춘다. |
| G03 | User Web Route Architecture Closeout | `PRE12-F32` | Draft | User Web route/architecture 문서를 실제 route와 맞춘다. |
| G04 | 11 Admin Checklist Closeout | `PRE12-F33` | Draft | 11 Admin Operation checklist와 goal index를 실제 완료 상태와 맞춘다. |
| G05 | Admin Web Architecture Legacy Closeout | `PRE12-F34` | Draft | Admin Web architecture와 legacy route 설명을 실제 route/API와 맞춘다. |
| G06 | Before 12 Closeout And Handoff | closeout | Draft | 12 Billing 착수 전 상태를 정리하고 handoff한다. |

## 3. G01 Provider Smoke Closeout

상세 명세: `COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md`

목표:

- 05 G10 Gmail/Microsoft provider smoke pending 상태를 운영 확인 결과로 정리한다.

완료 기준:

- provider env key 존재 여부를 비밀값 없이 기록한다.
- provider console callback 등록 여부를 기록한다.
- 실제 smoke를 실행했다면 결과를 기록한다.
- 실행하지 못했다면 미실행 사유와 다음 필요 조건을 기록한다.
- 새 email API/provider/SMS/sequence/scheduled send를 만들지 않는다.

## 4. G02 10 Mobile Checklist Closeout

상세 명세: `COMMON/GOAL-SPECS/G02_10_MOBILE_CHECKLIST_CLOSEOUT.md`

목표:

- 10 Mobile Field Use의 stale TODO/checklist를 실제 완료 상태와 맞춘다.

완료 기준:

- 10 README, G07 closeout, 실제 BE/FE 코드 기준으로 checklist 상태가 정리된다.
- PWA/offline/native, server draft, `/api/exports` 구현은 추가하지 않는다.

## 5. G03 User Web Route Architecture Closeout

상세 명세: `COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md`

목표:

- `/app/notifications` 활성, `/app/export` redirect 상태를 User Web architecture 문서에 반영한다.

완료 기준:

- stale 문서를 이유로 `/app/notifications`를 rollback하지 않는다.
- generic export route/API는 활성화하지 않는다.

## 6. G04 11 Admin Checklist Closeout

상세 명세: `COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md`

목표:

- 11 Admin Operation의 상위 checklist, goal index, BE/FE TODO 상태를 실제 완료 상태와 맞춘다.

완료 기준:

- 11 README와 G10 closeout의 완료 상태가 상위 checklist/index에 반영된다.
- Billing/Admin mutation/B2B tenant admin을 11 완료 범위로 끼워 넣지 않는다.

## 7. G05 Admin Web Architecture Legacy Closeout

상세 명세: `COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md`

목표:

- Admin Web architecture와 legacy `admin-query` 설명을 실제 11 route/API 기준으로 정리한다.

완료 기준:

- 활성 Admin route와 redirect route가 구분된다.
- legacy `admin-query`를 신규 route로 활성화하지 않는다.
- Billing Admin, customer tenant admin, organization admin을 추가하지 않는다.

## 8. G06 Before 12 Closeout And Handoff

상세 명세: `COMMON/GOAL-SPECS/G06_BEFORE_12_CLOSEOUT_AND_HANDOFF.md`

목표:

- G01~G05 결과를 정리하고 `12_BILLING_SUBSCRIPTION_TAX` 착수 가능 상태를 만든다.

완료 기준:

- `BEFORE_12_TASKS`와 `PRE12_FOLLOWUP_RECHECK` 상태가 충돌하지 않는다.
- 12 Billing으로 넘길 항목과 post-12로 넘길 항목이 구분된다.
- 12 착수 전 남은 blocker가 있으면 명확히 기록된다.

## 9. 실행 권장 문구

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md 기준으로 G01을 진행해줘.
```
