-- RenameIndex
DO $$
BEGIN
  IF to_regclass('"NotificationDeliveryAttempt_notificationId_channel_createdAt_id"') IS NOT NULL
    AND to_regclass('"NotificationDeliveryAttempt_notificationId_channel_createdA_idx"') IS NULL
  THEN
    ALTER INDEX "NotificationDeliveryAttempt_notificationId_channel_createdAt_id" RENAME TO "NotificationDeliveryAttempt_notificationId_channel_createdA_idx";
  END IF;
END $$;
