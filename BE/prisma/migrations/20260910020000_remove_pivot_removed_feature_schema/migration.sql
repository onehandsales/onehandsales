-- Drop feature schema removed during pivot simplification.

DROP TABLE IF EXISTS "NotificationDeliveryAttempt";
DROP TABLE IF EXISTS "BrowserPushSubscription";
DROP TABLE IF EXISTS "Notification";
DROP TABLE IF EXISTS "UserNotificationSetting";

DROP TABLE IF EXISTS "ImportJobError";
DROP TABLE IF EXISTS "ImportUploadedFile";
DROP TABLE IF EXISTS "ImportJobRow";
DROP TABLE IF EXISTS "ImportJob";
DROP TABLE IF EXISTS "ImportUserLogRow";
DROP TABLE IF EXISTS "ImportUserLog";
DROP TABLE IF EXISTS "ImportTemplate";

DROP TABLE IF EXISTS "BusinessCardScanLog";

DROP TABLE IF EXISTS "TrashRecoveryRequest";
DROP TABLE IF EXISTS "AccountDeletionRequest";
DROP TABLE IF EXISTS "UserDataExportRequest";

DROP TYPE IF EXISTS "BrowserPushSubscriptionStatus";
DROP TYPE IF EXISTS "NotificationDeliveryStatus";
DROP TYPE IF EXISTS "NotificationDeliveryChannel";
DROP TYPE IF EXISTS "NotificationSourceType";
DROP TYPE IF EXISTS "NotificationStatus";
DROP TYPE IF EXISTS "NotificationType";

DROP TYPE IF EXISTS "ImportJobErrorSeverity";
DROP TYPE IF EXISTS "ImportJobErrorType";
DROP TYPE IF EXISTS "ImportUploadedFileStatus";
DROP TYPE IF EXISTS "ImportJobMappingSource";
DROP TYPE IF EXISTS "ImportJobRowStatus";
DROP TYPE IF EXISTS "ImportJobStatus";
DROP TYPE IF EXISTS "ImportTemplateType";

DROP TYPE IF EXISTS "BusinessCardResolution";
DROP TYPE IF EXISTS "BusinessCardScanStatus";

DROP TYPE IF EXISTS "UserDataExportRequestStatus";
DROP TYPE IF EXISTS "AccountDeletionRequestStatus";
DROP TYPE IF EXISTS "TrashRecoveryRequestStatus";
