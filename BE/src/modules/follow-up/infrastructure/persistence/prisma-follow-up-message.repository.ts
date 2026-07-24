import {
  AiProviderCallStatus as PrismaAiProviderCallStatus,
  AiProviderOperation as PrismaAiProviderOperation,
  ExternalEmailConnectionStatus as PrismaExternalEmailConnectionStatus,
  FollowUpDeliveryAttemptStatus as PrismaFollowUpDeliveryAttemptStatus,
  FollowUpMessageStatus as PrismaFollowUpMessageStatus,
  FollowUpTargetType as PrismaFollowUpTargetType,
  Prisma,
  SmsSenderNumberStatus as PrismaSmsSenderNumberStatus,
} from "@prisma/client";
import type {
  BeginFollowUpDeliveryAttemptInput,
  BeginFollowUpDeliveryAttemptResult,
  CreateDraftProviderCallFailedInput,
  CreateFollowUpDraftInput,
  FollowUpConsentNoticeRecord,
  FollowUpContactRecord,
  FollowUpDeliveryAttemptRecord,
  FollowUpDraftSourceRecord,
  FollowUpEmailConnectionRecord,
  FollowUpMessageDetailRecord,
  FollowUpMessagePageRecord,
  FollowUpMessageRecord,
  FollowUpMessageRepository,
  FollowUpMessageTargetRecord,
  FollowUpSmsSenderNumberRecord,
  FollowUpSuggestionRecord,
  ListFollowUpMessagesInput,
  MarkFollowUpDeliveryFailedInput,
  MarkFollowUpDeliverySucceededInput,
  UpdateFollowUpMessageDraftInput,
} from "@/modules/follow-up/application/ports/follow-up-message.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type FollowUpPrismaClient = PrismaService | Prisma.TransactionClient;
type FollowUpMessageDetailRow = Prisma.FollowUpMessageGetPayload<{
  include: {
    targets: true;
    deliveryAttempts: true;
  };
}>;
type FollowUpMessageRow = Prisma.FollowUpMessageGetPayload<object>;
type FollowUpMessageTargetRow = Prisma.FollowUpMessageTargetGetPayload<object>;
type FollowUpDeliveryAttemptRow =
  Prisma.FollowUpDeliveryAttemptGetPayload<object>;
type FollowUpDraftSourceRow = Prisma.AiWeeklySalesReportSuggestionGetPayload<{
  include: {
    report: true;
  };
}>;

export class PrismaFollowUpMessageRepository
  implements FollowUpMessageRepository
{
  constructor(
    private readonly client: FollowUpPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  async runInTransaction<T>(
    work: (repository: FollowUpMessageRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) =>
      work(new PrismaFollowUpMessageRepository(transaction, null))
    );
  }

  async findDraftSource(input: {
    readonly userId: string;
    readonly reportId: string;
    readonly suggestionId: string;
  }): Promise<FollowUpDraftSourceRecord | null> {
    const suggestion = await this.client.aiWeeklySalesReportSuggestion.findFirst({
      where: {
        id: input.suggestionId,
        reportId: input.reportId,
        userId: input.userId,
      },
      include: {
        report: true,
      },
    });

    return suggestion ? this.mapDraftSource(suggestion) : null;
  }

  async findContactForUser(input: {
    readonly userId: string;
    readonly contactId: string;
  }): Promise<FollowUpContactRecord | null> {
    const contact = await this.client.contact.findFirst({
      where: {
        id: input.contactId,
        userId: input.userId,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        username: true,
        mobile: true,
        email: true,
      },
    });

    return contact;
  }

  async isRecipientAllowedForSuggestion(input: {
    readonly userId: string;
    readonly suggestion: FollowUpSuggestionRecord;
    readonly recipientContactId: string;
  }): Promise<boolean> {
    const targetType = input.suggestion.targetType?.trim().toUpperCase() ?? null;
    const targetId = input.suggestion.targetId;

    if (targetType === "CONTACT") {
      return targetId === input.recipientContactId;
    }

    if (targetType === "DEAL" && targetId) {
      return this.existsDealContact(input.userId, targetId, input.recipientContactId);
    }

    if (targetType === "MEETING_NOTE" && targetId) {
      return this.existsMeetingNoteContact(
        input.userId,
        targetId,
        input.recipientContactId
      );
    }

    if (targetType === "SCHEDULE" && targetId) {
      return this.existsScheduleDealContact(
        input.userId,
        targetId,
        input.recipientContactId
      );
    }

    return this.isRecipientMentionedInReportSnapshot(
      input.userId,
      input.suggestion.reportId,
      input.recipientContactId
    );
  }

  async findReadyEmailConnectionForUser(
    userId: string
  ): Promise<FollowUpEmailConnectionRecord | null> {
    const connection = await this.client.externalEmailConnection.findFirst({
      where: {
        userId,
        status: PrismaExternalEmailConnectionStatus.CONNECTED,
        encryptedAccessToken: { not: null },
      },
      orderBy: [{ connectedAt: "desc" }, { id: "desc" }],
      select: this.createEmailConnectionSelect(),
    });

    return connection ? this.mapEmailConnection(connection) : null;
  }

  async findEmailConnectionForSend(input: {
    readonly userId: string;
    readonly connectionId: string;
  }): Promise<FollowUpEmailConnectionRecord | null> {
    const connection = await this.client.externalEmailConnection.findFirst({
      where: {
        id: input.connectionId,
        userId: input.userId,
        status: PrismaExternalEmailConnectionStatus.CONNECTED,
        encryptedAccessToken: { not: null },
      },
      select: this.createEmailConnectionSelect(),
    });

    return connection ? this.mapEmailConnection(connection) : null;
  }

  async findVerifiedSmsSenderNumberForUser(
    userId: string
  ): Promise<FollowUpSmsSenderNumberRecord | null> {
    const senderNumber = await this.client.smsSenderNumber.findFirst({
      where: {
        userId,
        status: PrismaSmsSenderNumberStatus.VERIFIED,
      },
      orderBy: [{ verifiedAt: "desc" }, { id: "desc" }],
      select: this.createSmsSenderNumberSelect(),
    });

    return senderNumber ? this.mapSmsSenderNumber(senderNumber) : null;
  }

  async findSmsSenderNumberForSend(input: {
    readonly userId: string;
    readonly senderNumberId: string;
  }): Promise<FollowUpSmsSenderNumberRecord | null> {
    const senderNumber = await this.client.smsSenderNumber.findFirst({
      where: {
        id: input.senderNumberId,
        userId: input.userId,
        status: PrismaSmsSenderNumberStatus.VERIFIED,
      },
      select: this.createSmsSenderNumberSelect(),
    });

    return senderNumber ? this.mapSmsSenderNumber(senderNumber) : null;
  }

  async findConsentNotice(input: {
    readonly userId: string;
    readonly channel: "EMAIL" | "SMS";
  }): Promise<FollowUpConsentNoticeRecord | null> {
    const notice = await this.client.followUpConsentNotice.findUnique({
      where: {
        userId_channel: {
          userId: input.userId,
          channel: input.channel,
        },
      },
    });

    return notice;
  }

  async createDraftWithProviderCall(
    input: CreateFollowUpDraftInput
  ): Promise<FollowUpMessageDetailRecord> {
    const message = await this.client.followUpMessage.create({
      data: {
        userId: input.userId,
        sourceReportId: input.sourceReportId,
        sourceSuggestionId: input.sourceSuggestionId,
        channel: input.channel,
        status: PrismaFollowUpMessageStatus.DRAFT,
        languageTag: input.languageTag,
        emailConnectionId: input.emailConnectionId,
        smsSenderNumberId: input.smsSenderNumberId,
        senderDisplayName: input.senderDisplayName,
        senderEmail: input.senderEmail,
        senderPhoneE164Masked: input.senderPhoneE164Masked,
        recipientContactId: input.recipientContactId,
        recipientName: input.recipientName,
        recipientEmail: input.recipientEmail,
        recipientPhoneE164Masked: input.recipientPhoneE164Masked,
        subject: input.subject,
        body: input.body,
        bodyPreview: input.bodyPreview,
        targets: {
          createMany: {
            data: input.targets.map((target) => ({
              userId: target.userId,
              targetType: target.targetType as PrismaFollowUpTargetType,
              targetId: target.targetId,
              targetPath: target.targetPath,
              targetLabel: target.targetLabel,
            })),
            skipDuplicates: true,
          },
        },
      },
      include: this.createMessageDetailInclude(),
    });

    await this.client.aiProviderCallLog.create({
      data: {
        userId: input.providerCall.userId,
        reportId: input.providerCall.reportId,
        operation:
          input.providerCall.operation as PrismaAiProviderOperation,
        status: PrismaAiProviderCallStatus.SUCCEEDED,
        provider: input.providerCall.provider,
        model: input.providerCall.model,
        requestId: input.providerCall.requestId,
        latencyMs: input.providerCall.latencyMs,
        inputTokenCount: input.providerCall.inputTokenCount,
        outputTokenCount: input.providerCall.outputTokenCount,
        totalTokenCount: input.providerCall.totalTokenCount,
        estimatedCostAmount: input.providerCall.estimatedCostAmount,
        costCurrency: input.providerCall.costCurrency ?? "USD",
        retryable: false,
        startedAt: input.providerCall.startedAt,
        completedAt: input.providerCall.completedAt,
        metadataJson: this.toInputJson(input.providerCall.metadataJson),
      },
    });

    return this.mapMessageDetail(message);
  }

  async createDraftProviderCallFailure(
    input: CreateDraftProviderCallFailedInput
  ): Promise<void> {
    await this.client.aiProviderCallLog.create({
      data: {
        userId: input.userId,
        reportId: input.reportId,
        operation: input.operation as PrismaAiProviderOperation,
        status: PrismaAiProviderCallStatus.FAILED,
        provider: input.provider,
        model: input.model,
        latencyMs: input.latencyMs,
        safeErrorCode: input.safeErrorCode,
        safeErrorMessage: input.safeErrorMessage,
        retryable: input.retryable,
        startedAt: input.startedAt,
        failedAt: input.failedAt,
        metadataJson: this.toInputJson(input.metadataJson),
      },
    });
  }

  async findMessageForUser(input: {
    readonly userId: string;
    readonly messageId: string;
  }): Promise<FollowUpMessageDetailRecord | null> {
    const message = await this.client.followUpMessage.findFirst({
      where: {
        id: input.messageId,
        userId: input.userId,
      },
      include: this.createMessageDetailInclude(),
    });

    return message ? this.mapMessageDetail(message) : null;
  }

  async updateDraftMessage(
    input: UpdateFollowUpMessageDraftInput
  ): Promise<FollowUpMessageDetailRecord | null> {
    const result = await this.client.followUpMessage.updateMany({
      where: {
        id: input.messageId,
        userId: input.userId,
        status: {
          in: [
            PrismaFollowUpMessageStatus.DRAFT,
            PrismaFollowUpMessageStatus.FAILED,
          ],
        },
      },
      data: this.createDraftUpdateData(input),
    });

    if (result.count !== 1) {
      return null;
    }

    return this.findMessageForUser({
      userId: input.userId,
      messageId: input.messageId,
    });
  }

  async beginDeliveryAttempt(
    input: BeginFollowUpDeliveryAttemptInput
  ): Promise<BeginFollowUpDeliveryAttemptResult | null> {
    const attemptNumber =
      (await this.client.followUpDeliveryAttempt.count({
        where: {
          userId: input.userId,
          messageId: input.messageId,
        },
      })) + 1;
    const result = await this.client.followUpMessage.updateMany({
      where: {
        id: input.messageId,
        userId: input.userId,
        status: {
          in: input.allowedStatuses.map(
            (status) => status as PrismaFollowUpMessageStatus
          ),
        },
      },
      data: {
        status: PrismaFollowUpMessageStatus.SENDING,
        safeErrorCode: null,
        safeErrorMessage: null,
        retryable: false,
        sentAt: null,
        failedAt: null,
      },
    });

    if (result.count !== 1) {
      return null;
    }

    const attempt = await this.client.followUpDeliveryAttempt.create({
      data: {
        userId: input.userId,
        messageId: input.messageId,
        channel: (await this.findRequiredMessageChannel(input.messageId)),
        status: PrismaFollowUpDeliveryAttemptStatus.PENDING,
        attemptNumber,
      },
    });
    const message = await this.findMessageForUser({
      userId: input.userId,
      messageId: input.messageId,
    });

    if (!message) {
      return null;
    }

    return {
      message,
      attempt: this.mapDeliveryAttempt(attempt),
    };
  }

  async markDeliverySucceeded(
    input: MarkFollowUpDeliverySucceededInput
  ): Promise<FollowUpMessageDetailRecord | null> {
    const attemptResult = await this.client.followUpDeliveryAttempt.updateMany({
      where: {
        id: input.attemptId,
        userId: input.userId,
        messageId: input.messageId,
        status: PrismaFollowUpDeliveryAttemptStatus.PENDING,
      },
      data: {
        status: PrismaFollowUpDeliveryAttemptStatus.SENT,
        provider: input.provider,
        providerMessageId: input.providerMessageId,
        providerStatusCode: input.providerStatusCode,
        safeErrorCode: null,
        safeErrorMessage: null,
        retryable: false,
        nextRetryAt: null,
        latencyMs: input.latencyMs,
        estimatedCostAmount: input.estimatedCostAmount,
        costCurrency: input.costCurrency ?? "USD",
        sentAt: input.sentAt,
        failedAt: null,
        detailJson: this.toInputJson(input.detailJson),
      },
    });

    if (attemptResult.count !== 1) {
      return null;
    }

    const messageResult = await this.client.followUpMessage.updateMany({
      where: {
        id: input.messageId,
        userId: input.userId,
        status: PrismaFollowUpMessageStatus.SENDING,
      },
      data: {
        status: PrismaFollowUpMessageStatus.SENT,
        provider: input.provider,
        providerMessageId: input.providerMessageId,
        safeErrorCode: null,
        safeErrorMessage: null,
        retryable: false,
        sentAt: input.sentAt,
        failedAt: null,
      },
    });

    if (messageResult.count !== 1) {
      return null;
    }

    const message = await this.findMessageForUser({
      userId: input.userId,
      messageId: input.messageId,
    });

    if (!message) {
      return null;
    }

    await this.markSenderSuccess(message, input.sentAt);

    return message;
  }

  async markDeliveryFailed(
    input: MarkFollowUpDeliveryFailedInput
  ): Promise<FollowUpMessageDetailRecord | null> {
    const attemptResult = await this.client.followUpDeliveryAttempt.updateMany({
      where: {
        id: input.attemptId,
        userId: input.userId,
        messageId: input.messageId,
        status: PrismaFollowUpDeliveryAttemptStatus.PENDING,
      },
      data: {
        status: PrismaFollowUpDeliveryAttemptStatus.FAILED,
        provider: input.provider,
        providerStatusCode: input.providerStatusCode,
        safeErrorCode: input.safeErrorCode,
        safeErrorMessage: input.safeErrorMessage,
        retryable: input.retryable,
        nextRetryAt: input.retryable ? this.toNextRetryAt(input.failedAt) : null,
        latencyMs: input.latencyMs,
        sentAt: null,
        failedAt: input.failedAt,
        detailJson: this.toInputJson(input.detailJson),
      },
    });

    if (attemptResult.count !== 1) {
      return null;
    }

    const messageResult = await this.client.followUpMessage.updateMany({
      where: {
        id: input.messageId,
        userId: input.userId,
        status: PrismaFollowUpMessageStatus.SENDING,
      },
      data: {
        status: PrismaFollowUpMessageStatus.FAILED,
        provider: input.provider,
        providerMessageId: null,
        safeErrorCode: input.safeErrorCode,
        safeErrorMessage: input.safeErrorMessage,
        retryable: input.retryable,
        retryCount: { increment: 1 },
        sentAt: null,
        failedAt: input.failedAt,
      },
    });

    if (messageResult.count !== 1) {
      return null;
    }

    const message = await this.findMessageForUser({
      userId: input.userId,
      messageId: input.messageId,
    });

    if (!message) {
      return null;
    }

    await this.markSenderFailure(message, input.safeErrorCode);

    return message;
  }

  async listMessages(
    input: ListFollowUpMessagesInput
  ): Promise<FollowUpMessagePageRecord> {
    const where = this.createListWhere(input);
    const [items, totalCount] = await Promise.all([
      this.client.followUpMessage.findMany({
        where,
        include: this.createMessageDetailInclude(),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.client.followUpMessage.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapMessageDetail(item)),
      totalCount,
    };
  }

  private existsDealContact(
    userId: string,
    dealId: string,
    contactId: string
  ): Promise<boolean> {
    return this.client.dealContact
      .findFirst({
        where: {
          userId,
          dealId,
          contactId,
          deal: { deletedAt: null },
          contact: { deletedAt: null },
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  private existsMeetingNoteContact(
    userId: string,
    meetingNoteId: string,
    contactId: string
  ): Promise<boolean> {
    return this.client.meetingNoteContact
      .findFirst({
        where: {
          userId,
          meetingNoteId,
          contactId,
          meetingNote: { deletedAt: null },
          contact: { deletedAt: null },
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  private existsScheduleDealContact(
    userId: string,
    scheduleId: string,
    contactId: string
  ): Promise<boolean> {
    return this.client.scheduleDeal
      .findFirst({
        where: {
          userId,
          scheduleId,
          schedule: { deletedAt: null },
          deal: {
            deletedAt: null,
            dealContacts: {
              some: {
                userId,
                contactId,
                contact: { deletedAt: null },
              },
            },
          },
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  private async isRecipientMentionedInReportSnapshot(
    userId: string,
    reportId: string,
    contactId: string
  ): Promise<boolean> {
    const report = await this.client.aiWeeklySalesReport.findFirst({
      where: {
        id: reportId,
        userId,
      },
      select: {
        inputSnapshotJson: true,
      },
    });

    return report
      ? JSON.stringify(report.inputSnapshotJson).includes(contactId)
      : false;
  }

  private async findRequiredMessageChannel(
    messageId: string
  ): Promise<"EMAIL" | "SMS"> {
    const message = await this.client.followUpMessage.findUnique({
      where: { id: messageId },
      select: { channel: true },
    });

    if (!message) {
      throw new Error("Follow-up message was not found after status update");
    }

    return message.channel;
  }

  private async markSenderSuccess(
    message: FollowUpMessageRow,
    sentAt: Date
  ): Promise<void> {
    if (message.emailConnectionId) {
      await this.client.externalEmailConnection.updateMany({
        where: {
          id: message.emailConnectionId,
          userId: message.userId,
        },
        data: {
          lastSentAt: sentAt,
          lastSendSafeErrorCode: null,
        },
      });
    }

    if (message.smsSenderNumberId) {
      await this.client.smsSenderNumber.updateMany({
        where: {
          id: message.smsSenderNumberId,
          userId: message.userId,
        },
        data: {
          lastSentAt: sentAt,
          lastSendSafeErrorCode: null,
        },
      });
    }
  }

  private async markSenderFailure(
    message: FollowUpMessageRow,
    safeErrorCode: string
  ): Promise<void> {
    if (message.emailConnectionId) {
      await this.client.externalEmailConnection.updateMany({
        where: {
          id: message.emailConnectionId,
          userId: message.userId,
        },
        data: {
          lastSendSafeErrorCode: safeErrorCode,
        },
      });
    }

    if (message.smsSenderNumberId) {
      await this.client.smsSenderNumber.updateMany({
        where: {
          id: message.smsSenderNumberId,
          userId: message.userId,
        },
        data: {
          lastSendSafeErrorCode: safeErrorCode,
        },
      });
    }
  }

  private createDraftUpdateData(
    input: UpdateFollowUpMessageDraftInput
  ): Prisma.FollowUpMessageUpdateManyMutationInput {
    return {
      ...(input.recipientContactId === undefined
        ? {}
        : { recipientContactId: input.recipientContactId }),
      ...(input.recipientName === undefined
        ? {}
        : { recipientName: input.recipientName }),
      ...(input.recipientEmail === undefined
        ? {}
        : { recipientEmail: input.recipientEmail }),
      ...(input.recipientPhoneE164Masked === undefined
        ? {}
        : { recipientPhoneE164Masked: input.recipientPhoneE164Masked }),
      ...(input.subject === undefined ? {} : { subject: input.subject }),
      ...(input.body === undefined ? {} : { body: input.body }),
      ...(input.bodyPreview === undefined
        ? {}
        : { bodyPreview: input.bodyPreview }),
      safeErrorCode: null,
      safeErrorMessage: null,
      retryable: false,
      failedAt: null,
    };
  }

  private createListWhere(
    input: ListFollowUpMessagesInput
  ): Prisma.FollowUpMessageWhereInput {
    return {
      userId: input.userId,
      ...(input.sourceReportId ? { sourceReportId: input.sourceReportId } : {}),
      ...(input.targetType || input.targetId
        ? {
            targets: {
              some: {
                ...(input.targetType
                  ? { targetType: input.targetType as PrismaFollowUpTargetType }
                  : {}),
                ...(input.targetId ? { targetId: input.targetId } : {}),
              },
            },
          }
        : {}),
    };
  }

  private createMessageDetailInclude() {
    return {
      targets: {
        orderBy: [{ targetType: "asc" }, { createdAt: "asc" }],
      },
      deliveryAttempts: {
        orderBy: [{ attemptNumber: "asc" }, { createdAt: "asc" }],
      },
    } satisfies Prisma.FollowUpMessageInclude;
  }

  private createEmailConnectionSelect() {
    return {
      id: true,
      userId: true,
      provider: true,
      providerAccountEmail: true,
      status: true,
      encryptedAccessToken: true,
      encryptedRefreshToken: true,
      connectedAt: true,
      lastSentAt: true,
      lastSendSafeErrorCode: true,
    } satisfies Prisma.ExternalEmailConnectionSelect;
  }

  private createSmsSenderNumberSelect() {
    return {
      id: true,
      userId: true,
      phoneE164Ciphertext: true,
      phoneE164Masked: true,
      status: true,
      provider: true,
      lastSentAt: true,
      lastSendSafeErrorCode: true,
    } satisfies Prisma.SmsSenderNumberSelect;
  }

  private mapDraftSource(
    row: FollowUpDraftSourceRow
  ): FollowUpDraftSourceRecord {
    return {
      report: {
        id: row.report.id,
        userId: row.report.userId,
        weekStart: row.report.weekStart,
        weekEnd: row.report.weekEnd,
        timeZone: row.report.timeZone,
        locale: row.report.locale,
      },
      suggestion: {
        id: row.id,
        reportId: row.reportId,
        userId: row.userId,
        type: row.type,
        title: row.title,
        body: row.body,
        reason: row.reason,
        targetType: row.targetType,
        targetId: row.targetId,
        targetPath: row.targetPath,
        targetLabel: row.targetLabel,
        payloadJson: this.toRecordJson(row.payloadJson),
      },
    };
  }

  private mapEmailConnection(
    row: FollowUpEmailConnectionRecord
  ): FollowUpEmailConnectionRecord {
    return row;
  }

  private mapSmsSenderNumber(
    row: FollowUpSmsSenderNumberRecord
  ): FollowUpSmsSenderNumberRecord {
    return row;
  }

  private mapMessageDetail(
    row: FollowUpMessageDetailRow
  ): FollowUpMessageDetailRecord {
    return {
      ...this.mapMessage(row),
      targets: row.targets.map((target) => this.mapTarget(target)),
      deliveryAttempts: row.deliveryAttempts.map((attempt) =>
        this.mapDeliveryAttempt(attempt)
      ),
    };
  }

  private mapMessage(row: FollowUpMessageRow): FollowUpMessageRecord {
    return {
      id: row.id,
      userId: row.userId,
      sourceReportId: row.sourceReportId,
      sourceSuggestionId: row.sourceSuggestionId,
      channel: row.channel,
      status: row.status,
      languageTag: row.languageTag,
      emailConnectionId: row.emailConnectionId,
      smsSenderNumberId: row.smsSenderNumberId,
      senderDisplayName: row.senderDisplayName,
      senderEmail: row.senderEmail,
      senderPhoneE164Masked: row.senderPhoneE164Masked,
      recipientContactId: row.recipientContactId,
      recipientName: row.recipientName,
      recipientEmail: row.recipientEmail,
      recipientPhoneE164Masked: row.recipientPhoneE164Masked,
      subject: row.subject,
      body: row.body,
      bodyPreview: row.bodyPreview,
      provider: row.provider,
      providerMessageId: row.providerMessageId,
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      retryable: row.retryable,
      retryCount: row.retryCount,
      sentAt: row.sentAt,
      failedAt: row.failedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapTarget(
    row: FollowUpMessageTargetRow
  ): FollowUpMessageTargetRecord {
    return {
      id: row.id,
      userId: row.userId,
      messageId: row.messageId,
      targetType: row.targetType,
      targetId: row.targetId,
      targetPath: row.targetPath,
      targetLabel: row.targetLabel,
      createdAt: row.createdAt,
    };
  }

  private mapDeliveryAttempt(
    row: FollowUpDeliveryAttemptRow
  ): FollowUpDeliveryAttemptRecord {
    return {
      id: row.id,
      userId: row.userId,
      messageId: row.messageId,
      channel: row.channel,
      status: row.status,
      attemptNumber: row.attemptNumber,
      provider: row.provider,
      providerMessageId: row.providerMessageId,
      providerStatusCode: row.providerStatusCode,
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      retryable: row.retryable,
      nextRetryAt: row.nextRetryAt,
      latencyMs: row.latencyMs,
      estimatedCostAmount: row.estimatedCostAmount?.toString() ?? null,
      costCurrency: row.costCurrency,
      sentAt: row.sentAt,
      failedAt: row.failedAt,
      detailJson: this.toRecordJson(row.detailJson),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toNextRetryAt(failedAt: Date): Date {
    return new Date(failedAt.getTime() + 5 * 60 * 1000);
  }

  private toRecordJson(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }

  private toInputJson(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }
}
