import {
  AuditAction,
  PersonalMemoTargetType,
  type Prisma,
} from "@prisma/client";
import {
  summarizeReason,
  maskEmail,
} from "@/modules/admin/application/admin-masking";
import type {
  AdminAuditLogListInput,
  AdminAuditLogResponse,
  AdminSensitiveRepository,
  AdminSensitiveTargetType,
  SensitiveRawDataResponse,
  ViewSensitiveRawDataInput,
} from "@/modules/admin/application/ports/admin-sensitive.repository";
import {
  AuditLogNotFoundError,
  DecryptionFailedError,
  SensitiveFieldNotAllowedError,
  SensitiveTargetNotFoundError,
} from "@/modules/admin/domain/admin.errors";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type RawFieldSource =
  | {
      readonly kind: "plain";
      readonly name: string;
      readonly value: string | null;
    }
  | {
      readonly kind: "encrypted";
      readonly name: string;
      readonly ciphertext: string;
      readonly keyVersion: string;
    };

type LoadedRawTarget = {
  readonly ownerUserId: string;
  readonly fields: readonly RawFieldSource[];
};

type TransactionClient = Prisma.TransactionClient;

const allowedFieldsByTarget: Record<
  AdminSensitiveTargetType,
  readonly string[]
> = {
  COMPANY: ["memo"],
  CONTACT: ["phone", "email", "memo"],
  PRODUCT: ["unitPrice", "memo"],
  DEAL: ["amount", "memo"],
  MEETING_NOTE: ["rawText", "details", "nextPlan", "requiredAction"],
  PERSONAL_MEMO: ["content"],
};

export class PrismaAdminSensitiveRepository
  implements AdminSensitiveRepository
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionPort: EncryptionPort
  ) {}

  async viewRawData(
    input: ViewSensitiveRawDataInput
  ): Promise<SensitiveRawDataResponse> {
    assertAllowedFields(input.targetType, input.fields);

    const result = await this.prismaService.$transaction(async (tx) => {
      const loadedTarget = await this.loadRawTarget(tx, input);
      const auditLog = await tx.auditLog.create({
        data: {
          actorUserId: input.actorUserId,
          action: AuditAction.ADMIN_SENSITIVE_RAW_VIEW,
          targetType: input.targetType,
          targetId: input.targetId,
          targetUserId: loadedTarget.ownerUserId,
          reason: input.reason,
          metadata: createAuditMetadata(input),
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      return {
        auditLog,
        fields: loadedTarget.fields,
      };
    });

    return {
      targetType: input.targetType,
      targetId: input.targetId,
      fields: await this.resolveRawFields(result.fields),
      auditLogId: result.auditLog.id,
      viewedAt: result.auditLog.createdAt.toISOString(),
    };
  }

  async listAuditLogs(input: AdminAuditLogListInput) {
    const where = createAuditLogWhere(input);
    const [rows, totalCount] = await Promise.all([
      this.prismaService.auditLog.findMany({
        where,
        select: auditLogSelect,
        orderBy: { createdAt: "desc" },
        skip: skip(input),
        take: input.pageSize,
      }),
      this.prismaService.auditLog.count({ where }),
    ]);

    return {
      items: rows.map(toAuditLogResponse),
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
      hasNext: input.page * input.pageSize < totalCount,
    };
  }

  async getAuditLog(auditLogId: string) {
    const row = await this.prismaService.auditLog.findUnique({
      where: { id: auditLogId },
      select: auditLogSelect,
    });

    if (!row) {
      throw new AuditLogNotFoundError();
    }

    return toAuditLogResponse(row);
  }

  private async loadRawTarget(
    tx: TransactionClient,
    input: ViewSensitiveRawDataInput
  ): Promise<LoadedRawTarget> {
    if (input.targetType === "COMPANY") {
      return this.loadCompanyRawTarget(tx, input.targetId, input.fields);
    }

    if (input.targetType === "CONTACT") {
      return this.loadContactRawTarget(tx, input.targetId, input.fields);
    }

    if (input.targetType === "PRODUCT") {
      return this.loadProductRawTarget(tx, input.targetId, input.fields);
    }

    if (input.targetType === "DEAL") {
      return this.loadDealRawTarget(tx, input.targetId, input.fields);
    }

    if (input.targetType === "MEETING_NOTE") {
      return this.loadMeetingNoteRawTarget(tx, input.targetId, input.fields);
    }

    return this.loadPersonalMemoRawTarget(tx, input.targetId, input.fields);
  }

  private async loadCompanyRawTarget(
    tx: TransactionClient,
    targetId: string,
    fields: readonly string[]
  ): Promise<LoadedRawTarget> {
    const company = await tx.company.findUnique({
      where: { id: targetId },
      select: { id: true, userId: true },
    });

    if (!company) {
      throw new SensitiveTargetNotFoundError();
    }

    return {
      ownerUserId: company.userId,
      fields: await this.mapMemoOnlyFields(
        tx,
        company.userId,
        PersonalMemoTargetType.COMPANY,
        company.id,
        fields
      ),
    };
  }

  private async loadContactRawTarget(
    tx: TransactionClient,
    targetId: string,
    fields: readonly string[]
  ): Promise<LoadedRawTarget> {
    const contact = await tx.contact.findUnique({
      where: { id: targetId },
      select: { id: true, userId: true, phone: true, email: true },
    });

    if (!contact) {
      throw new SensitiveTargetNotFoundError();
    }

    return {
      ownerUserId: contact.userId,
      fields: await this.mapRequestedFields(fields, {
        phone: { kind: "plain", name: "phone", value: contact.phone },
        email: { kind: "plain", name: "email", value: contact.email },
        memo: await this.getLatestMemoSource(
          tx,
          contact.userId,
          PersonalMemoTargetType.CONTACT,
          contact.id
        ),
      }),
    };
  }

  private async loadProductRawTarget(
    tx: TransactionClient,
    targetId: string,
    fields: readonly string[]
  ): Promise<LoadedRawTarget> {
    const product = await tx.product.findUnique({
      where: { id: targetId },
      select: { id: true, userId: true, unitPrice: true },
    });

    if (!product) {
      throw new SensitiveTargetNotFoundError();
    }

    return {
      ownerUserId: product.userId,
      fields: await this.mapRequestedFields(fields, {
        unitPrice: {
          kind: "plain",
          name: "unitPrice",
          value: product.unitPrice?.toString() ?? null,
        },
        memo: await this.getLatestMemoSource(
          tx,
          product.userId,
          PersonalMemoTargetType.PRODUCT,
          product.id
        ),
      }),
    };
  }

  private async loadDealRawTarget(
    tx: TransactionClient,
    targetId: string,
    fields: readonly string[]
  ): Promise<LoadedRawTarget> {
    const deal = await tx.deal.findUnique({
      where: { id: targetId },
      select: { id: true, userId: true, amount: true },
    });

    if (!deal) {
      throw new SensitiveTargetNotFoundError();
    }

    return {
      ownerUserId: deal.userId,
      fields: await this.mapRequestedFields(fields, {
        amount: {
          kind: "plain",
          name: "amount",
          value: deal.amount.toString(),
        },
        memo: await this.getLatestMemoSource(
          tx,
          deal.userId,
          PersonalMemoTargetType.DEAL,
          deal.id
        ),
      }),
    };
  }

  private async loadMeetingNoteRawTarget(
    tx: TransactionClient,
    targetId: string,
    fields: readonly string[]
  ): Promise<LoadedRawTarget> {
    const meetingNote = await tx.meetingNote.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        userId: true,
        rawTextCiphertext: true,
        rawTextKeyVersion: true,
        details: true,
        nextPlan: true,
        requiredAction: true,
      },
    });

    if (!meetingNote) {
      throw new SensitiveTargetNotFoundError();
    }

    return {
      ownerUserId: meetingNote.userId,
      fields: await this.mapRequestedFields(fields, {
        rawText: {
          kind: "encrypted",
          name: "rawText",
          ciphertext: meetingNote.rawTextCiphertext,
          keyVersion: meetingNote.rawTextKeyVersion,
        },
        details: {
          kind: "plain",
          name: "details",
          value: meetingNote.details,
        },
        nextPlan: {
          kind: "plain",
          name: "nextPlan",
          value: meetingNote.nextPlan,
        },
        requiredAction: {
          kind: "plain",
          name: "requiredAction",
          value: meetingNote.requiredAction,
        },
      }),
    };
  }

  private async loadPersonalMemoRawTarget(
    tx: TransactionClient,
    targetId: string,
    fields: readonly string[]
  ): Promise<LoadedRawTarget> {
    const memo = await tx.personalMemo.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        userId: true,
        contentCiphertext: true,
        contentKeyVersion: true,
      },
    });

    if (!memo) {
      throw new SensitiveTargetNotFoundError();
    }

    return {
      ownerUserId: memo.userId,
      fields: await this.mapRequestedFields(fields, {
        content: {
          kind: "encrypted",
          name: "content",
          ciphertext: memo.contentCiphertext,
          keyVersion: memo.contentKeyVersion,
        },
      }),
    };
  }

  private async mapMemoOnlyFields(
    tx: TransactionClient,
    userId: string,
    targetType: PersonalMemoTargetType,
    targetId: string,
    fields: readonly string[]
  ) {
    return this.mapRequestedFields(fields, {
      memo: await this.getLatestMemoSource(tx, userId, targetType, targetId),
    });
  }

  private async getLatestMemoSource(
    tx: TransactionClient,
    userId: string,
    targetType: PersonalMemoTargetType,
    targetId: string
  ): Promise<RawFieldSource> {
    const memo = await tx.personalMemo.findFirst({
      where: {
        userId,
        targetType,
        targetId,
        deletedAt: null,
      },
      select: {
        contentCiphertext: true,
        contentKeyVersion: true,
      },
      orderBy: { memoDate: "desc" },
    });

    if (!memo) {
      return { kind: "plain", name: "memo", value: null };
    }

    return {
      kind: "encrypted",
      name: "memo",
      ciphertext: memo.contentCiphertext,
      keyVersion: memo.contentKeyVersion,
    };
  }

  private async mapRequestedFields(
    fields: readonly string[],
    sources: Record<string, RawFieldSource>
  ) {
    return fields.map((field) => sources[field]);
  }

  private async resolveRawFields(fields: readonly RawFieldSource[]) {
    return Promise.all(
      fields.map(async (field) => {
        if (field.kind === "plain") {
          return { name: field.name, value: field.value };
        }

        try {
          return {
            name: field.name,
            value: await this.encryptionPort.decryptText({
              ciphertext: field.ciphertext,
              keyVersion: field.keyVersion,
            }),
          };
        } catch {
          throw new DecryptionFailedError();
        }
      })
    );
  }
}

const auditLogSelect = {
  id: true,
  actorUserId: true,
  targetUserId: true,
  action: true,
  targetType: true,
  targetId: true,
  reason: true,
  metadata: true,
  createdAt: true,
  actorUser: {
    select: {
      displayName: true,
      email: true,
    },
  },
} satisfies Prisma.AuditLogSelect;

type AuditLogRow = Prisma.AuditLogGetPayload<{
  select: typeof auditLogSelect;
}>;

function assertAllowedFields(
  targetType: AdminSensitiveTargetType,
  fields: readonly string[]
) {
  const allowedFields = allowedFieldsByTarget[targetType];

  for (const field of fields) {
    if (!allowedFields.includes(field)) {
      throw new SensitiveFieldNotAllowedError();
    }
  }
}

function createAuditMetadata(input: ViewSensitiveRawDataInput) {
  return {
    fields: [...input.fields],
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  } satisfies Prisma.InputJsonObject;
}

function createAuditLogWhere(
  input: AdminAuditLogListInput
): Prisma.AuditLogWhereInput {
  return {
    ...(input.actorUserId ? { actorUserId: input.actorUserId } : {}),
    ...(input.targetUserId ? { targetUserId: input.targetUserId } : {}),
    ...(input.action ? { action: input.action } : {}),
    ...(input.targetType ? { targetType: input.targetType } : {}),
    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from ? { gte: input.from } : {}),
            ...(input.to ? { lte: input.to } : {}),
          },
        }
      : {}),
  };
}

function toAuditLogResponse(row: AuditLogRow): AdminAuditLogResponse {
  const metadata = readAuditMetadata(row.metadata);

  return {
    id: row.id,
    actorUserId: row.actorUserId,
    actorUserName: row.actorUser
      ? row.actorUser.displayName ?? maskEmail(row.actorUser.email)
      : null,
    targetUserId: row.targetUserId,
    action: row.action,
    targetType: row.targetType,
    targetId: row.targetId,
    reasonSummary: summarizeReason(row.reason),
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    createdAt: row.createdAt.toISOString(),
  };
}

function readAuditMetadata(value: Prisma.JsonValue) {
  if (!isJsonObject(value)) {
    return { ipAddress: null, userAgent: null };
  }

  return {
    ipAddress:
      typeof value.ipAddress === "string" && value.ipAddress.length > 0
        ? value.ipAddress
        : null,
    userAgent:
      typeof value.userAgent === "string" && value.userAgent.length > 0
        ? value.userAgent
        : null,
  };
}

function isJsonObject(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function skip(input: { readonly page: number; readonly pageSize: number }) {
  return (input.page - 1) * input.pageSize;
}
