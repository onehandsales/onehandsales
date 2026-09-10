-- Drop admin-operation-only audit and system check persistence.
DROP TABLE IF EXISTS "AdminSensitiveAccessLog";
DROP TABLE IF EXISTS "AdminAuditLog";
DROP TABLE IF EXISTS "AdminOperationCheckRun";

DROP TYPE IF EXISTS "AdminSensitiveFieldSet";
DROP TYPE IF EXISTS "AdminTargetType";
DROP TYPE IF EXISTS "AdminAuditResult";
DROP TYPE IF EXISTS "AdminAuditAction";
DROP TYPE IF EXISTS "AdminOperationCheckRunStatus";
