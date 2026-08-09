# Backend API TODO

상태: Implemented / G04 Closeout Confirmed

## 1. 공통 규칙

- Admin API는 `/admin/api/*`만 사용한다.
- User API는 `/api/*`만 사용한다.
- Admin API는 AuthGuard + AdminGuard를 모두 통과해야 한다.
- User API와 Admin API를 같은 controller에서 role 분기로 섞지 않는다.
- 민감 원문 응답은 일반 상세 API에 섞지 않는다.
- request/response 계약은 `COMMON/API-SPEC` 문서를 기준으로 구현한다.
- 신규/수정 코드에는 `AGENT/SOFTWARE_AGENT`의 한글 주석 규칙을 적용한다.

## 2. 구현된 API 목록

2026-08-09 G04 closeout 기준 아래 API는 실제 Backend controller와 `COMMON/API-SPEC` 계약을 대조했다.

| Goal | Method | Path | 목적 | 계약 문서 |
|---|---|---|---|---|
| G02 | `GET` | `/admin/api/me` | 관리자 본인 확인 | `ADMIN_AUDIT_SECURITY_API.md` |
| G02 | `GET` | `/admin/api/audit-logs` | 감사 로그 목록 | `ADMIN_AUDIT_SECURITY_API.md` |
| G02 | `POST` | `/admin/api/sensitive/raw-access` | 민감 원문 조회 | `ADMIN_AUDIT_SECURITY_API.md` |
| G03 | `GET` | `/admin/api/users` | 사용자 목록 | `ADMIN_USER_OPERATION_API.md` |
| G03 | `GET` | `/admin/api/users/:userId` | 사용자 상세 요약 | `ADMIN_USER_OPERATION_API.md` |
| G03 | `GET` | `/admin/api/users/:userId/activity-timeline` | 최근 활동 timeline | `ADMIN_USER_OPERATION_API.md` |
| G04 | `GET` | `/admin/api/users/:userId/domain-records` | 사용자 도메인 read-only 탭 | `ADMIN_DOMAIN_READONLY_API.md` |
| G05 | `GET` | `/admin/api/users/:userId/trash-summary` | 사용자 Trash 요약 | `ADMIN_TRASH_OPERATION_API.md` |
| G05 | `GET` | `/admin/api/users/:userId/trash-records` | 사용자 Trash 목록 | `ADMIN_TRASH_OPERATION_API.md` |
| G05 | `POST` | `/api/trash/recovery-requests` | 사용자 복구 문의 생성 | `TRASH_USER_RECOVERY_API.md` |
| G05 | `GET` | `/admin/api/trash/recovery-requests` | 복구 문의 queue | `ADMIN_TRASH_OPERATION_API.md` |
| G06 | `GET` | `/admin/api/provider-failures` | provider 실패 목록 | `ADMIN_PROVIDER_FAILURE_API.md` |
| G06 | `GET` | `/admin/api/provider-failures/:failureId` | provider 실패 safe 상세 | `ADMIN_PROVIDER_FAILURE_API.md` |
| G07 | `GET` | `/admin/api/analytics/overview` | 09/10 기반 운영 분석 요약 | `ADMIN_ANALYTICS_API.md` |
| G08 | `POST` | `/api/users/me/data-export-requests` | 사용자 데이터 export 요청 | `ACCOUNT_DATA_REQUEST_API.md` |
| G08 | `GET` | `/api/users/me/data-export-requests/:requestId` | export 요청 상태 | `ACCOUNT_DATA_REQUEST_API.md` |
| G08 | `POST` | `/api/users/me/account-deletion-requests` | 계정 삭제 요청 | `ACCOUNT_DATA_REQUEST_API.md` |
| G08 | `POST` | `/api/users/me/account-deletion-requests/:requestId/cancel` | 계정 삭제 요청 취소 | `ACCOUNT_DATA_REQUEST_API.md` |
| G08 | `GET` | `/admin/api/account-deletion-requests` | 계정 삭제 요청 queue | `ACCOUNT_DATA_REQUEST_API.md` |
| G08 | `GET` | `/admin/api/data-export-requests` | 데이터 export 요청 queue | `ACCOUNT_DATA_REQUEST_API.md` |
| G09 | `GET` | `/admin/api/system/operation-checks/latest` | 운영 gate 최신 상태 | `ADMIN_SYSTEM_OPERATION_API.md` |
| G09 | `POST` | `/admin/api/system/operation-checks` | 운영 gate 점검 기록 | `ADMIN_SYSTEM_OPERATION_API.md` |

## 3. Backend business logic 필수

- Admin 사용자 상세 조회는 `AdminAuditLog`에 남긴다.
- 민감 원문 조회는 `AdminSensitiveAccessLog`와 `AdminAuditLog`를 같은 transaction에서 남긴다.
- provider failure detail 조회는 provider raw response, prompt, token, quota detail을 조회하지 않는다.
- Admin 사용자 상세 notification summary는 browser push endpoint/key/userAgent 원문을 조회하지 않는다.
- Trash 만료 이후에도 domain row를 hard delete하지 않는다.
- account deletion은 일반 Trash와 별개로 30일 유예 후 실제 삭제/익명화 job 후보를 둔다.
- analytics admin summary는 09 read model과 10 mobile field-use event만 사용하고 billing/subscription source를 조회하지 않는다.

## 4. 검증 기준

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test -- admin
pnpm run test -- trash
pnpm run test -- product-analytics
```

G10 QA closeout에서 Backend 전체 검증이 통과했고, BEFORE_12 G04에서는 `pnpm run typecheck`와 `pnpm run lint`를 재실행한다.
