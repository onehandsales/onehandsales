# G01 Document Contract Sync

상태: Completed
목표: 11 Admin Operation 구현 전 현재 코드/DB/문서 계약을 다시 대조하고, 이후 goal이 참조할 계약을 확정 상태로 맞춘다.

## 1. 포함 범위

- `BE/prisma/schema.prisma` 확인
- `BE/prisma/migrations` 최신 migration 확인
- `FE/admin-web` route/placeholder 상태 확인
- `BE` AdminGuard/AuthGuard 현재 구현 확인
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN` 기반 항목 coverage 확인
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN` 기반 항목 coverage 확인
- 10번 Mobile/PWA와 BusinessCard safe failure migration 충돌 여부 확인

## 2. 제외 범위

- 실제 API 구현
- DB migration 작성
- Admin Web 화면 구현
- User Web Trash/account 화면 수정

## 3. Backend 작업

1. `/admin/api/me` 현재 controller/use case/guard를 확인한다.
2. AdminGuard가 없거나 약하면 G02에서 처리하도록 TODO를 기록한다.
3. `BE/prisma/schema.prisma`에서 Admin 관련 신규 model 부재를 확인한다.
4. provider failure source model을 확인한다.
5. Trash soft delete field가 있는 domain을 확인한다.

## 4. Frontend 작업

1. `FE/admin-web/src/app/router/router.tsx` route 상태를 확인한다.
2. `/users`, `/analytics`, `/audit-logs`, `/provider-failures`, `/system` route placeholder 여부를 기록한다.
3. Admin Web이 User Web feature를 import하고 있지 않은지 확인한다.

## 5. Request 계약

신규 HTTP request 없음.

확인 대상 API 계약:

- `COMMON/API-SPEC/ADMIN_AUDIT_SECURITY_API.md`
- `COMMON/API-SPEC/ADMIN_USER_OPERATION_API.md`
- `COMMON/API-SPEC/ADMIN_TRASH_OPERATION_API.md`
- `COMMON/API-SPEC/ADMIN_PROVIDER_FAILURE_API.md`
- `COMMON/API-SPEC/ADMIN_ANALYTICS_API.md`
- `COMMON/API-SPEC/ADMIN_SYSTEM_OPERATION_API.md`

## 6. Response 계약

신규 HTTP response 없음.

문서 산출 response:

```text
G01 완료 기록에 확인한 코드 파일, schema 상태, migration 상태, 구현 전 blocker를 적는다.
```

## 7. Business Logic

- 11의 모든 구현은 G02 audit/security foundation 이후 진행한다.
- 결제/구독이 11에 들어오면 G01에서 blocker로 기록한다.
- 10번 BusinessCard safe failure migration이 이미 존재하면 11에서 중복 DB 변경을 만들지 않는다.

## 8. User Flow

1. 작업자가 G01 문서를 연다.
2. references 문서와 AGENT 문서를 읽는다.
3. 현재 BE/FE/DB 상태를 대조한다.
4. blocker가 있으면 G02 이후 goal에 넘긴다.
5. 문서 완료 기록을 남긴다.

## 9. DB/Prisma 영향

DB 변경 없음.

필수 확인:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`

## 10. 주석 기준

코드 변경이 없으므로 신규 주석 없음.

## 11. 검증

```powershell
rg -n "model Admin|AdminAudit|SensitiveAccess|TrashRecovery|AccountDeletion|DataExport|OperationCheck" BE/prisma/schema.prisma
rg -n "/admin/api|AdminGuard|role.*ADMIN" BE/src FE/admin-web/src
rg -n "BusinessCardScanLog|safeErrorCode|safeErrorMessage|retryable" BE/prisma/schema.prisma BE/prisma/migrations
```

## 12. Goal 체크리스트

- [x] `BE/prisma/schema.prisma`를 확인했다.
- [x] migration 목록과 최신 migration을 확인했다.
- [x] `FE/admin-web` route 상태를 확인했다.
- [x] `/admin/api/me` 현재 구현을 확인했다.
- [x] Admin audit/security 신규 DB model 부재를 확인했다.
- [x] Trash soft delete field와 만료 의미를 확인했다.
- [x] provider failure source model을 확인했다.
- [x] 10번 BusinessCard safe failure와 충돌하지 않음을 확인했다.
- [x] 결제/구독 범위가 11에 없는지 확인했다.
- [x] 확인 결과와 blocker를 완료 기록에 남겼다.

## 13. 완료 기록

- 완료일: 2026-08-01
- 작업 성격: 문서/코드/DB/API 계약 sync. 실제 API 구현, DB migration 작성, Admin Web 화면 구현, User Web Trash/account 화면 수정은 수행하지 않았다.
- 참조한 UXUI 기준: `AGENT/UXUI_AGENT/README.md`, `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`, `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`, `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`, `AGENT/UXUI_AGENT/DECISIONS/014_uxui_admin_tone.md`, `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`, `AGENT/UXUI_AGENT/DECISIONS/016_uxui_writing_tone.md`, `AGENT/UXUI_AGENT/DECISIONS/018_uxui_multilingual_font_stack.md`, `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`.
- 참조한 Software 기준: `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`, `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`, `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`, `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`, `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`, `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`.

### 13.1 실행한 확인 명령

```powershell
rg --files AGENT/UXUI_AGENT
rg --files AGENT/SOFTWARE_AGENT
find BE/prisma/migrations -mindepth 1 -maxdepth 1 -type d | sort | tail -n 20
rg -n "model Admin|AdminAudit|SensitiveAccess|TrashRecovery|AccountDeletion|DataExport|OperationCheck" BE/prisma/schema.prisma
rg -n "model User\b|enum UserRole|role.*UserRole|model BusinessCardScanLog|model AiProviderCallLog|model NotificationDeliveryAttempt|model FollowUpDeliveryAttempt|model ExternalCalendarConnection|model ExternalCalendarSource|model ProductAnalyticsEvent|model UserActivationSnapshot|model RetentionCohortSnapshot" BE/prisma/schema.prisma
awk '/^model / {model=$2} /deletedAt|deletedByUserId|trashExpiresAt/ {print FNR ":" model ":" $0}' BE/prisma/schema.prisma
rg -n "/admin/api|AdminGuard|role.*ADMIN" BE/src FE/admin-web/src
rg -n "BusinessCardScanLog|safeErrorCode|safeErrorMessage|retryable" BE/prisma/schema.prisma BE/prisma/migrations/20260731010000_add_business_card_safe_failure_fields/migration.sql
rg -n "from \".*user-web|from '.*user-web|src/lib/api-client|@/features/.*/.*user|/api/" FE/admin-web/src
rg -n "createDeletedWhere|createDetailWhere|gt: input\\.now|COMPANY_PRIVATE_MEMO_LOG|CONTACT_PRIVATE_MEMO_LOG|PRODUCT_PRIVATE_MEMO_LOG|비밀 메모" BE/src/modules/trash/infrastructure/persistence/prisma-trash.repository.ts
git status --short
```

### 13.2 현재 코드/DB 확인 결과

- `BE/prisma/schema.prisma`에는 `User.role=ADMIN`과 `UserRole` enum이 있다.
- `AdminAuditLog`, `AdminSensitiveAccessLog`, `TrashRecoveryRequest`, `AccountDeletionRequest`, `UserDataExportRequest`, `AdminOperationCheckRun`은 아직 없다. `rg` 검색 결과가 없어 G02/G05/G08/G09에서 신규 schema/migration이 필요하다.
- 최신 migration은 `BE/prisma/migrations/20260731010000_add_business_card_safe_failure_fields`다.
- 10번 BusinessCard safe failure 산출물인 `BusinessCardScanLog.safeErrorCode`, `safeErrorMessage`, `retryable`과 index/comment가 이미 존재한다. 11에서 중복 migration을 만들지 않는다.
- provider failure source model은 현재 schema 기준 `AiProviderCallLog`, `BusinessCardScanLog`, `NotificationDeliveryAttempt`, `FollowUpDeliveryAttempt`, `ExternalCalendarConnection`, `ExternalCalendarSource`가 있다.
- Admin analytics source model은 현재 schema 기준 `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot`, `AiProviderCallLog`가 있다.
- soft delete field는 `Company`, `Contact`, `ContactMemoLog`, `ContactUserPrivateMemoLog`, `Product`, `ProductMemoLog`, `ProductUserPrivateMemoLog`, `Deal`, `DealFollowingActionLog`, `DealMemoLog`, `Schedule`, `MeetingNote`, `CompanyMemoLog`, `CompanyUserPrivateMemoLog`에 `deletedAt`, `deletedByUserId`, `trashExpiresAt` 기준으로 존재한다. `ImportUploadedFile`에는 `deletedAt`만 있다.
- 현재 Trash repository는 목록/detail 조회에서 `trashExpiresAt > now` 조건을 사용한다. G05에서는 `trashExpiresAt`을 물리 삭제 시각이 아니라 무료 self-restore 만료 시각으로 보고, 만료 row도 User Web에 남겨 `restoreWindow`, `canRestore`, `canRequestRecovery`, `recoveryRequest`를 반환하도록 바꿔야 한다.
- private memo Trash 상세는 현재 원문을 select하지 않고 `비밀 메모는 복구 후 상세 화면에서 확인할 수 있습니다.` 안내 문구를 반환한다. G05에서는 이 원칙을 유지하면서 `hasPrivateMemo`, `privateMemoIncluded=false` 계약을 명시해야 한다.
- `BE/prisma/seed.ts`는 local admin user(`local.admin@example.com`, `UserRole.ADMIN`)를 만든다. 11 신규 운영 table seed는 없다.

### 13.3 Backend/Admin API 확인 결과

- G01 착수 당시 Admin API controller는 `BE/src/modules/auth/presentation/http/me.controller.ts`의 `GET /admin/api/me`만 확인됐다. 이후 11 Admin Operation foundation에서 `BE/src/modules/admin-operation`의 `/admin/api/*` 운영 조회, 민감 원문 조회, 감사 로그, provider failure, analytics, account/trash/system queue API가 구현됐다.
- `GET /admin/api/me`는 `@UseGuards(AuthGuard, AdminGuard)`를 사용한다.
- `BE/src/shared/presentation/guards/admin.guard.ts`는 `request.currentUser.role !== "ADMIN"`이면 `ForbiddenException`을 던진다.
- `AuthGuard`, `AdminGuard`, `AdminMeController`에는 현재 Backend 주석 규칙의 `// 역할 :`, `// 기능 :`, `// API :`, numbered step comment가 있다.
- G02 이후 Admin API는 User API와 같은 controller에서 role 분기로 섞지 말고 `/admin/api/*` controller/use case 경계로 분리해야 한다.

### 13.4 Admin Web 확인 결과

- `FE/admin-web/src/app/router/router.tsx` 기준 현재 route는 `/login`, `/` shell, 그리고 `/users`, `/users/:userId`, `/organizations`, `/subscriptions`, `/analytics`, `/audit-logs`, `/system`, `/support`의 `/` redirect다.
- 현재 `/subscriptions` route는 기존 placeholder redirect이며 11의 결제/구독 구현 또는 노출 범위로 보지 않는다. G02 이후에도 결제/구독 화면은 11에서 노출하지 않는다.
- 11 문서가 요구하는 `/provider-failures`, `/trash/recovery-requests`, `/users/:userId/trash`, `/users/:userId/domain`, `/account-requests` route는 아직 없다.
- `FE/admin-web/src/lib/admin-api-client.ts`는 `${env.apiUrl}/admin/api${path}`만 호출하므로 Admin API prefix 경계는 현재 맞다.
- `FE/admin-web`에서 User Web feature 또는 User Web `api-client.ts`를 import하는 경로는 발견되지 않았다.
- `FE/admin-web/src/features/admin-query`에는 오래된 Admin query 화면/API 함수가 남아 있고, 일부 path는 11 API-SPEC과 다르다. G02 이후 Admin Web 구현 시 그대로 확장하지 말고 11 `COMMON/API-SPEC` 기준으로 정리하거나 교체해야 한다.

### 13.5 11 계약과 source plan coverage 확인

- `COMMON/API-SPEC` 문서들은 `Confirmed Planning` 상태이며 G02~G09 endpoint 계약을 가진다.
- `SOURCE-PLAN-COVERAGE.md` 기준 NBA-005, NBA-007, NBA-011, NBA-012, NBA-013, NBA-014와 09/10 이관분은 11 목표에 반영되어 있다.
- 결제/구독/plan/payment/invoice/refund/churn/ARPU/LTV/CAC는 11 실행 response/API/화면 범위에 넣지 않고 `TODO/PADDLE_PLAN`으로 이관한다.

### 13.6 구현 전 blocker와 후속 전달

- Blocker: G02 audit/security foundation 전에는 G03 이후 Admin 조회 API를 구현하지 않는다.
- G02 전달: Admin audit/sensitive access schema와 migration, append-only audit repository, reason validation, raw access fieldSet allowlist가 필요하다.
- G03 전달: 사용자 summary에는 notification/browser push safe summary만 포함하고 endpoint/key/userAgent 원문을 select/response/log에 넣지 않는다.
- G05 전달: 현재 Trash 조회는 만료 row를 제외하므로, 만료 row 노출/복구 문의 계약에 맞게 repository와 response를 바꿔야 한다. hard delete/purge는 만들지 않는다.
- G06 전달: provider failure는 기존 safe log source read model로만 만들고 신규 generic `ProviderFailureLog` table이나 provider raw 저장을 만들지 않는다.
- G07 전달: analytics overview는 09 `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot`과 10 mobile field-use event aggregate만 사용한다. billing-linked 지표는 제외한다.
- G08 전달: account deletion/data export는 policy-sensitive이므로 실행 전 privacy/legal wording과 30일 유예/취소 정책을 다시 확인한다.
- G09 전달: Admin API는 migrate/seed/backup/restore shell command를 직접 실행하지 않고 점검 결과만 기록한다. notes에는 secret/DB URL/token 저장을 차단해야 한다.

### 13.7 검증 결과

- `git status --short`: 출력 없음. 작업 전 기준 worktree는 깨끗했다.
- G01은 문서 sync goal이므로 `pnpm` typecheck/lint/test/build와 Prisma generate/migrate는 실행하지 않았다.
- 코드 작성은 없었으므로 신규 한글 코드 주석 검증 대상은 없다. 기존 확인 대상 코드의 주석 규칙은 위 확인 결과에 기록했다.
