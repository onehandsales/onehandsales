import { randomUUID } from "node:crypto";
import type {
  ExternalEmailProviderValue,
  FollowUpEmailAuthorizationUrlResult,
  FollowUpEmailDeliveryProvider,
  FollowUpEmailTokenSet,
  FollowUpProviderDeliveryResult,
  FollowUpSmsDeliveryProvider,
} from "@/modules/follow-up/application/ports/follow-up-delivery.provider";
import type { FollowUpDeliverySecretEncryptionPort } from "@/modules/follow-up/application/ports/follow-up-delivery-secret-encryption.port";
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
import { FollowUpDeliverySafeErrorMapper } from "@/modules/follow-up/application/services/follow-up-delivery-safe-error.mapper";
import {
  FollowUpConsentNoticeRequiredError,
  FollowUpDraftSourceInvalidError,
  FollowUpInvalidRecipientError,
  FollowUpMessageAlreadySentError,
  FollowUpSmsBodyTooLongError,
} from "@/modules/follow-up/domain/follow-up-delivery.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { FollowUpMessageApplicationService } from "./follow-up-message-application.service";

const USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "owner@example.com",
  displayName: "Owner",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};
const REPORT_ID = "00000000-0000-4000-8000-000000000301";
const SUGGESTION_ID = "00000000-0000-4000-8000-000000000302";
const CONTACT_ID = "00000000-0000-4000-8000-000000000401";
const DEAL_ID = "00000000-0000-4000-8000-000000000501";
const MEETING_NOTE_ID = "00000000-0000-4000-8000-000000000502";
const SCHEDULE_ID = "00000000-0000-4000-8000-000000000503";
const EMAIL_CONNECTION_ID = "00000000-0000-4000-8000-000000000601";
const SMS_SENDER_ID = "00000000-0000-4000-8000-000000000701";

describe("FollowUpMessageApplicationService", () => {
  it("creates an email draft from a FOLLOW_UP suggestion and stores safe provider call metadata", async () => {
    const fixture = createFixture();

    const response = await fixture.service.createDraft(USER, {
      sourceReportId: REPORT_ID,
      sourceSuggestionId: SUGGESTION_ID,
      channel: "email",
      languageTag: "en-US",
      recipientContactId: CONTACT_ID,
    });

    expect(response).toMatchObject({
      status: "DRAFT",
      channel: "EMAIL",
      recipient: {
        contactId: CONTACT_ID,
        email: "buyer@example.com",
      },
      sender: {
        email: "owner@example.com",
      },
      subject: "Follow-up subject",
      body: "Follow-up body for Buyer",
    });
    expect(response.targets.map((target) => target.targetType)).toEqual([
      "AI_WEEKLY_REPORT",
      "CONTACT",
      "DEAL",
    ]);
    expect(fixture.repository.providerCalls[0]).toMatchObject({
      operation: "FOLLOW_UP_EMAIL_DRAFT",
      status: "SUCCEEDED",
      reportId: REPORT_ID,
    });
    expect(JSON.stringify(fixture.repository.providerCalls)).not.toContain(
      "Follow-up body for Buyer"
    );
  });

  it("rejects non-follow-up sources and recipients outside the suggestion context", async () => {
    const fixture = createFixture();
    fixture.repository.sources[0] = createSource({
      suggestion: { type: "RISK" },
    });

    await expect(
      fixture.service.createDraft(USER, {
        sourceReportId: REPORT_ID,
        sourceSuggestionId: SUGGESTION_ID,
        channel: "EMAIL",
        languageTag: "en-US",
        recipientContactId: CONTACT_ID,
      })
    ).rejects.toBeInstanceOf(FollowUpDraftSourceInvalidError);

    const invalidRecipientFixture = createFixture();
    invalidRecipientFixture.repository.allowedRecipientIds.clear();

    await expect(
      invalidRecipientFixture.service.createDraft(USER, {
        sourceReportId: REPORT_ID,
        sourceSuggestionId: SUGGESTION_ID,
        channel: "EMAIL",
        languageTag: "en-US",
        recipientContactId: CONTACT_ID,
      })
    ).rejects.toBeInstanceOf(FollowUpInvalidRecipientError);
  });

  it("updates editable drafts and rejects sent edits or overlong SMS bodies", async () => {
    const fixture = createFixture();
    const smsDraft = await fixture.service.createDraft(USER, {
      sourceReportId: REPORT_ID,
      sourceSuggestionId: SUGGESTION_ID,
      channel: "SMS",
      languageTag: "ko-KR",
      recipientContactId: CONTACT_ID,
    });

    await expect(
      fixture.service.updateDraft(USER, smsDraft.id, {
        body: "가".repeat(135),
      })
    ).rejects.toBeInstanceOf(FollowUpSmsBodyTooLongError);

    const updated = await fixture.service.updateDraft(USER, smsDraft.id, {
      body: "확인 부탁드립니다.",
    });
    expect(updated.bodyPreview).toBe("확인 부탁드립니다.");

    const storedMessage = fixture.repository.messages[0];
    if (!storedMessage) {
      throw new Error("Expected SMS draft to be stored");
    }

    fixture.repository.messages[0] = {
      ...storedMessage,
      status: "SENT",
      sentAt: new Date(),
    };

    await expect(
      fixture.service.updateDraft(USER, smsDraft.id, {
        body: "다시 수정",
      })
    ).rejects.toBeInstanceOf(FollowUpMessageAlreadySentError);
  });

  it("sends email successfully once and prevents duplicate delivery attempts", async () => {
    const fixture = createFixture();
    fixture.emailProvider.results.push({
      ok: true,
      provider: "fake-email",
      providerMessageId: "provider-message-1",
      providerStatusCode: "202",
    });
    const draft = await fixture.service.createDraft(USER, {
      sourceReportId: REPORT_ID,
      sourceSuggestionId: SUGGESTION_ID,
      channel: "EMAIL",
      languageTag: "en-US",
      recipientContactId: CONTACT_ID,
    });

    const sent = await fixture.service.sendMessage(USER, draft.id);

    expect(sent.status).toBe("SENT");
    expect(sent.providerMessageId).toBe("provider-message-1");
    expect(fixture.emailProvider.sendCalls).toHaveLength(1);
    expect(fixture.repository.attempts).toHaveLength(1);

    await expect(
      fixture.service.sendMessage(USER, draft.id)
    ).rejects.toBeInstanceOf(FollowUpMessageAlreadySentError);
    expect(fixture.emailProvider.sendCalls).toHaveLength(1);
    expect(fixture.repository.attempts).toHaveLength(1);
  });

  it("stores retryable provider failures and retries them with a new attempt", async () => {
    const fixture = createFixture();
    fixture.emailProvider.results.push(
      {
        ok: false,
        provider: "fake-email",
        safeErrorCode: "FollowUpProviderTimeout",
        safeErrorMessage: "Provider timed out.",
        retryable: true,
        detailJson: { failureKind: "TIMEOUT" },
      },
      {
        ok: true,
        provider: "fake-email",
        providerMessageId: "provider-message-2",
        providerStatusCode: "202",
      }
    );
    const draft = await fixture.service.createDraft(USER, {
      sourceReportId: REPORT_ID,
      sourceSuggestionId: SUGGESTION_ID,
      channel: "EMAIL",
      languageTag: "en-US",
      recipientContactId: CONTACT_ID,
    });

    const failed = await fixture.service.sendMessage(USER, draft.id);
    expect(failed).toMatchObject({
      status: "FAILED",
      safeErrorCode: "FollowUpProviderTimeout",
      retryable: true,
    });

    const retried = await fixture.service.retryMessage(USER, draft.id);

    expect(retried.status).toBe("SENT");
    expect(retried.providerMessageId).toBe("provider-message-2");
    expect(fixture.repository.attempts.map((attempt) => attempt.status)).toEqual([
      "FAILED",
      "SENT",
    ]);
  });

  it("blocks send without consent and lists history by report or target without full body", async () => {
    const fixture = createFixture({ includeConsent: false });
    const draft = await fixture.service.createDraft(USER, {
      sourceReportId: REPORT_ID,
      sourceSuggestionId: SUGGESTION_ID,
      channel: "EMAIL",
      languageTag: "en-US",
      recipientContactId: CONTACT_ID,
    });

    await expect(
      fixture.service.sendMessage(USER, draft.id)
    ).rejects.toBeInstanceOf(FollowUpConsentNoticeRequiredError);
    expect(fixture.repository.attempts).toHaveLength(0);

    const byReport = await fixture.service.listMessages(USER, {
      sourceReportId: REPORT_ID,
      page: "1",
    });
    const byTarget = await fixture.service.listMessages(USER, {
      targetType: "DEAL",
      targetId: DEAL_ID,
    });

    expect(byReport.items).toHaveLength(1);
    expect(byTarget.items).toHaveLength(1);
    expect(byReport.items[0]).not.toHaveProperty("body");
    expect(byReport.items[0]?.bodyPreview).toBe("Follow-up body for Buyer");
  });

  it("lists history by contact, meeting note, and schedule timeline targets", async () => {
    const fixture = createFixture();
    const cases = [
      {
        targetType: "CONTACT",
        targetId: CONTACT_ID,
        targetPath: `/contacts/${CONTACT_ID}`,
      },
      {
        targetType: "MEETING_NOTE",
        targetId: MEETING_NOTE_ID,
        targetPath: `/meeting-notes/${MEETING_NOTE_ID}`,
      },
      {
        targetType: "SCHEDULE",
        targetId: SCHEDULE_ID,
        targetPath: `/schedules/${SCHEDULE_ID}`,
      },
    ] as const;

    for (const item of cases) {
      fixture.repository.sources[0] = createSource({
        suggestion: {
          targetType: item.targetType,
          targetId: item.targetId,
          targetPath: item.targetPath,
          targetLabel: item.targetType,
        },
      });
      await fixture.service.createDraft(USER, {
        sourceReportId: REPORT_ID,
        sourceSuggestionId: SUGGESTION_ID,
        channel: "EMAIL",
        languageTag: "en-US",
        recipientContactId: CONTACT_ID,
      });

      const result = await fixture.service.listMessages(USER, {
        targetType: item.targetType,
        targetId: item.targetId,
      });

      expect(result.items.length).toBeGreaterThanOrEqual(1);
      expect(
        result.items.some((message) =>
          message.targets.some(
            (target) =>
              target.targetType === item.targetType &&
              target.targetId === item.targetId
          )
        )
      ).toBe(true);
    }
  });
});

function createFixture(input: { includeConsent?: boolean } = {}) {
  const repository = new InMemoryFollowUpMessageRepository();
  if (input.includeConsent !== false) {
    repository.consentNotices.push(createConsentNotice("EMAIL"));
    repository.consentNotices.push(createConsentNotice("SMS"));
  }

  const draftProvider = {
    getMetadata: () => ({
      provider: "fake-draft",
      model: "fake-draft-model",
    }),
    generateDraft: jest.fn((command: { channel: "EMAIL" | "SMS" }) =>
      Promise.resolve({
        provider: "fake-draft",
        model: "fake-draft-model",
        requestId: "draft-request-1",
        subject: command.channel === "EMAIL" ? "Follow-up subject" : null,
        body:
          command.channel === "EMAIL"
            ? "Follow-up body for Buyer"
            : "확인 부탁드립니다.",
        usage: {
          inputTokenCount: 10,
          outputTokenCount: 5,
          totalTokenCount: 15,
          estimatedCostAmount: "0",
          costCurrency: "USD",
        },
      })
    ),
  };
  const emailProvider = new FakeEmailProvider();
  const smsProvider = new FakeSmsProvider();
  const service = new FollowUpMessageApplicationService(
    repository,
    draftProvider,
    emailProvider,
    smsProvider,
    new FakeSecretEncryption(),
    new FollowUpDeliverySafeErrorMapper(),
    { log: jest.fn() } as never
  );

  return {
    repository,
    emailProvider,
    smsProvider,
    service,
  };
}

function createSource(input: {
  readonly suggestion?: Partial<FollowUpSuggestionRecord>;
} = {}): FollowUpDraftSourceRecord {
  return {
    report: {
      id: REPORT_ID,
      userId: USER.id,
      weekStart: new Date("2026-07-20T00:00:00.000Z"),
      weekEnd: new Date("2026-07-26T00:00:00.000Z"),
      timeZone: "Asia/Seoul",
      locale: "ko-KR",
    },
    suggestion: {
      id: SUGGESTION_ID,
      reportId: REPORT_ID,
      userId: USER.id,
      type: "FOLLOW_UP",
      title: "Follow up after meeting",
      body: "Please follow up on the agreed next steps.",
      reason: "Meeting note includes a next plan.",
      targetType: "DEAL",
      targetId: DEAL_ID,
      targetPath: `/deals/${DEAL_ID}`,
      targetLabel: "Renewal deal",
      payloadJson: {},
      ...input.suggestion,
    },
  };
}

function createConsentNotice(channel: "EMAIL" | "SMS"): FollowUpConsentNoticeRecord {
  const now = new Date("2026-07-24T05:00:00.000Z");

  return {
    id: randomUUID(),
    userId: USER.id,
    channel,
    acknowledgedAt: now,
  };
}

class FakeEmailProvider implements FollowUpEmailDeliveryProvider {
  results: FollowUpProviderDeliveryResult[] = [];
  sendCalls: readonly unknown[] = [];

  createAuthorizationUrl(): Promise<FollowUpEmailAuthorizationUrlResult> {
    return Promise.resolve({ authorizationUrl: "https://oauth.example.test" });
  }

  exchangeAuthorizationCode(input: {
    provider: ExternalEmailProviderValue;
  }): Promise<FollowUpEmailTokenSet> {
    return Promise.resolve({
      accessToken: "access-token",
      scopes: [],
      providerAccountEmail: `${input.provider.toLowerCase()}@example.com`,
    });
  }

  refreshAccessToken(input: {
    provider: ExternalEmailProviderValue;
  }): Promise<FollowUpEmailTokenSet> {
    return this.exchangeAuthorizationCode(input);
  }

  revokeConnection(): Promise<void> {
    return Promise.resolve();
  }

  sendEmail(input: unknown): Promise<FollowUpProviderDeliveryResult> {
    this.sendCalls = [...this.sendCalls, input];

    return Promise.resolve(
      this.results.shift() ?? {
        ok: true,
        provider: "fake-email",
        providerMessageId: "provider-message-default",
        providerStatusCode: "202",
      }
    );
  }
}

class FakeSmsProvider implements FollowUpSmsDeliveryProvider {
  sendVerificationCode(): Promise<FollowUpProviderDeliveryResult> {
    return Promise.resolve({
      ok: true,
      provider: "fake-sms",
      providerMessageId: "verification-1",
    });
  }

  sendSms(): Promise<FollowUpProviderDeliveryResult> {
    return Promise.resolve({
      ok: true,
      provider: "fake-sms",
      providerMessageId: "sms-1",
      providerStatusCode: "202",
    });
  }
}

class FakeSecretEncryption implements FollowUpDeliverySecretEncryptionPort {
  assertReady(): void {}

  encryptEmailToken(plaintext: string) {
    return { ciphertext: plaintext };
  }

  decryptEmailToken(encrypted: { readonly ciphertext: string }): string {
    return `decrypted:${encrypted.ciphertext}`;
  }

  encryptSmsSenderNumber(phoneE164: string) {
    return {
      phoneE164Hash: `hash:${phoneE164}`,
      phoneE164Ciphertext: phoneE164,
      phoneE164Masked: "+82******5678",
    };
  }

  decryptSmsSenderNumber(encrypted: {
    readonly phoneE164Ciphertext: string;
  }): string {
    return encrypted.phoneE164Ciphertext;
  }

  hashOAuthState(state: string): string {
    return `hash:${state}`;
  }

  hashSmsVerificationCode(input: { readonly code: string }) {
    return { verificationCodeHash: `hash:${input.code}` };
  }
}

class InMemoryFollowUpMessageRepository implements FollowUpMessageRepository {
  sources: FollowUpDraftSourceRecord[] = [createSource()];
  contacts: FollowUpContactRecord[] = [
    {
      id: CONTACT_ID,
      userId: USER.id,
      username: "Buyer",
      mobile: "010-1234-5678",
      email: "buyer@example.com",
    },
  ];
  allowedRecipientIds = new Set([CONTACT_ID]);
  emailConnections: FollowUpEmailConnectionRecord[] = [
    {
      id: EMAIL_CONNECTION_ID,
      userId: USER.id,
      provider: "GOOGLE",
      providerAccountEmail: "owner@example.com",
      status: "CONNECTED",
      encryptedAccessToken: "encrypted-token",
      encryptedRefreshToken: null,
      connectedAt: new Date("2026-07-24T04:00:00.000Z"),
      lastSentAt: null,
      lastSendSafeErrorCode: null,
    },
  ];
  smsSenderNumbers: FollowUpSmsSenderNumberRecord[] = [
    {
      id: SMS_SENDER_ID,
      userId: USER.id,
      phoneE164Ciphertext: "+821099998888",
      phoneE164Masked: "+82******8888",
      status: "VERIFIED",
      provider: "fake-sms",
      lastSentAt: null,
      lastSendSafeErrorCode: null,
    },
  ];
  consentNotices: FollowUpConsentNoticeRecord[] = [];
  messages: FollowUpMessageDetailRecord[] = [];
  targets: FollowUpMessageTargetRecord[] = [];
  attempts: FollowUpDeliveryAttemptRecord[] = [];
  providerCalls: readonly Record<string, unknown>[] = [];

  runInTransaction<T>(
    work: (repository: FollowUpMessageRepository) => Promise<T>
  ): Promise<T> {
    return work(this);
  }

  findDraftSource(input: {
    readonly userId: string;
    readonly reportId: string;
    readonly suggestionId: string;
  }): Promise<FollowUpDraftSourceRecord | null> {
    return Promise.resolve(
      this.sources.find(
        (source) =>
          source.report.id === input.reportId &&
          source.suggestion.id === input.suggestionId &&
          source.report.userId === input.userId
      ) ?? null
    );
  }

  findContactForUser(input: {
    readonly userId: string;
    readonly contactId: string;
  }): Promise<FollowUpContactRecord | null> {
    return Promise.resolve(
      this.contacts.find(
        (contact) =>
          contact.id === input.contactId && contact.userId === input.userId
      ) ?? null
    );
  }

  isRecipientAllowedForSuggestion(input: {
    readonly recipientContactId: string;
  }): Promise<boolean> {
    return Promise.resolve(this.allowedRecipientIds.has(input.recipientContactId));
  }

  findReadyEmailConnectionForUser(
    userId: string
  ): Promise<FollowUpEmailConnectionRecord | null> {
    return Promise.resolve(
      this.emailConnections.find(
        (connection) =>
          connection.userId === userId &&
          connection.status === "CONNECTED" &&
          connection.encryptedAccessToken
      ) ?? null
    );
  }

  findEmailConnectionForSend(input: {
    readonly userId: string;
    readonly connectionId: string;
  }): Promise<FollowUpEmailConnectionRecord | null> {
    return Promise.resolve(
      this.emailConnections.find(
        (connection) =>
          connection.id === input.connectionId &&
          connection.userId === input.userId &&
          connection.status === "CONNECTED" &&
          connection.encryptedAccessToken
      ) ?? null
    );
  }

  findVerifiedSmsSenderNumberForUser(
    userId: string
  ): Promise<FollowUpSmsSenderNumberRecord | null> {
    return Promise.resolve(
      this.smsSenderNumbers.find(
        (senderNumber) =>
          senderNumber.userId === userId && senderNumber.status === "VERIFIED"
      ) ?? null
    );
  }

  findSmsSenderNumberForSend(input: {
    readonly userId: string;
    readonly senderNumberId: string;
  }): Promise<FollowUpSmsSenderNumberRecord | null> {
    return Promise.resolve(
      this.smsSenderNumbers.find(
        (senderNumber) =>
          senderNumber.id === input.senderNumberId &&
          senderNumber.userId === input.userId &&
          senderNumber.status === "VERIFIED"
      ) ?? null
    );
  }

  findConsentNotice(input: {
    readonly userId: string;
    readonly channel: "EMAIL" | "SMS";
  }): Promise<FollowUpConsentNoticeRecord | null> {
    return Promise.resolve(
      this.consentNotices.find(
        (notice) =>
          notice.userId === input.userId && notice.channel === input.channel
      ) ?? null
    );
  }

  createDraftWithProviderCall(
    input: CreateFollowUpDraftInput
  ): Promise<FollowUpMessageDetailRecord> {
    const now = new Date();
    const message: FollowUpMessageDetailRecord = {
      id: randomUUID(),
      userId: input.userId,
      sourceReportId: input.sourceReportId,
      sourceSuggestionId: input.sourceSuggestionId,
      channel: input.channel,
      status: "DRAFT",
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
      provider: null,
      providerMessageId: null,
      safeErrorCode: null,
      safeErrorMessage: null,
      retryable: false,
      retryCount: 0,
      sentAt: null,
      failedAt: null,
      createdAt: now,
      updatedAt: now,
      targets: input.targets.map((target) =>
        this.createTarget(messageIdPlaceholder, input.userId, target)
      ),
      deliveryAttempts: [],
    };
    const targets = input.targets.map((target) =>
      this.createTarget(message.id, input.userId, target)
    );
    const stored = {
      ...message,
      targets,
    };
    this.messages.push(stored);
    this.targets.push(...targets);
    this.providerCalls = [
      ...this.providerCalls,
      {
        operation: input.providerCall.operation,
        status: "SUCCEEDED",
        reportId: input.providerCall.reportId,
        metadataJson: input.providerCall.metadataJson,
      },
    ];

    return Promise.resolve(stored);
  }

  createDraftProviderCallFailure(
    input: CreateDraftProviderCallFailedInput
  ): Promise<void> {
    this.providerCalls = [
      ...this.providerCalls,
      {
        operation: input.operation,
        status: "FAILED",
        reportId: input.reportId,
        safeErrorCode: input.safeErrorCode,
      },
    ];

    return Promise.resolve();
  }

  findMessageForUser(input: {
    readonly userId: string;
    readonly messageId: string;
  }): Promise<FollowUpMessageDetailRecord | null> {
    return Promise.resolve(
      this.messages.find(
        (message) =>
          message.id === input.messageId && message.userId === input.userId
      ) ?? null
    );
  }

  updateDraftMessage(
    input: UpdateFollowUpMessageDraftInput
  ): Promise<FollowUpMessageDetailRecord | null> {
    const message = this.messages.find(
      (candidate) =>
        candidate.id === input.messageId &&
        candidate.userId === input.userId &&
        (candidate.status === "DRAFT" || candidate.status === "FAILED")
    );

    if (!message) {
      return Promise.resolve(null);
    }

    const updated = this.mergeMessage(message, {
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
    });

    return Promise.resolve(updated);
  }

  beginDeliveryAttempt(
    input: BeginFollowUpDeliveryAttemptInput
  ): Promise<BeginFollowUpDeliveryAttemptResult | null> {
    const message = this.messages.find(
      (candidate) =>
        candidate.id === input.messageId &&
        candidate.userId === input.userId &&
        input.allowedStatuses.includes(candidate.status)
    );

    if (!message) {
      return Promise.resolve(null);
    }

    const updated = this.mergeMessage(message, {
      status: "SENDING",
      safeErrorCode: null,
      safeErrorMessage: null,
      retryable: false,
      sentAt: null,
      failedAt: null,
    });
    const attempt = this.createAttempt({
      message: updated,
      status: "PENDING",
      attemptNumber:
        this.attempts.filter((candidate) => candidate.messageId === message.id)
          .length + 1,
    });
    this.attempts.push(attempt);
    this.replaceMessage({
      ...updated,
      deliveryAttempts: [...updated.deliveryAttempts, attempt],
    });

    return Promise.resolve({
      message: updated,
      attempt,
    });
  }

  markDeliverySucceeded(
    input: MarkFollowUpDeliverySucceededInput
  ): Promise<FollowUpMessageDetailRecord | null> {
    this.replaceAttempt(input.attemptId, {
      status: "SENT",
      provider: input.provider,
      providerMessageId: input.providerMessageId,
      providerStatusCode: input.providerStatusCode,
      retryable: false,
      sentAt: input.sentAt,
      failedAt: null,
    });
    const message = this.messages.find(
      (candidate) =>
        candidate.id === input.messageId && candidate.userId === input.userId
    );

    if (!message) {
      return Promise.resolve(null);
    }

    return Promise.resolve(
      this.mergeMessage(message, {
        status: "SENT",
        provider: input.provider,
        providerMessageId: input.providerMessageId,
        safeErrorCode: null,
        safeErrorMessage: null,
        retryable: false,
        sentAt: input.sentAt,
        failedAt: null,
      })
    );
  }

  markDeliveryFailed(
    input: MarkFollowUpDeliveryFailedInput
  ): Promise<FollowUpMessageDetailRecord | null> {
    this.replaceAttempt(input.attemptId, {
      status: "FAILED",
      provider: input.provider,
      providerStatusCode: input.providerStatusCode,
      safeErrorCode: input.safeErrorCode,
      safeErrorMessage: input.safeErrorMessage,
      retryable: input.retryable,
      failedAt: input.failedAt,
    });
    const message = this.messages.find(
      (candidate) =>
        candidate.id === input.messageId && candidate.userId === input.userId
    );

    if (!message) {
      return Promise.resolve(null);
    }

    return Promise.resolve(
      this.mergeMessage(message, {
        status: "FAILED",
        provider: input.provider,
        providerMessageId: null,
        safeErrorCode: input.safeErrorCode,
        safeErrorMessage: input.safeErrorMessage,
        retryable: input.retryable,
        retryCount: message.retryCount + 1,
        sentAt: null,
        failedAt: input.failedAt,
      })
    );
  }

  listMessages(input: ListFollowUpMessagesInput): Promise<FollowUpMessagePageRecord> {
    const items = this.messages.filter((message) => {
      if (message.userId !== input.userId) {
        return false;
      }

      if (input.sourceReportId && message.sourceReportId !== input.sourceReportId) {
        return false;
      }

      if (input.targetType || input.targetId) {
        return message.targets.some(
          (target) =>
            (!input.targetType || target.targetType === input.targetType) &&
            (!input.targetId || target.targetId === input.targetId)
        );
      }

      return true;
    });

    return Promise.resolve({
      items,
      totalCount: items.length,
    });
  }

  private createTarget(
    messageId: string,
    userId: string,
    target: CreateFollowUpDraftInput["targets"][number]
  ): FollowUpMessageTargetRecord {
    return {
      id: randomUUID(),
      userId,
      messageId,
      targetType: target.targetType,
      targetId: target.targetId,
      targetPath: target.targetPath,
      targetLabel: target.targetLabel,
      createdAt: new Date(),
    };
  }

  private createAttempt(input: {
    readonly message: FollowUpMessageDetailRecord;
    readonly status: FollowUpDeliveryAttemptRecord["status"];
    readonly attemptNumber: number;
  }): FollowUpDeliveryAttemptRecord {
    const now = new Date();

    return {
      id: randomUUID(),
      userId: input.message.userId,
      messageId: input.message.id,
      channel: input.message.channel,
      status: input.status,
      attemptNumber: input.attemptNumber,
      provider: null,
      providerMessageId: null,
      providerStatusCode: null,
      safeErrorCode: null,
      safeErrorMessage: null,
      retryable: false,
      nextRetryAt: null,
      latencyMs: null,
      estimatedCostAmount: null,
      costCurrency: "USD",
      sentAt: null,
      failedAt: null,
      detailJson: {},
      createdAt: now,
      updatedAt: now,
    };
  }

  private mergeMessage(
    message: FollowUpMessageDetailRecord,
    patch: Partial<FollowUpMessageRecord>
  ): FollowUpMessageDetailRecord {
    const updated = {
      ...message,
      ...patch,
      updatedAt: new Date(),
      deliveryAttempts: this.attempts.filter(
        (attempt) => attempt.messageId === message.id
      ),
    };
    this.replaceMessage(updated);

    return updated;
  }

  private replaceMessage(message: FollowUpMessageDetailRecord): void {
    const index = this.messages.findIndex((candidate) => candidate.id === message.id);

    if (index >= 0) {
      this.messages[index] = message;
    }
  }

  private replaceAttempt(
    attemptId: string,
    patch: Partial<FollowUpDeliveryAttemptRecord>
  ): void {
    const index = this.attempts.findIndex(
      (candidate) => candidate.id === attemptId
    );

    if (index < 0) {
      return;
    }

    const currentAttempt = this.attempts[index];
    if (!currentAttempt) {
      return;
    }

    this.attempts[index] = {
      ...currentAttempt,
      ...patch,
      updatedAt: new Date(),
    };
    const message = this.messages.find(
      (candidate) => candidate.id === this.attempts[index]?.messageId
    );

    if (message) {
      this.replaceMessage({
        ...message,
        deliveryAttempts: this.attempts.filter(
          (attempt) => attempt.messageId === message.id
        ),
      });
    }
  }
}

const messageIdPlaceholder = "00000000-0000-4000-8000-999999999999";
