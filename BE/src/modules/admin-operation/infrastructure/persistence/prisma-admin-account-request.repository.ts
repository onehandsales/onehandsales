import { Prisma } from "@prisma/client";
import type {
  AdminAccountRequestRepository,
  CreateAdminAccountRequestAuditLogInput,
  ListAdminAccountDeletionRequestsInput,
  ListAdminDataExportRequestsInput,
} from "@/modules/admin-operation/application/ports/admin-account-request.repository";
import type {
  AdminAccountDeletionRequestQueueItemRecord,
  AdminAccountDeletionRequestsPageRecord,
  AdminDataExportRequestQueueItemRecord,
  AdminDataExportRequestsPageRecord,
} from "@/modules/admin-operation/application/ports/admin-account-request-read-model.types";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { maskEmail } from "../../presentation/http/admin-redaction.mapper";

type AdminAccountRequestPrismaClient =
  | PrismaService
  | Prisma.TransactionClient;

const accountDeletionQueueSelect = {
  id: true,
  userId: true,
  status: true,
  reasonCode: true,
  requestedAt: true,
  scheduledDeletionAt: true,
  user: {
    select: {
      email: true,
    },
  },
} satisfies Prisma.AccountDeletionRequestSelect;

const dataExportQueueSelect = {
  id: true,
  userId: true,
  status: true,
  includeSensitive: true,
  format: true,
  requestedAt: true,
  expiresAt: true,
  user: {
    select: {
      email: true,
    },
  },
} satisfies Prisma.UserDataExportRequestSelect;

type AccountDeletionQueueRow = Prisma.AccountDeletionRequestGetPayload<{
  select: typeof accountDeletionQueueSelect;
}>;
type DataExportQueueRow = Prisma.UserDataExportRequestGetPayload<{
  select: typeof dataExportQueueSelect;
}>;

// 역할 : PrismaAdminAccountRequestRepository 계정 데이터 요청 Admin queue read model을 Prisma 조회로 구현합니다.
export class PrismaAdminAccountRequestRepository
  implements AdminAccountRequestRepository
{
  // 기능 : Prisma client와 선택적 transaction runner를 주입받습니다.
  constructor(
    private readonly client: AdminAccountRequestPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : Admin 계정 데이터 요청 저장소 작업을 Prisma transaction 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: AdminAccountRequestRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAdminAccountRequestRepository(transaction, null));
    });
  }

  // 기능 : Admin 계정 삭제 요청 queue를 cursor 기반으로 조회합니다.
  async listAccountDeletionRequests(
    input: ListAdminAccountDeletionRequestsInput
  ): Promise<AdminAccountDeletionRequestsPageRecord> {
    const rows = await this.client.accountDeletionRequest.findMany({
      where: {
        ...(input.status ? { status: input.status } : {}),
      },
      select: accountDeletionQueueSelect,
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });
    const pageRows = rows.slice(0, input.limit);
    const lastRow = pageRows[pageRows.length - 1] ?? null;

    return {
      items: pageRows.map((row) => this.toAccountDeletionQueueItem(row)),
      nextCursor: rows.length > input.limit && lastRow ? lastRow.id : null,
    };
  }

  // 기능 : Admin 데이터 export 요청 queue를 cursor 기반으로 조회합니다.
  async listDataExportRequests(
    input: ListAdminDataExportRequestsInput
  ): Promise<AdminDataExportRequestsPageRecord> {
    const rows = await this.client.userDataExportRequest.findMany({
      where: {
        ...(input.status ? { status: input.status } : {}),
      },
      select: dataExportQueueSelect,
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });
    const pageRows = rows.slice(0, input.limit);
    const lastRow = pageRows[pageRows.length - 1] ?? null;

    return {
      items: pageRows.map((row) => this.toDataExportQueueItem(row)),
      nextCursor: rows.length > input.limit && lastRow ? lastRow.id : null,
    };
  }

  // 기능 : Admin 계정 데이터 요청 queue 조회 감사 로그를 append-only로 생성합니다.
  async createAuditLog(
    input: CreateAdminAccountRequestAuditLogInput
  ): Promise<void> {
    const metadataJson = input.metadataJson as Prisma.InputJsonObject;

    await this.client.adminAuditLog.create({
      data: {
        adminUserId: input.adminUserId,
        targetUserId: input.targetUserId,
        targetType: input.targetType,
        targetId: input.targetId,
        action: input.action,
        result: input.result,
        requestId: input.requestId,
        metadataJson,
      },
      select: { id: true },
    });
  }

  // 기능 : Prisma 계정 삭제 요청 row를 masked queue item으로 변환합니다.
  private toAccountDeletionQueueItem(
    row: AccountDeletionQueueRow
  ): AdminAccountDeletionRequestQueueItemRecord {
    return {
      id: row.id,
      userId: row.userId,
      userEmailMasked: maskEmail(row.user.email),
      status: row.status,
      requestedAt: row.requestedAt,
      scheduledDeletionAt: row.scheduledDeletionAt,
      reasonCode: row.reasonCode,
    };
  }

  // 기능 : Prisma 데이터 export 요청 row를 masked queue item으로 변환합니다.
  private toDataExportQueueItem(
    row: DataExportQueueRow
  ): AdminDataExportRequestQueueItemRecord {
    return {
      id: row.id,
      userId: row.userId,
      userEmailMasked: maskEmail(row.user.email),
      status: row.status,
      includeSensitive: row.includeSensitive,
      format: row.format,
      requestedAt: row.requestedAt,
      expiresAt: row.expiresAt,
    };
  }
}
