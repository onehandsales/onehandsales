import { performance } from "node:perf_hooks";
import { Inject, Injectable } from "@nestjs/common";
import {
  FOLLOW_UP_DRAFT_PROVIDER,
  FollowUpDraftProviderFailure,
  type FollowUpDraftProvider,
  type FollowUpDraftProviderResult,
} from "@/modules/follow-up/application/ports/follow-up-draft.provider";
import {
  FOLLOW_UP_EMAIL_DELIVERY_PROVIDER,
  FOLLOW_UP_SMS_DELIVERY_PROVIDER,
  type FollowUpDeliveryChannelValue,
  type FollowUpEmailDeliveryProvider,
  type FollowUpProviderDeliveryFailure,
  type FollowUpProviderDeliveryResult,
  type FollowUpSmsDeliveryProvider,
} from "@/modules/follow-up/application/ports/follow-up-delivery.provider";
import {
  FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT,
  type FollowUpDeliverySecretEncryptionPort,
} from "@/modules/follow-up/application/ports/follow-up-delivery-secret-encryption.port";
import {
  FOLLOW_UP_MESSAGE_REPOSITORY,
  type BeginFollowUpDeliveryAttemptResult,
  type CreateFollowUpMessageTargetInput,
  type FollowUpContactRecord,
  type FollowUpDraftSourceRecord,
  type FollowUpDraftProviderOperationValue,
  type FollowUpEmailConnectionRecord,
  type FollowUpMessageDetailRecord,
  type FollowUpMessageRepository,
  type FollowUpMessageStatusValue,
  type FollowUpMessageTargetRecord,
  type FollowUpSmsSenderNumberRecord,
  type FollowUpSuggestionRecord,
  type FollowUpTargetTypeValue,
} from "@/modules/follow-up/application/ports/follow-up-message.repository";
import { FollowUpDeliverySafeErrorMapper } from "@/modules/follow-up/application/services/follow-up-delivery-safe-error.mapper";
import {
  FollowUpConsentNoticeRequiredError,
  FollowUpDraftSourceInvalidError,
  FollowUpEmailReconnectRequiredError,
  FollowUpInvalidRecipientError,
  FollowUpMessageAlreadySentError,
  FollowUpMessageNotFoundError,
  FollowUpMessageNotRetryableError,
  FollowUpMessageNotSendableError,
  FollowUpSmsBodyTooLongError,
  FollowUpSmsSenderNotVerifiedError,
} from "@/modules/follow-up/domain/follow-up-delivery.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const LANGUAGE_TAG_PATTERN =
  /^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LIST_PAGE_SIZE = 15;
const MAX_EMAIL_SUBJECT_LENGTH = 200;
const MAX_EMAIL_BODY_LENGTH = 20_000;
const MAX_SMS_ASCII_TWO_SEGMENT_LENGTH = 306;
const MAX_SMS_UNICODE_TWO_SEGMENT_LENGTH = 134;
const BODY_PREVIEW_LENGTH = 160;

export interface CreateFollowUpDraftCommand {
  readonly sourceReportId?: unknown;
  readonly sourceSuggestionId?: unknown;
  readonly channel?: unknown;
  readonly languageTag?: unknown;
  readonly recipientContactId?: unknown;
}

export interface UpdateFollowUpMessageCommand {
  readonly subject?: unknown;
  readonly body?: unknown;
  readonly recipientContactId?: unknown;
}

export interface ListFollowUpMessagesQuery {
  readonly sourceReportId?: unknown;
  readonly targetType?: unknown;
  readonly targetId?: unknown;
  readonly page?: unknown;
}

export interface FollowUpMessageSenderResponse {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly phoneE164Masked: string | null;
}

export interface FollowUpMessageRecipientResponse {
  readonly contactId: string | null;
  readonly name: string;
  readonly email: string | null;
  readonly phoneE164Masked: string | null;
}

export interface FollowUpMessageTargetResponse {
  readonly targetType: FollowUpTargetTypeValue;
  readonly targetId: string;
  readonly targetPath: string;
  readonly targetLabel: string | null;
}

export interface FollowUpDeliveryAttemptResponse {
  readonly id: string;
  readonly status: string;
  readonly attemptNumber: number;
  readonly provider: string | null;
  readonly providerMessageId: string | null;
  readonly providerStatusCode: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly nextRetryAt: string | null;
  readonly latencyMs: number | null;
  readonly estimatedCostAmount: string | null;
  readonly costCurrency: string;
  readonly sentAt: string | null;
  readonly failedAt: string | null;
  readonly createdAt: string;
}

export interface FollowUpMessageResponse {
  readonly id: string;
  readonly status: FollowUpMessageStatusValue;
  readonly channel: FollowUpDeliveryChannelValue;
  readonly languageTag: string;
  readonly sender: FollowUpMessageSenderResponse;
  readonly recipient: FollowUpMessageRecipientResponse;
  readonly subject: string | null;
  readonly body: string;
  readonly bodyPreview: string;
  readonly provider: string | null;
  readonly providerMessageId: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly retryCount: number;
  readonly sentAt: string | null;
  readonly failedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly sourceReportId: string | null;
  readonly sourceSuggestionId: string | null;
  readonly targets: readonly FollowUpMessageTargetResponse[];
  readonly deliveryAttempts: readonly FollowUpDeliveryAttemptResponse[];
}

export interface FollowUpMessageListItemResponse {
  readonly id: string;
  readonly status: FollowUpMessageStatusValue;
  readonly channel: FollowUpDeliveryChannelValue;
  readonly languageTag: string;
  readonly sender: FollowUpMessageSenderResponse;
  readonly recipient: FollowUpMessageRecipientResponse;
  readonly subject: string | null;
  readonly bodyPreview: string;
  readonly provider: string | null;
  readonly providerMessageId: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly retryCount: number;
  readonly sentAt: string | null;
  readonly failedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly sourceReportId: string | null;
  readonly sourceSuggestionId: string | null;
  readonly targets: readonly FollowUpMessageTargetResponse[];
}

export interface FollowUpMessageListResponse {
  readonly items: readonly FollowUpMessageListItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

interface DraftProviderCallResult {
  readonly result: FollowUpDraftProviderResult;
  readonly startedAt: Date;
  readonly completedAt: Date;
  readonly latencyMs: number;
}

interface SenderContext {
  readonly emailConnection: FollowUpEmailConnectionRecord | null;
  readonly smsSenderNumber: FollowUpSmsSenderNumberRecord | null;
  readonly senderDisplayName: string | null;
  readonly senderEmail: string | null;
  readonly senderPhoneE164Masked: string | null;
}

interface DeliveryProviderCallInput {
  readonly message: FollowUpMessageDetailRecord;
  readonly attempt: BeginFollowUpDeliveryAttemptResult["attempt"];
  readonly contact: FollowUpContactRecord;
}

@Injectable()
export class FollowUpMessageApplicationService {
  constructor(
    @Inject(FOLLOW_UP_MESSAGE_REPOSITORY)
    private readonly repository: FollowUpMessageRepository,
    @Inject(FOLLOW_UP_DRAFT_PROVIDER)
    private readonly draftProvider: FollowUpDraftProvider,
    @Inject(FOLLOW_UP_EMAIL_DELIVERY_PROVIDER)
    private readonly emailProvider: FollowUpEmailDeliveryProvider,
    @Inject(FOLLOW_UP_SMS_DELIVERY_PROVIDER)
    private readonly smsProvider: FollowUpSmsDeliveryProvider,
    @Inject(FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT)
    private readonly secretEncryption: FollowUpDeliverySecretEncryptionPort,
    private readonly safeErrorMapper: FollowUpDeliverySafeErrorMapper,
    private readonly logger: AppLogger
  ) {}

  async createDraft(
    currentUser: CurrentUserContext,
    input: CreateFollowUpDraftCommand
  ): Promise<FollowUpMessageResponse> {
    const channel = this.normalizeChannel(input.channel);
    const sourceReportId = this.normalizeUuid(
      input.sourceReportId,
      "sourceReportId"
    );
    const sourceSuggestionId = this.normalizeUuid(
      input.sourceSuggestionId,
      "sourceSuggestionId"
    );
    const languageTag = this.normalizeLanguageTag(input.languageTag);
    const recipientContactId = this.normalizeUuid(
      input.recipientContactId,
      "recipientContactId"
    );
    const source = await this.findValidDraftSource(
      currentUser.id,
      sourceReportId,
      sourceSuggestionId
    );
    const recipient = await this.findValidRecipient({
      userId: currentUser.id,
      suggestion: source.suggestion,
      recipientContactId,
    });
    const sender = await this.findReadySender(currentUser, channel);
    const recipientEmail =
      channel === "EMAIL" ? this.normalizeRecipientEmail(recipient.email) : null;
    const recipientPhone =
      channel === "SMS" ? this.normalizeRecipientPhone(recipient.mobile) : null;
    const draftCall = await this.generateDraft({
      userId: currentUser.id,
      channel,
      languageTag,
      source,
      recipient,
    });
    const subject =
      channel === "EMAIL"
        ? this.normalizeEmailSubject(draftCall.result.subject)
        : null;
    const body = this.normalizeMessageBody(draftCall.result.body);

    if (channel === "SMS") {
      this.assertSmsBodyWithinTwoSegments(body);
    }

    const message = await this.repository.runInTransaction((repository) =>
      repository.createDraftWithProviderCall({
        userId: currentUser.id,
        sourceReportId,
        sourceSuggestionId,
        channel,
        languageTag,
        emailConnectionId: sender.emailConnection?.id ?? null,
        smsSenderNumberId: sender.smsSenderNumber?.id ?? null,
        senderDisplayName: sender.senderDisplayName,
        senderEmail: sender.senderEmail,
        senderPhoneE164Masked: sender.senderPhoneE164Masked,
        recipientContactId,
        recipientName: recipient.username,
        recipientEmail,
        recipientPhoneE164Masked: recipientPhone
          ? this.maskPhoneE164(recipientPhone)
          : null,
        subject,
        body,
        bodyPreview: this.createBodyPreview(body),
        targets: this.createTargets({
          userId: currentUser.id,
          source,
          recipientContactId,
        }),
        providerCall: {
          userId: currentUser.id,
          reportId: sourceReportId,
          operation: this.toDraftProviderOperation(channel),
          provider: draftCall.result.provider,
          model: draftCall.result.model,
          requestId: draftCall.result.requestId ?? null,
          latencyMs: draftCall.latencyMs,
          inputTokenCount: draftCall.result.usage?.inputTokenCount ?? null,
          outputTokenCount: draftCall.result.usage?.outputTokenCount ?? null,
          totalTokenCount: draftCall.result.usage?.totalTokenCount ?? null,
          estimatedCostAmount:
            draftCall.result.usage?.estimatedCostAmount ?? null,
          costCurrency: draftCall.result.usage?.costCurrency ?? "USD",
          startedAt: draftCall.startedAt,
          completedAt: draftCall.completedAt,
          metadataJson: this.createDraftProviderCallMetadata({
            channel,
            languageTag,
            suggestion: source.suggestion,
            recipientContactId,
          }),
        },
      })
    );

    this.logEvent("followUp.draft.created", {
      userId: currentUser.id,
      messageId: message.id,
      sourceReportId,
      sourceSuggestionId,
      channel,
    });

    return this.toMessageResponse(message);
  }

  async updateDraft(
    currentUser: CurrentUserContext,
    messageId: string,
    input: UpdateFollowUpMessageCommand
  ): Promise<FollowUpMessageResponse> {
    const message = await this.findMessageOrThrow(currentUser.id, messageId);

    if (message.status === "SENT") {
      throw new FollowUpMessageAlreadySentError();
    }

    if (message.status === "SENDING") {
      throw new FollowUpMessageNotSendableError(
        "Follow-up message is currently sending."
      );
    }

    const recipientUpdate = await this.createRecipientUpdate(
      currentUser.id,
      message,
      input.recipientContactId
    );
    const subject =
      input.subject === undefined
        ? message.subject
        : message.channel === "EMAIL"
          ? this.normalizeEmailSubject(input.subject)
          : null;
    const body =
      input.body === undefined
        ? message.body
        : this.normalizeMessageBody(input.body);

    this.assertMessageContent(message.channel, subject, body);

    const updated = await this.repository.runInTransaction((repository) =>
      repository.updateDraftMessage({
        userId: currentUser.id,
        messageId,
        ...recipientUpdate,
        subject,
        body,
        bodyPreview: this.createBodyPreview(body),
      })
    );

    if (!updated) {
      throw new FollowUpMessageNotSendableError();
    }

    return this.toMessageResponse(updated);
  }

  async getDetail(
    currentUser: CurrentUserContext,
    messageId: string
  ): Promise<FollowUpMessageResponse> {
    return this.toMessageResponse(
      await this.findMessageOrThrow(currentUser.id, messageId)
    );
  }

  async sendMessage(
    currentUser: CurrentUserContext,
    messageId: string
  ): Promise<FollowUpMessageResponse> {
    return this.dispatchMessage(currentUser, messageId, false);
  }

  async retryMessage(
    currentUser: CurrentUserContext,
    messageId: string
  ): Promise<FollowUpMessageResponse> {
    this.logEvent("followUp.message.retryRequested", {
      userId: currentUser.id,
      messageId,
    });

    return this.dispatchMessage(currentUser, messageId, true);
  }

  async listMessages(
    currentUser: CurrentUserContext,
    query: ListFollowUpMessagesQuery
  ): Promise<FollowUpMessageListResponse> {
    const page = this.normalizePage(query.page);
    const targetType = this.normalizeOptionalTargetType(query.targetType);
    const targetId =
      query.targetId === undefined
        ? null
        : this.normalizeUuid(query.targetId, "targetId");
    const sourceReportId =
      query.sourceReportId === undefined
        ? null
        : this.normalizeUuid(query.sourceReportId, "sourceReportId");
    const result = await this.repository.listMessages({
      userId: currentUser.id,
      sourceReportId,
      targetType,
      targetId,
      page,
      pageSize: LIST_PAGE_SIZE,
    });

    return {
      items: result.items.map((message) => this.toListItemResponse(message)),
      page,
      pageSize: LIST_PAGE_SIZE,
      totalCount: result.totalCount,
      totalPages: Math.max(Math.ceil(result.totalCount / LIST_PAGE_SIZE), 1),
    };
  }

  private async findValidDraftSource(
    userId: string,
    sourceReportId: string,
    sourceSuggestionId: string
  ): Promise<FollowUpDraftSourceRecord> {
    const source = await this.repository.findDraftSource({
      userId,
      reportId: sourceReportId,
      suggestionId: sourceSuggestionId,
    });

    if (!source || source.suggestion.type !== "FOLLOW_UP") {
      throw new FollowUpDraftSourceInvalidError(
        "Only FOLLOW_UP suggestions can create follow-up drafts."
      );
    }

    return source;
  }

  private async findValidRecipient(input: {
    readonly userId: string;
    readonly suggestion: FollowUpSuggestionRecord;
    readonly recipientContactId: string;
  }): Promise<FollowUpContactRecord> {
    const recipient = await this.repository.findContactForUser({
      userId: input.userId,
      contactId: input.recipientContactId,
    });

    if (!recipient) {
      throw new FollowUpInvalidRecipientError();
    }

    const allowed = await this.repository.isRecipientAllowedForSuggestion(input);

    if (!allowed) {
      throw new FollowUpInvalidRecipientError(
        "Recipient is outside the AI report follow-up context."
      );
    }

    return recipient;
  }

  private async findReadySender(
    currentUser: CurrentUserContext,
    channel: FollowUpDeliveryChannelValue
  ): Promise<SenderContext> {
    if (channel === "EMAIL") {
      const connection = await this.repository.findReadyEmailConnectionForUser(
        currentUser.id
      );

      if (!connection) {
        throw new FollowUpEmailReconnectRequiredError();
      }

      return {
        emailConnection: connection,
        smsSenderNumber: null,
        senderDisplayName: currentUser.displayName ?? null,
        senderEmail: connection.providerAccountEmail,
        senderPhoneE164Masked: null,
      };
    }

    const senderNumber = await this.repository.findVerifiedSmsSenderNumberForUser(
      currentUser.id
    );

    if (!senderNumber) {
      throw new FollowUpSmsSenderNotVerifiedError();
    }

    return {
      emailConnection: null,
      smsSenderNumber: senderNumber,
      senderDisplayName: currentUser.displayName ?? null,
      senderEmail: null,
      senderPhoneE164Masked: senderNumber.phoneE164Masked,
    };
  }

  private async generateDraft(input: {
    readonly userId: string;
    readonly channel: FollowUpDeliveryChannelValue;
    readonly languageTag: string;
    readonly source: FollowUpDraftSourceRecord;
    readonly recipient: FollowUpContactRecord;
  }): Promise<DraftProviderCallResult> {
    const startedAt = new Date();
    const started = performance.now();

    try {
      const result = await this.draftProvider.generateDraft({
        userId: input.userId,
        channel: input.channel,
        languageTag: input.languageTag,
        report: input.source.report,
        suggestion: input.source.suggestion,
        recipient: {
          id: input.recipient.id,
          name: input.recipient.username,
          email: input.recipient.email,
          mobile: input.recipient.mobile,
        },
      });
      const completedAt = new Date();

      return {
        result,
        startedAt,
        completedAt,
        latencyMs: this.toLatencyMs(started),
      };
    } catch (error) {
      await this.recordDraftProviderFailure({
        error,
        userId: input.userId,
        reportId: input.source.report.id,
        operation: this.toDraftProviderOperation(input.channel),
        startedAt,
        latencyMs: this.toLatencyMs(started),
        channel: input.channel,
        languageTag: input.languageTag,
        suggestion: input.source.suggestion,
        recipientContactId: input.recipient.id,
      });
      throw error;
    }
  }

  private async recordDraftProviderFailure(input: {
    readonly error: unknown;
    readonly userId: string;
    readonly reportId: string;
    readonly operation: FollowUpDraftProviderOperationValue;
    readonly startedAt: Date;
    readonly latencyMs: number;
    readonly channel: FollowUpDeliveryChannelValue;
    readonly languageTag: string;
    readonly suggestion: FollowUpSuggestionRecord;
    readonly recipientContactId: string;
  }): Promise<void> {
    const metadata = this.draftProvider.getMetadata();
    const safeFailure =
      input.error instanceof FollowUpDraftProviderFailure
        ? input.error
        : new FollowUpDraftProviderFailure(
            "FollowUpDraftProviderFailed",
            "Follow-up draft provider failed.",
            true
          );

    await this.repository.createDraftProviderCallFailure({
      userId: input.userId,
      reportId: input.reportId,
      operation: input.operation,
      provider: metadata.provider,
      model: metadata.model,
      latencyMs: input.latencyMs,
      safeErrorCode: safeFailure.safeErrorCode,
      safeErrorMessage: safeFailure.safeErrorMessage,
      retryable: safeFailure.retryable,
      startedAt: input.startedAt,
      failedAt: new Date(),
      metadataJson: this.createDraftProviderCallMetadata(input),
    });
  }

  private async createRecipientUpdate(
    userId: string,
    message: FollowUpMessageDetailRecord,
    recipientContactIdInput: unknown
  ): Promise<{
    readonly recipientContactId?: string;
    readonly recipientName?: string;
    readonly recipientEmail?: string | null;
    readonly recipientPhoneE164Masked?: string | null;
  }> {
    if (recipientContactIdInput === undefined) {
      return {};
    }

    if (!message.sourceReportId || !message.sourceSuggestionId) {
      throw new FollowUpInvalidRecipientError();
    }

    const recipientContactId = this.normalizeUuid(
      recipientContactIdInput,
      "recipientContactId"
    );
    const source = await this.findValidDraftSource(
      userId,
      message.sourceReportId,
      message.sourceSuggestionId
    );
    const recipient = await this.findValidRecipient({
      userId,
      suggestion: source.suggestion,
      recipientContactId,
    });

    if (message.channel === "EMAIL") {
      return {
        recipientContactId,
        recipientName: recipient.username,
        recipientEmail: this.normalizeRecipientEmail(recipient.email),
        recipientPhoneE164Masked: null,
      };
    }

    return {
      recipientContactId,
      recipientName: recipient.username,
      recipientEmail: null,
      recipientPhoneE164Masked: this.maskPhoneE164(
        this.normalizeRecipientPhone(recipient.mobile)
      ),
    };
  }

  private async dispatchMessage(
    currentUser: CurrentUserContext,
    messageId: string,
    retry: boolean
  ): Promise<FollowUpMessageResponse> {
    const currentMessage = await this.findMessageOrThrow(
      currentUser.id,
      messageId
    );
    this.assertDispatchAllowed(currentMessage, retry);
    this.assertMessageContent(
      currentMessage.channel,
      currentMessage.subject,
      currentMessage.body
    );
    await this.assertConsentAcknowledged(currentUser.id, currentMessage.channel);
    const contact = await this.findRecipientForSend(currentMessage);
    await this.assertSenderReadyForSend(currentUser.id, currentMessage);

    const begin = await this.repository.runInTransaction((repository) =>
      repository.beginDeliveryAttempt({
        userId: currentUser.id,
        messageId,
        allowedStatuses: retry ? ["FAILED"] : ["DRAFT", "FAILED"],
        now: new Date(),
      })
    );

    if (!begin) {
      return this.throwCurrentDispatchConflict(currentUser.id, messageId);
    }

    const result = await this.callDeliveryProvider({
      message: begin.message,
      attempt: begin.attempt,
      contact,
    });
    const completedAt = new Date();
    const updated = result.ok
      ? await this.repository.runInTransaction((repository) =>
          repository.markDeliverySucceeded({
            userId: currentUser.id,
            messageId,
            attemptId: begin.attempt.id,
            provider: result.provider,
            providerMessageId: result.providerMessageId ?? null,
            providerStatusCode: result.providerStatusCode ?? null,
            latencyMs: result.latencyMs ?? null,
            estimatedCostAmount: result.estimatedCostAmount ?? null,
            costCurrency: result.costCurrency ?? "USD",
            detailJson: result.detailJson ?? {},
            sentAt: completedAt,
          })
        )
      : await this.repository.runInTransaction((repository) =>
          repository.markDeliveryFailed({
            userId: currentUser.id,
            messageId,
            attemptId: begin.attempt.id,
            provider: result.provider,
            providerStatusCode: result.providerStatusCode ?? null,
            safeErrorCode: result.safeErrorCode,
            safeErrorMessage: result.safeErrorMessage,
            retryable: result.retryable,
            latencyMs: null,
            detailJson: result.detailJson,
            failedAt: completedAt,
          })
        );

    if (!updated) {
      throw new FollowUpMessageNotSendableError();
    }

    this.logEvent(result.ok ? "followUp.message.sent" : "followUp.message.failed", {
      userId: currentUser.id,
      messageId,
      channel: currentMessage.channel,
      provider: result.provider,
      attemptId: begin.attempt.id,
      ...(result.ok ? {} : { safeErrorCode: result.safeErrorCode }),
    });

    return this.toMessageResponse(updated);
  }

  private assertDispatchAllowed(
    message: FollowUpMessageDetailRecord,
    retry: boolean
  ): void {
    if (message.status === "SENT") {
      throw new FollowUpMessageAlreadySentError();
    }

    if (message.status === "SENDING") {
      throw new FollowUpMessageNotSendableError(
        "Follow-up message is currently sending."
      );
    }

    if (retry) {
      if (message.status !== "FAILED" || !message.retryable) {
        throw new FollowUpMessageNotRetryableError();
      }

      return;
    }

    if (message.status === "FAILED" && !message.retryable) {
      throw new FollowUpMessageNotRetryableError();
    }
  }

  private async assertConsentAcknowledged(
    userId: string,
    channel: FollowUpDeliveryChannelValue
  ): Promise<void> {
    const notice = await this.repository.findConsentNotice({
      userId,
      channel,
    });

    if (!notice) {
      throw new FollowUpConsentNoticeRequiredError();
    }
  }

  private async assertSenderReadyForSend(
    userId: string,
    message: FollowUpMessageDetailRecord
  ): Promise<void> {
    if (message.channel === "EMAIL") {
      if (!message.emailConnectionId) {
        throw new FollowUpEmailReconnectRequiredError();
      }

      const connection = await this.repository.findEmailConnectionForSend({
        userId,
        connectionId: message.emailConnectionId,
      });

      if (!connection) {
        throw new FollowUpEmailReconnectRequiredError();
      }

      return;
    }

    if (!message.smsSenderNumberId) {
      throw new FollowUpSmsSenderNotVerifiedError();
    }

    const senderNumber = await this.repository.findSmsSenderNumberForSend({
      userId,
      senderNumberId: message.smsSenderNumberId,
    });

    if (!senderNumber) {
      throw new FollowUpSmsSenderNotVerifiedError();
    }
  }

  private async findRecipientForSend(
    message: FollowUpMessageDetailRecord
  ): Promise<FollowUpContactRecord> {
    if (!message.recipientContactId) {
      throw new FollowUpInvalidRecipientError();
    }

    const contact = await this.repository.findContactForUser({
      userId: message.userId,
      contactId: message.recipientContactId,
    });

    if (!contact) {
      throw new FollowUpInvalidRecipientError();
    }

    if (message.channel === "EMAIL") {
      this.normalizeRecipientEmail(message.recipientEmail ?? contact.email);
    } else {
      this.normalizeRecipientPhone(contact.mobile);
    }

    return contact;
  }

  private async callDeliveryProvider(
    input: DeliveryProviderCallInput
  ): Promise<FollowUpProviderDeliveryResult> {
    try {
      if (input.message.channel === "EMAIL") {
        return this.callEmailProvider(input);
      }

      return this.callSmsProvider(input);
    } catch (error) {
      return this.createProviderFailure(input.message, error);
    }
  }

  private async callEmailProvider(
    input: DeliveryProviderCallInput
  ): Promise<FollowUpProviderDeliveryResult> {
    if (!input.message.emailConnectionId) {
      throw new FollowUpEmailReconnectRequiredError();
    }

    const connection = await this.repository.findEmailConnectionForSend({
      userId: input.message.userId,
      connectionId: input.message.emailConnectionId,
    });

    if (!connection || !connection.encryptedAccessToken) {
      throw new FollowUpEmailReconnectRequiredError();
    }

    const subject = this.normalizeEmailSubject(input.message.subject);
    const accessToken = this.secretEncryption.decryptEmailToken({
      ciphertext: connection.encryptedAccessToken,
    });

    return this.emailProvider.sendEmail({
      provider: connection.provider,
      accessToken,
      from: {
        ...(input.message.senderDisplayName
          ? { displayName: input.message.senderDisplayName }
          : {}),
        email: connection.providerAccountEmail,
      },
      to: {
        name: input.message.recipientName,
        email: this.normalizeRecipientEmail(
          input.message.recipientEmail ?? input.contact.email
        ),
      },
      subject,
      body: input.message.body,
      idempotencyKey: input.attempt.id,
    });
  }

  private async callSmsProvider(
    input: DeliveryProviderCallInput
  ): Promise<FollowUpProviderDeliveryResult> {
    if (!input.message.smsSenderNumberId) {
      throw new FollowUpSmsSenderNotVerifiedError();
    }

    const senderNumber = await this.repository.findSmsSenderNumberForSend({
      userId: input.message.userId,
      senderNumberId: input.message.smsSenderNumberId,
    });

    if (!senderNumber) {
      throw new FollowUpSmsSenderNotVerifiedError();
    }

    this.assertSmsBodyWithinTwoSegments(input.message.body);

    return this.smsProvider.sendSms({
      ...(senderNumber.provider ? { provider: senderNumber.provider } : {}),
      senderPhoneE164: this.secretEncryption.decryptSmsSenderNumber({
        phoneE164Ciphertext: senderNumber.phoneE164Ciphertext,
      }),
      recipientPhoneE164: this.normalizeRecipientPhone(input.contact.mobile),
      body: input.message.body,
      idempotencyKey: input.attempt.id,
    });
  }

  private createProviderFailure(
    message: FollowUpMessageDetailRecord,
    error: unknown
  ): FollowUpProviderDeliveryFailure {
    if (
      error instanceof FollowUpEmailReconnectRequiredError ||
      error instanceof FollowUpSmsSenderNotVerifiedError ||
      error instanceof FollowUpInvalidRecipientError
    ) {
      return {
        ok: false,
        provider: message.provider ?? "internal",
        safeErrorCode: error.code,
        safeErrorMessage: error.message,
        retryable: false,
        detailJson: {
          channel: message.channel,
          errorCode: error.code,
        },
      };
    }

    const failure = this.safeErrorMapper.mapProviderFailure({
      provider: message.provider ?? "unknown",
      operation: message.channel === "EMAIL" ? "EMAIL_SEND" : "SMS_SEND",
      channel: message.channel,
      failureKind: "PROVIDER_UNAVAILABLE",
      rawError: error,
    });

    return {
      ok: false,
      provider: message.provider ?? "unknown",
      safeErrorCode: failure.safeErrorCode,
      safeErrorMessage: failure.safeErrorMessage,
      retryable: failure.retryable,
      detailJson: failure.detailJson,
    };
  }

  private async throwCurrentDispatchConflict(
    userId: string,
    messageId: string
  ): Promise<never> {
    const message = await this.repository.findMessageForUser({
      userId,
      messageId,
    });

    if (!message) {
      throw new FollowUpMessageNotFoundError();
    }

    if (message.status === "SENT") {
      throw new FollowUpMessageAlreadySentError();
    }

    if (message.status === "FAILED" && !message.retryable) {
      throw new FollowUpMessageNotRetryableError();
    }

    throw new FollowUpMessageNotSendableError();
  }

  private findMessageOrThrow(
    userId: string,
    messageId: string
  ): Promise<FollowUpMessageDetailRecord> {
    return this.repository
      .findMessageForUser({
        userId,
        messageId,
      })
      .then((message) => {
        if (!message) {
          throw new FollowUpMessageNotFoundError();
        }

        return message;
      });
  }

  private assertMessageContent(
    channel: FollowUpDeliveryChannelValue,
    subject: string | null,
    body: string
  ): void {
    this.normalizeMessageBody(body);

    if (channel === "EMAIL") {
      this.normalizeEmailSubject(subject);
      return;
    }

    this.assertSmsBodyWithinTwoSegments(body);
  }

  private createTargets(input: {
    readonly userId: string;
    readonly source: FollowUpDraftSourceRecord;
    readonly recipientContactId: string;
  }): readonly CreateFollowUpMessageTargetInput[] {
    const targets = new Map<string, CreateFollowUpMessageTargetInput>();
    const addTarget = (target: CreateFollowUpMessageTargetInput) => {
      targets.set(`${target.targetType}:${target.targetId}`, target);
    };

    addTarget({
      userId: input.userId,
      targetType: "AI_WEEKLY_REPORT",
      targetId: input.source.report.id,
      targetPath: `/sales-reports/weekly/${input.source.report.id}`,
      targetLabel: this.formatWeekTargetLabel(input.source.report),
    });
    addTarget({
      userId: input.userId,
      targetType: "CONTACT",
      targetId: input.recipientContactId,
      targetPath: `/contacts/${input.recipientContactId}`,
      targetLabel: null,
    });

    const suggestionTarget = this.toSuggestionTarget(input);
    if (suggestionTarget) {
      addTarget(suggestionTarget);
    }

    return [...targets.values()];
  }

  private toSuggestionTarget(input: {
    readonly userId: string;
    readonly source: FollowUpDraftSourceRecord;
  }): CreateFollowUpMessageTargetInput | null {
    const targetType = this.toTargetType(input.source.suggestion.targetType);
    const targetId = input.source.suggestion.targetId;

    if (!targetType || !targetId || !UUID_PATTERN.test(targetId)) {
      return null;
    }

    return {
      userId: input.userId,
      targetType,
      targetId,
      targetPath:
        input.source.suggestion.targetPath ??
        this.createDefaultTargetPath(targetType, targetId),
      targetLabel: input.source.suggestion.targetLabel,
    };
  }

  private createDraftProviderCallMetadata(input: {
    readonly channel: FollowUpDeliveryChannelValue;
    readonly languageTag: string;
    readonly suggestion: FollowUpSuggestionRecord;
    readonly recipientContactId: string;
  }): Record<string, unknown> {
    return {
      channel: input.channel,
      languageTag: input.languageTag,
      suggestionId: input.suggestion.id,
      suggestionType: input.suggestion.type,
      targetType: input.suggestion.targetType,
      targetId: input.suggestion.targetId,
      recipientContactId: input.recipientContactId,
    };
  }

  private toMessageResponse(
    message: FollowUpMessageDetailRecord
  ): FollowUpMessageResponse {
    return {
      ...this.toListItemResponse(message),
      body: message.body,
      deliveryAttempts: message.deliveryAttempts.map((attempt) => ({
        id: attempt.id,
        status: attempt.status,
        attemptNumber: attempt.attemptNumber,
        provider: attempt.provider,
        providerMessageId: attempt.providerMessageId,
        providerStatusCode: attempt.providerStatusCode,
        safeErrorCode: attempt.safeErrorCode,
        safeErrorMessage: attempt.safeErrorMessage,
        retryable: attempt.retryable,
        nextRetryAt: attempt.nextRetryAt?.toISOString() ?? null,
        latencyMs: attempt.latencyMs,
        estimatedCostAmount: attempt.estimatedCostAmount,
        costCurrency: attempt.costCurrency,
        sentAt: attempt.sentAt?.toISOString() ?? null,
        failedAt: attempt.failedAt?.toISOString() ?? null,
        createdAt: attempt.createdAt.toISOString(),
      })),
    };
  }

  private toListItemResponse(
    message: FollowUpMessageDetailRecord
  ): FollowUpMessageListItemResponse {
    return {
      id: message.id,
      status: message.status,
      channel: message.channel,
      languageTag: message.languageTag,
      sender: {
        displayName: message.senderDisplayName,
        email: message.senderEmail,
        phoneE164Masked: message.senderPhoneE164Masked,
      },
      recipient: {
        contactId: message.recipientContactId,
        name: message.recipientName,
        email: message.recipientEmail,
        phoneE164Masked: message.recipientPhoneE164Masked,
      },
      subject: message.subject,
      bodyPreview: message.bodyPreview,
      provider: message.provider,
      providerMessageId: message.providerMessageId,
      safeErrorCode: message.safeErrorCode,
      safeErrorMessage: message.safeErrorMessage,
      retryable: message.retryable,
      retryCount: message.retryCount,
      sentAt: message.sentAt?.toISOString() ?? null,
      failedAt: message.failedAt?.toISOString() ?? null,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      sourceReportId: message.sourceReportId,
      sourceSuggestionId: message.sourceSuggestionId,
      targets: message.targets.map((target) => this.toTargetResponse(target)),
    };
  }

  private toTargetResponse(
    target: FollowUpMessageTargetRecord
  ): FollowUpMessageTargetResponse {
    return {
      targetType: target.targetType,
      targetId: target.targetId,
      targetPath: target.targetPath,
      targetLabel: target.targetLabel,
    };
  }

  private normalizeChannel(value: unknown): FollowUpDeliveryChannelValue {
    const normalized = this.normalizeRequiredText(value, "channel").toUpperCase();

    if (normalized === "EMAIL" || normalized === "SMS") {
      return normalized;
    }

    throw new ValidationDomainError("channel must be email or sms");
  }

  private normalizeOptionalTargetType(
    value: unknown
  ): FollowUpTargetTypeValue | null {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const targetType = this.toTargetType(this.normalizeRequiredText(value, "targetType"));

    if (!targetType) {
      throw new ValidationDomainError("targetType is invalid");
    }

    return targetType;
  }

  private normalizeLanguageTag(value: unknown): string {
    const languageTag = this.normalizeRequiredText(value, "languageTag").replace(
      "_",
      "-"
    );

    if (!LANGUAGE_TAG_PATTERN.test(languageTag)) {
      throw new ValidationDomainError("languageTag must be valid");
    }

    return languageTag;
  }

  private normalizeUuid(value: unknown, fieldName: string): string {
    const normalized = this.normalizeRequiredText(value, fieldName);

    if (!UUID_PATTERN.test(normalized)) {
      throw new ValidationDomainError(`${fieldName} must be a UUID`);
    }

    return normalized;
  }

  private normalizeRequiredText(value: unknown, fieldName: string): string {
    if (typeof value !== "string") {
      throw new ValidationDomainError(`${fieldName} must be a string`);
    }

    const normalized = value.trim();

    if (!normalized) {
      throw new ValidationDomainError(`${fieldName} is required`);
    }

    return normalized;
  }

  private normalizeEmailSubject(value: unknown): string {
    const subject = this.normalizeRequiredText(value, "subject");

    if (subject.length > MAX_EMAIL_SUBJECT_LENGTH) {
      throw new ValidationDomainError("subject is too long");
    }

    return subject;
  }

  private normalizeMessageBody(value: unknown): string {
    const body = this.normalizeRequiredText(value, "body");

    if (body.length > MAX_EMAIL_BODY_LENGTH) {
      throw new ValidationDomainError("body is too long");
    }

    return body;
  }

  private normalizeRecipientEmail(value: string | null): string {
    const email = value?.trim() ?? "";

    if (!EMAIL_PATTERN.test(email)) {
      throw new FollowUpInvalidRecipientError(
        "Recipient email is missing or invalid."
      );
    }

    return email;
  }

  private normalizeRecipientPhone(value: string | null): string {
    const phone = value?.trim() ?? "";

    if (E164_PATTERN.test(phone)) {
      return phone;
    }

    const digitOnly = phone.replace(/\D/g, "");
    if (/^010\d{8}$/.test(digitOnly)) {
      return `+82${digitOnly.slice(1)}`;
    }

    throw new FollowUpInvalidRecipientError(
      "Recipient phone number is missing or invalid."
    );
  }

  private assertSmsBodyWithinTwoSegments(body: string): void {
    const maxLength = this.isAsciiSms(body)
      ? MAX_SMS_ASCII_TWO_SEGMENT_LENGTH
      : MAX_SMS_UNICODE_TWO_SEGMENT_LENGTH;

    if (body.length > maxLength) {
      throw new FollowUpSmsBodyTooLongError();
    }
  }

  private isAsciiSms(body: string): boolean {
    return [...body].every((character) => character.charCodeAt(0) <= 127);
  }

  private normalizePage(value: unknown): number {
    if (value === undefined || value === null || value === "") {
      return 1;
    }

    const page =
      typeof value === "number" ? value : Number.parseInt(String(value), 10);

    if (!Number.isInteger(page) || page < 1) {
      throw new ValidationDomainError("page must be a positive integer");
    }

    return page;
  }

  private toTargetType(value: string | null | undefined): FollowUpTargetTypeValue | null {
    const normalized = value?.trim().toUpperCase();

    if (
      normalized === "AI_WEEKLY_REPORT" ||
      normalized === "DEAL" ||
      normalized === "CONTACT" ||
      normalized === "MEETING_NOTE" ||
      normalized === "SCHEDULE"
    ) {
      return normalized;
    }

    return null;
  }

  private toDraftProviderOperation(
    channel: FollowUpDeliveryChannelValue
  ): FollowUpDraftProviderOperationValue {
    return channel === "EMAIL"
      ? "FOLLOW_UP_EMAIL_DRAFT"
      : "FOLLOW_UP_SMS_DRAFT";
  }

  private createDefaultTargetPath(
    targetType: FollowUpTargetTypeValue,
    targetId: string
  ): string {
    switch (targetType) {
      case "AI_WEEKLY_REPORT":
        return `/sales-reports/weekly/${targetId}`;
      case "DEAL":
        return `/deals/${targetId}`;
      case "CONTACT":
        return `/contacts/${targetId}`;
      case "MEETING_NOTE":
        return `/meeting-notes/${targetId}`;
      case "SCHEDULE":
        return `/schedules/${targetId}`;
    }
  }

  private formatWeekTargetLabel(report: {
    readonly weekStart: Date;
    readonly weekEnd: Date;
  }): string {
    return `${report.weekStart.toISOString().slice(0, 10)} - ${report.weekEnd
      .toISOString()
      .slice(0, 10)}`;
  }

  private createBodyPreview(body: string): string {
    const compact = body.replace(/\s+/g, " ").trim();

    return compact.length > BODY_PREVIEW_LENGTH
      ? `${compact.slice(0, BODY_PREVIEW_LENGTH - 3)}...`
      : compact;
  }

  private maskPhoneE164(phoneE164: string): string {
    if (phoneE164.length <= 5) {
      return `${phoneE164.slice(0, 1)}****`;
    }

    const prefixLength = Math.min(3, phoneE164.length - 4);
    const prefix = phoneE164.slice(0, prefixLength);
    const suffix = phoneE164.slice(-4);
    const hiddenLength = Math.max(phoneE164.length - prefix.length - suffix.length, 4);

    return `${prefix}${"*".repeat(hiddenLength)}${suffix}`;
  }

  private toLatencyMs(started: number): number {
    return Math.max(Math.round(performance.now() - started), 0);
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "FollowUpMessageApplicationService"
    );
  }
}
