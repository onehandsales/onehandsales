import type { FollowUpMessageListParams } from "@/features/follow-up-delivery/types/follow-up-delivery";

export const followUpDeliveryQueryKeys = {
  all: ["follow-up-delivery"] as const,
  settings: () => [...followUpDeliveryQueryKeys.all, "settings"] as const,
  messages: () => [...followUpDeliveryQueryKeys.all, "messages"] as const,
  messageList: (params: FollowUpMessageListParams) =>
    [
      ...followUpDeliveryQueryKeys.messages(),
      {
        page: params.page ?? 1,
        sourceReportId: params.sourceReportId ?? "",
        targetId: params.targetId ?? "",
        targetType: params.targetType ?? "",
      },
    ] as const,
  messageDetails: () =>
    [...followUpDeliveryQueryKeys.messages(), "detail"] as const,
  messageDetail: (messageId: string) =>
    [...followUpDeliveryQueryKeys.messageDetails(), messageId] as const,
};
