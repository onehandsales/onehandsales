import { PrismaFollowUpMessageRepository } from "./prisma-follow-up-message.repository";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const USER_ID = "00000000-0000-4000-8000-000000000101";
const MESSAGE_ID = "00000000-0000-4000-8000-000000000201";
const ATTEMPT_ID = "00000000-0000-4000-8000-000000000301";
const DEAL_ID = "00000000-0000-4000-8000-000000000401";
const CONTACT_ID = "00000000-0000-4000-8000-000000000501";
const NOW = new Date("2026-07-26T05:00:00.000Z");

describe("PrismaFollowUpMessageRepository", () => {
  it("creates redacted deal activities for DEAL targets after delivery success", async () => {
    const client = createMockClient();
    client.followUpMessage.findFirst.mockResolvedValue(createMessageRow());
    client.followUpDeliveryAttempt.updateMany.mockResolvedValue({ count: 1 });
    client.followUpMessage.updateMany.mockResolvedValue({ count: 1 });
    client.dealActivity.findFirst.mockResolvedValue(null);
    client.dealActivity.create.mockResolvedValue(createDealActivityRow());
    const repository = new PrismaFollowUpMessageRepository(
      client as unknown as PrismaService
    );

    const updated = await repository.markDeliverySucceeded({
      userId: USER_ID,
      messageId: MESSAGE_ID,
      attemptId: ATTEMPT_ID,
      provider: "google",
      providerMessageId: "provider-message-1",
      providerStatusCode: "202",
      latencyMs: 120,
      estimatedCostAmount: null,
      costCurrency: null,
      detailJson: { providerRawBody: "raw-secret" },
      sentAt: NOW,
    });

    expect(updated?.id).toBe(MESSAGE_ID);
    expect(client.dealActivity.create).toHaveBeenCalledTimes(1);
    expect(client.dealActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: USER_ID,
        dealId: DEAL_ID,
        activityType: "FOLLOW_UP_SENT",
        sourceType: "FOLLOW_UP",
        sourceId: ATTEMPT_ID,
        title: "이메일 follow-up을 보냈어요.",
        summary: "Kim에게 발송됨",
        body: null,
        metadataJson: {
          messageId: MESSAGE_ID,
          deliveryAttemptId: ATTEMPT_ID,
          channel: "EMAIL",
          recipientName: "Kim",
          safeErrorCode: null,
          safeErrorMessage: null,
        },
      }),
      select: expect.objectContaining({
        id: true,
      }),
    });

    const activityData = client.dealActivity.create.mock.calls[0]?.[0].data;
    const serializedActivity = JSON.stringify(activityData);

    expect(serializedActivity).not.toContain("full follow-up body");
    expect(serializedActivity).not.toContain("kim@example.com");
    expect(serializedActivity).not.toContain("raw-secret");
  });
});

function createMockClient() {
  return {
    followUpDeliveryAttempt: {
      updateMany: jest.fn(),
    },
    followUpMessage: {
      updateMany: jest.fn(),
      findFirst: jest.fn(),
    },
    externalEmailConnection: {
      updateMany: jest.fn(),
    },
    smsSenderNumber: {
      updateMany: jest.fn(),
    },
    dealActivity: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };
}

function createMessageRow() {
  return {
    id: MESSAGE_ID,
    userId: USER_ID,
    sourceReportId: null,
    sourceSuggestionId: null,
    channel: "EMAIL",
    status: "SENT",
    languageTag: "ko-KR",
    emailConnectionId: null,
    smsSenderNumberId: null,
    senderDisplayName: "Sender",
    senderEmail: "sender@example.com",
    senderPhoneE164Masked: null,
    recipientContactId: CONTACT_ID,
    recipientName: "Kim",
    recipientEmail: "kim@example.com",
    recipientPhoneE164Masked: null,
    subject: "Subject",
    body: "full follow-up body",
    bodyPreview: "full follow-up body",
    provider: "google",
    providerMessageId: "provider-message-1",
    safeErrorCode: null,
    safeErrorMessage: null,
    retryable: false,
    retryCount: 0,
    sentAt: NOW,
    failedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    targets: [
      {
        id: "target-contact-1",
        userId: USER_ID,
        messageId: MESSAGE_ID,
        targetType: "CONTACT",
        targetId: CONTACT_ID,
        targetPath: `/contacts/${CONTACT_ID}`,
        targetLabel: "Kim",
        createdAt: NOW,
      },
      {
        id: "target-deal-1",
        userId: USER_ID,
        messageId: MESSAGE_ID,
        targetType: "DEAL",
        targetId: DEAL_ID,
        targetPath: `/deals/${DEAL_ID}`,
        targetLabel: "Acme Renewal",
        createdAt: NOW,
      },
    ],
    deliveryAttempts: [
      {
        id: ATTEMPT_ID,
        userId: USER_ID,
        messageId: MESSAGE_ID,
        channel: "EMAIL",
        status: "SENT",
        attemptNumber: 1,
        provider: "google",
        providerMessageId: "provider-message-1",
        providerStatusCode: "202",
        safeErrorCode: null,
        safeErrorMessage: null,
        retryable: false,
        nextRetryAt: null,
        latencyMs: 120,
        estimatedCostAmount: null,
        costCurrency: "USD",
        sentAt: NOW,
        failedAt: null,
        detailJson: {},
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  };
}

function createDealActivityRow() {
  return {
    id: "activity-1",
    userId: USER_ID,
    dealId: DEAL_ID,
    activityType: "FOLLOW_UP_SENT",
    sourceType: "FOLLOW_UP",
    sourceId: ATTEMPT_ID,
    title: "이메일 follow-up을 보냈어요.",
    summary: "Kim에게 발송됨",
    body: null,
    occurredAt: NOW,
    linkedRecordsJson: [],
    metadataJson: {},
    createdAt: NOW,
    updatedAt: NOW,
  };
}
