# G12 11 Admin Operation Follow-up Closeout

상태: Completed
작성일: 2026-08-06
검토일: 2026-08-07
최종 반영일: 2026-08-10
목표: 11 Admin Operation의 완료 범위와 남은 후속 후보를 재대조하고, 11 미완성으로 오해하지 않도록 PRE12 후보로 분리한다.

## 1. 판단 근거

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `BE/prisma/schema.prisma`
- `BE/src/modules/admin-operation`
- `BE/src/modules/account-request`
- `BE/src/modules/trash`
- `FE/admin-web`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/user-web/src/lib/api-client.ts`

## 2. 재검토 결론

11 Admin Operation은 구현 완료로 유지한다.

확인된 완료 범위:

- `BE/src/modules/admin-operation/presentation/http`의 `/admin/api/*`가 User API와 분리되어 있고 AuthGuard/AdminGuard를 사용한다.
- Admin 사용자 목록/상세, 활동 timeline, 도메인 read-only records, Trash summary/records, provider failure, analytics overview, account request queue, trash recovery request queue, audit log, system operation gate API가 있다.
- Admin domain records는 read-only/masked 조회 범위이며 Admin이 도메인 records를 직접 생성/수정/삭제/복구하는 mutation endpoint는 없다.
- `FE/admin-web/src/app/router/router.tsx` 기준 Admin Web에 `/users`, `/users/:userId`, `/users/:userId/domain`, `/users/:userId/trash`, `/provider-failures`, `/account-requests`, `/trash/recovery-requests`, `/analytics`, `/audit-logs`, `/system` route가 있다.
- `FE/admin-web/src/app/router/router.tsx`에서 `/organizations`, `/subscriptions`, `/support`는 `/`로 redirect된다. 이는 Customer/B2B tenant admin이나 Billing Admin이 완료됐다는 의미가 아니다.
- `BE/prisma/schema.prisma`와 `20260801010000`~`20260801040000` migration에 `AdminAuditLog`, `AdminSensitiveAccessLog`, `TrashRecoveryRequest`, `AccountDeletionRequest`, `UserDataExportRequest`, `AdminOperationCheckRun` schema가 있다.
- `BE/prisma/schema.prisma`의 `UserRole`은 `USER`/`ADMIN`만 있고 `Tenant`, `Organization`, `OrgMember`, `TenantAdmin` model/role은 없다.
- `FE/user-web/src/lib/api-client.ts`는 `/admin/api/*` 호출을 차단한다.
- provider raw/prompt/token/quota detail, browser push endpoint/key/userAgent 원문, analytics raw payload, private memo 원문은 Admin/User response/log에 노출하지 않는 테스트와 safe select 기준이 있다.
- 11 Admin analytics는 09/10 foundation을 읽는 운영 요약이며 billing/subscription 지표를 만들지 않는다.
- `FE/admin-web/src/pages/dashboard`, `FE/admin-web/src/pages/organizations`, `FE/admin-web/src/features/admin-query`에는 과거 Admin query 화면/API path 잔여 코드가 있지만, 현재 router에서 `/dashboard`는 열려 있지 않고 `/organizations`는 `/`로 redirect된다. 이 잔여 코드는 11 기능 미구현이 아니라 `PRE12-F34` 정합성 정리 범위로 본다.

따라서 11을 다시 구현 goal로 열지 않는다. 남은 항목은 11 미완성이 아니라 후속 정책/운영/문서 정합성 후보로 분류한다.

2026-08-07 2차 재검토 결과, 기존 PRE12에는 11 원문에서 제외한 Admin 직접 도메인 데이터 수정과 Customer/B2B tenant admin이 명시 후보로 빠져 있었다. 따라서 `PRE12-F44`, `PRE12-F45`로 추가 분리한다. 또한 ImportJob cleanup 실패 전용 Admin aggregate/system gate는 11 system gate 완료 범위가 아니라 기존 `PRE12-F13` import/Admin ops 확장에 연결한다.

2026-08-09 BEFORE_12 G04/G05에서 `PRE12-F33`, `PRE12-F34` 문서 정합성 closeout을 완료했다. 따라서 11 관련 PRE12 문서 정합성 잔여는 없다.

2026-08-10 추가 QA 재검토에서 Admin provider failure 목록이 한 source에 편중될 때 cursor pagination이 조기 종료될 수 있는 Finding을 확인했고, `BE/src/modules/admin-operation/infrastructure/persistence/prisma-admin-provider-failure.repository.ts`에서 source별 batch 조회로 끝까지 후보를 모은 뒤 기존 global cursor를 적용하도록 수정했다. `prisma-admin-provider-failure.repository.spec.ts`에는 305건 편중 회귀 테스트를 추가했으며, 이 Finding은 11 완료 범위의 품질 보정으로 닫는다.

## 3. 새 PRE12 후보

| 후보 | PRE12 ID | 분류 | 판단 |
| --- | --- | --- | --- |
| 11 문서 체크리스트/goal index 정합성 | `PRE12-F33` | closed-by-BEFORE_12 | `README`와 G10 closeout 및 실제 코드 기준 완료 상태와 문서 checklist/goal index 정합성은 BEFORE_12 G04에서 닫았다. |
| Admin Web architecture/legacy route 정합성 | `PRE12-F34` | closed-by-BEFORE_12 | 실제 Admin Web route/API와 비활성 legacy route 기준은 BEFORE_12 G05에서 정리 완료됐다. |
| Admin 직접 Trash 복구 실행/유료 복구/Trash hard delete/purge | `PRE12-F35` | billing-blocked / recovery-policy | 11은 User self-restore, 만료 row 유지, User 복구 문의, Admin recovery queue까지 완료했다. Admin mutation, 유료 복구 결제, hard delete/purge는 11 범위가 아니며 recovery policy와 Paddle Billing 이후 판단한다. |
| User data export artifact 생성/download endpoint | `PRE12-F36` | 후속 seed / `PRE12-F09` 연결 | 11은 data export request와 Admin queue를 구현했다. 실제 export artifact 생성 processor, storage signed URL, download controller는 없다. `downloadUrl` 계약은 artifact가 준비된 경우를 표현하지만 후속 ExportJob/file retention 계약 전에는 endpoint를 열지 않는다. |
| 자동 민감정보 감지 | `PRE12-F37` | defer / 정책 필요 | 11의 masking/raw access/audit와 별개로 자동 PII/sensitive detection은 구현되지 않았다. `GLOBAL` coverage에는 후속 별도 결정으로 남아 있으므로 보안/data governance 계획 전 구현하지 않는다. |
| Admin direct domain data mutation and recovery action policy | `PRE12-F44` | defer / ops-policy | 11은 Admin domain records를 read-only/masked 조회로 닫았다. 실제 Admin API/FE에 Company/Contact/Product/Deal/Schedule/MeetingNote/BusinessCard/Import 직접 수정/삭제/복구 mutation과 action UI는 없다. ownership, 사용자 통지, audit/result, rollback, redaction 기준 전 구현하지 않는다. |
| Customer/B2B tenant admin and organization admin model | `PRE12-F45` | defer / B2B-strategy | 11 Admin은 내부 onehand.sales 최종 관리자용이다. schema에는 tenant/org/member/customer-admin 역할 모델이 없고 `/organizations`는 redirect다. tenant/org/member/role/permission/billing/support 경계가 확정되기 전 내부 AdminGuard/Admin Web을 고객 관리자 기능으로 재사용하지 않는다. |

## 4. 기존 PRE12 후보와 연결

| 항목 | 기존 PRE12 후보 | 처리 |
| --- | --- | --- |
| billing/subscription/tax/paywall/churn/paid conversion/AI usage billing source | `PRE12-F12` | PRE12 구현 금지. `TODO/PADDLE_PLAN`에서 plan/payment/subscription/tax/refund/invoice/failed payment, source-of-truth와 Admin Billing 연동을 결정한다. |
| backup/restore runbook/drill | `PRE12-F11` | 11 system gate는 점검 결과 기록용이다. 실제 운영 절차와 장애 대응 drill은 별도 운영 절차 후보로 유지한다. |
| ImportJob Admin 전용 화면/API와 cleanup failure aggregate/system gate | `PRE12-F13` | 01/11 미완성이 아니다. 01 cleanup은 safe summary log 범위이고 11 system gate는 generic operation check 기록이다. import scale/source/Admin ops 전략에서 후속 재검토한다. |
| account deletion 실제 hard delete/anonymization job | `PRE12-F26` | 11은 요청/취소/Admin queue까지만 닫았다. 실제 job은 privacy/legal/session revoke/access block/billing 영향 결정 전 구현하지 않는다. |
| generic ExportJob/PDF/bulk export | `PRE12-F09` | 11 data export artifact/download 후보(`PRE12-F36`)와 함께 file TTL, ownership, audit, Admin queue 기준으로 재검토한다. |

## 5. 11 완료 범위로 다루면 안 되는 것

- 결제/구독/plan/payment/invoice/refund/failed payment/tax/Admin Billing 화면/API 추가
- Admin 직접 Trash 복구 mutation, 유료 복구 결제, Trash hard delete/purge 추가
- Admin domain read-only records를 Company/Contact/Product/Deal/Schedule/MeetingNote/BusinessCard/Import 직접 수정/삭제/복구 mutation으로 확장
- Admin system gate에서 migrate/seed/backup/restore shell command 실행
- `/organizations` redirect를 customer-facing tenant admin으로 활성화하거나 tenant/org/member role model 추가
- ImportJob cleanup 실패 전용 Admin 화면/API/집계/gate 추가
- 실제 account deletion hard delete/anonymization processor 추가
- export artifact 생성 worker, storage signed URL provider, download endpoint 추가
- 자동 민감정보 감지/DLP model 또는 processor 추가
- stale checklist/architecture 문서를 근거로 11 기능을 재구현

## 6. 검증한 검색 축

```powershell
rg -n "@Controller\(|@UseGuards\(|@Get\(|@Post\(" BE/src/modules/auth/presentation/http/me.controller.ts BE/src/modules/admin-operation/presentation/http BE/src/modules/account-request/presentation/http BE/src/modules/trash/presentation/http/trash.controller.ts
rg -n "model AdminAuditLog|model AdminSensitiveAccessLog|model TrashRecoveryRequest|model AccountDeletionRequest|model UserDataExportRequest|model AdminOperationCheckRun" BE/prisma/schema.prisma
rg -n "rawResponse|prompt|token|quota|endpoint|p256dh|authCiphertext|userAgent|rawPayload|privateMemo|reasonMessage|artifactPath|migrate|seed|backup|restore" BE/src/modules/admin-operation BE/src/modules/trash BE/src/modules/account-request FE/admin-web/src -g "*.ts" -g "*.tsx"
rg -n "data-export-requests/.*/download|data-export-requests/:requestId/download" BE/src/modules/account-request BE/src/modules/admin-operation TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION -g "*.ts" -g "*.md"
rg -n "AdminDashboardScreen|AdminDomainDataScreen|admin-query|/admin/api/dashboard|/sensitive/raw" FE/admin-web/src -g "*.ts" -g "*.tsx"
rg -n "automatic sensitive|자동 민감정보|민감정보 감지|ExportJob|bulk export|Trash hard|유료 복구|Admin Web" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN TODO/NEXT_BACKEND_API_BACKLOG_PLAN TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN -g "*.md"
rg -n "@Post|@Patch|@Put|@Delete|domain-records|UserRole|TenantAdmin|CustomerAdmin|model Tenant|model Organization|tenantId|organizations" BE/src/modules/admin-operation BE/prisma/schema.prisma FE/admin-web/src TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION -g "*.ts" -g "*.tsx" -g "*.md" -g "*.prisma"
```

## 7. 완료 체크리스트

- [x] 11 README/G10 closeout과 실제 BE/FE 구현 상태를 대조했다.
- [x] 11 완료 범위는 유지하고 재구현 goal로 열지 않는다고 기록했다.
- [x] `PRE12-F33`~`PRE12-F37` 후보를 분류했다.
- [x] 2026-08-09 BEFORE_12 G04/G05에서 `PRE12-F33`, `PRE12-F34` closeout 완료를 반영했다.
- [x] 2026-08-07 2차 재대조에서 Admin direct domain mutation을 `PRE12-F44`로 분리했다.
- [x] 2026-08-07 2차 재대조에서 Customer/B2B tenant admin을 `PRE12-F45`로 분리했다.
- [x] 2026-08-07 2차 재대조에서 ImportJob cleanup failure aggregate/system gate를 `PRE12-F13`으로 연결했다.
- [x] 기존 `PRE12-F09`, `PRE12-F11`, `PRE12-F12`, `PRE12-F13`, `PRE12-F26`과 중복되는 항목을 cross-reference로 분리했다.
- [x] 11 관련 후속이 06 작업 범위를 넓히지 않도록 구현 금지 기준을 남겼다.
- [x] Admin Web legacy `admin-query` 잔여 코드는 기능 누락이 아니라 `PRE12-F34` 정합성 정리 범위라고 기록했다.
- [x] `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`에는 있으나 11/PRE12에 빠진 11 직접 후속 후보를 2차 재확인하고 누락분을 보강했다.
- [x] 2026-08-10 Admin provider failure 목록 cursor pagination 편중 누락 Finding을 코드와 회귀 테스트로 해결하고 11 품질 보정으로 기록했다.
