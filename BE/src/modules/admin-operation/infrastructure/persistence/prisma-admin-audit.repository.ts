import {
  AdminAuditAction,
  AdminAuditResult,
  Prisma,
  type AdminTargetType,
} from "@prisma/client";
import {
  type AdminAuditRepository,
  type CreateSensitiveAccessLogInput,
  type FindAdminSensitiveRawDataInput,
  type ListAdminAuditLogsInput,
} from "@/modules/admin-operation/application/ports/admin-audit.repository";
import type {
  AdminAuditLogPageRecord,
  AdminAuditLogRecord,
  AdminSensitiveAccessRecord,
  AdminSensitiveRawDataRecord,
} from "@/modules/admin-operation/application/ports/admin-audit-read-model.types";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type AdminAuditPrismaClient = PrismaService | Prisma.TransactionClient;

type AdminAuditLogRow = {
  readonly id: string;
  readonly adminUserId: string;
  readonly adminUser: { readonly email: string | null };
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly reason: string | null;
  readonly requestId: string | null;
  readonly createdAt: Date;
};

// 역할 : PrismaAdminAuditRepository Admin 감사 저장소 계약을 Prisma 기반 영속성으로 구현합니다.
export class PrismaAdminAuditRepository implements AdminAuditRepository {
  // 기능 : Prisma client와 선택적 transaction runner를 주입받습니다.
  constructor(
    private readonly client: AdminAuditPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : Admin 감사 저장소 작업을 Prisma transaction 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: AdminAuditRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAdminAuditRepository(transaction, null));
    });
  }

  // 기능 : Admin 감사 로그를 최신순 cursor 페이지로 조회합니다.
  async listAuditLogs(
    input: ListAdminAuditLogsInput
  ): Promise<AdminAuditLogPageRecord> {
    const rows = await this.client.adminAuditLog.findMany({
      where: this.createAuditLogWhere(input),
      select: {
        id: true,
        adminUserId: true,
        adminUser: { select: { email: true } },
        targetUserId: true,
        targetType: true,
        targetId: true,
        action: true,
        result: true,
        reason: true,
        requestId: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });
    const pageRows = rows.slice(0, input.limit);
    const lastRow = pageRows[pageRows.length - 1] ?? null;

    return {
      items: pageRows.map((row) => this.toAuditLogRecord(row)),
      nextCursor: rows.length > input.limit && lastRow ? lastRow.id : null,
    };
  }

  // 기능 : 사용자 연락처 계열 민감 원문에서 허용된 필드만 조회합니다.
  async findUserContact(
    input: FindAdminSensitiveRawDataInput
  ): Promise<AdminSensitiveRawDataRecord | null> {
    const user = await this.client.user.findFirst({
      where: {
        id: input.targetId,
        deletedAt: null,
        AND: [{ id: input.targetUserId }],
      },
      select: {
        email: true,
        displayName: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      data: {
        email: user.email,
        displayName: user.displayName,
      },
      returnedFieldNames: ["email", "displayName"],
    };
  }

  // 기능 : 회의록 원문에서 provider raw나 transcript를 제외한 허용 본문 필드만 조회합니다.
  async findMeetingNoteBody(
    input: FindAdminSensitiveRawDataInput
  ): Promise<AdminSensitiveRawDataRecord | null> {
    const meetingNote = await this.client.meetingNote.findFirst({
      where: {
        id: input.targetId,
        userId: input.targetUserId,
        deletedAt: null,
      },
      select: {
        title: true,
        details: true,
        nextPlan: true,
        requiredAction: true,
      },
    });

    if (!meetingNote) {
      return null;
    }

    return {
      data: {
        title: meetingNote.title,
        details: meetingNote.details,
        nextPlan: meetingNote.nextPlan,
        requiredAction: meetingNote.requiredAction,
      },
      returnedFieldNames: ["title", "details", "nextPlan", "requiredAction"],
    };
  }

  // 기능 : 민감 원문 조회 감사 로그와 상세 로그를 같은 client transaction으로 생성합니다.
  async createSensitiveAccessLog(
    input: CreateSensitiveAccessLogInput
  ): Promise<AdminSensitiveAccessRecord> {
    const returnedFieldNames = [...input.returnedFieldNames];
    const metadataJson: Prisma.InputJsonObject = {
      fieldSet: input.fieldSet,
      returnedFieldNames,
    };
    const auditLog = await this.client.adminAuditLog.create({
      data: {
        adminUserId: input.adminUserId,
        targetUserId: input.targetUserId,
        targetType: input.targetType,
        targetId: input.targetId,
        action: AdminAuditAction.ADMIN_SENSITIVE_RAW_ACCESS,
        result: AdminAuditResult.SUCCESS,
        reason: input.reason,
        requestId: input.requestId,
        ipHash: input.ipHash,
        userAgentHash: input.userAgentHash,
        metadataJson,
      },
      select: { id: true },
    });
    const accessLog = await this.client.adminSensitiveAccessLog.create({
      data: {
        auditLogId: auditLog.id,
        adminUserId: input.adminUserId,
        targetUserId: input.targetUserId,
        targetType: input.targetType,
        targetId: input.targetId,
        fieldSet: input.fieldSet,
        reason: input.reason,
        returnedFieldNames,
      },
      select: {
        id: true,
        targetUserId: true,
        targetType: true,
        targetId: true,
        fieldSet: true,
        returnedFieldNames: true,
        createdAt: true,
      },
    });

    return {
      id: accessLog.id,
      targetUserId: accessLog.targetUserId,
      targetType: accessLog.targetType,
      targetId: accessLog.targetId,
      fieldSet: accessLog.fieldSet,
      returnedFieldNames: accessLog.returnedFieldNames,
      createdAt: accessLog.createdAt,
    };
  }

  // 기능 : 감사 로그 조회 조건을 Prisma where 조건으로 변환합니다.
  private createAuditLogWhere(
    input: ListAdminAuditLogsInput
  ): Prisma.AdminAuditLogWhereInput {
    return {
      ...(input.adminUserId ? { adminUserId: input.adminUserId } : {}),
      ...(input.targetUserId ? { targetUserId: input.targetUserId } : {}),
      ...(input.action ? { action: input.action } : {}),
      ...(input.result ? { result: input.result } : {}),
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

  // 기능 : Prisma 감사 로그 row를 application record로 변환합니다.
  private toAuditLogRecord(row: AdminAuditLogRow): AdminAuditLogRecord {
    return {
      id: row.id,
      adminUserId: row.adminUserId,
      adminEmail: row.adminUser.email,
      targetUserId: row.targetUserId,
      targetType: row.targetType,
      targetId: row.targetId,
      action: row.action,
      result: row.result,
      reason: row.reason,
      requestId: row.requestId,
      createdAt: row.createdAt,
    };
  }
}
