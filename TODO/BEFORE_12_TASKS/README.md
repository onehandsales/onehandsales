# Before 12 Tasks

상태: Draft / Skeleton
작성일: 2026-08-07
성격: 12 Billing 착수 전 closeout 작업 계획
기준 문서: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK`

## 1. 목적

이 폴더는 `12_BILLING_SUBSCRIPTION_TAX` 착수 전에 닫아야 하는 PRE12 후속 작업만 별도 실행 계획으로 분리한다.

이번 계획은 새 제품 기능 구현 계획이 아니다. `PRE12_FOLLOWUP_RECHECK`에서 12 전에 할 것으로 분류된 운영 smoke와 문서 정합성 정리만 다룬다.

## 2. 포함 범위

| PRE12 ID | Before 12 Goal | 작업 성격 |
| --- | --- | --- |
| `PRE12-F04` | G01 Provider Smoke Closeout | Gmail/Microsoft provider smoke 실행 조건과 결과 기록 |
| `PRE12-F31` | G02 10 Mobile Checklist Closeout | 10 Mobile Field Use 문서 체크리스트 정합성 |
| `PRE12-F32` | G03 User Web Route Architecture Closeout | User Web route/architecture 문서 정합성 |
| `PRE12-F33` | G04 11 Admin Checklist Closeout | 11 Admin Operation 문서 체크리스트/goal index 정합성 |
| `PRE12-F34` | G05 Admin Web Architecture Legacy Closeout | Admin Web architecture/legacy route 정합성 |
| closeout | G06 Before 12 Closeout And Handoff | 12 Billing 착수 전 최종 handoff |

## 3. 제외 범위

- 신규 Backend API 추가
- 신규 Prisma migration 추가
- 신규 User Web route 활성화
- 신규 Admin Web route 활성화
- `/app/export` 활성화
- `/api/exports`, `ExportJob`, `UserDraft`, `/api/drafts/*` 추가
- Billing, subscription, plan, entitlement, payment, invoice, refund, tax, paywall 구현
- Customer/B2B tenant admin, organization/member/role/permission 구현
- Admin 직접 Trash 복구, 유료 복구, hard delete, purge 구현
- stale 문서에 맞추기 위한 `/app/notifications` rollback
- legacy `admin-query` route/API 활성화

## 4. 실행 순서

상세 순서는 `COMMON/GOAL-WORK-ORDER.md`를 따른다.

```text
G01 Provider Smoke Closeout
-> G02 10 Mobile Checklist Closeout
-> G03 User Web Route Architecture Closeout
-> G04 11 Admin Checklist Closeout
-> G05 Admin Web Architecture Legacy Closeout
-> G06 Before 12 Closeout And Handoff
```

## 5. 완료 판정

- `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`가 각각 결과 문서로 닫힌다.
- 변경된 문서가 실제 BE/FE 코드 상태와 충돌하지 않는다.
- 12 Billing 착수 전 새 API/DB/route 구현이 발생하지 않는다.
- `PRE12_FOLLOWUP_RECHECK`와 이 폴더의 상태가 서로 맞는다.
- 12 Billing으로 넘길 항목과 post-12로 넘길 항목이 다시 섞이지 않는다.

## 6. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/CANDIDATE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/GOAL-SPECS/G05_PROVIDER_SMOKE_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/GOAL-SPECS/G11_10_MOBILE_PWA_FIELD_USE_FOLLOWUP_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/GOAL-SPECS/G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT`
