# G04 11 Admin Checklist Closeout

상태: Ready For Goal
연결 PRE12 ID: `PRE12-F33`
성격: 11 Admin Operation 문서 정합성 closeout

## 0. 착수 체크리스트

- [ ] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION` 전체 상태를 확인한다.
- [ ] 11 G10 QA/document closeout 결과를 확인한다.
- [ ] 실제 `BE/src/modules/admin-operation`, `account-request`, `trash` 상태를 확인한다.
- [ ] 실제 `FE/admin-web/src/app/router/router.tsx`와 Admin Web features 상태를 확인한다.
- [ ] `BE/prisma/schema.prisma`에서 11 Admin 관련 DB 상태를 확인한다.
- [ ] 새 API/DB/route를 만들지 않는 기준을 확인한다.
- [ ] 코드 변경 발생 시 한글 주석 규칙과 typecheck/lint gate를 확인한다.

## 1. 목표

11 Admin Operation의 상위 checklist, goal index, BE/FE TODO 문서를 실제 완료 상태와 맞춘다.

## 2. 포함 범위

- `11_ADMIN_OPERATION/README.md` 상태 정합성
- `11_ADMIN_OPERATION/COMMON/GOAL-COMPLETION-CHECKLIST.md` 정합성
- `11_ADMIN_OPERATION/COMMON/GOAL-SPECS/README.md` 정합성
- `11_ADMIN_OPERATION/COMMON/GOAL-IMPLEMENTATION-MATRIX.md` 정합성
- `11_ADMIN_OPERATION/BE-TODO/API-TODO.md` 정합성
- `11_ADMIN_OPERATION/BE-TODO/DB-SCHEMA.md` 정합성
- `11_ADMIN_OPERATION/FE-TODO/ADMIN-WEB-TODO.md` 정합성
- G01~G10 개별 goal 상태와 상위 문서 상태 비교
- 완료된 항목의 `[x]` 보정과 closeout 근거 기록

## 3. 제외 범위

- Admin route/API rollback
- Admin direct domain mutation 구현
- Admin Trash 복구 mutation, 유료 복구, hard delete, purge 구현
- export artifact 생성/download endpoint 구현
- account deletion hard delete/anonymization job 구현
- billing/subscription/Admin Billing 구현
- Customer/B2B tenant admin 구현
- 새 Admin API 또는 route 추가

## 4. 확인 대상

문서:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/BE-TODO/API-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/BE-TODO/DB-SCHEMA.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/FE-TODO/ADMIN-WEB-TODO.md`

코드:

- `BE/src/modules/admin-operation`
- `BE/src/modules/account-request`
- `BE/src/modules/trash`
- `BE/prisma/schema.prisma`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/admin-web/src/features`
- `FE/admin-web/src/components/layout/admin-shell.tsx`

## 5. Request/Response 체크

G04는 새 API를 만들지 않는다.

- 11 Admin Operation에서 구현된 API 상태를 문서에 반영한다.
- `/admin/api/*` billing/customer admin API를 추가하지 않는다.
- Admin direct mutation API를 추가하지 않는다.
- request/response 변경 필요가 보이면 12 또는 post-12 후보로 기록한다.

## 6. Business Logic / User Flow 체크

- Admin Web의 현재 활성 route와 API 계약이 11 문서와 맞는지 확인한다.
- Admin direct mutation, B2B tenant admin, Billing Admin은 11 완료 범위가 아니다.
- Admin 운영 화면은 desktop-first, 표/필터/상태 중심의 실무형 구조를 유지한다.
- 사용자 데이터 원문/민감정보 접근은 11의 audit/security 계약을 유지한다.

## 7. DB/Prisma 체크

- `AdminAuditLog`, `AdminOperationCheckRun`, `TrashRecoveryRequest`, `AccountDataRequest` 등 11 관련 모델 상태를 확인한다.
- billing/subscription/customer admin 모델을 추가하지 않는다.
- DB 변경이 필요하면 현재 goal에서 구현하지 않는다.

## 8. 작업 순서

1. 11 상위 README와 G10 closeout을 읽는다.
2. 11 goal completion checklist와 goal specs README를 실제 완료 상태와 비교한다.
3. BE/FE TODO의 planning/stale 문구를 실제 완료 상태와 비교한다.
4. 실제 BE/FE 코드 경로와 Prisma schema를 확인한다.
5. 완료된 항목은 `[x]`로 보정하고 근거를 남긴다.
6. Billing/B2B/Admin mutation 후보는 후속 또는 12 종속으로 유지한다.

## 9. 검증 명령

Backend:

```bash
cd BE
pnpm run typecheck
pnpm run lint
```

Frontend:

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
```

문서/정적 확인:

```bash
git diff --check
rg -n "Subscription|Billing Admin|CustomerAdmin|direct mutation|hard delete|paid recovery" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION TODO/BEFORE_12_TASKS
```

## 10. 완료 기준

- [ ] 11 상위 checklist가 G10 closeout 및 실제 코드 상태와 맞는다.
- [ ] 11 goal index가 G01~G10 완료/구현 상태와 맞는다.
- [ ] BE/FE TODO가 planning 상태로 오해되지 않게 정리됐다.
- [ ] Billing/B2B/Admin mutation 후속 후보가 11 미완성처럼 표시되지 않는다.
- [ ] BE typecheck/lint가 통과했다.
- [ ] FE admin-web typecheck/lint가 통과했다.

## 11. 결과 기록 위치

권장 결과 기록:

```text
TODO/BEFORE_12_TASKS/TODO_LOG/<YYYY-MM-DD>/G04_11_ADMIN_CHECKLIST_CLOSEOUT/WORK_LOG.md
```

## 12. 권장 실행 문구

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md 기준으로 G04를 진행해줘.
```

## 13. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/GOAL-SPECS/G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/FE-TODO/ADMIN-WEB-TODO.md`
- `TODO/BEFORE_12_TASKS/BE-TODO/API-TODO.md`
