import { Prisma } from "@prisma/client";
import type {
  ConsumeOAuthStateAndUpsertConnectionInput,
  CreateFollowUpEmailOAuthStateInput,
  DisconnectFollowUpEmailConnectionInput,
  FindEmailConnectionInput,
  FindOAuthStateInput,
  FindSmsSenderNumberInput,
  FollowUpConsentNoticeRecord,
  FollowUpDeliverySettingsAggregate,
  FollowUpEmailConnectionRecord,
  FollowUpEmailOAuthStateRecord,
  FollowUpSettingsRepository,
  RevokeSmsSenderNumberInput,
  SmsSenderNumberRecord,
  UpsertFollowUpConsentNoticeInput,
  UpsertSmsSenderNumberVerificationInput,
  VerifySmsSenderNumberInput,
} from "@/modules/follow-up/application/ports/follow-up-settings.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type FollowUpPrismaClient = PrismaService | Prisma.TransactionClient;

export class PrismaFollowUpSettingsRepository
  implements FollowUpSettingsRepository
{
  constructor(
    private readonly client: FollowUpPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  async runInTransaction<T>(
    work: (repository: FollowUpSettingsRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) =>
      work(new PrismaFollowUpSettingsRepository(transaction, null))
    );
  }

  async getSettingsAggregate(
    userId: string
  ): Promise<FollowUpDeliverySettingsAggregate> {
    const [emailConnections, smsSenderNumbers, consentNotices] =
      await Promise.all([
        this.client.externalEmailConnection.findMany({
          where: { userId },
          orderBy: [{ provider: "asc" }],
          select: this.createEmailConnectionSelect(),
        }),
        this.client.smsSenderNumber.findMany({
          where: { userId },
          orderBy: [{ createdAt: "desc" }],
          select: this.createSmsSenderNumberSelect(),
        }),
        this.client.followUpConsentNotice.findMany({
          where: { userId },
          orderBy: [{ channel: "asc" }],
          select: this.createConsentNoticeSelect(),
        }),
      ]);

    return {
      emailConnections: emailConnections.map((row) =>
        this.mapEmailConnection(row)
      ),
      smsSenderNumbers: smsSenderNumbers.map((row) =>
        this.mapSmsSenderNumber(row)
      ),
      consentNotices: consentNotices.map((row) => this.mapConsentNotice(row)),
    };
  }

  async createEmailOAuthState(
    input: CreateFollowUpEmailOAuthStateInput
  ): Promise<FollowUpEmailOAuthStateRecord> {
    await this.client.externalEmailOAuthState.updateMany({
      where: {
        userId: input.userId,
        provider: input.provider,
        consumedAt: null,
        expiresAt: { gt: input.now },
      },
      data: {
        consumedAt: input.now,
      },
    });

    const state = await this.client.externalEmailOAuthState.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        stateHash: input.stateHash,
        redirectUri: input.redirectUri,
        expiresAt: input.expiresAt,
      },
      select: this.createOAuthStateSelect(),
    });

    return this.mapOAuthState(state);
  }

  async findUsableEmailOAuthState(
    input: FindOAuthStateInput
  ): Promise<FollowUpEmailOAuthStateRecord | null> {
    const state = await this.client.externalEmailOAuthState.findUnique({
      where: { stateHash: input.stateHash },
      select: this.createOAuthStateSelect(),
    });

    if (
      !state ||
      state.provider !== input.provider ||
      state.consumedAt !== null ||
      state.expiresAt.getTime() <= input.now.getTime()
    ) {
      return null;
    }

    return this.mapOAuthState(state);
  }

  async consumeOAuthStateAndUpsertEmailConnection(
    input: ConsumeOAuthStateAndUpsertConnectionInput
  ): Promise<FollowUpEmailConnectionRecord | null> {
    const consumed = await this.client.externalEmailOAuthState.updateMany({
      where: {
        id: input.stateId,
        consumedAt: null,
        expiresAt: { gt: input.now },
        provider: input.connection.provider,
      },
      data: {
        consumedAt: input.now,
      },
    });

    if (consumed.count !== 1) {
      return null;
    }

    const connection = await this.client.externalEmailConnection.upsert({
      where: {
        userId_provider: {
          userId: input.connection.userId,
          provider: input.connection.provider,
        },
      },
      create: {
        userId: input.connection.userId,
        provider: input.connection.provider,
        providerAccountId: input.connection.providerAccountId,
        providerAccountEmail: input.connection.providerAccountEmail,
        status: "CONNECTED",
        encryptedAccessToken: input.connection.encryptedAccessToken,
        encryptedRefreshToken: input.connection.encryptedRefreshToken ?? null,
        tokenExpiresAt: input.connection.tokenExpiresAt,
        grantedScopes: [...input.connection.grantedScopes],
        connectedAt: input.connection.connectedAt,
        disconnectedAt: null,
        reconnectRequiredAt: null,
      },
      update: {
        providerAccountId: input.connection.providerAccountId,
        providerAccountEmail: input.connection.providerAccountEmail,
        status: "CONNECTED",
        encryptedAccessToken: input.connection.encryptedAccessToken,
        ...(input.connection.encryptedRefreshToken
          ? { encryptedRefreshToken: input.connection.encryptedRefreshToken }
          : {}),
        tokenExpiresAt: input.connection.tokenExpiresAt,
        grantedScopes: [...input.connection.grantedScopes],
        connectedAt: input.connection.connectedAt,
        disconnectedAt: null,
        reconnectRequiredAt: null,
      },
      select: this.createEmailConnectionSelect(),
    });

    return this.mapEmailConnection(connection);
  }

  async findEmailConnectionForUser(
    input: FindEmailConnectionInput
  ): Promise<FollowUpEmailConnectionRecord | null> {
    const connection = await this.client.externalEmailConnection.findFirst({
      where: {
        id: input.connectionId,
        userId: input.userId,
      },
      select: this.createEmailConnectionSelect(),
    });

    return connection ? this.mapEmailConnection(connection) : null;
  }

  async disconnectEmailConnection(
    input: DisconnectFollowUpEmailConnectionInput
  ): Promise<FollowUpEmailConnectionRecord | null> {
    const existing = await this.client.externalEmailConnection.findFirst({
      where: {
        id: input.connectionId,
        userId: input.userId,
      },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const connection = await this.client.externalEmailConnection.update({
      where: { id: existing.id },
      data: {
        status: "DISCONNECTED",
        encryptedAccessToken: null,
        encryptedRefreshToken: null,
        tokenExpiresAt: null,
        disconnectedAt: input.disconnectedAt,
        reconnectRequiredAt: null,
      },
      select: this.createEmailConnectionSelect(),
    });

    return this.mapEmailConnection(connection);
  }

  async upsertSmsSenderNumberVerification(
    input: UpsertSmsSenderNumberVerificationInput
  ): Promise<SmsSenderNumberRecord> {
    const senderNumber = await this.client.smsSenderNumber.upsert({
      where: {
        userId_phoneE164Hash: {
          userId: input.userId,
          phoneE164Hash: input.phoneE164Hash,
        },
      },
      create: {
        userId: input.userId,
        phoneE164Hash: input.phoneE164Hash,
        phoneE164Ciphertext: input.phoneE164Ciphertext,
        phoneE164Masked: input.phoneE164Masked,
        status: "PENDING_VERIFICATION",
        provider: input.provider,
        providerSenderId: input.providerSenderId,
        verificationCodeHash: input.verificationCodeHash,
        verificationExpiresAt: input.verificationExpiresAt,
        verifiedAt: null,
        revokedAt: null,
      },
      update: {
        phoneE164Ciphertext: input.phoneE164Ciphertext,
        phoneE164Masked: input.phoneE164Masked,
        status: "PENDING_VERIFICATION",
        provider: input.provider,
        providerSenderId: input.providerSenderId,
        verificationCodeHash: input.verificationCodeHash,
        verificationExpiresAt: input.verificationExpiresAt,
        verifiedAt: null,
        revokedAt: null,
        lastSendSafeErrorCode: null,
      },
      select: this.createSmsSenderNumberSelect(),
    });

    return this.mapSmsSenderNumber(senderNumber);
  }

  async findSmsSenderNumberForUser(
    input: FindSmsSenderNumberInput
  ): Promise<SmsSenderNumberRecord | null> {
    const senderNumber = await this.client.smsSenderNumber.findFirst({
      where: {
        id: input.senderNumberId,
        userId: input.userId,
      },
      select: this.createSmsSenderNumberSelect(),
    });

    return senderNumber ? this.mapSmsSenderNumber(senderNumber) : null;
  }

  async markSmsSenderNumberVerified(
    input: VerifySmsSenderNumberInput
  ): Promise<SmsSenderNumberRecord | null> {
    const existing = await this.client.smsSenderNumber.findFirst({
      where: {
        id: input.senderNumberId,
        userId: input.userId,
      },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const senderNumber = await this.client.smsSenderNumber.update({
      where: { id: existing.id },
      data: {
        status: "VERIFIED",
        verifiedAt: input.verifiedAt,
        verificationCodeHash: null,
        verificationExpiresAt: null,
        revokedAt: null,
      },
      select: this.createSmsSenderNumberSelect(),
    });

    return this.mapSmsSenderNumber(senderNumber);
  }

  async revokeSmsSenderNumber(
    input: RevokeSmsSenderNumberInput
  ): Promise<SmsSenderNumberRecord | null> {
    const existing = await this.client.smsSenderNumber.findFirst({
      where: {
        id: input.senderNumberId,
        userId: input.userId,
      },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const senderNumber = await this.client.smsSenderNumber.update({
      where: { id: existing.id },
      data: {
        status: "REVOKED",
        revokedAt: input.revokedAt,
        verificationCodeHash: null,
        verificationExpiresAt: null,
      },
      select: this.createSmsSenderNumberSelect(),
    });

    return this.mapSmsSenderNumber(senderNumber);
  }

  async upsertConsentNotice(
    input: UpsertFollowUpConsentNoticeInput
  ): Promise<FollowUpConsentNoticeRecord> {
    const notice = await this.client.followUpConsentNotice.upsert({
      where: {
        userId_channel: {
          userId: input.userId,
          channel: input.channel,
        },
      },
      create: {
        userId: input.userId,
        channel: input.channel,
        acknowledgedAt: input.acknowledgedAt,
      },
      update: {
        acknowledgedAt: input.acknowledgedAt,
      },
      select: this.createConsentNoticeSelect(),
    });

    return this.mapConsentNotice(notice);
  }

  private createEmailConnectionSelect() {
    return {
      id: true,
      userId: true,
      provider: true,
      providerAccountId: true,
      providerAccountEmail: true,
      status: true,
      encryptedAccessToken: true,
      encryptedRefreshToken: true,
      tokenExpiresAt: true,
      grantedScopes: true,
      connectedAt: true,
      disconnectedAt: true,
      reconnectRequiredAt: true,
      lastSentAt: true,
      lastSendSafeErrorCode: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.ExternalEmailConnectionSelect;
  }

  private createOAuthStateSelect() {
    return {
      id: true,
      userId: true,
      provider: true,
      stateHash: true,
      redirectUri: true,
      expiresAt: true,
      consumedAt: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.ExternalEmailOAuthStateSelect;
  }

  private createSmsSenderNumberSelect() {
    return {
      id: true,
      userId: true,
      phoneE164Hash: true,
      phoneE164Ciphertext: true,
      phoneE164Masked: true,
      status: true,
      provider: true,
      providerSenderId: true,
      verificationCodeHash: true,
      verificationExpiresAt: true,
      verifiedAt: true,
      revokedAt: true,
      lastSentAt: true,
      lastSendSafeErrorCode: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.SmsSenderNumberSelect;
  }

  private createConsentNoticeSelect() {
    return {
      id: true,
      userId: true,
      channel: true,
      acknowledgedAt: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.FollowUpConsentNoticeSelect;
  }

  private mapEmailConnection(
    row: FollowUpEmailConnectionRecord
  ): FollowUpEmailConnectionRecord {
    return row;
  }

  private mapOAuthState(
    row: FollowUpEmailOAuthStateRecord
  ): FollowUpEmailOAuthStateRecord {
    return row;
  }

  private mapSmsSenderNumber(
    row: SmsSenderNumberRecord
  ): SmsSenderNumberRecord {
    return row;
  }

  private mapConsentNotice(
    row: FollowUpConsentNoticeRecord
  ): FollowUpConsentNoticeRecord {
    return row;
  }
}
