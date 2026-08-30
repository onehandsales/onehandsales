import {
  AdminOperationCheckRunStatus,
  Prisma,
} from "@prisma/client";
import type {
  AdminSystemOperationRepository,
  CreateAdminOperationCheckRunInput,
  CreateAdminSystemOperationAuditLogInput,
} from "@/modules/admin-operation/application/ports/admin-system-operation.repository";
import type {
  AdminOperationCheckEnvironment,
  AdminOperationCheckItemsRecord,
  AdminOperationCheckRunRecord,
} from "@/modules/admin-operation/application/ports/admin-system-operation-read-model.types";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type AdminSystemOperationPrismaClient =
  | PrismaService
  | Prisma.TransactionClient;

const operationCheckRunSelect = {
  id: true,
  adminUserId: true,
  environment: true,
  status: true,
  itemsJson: true,
  notes: true,
  checkedAt: true,
} satisfies Prisma.AdminOperationCheckRunSelect;

type OperationCheckRunRow = Prisma.AdminOperationCheckRunGetPayload<{
  select: typeof operationCheckRunSelect;
}>;

// 역할 : PrismaAdminSystemOperationRepository 운영 gate 점검 기록을 Prisma로 구현합니다.
export class PrismaAdminSystemOperationRepository
  implements AdminSystemOperationRepository
{
  // 기능 : Prisma client와 선택적 transaction runner를 주입받습니다.
  constructor(
    private readonly client: AdminSystemOperationPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : Admin 운영 gate 저장소 작업을 Prisma transaction 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: AdminSystemOperationRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAdminSystemOperationRepository(transaction, null));
    });
  }

  // 기능 : 최신 운영 gate 점검 기록을 조회합니다.
  async findLatestOperationCheckRun(): Promise<AdminOperationCheckRunRecord | null> {
    const run = await this.client.adminOperationCheckRun.findFirst({
      select: operationCheckRunSelect,
      orderBy: [{ checkedAt: "desc" }, { id: "desc" }],
    });

    return run ? this.toOperationCheckRunRecord(run) : null;
  }

  // 기능 : 운영 gate 점검 기록 row를 생성합니다.
  async createOperationCheckRun(
    input: CreateAdminOperationCheckRunInput
  ): Promise<AdminOperationCheckRunRecord> {
    const run = await this.client.adminOperationCheckRun.create({
      data: {
        adminUserId: input.adminUserId,
        environment: input.environment,
        status: input.status,
        itemsJson: input.items as unknown as Prisma.InputJsonObject,
        notes: input.notes,
        checkedAt: input.checkedAt,
      },
      select: operationCheckRunSelect,
    });

    return this.toOperationCheckRunRecord(run);
  }

  // 기능 : Admin 운영 gate 감사 로그를 append-only로 생성합니다.
  async createAuditLog(
    input: CreateAdminSystemOperationAuditLogInput
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

  // 기능 : Prisma 운영 gate row를 application record로 변환합니다.
  private toOperationCheckRunRecord(
    row: OperationCheckRunRow
  ): AdminOperationCheckRunRecord {
    return {
      id: row.id,
      environment: this.toEnvironment(row.environment),
      status: row.status,
      checkedAt: row.checkedAt,
      checkedByAdminUserId: row.adminUserId,
      items: this.toItemsRecord(row.itemsJson),
      notes: row.notes,
    };
  }

  // 기능 : DB 문자열 environment를 현재 지원하는 운영 gate environment로 변환합니다.
  private toEnvironment(value: string): AdminOperationCheckEnvironment {
    switch (value) {
      case "local":
      case "qa":
      case "staging":
      case "production":
        return value;
      default:
        return "local";
    }
  }

  // 기능 : DB JSON 항목 상태를 안전한 운영 gate items record로 변환합니다.
  private toItemsRecord(value: Prisma.JsonValue): AdminOperationCheckItemsRecord {
    const source =
      typeof value === "object" && value !== null && !Array.isArray(value)
        ? value
        : {};

    return {
      prismaValidate: this.toStatus(source["prismaValidate"]),
      prismaGenerate: this.toStatus(source["prismaGenerate"]),
      migrationStatus: this.toStatus(source["migrationStatus"]),
      seedNotRunOnSharedDb: this.toStatus(source["seedNotRunOnSharedDb"]),
      backupVerified: this.toStatus(source["backupVerified"]),
      restoreDryRun: this.toStatus(source["restoreDryRun"]),
      providerSmoke: this.toStatus(source["providerSmoke"]),
    };
  }

  // 기능 : DB JSON status 값을 운영 gate status enum으로 정규화합니다.
  private toStatus(value: unknown): AdminOperationCheckRunStatus {
    switch (value) {
      case AdminOperationCheckRunStatus.PASS:
      case AdminOperationCheckRunStatus.WARN:
      case AdminOperationCheckRunStatus.FAIL:
        return value;
      default:
        return AdminOperationCheckRunStatus.FAIL;
    }
  }
}
