export {
  DEAL_ACTIVITY_LINKED_RECORD_TARGET_TYPES,
  createDealActivityIfAbsent,
  createDealActivityLinkedRecord,
  createDealLinkedRecord,
  createSafeActivitySummary,
  normalizeDealActivityTargetPath,
} from "@/shared/application/deal/deal-activity-writer.port";

export type {
  DealActivityLinkedRecordTargetType,
  DealActivityLinkedRecordValue,
} from "@/shared/application/deal/deal-activity-writer.port";
