# G06 Before 12 Closeout And Handoff

상태: Draft / Skeleton

## 1. 목표

G01~G05 결과를 정리하고 `12_BILLING_SUBSCRIPTION_TAX` 착수 전 handoff 상태를 만든다.

## 2. 포함 범위

- G01~G05 완료 결과 요약
- `PRE12_FOLLOWUP_RECHECK`와 `BEFORE_12_TASKS` 상태 대조
- 12 Billing 착수 전 blocker 기록
- post-12 후보와 billing 종속 후보가 섞이지 않는지 확인
- 12 Billing 문서 작성/상세화 착수 가능 여부 기록

## 3. 제외 범위

- 12 Billing 구현
- post-12 새 TODO 생성
- `GLOBAL_B2C_FEATURE_ROADMAP_PLAN` 최종 종료 처리
- follow-up 후보 구현

## 4. 완료 기준

- [ ] G01~G05 결과가 모두 문서화됐다.
- [ ] 남은 12 전 blocker가 없거나 명확히 기록됐다.
- [ ] 12 Billing 착수 가능 여부가 기록됐다.
- [ ] 12 이후 다시 볼 후보가 post-12 또는 billing 종속으로 분리되어 있다.

## 5. 관련 문서

- `TODO/BEFORE_12_TASKS/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX`
