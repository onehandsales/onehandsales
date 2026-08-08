# G06 Before 12 Closeout And Handoff

상태: Ready For Goal
성격: 최종 handoff closeout

## 0. 착수 체크리스트

- [ ] G01 결과 문서를 확인한다.
- [ ] G02 결과 문서를 확인한다.
- [ ] G03 결과 문서를 확인한다.
- [ ] G04 결과 문서를 확인한다.
- [ ] G05 결과 문서를 확인한다.
- [ ] `PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`를 다시 확인한다.
- [ ] `12_BILLING_SUBSCRIPTION_TAX`의 현재 scope를 확인한다.
- [ ] G01 Gmail/Microsoft smoke가 모두 성공했는지 확인한다.

## 1. 목표

G01~G05 결과를 정리하고 `12_BILLING_SUBSCRIPTION_TAX` 착수 전 handoff 상태를 만든다.

G06은 meta closeout이다. G01~G05 중 하나라도 미완료이면 G06을 완료로 닫지 않는다.

## 2. 포함 범위

- G01~G05 완료 결과 요약
- `PRE12_FOLLOWUP_RECHECK`와 `BEFORE_12_TASKS` 상태 대조
- 12 Billing 착수 전 blocker 기록
- post-12 후보와 billing 종속 후보가 섞이지 않는지 확인
- `COMMON/PLANNING-REVIEW.md` 최종 갱신
- `COMMON/FINAL-SERVICE-SHAPE.md` 최종 갱신
- `COMMON/RELEASE-SCOPE-CHECK.md` 최종 갱신
- 12 Billing 문서 작성/상세화 착수 가능 여부 기록

## 3. 제외 범위

- 12 Billing 구현
- post-12 새 TODO 생성
- `GLOBAL_B2C_FEATURE_ROADMAP_PLAN` 최종 종료 처리
- follow-up 후보 구현
- G01 실패/미실행 상태를 완료로 덮는 작업

## 4. 확인 대상

- `TODO/BEFORE_12_TASKS/README.md`
- `TODO/BEFORE_12_TASKS/COMMON/PLANNING-REVIEW.md`
- `TODO/BEFORE_12_TASKS/COMMON/FINAL-SERVICE-SHAPE.md`
- `TODO/BEFORE_12_TASKS/COMMON/RELEASE-SCOPE-CHECK.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G02_10_MOBILE_CHECKLIST_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX`

## 5. 판정 기준

12 착수 가능:

- G01~G05가 모두 완료됐다.
- G01 Gmail/Microsoft production-equivalent smoke가 모두 성공했다.
- 새 API/DB/route 구현이 발생하지 않았다.
- PRE12 final classification과 BEFORE_12 상태가 충돌하지 않는다.
- post-12 후보와 billing 종속 후보가 분리되어 있다.

12 착수 불가:

- Gmail 또는 Microsoft smoke가 실패했다.
- provider env/callback/account 미준비로 G01 smoke가 미실행이다.
- G02~G05 문서 정합성에 unresolved 충돌이 남았다.
- 새 API/DB/route 필요성이 발견됐지만 분리되지 않았다.
- billing 종속 후보가 BEFORE_12에 섞였다.

## 6. 작업 순서

1. G01~G05 결과 문서와 검증 명령 결과를 수집한다.
2. G01의 provider별 smoke 성공 여부를 별도 표로 정리한다.
3. G02~G05 문서 정합성 결과와 남은 risk를 정리한다.
4. PRE12 final classification의 3분류와 BEFORE_12 goal 결과를 대조한다.
5. `PLANNING-REVIEW`, `FINAL-SERVICE-SHAPE`, `RELEASE-SCOPE-CHECK`를 최종 상태로 갱신한다.
6. 12 Billing 착수 가능 여부를 명확히 기록한다.

## 7. 검증 명령

문서/정적 확인:

```bash
git diff --check
rg -n "^(상태: Draft|판정: .*필요)" TODO/BEFORE_12_TASKS
rg -n "PRE12-F04|PRE12-F31|PRE12-F32|PRE12-F33|PRE12-F34" TODO/BEFORE_12_TASKS TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md
```

필요 시 앱 검증 결과 재확인:

```bash
cd BE
pnpm run typecheck
pnpm run lint
```

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
```

## 8. 완료 기준

- [ ] G01~G05 결과가 모두 문서화됐다.
- [ ] G01 Gmail/Microsoft production-equivalent smoke가 모두 성공했다.
- [ ] 남은 12 전 blocker가 없다.
- [ ] 12 Billing 착수 가능 여부가 기록됐다.
- [ ] 12 이후 다시 볼 후보가 post-12 또는 billing 종속으로 분리되어 있다.
- [ ] `PLANNING-REVIEW`, `FINAL-SERVICE-SHAPE`, `RELEASE-SCOPE-CHECK`가 최종 상태와 맞는다.
- [ ] 초안 또는 추가 작성 대기 상태가 남아 있지 않다.

## 9. 결과 기록 위치

권장 결과 기록:

```text
TODO/BEFORE_12_TASKS/TODO_LOG/<YYYY-MM-DD>/G06_BEFORE_12_CLOSEOUT_AND_HANDOFF/WORK_LOG.md
```

## 10. 권장 실행 문구

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G06_BEFORE_12_CLOSEOUT_AND_HANDOFF.md 기준으로 G06을 진행해줘.
```

## 11. 관련 문서

- `TODO/BEFORE_12_TASKS/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX`
