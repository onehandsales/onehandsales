# Goal Implementation Matrix

상태: Confirmed

| Goal | Backend | DB | Admin Web | User Web | API Spec |
|---|---|---|---|---|---|
| G01 | 문서/코드 계약 확인 | 없음 | 없음 | 없음 | 전체 점검 |
| G02 | AdminGuard/audit/raw access | AdminAuditLog, AdminSensitiveAccessLog | audit logs, raw reason modal | 없음 | ADMIN_AUDIT_SECURITY_API |
| G03 | users summary/activity/notification safe summary API | 없음 | users list/detail | 없음 | ADMIN_USER_OPERATION_API |
| G04 | domain records read-only API | 없음 | domain tabs/detail drawer | 없음 | ADMIN_DOMAIN_READONLY_API |
| G05 | trash admin/user recovery API | TrashRecoveryRequest | trash/recovery queue | `/app/trash` 만료 row | ADMIN_TRASH_OPERATION_API, TRASH_USER_RECOVERY_API |
| G06 | provider failure read model | 없음 | provider failures | 없음 | ADMIN_PROVIDER_FAILURE_API |
| G07 | analytics overview/mobile field-use aggregate API | 없음 | analytics overview | 없음 | ADMIN_ANALYTICS_API |
| G08 | account/data request API | AccountDeletionRequest, UserDataExportRequest | account request queue | `/app/settings` 요청 flow | ACCOUNT_DATA_REQUEST_API |
| G09 | system operation check API | AdminOperationCheckRun | system gate | 없음 | ADMIN_SYSTEM_OPERATION_API |
| G10 | QA closeout | 없음 | QA | 영향 goal만 QA | 전체 |
